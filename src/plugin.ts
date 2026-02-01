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

// Lazy initialization state
let cliInstance: QodoCli | null = null;
let configInstance: ReturnType<typeof loadConfig> | null = null;
let initializationPromise: Promise<{ cli: QodoCli; config: ReturnType<typeof loadConfig> }> | null = null;

async function initializeQodoLazy(): Promise<{ cli: QodoCli; config: ReturnType<typeof loadConfig> }> {
  if (cliInstance && configInstance) {
    return { cli: cliInstance, config: configInstance };
  }

  if (initializationPromise) {
    return initializationPromise;
  }

  initializationPromise = (async () => {
    log.info("Lazy initializing Qodo CLI");
    
    const config = loadConfig();
    const cli = new QodoCli(config);
    
    cliInstance = cli;
    configInstance = config;
    
    log.info("Qodo CLI lazy initialized", {
      version: cli.getVersion(),
      authenticated: isAuthenticated(),
      defaultModel: config.defaultModel,
    });
    
    return { cli, config };
  })();

  return initializationPromise;
}

export const QodoPlugin: Plugin = async (context: PluginContext) => {
  const { client } = context;
  
  log.info("Registering Qodo plugin (lazy loading enabled)");

  // Start lazy initialization in background without blocking
  initializeQodoLazy().catch((error) => {
    log.error("Background Qodo initialization failed", { error: error.message });
  });

  // Create tools with lazy CLI access
  const createLazyTool = <T extends (...args: any[]) => any>(
    toolFactory: (cli: QodoCli) => ReturnType<T>
  ) => {
    const tool = toolFactory({} as QodoCli);
    const originalExecute = tool.execute;
    
    return {
      ...tool,
      execute: async (...args: any[]) => {
        const { cli } = await initializeQodoLazy();
        
        // Check if CLI is installed on first use
        if (!cli.isInstalled()) {
          log.error("Qodo CLI is not installed or not in PATH");
          await client.app.toast({
            message: "Qodo CLI not found. Please install it: npm install -g qodo",
            type: "error",
          });
          return "Error: Qodo CLI not installed";
        }

        // Check authentication on first use
        if (!isAuthenticated()) {
          log.warn("Qodo CLI is not authenticated");
          await client.app.toast({
            message: "Qodo not authenticated. Run 'qodo login' to authenticate.",
            type: "warning",
          });
        }
        
        // Re-create the tool with the actual CLI instance and execute
        const actualTool = toolFactory(cli);
        return actualTool.execute(...args);
      },
    };
  };

  return {
    tool: {
      qodo: createLazyTool(createQodoGenTool),
      qodo_chat: createLazyTool(createQodoChatTool),
      qodo_review: createLazyTool(createQodoReviewTool),
      qodo_agent: createLazyTool(createQodoAgentsTool),
      qodo_chain: createLazyTool(createQodoChainTool),
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
      const config = configInstance || loadConfig();
      output.context.push(`## Qodo Plugin Context
This session is using the Qodo plugin for OpenCode.
Available models: Claude 4.5, GPT 5.1/5.2, Gemini 2.5 Pro, Grok 4
Default model: ${config.defaultModel || "claude-4.5-sonnet"}
Authentication: ${isAuthenticated() ? "active" : "not authenticated"}`);
    },
  };
};

export default QodoPlugin;
