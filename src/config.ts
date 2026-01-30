import { homedir } from "node:os";
import { join } from "node:path";
import { readFileSync, writeFileSync, existsSync, mkdirSync } from "node:fs";

export interface QodoConfig {
  apiKey?: string;
  defaultModel?: string;
  defaultAgent?: string;
  theme?: "light" | "dark";
  autoUpdate?: boolean;
  debug?: boolean;
  permissions?: "r" | "rw" | "rwx" | "-";
  tools?: string[];
  noBuiltin?: boolean;
  plan?: boolean;
  act?: boolean;
}

const CONFIG_DIR = join(homedir(), ".config", "opencode");
const CONFIG_FILE = join(CONFIG_DIR, "qodo.json");

const DEFAULT_CONFIG: QodoConfig = {
  defaultModel: "claude-4.5-sonnet",
  theme: "dark",
  autoUpdate: true,
  debug: false,
  permissions: "rw",
  noBuiltin: false,
  plan: false,
  act: true,
};

export function loadConfig(): QodoConfig {
  try {
    if (!existsSync(CONFIG_FILE)) {
      return DEFAULT_CONFIG;
    }
    const content = readFileSync(CONFIG_FILE, "utf-8");
    const parsed = JSON.parse(content);
    return { ...DEFAULT_CONFIG, ...parsed };
  } catch (error) {
    console.error("Error loading Qodo config:", error);
    return DEFAULT_CONFIG;
  }
}

export function saveConfig(config: QodoConfig): void {
  try {
    if (!existsSync(CONFIG_DIR)) {
      mkdirSync(CONFIG_DIR, { recursive: true });
    }
    writeFileSync(CONFIG_FILE, JSON.stringify(config, null, 2), "utf-8");
  } catch (error) {
    console.error("Error saving Qodo config:", error);
  }
}

export function getConfigPath(): string {
  return CONFIG_FILE;
}
