import type { PromptTrackingChatAnswerPart } from "@/lib/landing-prompt-tracking-content";

export function PromptTrackingChatAnswerParts({ parts }: { parts: PromptTrackingChatAnswerPart[] }) {
  return (
    <>
      {parts.map((part, i) => {
        if ("variant" in part && part.variant === "brand") {
          return (
            <span key={i} className="font-semibold text-orange-400">
              {part.t}
            </span>
          );
        }
        if ("variant" in part && part.variant === "link") {
          return (
            <span key={i} className="text-white underline decoration-white/40">
              {part.t}
            </span>
          );
        }
        return <span key={i}>{part.t}</span>;
      })}
    </>
  );
}
