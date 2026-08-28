import { Request, Response } from "express";
import { prisma } from "../config/prisma.js";
import bcrypt from "bcrypt";

// ✅ Validation Helper
const validateEmail = (email: string): boolean => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
};

const validatePhone = (phone: string): boolean => {
  return /^[0-9]{10,}$/.test(phone.replace(/\D/g, ""));
};

// GET /api/admin/stats
export const getAdminStats = async (req: Request, res: Response) => {
  try {
    const [totalOrders, totalUsers, totalProducts, outOfStock, totalPartners, recentOrders] = await Promise.all([
      prisma.order.count({ where: { NOT: [{ paymentMethod: "card", isPaid: false }] } }),
      prisma.user.count(),
      prisma.product.count(),
      prisma.product.count({ where: { stock: 0 } }),
      prisma.deliveryPartner.count(),
      prisma.order.findMany({
        where: { NOT: [{ paymentMethod: "card", isPaid: false }] },
        orderBy: { createdAt: "desc" },
        take: 8,
        include: {
          user: { select: { id: true, name: true, email: true } },
          deliveryPartner: { select: { id: true, name: true, phone: true } },
        },
      }),
    ]);

    res.json({
      totalOrders,
      totalUsers,
      totalProducts,
      outOfStock,
      totalPartners,
      recentOrders,
    });
  } catch (error: any) {
    res.status(500).json({ message: "Failed to fetch admin stats", error: error.message });
  }
};

// GET /api/admin/delivery-partners
export const getDeliveryPartners = async (req: Request, res: Response) => {
  try {
    const { page = "1", limit = "10" } = req.query;

    const pageNum = Math.max(1, parseInt(page as string) || 1);
    const limitNum = Math.min(100, Math.max(1, parseInt(limit as string) || 10));
    const skip = (pageNum - 1) * limitNum;

    const [partners, total] = await Promise.all([
      prisma.deliveryPartner.findMany({
        orderBy: { createdAt: "desc" },
        skip,
        take: limitNum,
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          vehicleType: true,
          isActive: true,
          createdAt: true,
        },
      }),
      prisma.deliveryPartner.count(),
    ]);

    res.json({
      partners,
      total,
      pages: Math.ceil(total / limitNum),
      currentPage: pageNum,
    });
  } catch (error: any) {
    res.status(500).json({ message: "Failed to fetch delivery partners", error: error.message });
  }
};

// POST /api/admin/delivery-partners
export const createDeliveryPartner = async (req: Request, res: Response) => {
  try {
    const { name, email, password, phone, vehicleType } = req.body;

    // ✅ Input Validation
    if (!name || typeof name !== "string" || name.trim().length < 2) {
      return res.status(400).json({ message: "Name must be at least 2 characters" });
    }

    if (!email || !validateEmail(email)) {
      return res.status(400).json({ message: "Valid email is required" });
    }

    if (!password || typeof password !== "string" || password.length < 8) {
      return res.status(400).json({ message: "Password must be at least 8 characters" });
    }

    if (!phone || !validatePhone(phone)) {
      return res.status(400).json({ message: "Valid phone number is required (10+ digits)" });
    }

    if (!["bike", "scooter", "car"].includes(vehicleType)) {
      return res.status(400).json({ message: "Invalid vehicle type" });
    }

    // ✅ Check if email already exists
    const existingPartner = await prisma.deliveryPartner.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (existingPartner) {
      return res.status(400).json({ message: "Email already registered" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const partner = await prisma.deliveryPartner.create({
      data: {
        name: name.trim(),
        email: email.toLowerCase(),
        password: hashedPassword,
        phone,
        vehicleType,
        isActive: true,
      },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        vehicleType: true,
        isActive: true,
        createdAt: true,
      },
    });

    res.status(201).json({ partner, message: "Delivery partner created successfully" });
  } catch (error: any) {
    res.status(500).json({ message: "Failed to create delivery partner", error: error.message });
  }
};

// PUT /api/admin/delivery-partners/:id
export const updateDeliveryPartner = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name, phone, vehicleType, isActive } = req.body;

    // ✅ Validate ID
    if (!id || typeof id !== "string") {
      return res.status(400).json({ message: "Invalid partner ID" });
    }

    // ✅ Build update data with validation
    const updateData: Record<string, any> = {};

    if (name !== undefined) {
      if (typeof name !== "string" || name.trim().length < 2) {
        return res.status(400).json({ message: "Name must be at least 2 characters" });
      }
      updateData.name = name.trim();
    }

    if (phone !== undefined) {
      if (!validatePhone(phone)) {
        return res.status(400).json({ message: "Valid phone number is required" });
      }
      updateData.phone = phone;
    }

    if (vehicleType !== undefined) {
      if (!["bike", "scooter", "car"].includes(vehicleType)) {
        return res.status(400).json({ message: "Invalid vehicle type" });
      }
      updateData.vehicleType = vehicleType;
    }

    if (isActive !== undefined) {
      if (typeof isActive !== "boolean") {
        return res.status(400).json({ message: "isActive must be a boolean" });
      }
      updateData.isActive = isActive;
    }

    const partner = await prisma.deliveryPartner.update({
      where: { id },
      data: updateData,
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        vehicleType: true,
        isActive: true,
      },
    });

    res.json({ partner, message: "Delivery partner updated successfully" });
  } catch (error: any) {
    if (error.code === "P2025") {
      return res.status(404).json({ message: "Delivery partner not found" });
    }
    res.status(500).json({ message: "Failed to update delivery partner", error: error.message });
  }
};

