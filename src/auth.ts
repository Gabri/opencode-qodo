import { execSync } from "node:child_process";
import { loadConfig, saveConfig } from "./config.js";

export interface QodoApiKey {
  name: string;
  created: string;
}

export function getApiKey(): string | undefined {
  const config = loadConfig();
  return config.apiKey;
}

export function setApiKey(apiKey: string): void {
  const config = loadConfig();
  config.apiKey = apiKey;
  saveConfig(config);
}

export function listApiKeys(): QodoApiKey[] {
  try {
    const output = execSync("qodo key list", { encoding: "utf-8" });
    const keys: QodoApiKey[] = [];
    const lines = output.split("\n");
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      if (line.includes("Name:")) {
        const nameMatch = line.match(/Name:\s*(.+)/);
        const createdMatch = lines[i + 1]?.match(/Created:\s*(.+)/);
        
        if (nameMatch && createdMatch) {
          keys.push({
            name: nameMatch[1].trim(),
            created: createdMatch[1].trim(),
          });
        }
      }
    }
    
    return keys;
  } catch (error) {
    return [];
  }
}

export function createApiKey(name: string): boolean {
  try {
    execSync(`qodo key create "${name}"`, { encoding: "utf-8" });
    return true;
  } catch (error) {
    return false;
  }
}

export function revokeApiKey(name: string): boolean {
  try {
    execSync(`qodo key revoke "${name}"`, { encoding: "utf-8" });
    return true;
  } catch (error) {
    return false;
  }
}

export function isAuthenticated(): boolean {
  try {
    execSync("qodo key list", { encoding: "utf-8", stdio: "pipe" });
    return true;
  } catch {
    return false;
  }
}
