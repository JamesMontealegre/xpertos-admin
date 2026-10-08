import type { ServiceStatus } from "./labels";

/**
 * Pasos de la barra de avance del servicio. Cada estado de la base es un paso, salvo
 * En pausa, que comparte el paso de En ejecución (el servicio está en uno o en el otro),
 * y Cancelado, que se marca con una X en el paso donde se canceló.
 *
 *   requested → assigned → quoting → pending_payment → scheduled → in_progress ⇄ paused
 *             → under_review → completed
 */
export type FlowStatus = Exclude<ServiceStatus, "paused" | "cancelled">;

export const FLOW: FlowStatus[] = [
  "requested",
  "assigned",
  "quoting",
  "pending_payment",
  "scheduled",
  "in_progress",
  "under_review",
  "completed",
];

export const FLOW_LABEL: Record<FlowStatus, string> = {
  requested: "Solicitado",
  assigned: "Asignado",
  quoting: "En cotización",
  pending_payment: "Pendiente de pago",
  scheduled: "Programado",
  in_progress: "En ejecución",
  under_review: "En observación",
  completed: "Finalizado",
};

/** Paso de la barra para un estado (En pausa = paso de En ejecución). -1 para Cancelado. */
export function flowIndex(status: ServiceStatus): number {
  if (status === "paused") return FLOW.indexOf("in_progress");
  if (status === "cancelled") return -1;
  return FLOW.indexOf(status);
}

/** Siguiente paso del flujo; null si el servicio está pausado, cancelado o finalizado. */
export function nextStatus(status: ServiceStatus): FlowStatus | null {
  if (status === "paused" || status === "cancelled") return null;
  return FLOW[FLOW.indexOf(status) + 1] ?? null;
}

/** Paso anterior del flujo; null si el servicio está pausado, cancelado o recién solicitado. */
export function previousStatus(status: ServiceStatus): FlowStatus | null {
  if (status === "paused" || status === "cancelled") return null;
  return FLOW[FLOW.indexOf(status) - 1] ?? null;
}

/** Estados desde los que existe el contrato de inicio (pago verificado). */
export const STARTED_STATUSES: ServiceStatus[] = ["scheduled", "in_progress", "paused", "under_review", "completed"];

/** Estados en los que el experto ya está (o estuvo) trabajando: se muestran las jornadas. */
export const WORK_STATUSES: ServiceStatus[] = ["in_progress", "paused", "under_review", "completed"];
