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
 * Programado → En ejecución / En pausa → En observación → Finalizado. Bajo el paso actual se muestra
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
    <div className="-mx-1 overflow-x-auto pb-1">
      <ol className="grid min-w-[34rem] grid-cols-8" aria-label="Avance del servicio">
        {FLOW.map((step, i) => {
          const state = states[i];
          const isExecutionStep = step === "in_progress";
          const label = isExecutionStep && state === "paused" ? "En pausa" : FLOW_LABEL[step];
          const active = state === "current" || state === "paused" || state === "cancelled";
          const isLastDone = status === "completed" && i === FLOW.length - 1;
          const note = state === "cancelled" ? hint || "Cancelado en este paso" : active || isLastDone ? hint : null;

          return (
            <li key={step} className="relative flex flex-col items-center px-1 text-center" aria-current={active ? "step" : undefined}>
              {i > 0 && (
                <span
                  aria-hidden
                  className={cn(
                    "absolute right-1/2 top-4 h-0.5 w-full -translate-y-1/2",
                    state === "upcoming" || state === "cancelled" ? "bg-slate-200" : "bg-primary",
                  )}
                />
              )}
              {(state === "current" || state === "paused") && (
                <span
                  aria-hidden
                  className={cn(
                    "step-pulse absolute top-0 left-1/2 z-0 -ml-4 size-8 rounded-full",
                    state === "current" ? "bg-primary" : "bg-amber-500",
                  )}
                />
              )}
              <span
                className={cn(
                  "relative z-10 flex size-8 items-center justify-center rounded-full text-sm font-semibold",
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
              <span
                className={cn(
                  "mt-2 text-xs font-medium leading-tight xl:text-sm",
                  state === "upcoming" ? "text-slate-400" : "text-slate-800",
                  state === "current" && "text-primary",
                  state === "paused" && "text-amber-700",
                  state === "cancelled" && "text-red-700",
                )}
              >
                {label}
                {isExecutionStep && state === "upcoming" && (
                  <span className="block text-[11px] font-normal text-slate-400">o En pausa</span>
                )}
              </span>
              {note && (
                <span
                  className={cn(
                    "mt-1 max-w-[9.5rem] text-xs leading-snug",
                    state === "paused" ? "text-amber-700" : state === "cancelled" ? "text-red-700" : "text-slate-500",
                  )}
                >
                  {note}
                </span>
              )}
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
