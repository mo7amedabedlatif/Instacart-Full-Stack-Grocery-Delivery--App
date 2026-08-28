import { NextFunction, Request, Response } from "express";
import { prisma } from "../config/prisma.js";
import { logger } from "../utils/logger.js";

const admin = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      logger.warn("Admin access attempt without user ID", { ip: req.ip });
      return res.status(401).json({ message: "Unauthorized" });
    }

    const user = await prisma.user.findUnique({ where: { id: userId } });

    if (!user) {
      logger.warn("Admin access attempt with non-existent user", {
        userId,
        ip: req.ip,
      });
      return res.status(404).json({ message: "User not found" });
    }

    const adminEmails = process.env.ADMIN_EMAILS
      ? process.env.ADMIN_EMAILS.split(",").map((e) => e.trim().toLowerCase())
      : [];

    if (adminEmails.includes(user.email.toLowerCase())) {
      if (req.user) req.user.isAdmin = true;
      logger.info("Admin access granted", {
        userId,
        email: user.email,
        path: req.path,
      });
      next();
    } else {
      logger.warn("Non-admin user attempted admin access", {
        userId,
        email: user.email,
        ip: req.ip,
        path: req.path,
      });
      res.status(403).json({ message: "Admin access required" });
    }
  } catch (error) {
    logger.error("Admin verification failed", error, { userId: req.user?.id });
    res.status(500).json({ message: "Admin verification failed" });
  }
};

export default admin;
