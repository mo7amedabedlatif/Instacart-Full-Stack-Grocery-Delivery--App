import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { logger } from "../utils/logger.js";

const auth = (req: Request, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      logger.warn("Missing or invalid authorization header", {
        ip: req.ip,
        path: req.path,
      });
      return res.status(401).json({ message: "No token provided, authorization denied" });
    }

    const token = authHeader.split(" ")[1];

    // ✅ Validate token format
    if (!token || token.length === 0) {
      logger.warn("Empty token provided", { ip: req.ip });
      return res.status(401).json({ message: "Invalid token format" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as { id: string };

    // ✅ Validate decoded user ID
    if (!decoded.id || typeof decoded.id !== "string") {
      logger.warn("Invalid token payload", { ip: req.ip });
      return res.status(401).json({ message: "Invalid token payload" });
    }

    req.user = { id: decoded.id };
    next();
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      logger.warn("JWT verification failed", { ip: req.ip, error: error.message });
      return res.status(401).json({ message: "Token is not valid" });
    }

    if (error instanceof jwt.TokenExpiredError) {
      logger.warn("Token expired", { ip: req.ip });
      return res.status(401).json({ message: "Token has expired" });
    }

    logger.error("Auth middleware error", error, { ip: req.ip });
    return res.status(500).json({ message: "Authentication failed" });
  }
};

export default auth;
