import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "AI visibility",
  description:
    "Score how AI engines see, cite, and recommend your brand — across ChatGPT, Claude, Gemini, Perplexity, and more.",
};

export default function AiVisibilityLayout({ children }: { children: React.ReactNode }) {
  return children;
}
