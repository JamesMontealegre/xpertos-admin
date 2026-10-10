import { Alert } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Card, CardBody, CardHeader, DescriptionList } from "@/components/ui/card";
import { ActionDialog } from "@/components/ui/dialog";
import { Field, Textarea } from "@/components/ui/input";
import { PhotoGrid, type PhotoItem } from "@/components/ui/photo-grid";
import { EmptyRow, Table, TBody, Td, THead, Tr } from "@/components/ui/table";
import type { Database } from "@/lib/database.types";
import { businessDaysLabel, formatCOP, formatDateTime } from "@/lib/format";
import { PRICING_MODE, QUOTE_STATUS, unitPriceLabel, type ServiceStatus } from "@/lib/labels";
import { choosePricingMode, returnQuote } from "../actions";
import { QuoteReviewForm } from "./quote-review-form";

type QuoteRow = Database["public"]["Tables"]["service_quotes"]["Row"];
type ItemRow = Database["public"]["Tables"]["quote_items"]["Row"];
type MaterialRow = Database["public"]["Tables"]["quote_materials"]["Row"];

export type QuoteWithLines = QuoteRow & { items: ItemRow[]; materials: MaterialRow[] };

const qty = new Intl.NumberFormat("es-CO", { maximumFractionDigits: 2 });

/**
 * Neto estimado del experto: mano de obra aprobada menos la comisión. Los materiales nunca hacen parte
 * de su pago (en todo incluido los compra Xpertos). Sin mano de obra aprobada no hay neto.
 */
export function expertNetEstimate(quote: QuoteRow | null, commissionPct: number) {
  if (!quote || quote.approved_labor_total == null) return null;
  return Math.round(Number(quote.approved_labor_total) * (1 - commissionPct / 100));
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
  clientFeePct,
}: {
  serviceId: string;
  status: ServiceStatus;
  quote: QuoteWithLines | null;
  beforePhotos: PhotoItem[];
  commissionPct: number;
  clientFeePct: number;
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
  const evaluating = status === "quoting" && quote.status === "submitted";
  // Presentada al cliente con dos opciones: aún no elige (no hay total).
  const awaitingChoice = status === "quoting" && quote.status === "approved" && quote.total == null;
  const chosen = quote.status === "approved" && quote.total != null;
  const allInclusive = chosen && quote.pricing_mode === "all_inclusive";
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
            {
              label: "Modalidad",
              value: chosen
                ? `${PRICING_MODE[quote.pricing_mode].label} · la eligió el cliente`
                : awaitingChoice
                  ? "El cliente está eligiendo"
                  : "La elige el cliente al presentarle la cotización",
            },
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
              ·{" "}
              {chosen
                ? allInclusive
                  ? "los compra Xpertos y los lleva al lugar del servicio (todo incluido)"
                  : "los compra el cliente"
                : "el cliente decide si los compra o si van por cuenta de Xpertos"}
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
                  <span className="text-right text-slate-600">
                    {m.line_total != null && (
                      <span className="block font-medium text-foreground">
                        {formatCOP(m.line_total)}{" "}
                        <span className="font-normal text-slate-500">
                          ({formatCOP(m.unit_price)} {unitPriceLabel(m.unit)})
                        </span>
                      </span>
                    )}
                    <span className="block text-xs text-slate-500">
                      {m.estimated_cost != null
                        ? `Estimado del experto: ${formatCOP(m.estimated_cost)} ${unitPriceLabel(m.unit)}`
                        : "Sin estimado del experto"}
                    </span>
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
              materials={materials.map((m) => ({
                id: m.id,
                name: m.name,
                quantity: Number(m.quantity),
                unit: m.unit,
                notes: m.notes,
                estimated_cost: m.estimated_cost != null ? Number(m.estimated_cost) : null,
                unit_price: m.unit_price != null ? Number(m.unit_price) : null,
              }))}
              laborTotal={Number(quote.labor_total)}
              commissionPct={commissionPct}
              clientFeePct={clientFeePct}
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

        {awaitingChoice && (
          <div className="space-y-4 border-t border-border pt-5">
            <Alert tone="info">
              Presentada al cliente el {formatDateTime(quote.reviewed_at)}: está eligiendo la opción en su app. Si te la
              confirma por otro medio, regístrala aquí.
            </Alert>
            <div className="grid gap-3 sm:grid-cols-2">
              {(
                [
                  ["labor_only", quote.total_labor_only, "El cliente compra los materiales de la lista."],
                  ["all_inclusive", quote.total_all_inclusive, "Los materiales y el experto van por cuenta de Xpertos."],
                ] as const
              ).map(([mode, total, help]) => (
                <div key={mode} className="flex flex-col gap-3 rounded-xl border border-border p-4">
                  <div>
                    <p className="text-sm font-medium">{PRICING_MODE[mode].label}</p>
                    <p className="text-xl font-semibold text-primary">{formatCOP(total)}</p>
                    <p className="mt-1 text-xs text-slate-500">{help}</p>
                  </div>
                  {total != null && (
                    <ActionDialog
                      triggerLabel="Registrar esta opción"
                      triggerVariant="secondary"
                      triggerSize="sm"
                      title={`Registrar: ${PRICING_MODE[mode].label}`}
                      description={`El cliente eligió ${PRICING_MODE[mode].short.toLowerCase()} por ${formatCOP(total)}. Se crea el cobro, el servicio pasa a Pendiente de pago y le enviamos cómo pagar.`}
                      action={choosePricingMode}
                      fields={{ service_id: serviceId, pricing_mode: mode }}
                      submitLabel="Registrar opción"
                      pendingLabel="Registrando…"
                    />
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {chosen && (
          <div className="border-t border-border pt-5">
            <p className="mb-3 text-xs font-medium uppercase tracking-wide text-slate-500">Valores aprobados</p>
            <DescriptionList
              columns={3}
              items={[
                { label: "Mano de obra aprobada", value: formatCOP(quote.approved_labor_total) },
                { label: `Tarifa de servicio del cliente (${clientFeePct} %)`, value: formatCOP(quote.client_fee_total) },
                { label: "Materiales", value: allInclusive ? `${formatCOP(quote.materials_total)} · los compra Xpertos` : "Los compra el cliente" },
                { label: "Total del cliente", value: <span className="font-semibold text-primary">{formatCOP(quote.total)}</span> },
                { label: `Comisión del experto (${commissionPct} %)`, value: formatCOP(net != null ? Number(quote.approved_labor_total) - net : null) },
                { label: "El experto recibe al finalizar", value: formatCOP(net) },
                {
                  label: "Ganancia de Xpertos",
                  value: formatCOP(net != null ? Number(quote.client_fee_total) + Number(quote.approved_labor_total) - net : null),
                },
                { label: "Aprobada", value: formatDateTime(quote.reviewed_at) },
              ]}
            />
            {allInclusive && (
              <Alert tone="warning" className="mt-4">
                Todo incluido: la central compra los materiales de la lista y gestiona su llegada al lugar del servicio
                antes de la fecha de inicio. El experto solo responde por la mano de obra.
              </Alert>
            )}
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
