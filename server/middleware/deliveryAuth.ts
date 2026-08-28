import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { prisma } from "../config/prisma.js";
import { logger } from "../utils/logger.js";

const deliveryAuth = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      logger.warn("Delivery auth: Missing authorization header", { ip: req.ip });
      return res.status(401).json({ message: "No token provided" });
    }

    const token = authHeader.split(" ")[1];

    if (!token) {
      logger.warn("Delivery auth: Empty token", { ip: req.ip });
      return res.status(401).json({ message: "Invalid token format" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as { id: string };

    if (!decoded.id) {
      logger.warn("Delivery auth: Invalid token payload", { ip: req.ip });
      return res.status(401).json({ message: "Invalid token" });
    }

    const partner = await prisma.deliveryPartner.findUnique({
      where: { id: decoded.id },
    });

    if (!partner) {
      logger.warn("Delivery auth: Partner not found", {
        partnerId: decoded.id,
        ip: req.ip,
      });
      return res.status(404).json({ message: "Partner not found" });
    }

    if (!partner.isActive) {
      logger.warn("Delivery auth: Inactive partner attempted access", {
        partnerId: decoded.id,
        ip: req.ip,
      });
      return res.status(403).json({ message: "Partner account is inactive" });
    }

    req.partner = partner;
    logger.debug("Delivery auth successful", { partnerId: decoded.id });
    next();
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      logger.warn("Delivery auth: Token expired", { ip: req.ip });
      return res.status(401).json({ message: "Token has expired" });
    }

    if (error instanceof jwt.JsonWebTokenError) {
      logger.warn("Delivery auth: Invalid token", { ip: req.ip });
      return res.status(401).json({ message: "Invalid token" });
    }

    logger.error("Delivery auth failed", error, { ip: req.ip });
    res.status(500).json({ message: "Authentication failed" });
  }
};

export default deliveryAuth;
