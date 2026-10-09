"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { CloseIcon } from "@/components/icons";
import { createClient } from "@/lib/supabase/client";

/** Respaldo por si se cae la conexión en tiempo real: cada minuto se pide actualizar. */
const POLL_MS = 60_000;
/** Cada cuánto se revisa si el agente está libre para aplicar una actualización pendiente. */
const CHECK_MS = 3_000;
/** Tiempo sin teclear ni hacer clic para considerar que el agente terminó lo que hacía. */
const IDLE_MS = 4_000;
const TOAST_MS = 10_000;

type Toast = { id: string; name: string; city: string | null };

/** Páginas cuyos datos dependen de las postulaciones. */
const isApplicationsPage = (path: string) => path === "/" || path.startsWith("/solicitudes");

/**
 * Actualización en vivo del panel:
 * - Tiempo real (Supabase): una postulación nueva muestra un aviso con enlace, en cualquier página;
 *   cambios en postulaciones o documentos marcan las páginas de solicitudes para actualizar.
 * - Respaldo: cada minuto se actualizan las páginas de solicitudes.
 *
 * La actualización (router.refresh) conserva el scroll y lo abierto, y además espera a que el agente
 * esté libre: sin escribir en un campo, sin diálogos abiertos, sin acciones guardándose, sin texto
 * seleccionado y sin teclear ni hacer clic en los últimos segundos. Con la pestaña oculta tampoco se
 * actualiza; se hace al volver.
 */
export function LiveUpdates() {
  const router = useRouter();
  const pathname = usePathname();
  const [toasts, setToasts] = useState<Toast[]>([]);
  const pathRef = useRef(pathname);
  const pendingRef = useRef(false);
  const lastInputRef = useRef(0);
  const unseenRef = useRef(0);

  useEffect(() => {
    pathRef.current = pathname;
    pendingRef.current = false; // la página recién cargada ya trae datos frescos
  }, [pathname]);

  useEffect(() => {
    const markInput = () => {
      lastInputRef.current = Date.now();
    };

    const agentBusy = () => {
      if (document.visibilityState !== "visible") return true;
      const active = document.activeElement as HTMLElement | null;
      if (active && (active.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(active.tagName))) return true;
      if (document.querySelector("dialog[open]")) return true;
      const modals = document.querySelectorAll('[role="dialog"][aria-modal="true"]');
      if ([...modals].some((el) => !el.closest('[aria-hidden="true"]'))) return true;
      if (document.querySelector('[aria-busy="true"]')) return true;
      if ((window.getSelection()?.toString() ?? "") !== "") return true;
      return Date.now() - lastInputRef.current < IDLE_MS;
    };

    const requestRefresh = () => {
      if (isApplicationsPage(pathRef.current)) pendingRef.current = true;
    };

    const check = window.setInterval(() => {
      if (pendingRef.current && !agentBusy()) {
        pendingRef.current = false;
        router.refresh();
      }
    }, CHECK_MS);
    const poll = window.setInterval(requestRefresh, POLL_MS);

    const baseTitle = () => document.title.replace(/^\(\d+\)\s*/, "");
    const onVisibility = () => {
      if (document.visibilityState === "visible") {
        unseenRef.current = 0;
        document.title = baseTitle();
        requestRefresh();
      }
    };

    // Primero la sesión del agente y luego la suscripción: sin el token, Realtime suscribe como anónimo
    // y las reglas de la base (RLS) no le envían ninguna postulación.
    const supabase = createClient();
    let channel: ReturnType<typeof supabase.channel> | null = null;
    let cancelled = false;
    void (async () => {
      const { data } = await supabase.auth.getSession();
      if (cancelled || !data.session) return;
      await supabase.realtime.setAuth(data.session.access_token);
      if (cancelled) return;
      channel = supabase
        .channel("panel-solicitudes")
        .on("postgres_changes", { event: "INSERT", schema: "public", table: "expert_applications" }, (payload) => {
          const row = payload.new as { id: string; full_name?: string; city?: string | null };
          setToasts((list) => [...list.slice(-2), { id: row.id, name: row.full_name || "Aspirante", city: row.city ?? null }]);
          window.setTimeout(() => setToasts((list) => list.filter((t) => t.id !== row.id)), TOAST_MS);
          if (document.visibilityState !== "visible") {
            unseenRef.current += 1;
            document.title = `(${unseenRef.current}) ${baseTitle()}`;
          }
          requestRefresh();
        })
        .on("postgres_changes", { event: "UPDATE", schema: "public", table: "expert_applications" }, requestRefresh)
        .on("postgres_changes", { event: "*", schema: "public", table: "application_documents" }, requestRefresh)
        .subscribe();
    })();

    window.addEventListener("keydown", markInput, { passive: true });
    window.addEventListener("pointerdown", markInput, { passive: true });
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      window.clearInterval(check);
      window.clearInterval(poll);
      window.removeEventListener("keydown", markInput);
      window.removeEventListener("pointerdown", markInput);
      document.removeEventListener("visibilitychange", onVisibility);
      cancelled = true;
      if (channel) void supabase.removeChannel(channel);
    };
  }, [router]);

  if (toasts.length === 0) return null;

  return (
    <div className="pointer-events-none fixed inset-x-4 bottom-4 z-50 flex flex-col items-end gap-2 sm:inset-x-auto sm:right-6 sm:bottom-6">
      {toasts.map((t) => (
        <div
          key={t.id}
          role="status"
          aria-live="polite"
          className="pointer-events-auto flex w-full max-w-sm items-start gap-3 rounded-xl border border-border bg-white p-4 shadow-lg"
        >
          <span className="mt-1 size-2.5 shrink-0 rounded-full bg-accent" aria-hidden />
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold text-foreground">Nueva postulación</p>
            <p className="truncate text-sm text-slate-600">
              {t.name}
              {t.city ? ` · ${t.city}` : ""}
            </p>
            <Link
              href={`/solicitudes/${t.id}`}
              onClick={() => setToasts((list) => list.filter((x) => x.id !== t.id))}
              className="mt-1 inline-block text-sm font-medium text-primary hover:underline"
            >
              Ver postulación
            </Link>
          </div>
          <button
            type="button"
            onClick={() => setToasts((list) => list.filter((x) => x.id !== t.id))}
            aria-label="Cerrar aviso"
            className="rounded-md p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
          >
            <CloseIcon className="size-4" />
          </button>
        </div>
      ))}
    </div>
  );
}
