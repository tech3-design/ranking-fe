"use client";

import { useState, useRef, useEffect } from "react";
import { MessageSquare, Send, Loader2, X, Compass, ChevronLeft } from "lucide-react";
import { config } from "@/lib/config";

/** Parse AI reply into formatted React elements — handles **bold**, headings, lists, numbered steps */
function formatAiReply(text: string) {
  const lines = text.split("\n");
  const elements: React.ReactNode[] = [];
  let listItems: string[] = [];
  let orderedItems: string[] = [];

  function flushList() {
    if (listItems.length > 0) {
      elements.push(
        <ul key={`ul-${elements.length}`} className="space-y-0.5 ml-3">
          {listItems.map((item, i) => (
            <li key={i} className="flex items-start gap-1.5">
              <span className="text-primary mt-0.5">•</span>
              <span>{renderInline(item)}</span>
            </li>
          ))}
        </ul>
      );
      listItems = [];
    }
    if (orderedItems.length > 0) {
      elements.push(
        <ol key={`ol-${elements.length}`} className="space-y-1 ml-1">
          {orderedItems.map((item, i) => (
            <li key={i} className="flex items-start gap-2">
              <span className="w-4 h-4 bg-foreground/10 text-foreground text-[10px] font-bold flex items-center justify-center shrink-0 rounded mt-0.5">{i + 1}</span>
              <span>{renderInline(item)}</span>
            </li>
          ))}
        </ol>
      );
      orderedItems = [];
    }
  }

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) { flushList(); elements.push(<div key={elements.length} className="h-1" />); continue; }

    // Headings
    if (trimmed.startsWith("### ")) { flushList(); elements.push(<p key={elements.length} className="font-semibold text-foreground mt-1">{renderInline(trimmed.slice(4))}</p>); continue; }
    if (trimmed.startsWith("## ")) { flushList(); elements.push(<p key={elements.length} className="font-semibold text-foreground mt-1">{renderInline(trimmed.slice(3))}</p>); continue; }
    if (trimmed.startsWith("# ")) { flushList(); elements.push(<p key={elements.length} className="font-bold text-foreground mt-1">{renderInline(trimmed.slice(2))}</p>); continue; }

    // Bullet lists
    if (trimmed.startsWith("- ") || trimmed.startsWith("* ")) { listItems.push(trimmed.slice(2)); continue; }

    // Numbered lists
    const numMatch = trimmed.match(/^(\d+)[.)]\s+(.*)/);
    if (numMatch) { orderedItems.push(numMatch[2]); continue; }

    // Regular paragraph
    flushList();
    elements.push(<p key={elements.length}>{renderInline(trimmed)}</p>);
  }
  flushList();
  return elements;
}

/** Render inline markdown: **bold**, *italic*, `code` */
function renderInline(text: string): React.ReactNode {
  // Split by **bold**, *italic*, `code` patterns
  const parts: React.ReactNode[] = [];
  let remaining = text;
  let key = 0;

  while (remaining.length > 0) {
    // Bold: **text**
    const boldMatch = remaining.match(/^([\s\S]*?)\*\*(.+?)\*\*([\s\S]*)/);
    if (boldMatch) {
      if (boldMatch[1]) parts.push(<span key={key++}>{boldMatch[1]}</span>);
      parts.push(<strong key={key++} className="font-semibold text-foreground">{boldMatch[2]}</strong>);
      remaining = boldMatch[3];
      continue;
    }

    // Inline code: `text`
    const codeMatch = remaining.match(/^([\s\S]*?)`(.+?)`([\s\S]*)/);
    if (codeMatch) {
      if (codeMatch[1]) parts.push(<span key={key++}>{codeMatch[1]}</span>);
      parts.push(<code key={key++} className="bg-foreground/5 px-1 py-0.5 rounded text-[11px] font-mono">{codeMatch[2]}</code>);
      remaining = codeMatch[3];
      continue;
    }

    // No more matches — push the rest
    parts.push(<span key={key++}>{remaining}</span>);
    break;
  }

  return parts.length === 1 ? parts[0] : <>{parts}</>;
}

interface Message {
  role: "user" | "assistant";
  content: string;
}

interface AiChatProps {
  slug: string;
  brandName?: string;
  open: boolean;
  onClose: () => void;
  initialMessage?: string;
}

