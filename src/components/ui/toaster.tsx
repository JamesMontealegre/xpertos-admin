"use client";

import { createContext, useCallback, useContext, useMemo, useRef, useState } from "react";
import { cn } from "./cn";

type Tone = "success" | "error" | "info";
type Toast = { id: number; message: string; tone: Tone };

const ToastContext = createContext<{ toast: (message: string, tone?: Tone) => void }>({ toast: () => {} });

const DURATION = { success: 4500, info: 5000, error: 8000 } as const;
const STYLE: Record<Tone, { box: string; icon: string; symbol: string }> = {
  success: { box: "border-emerald-200", icon: "bg-emerald-50 text-emerald-700", symbol: "✓" },
  error: { box: "border-red-200", icon: "bg-red-50 text-red-700", symbol: "!" },
  info: { box: "border-border", icon: "bg-primary/10 text-primary", symbol: "i" },
};

/** Avisos del panel (resultado de cada acción): arriba a la derecha, se cierran solos o con la X. */
export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const seq = useRef(0);

  const dismiss = useCallback((id: number) => setToasts((list) => list.filter((t) => t.id !== id)), []);
  const toast = useCallback(
    (message: string, tone: Tone = "info") => {
      seq.current += 1;
      const id = seq.current;
      setToasts((list) => [...list.filter((t) => t.message !== message).slice(-3), { id, message, tone }]);
      window.setTimeout(() => dismiss(id), DURATION[tone]);
    },
    [dismiss],
  );
  const value = useMemo(() => ({ toast }), [toast]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="pointer-events-none fixed inset-x-4 top-4 z-[60] flex flex-col items-end gap-2 sm:inset-x-auto sm:right-6">
        {toasts.map((t) => (
          <div
            key={t.id}
            role={t.tone === "error" ? "alert" : "status"}
            className={cn(
              "pointer-events-auto flex w-full max-w-sm items-start gap-3 rounded-xl border bg-white p-4 text-sm shadow-lg",
              STYLE[t.tone].box,
            )}
          >
            <span
              aria-hidden
              className={cn("flex size-6 shrink-0 items-center justify-center rounded-full text-xs font-bold", STYLE[t.tone].icon)}
            >
              {STYLE[t.tone].symbol}
            </span>
            <p className="min-w-0 flex-1 text-foreground">{t.message}</p>
            <button
              type="button"
              onClick={() => dismiss(t.id)}
              aria-label="Cerrar aviso"
              className="rounded-md px-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
            >
              ✕
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  return useContext(ToastContext);
}
