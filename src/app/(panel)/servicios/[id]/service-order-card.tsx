import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Badge } from "@/components/ui/badge";
import { Card, CardBody, CardHeader, DescriptionList } from "@/components/ui/card";
import type { Database } from "@/lib/database.types";
import { formatDateTime } from "@/lib/format";
import type { Tone } from "@/lib/labels";

export type ServiceOrder = Database["public"]["Tables"]["service_orders"]["Row"];

export const SERVICE_ORDER_STATUS: Record<string, { label: string; tone: Tone }> = {
  pending: { label: "Pendiente de aceptación", tone: "amber" },
  accepted: { label: "Aceptada", tone: "green" },
  void: { label: "Anulada", tone: "red" },
};

/**
 * Orden de servicio del experto: lo que Xpertos le encarga (trabajo, valor, comisión, neto, fechas y
 * obligaciones). Se genera al pasar a Pendiente de pago y se actualiza al quedar Programado o si el experto
 * cambia la periodicidad; el experto la acepta en su app antes de registrar jornadas.
 */
export function ServiceOrderCard({ order }: { order: ServiceOrder | null }) {
  const status = order ? SERVICE_ORDER_STATUS[order.status] : null;
  return (
    <Card>
      <CardHeader
        title="Orden de servicio del experto"
        description={
          order
            ? `Versión ${order.version} · actualizada el ${formatDateTime(order.updated_at)}`
            : "Se genera cuando el cliente elige la opción de la cotización."
        }
        action={status && <Badge tone={status.tone}>{status.label}</Badge>}
      />
      {order && (
        <CardBody className="space-y-4">
          <DescriptionList
            columns={3}
            items={[
              { label: "Estado", value: status?.label ?? order.status },
              { label: "Aceptada", value: order.accepted_at ? formatDateTime(order.accepted_at) : "—" },
              { label: "IP", value: order.accepted_ip ?? "—" },
            ]}
          />
          {order.status === "pending" && (
            <p className="text-sm text-slate-500">
              El experto debe aceptarla en su app; mientras tanto no puede registrar jornadas.
            </p>
          )}
          <details className="group rounded-xl border border-border">
            <summary className="cursor-pointer select-none px-4 py-2.5 text-sm font-medium text-primary">Ver texto de la orden</summary>
            <div className="markdown border-t border-border px-4 py-3 text-sm">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>{order.body_md}</ReactMarkdown>
            </div>
          </details>
        </CardBody>
      )}
    </Card>
  );
}