export function AiChat({ slug, brandName, open, onClose, initialMessage }: AiChatProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: `Hi! I'm your GEO assistant. I have full context of ${brandName || "your site"}'s analysis — scores, recommendations, and what to improve. Ask me anything!`,
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (open) inputRef.current?.focus();
  }, [open]);

  // Auto-send initial message when chat opens with a pre-filled question
  const sentInitial = useRef<string | null>(null);
  useEffect(() => {
    if (open && initialMessage && initialMessage !== sentInitial.current) {
      sentInitial.current = initialMessage;
      // Simulate sending the message
      const userMsg: Message = { role: "user", content: initialMessage };
      setMessages((prev) => [...prev, userMsg]);
      setLoading(true);
      fetch(`${config.apiBaseUrl}/api/analyzer/runs/s/${slug}/chat/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: initialMessage,
          history: messages.slice(-10).map((m) => ({ role: m.role, content: m.content })),
        }),
      })
        .then((r) => r.json())
        .then((data) => {
          setMessages((prev) => [...prev, { role: "assistant", content: data.reply || data.response || data.message || "I can help with that!" }]);
        })
        .catch(() => {
          setMessages((prev) => [...prev, { role: "assistant", content: "Sorry, I couldn't process that. Try again." }]);
        })
        .finally(() => setLoading(false));
    }
  }, [open, initialMessage, slug]);

  async function handleSend(e: React.FormEvent) {
    e.preventDefault();
    const text = input.trim();
    if (!text || loading) return;

    const userMsg: Message = { role: "user", content: text };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const resp = await fetch(`${config.apiBaseUrl}/api/analyzer/runs/s/${slug}/chat/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: text,
          history: messages.slice(-10).map((m) => ({ role: m.role, content: m.content })),
        }),
      });

      if (resp.ok) {
        const data = await resp.json();
        setMessages((prev) => [...prev, { role: "assistant", content: data.reply }]);
      } else {
        setMessages((prev) => [...prev, { role: "assistant", content: "Sorry, I couldn't process that. Please try again." }]);
      }
    } catch {
      setMessages((prev) => [...prev, { role: "assistant", content: "Connection error. Please try again." }]);
    } finally {
      setLoading(false);
    }
  }

  if (!open) return null;

  return (
    <aside className="w-[340px] flex-shrink-0 h-full bg-card border-l border-border flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center">
            <Compass className="w-3.5 h-3.5 text-primary" />
          </div>
          <div>
            <p className="text-xs font-semibold text-foreground">GEO Assistant</p>
            <p className="text-[10px] text-muted-foreground">Powered by Gemini</p>
          </div>
        </div>
        <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-accent transition">
          <ChevronLeft className="w-4 h-4 text-muted-foreground" />
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
            <div
              className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 text-xs leading-relaxed ${
                msg.role === "user"
                  ? "bg-primary text-white rounded-br-md"
                  : "bg-muted/60 text-foreground border border-border/50 rounded-bl-md"
              }`}
            >
              {msg.role === "user" ? (
                <p>{msg.content}</p>
              ) : (
                <div className="chat-reply space-y-1.5">
                  {formatAiReply(msg.content)}
                </div>
              )}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="bg-muted/60 border border-border/50 rounded-2xl rounded-bl-md px-3.5 py-2.5">
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Loader2 className="w-3 h-3 animate-spin" />
                Thinking...
              </div>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Suggestions (when few messages) */}
      {messages.length <= 2 && (
        <div className="px-4 pb-2 flex flex-wrap gap-1.5">
          {[
            "What should I fix first?",
            "How can I improve my schema?",
            "Why is my E-E-A-T score low?",
            "Explain my GEO score",
          ].map((q) => (
            <button
              key={q}
              onClick={() => { setInput(q); inputRef.current?.focus(); }}
              className="rounded-full border border-border px-2.5 py-1 text-[10px] text-muted-foreground hover:bg-accent hover:text-foreground transition"
            >
              {q}
            </button>
          ))}
        </div>
      )}

      {/* Input */}
      <form onSubmit={handleSend} className="shrink-0 px-3 py-3 border-t border-border">
        <div className="flex items-center gap-2 bg-background rounded-xl border border-border px-3 py-2 focus-within:border-primary/50 transition">
          <input
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about your GEO score..."
            className="flex-1 bg-transparent text-xs text-foreground placeholder:text-muted-foreground outline-none"
            disabled={loading}
          />
          <button
            type="submit"
            disabled={!input.trim() || loading}
            className="p-1.5 rounded-lg bg-primary text-white disabled:opacity-30 hover:bg-primary/90 transition"
          >
            <Send className="w-3 h-3" />
          </button>
        </div>
      </form>
    </aside>
  );
}
