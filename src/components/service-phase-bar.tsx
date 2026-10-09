import { cn } from "@/components/ui/cn";
import { SERVICE_STATUS, type ServiceStatus } from "@/lib/labels";
import { FLOW, FLOW_LABEL, flowIndex } from "@/lib/service-phase";

type StepState = "done" | "current" | "paused" | "cancelled" | "upcoming";

function stepStates(status: ServiceStatus, cancelledFrom?: ServiceStatus | null): StepState[] {
  if (status === "cancelled") {
    const reached = Math.max(cancelledFrom ? flowIndex(cancelledFrom) : 0, 0);
    return FLOW.map((_, i) => (i < reached ? "done" : i === reached ? "cancelled" : "upcoming"));
  }
  const current = flowIndex(status);
  return FLOW.map((_, i) => {
    if (status === "completed") return "done";
    if (i < current) return "done";
    if (i === current) return status === "paused" ? "paused" : "current";
    return "upcoming";
  });
}

const CheckIcon = () => (
  <svg viewBox="0 0 20 20" fill="currentColor" className="size-4" aria-hidden>
    <path fillRule="evenodd" d="M16.7 5.3a1 1 0 0 1 0 1.4l-8 8a1 1 0 0 1-1.4 0l-4-4a1 1 0 1 1 1.4-1.4L8 12.6l7.3-7.3a1 1 0 0 1 1.4 0Z" clipRule="evenodd" />
  </svg>
);
const PauseIcon = () => (
  <svg viewBox="0 0 20 20" fill="currentColor" className="size-4" aria-hidden>
    <path d="M6 4h3v12H6zM11 4h3v12h-3z" />
  </svg>
);
const CrossIcon = () => (
  <svg viewBox="0 0 20 20" fill="currentColor" className="size-4" aria-hidden>
    <path d="M5.3 5.3a1 1 0 0 1 1.4 0L10 8.6l3.3-3.3a1 1 0 1 1 1.4 1.4L11.4 10l3.3 3.3a1 1 0 0 1-1.4 1.4L10 11.4l-3.3 3.3a1 1 0 0 1-1.4-1.4L8.6 10 5.3 6.7a1 1 0 0 1 0-1.4Z" />
  </svg>
);

/**
 * Barra con los 8 pasos del servicio: Solicitado → Asignado → En cotización → Pendiente de pago →
 * Programado → En ejecución (o En pausa, según decida el admin) → En observación → Finalizado. Bajo el paso actual se muestra
 * una ayuda corta (`hint`). Un servicio cancelado lleva una X roja en el paso donde se canceló.
 */
