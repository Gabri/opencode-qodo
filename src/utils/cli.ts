import { execSync, spawn } from "node:child_process";
import type { QodoConfig } from "../config.js";
import { createLogger } from "./logger.js";

const log = createLogger("qodo-cli");

export interface QodoCliOptions {
  model?: string;
  agentFile?: string;
  mcpFile?: string;
  dir?: string[];
  tools?: string[];
  permissions?: string;
  plan?: boolean;
  act?: boolean;
  noBuiltin?: boolean;
  debug?: boolean;
  silent?: boolean;
  yes?: boolean;
  set?: Record<string, string>;
}

export class QodoCli {
  private config: QodoConfig;
  private cwd: string;

  constructor(config: QodoConfig, cwd: string) {
    this.config = config;
    this.cwd = cwd;
  }

  private buildArgs(options: QodoCliOptions): string[] {
    const args: string[] = [];

    if (options.model) {
      args.push("-m", options.model);
    } else if (this.config.defaultModel) {
      args.push("-m", this.config.defaultModel);
    }

    if (options.agentFile) {
      args.push("--agent-file", options.agentFile);
    }

    if (options.mcpFile) {
      args.push("--mcp-file", options.mcpFile);
    }

    if (options.dir && options.dir.length > 0) {
      options.dir.forEach((d) => args.push("--dir", d));
    }

    if (options.tools && options.tools.length > 0) {
      args.push("-t", options.tools.join(","));
    } else if (this.config.tools && this.config.tools.length > 0) {
      args.push("-t", this.config.tools.join(","));
    }

    if (options.permissions) {
      args.push("--permissions", options.permissions);
    } else if (this.config.permissions) {
      args.push("--permissions", this.config.permissions);
    }

    if (options.plan || this.config.plan) {
      args.push("--plan");
    }

    if (options.act || this.config.act) {
      args.push("--act");
    }

    if (options.noBuiltin || this.config.noBuiltin) {
      args.push("--no-builtin");
    }

    if (options.debug || this.config.debug) {
      args.push("-d");
    }

    if (options.silent) {
      args.push("-q");
    }

    if (options.yes) {
      args.push("-y");
    }

    if (options.set) {
      Object.entries(options.set).forEach(([key, value]) => {
        args.push("--set", `${key}=${value}`);
      });
    }

    return args;
  }

  async execute(prompt: string, options: QodoCliOptions = {}): Promise<string> {
    log.info("QodoCli.execute() called", { prompt: prompt.substring(0, 50), cwd: this.cwd });
    
    return new Promise((resolve, reject) => {
      const args = [...this.buildArgs(options), prompt];
      
      log.info("Spawning qodo process", { args, cwd: this.cwd });
      
      const child = spawn("qodo", args, {
        stdio: ["pipe", "pipe", "pipe"],
        cwd: this.cwd,
      });

      let stdout = "";
      let stderr = "";

      child.stdout?.on("data", (data) => {
        stdout += data.toString();
      });

      child.stderr?.on("data", (data) => {
        stderr += data.toString();
      });

      child.on("close", (code) => {
        log.info(`Qodo process exited with code ${code}`, { code, stderr: stderr.substring(0, 200) });
        if (code === 0) {
          resolve(stdout.trim());
        } else {
          log.error("Qodo CLI process failed", { code, stderr: stderr.substring(0, 500) });
          reject(new Error(`Qodo CLI exited with code ${code}: ${stderr || stdout}`));
        }
      });

      child.on("error", (error) => {
        log.error("Failed to spawn Qodo CLI", { error: error.message, cwd: this.cwd });
        reject(new Error(`Failed to execute Qodo CLI: ${error.message}`));
      });
    });
  }

  async runCommand(command: string, extraInstructions?: string, options: QodoCliOptions = {}): Promise<string> {
    log.info("QodoCli.runCommand() called", { command, cwd: this.cwd });
    const args = ["run", command];
    
    if (extraInstructions) {
      args.push(extraInstructions);
    }

    args.push(...this.buildArgs(options));

    return new Promise((resolve, reject) => {
      const child = spawn("qodo", args, {
        stdio: ["pipe", "pipe", "pipe"],
        cwd: this.cwd,
      });

      let stdout = "";
      let stderr = "";

      child.stdout?.on("data", (data) => {
        stdout += data.toString();
      });

      child.stderr?.on("data", (data) => {
        stderr += data.toString();
      });

      child.on("close", (code) => {
        if (code === 0) {
          resolve(stdout.trim());
        } else {
          reject(new Error(`Qodo CLI exited with code ${code}: ${stderr || stdout}`));
        }
      });

      child.on("error", (error) => {
        reject(new Error(`Failed to execute Qodo CLI: ${error.message}`));
      });
    });
  }

