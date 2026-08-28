import fs from "fs";
import path from "path";

interface LogEntry {
  timestamp: string;
  level: "INFO" | "ERROR" | "WARN" | "DEBUG";
  message: string;
  error?: string;
  stack?: string;
  [key: string]: any;
}

class Logger {
  private logDir: string;
  private isDevelopment: boolean;

  constructor() {
    this.isDevelopment = process.env.NODE_ENV !== "production";
    this.logDir = path.join(process.cwd(), "logs");

    // Create logs directory if it doesn't exist (production only)
    if (!this.isDevelopment) {
      if (!fs.existsSync(this.logDir)) {
        fs.mkdirSync(this.logDir, { recursive: true });
      }
    }
  }

  private formatLog(entry: LogEntry): string {
    return JSON.stringify(entry);
  }

  private writeToFile(level: string, entry: LogEntry): void {
    if (this.isDevelopment) return; // Don't write files in development

    const logFile = path.join(this.logDir, `${level.toLowerCase()}.log`);

    try {
      fs.appendFileSync(logFile, this.formatLog(entry) + "\n");
    } catch (err) {
      // Silent fail - don't crash if logging fails
    }
  }

  info(message: string, data?: Record<string, any>): void {
    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level: "INFO",
      message,
      ...data,
    };

    if (this.isDevelopment) {
      console.log(`[INFO] ${message}`, data || "");
    }

    this.writeToFile("info", entry);
  }

  warn(message: string, data?: Record<string, any>): void {
    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level: "WARN",
      message,
      ...data,
    };

    if (this.isDevelopment) {
      console.warn(`[WARN] ${message}`, data || "");
    }

    this.writeToFile("warn", entry);
  }

  error(message: string, error?: Error | any, data?: Record<string, any>): void {
    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level: "ERROR",
      message,
      error: error?.message || String(error),
      stack: error?.stack,
      ...data,
    };

    if (this.isDevelopment) {
      console.error(`[ERROR] ${message}`, error, data || "");
    }

    this.writeToFile("error", entry);
  }

  debug(message: string, data?: Record<string, any>): void {
    if (!this.isDevelopment) return;

    console.debug(`[DEBUG] ${message}`, data || "");
  }
}

export const logger = new Logger();
