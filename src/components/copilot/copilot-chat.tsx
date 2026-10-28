"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ArrowRight, Bot, Cpu, Eraser, Loader2, Send, Sparkles, UserRound } from "lucide-react";
import { askCopilotAction } from "@/actions/copilot";
import { COPILOT_SUGGESTIONS } from "@/lib/constants";
import { Badge } from "@/components/ui/badges";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/input";
import type { CopilotAnswer, CopilotCitation } from "@/types";

interface ChatMessage {
  id: number;
  role: "user" | "assistant";
  content: string;
  mode?: CopilotAnswer["mode"];
  citations?: CopilotCitation[];
  notice?: string;
  error?: boolean;
}

interface CopilotChatProps {
  aiConfigured: boolean;
  postureSummary: string;
}

function ModeBadge({ mode }: { mode: CopilotAnswer["mode"] }) {
  return mode === "ai" ? (
    <Badge className="border-indigo-400/25 bg-indigo-400/10 text-indigo-200">
      <Cpu className="size-2.5" aria-hidden="true" />
      External AI
    </Badge>
  ) : (
    <Badge className="border-cyan-400/25 bg-cyan-400/10 text-cyan-200">
      <Sparkles className="size-2.5" aria-hidden="true" />
      Built-in analyst
    </Badge>
  );
}

