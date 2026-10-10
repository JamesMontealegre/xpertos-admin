"use client";

import { useState } from "react";
import { ActionForm, SubmitButton } from "@/components/ui/action-form";
import { Field, Textarea } from "@/components/ui/input";
import { MoneyInput } from "@/components/ui/money-input";
import { formatCOP } from "@/lib/format";
import { approveQuote } from "../actions";

export type ReviewMaterial = {
  id: string;
  name: string;
  quantity: number;
  unit: string;
  notes: string | null;
  /** Costo estimado del experto por unidad: solo informativo. */
  estimated_cost: number | null;
  /** Valor unitario que fija el agente (si ya se había fijado). */
  unit_price: number | null;
};

const qty = new Intl.NumberFormat("es-CO", { maximumFractionDigits: 2 });

/**
 * Evaluación de la cotización: mano de obra aprobada y el valor de cada material (lo fija el agente; el
 * costo estimado del experto es solo una referencia), con las dos opciones que verá el cliente calculadas
 * en vivo. La tarifa del cliente es un % del total de cada opción y la comisión del experto se descuenta
 * de su pago. Sin materiales hay una sola opción.
 */
export function QuoteReviewForm({
  serviceId,
  materials,
  laborTotal,
  commissionPct,
  clientFeePct,
}: {
  serviceId: string;
  /** Materiales que listó el experto; si hay, se ofrece la opción todo incluido con su valor por ítem. */
  materials: ReviewMaterial[];
  laborTotal: number;
  /** Comisión del experto (% de su cotización), se descuenta de su pago. */
  commissionPct: number;
  /** Tarifa de servicio del cliente (% de la cotización), se suma a lo que paga. */
  clientFeePct: number;
}) {
  const hasMaterials = materials.length > 0;
  const [labor, setLabor] = useState(laborTotal ? String(Math.round(laborTotal)) : "");
  // Valor unitario por material: el que ya tenía o, como punto de partida, el estimado del experto por unidad.
  const [prices, setPrices] = useState<Record<string, string>>(() =>
    Object.fromEntries(
      materials.map((m) => [
        m.id,
        m.unit_price
          ? String(Math.round(m.unit_price))
          : m.estimated_cost
            ? String(Math.round(m.estimated_cost))
            : "",
      ]),
    ),
  );

  const laborValue = Number(labor) || 0;
  const lineTotal = (m: ReviewMaterial) => Math.round((Number(prices[m.id]) || 0) * m.quantity);
  const materialsValue = materials.reduce((sum, m) => sum + lineTotal(m), 0);
  const allPriced = materials.every((m) => (Number(prices[m.id]) || 0) > 0);
  const commissionAmount = Math.round((laborValue * commissionPct) / 100);
  // Tarifa del cliente: % del total de cada opción (solo mano de obra, o mano de obra + materiales).
  const feeLaborOnly = Math.round((laborValue * clientFeePct) / 100);
  const feeAllInclusive = Math.round(((laborValue + materialsValue) * clientFeePct) / 100);
  const expertNet = laborValue - commissionAmount;
  const canApprove = laborValue > 0 && (!hasMaterials || allPriced);

  return (
    <ActionForm action={approveQuote} className="space-y-4">
      <input type="hidden" name="service_id" value={serviceId} />
      <input type="hidden" name="has_materials" value={hasMaterials ? "1" : "0"} />

      <Field label="Mano de obra aprobada" htmlFor="labor_total" hint={`El experto cotizó ${formatCOP(laborTotal)}.`} className="max-w-sm">
        <MoneyInput id="labor_total" name="labor_total" value={labor} onChange={setLabor} required />
      </Field>

      {hasMaterials && (
        <div className="space-y-2">
          <div>
            <p className="text-sm font-medium text-slate-700">Valor de cada material (opción todo incluido)</p>
            <p className="text-xs text-slate-500">
              Es lo que verá el cliente, ítem por ítem. El costo estimado del experto es solo una referencia.
            </p>
          </div>
          <div className="overflow-hidden rounded-xl border border-border">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-xs font-medium uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-3 py-2">Material</th>
                  <th className="hidden px-3 py-2 sm:table-cell">Estimado del experto (c/u)</th>
                  <th className="w-44 px-3 py-2">Valor unitario</th>
                  <th className="w-32 px-3 py-2 text-right">Subtotal</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {materials.map((m) => (
                  <tr key={m.id}>
                    <td className="px-3 py-2">
                      <span className="font-medium">{m.name}</span>
                      <span className="block text-xs text-slate-500">
                        {qty.format(m.quantity)} {m.unit}
                        {m.notes ? ` · ${m.notes}` : ""}
                      </span>
                      <span className="block text-xs text-slate-400 sm:hidden">
                        Estimado: {m.estimated_cost != null ? formatCOP(m.estimated_cost) : "sin dato"}
                      </span>
                    </td>
                    <td className="hidden px-3 py-2 text-slate-500 sm:table-cell">
                      {m.estimated_cost != null ? formatCOP(m.estimated_cost) : "Sin dato"}
                    </td>
                    <td className="px-3 py-2">
                      <MoneyInput
                        name={`material_price:${m.id}`}
                        aria-label={`Valor unitario de ${m.name}`}
                        value={prices[m.id] ?? ""}
                        onChange={(digits) => setPrices((current) => ({ ...current, [m.id]: digits }))}
                        required
                      />
                    </td>
                    <td className="px-3 py-2 text-right font-medium whitespace-nowrap">{formatCOP(lineTotal(m))}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="bg-slate-50">
                  <td colSpan={3} className="px-3 py-2 text-right text-sm font-medium">
                    Total materiales
                  </td>
                  <td className="px-3 py-2 text-right font-semibold whitespace-nowrap">{formatCOP(materialsValue)}</td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      )}

      <dl className="grid gap-3 rounded-xl border border-border bg-slate-50 p-4 text-sm lg:grid-cols-3">
        <div className="space-y-1.5">
          <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
            {hasMaterials ? "Opciones que verá el cliente" : "Lo que paga el cliente"}
          </p>
          <div className="flex justify-between gap-3">
            <dt className="font-medium">Solo mano de obra</dt>
            <dd className="font-semibold text-primary">{formatCOP(laborValue + feeLaborOnly)}</dd>
          </div>
          <p className="text-xs text-slate-500">
            {formatCOP(laborValue)} + tarifa {clientFeePct} % ({formatCOP(feeLaborOnly)})
          </p>
          {hasMaterials ? (
            <>
              <div className="flex justify-between gap-3 border-t border-border pt-1.5">
                <dt className="font-medium">Todo incluido</dt>
                <dd className="font-semibold text-primary">
                  {allPriced ? formatCOP(laborValue + materialsValue + feeAllInclusive) : <span className="text-xs font-normal text-slate-400">Falta el valor de los materiales</span>}
                </dd>
              </div>
              <p className="text-xs text-slate-500">
                {formatCOP(laborValue)} + materiales {formatCOP(materialsValue)} + tarifa {clientFeePct} % ({formatCOP(feeAllInclusive)})
              </p>
            </>
          ) : (
            <p className="text-xs text-slate-500">El experto no listó materiales: hay una sola opción y se cobra de una vez.</p>
          )}
        </div>
        <div className="space-y-1.5 lg:border-l lg:border-border lg:pl-4">
          <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Para el experto</p>
          <div className="flex justify-between gap-3">
            <dt className="text-slate-600">Su cotización</dt>
            <dd>{formatCOP(laborValue)}</dd>
          </div>
          <div className="flex justify-between gap-3">
            <dt className="text-slate-600">Comisión ({commissionPct} %)</dt>
            <dd>− {formatCOP(commissionAmount)}</dd>
          </div>
          <div className="flex justify-between gap-3 border-t border-border pt-1.5 font-semibold">
            <dt>Recibe al finalizar</dt>
            <dd>{formatCOP(expertNet)}</dd>
          </div>
          {hasMaterials && (
            <p className="text-xs text-slate-500">
              Los materiales no hacen parte de su pago: si el cliente elige todo incluido, Xpertos los compra y los lleva
              al lugar del servicio.
            </p>
          )}
        </div>
        <div className="space-y-1.5 lg:border-l lg:border-border lg:pl-4">
          <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Ganancia de Xpertos</p>
          <div className="flex justify-between gap-3">
            <dt className="text-slate-600">Si elige solo mano de obra</dt>
            <dd className="font-semibold">{formatCOP(feeLaborOnly + commissionAmount)}</dd>
          </div>
          {hasMaterials && (
            <div className="flex justify-between gap-3">
              <dt className="text-slate-600">Si elige todo incluido</dt>
              <dd className="font-semibold">
                {allPriced ? formatCOP(feeAllInclusive + commissionAmount) : <span className="text-xs font-normal text-slate-400">Falta el valor de los materiales</span>}
              </dd>
            </div>
          )}
          <p className="text-xs text-slate-500">
            Tarifa del cliente ({clientFeePct} % de la opción) + comisión del experto ({commissionPct} % de su mano de obra).
          </p>
        </div>
      </dl>

      <Field label="Notas de la aprobación (opcional)" htmlFor="quote_notes" hint="El experto las verá en su app.">
        <Textarea id="quote_notes" name="notes" className="min-h-16" placeholder="Ej.: precio validado con el cliente." />
      </Field>

      <div className="flex justify-end">
        <SubmitButton disabled={!canApprove} pendingLabel={hasMaterials ? "Presentando…" : "Aprobando…"}>
          {hasMaterials ? "Presentar al cliente" : "Aprobar y enviar a pago"}
        </SubmitButton>
      </div>
    </ActionForm>
  );
}
