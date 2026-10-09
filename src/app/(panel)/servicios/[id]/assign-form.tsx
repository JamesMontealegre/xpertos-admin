"use client";

import { useState } from "react";
import { ActionForm, SubmitButton } from "@/components/ui/action-form";
import { Alert } from "@/components/ui/alert";
import { cn } from "@/components/ui/cn";
import { Field, Input, Select } from "@/components/ui/input";
import { PAYOUT_METHOD, WEEKDAYS, type PayoutMethod } from "@/lib/labels";
import { assignService } from "../actions";

export type ExpertOption = {
  id: string;
  full_name: string;
  category_ids: string[];
  city: string | null;
  rating_avg: number;
  rating_count: number;
  is_available: boolean;
  active_services: number;
  payout_method: PayoutMethod | null;
  payout_account: string | null;
  availability: Array<{ weekday: number; start_time: string; end_time: string }>;
};

type Category = { id: string; name: string };

const ALL = "all";
const normalize = (value: string | null | undefined) =>
  (value ?? "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim().toLowerCase();

/**
 * Asignación desde el pool: el agente filtra por actividad (por defecto la del servicio), elige al
 * experto en el desplegable y ve su detalle antes de asignar. Solo se elige el experto y, si se
 * acordó, la fecha de visita; el experto define la cotización desde su app.
 */
export function AssignForm({
  serviceId,
  experts,
  categories,
  serviceCategoryId,
  serviceCity,
  currentExpertId,
  defaultScheduledAt,
}: {
  serviceId: string;
  experts: ExpertOption[];
  categories: Category[];
  serviceCategoryId: string;
  serviceCity: string | null;
  currentExpertId: string | null;
  /** Fecha de visita vigente en formato datetime-local (hora de Colombia). */
  defaultScheduledAt: string;
}) {
  const [categoryId, setCategoryId] = useState<string>(serviceCategoryId);
  const [expertId, setExpertId] = useState(currentExpertId ?? "");
  const categoryName = new Map(categories.map((c) => [c.id, c.name]));
  const serviceCategoryName = categoryName.get(serviceCategoryId) ?? "la del servicio";

  // Primero los de la misma ciudad del servicio, luego mejor calificación y menos servicios activos.
  const sameCity = (e: ExpertOption) => normalize(e.city) !== "" && normalize(e.city) === normalize(serviceCity);
  const filtered = experts
    .filter((e) => categoryId === ALL || e.category_ids.includes(categoryId))
    .sort(
      (a, b) =>
        Number(sameCity(b)) - Number(sameCity(a)) ||
        b.rating_avg - a.rating_avg ||
        a.active_services - b.active_services ||
        a.full_name.localeCompare(b.full_name),
    );
  const countFor = (id: string) => experts.filter((e) => id === ALL || e.category_ids.includes(id)).length;
  const selected = experts.find((e) => e.id === expertId) ?? null;

  const reassigning = Boolean(currentExpertId) && expertId !== currentExpertId;
  const sameExpert = Boolean(currentExpertId) && expertId === currentExpertId;

  if (experts.length === 0) {
    return (
      <Alert tone="warning">
        No hay expertos disponibles. Aprueba una postulación o pide a los expertos que activen su disponibilidad.
      </Alert>
    );
  }

  const changeCategory = (next: string) => {
    setCategoryId(next);
    // Si el experto elegido no hace esa actividad, se quita la selección.
    if (expertId && next !== ALL && !experts.find((e) => e.id === expertId)?.category_ids.includes(next)) setExpertId("");
  };

  return (
    <ActionForm action={assignService} className="space-y-4">
      <input type="hidden" name="service_id" value={serviceId} />

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Actividad" htmlFor="assign-category" hint={`La del servicio: ${serviceCategoryName}.`}>
          <Select id="assign-category" value={categoryId} onChange={(e) => changeCategory(e.target.value)}>
            <option value={ALL}>Todas las actividades ({countFor(ALL)})</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name} ({countFor(c.id)}){c.id === serviceCategoryId ? " · del servicio" : ""}
              </option>
            ))}
          </Select>
        </Field>
        <Field
          label="Experto"
          htmlFor="assign-expert"
          hint={
            filtered.length === 0
              ? "No hay expertos disponibles en esta actividad."
              : filtered.length === 1
                ? "1 experto disponible."
                : `${filtered.length} expertos disponibles. Primero los de ${serviceCity ?? "la ciudad del servicio"}.`
          }
        >
          <Select
            id="assign-expert"
            name="expert_id"
            value={expertId}
            onChange={(e) => setExpertId(e.target.value)}
            disabled={filtered.length === 0}
            required
          >
            <option value="">{filtered.length === 0 ? "Sin expertos en esta actividad" : "Selecciona un experto"}</option>
            {filtered.map((e) => (
              <option key={e.id} value={e.id}>
                {e.full_name} — {e.city ?? "Sin ciudad"} · ★ {e.rating_avg.toFixed(1)} ·{" "}
                {e.active_services === 1 ? "1 activo" : `${e.active_services} activos`}
                {e.id === currentExpertId ? " (asignado)" : ""}
              </option>
            ))}
            {/* El experto ya asignado sigue en la lista aunque no tenga la actividad filtrada. */}
            {selected && !filtered.some((e) => e.id === selected.id) && (
              <option value={selected.id}>{selected.full_name}</option>
            )}
          </Select>
        </Field>
      </div>

      {selected && (
        <ExpertDetail
          expert={selected}
          isCurrent={selected.id === currentExpertId}
          categoryName={categoryName}
          serviceCategoryId={serviceCategoryId}
        />
      )}

      <Field
        label="Fecha de visita (opcional)"
        htmlFor="scheduled_at"
        hint="Si ya se acordó una visita para cotizar. Hora de Colombia."
        className="max-w-xs"
      >
        <Input id="scheduled_at" name="scheduled_at" type="datetime-local" defaultValue={defaultScheduledAt} />
      </Field>

      {reassigning && currentExpertId && expertId && (
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

/** Detalle del experto elegido: ciudad, calificación, carga, medio de pago, actividades y franjas. */
function ExpertDetail({
  expert: e,
  isCurrent,
  categoryName,
  serviceCategoryId,
}: {
  expert: ExpertOption;
  isCurrent: boolean;
  categoryName: Map<string, string>;
  serviceCategoryId: string;
}) {
  const doesServiceCategory = e.category_ids.includes(serviceCategoryId);
  return (
    <div className="rounded-xl border border-primary bg-primary/5 px-4 py-3 text-sm ring-2 ring-primary/20">
      <p className="flex flex-wrap items-center gap-x-2 gap-y-0.5">
        <span className="font-medium">{e.full_name}</span>
        {isCurrent && <span className="rounded-full bg-blue-50 px-2 py-0.5 text-xs font-medium text-blue-700">Asignado</span>}
        {!e.is_available && (
          <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-600">No disponible</span>
        )}
      </p>
      <p className="mt-0.5 text-xs text-slate-500">
        {e.city ?? "Sin ciudad"} · <span className="text-accent">★</span> {e.rating_avg.toFixed(1)} ({e.rating_count} reseñas) ·{" "}
        {e.active_services === 1 ? "1 servicio activo" : `${e.active_services} servicios activos`} · Pago:{" "}
        {e.payout_method ? PAYOUT_METHOD[e.payout_method] : "sin medio de pago"}
      </p>
      <p className="mt-1.5 flex flex-wrap gap-1">
        {e.category_ids.map((id) => (
          <span
            key={id}
            className={cn(
              "rounded-md px-1.5 py-0.5 text-[11px] ring-1",
              id === serviceCategoryId ? "bg-white font-medium text-primary ring-primary/40" : "bg-white text-slate-600 ring-border",
            )}
          >
            {categoryName.get(id) ?? "Actividad"}
          </span>
        ))}
      </p>
      {e.availability.length === 0 ? (
        <p className="mt-1.5 text-xs text-slate-400">Sin franjas de disponibilidad declaradas.</p>
      ) : (
        <p className="mt-1.5 flex flex-wrap gap-1">
          {e.availability.map((slot, i) => (
            <span key={i} className="rounded-md bg-white px-1.5 py-0.5 text-[11px] text-slate-600 ring-1 ring-border">
              {WEEKDAYS[slot.weekday].slice(0, 3)} {slot.start_time.slice(0, 5)}–{slot.end_time.slice(0, 5)}
            </span>
          ))}
        </p>
      )}
      {!doesServiceCategory && (
        <p className="mt-2 text-xs font-medium text-amber-700">
          Este experto no tiene registrada la actividad del servicio ({categoryName.get(serviceCategoryId) ?? "categoría"}).
        </p>
      )}
    </div>
  );
}
