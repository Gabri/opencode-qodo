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
    // Only log to stderr to avoid polluting OpenCode's UI
    // OpenCode captures stdout and shows it in the chat interface
    if (level === "error") {
      console.error(`[${this.service}] ${level.toUpperCase()}: ${message}`, extra || "");
    } else if (level === "warn") {
      console.error(`[${this.service}] ${level.toUpperCase()}: ${message}`, extra || "");
    } else if (this.debugEnabled) {
      // Only show debug/info logs when debug is explicitly enabled
      console.error(`[${this.service}] ${level.toUpperCase()}: ${message}`, extra || "");
    }
  }

  debug(message: string, extra?: Record<string, unknown>): void {
    if (this.debugEnabled) {
      this.log("debug", message, extra);
    }
  }

  info(message: string, extra?: Record<string, unknown>): void {
    // Info logs only shown when debug is enabled
    if (this.debugEnabled) {
      this.log("info", message, extra);
    }
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