// POST /api/admin/orders/:id/assign-delivery
export const assignDeliveryPartner = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { partnerId } = req.body;

    // ✅ Validate IDs
    if (!id || typeof id !== "string") {
      return res.status(400).json({ message: "Invalid order ID" });
    }

    if (!partnerId || typeof partnerId !== "string") {
      return res.status(400).json({ message: "Partner ID is required" });
    }

    // ✅ Check if order exists
    const order = await prisma.order.findUnique({
      where: { id },
    });

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    // ✅ Check if partner exists and is active
    const partner = await prisma.deliveryPartner.findUnique({
      where: { id: partnerId },
    });

    if (!partner) {
      return res.status(404).json({ message: "Delivery partner not found" });
    }

    if (!partner.isActive) {
      return res.status(400).json({ message: "Selected delivery partner is not active" });
    }

    // ✅ Update order with partner
    const updatedOrder = await prisma.order.update({
      where: { id },
      data: {
        deliveryPartnerId: partnerId,
        status: "Assigned",
        statusHistory: {
          push: {
            status: "Assigned",
            timestamp: new Date(),
            note: `Assigned to ${partner.name}`,
          },
        },
      },
      include: {
        deliveryPartner: {
          select: {
            id: true,
            name: true,
            phone: true,
            vehicleType: true,
          },
        },
      },
    });

    res.json({ order: updatedOrder, message: "Delivery partner assigned successfully" });
  } catch (error: any) {
    res.status(500).json({ message: "Failed to assign delivery partner", error: error.message });
  }
};

// GET /api/admin/orders
export const getAdminOrders = async (req: Request, res: Response) => {
  try {
    const { page = "1", limit = "10", status } = req.query;

    const pageNum = Math.max(1, parseInt(page as string) || 1);
    const limitNum = Math.min(100, Math.max(1, parseInt(limit as string) || 10));
    const skip = (pageNum - 1) * limitNum;

    const where: Record<string, any> = {};
    if (status && typeof status === "string") {
      where.status = status;
    }

    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip,
        take: limitNum,
        include: {
          user: { select: { id: true, name: true, email: true } },
          deliveryPartner: { select: { id: true, name: true } },
        },
      }),
      prisma.order.count({ where }),
    ]);

    res.json({
      orders,
      total,
      pages: Math.ceil(total / limitNum),
      currentPage: pageNum,
    });
  } catch (error: any) {
    res.status(500).json({ message: "Failed to fetch orders", error: error.message });
  }
};
