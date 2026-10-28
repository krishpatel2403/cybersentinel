"use client";

import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import { AlertTriangle, CheckCircle2, Info, X } from "lucide-react";
import { cn } from "@/lib/utils";

type ToastTone = "success" | "error" | "info";

interface Toast {
  id: number;
  message: string;
  tone: ToastTone;
}

interface ToastContextValue {
  toast: (message: string, tone?: ToastTone) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

const TONE_STYLES: Record<ToastTone, string> = {
  success: "border-emerald-500/30 bg-emerald-950/90 text-emerald-100",
  error: "border-rose-500/30 bg-rose-950/90 text-rose-100",
  info: "border-cyan-500/30 bg-slate-900/95 text-slate-100",
};

const TONE_ICONS = {
  success: CheckCircle2,
  error: AlertTriangle,
  info: Info,
} satisfies Record<ToastTone, typeof Info>;

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const counter = useRef(0);
  const timers = useRef<number[]>([]);

  const dismiss = useCallback((id: number) => {
    setToasts((current) => current.filter((item) => item.id !== id));
  }, []);

  const toast = useCallback(
    (message: string, tone: ToastTone = "info") => {
      counter.current += 1;
      const id = counter.current;
      setToasts((current) => [...current.slice(-3), { id, message, tone }]);
      const timer = window.setTimeout(() => dismiss(id), 5000);
      timers.current.push(timer);
    },
    [dismiss],
  );

  useEffect(() => {
    const timersRef = timers;
    return () => {
      for (const timer of timersRef.current) window.clearTimeout(timer);
    };
  }, []);

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      <div
        aria-live="polite"
        aria-atomic="false"
        className="pointer-events-none fixed inset-x-4 bottom-4 z-[90] flex flex-col items-end gap-2 sm:left-auto sm:w-96"
      >
        {toasts.map((item) => {
          const Icon = TONE_ICONS[item.tone];
          return (
            <div
              key={item.id}
              role="status"
              className={cn(
                "animate-fade-up pointer-events-auto flex w-full items-start gap-3 rounded-xl border px-4 py-3 shadow-2xl backdrop-blur",
                TONE_STYLES[item.tone],
              )}
            >
              <Icon className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
              <p className="flex-1 text-sm leading-5">{item.message}</p>
              <button
                type="button"
                onClick={() => dismiss(item.id)}
                className="rounded p-0.5 opacity-70 transition hover:opacity-100"
                aria-label="Dismiss notification"
              >
                <X className="size-3.5" aria-hidden="true" />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast(): ToastContextValue {
  const context = useContext(ToastContext);
  if (!context) throw new Error("useToast must be used inside ToastProvider");
  return context;
}
