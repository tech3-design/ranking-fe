import type { Engine } from "@/lib/api/analyzer";

export const ENGINE_LOGO_SRC: Record<Engine, string> = {
  google: "/logos/google.svg",
  bing: "/logos/copilot.svg",
  chatgpt: "/logos/chatgpt.svg",
  claude: "/logos/claude.svg",
  gemini: "/logos/gemini.svg",
  perplexity: "/logos/perplexity.svg",
};

export const ENGINE_LABELS: Record<Engine, string> = {
  google: "Google",
  bing: "Bing",
  chatgpt: "ChatGPT",
  claude: "Claude",
  gemini: "Gemini",
  perplexity: "Perplexity",
};

export function engineLogo(engine: string): string | null {
  return ENGINE_LOGO_SRC[engine as Engine] ?? null;
}

export function engineLabel(engine: string): string {
  return ENGINE_LABELS[engine as Engine] ?? engine;
}
