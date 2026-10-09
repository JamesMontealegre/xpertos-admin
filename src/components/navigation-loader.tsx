"use client";

import Image from "next/image";
import { usePathname, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { cn } from "@/components/ui/cn";

/** Espera antes de mostrarse, para que una navegación instantánea no parpadee. */
const SHOW_DELAY_MS = 80;
/** Si algo sale mal, el loader se oculta solo. */
const MAX_VISIBLE_MS = 15_000;

type Pending = { from: string; shown: boolean };

const locationKey = () => window.location.pathname + window.location.search;

/**
 * Interceptor de navegación para todo el panel: escucha los clics en enlaces internos (y los
 * formularios marcados con `data-navigates`, como cerrar sesión) y muestra la X de Xpertos hasta que
 * la nueva página está lista. Se oculta en cuanto cambia la ruta o la búsqueda.
 *
 * Un enlace puede excluirse con `data-no-loader`.
 */
export function NavigationLoader() {
  const pathname = usePathname();
  const query = useSearchParams().toString();
  const current = pathname + (query ? `?${query}` : "");
  const [pending, setPending] = useState<Pending | null>(null);

  useEffect(() => {
    const timers: number[] = [];
    const start = () => {
      const from = locationKey();
      timers.splice(0).forEach((t) => window.clearTimeout(t));
      setPending({ from, shown: false });
      timers.push(
        window.setTimeout(() => setPending((p) => (p && p.from === from ? { ...p, shown: true } : p)), SHOW_DELAY_MS),
        window.setTimeout(() => setPending((p) => (p && p.from === from ? null : p)), MAX_VISIBLE_MS),
      );
    };

    // Fase de captura: corre antes que el onClick de <Link>, que cancela la navegación del navegador.
    const onClick = (event: MouseEvent) => {
      if (event.defaultPrevented || event.button !== 0) return;
      if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      const anchor = (event.target as Element | null)?.closest?.("a");
      if (!anchor || !anchor.href || anchor.hasAttribute("download") || "noLoader" in anchor.dataset) return;
      if (anchor.target && anchor.target !== "_self") return;
      const url = new URL(anchor.href, window.location.href);
      if (url.origin !== window.location.origin) return;
      if (url.pathname + url.search === locationKey()) return; // mismo destino o solo un #ancla
      start();
    };

    const onSubmit = (event: SubmitEvent) => {
      const form = event.target as HTMLFormElement | null;
      if (form && "navigates" in form.dataset) start();
    };

    document.addEventListener("click", onClick, true);
    document.addEventListener("submit", onSubmit, true);
    return () => {
      document.removeEventListener("click", onClick, true);
      document.removeEventListener("submit", onSubmit, true);
      timers.forEach((t) => window.clearTimeout(t));
    };
  }, []);

  // Visible mientras siga en la página de origen; al llegar a la nueva ruta se oculta solo.
  const visible = pending !== null && pending.shown && pending.from === current;

  return (
    <div
      aria-hidden={!visible}
      className={cn(
        "pointer-events-none fixed inset-0 z-50 flex items-center justify-center bg-background/60 backdrop-blur-[2px] transition-opacity duration-200",
        visible ? "opacity-100" : "opacity-0",
      )}
    >
      <div role="status" aria-live="polite" className="flex flex-col items-center gap-3">
        <div className="relative size-20">
          <span className="absolute inset-0 rounded-full border-4 border-primary/15 border-t-primary border-r-accent animate-spin motion-reduce:animate-none" />
          <Image
            src="/brand/xpertos-icon.svg"
            alt=""
            width={44}
            height={44}
            unoptimized
            priority
            className="step-beat absolute left-1/2 top-1/2 -ml-[22px] -mt-[22px]"
          />
        </div>
        <span className="text-sm font-medium text-slate-600">{visible ? "Cargando…" : ""}</span>
      </div>
    </div>
  );
}
