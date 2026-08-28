import { Request, Response } from "express";
import { prisma } from "../config/prisma.js";

// GET /api/products/flash-deals
export const getFlashDeals = async (req: Request, res: Response) => {
    try {
        const products = await prisma.product.findMany({
            where: { stock: { gt: 0 } },
            orderBy: { originalPrice: "desc" },
            take: 8,
        });

        const productsWithDiscount = products.map((p) => {
            const discount = p.originalPrice && p.price ? Math.round(((p.originalPrice - p.price) / p.originalPrice) * 100) : 0;
            return { ...p, discount };
        });

        res.json({ products: productsWithDiscount });
    } catch (error: any) {
        res.status(500).json({ message: "Failed to fetch flash deals", error: error.message });
    }
};

// GET /api/products
export const getProducts = async (req: Request, res: Response) => {
    try {
        const { category, search, minPrice, maxPrice, sort, page = "1", limit = "12" } = req.query;

        const pageNum = Math.max(1, parseInt(page as string) || 1);
        const limitNum = Math.min(100, Math.max(1, parseInt(limit as string) || 12));
        const skip = (pageNum - 1) * limitNum;

        const where: Record<string, any> = {};
        if (category && category !== "all") {
            where.category = category as string;
        }
        if (search) {
            where.name = { contains: search as string, mode: "insensitive" };
        }
        if (minPrice || maxPrice) {
            where.price = {};
            if (minPrice) where.price.gte = Math.max(0, parseFloat(minPrice as string) || 0);
            if (maxPrice) where.price.lte = Math.max(0, parseFloat(maxPrice as string) || 999999);
        }

        const orderBy: Record<string, any> = {};
        if (sort === "price_asc") orderBy.price = "asc";
        else if (sort === "price_desc") orderBy.price = "desc";
        else if (sort === "rating") orderBy.rating = "desc";
        else if (sort === "name") orderBy.name = "asc";
        else orderBy.createdAt = "desc";

        const [products, total] = await Promise.all([
            prisma.product.findMany({ where, orderBy, skip, take: limitNum }),
            prisma.product.count({ where }),
        ]);

        const productsWithDiscount = products.map((p) => {
            const discount = p.originalPrice && p.price ? Math.round(((p.originalPrice - p.price) / p.originalPrice) * 100) : 0;
            return { ...p, discount };
        });

        res.json({
            products: productsWithDiscount,
            total,
            pages: Math.ceil(total / limitNum),
            currentPage: pageNum,
        });
    } catch (error: any) {
        res.status(500).json({ message: "Failed to fetch products", error: error.message });
    }
};

// GET /api/products/:id
export const getProduct = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        if (!id || typeof id !== "string") {
            return res.status(400).json({ message: "Invalid product ID" });
        }

        const product = await prisma.product.findUnique({ where: { id } });

        if (!product) {
            return res.status(404).json({ message: "Product not found" });
        }

        const discount = product.originalPrice && product.price ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100) : 0;

        res.json({ product: { ...product, discount } });
    } catch (error: any) {
        res.status(500).json({ message: "Failed to fetch product", error: error.message });
    }
};

// POST /api/products
export const createProduct = async (req: Request, res: Response) => {
    try {
        const { name, price, originalPrice, image, category, unit, stock, description, isOrganic } = req.body;

        // ✅ Input Validation
        if (!name || typeof name !== "string" || name.trim().length === 0) {
            return res.status(400).json({ message: "Product name is required and must be a string" });
        }
        if (typeof price !== "number" || price < 0) {
            return res.status(400).json({ message: "Price must be a positive number" });
        }
        if (typeof stock !== "number" || stock < 0) {
            return res.status(400).json({ message: "Stock must be a positive number" });
        }
        if (!["kg", "lb", "piece", "liter", "ml", "box"].includes(unit)) {
            return res.status(400).json({ message: "Invalid unit" });
        }

        const product = await prisma.product.create({
            data: {
                name: name.trim(),
                price: Math.round(price * 100) / 100,
                originalPrice: originalPrice ? Math.round(originalPrice * 100) / 100 : price,
                image: image || "",
                category: category || "other",
                unit,
                stock: Math.floor(stock),
                description: description || "",
                isOrganic: isOrganic === true,
            },
        });

        res.status(201).json({ product });
    } catch (error: any) {
        res.status(500).json({ message: "Failed to create product", error: error.message });
    }
};

// PUT /api/products/:id
export const updateProduct = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { name, price, originalPrice, image, category, unit, stock, description, isOrganic } = req.body;

        if (!id || typeof id !== "string") {
            return res.status(400).json({ message: "Invalid product ID" });
        }

        // ✅ Input Validation
        const updateData: Record<string, any> = {};
        if (name !== undefined) {
            if (typeof name !== "string" || name.trim().length === 0) {
                return res.status(400).json({ message: "Product name must be a non-empty string" });
            }
            updateData.name = name.trim();
        }
        if (price !== undefined) {
            if (typeof price !== "number" || price < 0) {
                return res.status(400).json({ message: "Price must be a positive number" });
            }
            updateData.price = Math.round(price * 100) / 100;
        }
        if (originalPrice !== undefined) {
            updateData.originalPrice = Math.round(originalPrice * 100) / 100;
        }
        if (stock !== undefined) {
            if (typeof stock !== "number" || stock < 0) {
                return res.status(400).json({ message: "Stock must be a positive number" });
            }
            updateData.stock = Math.floor(stock);
        }
        if (unit !== undefined) {
            if (!["kg", "lb", "piece", "liter", "ml", "box"].includes(unit)) {
                return res.status(400).json({ message: "Invalid unit" });
            }
            updateData.unit = unit;
        }
        if (image !== undefined) updateData.image = image;
        if (category !== undefined) updateData.category = category;
        if (description !== undefined) updateData.description = description;
        if (isOrganic !== undefined) updateData.isOrganic = isOrganic === true;

        const product = await prisma.product.update({
            where: { id },
            data: updateData,
        });

        res.json({ product });
    } catch (error: any) {
        if (error.code === "P2025") {
            return res.status(404).json({ message: "Product not found" });
        }
        res.status(500).json({ message: "Failed to update product", error: error.message });
    }
};

// DELETE /api/products/:id
export const deleteProduct = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        if (!id || typeof id !== "string") {
            return res.status(400).json({ message: "Invalid product ID" });
        }

        await prisma.product.update({
            where: { id },
            data: { stock: 0 },
        });

        res.json({ message: "Product deleted successfully" });
    } catch (error: any) {
        if (error.code === "P2025") {
            return res.status(404).json({ message: "Product not found" });
        }
        res.status(500).json({ message: "Failed to delete product", error: error.message });
    }
};
