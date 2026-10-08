"use client";

import { useState } from "react";
import { ActionForm, SubmitButton } from "@/components/ui/action-form";
import { Field, Input, Textarea } from "@/components/ui/input";
import { formatCOP } from "@/lib/format";
import type { PricingMode } from "@/lib/labels";
import { approveQuote } from "../actions";

/**
 * Evaluación de la cotización: mano de obra aprobada, materiales (solo todo incluido), comisión y
 * resumen calculado en vivo. Al aprobar se crea el cobro al cliente y se genera el contrato.
 */
export function QuoteReviewForm({
  serviceId,
  pricingMode,
  laborTotal,
  commissionPct,
  materialsEstimate,
}: {
  serviceId: string;
  pricingMode: PricingMode;
  laborTotal: number;
  commissionPct: number;
  /** Suma de los costos estimados que dio el experto para los materiales (si los dio). */
  materialsEstimate: number | null;
}) {
  const allInclusive = pricingMode === "all_inclusive";
  const [labor, setLabor] = useState(laborTotal ? String(Math.round(laborTotal)) : "");
  const [materials, setMaterials] = useState(allInclusive && materialsEstimate ? String(Math.round(materialsEstimate)) : "");
  const [commission, setCommission] = useState(String(commissionPct));

  const laborValue = Number(labor) || 0;
  const materialsValue = allInclusive ? Number(materials) || 0 : 0;
  const commissionValue = Math.min(Math.max(Number(commission) || 0, 0), 100);
  const commissionAmount = Math.round((laborValue * commissionValue) / 100);
  const clientTotal = laborValue + materialsValue;
  const expertNet = laborValue - commissionAmount + materialsValue;
  const canApprove = laborValue > 0 && (!allInclusive || materialsValue > 0);

  return (
    <ActionForm action={approveQuote} className="space-y-4">
      <input type="hidden" name="service_id" value={serviceId} />
      <input type="hidden" name="pricing_mode" value={pricingMode} />

      <div className="grid gap-4 sm:grid-cols-3">
        <Field
          label="Mano de obra aprobada (COP)"
          htmlFor="labor_total"
          hint={`El experto cotizó ${formatCOP(laborTotal)}.`}
        >
          <Input
            id="labor_total"
            name="labor_total"
            type="number"
            min={1}
            step={1}
            inputMode="numeric"
            required
            value={labor}
            onChange={(e) => setLabor(e.target.value)}
          />
        </Field>
        {allInclusive && (
          <Field
            label="Valor de materiales (COP)"
            htmlFor="materials_total"
            hint={
              materialsEstimate
                ? `Costo estimado por el experto: ${formatCOP(materialsEstimate)}.`
                : "Obligatorio en todo incluido."
            }
          >
            <Input
              id="materials_total"
              name="materials_total"
              type="number"
              min={1}
              step={1}
              inputMode="numeric"
              required
              value={materials}
              onChange={(e) => setMaterials(e.target.value)}
            />
          </Field>
        )}
        <Field label="Comisión de Xpertos (%)" htmlFor="commission_pct" hint="Sobre la mano de obra.">
          <Input
            id="commission_pct"
            name="commission_pct"
            type="number"
            min={0}
            max={100}
            step={0.5}
            required
            value={commission}
            onChange={(e) => setCommission(e.target.value)}
          />
        </Field>
      </div>

      <dl className="grid gap-3 rounded-xl border border-border bg-slate-50 p-4 text-sm sm:grid-cols-2">
        <div className="space-y-1.5">
          <div className="flex justify-between gap-3">
            <dt className="text-slate-600">Mano de obra</dt>
            <dd>{formatCOP(laborValue)}</dd>
          </div>
          {allInclusive && (
            <div className="flex justify-between gap-3">
              <dt className="text-slate-600">Materiales</dt>
              <dd>{formatCOP(materialsValue)}</dd>
            </div>
          )}
          <div className="flex justify-between gap-3 border-t border-border pt-1.5 font-semibold">
            <dt>Total a pagar por el cliente</dt>
            <dd className="text-primary">{formatCOP(clientTotal)}</dd>
          </div>
        </div>
        <div className="space-y-1.5 sm:border-l sm:border-border sm:pl-4">
          <div className="flex justify-between gap-3">
            <dt className="text-slate-600">Comisión ({commissionValue} %)</dt>
            <dd>− {formatCOP(commissionAmount)}</dd>
          </div>
          {allInclusive && (
            <div className="flex justify-between gap-3">
              <dt className="text-slate-600">Materiales</dt>
              <dd>+ {formatCOP(materialsValue)}</dd>
            </div>
          )}
          <div className="flex justify-between gap-3 border-t border-border pt-1.5 font-semibold">
            <dt>Neto estimado para el experto</dt>
            <dd>{formatCOP(expertNet)}</dd>
          </div>
        </div>
      </dl>

      <Field label="Notas de la aprobación (opcional)" htmlFor="quote_notes" hint="El experto las verá en su app.">
        <Textarea id="quote_notes" name="notes" className="min-h-16" placeholder="Ej.: precio validado con el cliente." />
      </Field>

      <div className="flex justify-end">
        <SubmitButton disabled={!canApprove} pendingLabel="Aprobando…">
          Aprobar y enviar a pago
        </SubmitButton>
      </div>
    </ActionForm>
  );
}
