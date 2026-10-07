"use client";

import { useMemo, useState } from "react";
import { ActionForm, SubmitButton } from "@/components/ui/action-form";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Field, Input, Select, Textarea } from "@/components/ui/input";
import { formatCOP } from "@/lib/format";
import { WEEKDAYS } from "@/lib/labels";
import { assignService } from "../actions";

export type ExpertOption = {
  id: string;
  full_name: string;
  city: string | null;
  rating_avg: number;
  rating_count: number;
  is_available: boolean;
  availability: Array<{ weekday: number; start_time: string; end_time: string }>;
};

type StageRow = { key: number; name: string; amount: string; description: string; due_date: string };

function defaultStages(price: number): StageRow[] {
  const first = Math.round(price / 2);
  return [
    { key: 1, name: "Anticipo 50 %", amount: price ? String(first) : "", description: "Se paga al confirmar la asignación.", due_date: "" },
    { key: 2, name: "Entrega 50 %", amount: price ? String(price - first) : "", description: "Se paga al recibir el trabajo terminado.", due_date: "" },
  ];
}

export function AssignForm({ serviceId, experts }: { serviceId: string; experts: ExpertOption[] }) {
  const [expertId, setExpertId] = useState(experts[0]?.id ?? "");
  const [price, setPrice] = useState("");
  const [stages, setStages] = useState<StageRow[]>(defaultStages(0));
  const [touched, setTouched] = useState(false);

  const priceNumber = Number(price) || 0;
  const total = stages.reduce((acc, s) => acc + (Number(s.amount) || 0), 0);
  const difference = priceNumber - total;
  const sumOk = priceNumber > 0 && Math.abs(difference) < 0.5;

  const selected = useMemo(() => experts.find((e) => e.id === expertId), [experts, expertId]);

  const onPriceChange = (value: string) => {
    setPrice(value);
    if (!touched) setStages(defaultStages(Number(value) || 0));
  };

  const updateStage = (key: number, patch: Partial<StageRow>) => {
    setTouched(true);
    setStages((rows) => rows.map((r) => (r.key === key ? { ...r, ...patch } : r)));
  };

  const addStage = () => {
    setTouched(true);
    setStages((rows) => [
      ...rows,
      { key: Date.now(), name: `Etapa ${rows.length + 1}`, amount: "", description: "", due_date: "" },
    ]);
  };

  const removeStage = (key: number) => {
    setTouched(true);
    setStages((rows) => rows.filter((r) => r.key !== key));
  };

  const stagesJson = JSON.stringify(
    stages.map((s) => ({
      name: s.name,
      amount: Number(s.amount) || 0,
      description: s.description || undefined,
      due_date: s.due_date || undefined,
    })),
  );

  if (experts.length === 0) {
    return (
      <Alert tone="warning">
        No hay expertos disponibles para la categoría de este servicio. Aprueba una postulación o pide al experto que
        active su disponibilidad.
      </Alert>
    );
  }

  return (
    <ActionForm action={assignService} className="space-y-5">
      <input type="hidden" name="service_id" value={serviceId} />
      <input type="hidden" name="stages" value={stagesJson} />

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Experto" htmlFor="expert_id" className="sm:col-span-2">
          <Select id="expert_id" name="expert_id" value={expertId} onChange={(e) => setExpertId(e.target.value)}>
            {experts.map((e) => (
              <option key={e.id} value={e.id}>
                {e.full_name} · {e.city ?? "Sin ciudad"} · ★ {Number(e.rating_avg).toFixed(1)} ({e.rating_count})
              </option>
            ))}
          </Select>
        </Field>

        {selected && (
          <div className="rounded-xl border border-border bg-slate-50 px-4 py-3 text-sm sm:col-span-2">
            <p className="font-medium">{selected.full_name}</p>
            <p className="text-xs text-slate-500">
              {selected.city ?? "Sin ciudad"} · Calificación {Number(selected.rating_avg).toFixed(1)} ({selected.rating_count}{" "}
              reseñas) · {selected.is_available ? "Disponible" : "No disponible"}
            </p>
            <p className="mt-2 text-xs font-medium uppercase tracking-wide text-slate-500">Disponibilidad semanal</p>
            {selected.availability.length === 0 ? (
              <p className="text-xs text-slate-500">Sin franjas declaradas.</p>
            ) : (
              <ul className="mt-1 flex flex-wrap gap-1.5">
                {selected.availability.map((slot, i) => (
                  <li key={i} className="rounded-md bg-white px-2 py-0.5 text-xs ring-1 ring-border">
                    {WEEKDAYS[slot.weekday]} {slot.start_time.slice(0, 5)}–{slot.end_time.slice(0, 5)}
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}

        <Field label="Precio estimado (COP)" htmlFor="estimated_price">
          <Input
            id="estimated_price"
            name="estimated_price"
            type="number"
            min={1}
            step={1}
            inputMode="numeric"
            required
            value={price}
            onChange={(e) => onPriceChange(e.target.value)}
            placeholder="Ej.: 350000"
          />
        </Field>
        <Field label="Fecha programada (opcional)" htmlFor="scheduled_at">
          <Input id="scheduled_at" name="scheduled_at" type="datetime-local" />
        </Field>
      </div>

      <div>
        <div className="mb-2 flex items-center justify-between">
          <p className="text-sm font-medium text-slate-700">Etapas de pago</p>
          <div className="flex gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setTouched(false);
                setStages(defaultStages(priceNumber));
              }}
            >
              Restablecer 50/50
            </Button>
            <Button variant="secondary" size="sm" onClick={addStage}>
              Agregar etapa
            </Button>
          </div>
        </div>

        <ol className="space-y-3">
          {stages.map((stage, index) => (
            <li key={stage.key} className="rounded-xl border border-border p-3">
              <div className="grid gap-3 sm:grid-cols-[1fr_10rem_10rem_auto]">
                <Input
                  aria-label={`Nombre de la etapa ${index + 1}`}
                  value={stage.name}
                  onChange={(e) => updateStage(stage.key, { name: e.target.value })}
                  placeholder="Nombre"
                  required
                />
                <Input
                  aria-label={`Monto de la etapa ${index + 1}`}
                  type="number"
                  min={1}
                  step={1}
                  inputMode="numeric"
                  value={stage.amount}
                  onChange={(e) => updateStage(stage.key, { amount: e.target.value })}
                  placeholder="Monto"
                  required
                />
                <Input
                  aria-label={`Fecha límite de la etapa ${index + 1}`}
                  type="date"
                  value={stage.due_date}
                  onChange={(e) => updateStage(stage.key, { due_date: e.target.value })}
                />
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeStage(stage.key)}
                  disabled={stages.length === 1}
                  aria-label={`Quitar etapa ${index + 1}`}
                >
                  Quitar
                </Button>
              </div>
              <Textarea
                aria-label={`Descripción de la etapa ${index + 1}`}
                className="mt-2 min-h-14"
                value={stage.description}
                onChange={(e) => updateStage(stage.key, { description: e.target.value })}
                placeholder="Descripción (opcional)"
              />
            </li>
          ))}
        </ol>

        <p className={`mt-2 text-sm ${sumOk ? "text-emerald-700" : "text-amber-700"}`}>
          Suma de etapas: {formatCOP(total)} · Precio: {formatCOP(priceNumber)}
          {!sumOk && priceNumber > 0 && (
            <>
              {" "}
              · {difference > 0 ? "Faltan" : "Sobran"} {formatCOP(Math.abs(difference))}
            </>
          )}
        </p>
      </div>

      <div className="flex justify-end">
        <SubmitButton disabled={!sumOk || !expertId} pendingLabel="Asignando…">
          Asignar experto
        </SubmitButton>
      </div>
    </ActionForm>
  );
}
