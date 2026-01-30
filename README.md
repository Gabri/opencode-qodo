# OpenCode Qodo Plugin

This plugin integrates the [Qodo CLI](https://www.qodo.ai/) into [OpenCode](https://opencode.ai/), allowing you to use Qodo's agentic capabilities directly from your OpenCode environment.

## Features
- **Interact with Qodo**: Send prompts to Qodo CLI directly from OpenCode.
- **Model Selection**: Specify which Qodo model or agent to use (e.g., `qodo-cover`, `qodo-gen`).
- **Context Awareness**: Pipe files as context to Qodo.

## Prerequisites
- **Qodo CLI**: You must have the `qodo` CLI installed and available in your system `PATH`.
  - [Install Qodo CLI](https://docs.qodo.ai/qodo-documentation/qodo-command/getting-started/installation)

## Installation

### Local Installation
1. Clone this repository or download the source.
2. Run `npm install && npm run build` to compile the plugin.
3. Add the plugin to your `opencode.json` (project or global config):

```json
{
  "plugin": ["/absolute/path/to/opencode-qodo/dist/index.js"]
}
```

### Usage

Once installed, the `qodo` tool will be available to OpenCode agents.

**Example Prompts for OpenCode:**
- "Use qodo to generate unit tests for `src/utils.ts`"
- "Ask qodo to explain the bug in `app.js`"
- "Run qodo-cover on the current file"

**Tool Usage:**
The tool `qodo` accepts:
- `prompt`: The prompt string.
- `model`: (Optional) The model/agent name (e.g., `qodo-cover`).
- `file`: (Optional) A file path to pipe as context.

## Configuration
No specific configuration is needed for the plugin itself, but ensure your Qodo CLI is authenticated and configured:

```bash
qodo auth login
```

## License
MIT
