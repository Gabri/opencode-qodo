import { type Plugin, tool } from "@opencode-ai/plugin";
import { z } from "zod";

export const QodoPlugin: Plugin = async (context) => {
  const { $ } = context;

  return {
    tool: {
      qodo: tool({
        description: "Interact with the Qodo CLI to generate code, tests, or docs. Requires 'qodo' to be installed in PATH.",
        args: {
          prompt: z.string().describe("The instruction or question for Qodo"),
          model: z.string().optional().describe("Specific Qodo model/agent to use (e.g., qodo-cover, qodo-gen)"),
          file: z.string().optional().describe("Path to a file to use as context")
        },
        execute: async ({ prompt, model, file }) => {
          try {
            if (model) {
              if (file) {
                 return await $`cat ${file} | qodo --model ${model} ${prompt}`.text();
              } else {
                 return await $`qodo --model ${model} ${prompt}`.text();
              }
            } else {
              if (file) {
                 return await $`cat ${file} | qodo ${prompt}`.text();
              } else {
                 return await $`qodo ${prompt}`.text();
              }
            }
          } catch (error: any) {
            return `Error executing Qodo: ${error.message || error}`;
          }
        },
      }),
      
      qodo_version: tool({
        description: "Check the installed Qodo CLI version",
        args: {},
        execute: async () => {
             try {
                return await $`qodo --version`.text();
             } catch (e) {
                return "Qodo CLI not found or error checking version.";
             }
        }
      })
    },
  };
};
