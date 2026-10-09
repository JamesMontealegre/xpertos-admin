"use client";

import { useState } from "react";
import { ActionForm, SubmitButton } from "@/components/ui/action-form";
import { Field, Input, Textarea } from "@/components/ui/input";
import { formatCOP } from "@/lib/format";
import { approveQuote } from "../actions";

/**
 * Evaluación de la cotización: mano de obra aprobada, valor de los materiales y comisión, con las dos
 * opciones que verá el cliente calculadas en vivo. Al presentarla, el cliente elige en su app entre solo
 * mano de obra (él compra los materiales) y todo incluido. Sin materiales hay una sola opción.
 */
export function QuoteReviewForm({
  serviceId,
  hasMaterials,
  laborTotal,
  commissionPct,
  materialsEstimate,
}: {
  serviceId: string;
  /** El experto listó materiales: hay opción todo incluido y su valor es obligatorio. */
  hasMaterials: boolean;
  laborTotal: number;
  commissionPct: number;
  /** Suma de los costos estimados que dio el experto para los materiales (si los dio). */
  materialsEstimate: number | null;
}) {
  const [labor, setLabor] = useState(laborTotal ? String(Math.round(laborTotal)) : "");
  const [materials, setMaterials] = useState(hasMaterials && materialsEstimate ? String(Math.round(materialsEstimate)) : "");
  const [commission, setCommission] = useState(String(commissionPct));

  const laborValue = Number(labor) || 0;
  const materialsValue = hasMaterials ? Number(materials) || 0 : 0;
  const commissionValue = Math.min(Math.max(Number(commission) || 0, 0), 100);
  const commissionAmount = Math.round((laborValue * commissionValue) / 100);
  const expertNet = laborValue - commissionAmount;
  const canApprove = laborValue > 0 && (!hasMaterials || materialsValue > 0);

  return (
    <ActionForm action={approveQuote} className="space-y-4">
      <input type="hidden" name="service_id" value={serviceId} />
      <input type="hidden" name="has_materials" value={hasMaterials ? "1" : "0"} />

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
        {hasMaterials && (
          <Field
            label="Valor de materiales (COP)"
            htmlFor="materials_total"
            hint={
              materialsEstimate
                ? `Para la opción todo incluido. Costo estimado por el experto: ${formatCOP(materialsEstimate)}.`
                : "Para la opción todo incluido."
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
          <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
            {hasMaterials ? "Opciones que verá el cliente" : "Valor para el cliente"}
          </p>
          <div className="flex justify-between gap-3">
            <dt className="text-slate-600">Solo mano de obra</dt>
            <dd className="font-semibold text-primary">{formatCOP(laborValue)}</dd>
          </div>
          {hasMaterials ? (
            <div className="flex justify-between gap-3">
              <dt className="text-slate-600">Todo incluido (+ materiales)</dt>
              <dd className="font-semibold text-primary">{formatCOP(laborValue + materialsValue)}</dd>
            </div>
          ) : (
            <p className="text-xs text-slate-500">El experto no listó materiales: hay una sola opción y se cobra de una vez.</p>
          )}
        </div>
        <div className="space-y-1.5 sm:border-l sm:border-border sm:pl-4">
          <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Para el experto</p>
          <div className="flex justify-between gap-3">
            <dt className="text-slate-600">Comisión ({commissionValue} %)</dt>
            <dd>− {formatCOP(commissionAmount)}</dd>
          </div>
          <div className="flex justify-between gap-3 border-t border-border pt-1.5 font-semibold">
            <dt>Neto por la mano de obra</dt>
            <dd>{formatCOP(expertNet)}</dd>
          </div>
          {hasMaterials && (
            <p className="text-xs text-slate-500">
              Si el cliente elige todo incluido, se le suman {formatCOP(materialsValue)} para comprar los materiales.
            </p>
          )}
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
