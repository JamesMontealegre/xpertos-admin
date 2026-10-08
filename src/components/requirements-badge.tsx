"use client";

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { Badge } from "@/components/ui/badge";
import type { Requirement } from "@/lib/labels";

const PANEL_WIDTH = 288;

/**
 * Conteo "n/6 requeridos" que al hacer clic muestra el detalle de cada requisito. El panel usa
 * posición fija para no quedar recortado por el scroll horizontal de la tabla, y sigue al botón
 * si la página se desplaza. Se cierra con clic afuera o Escape.
 */
export function RequirementsBadge({ requirements, compact = false }: { requirements: Requirement[]; compact?: boolean }) {
  const [open, setOpen] = useState(false);
  const [pos, setPos] = useState<{ top: number; left: number } | null>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  const done = requirements.filter((r) => r.done).length;
  const total = requirements.length;
  const tone = done === total ? "green" : done === 0 ? "slate" : "amber";

  const close = useCallback(() => setOpen(false), []);

  // Ubica el panel bajo el botón (o encima si no cabe abajo), dentro de la ventana.
  const place = useCallback(() => {
    if (!buttonRef.current) return;
    const rect = buttonRef.current.getBoundingClientRect();
    const height = panelRef.current?.offsetHeight ?? 0;
    const left = Math.max(8, Math.min(rect.left, window.innerWidth - PANEL_WIDTH - 8));
    const below = rect.bottom + 6;
    const top = below + height > window.innerHeight - 8 ? Math.max(8, rect.top - height - 6) : below;
    setPos({ top, left });
  }, []);

  useLayoutEffect(() => {
    if (open) place();
  }, [open, place]);

  useEffect(() => {
    if (!open) return;
    const onPointer = (e: MouseEvent) => {
      const target = e.target as Node;
      if (!panelRef.current?.contains(target) && !buttonRef.current?.contains(target)) close();
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        close();
        buttonRef.current?.focus();
      }
    };
    document.addEventListener("mousedown", onPointer);
    document.addEventListener("keydown", onKey);
    // Al desplazar la página o la tabla, el panel acompaña al botón.
    window.addEventListener("resize", place);
    window.addEventListener("scroll", place, true);
    return () => {
      document.removeEventListener("mousedown", onPointer);
      document.removeEventListener("keydown", onKey);
      window.removeEventListener("resize", place);
      window.removeEventListener("scroll", place, true);
    };
  }, [open, close, place]);

  return (
    <>
      <button
        ref={buttonRef}
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-haspopup="dialog"
        aria-label={`${done} de ${total} requisitos cumplidos. Ver detalle`}
        className="inline-flex items-center gap-1 rounded-full focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
      >
        <Badge tone={tone}>
          {done}/{total}
          {compact ? null : " requeridos"}
          <svg viewBox="0 0 20 20" fill="currentColor" className={`ml-0.5 size-3.5 transition-transform ${open ? "rotate-180" : ""}`} aria-hidden>
            <path fillRule="evenodd" d="M5.2 7.2a.75.75 0 0 1 1.06 0L10 10.94l3.74-3.74a.75.75 0 1 1 1.06 1.06l-4.27 4.27a.75.75 0 0 1-1.06 0L5.2 8.26a.75.75 0 0 1 0-1.06Z" clipRule="evenodd" />
          </svg>
        </Badge>
      </button>
      {open && (
        <div
          ref={panelRef}
          role="dialog"
          aria-label="Detalle de requisitos"
          style={{ top: pos?.top ?? -9999, left: pos?.left ?? -9999, width: PANEL_WIDTH }}
          className="fixed z-50 rounded-xl border border-border bg-white p-3 text-left shadow-lg"
        >
          <p className="mb-2 text-xs font-medium uppercase tracking-wide text-slate-500">
            {done} de {total} requisitos cumplidos
          </p>
          <ul className="space-y-1.5">
            {requirements.map((r) => (
              <li key={r.key} className="flex items-start gap-2 text-sm">
                <span
                  aria-hidden
                  className={`mt-0.5 flex size-4 shrink-0 items-center justify-center rounded-full text-[10px] font-bold ${
                    r.done ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"
                  }`}
                >
                  {r.done ? "✓" : "!"}
                </span>
                <span className="min-w-0">
                  <span className={r.done ? "text-slate-700" : "font-medium text-slate-900"}>{r.label}</span>
                  <span className="sr-only">{r.done ? " (cumplido)" : " (pendiente)"}</span>
                  {r.detail && <span className="block text-xs text-slate-500">{r.detail}</span>}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </>
  );
}
