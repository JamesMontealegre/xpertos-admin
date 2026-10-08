import { Alert } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Card, CardBody, CardHeader, DescriptionList } from "@/components/ui/card";
import { ActionDialog } from "@/components/ui/dialog";
import { Field, Textarea } from "@/components/ui/input";
import { PhotoGrid, type PhotoItem } from "@/components/ui/photo-grid";
import { EmptyRow, Table, TBody, Td, THead, Tr } from "@/components/ui/table";
import type { Database } from "@/lib/database.types";
import { businessDaysLabel, formatCOP, formatDateTime } from "@/lib/format";
import { PRICING_MODE, QUOTE_STATUS, type ServiceStatus } from "@/lib/labels";
import { returnQuote } from "../actions";
import { QuoteReviewForm } from "./quote-review-form";

type QuoteRow = Database["public"]["Tables"]["service_quotes"]["Row"];
type ItemRow = Database["public"]["Tables"]["quote_items"]["Row"];
type MaterialRow = Database["public"]["Tables"]["quote_materials"]["Row"];

export type QuoteWithLines = QuoteRow & { items: ItemRow[]; materials: MaterialRow[] };

const qty = new Intl.NumberFormat("es-CO", { maximumFractionDigits: 2 });

/** Neto estimado del experto: mano de obra aprobada menos comisión, más materiales si es todo incluido. */
export function expertNetEstimate(quote: QuoteRow | null, commissionPct: number) {
  if (!quote || quote.approved_labor_total == null) return null;
  const labor = Number(quote.approved_labor_total);
  const materials = quote.pricing_mode === "all_inclusive" ? Number(quote.materials_total) : 0;
  return Math.round(labor * (1 - commissionPct / 100) + materials);
}

/**
 * Cotización del experto. En "En cotización" incluye la evaluación del admin (aprobar o devolver);
 * en estados posteriores se ve en modo lectura con los valores aprobados.
 */
