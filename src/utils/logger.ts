import { loadConfig } from "../config.js";

type LogLevel = "debug" | "info" | "warn" | "error";

export class Logger {
  private service: string;
  private debugEnabled: boolean;

  constructor(service: string) {
    this.service = service;
    const config = loadConfig();
    this.debugEnabled = config.debug || false;
  }

  private log(level: LogLevel, message: string, extra?: Record<string, unknown>): void {
    const timestamp = new Date().toISOString();
    const logEntry = {
      timestamp,
      service: this.service,
      level,
      message,
      ...(extra && { extra }),
    };

    if (level === "error") {
      console.error(JSON.stringify(logEntry));
    } else if (level === "warn") {
      console.warn(JSON.stringify(logEntry));
    } else if (this.debugEnabled || level === "info") {
      console.log(JSON.stringify(logEntry));
    }
  }

  debug(message: string, extra?: Record<string, unknown>): void {
    if (this.debugEnabled) {
      this.log("debug", message, extra);
    }
  }

  info(message: string, extra?: Record<string, unknown>): void {
    this.log("info", message, extra);
  }

  warn(message: string, extra?: Record<string, unknown>): void {
    this.log("warn", message, extra);
  }

  error(message: string, extra?: Record<string, unknown>): void {
    this.log("error", message, extra);
  }
}

export function createLogger(service: string): Logger {
  return new Logger(service);
}
