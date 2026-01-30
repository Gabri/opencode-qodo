import { z } from "zod";
import type { QodoCli } from "../utils/cli.js";
import { createLogger } from "../utils/logger.js";

const log = createLogger("qodo-chat");

export function createQodoChatTool(cli: QodoCli) {
  return {
    description: "Start an interactive chat session with Qodo AI. Useful for ongoing conversations, brainstorming, or iterative development.",
    args: {
      initialMessage: z.string().optional().describe("Optional initial message to start the chat"),
      model: z.string().optional().describe("Specific model to use for the chat session"),
      context: z.string().optional().describe("Additional context or background information"),
    },
    execute: async ({ initialMessage, model, context }: { initialMessage?: string; model?: string; context?: string }) => {
      try {
        log.info("Starting Qodo chat session", { model, hasContext: !!context });

        let prompt = "";
        if (context) {
          prompt += `Context: ${context}\n\n`;
        }
        if (initialMessage) {
          prompt += initialMessage;
        }

        const result = await cli.chat({
          model,
        });

        log.info("Qodo chat completed");
        return result;
      } catch (error: any) {
        log.error("Qodo chat failed", { error: error.message });
        return `Error starting Qodo chat: ${error.message}`;
      }
    },
  };
}
