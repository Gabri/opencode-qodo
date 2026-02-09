# AGENTS.md - OpenCode Qodo Plugin

Guidelines for AI agents working in this TypeScript OpenCode plugin repository.

## Build Commands

```bash
# Build the project (compile + bundle)
npm run build

# Watch mode for development
npm run dev

# TypeScript compilation only
npx tsc

# Bundle only (after tsc)
npm run bundle
```

**Note**: No test framework is configured. There are no tests to run.

## Code Style Guidelines

### TypeScript Configuration
- Target: ES2022, Module: NodeNext
- Strict mode enabled
- Always use `.js` extensions in imports (even for `.ts` files)
- Generate declaration files and source maps

### Formatting
- 2-space indentation
- Single quotes for strings
- Semicolons required
- Trailing commas preferred
- Max line length: ~100 chars (soft limit)

### Naming Conventions
- `camelCase`: variables, functions, methods
- `PascalCase`: classes, interfaces, types, enums
- `UPPER_SNAKE_CASE`: constants and exported const objects
- Private class members: use `private` keyword (not # prefix)

### Imports
```typescript
// Node built-ins: use "node:" prefix
import { execSync } from "node:child_process";
import { homedir } from "node:os";

// External dependencies
import { tool } from "@opencode-ai/plugin/tool";

// Internal imports: use .js extension
import { createLogger } from "../utils/logger.js";
import type { QodoCli } from "../utils/cli.js";

// Type imports: use `type` keyword
import type { QodoConfig } from "./config.js";
```

### Error Handling
- Use try/catch with typed errors: `catch (error: any)`
- Log errors with context: `log.error("message", { key: value })`
- Return user-friendly error messages from tools
- Never suppress errors silently

### Logging
- Use the `createLogger(serviceName)` utility
- Log to stderr only (to avoid polluting OpenCode UI)
- Structure: `log.info("message", { context })`
- Levels: debug, info, warn, error

### Tool Pattern
```typescript
export function createXxxTool(cli: QodoCli): ReturnType<typeof tool> {
  const log = createLogger("xxx-tool");
  
  return tool({
    description: "Clear description of what this tool does",
    args: {
      param: tool.schema.string().describe("Parameter description"),
    },
    execute: async ({ param }) => {
      try {
        log.info("Starting operation", { param });
        // ... logic
        log.info("Operation completed");
        return result;
      } catch (error: any) {
        log.error("Operation failed", { error: error.message });
        return `Error: ${error.message}`;
      }
    },
  });
}
```

### Code Organization
- `src/` - Source TypeScript files
- `src/tools/` - Tool implementations
- `src/utils/` - Utility functions (cli, logger)
- `dist/` - Compiled output (gitignored)
- `.opencode/` - OpenCode plugin metadata (agents, commands)

## Architecture Notes

- This is an OpenCode plugin that wraps Qodo CLI
- Plugin entry point: `src/index.ts` exports `QodoPlugin`
- Tools use the `@opencode-ai/plugin` SDK
- CLI wrapper in `src/utils/cli.ts` handles Qodo CLI spawning
- Configuration stored in `~/.config/opencode/qodo.json`

## Important Constraints

- No `as any` or `@ts-ignore` - fix types properly
- No external dependencies beyond what's in package.json
- Bundle output must include all dependencies (check dist/bundle.js size ~470KB)
- Zod schemas use `tool.schema` from the plugin SDK
