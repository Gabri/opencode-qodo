import { tool } from "@opencode-ai/plugin/tool";
import { QODO_MODELS } from "../models.js";
import { createLogger } from "../utils/logger.js";
import { isAuthenticated, listApiKeys } from "../auth.js";

const log = createLogger("qodo-info");

export function createQodoModelsTool(): ReturnType<typeof tool> {
  return tool({
    description: "List all available Qodo models with their capabilities, context windows, and supported features.",
    args: {
      provider: tool.schema
        .string()
        .optional()
        .describe("Filter by provider (e.g., 'anthropic', 'openai', 'google')"),
    },
    execute: async ({ provider }: { provider?: string }) => {
      try {
        log.info("Listing Qodo models", { provider });

        let models = QODO_MODELS;
        if (provider) {
          models = models.filter((m) => m.provider === provider.toLowerCase());
        }

        const formatted = models.map((model) => ({
          id: model.id,
          name: model.name,
          provider: model.provider,
          description: model.description,
          contextWindow: `${(model.contextWindow / 1000).toFixed(0)}k tokens`,
          outputLimit: `${(model.outputLimit / 1000).toFixed(0)}k tokens`,
          features: [
            model.supportsImages && "images",
            model.supportsPdf && "pdf",
            model.supportsThinking && "thinking",
          ].filter(Boolean),
          variants: model.variants ? Object.keys(model.variants) : ["default"],
        }));

        return JSON.stringify(formatted, null, 2);
      } catch (error: any) {
        log.error("Failed to list models", { error: error.message });
        return `Error listing models: ${error.message}`;
      }
    },
  });
}

export function createQodoStatusTool(): ReturnType<typeof tool> {
  return tool({
    description: "Check Qodo CLI status, version, authentication state, and available API keys.",
    args: {},
    execute: async () => {
      try {
        log.info("Checking Qodo status");

        const isAuth = isAuthenticated();
        const keys = listApiKeys();

        const status = {
          authenticated: isAuth,
          apiKeys: keys.map((k) => k.name),
          modelsAvailable: QODO_MODELS.length,
          providers: [...new Set(QODO_MODELS.map((m) => m.provider))],
        };

        return JSON.stringify(status, null, 2);
      } catch (error: any) {
        log.error("Failed to check status", { error: error.message });
        return `Error checking status: ${error.message}`;
      }
    },
  });
}

export function createQodoConfigTool(): ReturnType<typeof tool> {
  return tool({
    description: "View or update Qodo plugin configuration settings.",
    args: {
      action: tool.schema
        .enum(["view", "set"])
        .describe("Action to perform: view current config or set a value"),
      key: tool.schema
        .string()
        .optional()
        .describe("Configuration key to set (required for 'set' action)"),
      value: tool.schema
        .string()
        .optional()
        .describe("Value to set (required for 'set' action)"),
    },
    execute: async ({ action, key, value }: { action: "view" | "set"; key?: string; value?: string }) => {
      try {
        const { loadConfig, saveConfig } = await import("../config.js");
        
        if (action === "view") {
          const config = loadConfig();
          return JSON.stringify(config, null, 2);
        }

        if (action === "set" && key && value) {
          const config = loadConfig();
          
          // Handle boolean values
          if (value === "true") {
            (config as any)[key] = true;
          } else if (value === "false") {
            (config as any)[key] = false;
          } else {
            (config as any)[key] = value;
          }
          
          saveConfig(config);
          return `Configuration updated: ${key} = ${value}`;
        }

        return "Invalid action or missing parameters";
      } catch (error: any) {
        log.error("Config operation failed", { error: error.message });
        return `Error managing config: ${error.message}`;
      }
    },
  });
}
