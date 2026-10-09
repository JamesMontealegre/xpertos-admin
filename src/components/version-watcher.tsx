"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { APP_VERSION } from "@/lib/version";

const CHECK_MS = 60_000;
const SAFE_CHECK_MS = 5_000;
/** Sin teclear ni hacer clic durante este tiempo se considera que el agente no está trabajando. */
const IDLE_MS = 15_000;

const RELOADED_KEY = "xp-reloaded-for";

/**
 * Recarga una sola vez por versión: si después de recargar el navegador sigue con el código anterior
 * (p. ej. por una caché), no se entra en un ciclo de recargas; queda el botón "Actualizar ahora".
 */
function autoReload(version: string) {
  try {
    if (sessionStorage.getItem(RELOADED_KEY) === version) return;
    sessionStorage.setItem(RELOADED_KEY, version);
  } catch {
    // Sin sessionStorage (navegación privada estricta): se recarga igual.
  }
  window.location.reload();
}

/** true si hay un campo con algo escrito que se perdería al recargar. */
function hasDraft() {
  const fields = document.querySelectorAll<HTMLInputElement | HTMLTextAreaElement>(
    'input:not([type=hidden]):not([type=checkbox]):not([type=radio]):not([type=submit]):not([type=button]):not([type=file]), textarea',
  );
  return [...fields].some((f) => f.value !== f.defaultValue);
}

/**
 * Recarga automática al publicar una versión nueva. Cada minuto (y al volver a la pestaña) consulta
 * /api/version; si cambió, recarga en cuanto sea seguro para no perder trabajo:
 * - al cambiar de página, o
 * - cuando el agente no está escribiendo, no tiene un diálogo abierto, no hay nada guardándose, no
 *   hay campos con cambios sin guardar y lleva unos segundos sin tocar el panel.
 * Mientras tanto muestra un aviso con el botón "Actualizar ahora".
 */
export function VersionWatcher() {
  const pathname = usePathname();
  const [pending, setPending] = useState(false);
  const pendingPath = useRef<string | null>(null);
  const pendingVersion = useRef("");
  const lastInput = useRef(0);

  useEffect(() => {
    if (process.env.NODE_ENV !== "production") return;
    let stopped = false;

    const check = async () => {
      try {
        const res = await fetch(`/api/version?t=${Date.now()}`, { cache: "no-store" });
        if (!res.ok) return;
        const { version } = (await res.json()) as { version?: string };
        if (!stopped && version && version !== APP_VERSION && pendingPath.current === null) {
          pendingPath.current = window.location.pathname;
          pendingVersion.current = version;
          setPending(true);
        }
      } catch {
        // Sin conexión: se vuelve a intentar en la próxima revisión.
      }
    };

    const safeToReload = () => {
      if (pendingPath.current === null) return false;
      const active = document.activeElement as HTMLElement | null;
      if (active && (active.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(active.tagName))) return false;
      if (document.querySelector('dialog[open], [aria-busy="true"]')) return false;
      // Diálogos visibles (el menú lateral cerrado sigue en la página, pero oculto con aria-hidden).
      const modals = document.querySelectorAll('[role="dialog"][aria-modal="true"]');
      if ([...modals].some((el) => !el.closest('[aria-hidden="true"]'))) return false;
      if (hasDraft()) return false;
      if ((window.getSelection()?.toString() ?? "") !== "") return false;
      return document.visibilityState === "hidden" || Date.now() - lastInput.current > IDLE_MS;
    };

    const markInput = () => {
      lastInput.current = Date.now();
    };
    const onVisible = () => {
      if (document.visibilityState === "visible") void check();
    };

    const first = window.setTimeout(check, 10_000);
    const interval = window.setInterval(check, CHECK_MS);
    const safe = window.setInterval(() => {
      if (safeToReload()) autoReload(pendingVersion.current);
    }, SAFE_CHECK_MS);
    window.addEventListener("keydown", markInput, { passive: true });
    window.addEventListener("pointerdown", markInput, { passive: true });
    document.addEventListener("visibilitychange", onVisible);
    window.addEventListener("focus", onVisible);
    return () => {
      stopped = true;
      window.clearTimeout(first);
      window.clearInterval(interval);
      window.clearInterval(safe);
      window.removeEventListener("keydown", markInput);
      window.removeEventListener("pointerdown", markInput);
      document.removeEventListener("visibilitychange", onVisible);
      window.removeEventListener("focus", onVisible);
    };
  }, []);

  // Al cambiar de página con una versión nueva pendiente, se carga la página completa con el código nuevo.
  useEffect(() => {
    if (pending && pendingPath.current !== null && pathname !== pendingPath.current) autoReload(pendingVersion.current);
  }, [pathname, pending]);

  if (!pending) return null;

  return (
    <div className="pointer-events-none fixed inset-x-4 top-3 z-50 flex justify-center">
      <div
        role="status"
        className="pointer-events-auto flex items-center gap-3 rounded-full border border-border bg-white py-1.5 pr-1.5 pl-4 text-sm shadow-lg"
      >
        <span className="text-slate-700">Hay una versión nueva del panel.</span>
        <button
          type="button"
          onClick={() => window.location.reload()}
          className="rounded-full bg-primary px-3 py-1 text-sm font-medium text-white hover:bg-primary/90"
        >
          Actualizar ahora
        </button>
      </div>
    </div>
  );
}
