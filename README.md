# OpenCode Qodo Plugin

A comprehensive OpenCode plugin for [Qodo CLI](https://www.qodo.ai/) integration. Use Qodo's agentic capabilities, models, and specialized agents directly from OpenCode.

## Features Overview

- 🤖 **Qodo Agent**: Dedicated OpenCode agent that routes all requests through Qodo
- ⚡ **Slash Commands**: `/qodo`, `/qodo-status`, `/qodo-review`, `/qodo-test`, `/qodo-chat`, `/qodo-models`
- 🔧 **Tools**: Full suite of Qodo tools accessible to any OpenCode agent
- 📊 **Status Tracking**: Check authentication, models, and configuration
- 🔄 **Agent Chaining**: Execute complex multi-agent workflows

## ⚡ Quick Install

```bash
# 1. Clone the repo
git clone https://github.com/opencode-qodo.git ~/opencode-qodo
cd ~/opencode-qodo && npm install && npm run build

# 2. Add to OpenCode config
echo '{"plugin":["'$(realpath dist/bundle.js)'"]}' > ~/.config/opencode/opencode.json

# 3. Create symlinks for autocomplete
ln -sf $(realpath .opencode/agents) ~/.config/opencode/agents
ln -sf $(realpath .opencode/commands) ~/.config/opencode/commands

# 4. Done! OpenCode will now show Qodo commands and agent
opencode
```

See [Installation](#installation) for detailed instructions and troubleshooting.

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

## Command Prefix Mode (New!)

Use the `/qodo` or `qodo:` prefix in any OpenCode message to route it directly through Qodo:

```bash
# Using /qodo prefix
opencode "/qodo Create a Python function to calculate fibonacci"

# Using qodo: prefix
opencode "qodo: Generate unit tests for src/utils.ts"

# Works with any prompt
opencode "/qodo Review this code and suggest improvements"
```

This is the quickest way to use Qodo - just prefix your message and it will be processed by Qodo automatically!

## Autocomplete & Agent Selection

The Qodo plugin now provides full autocomplete support in OpenCode:

### Slash Commands (Type `/`)

When you type `/` in OpenCode, you'll now see Qodo commands in the autocomplete list:

- **`/qodo`** - Execute Qodo command for code generation, review, and more
- **`/qodo:chat`** - Start an interactive chat session with Qodo
- **`/qodo:review`** - Run Qodo code review on git changes
- **`/qodo:agent`** - Execute a specialized Qodo agent
- **`/qodo:models`** - List all available Qodo models
- **`/qodo:status`** - Check Qodo CLI status and authentication

### Agent Selection (Type `@` or use Tab)

Switch to Qodo as your active agent by typing `@` and selecting:

- **`@qodo`** - Switch to Qodo Agent for AI-powered code assistance
- **`@qodo:cover`** - Use the Qodo Cover Agent for test generation
- **`@qodo:review`** - Use the Qodo Review Agent for code analysis

Simply type `@` and press **Tab** to cycle through available agents, or type `@qodo` to select Qodo directly!

## Qodo Agent Mode

The plugin includes a dedicated **Qodo Agent** that you can switch to for a full Qodo-powered experience.

### Switching to Qodo Agent

1. **Using Tab**: Press `Tab` to cycle through agents until you reach "qodo"
2. **Using @mention**: Type `@qodo` in your message
3. **Using slash command**: Type `/agents` and select "qodo"

### What Qodo Agent Does

When using the Qodo Agent, all your requests are processed through Qodo CLI:

- **Code Generation**: Automatically uses `qodo` tool
- **Code Review**: Routes to `qodo_review`
- **Test Generation**: Uses `qodo_agent` with qodo-cover
- **Complex Tasks**: Orchestrates multiple Qodo tools

### Available Slash Commands

| Command | Description |
|---------|-------------|
| `/qodo <prompt>` | Execute any prompt through Qodo |
| `/qodo-status` | Check Qodo status, auth, and current model |
| `/qodo-review [scope]` | Run code review (staged/unstaged/all) |
| `/qodo-test <file>` | Generate tests for a file |
| `/qodo-chat [message]` | Start interactive chat |
| `/qodo-models [provider]` | List available models |

### Example Workflow

```bash
# 1. Check your Qodo status
/qodo-status

# 2. Switch to Qodo agent
@qodo

# 3. Generate code
Create a REST API endpoint for user management

# 4. Review the changes
/qodo-review staged

# 5. Generate tests
/qodo-test src/api/users.ts
```

## Features

- **Command Prefix Mode**: Use `/qodo` or `qodo:` prefix to route any message through Qodo directly
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

### Prerequisites

- **Qodo CLI**: Must be installed and authenticated

  ```bash
  npm install -g qodo
  qodo login
  ```

### Method 1: Clone and Link (Recommended for Development)

This method allows the plugin to work from any directory and provides full autocomplete support.

1. **Clone** the repository:

   ```bash
   git clone https://github.com/opencode-qodo.git
   cd opencode-qodo
   ```

2. **Install dependencies** and build:

   ```bash
   npm install
   npm run build
   ```

3. **Add the plugin to OpenCode configuration** (`~/.config/opencode/opencode.json`):

   ```json
   {
     "plugin": [
       "/<absolute-path-to-repo>/opecode-qodo/dist/bundle.js"
     ]
   }
   ```

   Replace the path with the absolute path to your cloned repository.

4. **Create symlinks for autocomplete support** (important!):

   ```bash
   # Create symlinks so OpenCode can find agents and commands
   ln -sf /<absolute-path-to-repo>/opecode-qodo/.opencode/agents ~/.config/opencode/agents
   ln -sf /<absolute-path-to-repo>/opecode-qodo/.opencode/commands ~/.config/opencode/commands
   ```

   Again, replace the source path with your actual repository path.

5. **Verify installation**:

   ```bash
   opencode
   # Type / to see Qodo commands in autocomplete
   # Type @ to see Qodo agent
   ```

### Method 2: Project-Local Installation

If you prefer to install the plugin only in a specific project:

1. **Clone** inside your project:

   ```bash
   cd your-project
   git clone https://github.com/opencode-qodo.git
   cd opencode-qodo && npm install && npm run build && cd ..
   ```

2. **Add to project's OpenCode config** (`.opencode/opencode.json`):

   ```json
   {
     "plugin": ["./opencode-qodo/dist/bundle.js"]
   }
   ```

3. **Create local symlinks**:

   ```bash
   mkdir -p .opencode
   ln -sf ./opencode-qodo/.opencode/agents .opencode/agents
   ln -sf ./opencode-qodo/.opencode/commands .opencode/commands
   ```

### Method 3: NPM (when published)

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

### Autocomplete not working (commands/agents not showing)

If the plugin loads but `/` and `@` autocomplete doesn't show Qodo commands:

1. **Verify symlinks are created**:

   ```bash
   ls -la ~/.config/opencode/agents
   ls -la ~/.config/opencode/commands
   # Should show symlinks pointing to your repo
   ```

2. **Recreate symlinks**:

   ```bash
   rm ~/.config/opencode/agents ~/.config/opencode/commands
   ln -sf /path/to/opencode-qodo/.opencode/agents ~/.config/opencode/agents
   ln -sf /path/to/opencode-qodo/.opencode/commands ~/.config/opencode/commands
   ```

3. **Restart OpenCode completely** (not just reload)

### Plugin works only from specific directory

If the plugin works only when you launch OpenCode from the plugin directory:

1. Make sure you're using the **absolute path** in `~/.config/opencode/opencode.json`:

   ```json
   {
     "plugin": ["/absolute/path/to/opencode-qodo/dist/bundle.js"]
   }
   ```

   Not a relative path like `./opencode-qodo/dist/bundle.js`

2. Verify the bundle exists:

   ```bash
   ls -la /path/to/opencode-qodo/dist/bundle.js
   # Should be ~470KB
   ```

3. Rebuild the bundle:

   ```bash
   cd opencode-qodo
   npm run build
   ```

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
