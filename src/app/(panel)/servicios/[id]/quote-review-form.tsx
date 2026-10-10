"use client";

import { useState } from "react";
import { ActionForm, SubmitButton } from "@/components/ui/action-form";
import { Field, Input, Textarea } from "@/components/ui/input";
import { formatCOP } from "@/lib/format";
import { approveQuote } from "../actions";

/**
 * Evaluación de la cotización: mano de obra aprobada y valor de los materiales, con las dos opciones que
 * verá el cliente calculadas en vivo. Las comisiones por uso de la plataforma son fijas por servicio: la
 * tarifa del cliente se suma a cada opción y la comisión del experto se descuenta de su pago. Al presentarla, el cliente elige en su app entre solo
 * mano de obra (él compra los materiales) y todo incluido. Sin materiales hay una sola opción.
 */
export function QuoteReviewForm({
  serviceId,
  hasMaterials,
  laborTotal,
  commissionPct,
  clientFeePct,
  materialsEstimate,
}: {
  serviceId: string;
  /** El experto listó materiales: hay opción todo incluido y su valor es obligatorio. */
  hasMaterials: boolean;
  laborTotal: number;
  /** Comisión del experto (% de su cotización), se descuenta de su pago. */
  commissionPct: number;
  /** Tarifa de servicio del cliente (% de la cotización), se suma a lo que paga. */
  clientFeePct: number;
  /** Suma de los costos estimados que dio el experto para los materiales (si los dio). */
  materialsEstimate: number | null;
}) {
  const [labor, setLabor] = useState(laborTotal ? String(Math.round(laborTotal)) : "");
  const [materials, setMaterials] = useState(hasMaterials && materialsEstimate ? String(Math.round(materialsEstimate)) : "");

  const laborValue = Number(labor) || 0;
  const materialsValue = hasMaterials ? Number(materials) || 0 : 0;
  const commissionAmount = Math.round((laborValue * commissionPct) / 100);
  // Tarifa del cliente: % del total de cada opción (solo mano de obra, o mano de obra + materiales).
  const feeLaborOnly = Math.round((laborValue * clientFeePct) / 100);
  const feeAllInclusive = Math.round(((laborValue + materialsValue) * clientFeePct) / 100);
  const expertNet = laborValue - commissionAmount;
  const canApprove = laborValue > 0 && (!hasMaterials || materialsValue > 0);

  return (
    <ActionForm action={approveQuote} className="space-y-4">
      <input type="hidden" name="service_id" value={serviceId} />
      <input type="hidden" name="has_materials" value={hasMaterials ? "1" : "0"} />

      <div className="grid gap-4 sm:grid-cols-2">
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
      </div>

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
                <dd className="font-semibold text-primary">{formatCOP(laborValue + materialsValue + feeAllInclusive)}</dd>
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
              <dd className="font-semibold">{formatCOP(feeAllInclusive + commissionAmount)}</dd>
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
