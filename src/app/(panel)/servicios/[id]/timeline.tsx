import { formatCOP, formatDateTime } from "@/lib/format";
import { eventLabel, ROLE_LABEL, SERVICE_STATUS, type ServiceStatus, type UserRole } from "@/lib/labels";
import type { Json } from "@/lib/database.types";

export type TimelineEvent = {
  id: string;
  type: string;
  from_status: ServiceStatus | null;
  to_status: ServiceStatus | null;
  payload: Json;
  created_at: string;
  actor: { full_name: string; role: UserRole } | null;
};

function describe(event: TimelineEvent) {
  const payload = (event.payload ?? {}) as Record<string, unknown>;
  switch (event.type) {
    case "status_change": {
      if (!event.from_status || !event.to_status) return null;
      const transition = `${SERVICE_STATUS[event.from_status].label} → ${SERVICE_STATUS[event.to_status].label}`;
      return typeof payload.reason === "string" && payload.reason ? `${transition} · Motivo: ${payload.reason}` : transition;
    }
    case "assigned":
      return typeof payload.stages === "number" ? `${payload.stages} etapa(s) de pago definidas` : null;
    case "payment_submitted":
      return typeof payload.amount === "number" || typeof payload.amount === "string"
        ? `Monto ${formatCOP(payload.amount as number)}`
        : null;
    case "contract_created":
      return typeof payload.version === "number" ? `Versión ${payload.version}` : null;
    case "contract_signed":
      return typeof payload.signer_role === "string" ? `Firmó: ${ROLE_LABEL[payload.signer_role as UserRole] ?? payload.signer_role}` : null;
    case "review_created":
      return typeof payload.rating === "number" ? `Calificación ${payload.rating} / 5` : null;
    default:
      return null;
  }
}

const DOT: Record<string, string> = {
  status_change: "bg-slate-400",
  assigned: "bg-blue-500",
  payment_submitted: "bg-amber-500",
  payment_verified: "bg-emerald-500",
  payment_rejected: "bg-red-500",
  contract_created: "bg-primary",
  contract_signed: "bg-primary",
  review_created: "bg-accent",
};

export function Timeline({ events }: { events: TimelineEvent[] }) {
  if (events.length === 0) {
    return <p className="text-sm text-slate-500">Aún no hay eventos registrados para este servicio.</p>;
  }
  return (
    <ol className="relative space-y-5 border-l border-border pl-5">
      {events.map((event) => {
        const detail = describe(event);
        return (
          <li key={event.id} className="relative">
            <span
              aria-hidden
              className={`absolute -left-[1.45rem] top-1.5 h-2.5 w-2.5 rounded-full ring-4 ring-white ${DOT[event.type] ?? "bg-slate-400"}`}
            />
            <p className="text-sm font-medium">{eventLabel(event.type)}</p>
            {detail && <p className="text-sm text-slate-600">{detail}</p>}
            <p className="mt-0.5 text-xs text-slate-500">
              {formatDateTime(event.created_at)} ·{" "}
              {event.actor ? `${event.actor.full_name || "Usuario"} (${ROLE_LABEL[event.actor.role]})` : "Sistema"}
            </p>
          </li>
        );
      })}
    </ol>
  );
}
