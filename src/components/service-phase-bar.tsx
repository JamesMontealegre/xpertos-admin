import { cn } from "@/components/ui/cn";
import { PHASE_INFO, PHASE_STEPS, phaseStepIndex, type ServicePhase } from "@/lib/service-phase";

type Props = {
  phase: ServicePhase;
  /** Para un servicio cancelado: etapa en la que estaba cuando se canceló. */
  cancelledAt?: ServicePhase | null;
  /** Texto bajo el paso actual (p. ej. el motivo de la pausa). Por defecto, la ayuda del paso. */
  note?: string | null;
};

type StepState = "done" | "current" | "paused" | "cancelled" | "upcoming";

function stepStates(phase: ServicePhase, cancelledAt?: ServicePhase | null): StepState[] {
  if (phase === "cancelled") {
    const reached = cancelledAt ? phaseStepIndex(cancelledAt) : 0;
    return PHASE_STEPS.map((_, i) => (i < reached ? "done" : i === reached ? "cancelled" : "upcoming"));
  }
  const current = phaseStepIndex(phase);
  return PHASE_STEPS.map((_, i) => {
    if (phase === "done") return "done";
    if (i < current) return "done";
    if (i === current) return phase === "paused" ? "paused" : "current";
    return "upcoming";
  });
}

/** Barra con todas las etapas del servicio: Cotización → Pendiente de pago → Planeación → En ejecución / En pausa → Finalizado. */
export function ServicePhaseBar({ phase, cancelledAt, note }: Props) {
  const states = stepStates(phase, cancelledAt);

  return (
    <ol className="grid grid-cols-5" aria-label="Avance del servicio">
      {PHASE_STEPS.map((step, i) => {
        const state = states[i];
        const isExecutionStep = step.key === "execution";
        const label = isExecutionStep && state === "paused" ? "En pausa" : step.label;
        const active = state === "current" || state === "paused" || state === "cancelled";
        const hint = state === "cancelled" ? "Cancelado en esta etapa" : active ? note || step.hint : null;

        return (
          <li key={step.key} className="relative flex flex-col items-center px-1 text-center" aria-current={active ? "step" : undefined}>
            {i > 0 && (
              <span
                aria-hidden
                className={cn(
                  "absolute right-1/2 top-4 h-0.5 w-full -translate-y-1/2",
                  state === "upcoming" || state === "cancelled" ? "bg-slate-200" : "bg-primary",
                )}
              />
            )}
            <span
              className={cn(
                "relative z-10 flex size-8 items-center justify-center rounded-full text-sm font-semibold",
                state === "done" && "bg-primary text-white",
                state === "current" && "bg-primary text-white ring-4 ring-primary/20",
                state === "paused" && "bg-amber-500 text-white ring-4 ring-amber-200",
                state === "cancelled" && "bg-red-600 text-white ring-4 ring-red-100",
                state === "upcoming" && "border-2 border-slate-300 bg-white text-slate-400",
              )}
            >
              {state === "done" ? (
                <svg viewBox="0 0 20 20" fill="currentColor" className="size-4" aria-hidden>
                  <path fillRule="evenodd" d="M16.7 5.3a1 1 0 0 1 0 1.4l-8 8a1 1 0 0 1-1.4 0l-4-4a1 1 0 1 1 1.4-1.4L8 12.6l7.3-7.3a1 1 0 0 1 1.4 0Z" clipRule="evenodd" />
                </svg>
              ) : state === "paused" ? (
                <svg viewBox="0 0 20 20" fill="currentColor" className="size-4" aria-hidden>
                  <path d="M6 4h3v12H6zM11 4h3v12h-3z" />
                </svg>
              ) : state === "cancelled" ? (
                <svg viewBox="0 0 20 20" fill="currentColor" className="size-4" aria-hidden>
                  <path d="M5.3 5.3a1 1 0 0 1 1.4 0L10 8.6l3.3-3.3a1 1 0 1 1 1.4 1.4L11.4 10l3.3 3.3a1 1 0 0 1-1.4 1.4L10 11.4l-3.3 3.3a1 1 0 0 1-1.4-1.4L8.6 10 5.3 6.7a1 1 0 0 1 0-1.4Z" />
                </svg>
              ) : (
                i + 1
              )}
            </span>
            <span
              className={cn(
                "mt-2 text-xs font-medium sm:text-sm",
                state === "upcoming" ? "text-slate-400" : "text-slate-800",
                state === "paused" && "text-amber-700",
                state === "cancelled" && "text-red-700",
              )}
            >
              {label}
              {isExecutionStep && state === "upcoming" && <span className="block text-[11px] font-normal text-slate-400">o En pausa</span>}
            </span>
            {hint && <span className="mt-0.5 hidden max-w-[12rem] text-xs text-slate-500 sm:block">{hint}</span>}
          </li>
        );
      })}
    </ol>
  );
}

/** Versión compacta para tablas: cinco segmentos y el nombre de la etapa actual. */
export function ServicePhaseBarCompact({ phase }: { phase: ServicePhase }) {
  const states = stepStates(phase, null);
  const info = PHASE_INFO[phase];

  return (
    <div className="min-w-[9rem]" title={`Etapa: ${info.label}`}>
      <div className="flex gap-1" aria-hidden>
        {PHASE_STEPS.map((step, i) => (
          <span
            key={step.key}
            className={cn(
              "h-1.5 flex-1 rounded-full",
              phase === "cancelled" ? "bg-red-200" : states[i] === "upcoming" ? "bg-slate-200" : "bg-primary",
              states[i] === "paused" && "bg-amber-500",
            )}
          />
        ))}
      </div>
      <p
        className={cn(
          "mt-1 text-xs font-medium",
          phase === "paused" ? "text-amber-700" : phase === "cancelled" ? "text-red-700" : "text-slate-700",
        )}
      >
        {info.label}
      </p>
    </div>
  );
}
