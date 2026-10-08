"use client";

import { useState } from "react";
import { ActionForm, SubmitButton } from "@/components/ui/action-form";
import { Alert } from "@/components/ui/alert";
import { cn } from "@/components/ui/cn";
import { Field, Input } from "@/components/ui/input";
import { PAYOUT_METHOD, WEEKDAYS, type PayoutMethod } from "@/lib/labels";
import { assignService } from "../actions";

export type ExpertOption = {
  id: string;
  full_name: string;
  city: string | null;
  rating_avg: number;
  rating_count: number;
  is_available: boolean;
  active_services: number;
  payout_method: PayoutMethod | null;
  payout_account: string | null;
  availability: Array<{ weekday: number; start_time: string; end_time: string }>;
};

/**
 * Asignación desde el pool: expertos disponibles con la categoría del servicio. Solo se elige el
 * experto y, si se acordó, la fecha de visita; el experto define la cotización desde su app.
 */
export function AssignForm({
  serviceId,
  experts,
  currentExpertId,
  defaultScheduledAt,
}: {
  serviceId: string;
  experts: ExpertOption[];
  currentExpertId: string | null;
  /** Fecha de visita vigente en formato datetime-local (hora de Colombia). */
  defaultScheduledAt: string;
}) {
  const [expertId, setExpertId] = useState(currentExpertId ?? experts[0]?.id ?? "");
  const reassigning = Boolean(currentExpertId) && expertId !== currentExpertId;
  const sameExpert = Boolean(currentExpertId) && expertId === currentExpertId;

  if (experts.length === 0) {
    return (
      <Alert tone="warning">
        No hay expertos disponibles para la categoría de este servicio. Aprueba una postulación o pide al experto que
        active su disponibilidad.
      </Alert>
    );
  }

  return (
    <ActionForm action={assignService} className="space-y-4">
      <input type="hidden" name="service_id" value={serviceId} />

      <fieldset>
        <legend className="mb-2 text-sm font-medium text-slate-700">Experto</legend>
        <ul className="grid gap-2">
          {experts.map((e) => {
            const selected = e.id === expertId;
            return (
              <li key={e.id}>
                <label
                  className={cn(
                    "flex cursor-pointer gap-3 rounded-xl border px-4 py-3 text-sm transition-colors",
                    selected ? "border-primary bg-primary/5 ring-2 ring-primary/20" : "border-border hover:bg-slate-50",
                  )}
                >
                  <input
                    type="radio"
                    name="expert_id"
                    value={e.id}
                    checked={selected}
                    onChange={() => setExpertId(e.id)}
                    className="mt-1 accent-primary"
                  />
                  <span className="min-w-0 flex-1">
                    <span className="flex flex-wrap items-center gap-x-2 gap-y-0.5">
                      <span className="font-medium">{e.full_name}</span>
                      {e.id === currentExpertId && (
                        <span className="rounded-full bg-blue-50 px-2 py-0.5 text-xs font-medium text-blue-700">Asignado</span>
                      )}
                    </span>
                    <span className="mt-0.5 block text-xs text-slate-500">
                      {e.city ?? "Sin ciudad"} · <span className="text-accent">★</span> {e.rating_avg.toFixed(1)} ({e.rating_count}{" "}
                      reseñas) · {e.active_services === 1 ? "1 servicio activo" : `${e.active_services} servicios activos`} · Pago:{" "}
                      {e.payout_method ? PAYOUT_METHOD[e.payout_method] : "sin medio de pago"}
                    </span>
                    {e.availability.length === 0 ? (
                      <span className="mt-1.5 block text-xs text-slate-400">Sin franjas de disponibilidad declaradas.</span>
                    ) : (
                      <span className="mt-1.5 flex flex-wrap gap-1">
                        {e.availability.map((slot, i) => (
                          <span key={i} className="rounded-md bg-white px-1.5 py-0.5 text-[11px] text-slate-600 ring-1 ring-border">
                            {WEEKDAYS[slot.weekday].slice(0, 3)} {slot.start_time.slice(0, 5)}–{slot.end_time.slice(0, 5)}
                          </span>
                        ))}
                      </span>
                    )}
                  </span>
                </label>
              </li>
            );
          })}
        </ul>
      </fieldset>

      <Field
        label="Fecha de visita (opcional)"
        htmlFor="scheduled_at"
        hint="Si ya se acordó una visita para cotizar. Hora de Colombia."
        className="max-w-xs"
      >
        <Input id="scheduled_at" name="scheduled_at" type="datetime-local" defaultValue={defaultScheduledAt} />
      </Field>

      {reassigning && (
        <Alert tone="warning">
          Al cambiar de experto, la cotización que haya preparado el experto actual se descarta y el nuevo experto debe
          cotizar desde cero.
        </Alert>
      )}

      <div className="flex justify-end">
        <SubmitButton disabled={!expertId} pendingLabel="Guardando…">
          {sameExpert ? "Guardar fecha de visita" : reassigning ? "Reasignar experto" : "Asignar experto"}
        </SubmitButton>
      </div>
    </ActionForm>
  );
}