export function CopilotChat({ aiConfigured, postureSummary }: CopilotChatProps) {
  const [question, setQuestion] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const nextId = useRef(1);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages.length, pending]);

  function addMessage(message: Omit<ChatMessage, "id">) {
    const id = nextId.current++;
    setMessages((current) => [...current, { ...message, id }]);
  }

  async function ask(value: string) {
    const trimmed = value.trim();
    if (!trimmed || pending) return;
    setError(null);
    setQuestion("");
    addMessage({ role: "user", content: trimmed });
    setPending(true);

    try {
      const result = await askCopilotAction(trimmed);
      if (!result.ok) {
        setError(result.message ?? "The analyst could not answer right now.");
        return;
      }
      addMessage({
        role: "assistant",
        content: result.answer,
        mode: result.mode,
        citations: result.citations,
        notice: result.notice,
      });
    } catch {
      setError("The analyst could not answer right now. Check your connection and try again.");
    } finally {
      setPending(false);
    }
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    void ask(question);
  }

  const hasConversation = messages.length > 0;

  return (
    <div className="grid gap-4 xl:grid-cols-[1fr_320px]">
      <section
        className="surface flex min-h-[600px] flex-col overflow-hidden"
        aria-label="Copilot conversation"
      >
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/8 px-4 py-3">
          <div className="flex items-center gap-2.5">
            <span className="flex size-8 items-center justify-center rounded-lg border border-cyan-400/25 bg-cyan-400/10">
              <Bot className="size-4 text-cyan-300" aria-hidden="true" />
            </span>
            <div>
              <h2 className="text-sm font-semibold text-slate-100">Analyst copilot</h2>
              <p className="font-mono text-[9px] tracking-wide text-slate-600">
                {aiConfigured ? "EXTERNAL AI ENABLED" : "LOCAL ENGINE ONLY"} · READ-ONLY CONTEXT
              </p>
            </div>
          </div>
          {hasConversation ? (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => {
                setMessages([]);
                setError(null);
              }}
            >
              <Eraser className="size-3.5" aria-hidden="true" />
              Clear
            </Button>
          ) : null}
        </div>

        <div
          className="flex-1 overflow-y-auto px-4 py-5"
          role="log"
          aria-live="polite"
          aria-label="Conversation"
        >
          {!hasConversation ? (
            <div className="mx-auto flex max-w-xl flex-col items-center py-8 text-center">
              <span className="flex size-12 items-center justify-center rounded-2xl border border-cyan-400/20 bg-cyan-400/10">
                <Sparkles className="size-5 text-cyan-300" aria-hidden="true" />
              </span>
              <h3 className="mt-4 text-base font-semibold text-slate-100">
                Ask about your security posture
              </h3>
              <p className="mt-1.5 max-w-md text-xs leading-5 text-slate-400">
                {postureSummary} The copilot reads the same dashboard data you can see. It cannot
                make changes, run commands, or access anything outside this demonstration dataset.
              </p>
              <div className="mt-5 grid w-full gap-2 sm:grid-cols-2">
                {COPILOT_SUGGESTIONS.map((suggestion) => (
                  <button
                    key={suggestion}
                    type="button"
                    onClick={() => void ask(suggestion)}
                    className="group flex items-center justify-between gap-2 rounded-lg border border-white/8 bg-white/[0.025] px-3 py-2.5 text-left text-[11px] leading-5 text-slate-300 transition hover:border-cyan-400/25 hover:bg-cyan-400/[0.05] hover:text-cyan-100"
                  >
                    {suggestion}
                    <ArrowRight
                      className="size-3 shrink-0 text-slate-600 transition group-hover:text-cyan-300"
                      aria-hidden="true"
                    />
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <ul className="space-y-4">
              {messages.map((message) =>
                message.role === "user" ? (
                  <li key={message.id} className="flex justify-end gap-2.5">
                    <div className="max-w-[85%] rounded-2xl rounded-br-md border border-cyan-400/20 bg-cyan-400/[0.08] px-3.5 py-2.5">
                      <p className="text-xs leading-5 whitespace-pre-wrap text-cyan-50">
                        {message.content}
                      </p>
                    </div>
                    <span className="mt-1 flex size-7 shrink-0 items-center justify-center rounded-full border border-white/10 bg-white/[0.04]">
                      <UserRound className="size-3.5 text-slate-400" aria-hidden="true" />
                    </span>
                  </li>
                ) : (
                  <li key={message.id} className="flex gap-2.5">
                    <span className="mt-1 flex size-7 shrink-0 items-center justify-center rounded-full border border-cyan-400/25 bg-cyan-400/10">
                      <Bot className="size-3.5 text-cyan-300" aria-hidden="true" />
                    </span>
                    <div className="max-w-[88%] min-w-0">
                      <div className="mb-1 flex items-center gap-2">
                        <span className="text-[10px] font-medium text-slate-400">Sentinel</span>
                        {message.mode ? <ModeBadge mode={message.mode} /> : null}
                      </div>
                      <div className="rounded-2xl rounded-tl-md border border-white/8 bg-white/[0.035] px-3.5 py-3">
                        <p className="text-xs leading-6 whitespace-pre-wrap text-slate-200">
                          {message.content}
                        </p>
                      </div>
                      {message.citations && message.citations.length > 0 ? (
                        <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
                          <span className="font-mono text-[9px] tracking-wider text-slate-600 uppercase">
                            Sources
                          </span>
                          {message.citations.map((citation) => (
                            <Link
                              key={`${citation.href}-${citation.label}`}
                              href={citation.href}
                              className="rounded-md border border-white/8 bg-white/[0.03] px-1.5 py-0.5 text-[9px] text-slate-400 transition hover:border-cyan-400/25 hover:text-cyan-200"
                            >
                              {citation.label}
                            </Link>
                          ))}
                        </div>
                      ) : null}
                      {message.notice ? (
                        <p className="mt-1.5 text-[10px] leading-4 text-slate-500">
                          {message.notice}
                        </p>
                      ) : null}
                    </div>
                  </li>
                ),
              )}
              {pending ? (
                <li className="flex gap-2.5">
                  <span className="mt-1 flex size-7 shrink-0 items-center justify-center rounded-full border border-cyan-400/25 bg-cyan-400/10">
                    <Bot className="size-3.5 text-cyan-300" aria-hidden="true" />
                  </span>
                  <div className="flex items-center gap-2 rounded-2xl rounded-tl-md border border-white/8 bg-white/[0.035] px-3.5 py-3 text-xs text-slate-400">
                    <Loader2 className="size-3.5 animate-spin text-cyan-300" aria-hidden="true" />
                    Reviewing posture data...
                  </div>
                </li>
              ) : null}
            </ul>
          )}
          <div ref={bottomRef} />
        </div>

        <div className="border-t border-white/8 px-4 py-3">
          {error ? (
            <p
              role="alert"
              className="mb-2 rounded-lg border border-rose-500/25 bg-rose-500/10 px-3 py-2 text-[11px] text-rose-200"
            >
              {error}
            </p>
          ) : null}
          <form onSubmit={handleSubmit} className="flex items-end gap-2">
            <div className="flex-1">
              <label htmlFor="copilot-question" className="sr-only">
                Ask the security analyst
              </label>
              <Textarea
                id="copilot-question"
                value={question}
                onChange={(event) => setQuestion(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter" && !event.shiftKey) {
                    event.preventDefault();
                    void ask(question);
                  }
                }}
                placeholder="Ask about risk, remediation priority, exposure, or recent activity..."
                maxLength={500}
                rows={2}
                className="min-h-[52px] resize-none text-xs"
                disabled={pending}
              />
            </div>
            <Button
              type="submit"
              variant="primary"
              disabled={pending || question.trim().length < 3}
              aria-busy={pending}
              className="h-[52px]"
            >
              {pending ? (
                <Loader2 className="size-4 animate-spin" aria-hidden="true" />
              ) : (
                <Send className="size-4" aria-hidden="true" />
              )}
              <span className="hidden sm:inline">Ask</span>
            </Button>
          </form>
          <div className="mt-1.5 flex items-center justify-between gap-2">
            <p className="text-[9px] text-slate-600">
              Enter to send · Shift+Enter for a new line · 15 questions per 5 minutes
            </p>
            <p className="font-mono text-[9px] text-slate-600 tabular-nums">
              {question.length}/500
            </p>
          </div>
        </div>
      </section>

      <aside className="space-y-4">
        <div className="surface p-4">
          <h2 className="text-xs font-semibold text-slate-100">How answers are produced</h2>
          <p className="mt-1.5 text-[11px] leading-5 text-slate-400">
            {aiConfigured
              ? "An external OpenAI-compatible model is configured. A compact posture summary is sent with each question. If the provider fails, the built-in analyst answers instead."
              : "No external AI key is configured, so the built-in deterministic analyst answers. It uses fixed rules over live dashboard aggregates, which makes answers reproducible and free."}
          </p>
          <ul className="mt-3 space-y-2 border-t border-white/8 pt-3">
            {[
              "Answers cite dashboard pages you can open.",
              "The copilot is read-only and cannot change findings.",
              "Questions and mode are written to the audit log.",
              "Do not paste secrets or real incident data.",
            ].map((item) => (
              <li
                key={item}
                className="flex items-start gap-2 text-[10px] leading-4 text-slate-500"
              >
                <span
                  className="mt-1.5 size-1 shrink-0 rounded-full bg-cyan-400/60"
                  aria-hidden="true"
                />
                {item}
              </li>
            ))}
          </ul>
        </div>

        <div className="surface p-4">
          <h2 className="text-xs font-semibold text-slate-100">Suggested questions</h2>
          <div className="mt-2 space-y-1.5">
            {COPILOT_SUGGESTIONS.slice(0, 4).map((suggestion) => (
              <button
                key={suggestion}
                type="button"
                onClick={() => void ask(suggestion)}
                disabled={pending}
                className="block w-full rounded-lg border border-white/8 bg-white/[0.02] px-2.5 py-2 text-left text-[10px] leading-4 text-slate-400 transition hover:border-cyan-400/25 hover:text-cyan-200 disabled:opacity-50"
              >
                {suggestion}
              </button>
            ))}
          </div>
        </div>

        <p className="px-1 text-[10px] leading-4 text-slate-600">
          Educational assistant only. Not incident response, not a scanner, and not professional
          security advice. Verify every recommendation before changing production systems.
        </p>
      </aside>
    </div>
  );
}
