/**
 * Floating listing assistant — FAQ bot from listing facts (not live host messaging).
 */

"use client";

import { MessageCircle, Send, X } from "lucide-react";
import { useEffect, useRef, useState, type FormEvent } from "react";

import { sendChatMessage } from "@/services/chat";
import type { HostPublic } from "@/types/listing-detail";

interface ChatBubble {
  id: string;
  role: "user" | "bot";
  text: string;
}

interface ListingChatbotProps {
  listingId: number;
  listingTitle: string;
  host: HostPublic;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const FALLBACK_SUGGESTIONS = [
  "What's the price?",
  "How many guests?",
  "What amenities are included?",
  "Where is it located?",
  "Tell me about the host",
];

export function ListingChatbot({
  listingId,
  listingTitle,
  host,
  open,
  onOpenChange,
}: ListingChatbotProps) {
  const [messages, setMessages] = useState<ChatBubble[]>([]);
  const [suggestions, setSuggestions] = useState<string[]>(FALLBACK_SUGGESTIONS);
  const [input, setInput] = useState("");
  const [pending, setPending] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const seeded = useRef(false);

  useEffect(() => {
    if (!open || seeded.current) return;
    seeded.current = true;
    setMessages([
      {
        id: "welcome",
        role: "bot",
        text: `Hi! I'm the listing assistant for “${listingTitle}” (hosted by ${host.full_name}). I can answer questions about price, amenities, location, guests, or cancellation. Live host messaging is coming soon.`,
      },
    ]);
  }, [open, listingTitle, host.full_name]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, open]);

  const send = async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || pending) return;
    const userMsg: ChatBubble = { id: `u-${Date.now()}`, role: "user", text: trimmed };
    setMessages((m) => [...m, userMsg]);
    setInput("");
    setPending(true);
    try {
      const res = await sendChatMessage(listingId, trimmed);
      setMessages((m) => [...m, { id: `b-${Date.now()}`, role: "bot", text: res.reply }]);
      if (res.suggestions?.length) setSuggestions(res.suggestions);
    } catch {
      setMessages((m) => [
        ...m,
        {
          id: `b-${Date.now()}`,
          role: "bot",
          text: "Sorry — I couldn't reach the assistant just now. Please try again in a moment.",
        },
      ]);
    } finally {
      setPending(false);
    }
  };

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    void send(input);
  };

  return (
    <>
      {!open && (
        <button
          type="button"
          onClick={() => onOpenChange(true)}
          className="fixed bottom-24 right-4 z-50 flex items-center gap-2 rounded-full bg-coral px-5 py-3 text-sm font-semibold text-white shadow-elevated hover:bg-coral-hover lg:bottom-8 lg:right-8"
          aria-label="Ask about this listing"
        >
          <MessageCircle className="h-5 w-5" />
          Ask about stay
        </button>
      )}

      {open && (
        <div className="fixed bottom-24 right-4 z-50 flex h-[min(560px,70vh)] w-[min(100%-2rem,380px)] flex-col overflow-hidden rounded-3xl border border-abnb-border bg-abnb-surface shadow-elevated lg:bottom-8 lg:right-8">
          <header className="flex items-center justify-between border-b border-abnb-border bg-abnb-fg px-4 py-3 text-abnb-bg">
            <div>
              <p className="text-sm font-semibold">Listing assistant</p>
              <p className="text-xs opacity-80">Demo FAQ · not live chat with {host.full_name}</p>
            </div>
            <button
              type="button"
              onClick={() => onOpenChange(false)}
              className="rounded-full p-1.5 hover:bg-white/10"
              aria-label="Close chat"
            >
              <X className="h-5 w-5" />
            </button>
          </header>

          <div className="flex-1 space-y-3 overflow-y-auto px-4 py-4">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <p
                  className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed ${
                    msg.role === "user"
                      ? "bg-coral text-white"
                      : "bg-abnb-surface-hover text-abnb-fg"
                  }`}
                >
                  {msg.text}
                </p>
              </div>
            ))}
            {pending && (
              <p className="text-xs text-abnb-muted">Assistant is typing…</p>
            )}
            <div ref={bottomRef} />
          </div>

          <div className="flex flex-wrap gap-2 border-t border-abnb-border px-3 py-2">
            {suggestions.slice(0, 4).map((s) => (
              <button
                key={s}
                type="button"
                disabled={pending}
                onClick={() => void send(s)}
                className="rounded-full border border-abnb-border px-3 py-1 text-xs text-abnb-fg hover:border-abnb-fg disabled:opacity-50"
              >
                {s}
              </button>
            ))}
          </div>

          <form onSubmit={onSubmit} className="flex gap-2 border-t border-abnb-border p-3">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask a question…"
              className="flex-1 rounded-full border border-abnb-border bg-abnb-bg px-4 py-2 text-sm text-abnb-fg outline-none focus:border-abnb-fg"
            />
            <button
              type="submit"
              disabled={pending || !input.trim()}
              className="flex h-10 w-10 items-center justify-center rounded-full bg-coral text-white disabled:opacity-40"
              aria-label="Send"
            >
              <Send className="h-4 w-4" />
            </button>
          </form>
        </div>
      )}
    </>
  );
}
