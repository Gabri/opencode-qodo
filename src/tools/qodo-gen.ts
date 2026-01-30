import { z } from "zod";
import type { QodoCli } from "../utils/cli.js";
import { createLogger } from "../utils/logger.js";

const log = createLogger("qodo-gen");

export function createQodoGenTool(cli: QodoCli) {
  return {
    description: "Generate code, tests, documentation, or any other content using Qodo's AI. Supports various generation tasks like creating functions, classes, tests, or documentation.",
    args: {
      prompt: z.string().describe("The generation prompt or instruction (e.g., 'Generate unit tests for this function', 'Create a React component for...')"),
      model: z.string().optional().describe("Specific model to use (e.g., 'claude-4.5-sonnet', 'gpt-5.1-codex')"),
      file: z.string().optional().describe("Path to a file to use as context for generation"),
      outputFile: z.string().optional().describe("Path where the generated content should be saved"),
      language: z.string().optional().describe("Target programming language (e.g., 'typescript', 'python', 'rust')"),
      framework: z.string().optional().describe("Framework or library context (e.g., 'react', 'django', 'fastapi')"),
    },
    execute: async ({ prompt, model, file, outputFile, language, framework }: { 
      prompt: string; 
      model?: string; 
      file?: string; 
      outputFile?: string; 
      language?: string; 
      framework?: string;
    }) => {
      try {
        log.info("Qodo generation started", { model, hasFile: !!file, language, framework });

        let fullPrompt = prompt;
        
        if (language) {
          fullPrompt = `[Language: ${language}] ${fullPrompt}`;
        }
        
        if (framework) {
          fullPrompt = `[Framework: ${framework}] ${fullPrompt}`;
        }

        if (file) {
          fullPrompt = `Using the following file as context:\n\nFile: ${file}\n\n${fullPrompt}`;
        }

        if (outputFile) {
          fullPrompt += `\n\nPlease save the output to: ${outputFile}`;
        }

        const result = await cli.execute(fullPrompt, {
          model,
          act: true,
        });

        log.info("Qodo generation completed", { outputLength: result.length });
        return result;
      } catch (error: any) {
        log.error("Qodo generation failed", { error: error.message });
        return `Error generating with Qodo: ${error.message}`;
      }
    },
  };
}
