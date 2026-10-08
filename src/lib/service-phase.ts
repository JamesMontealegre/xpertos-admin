import type { ServiceStatus, StageStatus, Tone } from "./labels";

/**
 * Etapa operativa de un servicio, la que ve el operador en la barra de avance.
 * Se deduce del estado en la base y del pago de la primera etapa (anticipo):
 *
 *   requested / in_review         → Cotización
 *   assigned, anticipo sin pagar  → Pendiente de pago
 *   assigned, anticipo pagado     → Planeación
 *   in_progress                   → En ejecución   ┐ mismo paso de la barra:
 *   paused                        → En pausa       ┘ uno o el otro
 *   completed                     → Finalizado
 */
export type ServicePhase = "quote" | "payment" | "planning" | "execution" | "paused" | "done" | "cancelled";

export type PhaseStep = { key: "quote" | "payment" | "planning" | "execution" | "done"; label: string; hint: string };

export const PHASE_STEPS: PhaseStep[] = [
  { key: "quote", label: "Cotización", hint: "Asignar experto, precio y etapas de pago" },
  { key: "payment", label: "Pendiente de pago", hint: "Esperando el pago del anticipo" },
  { key: "planning", label: "Planeación", hint: "Contrato firmado y agenda antes de iniciar" },
  { key: "execution", label: "En ejecución", hint: "El experto está trabajando" },
  { key: "done", label: "Finalizado", hint: "Servicio terminado" },
];

export const PHASE_INFO: Record<ServicePhase, { label: string; tone: Tone }> = {
  quote: { label: "Cotización", tone: "slate" },
  payment: { label: "Pendiente de pago", tone: "orange" },
  planning: { label: "Planeación", tone: "blue" },
  execution: { label: "En ejecución", tone: "teal" },
  paused: { label: "En pausa", tone: "amber" },
  done: { label: "Finalizado", tone: "green" },
  cancelled: { label: "Cancelado", tone: "red" },
};

/** Orden de los filtros del listado. */
export const PHASE_FILTER_ORDER: ServicePhase[] = ["quote", "payment", "planning", "execution", "paused", "done", "cancelled"];

export function isServicePhase(value: string): value is ServicePhase {
  return (PHASE_FILTER_ORDER as string[]).includes(value);
}

type StageLike = { position: number; status: StageStatus };

export function firstStagePaid(stages: StageLike[]): boolean {
  const first = [...stages].sort((a, b) => a.position - b.position)[0];
  return first?.status === "paid";
}

/** Etapa de un servicio a partir de su estado; `cancelled` solo si el estado es cancelado. */
export function servicePhase(status: ServiceStatus, stages: StageLike[]): ServicePhase {
  switch (status) {
    case "requested":
    case "in_review":
      return "quote";
    case "assigned":
      return firstStagePaid(stages) ? "planning" : "payment";
    case "in_progress":
      return "execution";
    case "paused":
      return "paused";
    case "completed":
      return "done";
    case "cancelled":
      return "cancelled";
  }
}

/** Índice del paso de la barra (En pausa comparte el paso de En ejecución). -1 si no aplica. */
export function phaseStepIndex(phase: ServicePhase): number {
  if (phase === "paused") return PHASE_STEPS.findIndex((s) => s.key === "execution");
  return PHASE_STEPS.findIndex((s) => s.key === phase);
}