export function ServicePhaseBar({
  status,
  cancelledFrom,
  hint,
}: {
  status: ServiceStatus;
  /** Para un servicio cancelado: estado que tenía al cancelarse (`from_status` del evento). */
  cancelledFrom?: ServiceStatus | null;
  /** Ayuda bajo el paso actual (p. ej. "Inicia el 16 oct · faltan 5 días hábiles"). */
  hint?: string | null;
}) {
  const states = stepStates(status, cancelledFrom);

  return (
    // Celular: lista vertical. Desde sm: barra horizontal de 8 pasos (con scroll si no cabe).
    <div className="sm:-mx-1 sm:overflow-x-auto sm:pt-4 sm:pb-1">
      <ol className="flex flex-col pt-1 sm:grid sm:min-w-[34rem] sm:grid-cols-8 sm:pt-0" aria-label="Avance del servicio">
        {FLOW.map((step, i) => {
          const state = states[i];
          const next = states[i + 1];
          const isExecutionStep = step === "in_progress";
          const label = isExecutionStep && state === "paused" ? "En pausa" : FLOW_LABEL[step];
          const active = state === "current" || state === "paused" || state === "cancelled";
          const isLastDone = status === "completed" && i === FLOW.length - 1;
          const note = state === "cancelled" ? hint || "Cancelado en este paso" : active || isLastDone ? hint : null;
          const reached = (s: StepState | undefined) => s !== undefined && s !== "upcoming" && s !== "cancelled";

          return (
            <li
              key={step}
              className="relative flex items-start gap-3 pb-4 last:pb-0 sm:flex-col sm:items-center sm:gap-0 sm:px-1 sm:pb-0 sm:text-center"
              aria-current={active ? "step" : undefined}
            >
              {/* Línea hacia el paso anterior (horizontal, desde sm). */}
              {i > 0 && (
                <span
                  aria-hidden
                  className={cn(
                    "absolute right-1/2 top-4 hidden h-0.5 w-full -translate-y-1/2 sm:block",
                    reached(state) ? "bg-primary" : "bg-slate-200",
                  )}
                />
              )}
              {/* Línea hacia el paso siguiente (vertical, en celular). */}
              {i < FLOW.length - 1 && (
                <span
                  aria-hidden
                  className={cn("absolute bottom-0 left-4 top-8 w-0.5 -translate-x-1/2 sm:hidden", reached(next) ? "bg-primary" : "bg-slate-200")}
                />
              )}
              {(state === "current" || state === "paused") && (
                <span
                  aria-hidden
                  className={cn(
                    "step-pulse absolute top-0 left-0 z-0 size-8 rounded-full sm:left-1/2 sm:-ml-4",
                    state === "current" ? "bg-primary" : "bg-amber-500",
                  )}
                />
              )}
              <span
                className={cn(
                  "relative z-10 flex size-8 shrink-0 items-center justify-center rounded-full text-sm font-semibold",
                  (state === "current" || state === "paused") && "step-beat",
                  state === "done" && "bg-primary text-white",
                  state === "current" && "bg-primary text-white ring-4 ring-primary/20",
                  state === "paused" && "bg-amber-500 text-white ring-4 ring-amber-200",
                  state === "cancelled" && "bg-red-600 text-white ring-4 ring-red-100",
                  state === "upcoming" && "border-2 border-slate-300 bg-white text-slate-400",
                )}
              >
                {state === "done" ? <CheckIcon /> : state === "paused" ? <PauseIcon /> : state === "cancelled" ? <CrossIcon /> : i + 1}
              </span>
              <span className="flex min-w-0 flex-col pt-1.5 sm:items-center sm:pt-0">
                <span
                  className={cn(
                    "text-sm font-medium leading-tight sm:mt-2 sm:text-xs xl:text-sm",
                    state === "upcoming" ? "text-slate-400" : "text-slate-800",
                    state === "current" && "text-primary",
                    state === "paused" && "text-amber-700",
                    state === "cancelled" && "text-red-700",
                  )}
                >
                  {label}
                </span>
                {note && (
                  <span
                    className={cn(
                      "mt-1 text-xs leading-snug sm:max-w-[9.5rem]",
                      state === "paused" ? "text-amber-700" : state === "cancelled" ? "text-red-700" : "text-slate-500",
                    )}
                  >
                    {note}
                  </span>
                )}
              </span>
            </li>
          );
        })}
      </ol>
    </div>
  );
}

/** Versión compacta para tablas: ocho segmentos y el nombre del estado actual. */
export function ServicePhaseBarCompact({ status }: { status: ServiceStatus }) {
  const states = stepStates(status, null);
  const info = SERVICE_STATUS[status];

  return (
    <div className="min-w-[9rem]" title={`Estado: ${info.label}`}>
      <div className="flex gap-0.5" aria-hidden>
        {FLOW.map((step, i) => (
          <span
            key={step}
            className={cn(
              "h-1.5 flex-1 rounded-full",
              status === "cancelled" ? "bg-red-200" : states[i] === "upcoming" ? "bg-slate-200" : "bg-primary",
              states[i] === "paused" && "bg-amber-500",
            )}
          />
        ))}
      </div>
      <p
        className={cn(
          "mt-1 text-xs font-medium",
          status === "paused" ? "text-amber-700" : status === "cancelled" ? "text-red-700" : "text-slate-700",
        )}
      >
        {info.label}
      </p>
    </div>
  );
}
