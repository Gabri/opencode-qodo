import { tool } from "@opencode-ai/plugin/tool";
import type { QodoCli } from "../utils/cli.js";
import { createLogger } from "../utils/logger.js";

const log = createLogger("qodo-review");

export function createQodoReviewTool(cli: QodoCli): ReturnType<typeof tool> {
  return tool({
    description: "Perform AI-powered code review on git changes. Analyzes staged and unstaged changes, groups them into logical change groups, and provides detailed feedback and suggestions.",
    args: {
      scope: tool.schema
        .enum(["staged", "unstaged", "all"])
        .default("all")
        .describe("Which changes to review: staged (only staged), unstaged (only unstaged), or all (both)"),
      focus: tool.schema
        .string()
        .optional()
        .describe("Specific focus areas (e.g., 'security', 'performance', 'readability')"),
      model: tool.schema
        .string()
        .optional()
        .describe("Specific model to use for the review"),
    },
    execute: async ({ scope, focus, model }: { scope: "staged" | "unstaged" | "all"; focus?: string; model?: string }) => {
      try {
        log.info("Starting Qodo code review", { scope, focus, model });

        let prompt = "Review the following code changes";
        
        if (scope === "staged") {
          prompt += " (staged changes only)";
        } else if (scope === "unstaged") {
          prompt += " (unstaged changes only)";
        }

        if (focus) {
          prompt += ` with focus on: ${focus}`;
        }

        prompt += ". Provide detailed feedback including:\n";
        prompt += "1. Summary of changes\n";
        prompt += "2. Code quality assessment\n";
        prompt += "3. Potential issues or bugs\n";
        prompt += "4. Suggestions for improvement\n";
        prompt += "5. Best practices recommendations";

        const result = await cli.selfReview({
          model,
        });

        log.info("Qodo code review completed");
        return result;
      } catch (error: any) {
        log.error("Qodo code review failed", { error: error.message });
        return `Error performing code review: ${error.message}`;
      }
    },
  });
}