export function QuoteCard({
  serviceId,
  status,
  quote,
  beforePhotos,
  commissionPct,
}: {
  serviceId: string;
  status: ServiceStatus;
  quote: QuoteWithLines | null;
  beforePhotos: PhotoItem[];
  commissionPct: number;
}) {
  if (!quote) {
    return (
      <Card>
        <div id="cotizacion" className="scroll-mt-6" />
        <CardHeader title="Cotización del experto" />
        <CardBody>
          <p className="text-sm text-slate-500">
            {status === "assigned"
              ? "El experto aún no ha empezado la cotización. La armará desde su app con actividades, materiales y fotos del antes."
              : "Este servicio no tiene cotización."}
          </p>
        </CardBody>
      </Card>
    );
  }

  const items = [...quote.items].sort((a, b) => a.position - b.position);
  const materials = [...quote.materials].sort((a, b) => a.position - b.position);
  const itemsTotal = items.reduce((acc, i) => acc + Number(i.line_total ?? 0), 0);
  const laborTotal = quote.status === "draft" || quote.status === "returned" ? itemsTotal : Number(quote.labor_total);
  const estimatedMaterials = materials.some((m) => m.estimated_cost != null)
    ? materials.reduce((acc, m) => acc + Number(m.estimated_cost ?? 0), 0)
    : null;
  const allInclusive = quote.pricing_mode === "all_inclusive";
  const evaluating = status === "quoting" && quote.status === "submitted";
  const net = expertNetEstimate(quote, commissionPct);
  const statusInfo = QUOTE_STATUS[quote.status];

  return (
    <Card>
      <div id="cotizacion" className="scroll-mt-6" />
      <CardHeader
        title={evaluating ? "Evaluación de la cotización" : "Cotización del experto"}
        description={
          quote.submitted_at
            ? `Enviada el ${formatDateTime(quote.submitted_at)}${quote.reviewed_at ? ` · revisada el ${formatDateTime(quote.reviewed_at)}` : ""}`
            : "El experto aún no la envía."
        }
        action={<Badge tone={statusInfo.tone}>{statusInfo.label}</Badge>}
      />
      <CardBody className="space-y-5">
        {quote.status === "draft" && (
          <Alert tone="info">El experto está preparando la cotización. La podrás evaluar cuando la envíe desde su app.</Alert>
        )}
        {quote.status === "returned" && (
          <Alert tone="warning">
            <span className="font-medium">Devuelta al experto para corregir.</span>
            {quote.admin_notes && <span className="block">Motivo: {quote.admin_notes}</span>}
          </Alert>
        )}

        <DescriptionList
          columns={3}
          items={[
            { label: "Modalidad", value: PRICING_MODE[quote.pricing_mode].label },
            {
              label: "Duración estimada",
              value: quote.estimated_days ? businessDaysLabel(quote.estimated_days) : "Sin indicar",
            },
            { label: "Mano de obra del experto", value: <span className="font-semibold">{formatCOP(laborTotal)}</span> },
          ]}
        />

        {quote.notes && (
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Notas del experto</p>
            <p className="mt-1 whitespace-pre-line text-sm leading-relaxed">{quote.notes}</p>
          </div>
        )}

        <div>
          <p className="mb-2 text-xs font-medium uppercase tracking-wide text-slate-500">Actividades</p>
          <div className="overflow-hidden rounded-xl border border-border">
            <Table>
              <THead columns={["#", "Descripción", "Medidas", "Cantidad", "Valor unitario", "Subtotal"]} />
              <TBody>
                {items.length === 0 && <EmptyRow colSpan={6}>Sin actividades.</EmptyRow>}
                {items.map((item, i) => (
                  <Tr key={item.id} className="hover:bg-transparent">
                    <Td className="text-slate-500">{i + 1}</Td>
                    <Td>{item.description}</Td>
                    <Td className="text-slate-600">{item.measurement || "—"}</Td>
                    <Td className="whitespace-nowrap">
                      {qty.format(Number(item.quantity))} {item.unit}
                    </Td>
                    <Td className="whitespace-nowrap">{formatCOP(item.unit_price)}</Td>
                    <Td className="whitespace-nowrap font-medium">{formatCOP(item.line_total)}</Td>
                  </Tr>
                ))}
                {items.length > 0 && (
                  <tr className="bg-slate-50">
                    <td colSpan={5} className="px-4 py-2.5 text-right text-sm font-medium">
                      Total mano de obra
                    </td>
                    <td className="px-4 py-2.5 text-sm font-semibold whitespace-nowrap">{formatCOP(itemsTotal)}</td>
                  </tr>
                )}
              </TBody>
            </Table>
          </div>
        </div>

        <div>
          <p className="mb-2 text-xs font-medium uppercase tracking-wide text-slate-500">
            Materiales{" "}
            <span className="normal-case tracking-normal text-slate-400">
              · {allInclusive ? "los suministra el experto (todo incluido)" : "los suministra el cliente"}
            </span>
          </p>
          {materials.length === 0 ? (
            <p className="text-sm text-slate-500">Sin materiales listados.</p>
          ) : (
            <ul className="divide-y divide-border rounded-xl border border-border text-sm">
              {materials.map((m) => (
                <li key={m.id} className="flex flex-wrap items-baseline justify-between gap-2 px-4 py-2">
                  <span>
                    <span className="font-medium">{m.name}</span>
                    <span className="text-slate-500">
                      {" "}
                      · {qty.format(Number(m.quantity))} {m.unit}
                    </span>
                    {m.notes && <span className="block text-xs text-slate-500">{m.notes}</span>}
                  </span>
                  <span className="text-slate-600">
                    {m.estimated_cost != null ? `Costo estimado ${formatCOP(m.estimated_cost)}` : "Sin costo estimado"}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div>
          <p className="mb-2 text-xs font-medium uppercase tracking-wide text-slate-500">Fotos del antes</p>
          <PhotoGrid photos={beforePhotos} empty="El experto no ha subido fotos del antes." />
        </div>

        {evaluating && (
          <div className="space-y-3 border-t border-border pt-5">
            <QuoteReviewForm
              serviceId={serviceId}
              pricingMode={quote.pricing_mode}
              laborTotal={Number(quote.labor_total)}
              commissionPct={commissionPct}
              materialsEstimate={estimatedMaterials}
            />
            <div className="flex flex-wrap items-center justify-end gap-2 text-sm text-slate-500">
              <span>¿Algo por corregir?</span>
              <ActionDialog
                triggerLabel="Devolver al experto"
                triggerVariant="danger"
                title="Devolver la cotización"
                description="El servicio vuelve a Asignado y el experto verá el motivo para corregir y enviar de nuevo."
                action={returnQuote}
                fields={{ service_id: serviceId }}
                submitLabel="Devolver al experto"
                submitVariant="danger"
                pendingLabel="Devolviendo…"
              >
                <Field label="Qué debe corregir" htmlFor="return-notes">
                  <Textarea
                    id="return-notes"
                    name="notes"
                    required
                    minLength={5}
                    placeholder="Ej.: separa el resane de la pintura y agrega fotos del techo."
                  />
                </Field>
              </ActionDialog>
            </div>
          </div>
        )}

        {quote.status === "approved" && (
          <div className="border-t border-border pt-5">
            <p className="mb-3 text-xs font-medium uppercase tracking-wide text-slate-500">Valores aprobados</p>
            <DescriptionList
              columns={3}
              items={[
                { label: "Mano de obra aprobada", value: formatCOP(quote.approved_labor_total) },
                { label: "Materiales", value: allInclusive ? formatCOP(quote.materials_total) : "No aplica" },
                { label: "Total del cliente", value: <span className="font-semibold text-primary">{formatCOP(quote.total)}</span> },
                { label: "Comisión", value: `${commissionPct} %` },
                { label: "Neto estimado del experto", value: formatCOP(net) },
                { label: "Aprobada", value: formatDateTime(quote.reviewed_at) },
              ]}
            />
            {quote.admin_notes && (
              <p className="mt-4 text-sm text-slate-600">
                <span className="font-medium text-slate-700">Notas: </span>
                {quote.admin_notes}
              </p>
            )}
          </div>
        )}
      </CardBody>
    </Card>
  );
}
