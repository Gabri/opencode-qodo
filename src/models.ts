export interface QodoModel {
  id: string;
  name: string;
  provider: string;
  description: string;
  contextWindow: number;
  outputLimit: number;
  supportsImages: boolean;
  supportsPdf: boolean;
  supportsThinking: boolean;
  variants?: Record<string, { description: string; options?: Record<string, unknown> }>;
}

export const QODO_MODELS: QodoModel[] = [
  {
    id: "claude-4.5-sonnet",
    name: "Claude 4.5 Sonnet",
    provider: "anthropic",
    description: "Claude Sonnet 4.5 - balanced performance and capability",
    contextWindow: 200000,
    outputLimit: 64000,
    supportsImages: true,
    supportsPdf: true,
    supportsThinking: true,
    variants: {
      default: { description: "Standard mode" },
      thinking: { description: "Extended thinking mode", options: { thinking: true } },
    },
  },
  {
    id: "claude-4.5-haiku",
    name: "Claude 4.5 Haiku",
    provider: "anthropic",
    description: "Claude Haiku 4.5 - fast and efficient",
    contextWindow: 200000,
    outputLimit: 64000,
    supportsImages: true,
    supportsPdf: true,
    supportsThinking: false,
  },
  {
    id: "claude-4.5-opus",
    name: "Claude 4.5 Opus",
    provider: "anthropic",
    description: "Claude Opus 4.5 - most capable model",
    contextWindow: 200000,
    outputLimit: 64000,
    supportsImages: true,
    supportsPdf: true,
    supportsThinking: true,
    variants: {
      default: { description: "Standard mode" },
      thinking: { description: "Extended thinking mode", options: { thinking: true } },
    },
  },
  {
    id: "gemini-2.5-pro",
    name: "Gemini 2.5 Pro",
    provider: "google",
    description: "Gemini 2.5 Pro - Google's advanced model",
    contextWindow: 1048576,
    outputLimit: 65536,
    supportsImages: true,
    supportsPdf: true,
    supportsThinking: true,
  },
  {
    id: "grok-4",
    name: "Grok 4",
    provider: "xai",
    description: "Grok 4 - xAI's model",
    contextWindow: 128000,
    outputLimit: 32000,
    supportsImages: true,
    supportsPdf: false,
    supportsThinking: false,
  },
  {
    id: "gpt-5.1-codex",
    name: "GPT 5.1 Codex",
    provider: "openai",
    description: "GPT 5.1 Codex - optimized for coding",
    contextWindow: 128000,
    outputLimit: 32000,
    supportsImages: true,
    supportsPdf: true,
    supportsThinking: true,
    variants: {
      default: { description: "Standard mode" },
      high: { description: "High reasoning effort", options: { reasoningEffort: "high" } },
      max: { description: "Maximum reasoning effort", options: { reasoningEffort: "max" } },
    },
  },
  {
    id: "gpt-5.1",
    name: "GPT 5.1",
    provider: "openai",
    description: "GPT 5.1 - general purpose",
    contextWindow: 128000,
    outputLimit: 32000,
    supportsImages: true,
    supportsPdf: true,
    supportsThinking: true,
  },
  {
    id: "gpt-5.2",
    name: "GPT 5.2",
    provider: "openai",
    description: "GPT 5.2 - latest general model",
    contextWindow: 128000,
    outputLimit: 32000,
    supportsImages: true,
    supportsPdf: true,
    supportsThinking: true,
    variants: {
      default: { description: "Standard mode" },
      high: { description: "High reasoning effort", options: { reasoningEffort: "high" } },
      max: { description: "Maximum reasoning effort", options: { reasoningEffort: "max" } },
    },
  },
];

export function getModelById(id: string): QodoModel | undefined {
  return QODO_MODELS.find((model) => model.id === id);
}

export function getAllModels(): QodoModel[] {
  return QODO_MODELS;
}

export function getModelsByProvider(provider: string): QodoModel[] {
  return QODO_MODELS.filter((model) => model.provider === provider);
}
