import { loadConfig, type QodoConfig } from "./config.js";
import { QodoCli } from "./utils/cli.js";
import { createLogger } from "./utils/logger.js";
import { isAuthenticated } from "./auth.js";
import { createQodoChatTool } from "./tools/qodo-chat.js";
import { createQodoGenTool } from "./tools/qodo-gen.js";
import { createQodoReviewTool } from "./tools/qodo-review.js";
import { createQodoAgentsTool, createQodoChainTool } from "./tools/qodo-agents.js";
import { createQodoModelsTool, createQodoStatusTool, createQodoConfigTool } from "./tools/qodo-info.js";
import { QODO_MODELS } from "./models.js";

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

export interface AutocompleteItem {
  label: string;
  value?: string;
  description?: string;
}

export interface AutocompleteProvider {
  trigger: string;
  fuzzy?: boolean;
}

export interface PluginHooks {
  tool?: Record<string, any>;
  "session.created"?: (session: { id: string }) => Promise<void>;
  "session.error"?: (error: { message: string }) => Promise<void>;
  "tool.execute.before"?: (input: { tool: string }, output: any) => Promise<void>;
  "tool.execute.after"?: (input: { tool: string }, output: any) => Promise<void>;
  "command.execute.before"?: (input: { command: string; sessionID: string; arguments: string }, output: { parts: Array<{ type: string; text: string }> }) => Promise<void>;
  "experimental.session.compacting"?: (input: any, output: { context: string[] }) => Promise<void>;
  "autocomplete.provide"?: (input: { trigger: string; query: string }, output: { provider?: AutocompleteProvider; items: AutocompleteItem[] }) => Promise<void>;
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

    "command.execute.before": async (input: { command: string; sessionID: string; arguments: string }, output: { parts: Array<{ type: string; text: string }> }) => {
      // Check if this is a Qodo command prefix
      const isQodoCommand = input.command === "/qodo" || input.arguments.startsWith("qodo:");
      
      if (!isQodoCommand) {
        return; // Let default handler process it
      }
      
      log.info("Intercepting Qodo command", { 
        sessionID: input.sessionID,
        command: input.command,
        arguments: input.arguments 
      });
      
      try {
        const { cli } = await initializeQodoLazy();
        
        // Check if CLI is installed
        if (!cli.isInstalled()) {
          log.error("Qodo CLI is not installed or not in PATH");
          await client.app.toast({
            message: "Qodo CLI not found. Please install it: npm install -g qodo",
            type: "error",
          });
          output.parts.push({
            type: "text",
            text: "❌ Error: Qodo CLI not installed. Run: npm install -g qodo"
          });
          return;
        }
        
        // Check authentication
        if (!isAuthenticated()) {
          log.warn("Qodo CLI is not authenticated");
          await client.app.toast({
            message: "Qodo not authenticated. Run 'qodo login' to authenticate.",
            type: "warning",
          });
        }
        
        // Extract the actual prompt (remove the prefix)
        const prompt = input.arguments.startsWith("qodo:") 
          ? input.arguments.replace(/^qodo:\s*/, "")
          : input.arguments;
        
        if (!prompt.trim()) {
          output.parts.push({
            type: "text",
            text: "⚠️ Please provide a prompt after /qodo or qodo:. Example: `/qodo Create a React component`"
          });
          return;
        }
        
        // Execute Qodo command
        const result = await cli.runCommand("qodo-gen", prompt);
        
        log.info("Qodo command executed successfully");
        
        // Return result
        output.parts.push({
          type: "text",
          text: result
        });
        
      } catch (error: any) {
        log.error("Qodo command execution failed", { error: error.message });
        output.parts.push({
          type: "text",
          text: `❌ Error executing Qodo command: ${error.message}`
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

    "autocomplete.provide": async (input: { trigger: string; query: string }, output: { provider?: AutocompleteProvider; items: AutocompleteItem[] }) => {
      // Handle slash commands (trigger is "/")
      if (input.trigger === "/") {
        log.debug("Providing slash command autocomplete", { trigger: input.trigger, query: input.query });

        const qodoCommands: AutocompleteItem[] = [
          {
            label: "/qodo",
            value: "/qodo ",
            description: "Execute Qodo command - use Qodo's AI for code generation, review, and more"
          },
          {
            label: "/qodo:chat",
            value: "/qodo:chat ",
            description: "Start an interactive chat session with Qodo"
          },
          {
            label: "/qodo:review",
            value: "/qodo:review ",
            description: "Run Qodo code review on git changes"
          },
          {
            label: "/qodo:agent",
            value: "/qodo:agent ",
            description: "Execute a specialized Qodo agent (e.g., qodo-cover for tests)"
          },
          {
            label: "/qodo:models",
            value: "/qodo:models",
            description: "List all available Qodo models"
          },
          {
            label: "/qodo:status",
            value: "/qodo:status",
            description: "Check Qodo CLI status and authentication"
          }
        ];

        const filteredCommands = input.query 
          ? qodoCommands.filter(cmd => 
              cmd.label.toLowerCase().includes(input.query.toLowerCase()) ||
              (cmd.description && cmd.description.toLowerCase().includes(input.query.toLowerCase()))
            )
          : qodoCommands;

        output.items.push(...filteredCommands);
        output.provider = { trigger: "/", fuzzy: true };
        log.debug("Slash command autocomplete provided", { count: filteredCommands.length });
        return;
      }

      // Handle agent selection (trigger is "@" or agent selection context)
      if (input.trigger === "@" || input.trigger === "agent") {
        log.debug("Providing agent autocomplete", { trigger: input.trigger, query: input.query });

        const qodoAgents: AutocompleteItem[] = [
          {
            label: "@qodo",
            value: "@qodo ",
            description: "Qodo Agent - AI-powered code generation, review, and specialized agents"
          },
          {
            label: "@qodo:cover",
            value: "@qodo:cover ",
            description: "Qodo Cover Agent - Generate comprehensive test coverage"
          },
          {
            label: "@qodo:review",
            value: "@qodo:review ",
            description: "Qodo Review Agent - Code review and quality analysis"
          }
        ];

        const filteredAgents = input.query 
          ? qodoAgents.filter(agent => 
              agent.label.toLowerCase().includes(input.query.toLowerCase()) ||
              (agent.description && agent.description.toLowerCase().includes(input.query.toLowerCase()))
            )
          : qodoAgents;

        output.items.push(...filteredAgents);
        output.provider = { trigger: input.trigger, fuzzy: true };
        log.debug("Agent autocomplete provided", { count: filteredAgents.length });
      }
    },
  };
};

export default QodoPlugin;
