import { z } from "zod";
import { loadConfig } from "./config.js";
import { QodoCli } from "./utils/cli.js";
import { createLogger } from "./utils/logger.js";
import { isAuthenticated } from "./auth.js";
import { createQodoChatTool } from "./tools/qodo-chat.js";
import { createQodoGenTool } from "./tools/qodo-gen.js";
import { createQodoReviewTool } from "./tools/qodo-review.js";
import { createQodoAgentsTool, createQodoChainTool } from "./tools/qodo-agents.js";
import { createQodoModelsTool, createQodoStatusTool, createQodoConfigTool } from "./tools/qodo-info.js";

const log = createLogger("qodo-plugin");

export interface PluginContext {
  project: {
    id: string;
    name: string;
    path: string;
  };
  directory: string;
  worktree: string;
  client: {
    app: {
      log: (data: { service: string; level: string; message: string; extra?: Record<string, unknown> }) => Promise<void>;
      toast: (data: { message: string; type: "info" | "warning" | "error" }) => Promise<void>;
    };
  };
  $: any;
}

export interface PluginHooks {
  tool?: Record<string, any>;
  "session.created"?: (session: { id: string }) => Promise<void>;
  "session.error"?: (error: { message: string }) => Promise<void>;
  "tool.execute.before"?: (input: { tool: string }, output: any) => Promise<void>;
  "tool.execute.after"?: (input: { tool: string }, output: any) => Promise<void>;
  "experimental.session.compacting"?: (input: any, output: { context: string[] }) => Promise<void>;
}

export type Plugin = (context: PluginContext) => Promise<PluginHooks>;

export const QodoPlugin: Plugin = async (context: PluginContext) => {
  const { client } = context;
  
  log.info("Initializing Qodo plugin");

  const config = loadConfig();
  const cli = new QodoCli(config);

  if (!cli.isInstalled()) {
    log.error("Qodo CLI is not installed or not in PATH");
    await client.app.toast({
      message: "Qodo CLI not found. Please install it: npm install -g qodo",
      type: "error",
    });
    return {};
  }

  if (!isAuthenticated()) {
    log.warn("Qodo CLI is not authenticated");
    await client.app.toast({
      message: "Qodo not authenticated. Run 'qodo login' to authenticate.",
      type: "warning",
    });
  }

  log.info("Qodo plugin initialized successfully", {
    version: cli.getVersion(),
    authenticated: isAuthenticated(),
    defaultModel: config.defaultModel,
  });

  return {
    tool: {
      qodo: createQodoGenTool(cli),
      qodo_chat: createQodoChatTool(cli),
      qodo_review: createQodoReviewTool(cli),
      qodo_agent: createQodoAgentsTool(cli),
      qodo_chain: createQodoChainTool(cli),
      qodo_models: createQodoModelsTool(),
      qodo_status: createQodoStatusTool(),
      qodo_config: createQodoConfigTool(),
    },

    "session.created": async (session: { id: string }) => {
      log.info("Session created", { sessionId: session.id });
    },

    "session.error": async (error: { message: string }) => {
      log.error("Session error", { error: error.message });
      
      if (error.message?.includes("rate limit")) {
        await client.app.toast({
          message: "Qodo rate limit hit. Retrying with backoff...",
          type: "warning",
        });
      }
    },

    "tool.execute.before": async (input: { tool: string }, output: any) => {
      log.debug("Tool execution starting", { tool: input.tool });
    },

    "tool.execute.after": async (input: { tool: string }, output: any) => {
      log.debug("Tool execution completed", { tool: input.tool });
    },

    "experimental.session.compacting": async (input: any, output: { context: string[] }) => {
      output.context.push(`## Qodo Plugin Context
This session is using the Qodo plugin for OpenCode.
Available models: Claude 4.5, GPT 5.1/5.2, Gemini 2.5 Pro, Grok 4
Default model: ${config.defaultModel || "claude-4.5-sonnet"}
Authentication: ${isAuthenticated() ? "active" : "not authenticated"}`);
    },
  };
};

export default QodoPlugin;
