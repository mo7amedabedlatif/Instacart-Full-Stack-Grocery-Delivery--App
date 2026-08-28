import "dotenv/config";
import express, { NextFunction, Request, Response } from "express";
import cors from "cors";
import authRouter from "./routes/authRoutes.js";
import productRouter from "./routes/productRoutes.js";
import uploadRouter from "./routes/uploadRoutes.js";
import orderRouter from "./routes/orderRoutes.js";
import { serve } from "inngest/express";
import { inngest, functions } from "./inngest/index.js";
import addressRouter from "./routes/addressRoutes.js";
import adminRouter from "./routes/adminRoutes.js";
import deliveryPartnerRouter from "./routes/deliveryPartnerRoutes.js";
import { stripeWebhook } from "./controllers/webhooks.js";

const app = express();

// ✅ CORS Configuration - Production Safe
const allowedOrigins = (process.env.ALLOWED_ORIGINS || "http://localhost:5173").split(",");

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// ✅ Security Headers
app.use((req: Request, res: Response, next: NextFunction) => {
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("X-Frame-Options", "DENY");
  res.setHeader("X-XSS-Protection", "1; mode=block");
  res.setHeader("Strict-Transport-Security", "max-age=31536000; includeSubDomains");
  res.setHeader("Content-Security-Policy", "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline';");
  next();
});

// ✅ Stripe webhook with raw body (before JSON parsing)
app.post(
  "/api/stripe",
  express.raw({ type: "application/json" }),
  stripeWebhook,
);

// ✅ Request Size Limits
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ limit: "10mb", extended: true }));

// ✅ Rate Limiting Middleware (Basic - consider using rate-limit npm package for production)
interface RateLimitStore {
  [key: string]: { count: number; resetTime: number };
}

const rateLimitStore: RateLimitStore = {};
const RATE_LIMIT_WINDOW = 15 * 60 * 1000; // 15 minutes
const RATE_LIMIT_MAX = 100; // 100 requests per window

const rateLimiter = (req: Request, res: Response, next: NextFunction) => {
  const ip = req.ip || "unknown";
  const now = Date.now();

  if (!rateLimitStore[ip]) {
    rateLimitStore[ip] = { count: 0, resetTime: now + RATE_LIMIT_WINDOW };
  }

  const record = rateLimitStore[ip];

  // Reset if window expired
  if (now > record.resetTime) {
    record.count = 0;
    record.resetTime = now + RATE_LIMIT_WINDOW;
  }

  record.count++;

  res.setHeader("X-RateLimit-Limit", RATE_LIMIT_MAX);
  res.setHeader("X-RateLimit-Remaining", Math.max(0, RATE_LIMIT_MAX - record.count));

  if (record.count > RATE_LIMIT_MAX) {
    return res.status(429).json({ message: "Too many requests, please try again later" });
  }

  next();
};

app.use(rateLimiter);

const port = process.env.PORT || 5000;

// ✅ Root endpoint
app.get("/", (req: Request, res: Response) => {
  res.json({ message: "Server is Live!", status: "OK" });
});

// ✅ Routes
app.use("/api/auth", authRouter);
app.use("/api/products", productRouter);
app.use("/api/upload", uploadRouter);
app.use("/api/orders", orderRouter);
app.use("/api/inngest", serve({ client: inngest, functions }));
app.use("/api/addresses", addressRouter);
app.use("/api/admin", adminRouter);
app.use("/api/delivery", deliveryPartnerRouter);

// ✅ 404 Handler
app.use((req: Request, res: Response) => {
  res.status(404).json({ message: "Route not found" });
});

// ✅ Error Handling Middleware
app.use((error: any, req: Request, res: Response, next: NextFunction) => {
  const statusCode = error.statusCode || 500;
  const message = error.message || "Internal Server Error";

  // Log error in development
  if (process.env.NODE_ENV !== "production") {
    console.error(`[${new Date().toISOString()}] Error:`, error);
  }

  // Don't expose sensitive errors in production
  const response =
    process.env.NODE_ENV === "production"
      ? { message: "An error occurred" }
      : { message, error: error.stack };

  res.status(statusCode).json(response);
});

// ✅ Graceful Shutdown
process.on("SIGTERM", () => {
  console.log("SIGTERM received, shutting down gracefully");
  process.exit(0);
});

app.listen(port, () => {
  console.log(`[${new Date().toISOString()}] Server is running at http://localhost:${port}`);
  console.log(`Environment: ${process.env.NODE_ENV || "development"}`);
});