  async chat(options: QodoCliOptions = {}): Promise<string> {
    const args = ["chat", ...this.buildArgs(options)];

    return new Promise((resolve, reject) => {
      const child = spawn("qodo", args, {
        stdio: ["pipe", "pipe", "pipe"],
        cwd: this.cwd,
      });

      let stdout = "";
      let stderr = "";

      child.stdout?.on("data", (data) => {
        stdout += data.toString();
      });

      child.stderr?.on("data", (data) => {
        stderr += data.toString();
      });

      child.on("close", (code) => {
        if (code === 0) {
          resolve(stdout.trim());
        } else {
          reject(new Error(`Qodo CLI exited with code ${code}: ${stderr || stdout}`));
        }
      });

      child.on("error", (error) => {
        reject(new Error(`Failed to execute Qodo CLI: ${error.message}`));
      });
    });
  }

  async selfReview(options: QodoCliOptions = {}): Promise<string> {
    // Always use --ci flag to run in autonomous mode without web interface
    // This prevents the browser from opening and ensures the process completes
    const args = ["self-review", "--ci", ...this.buildArgs(options)];

    return new Promise((resolve, reject) => {
      const child = spawn("qodo", args, {
        stdio: ["pipe", "pipe", "pipe"],
        cwd: this.cwd,
      });

      let stdout = "";
      let stderr = "";

      child.stdout?.on("data", (data) => {
        stdout += data.toString();
      });

      child.stderr?.on("data", (data) => {
        stderr += data.toString();
      });

      child.on("close", (code) => {
        if (code === 0) {
          resolve(stdout.trim());
        } else {
          reject(new Error(`Qodo CLI exited with code ${code}: ${stderr || stdout}`));
        }
      });

      child.on("error", (error) => {
        reject(new Error(`Failed to execute Qodo CLI: ${error.message}`));
      });
    });
  }

  async chain(agents: string[], options: QodoCliOptions = {}): Promise<string> {
    const chainStr = agents.join(" > ");
    const args = ["chain", `"${chainStr}"`, ...this.buildArgs(options)];

    return new Promise((resolve, reject) => {
      const child = spawn("qodo", args, {
        stdio: ["pipe", "pipe", "pipe"],
        shell: true,
        cwd: this.cwd,
      });

      let stdout = "";
      let stderr = "";

      child.stdout?.on("data", (data) => {
        stdout += data.toString();
      });

      child.stderr?.on("data", (data) => {
        stderr += data.toString();
      });

      child.on("close", (code) => {
        if (code === 0) {
          resolve(stdout.trim());
        } else {
          reject(new Error(`Qodo CLI exited with code ${code}: ${stderr || stdout}`));
        }
      });

      child.on("error", (error) => {
        reject(new Error(`Failed to execute Qodo CLI: ${error.message}`));
      });
    });
  }

  getVersion(): string {
    try {
      return execSync("qodo --version", { encoding: "utf-8", cwd: this.cwd }).trim();
    } catch {
      return "unknown";
    }
  }

  isInstalled(): boolean {
    try {
      execSync("qodo --version", { encoding: "utf-8", stdio: "pipe", cwd: this.cwd });
      return true;
    } catch {
      return false;
    }
  }

  async getModels(): Promise<string[]> {
    try {
      const output = execSync("qodo models", { encoding: "utf-8", stdio: "pipe", cwd: this.cwd });
      // Parse the models output - typically one model per line
      const models = output
        .split("\n")
        .map((line) => line.trim())
        .filter((line) => line.length > 0 && !line.startsWith("#"));
      return models;
    } catch {
      return [];
    }
  }

  async getStatus(): Promise<{
    installed: boolean;
    version: string;
    authenticated: boolean;
    availableModels: string[];
  }> {
    const installed = this.isInstalled();
    const version = installed ? this.getVersion() : "not installed";
    
    let authenticated = false;
    try {
      execSync("qodo key list", { encoding: "utf-8", stdio: "pipe", cwd: this.cwd });
      authenticated = true;
    } catch {
      authenticated = false;
    }

    const availableModels = installed ? await this.getModels() : [];

    return {
      installed,
      version,
      authenticated,
      availableModels,
    };
  }

  async executePrompt(prompt: string, options: QodoCliOptions = {}): Promise<string> {
    // Use the main qodo command with a prompt directly
    const args = [...this.buildArgs(options)];
    
    return new Promise((resolve, reject) => {
      const child = spawn("qodo", args, {
        stdio: ["pipe", "pipe", "pipe"],
        cwd: this.cwd,
      });

      let stdout = "";
      let stderr = "";

      child.stdout?.on("data", (data) => {
        stdout += data.toString();
      });

      child.stderr?.on("data", (data) => {
        stderr += data.toString();
      });

      child.on("close", (code) => {
        if (code === 0) {
          resolve(stdout.trim());
        } else {
          reject(new Error(`Qodo CLI exited with code ${code}: ${stderr || stdout}`));
        }
      });

      child.on("error", (error) => {
        reject(new Error(`Failed to execute Qodo CLI: ${error.message}`));
      });
    });
  }
}
