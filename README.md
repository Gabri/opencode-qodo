# OpenCode Qodo Plugin

A comprehensive OpenCode plugin for [Qodo CLI](https://www.qodo.ai/) integration. Use Qodo's agentic capabilities, models, and specialized agents directly from OpenCode.

## Quick Start

Once installed, use Qodo directly from OpenCode:

```bash
# Generate code
opencode "Use qodo to create a React login form with validation"

# Run code review
opencode "Run qodo_review on staged changes"

# Execute specialized agent
opencode "Use qodo_agent with agent qodo-cover to generate tests for src/utils.ts"

# Chain multiple agents
opencode "Use qodo_chain with agents [analyze, refactor, test] and initial prompt 'Review this codebase'"
```

## Features

- **Model Selection**: Access all Qodo models (Claude 4.5, GPT 5.1/5.2, Gemini 2.5 Pro, Grok 4) directly from OpenCode's model picker
- **Code Generation**: Generate code, tests, and documentation with `qodo` tool
- **Interactive Chat**: Start chat sessions with `qodo_chat`
- **Code Review**: AI-powered review of git changes with `qodo_review`
- **Agent Execution**: Run specialized Qodo agents like `qodo-cover` with `qodo_agent`
- **Agent Chaining**: Chain multiple agents for complex workflows with `qodo_chain`
- **Configuration Management**: View and update settings with `qodo_config`

## Prerequisites

- **Qodo CLI**: Must be installed and authenticated
  ```bash
  npm install -g qodo
  qodo login
  ```

## Installation

### Method 1: Local Development (Recommended)

1. **Clone** the repository in your project:
   ```bash
   git clone <repository-url> opencode-qodo
   cd opencode-qodo
   ```

2. **Install dependencies** and build:
   ```bash
   npm install
   npm run build
   ```

3. **Add to your OpenCode configuration**:

   **Global** (`~/.config/opencode/opencode.json`):
   ```json
   {
     "plugin": ["/absolute/path/to/opencode-qodo/dist/index.js"]
   }
   ```

   **Project-level** (`.opencode/opencode.json`):
   ```json
   {
     "plugin": ["./opencode-qodo/dist/index.js"]
   }
   ```

   **Alternatively**, copy the built plugin to `.opencode/plugins/`:
   ```bash
   mkdir -p .opencode/plugins
   cp -r opencode-qodo/dist .opencode/plugins/qodo
   cp opencode-qodo/package.json .opencode/plugins/qodo/
   ```

### Method 2: NPM (when published)

```json
{
  "plugin": ["opencode-qodo"]
}
```

### Verification

After installation, verify the plugin is loaded:
```bash
opencode --version
# Should show Qodo plugin loaded in logs
```

## Configuration

Create `~/.config/opencode/qodo.json`:

```json
{
  "defaultModel": "claude-4.5-sonnet",
  "theme": "dark",
  "autoUpdate": true,
  "debug": false,
  "permissions": "rw",
  "tools": ["shell", "git", "filesystem"],
  "noBuiltin": false,
  "plan": false,
  "act": true
}
```

### Configuration Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `defaultModel` | string | `"claude-4.5-sonnet"` | Default model for Qodo operations |
| `theme` | string | `"dark"` | UI theme (light/dark) |
| `autoUpdate` | boolean | `true` | Auto-update Qodo CLI |
| `debug` | boolean | `false` | Enable debug logging |
| `permissions` | string | `"rw"` | Permission level (r/rw/rwx/-) |
| `tools` | string[] | - | Authorized tools |
| `noBuiltin` | boolean | `false` | Disable built-in MCP servers |
| `plan` | boolean | `false` | Use planning execution strategy |
| `act` | boolean | `true` | Use direct execution strategy |

## Available Tools

### Core Tools

#### `qodo` - Code Generation
Generate code, tests, or documentation:
```
Generate a React component for a user profile card using qodo
```

**Parameters:**
- `prompt` (required): Generation instruction
- `model`: Specific model to use
- `file`: Context file path
- `outputFile`: Where to save output
- `language`: Target language
- `framework`: Framework context

#### `qodo_chat` - Interactive Chat
Start a chat session:
```
Start a qodo_chat to brainstorm API design
```

**Parameters:**
- `initialMessage`: Starting message
- `model`: Model to use
- `context`: Background information

#### `qodo_review` - Code Review
Review git changes:
```
Run qodo_review on staged changes with focus on security
```

**Parameters:**
- `scope`: "staged", "unstaged", or "all"
- `focus`: Specific focus areas
- `model`: Model to use

#### `qodo_agent` - Execute Agents
Run specialized Qodo agents:
```
Use qodo_agent with agent "qodo-cover" to generate tests for src/utils.ts
```

**Parameters:**
- `agent` (required): Agent name
- `prompt` (required): Task instruction
- `model`: Model to use
- `agentFile`: Custom agent config path
- `keyValuePairs`: Additional parameters

#### `qodo_chain` - Chain Agents
Execute multiple agents sequentially:
```
Chain agents ["analyze", "refactor", "test"] with initial prompt "Review this codebase"
```

**Parameters:**
- `agents` (required): Array of agent names
- `initialPrompt` (required): Starting input
- `model`: Model for all agents

### Management Tools

#### `qodo_models` - List Models
View all available models:
```
Show me all qodo_models from anthropic
```

**Parameters:**
- `provider`: Filter by provider

#### `qodo_status` - Check Status
View authentication and configuration:
```
Check qodo_status
```

#### `qodo_config` - Manage Configuration
View or update settings:
```
Use qodo_config to view current settings
Use qodo_config to set debug to true
```

**Parameters:**
- `action`: "view" or "set"
- `key`: Configuration key (for set)
- `value`: Value to set (for set)

## Available Models

| Model | Provider | Context | Features |
|-------|----------|---------|----------|
| claude-4.5-sonnet | anthropic | 200k | images, pdf, thinking |
| claude-4.5-haiku | anthropic | 200k | images, pdf |
| claude-4.5-opus | anthropic | 200k | images, pdf, thinking |
| gemini-2.5-pro | google | 1M | images, pdf, thinking |
| grok-4 | xai | 128k | images |
| gpt-5.1-codex | openai | 128k | images, pdf, thinking |
| gpt-5.1 | openai | 128k | images, pdf, thinking |
| gpt-5.2 | openai | 128k | images, pdf, thinking |

## Usage Examples

### Generate Code
```
Use qodo to create a Python FastAPI endpoint for user authentication with JWT
```

### Generate Tests
```
Use qodo_agent with agent "qodo-cover" and prompt "Generate unit tests for src/calculator.ts"
```

### Review Code
```
Run qodo_review on all changes with focus on performance
```

### Chat Session
```
Start qodo_chat with context "We're building a microservices architecture" and initial message "How should we handle service discovery?"
```

### Chain Agents
```
Use qodo_chain with agents ["analyze", "document"] and initial prompt "Review the API design in src/api/"
```

## Troubleshooting

### Qodo CLI not found
```bash
npm install -g qodo
qodo --version  # Verify installation
```

### Not authenticated
```bash
qodo login
qodo key list  # Verify authentication
```

### Plugin not loading / Zod version error
If you see errors about Zod version conflicts:
```bash
# Remove old dependencies and reinstall
cd opencode-qodo
rm -rf node_modules package-lock.json
npm install
npm run build
```

The plugin uses the Zod version bundled with `@opencode-ai/plugin` to ensure compatibility.

### Enable debug mode
```bash
# In OpenCode
Use qodo_config to set debug to true
```

Or set environment variable:
```bash
DEBUG=1 opencode
```

### Check plugin is loaded
```bash
# Start OpenCode and check logs
opencode
# Look for "Registering Qodo plugin" in the output
```

## License

MIT
