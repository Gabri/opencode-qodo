import { z } from "zod";
import type { QodoCli } from "../utils/cli.js";
import { createLogger } from "../utils/logger.js";

const log = createLogger("qodo-agents");

export function createQodoAgentsTool(cli: QodoCli) {
  return {
    description: "Execute Qodo agents for specialized tasks. Agents are pre-configured AI workflows for specific purposes like test generation, documentation, refactoring, etc.",
    args: {
      agent: z.string().describe("Agent name to execute (e.g., 'qodo-cover' for test coverage, 'qodo-gen' for code generation)"),
      prompt: z.string().describe("The task or instruction for the agent"),
      model: z.string().optional().describe("Specific model to use"),
      agentFile: z.string().optional().describe("Path to custom agent configuration file"),
      keyValuePairs: z.record(z.string()).optional().describe("Key-value pairs to pass to the agent (--set key=value)"),
    },
    execute: async ({ agent, prompt, model, agentFile, keyValuePairs }: {
      agent: string;
      prompt: string;
      model?: string;
      agentFile?: string;
      keyValuePairs?: Record<string, string>;
    }) => {
      try {
        log.info("Executing Qodo agent", { agent, model, hasAgentFile: !!agentFile });

        const result = await cli.runCommand(agent, prompt, {
          model,
          agentFile,
          set: keyValuePairs,
        });

        log.info("Qodo agent execution completed", { agent });
        return result;
      } catch (error: any) {
        log.error("Qodo agent execution failed", { agent, error: error.message });
        return `Error executing Qodo agent '${agent}': ${error.message}`;
      }
    },
  };
}

export function createQodoChainTool(cli: QodoCli) {
  return {
    description: "Chain multiple Qodo agents together to perform complex workflows. Agents are executed sequentially, with output from one feeding into the next.",
    args: {
      agents: z.array(z.string()).describe("Array of agent names to chain (e.g., ['analyze', 'refactor', 'test'])"),
      initialPrompt: z.string().describe("Initial input for the first agent in the chain"),
      model: z.string().optional().describe("Specific model to use for all agents in the chain"),
    },
    execute: async ({ agents, initialPrompt, model }: {
      agents: string[];
      initialPrompt: string;
      model?: string;
    }) => {
      try {
        log.info("Executing Qodo agent chain", { agents: agents.join(" > "), model });

        if (agents.length < 2) {
          return "Error: Chain requires at least 2 agents";
        }

        const result = await cli.chain([...agents, initialPrompt], {
          model,
        });

        log.info("Qodo agent chain completed");
        return result;
      } catch (error: any) {
        log.error("Qodo agent chain failed", { error: error.message });
        return `Error executing agent chain: ${error.message}`;
      }
    },
  };
}
