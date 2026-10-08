"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { fail, fieldString, type ActionResult } from "@/lib/actions";
import { SERVICE_STATUS, type ServiceStatus } from "@/lib/labels";

function revalidateService(serviceId: string) {
  revalidatePath("/servicios");
  revalidatePath(`/servicios/${serviceId}`);
  revalidatePath("/expertos");
  revalidatePath("/");
}

const STATUS_TARGETS: ServiceStatus[] = ["in_review", "in_progress", "completed"];

export async function changeServiceStatus(_prev: ActionResult, formData: FormData): Promise<ActionResult> {
  const serviceId = fieldString(formData, "service_id");
  const status = fieldString(formData, "status") as ServiceStatus;
  if (!serviceId || !STATUS_TARGETS.includes(status)) {
    return { ok: false, message: "Transición no válida." };
  }

  const supabase = await createClient();
  const { error } = await supabase.from("services").update({ status }).eq("id", serviceId);
  if (error) return fail(error);

  revalidateService(serviceId);
  return { ok: true, message: `Servicio ahora en estado "${SERVICE_STATUS[status].label}".` };
}

/** Pausa un servicio en ejecución; el motivo es obligatorio y queda en el historial. */
export async function pauseService(_prev: ActionResult, formData: FormData): Promise<ActionResult> {
  const serviceId = fieldString(formData, "service_id");
  const reason = fieldString(formData, "reason");
  if (!serviceId) return { ok: false, message: "Servicio no válido." };
  if (reason.length < 5) return { ok: false, message: "Escribe el motivo de la pausa." };

  const supabase = await createClient();
  const { error } = await supabase
    .from("services")
    .update({ status: "paused", pause_reason: reason })
    .eq("id", serviceId)
    .eq("status", "in_progress");
  if (error) return fail(error);

  revalidateService(serviceId);
  return { ok: true, message: "Servicio en pausa." };
}

/** Reanuda un servicio pausado: vuelve a En ejecución (el trigger limpia el motivo). */
export async function resumeService(_prev: ActionResult, formData: FormData): Promise<ActionResult> {
  const serviceId = fieldString(formData, "service_id");
  if (!serviceId) return { ok: false, message: "Servicio no válido." };

  const supabase = await createClient();
  const { error } = await supabase
    .from("services")
    .update({ status: "in_progress" })
    .eq("id", serviceId)
    .eq("status", "paused");
  if (error) return fail(error);

  revalidateService(serviceId);
  return { ok: true, message: "Servicio reanudado." };
}

export async function cancelService(_prev: ActionResult, formData: FormData): Promise<ActionResult> {
  const serviceId = fieldString(formData, "service_id");
  const reason = fieldString(formData, "reason");
  if (!serviceId) return { ok: false, message: "Servicio no válido." };
  if (!reason) return { ok: false, message: "Escribe el motivo de la cancelación." };

  const supabase = await createClient();
  const { error } = await supabase
    .from("services")
    .update({ status: "cancelled", cancel_reason: reason })
    .eq("id", serviceId);
  if (error) return fail(error);

  revalidateService(serviceId);
  return { ok: true, message: "Servicio cancelado." };
}

export type StageInput = { name: string; amount: number; description?: string; due_date?: string };

export async function assignService(_prev: ActionResult, formData: FormData): Promise<ActionResult> {
  const serviceId = fieldString(formData, "service_id");
  const expertId = fieldString(formData, "expert_id");
  const priceRaw = fieldString(formData, "estimated_price");
  const scheduledAt = fieldString(formData, "scheduled_at");
  const stagesRaw = fieldString(formData, "stages");

  if (!serviceId) return { ok: false, message: "Servicio no válido." };
  if (!expertId) return { ok: false, message: "Selecciona un experto." };

  const price = Number(priceRaw);
  if (!Number.isFinite(price) || price <= 0) {
    return { ok: false, message: "Ingresa un precio estimado mayor a cero." };
  }

  let stages: StageInput[];
  try {
    const parsed: unknown = JSON.parse(stagesRaw || "[]");
    if (!Array.isArray(parsed)) throw new Error();
    stages = parsed.map((s: Record<string, unknown>) => ({
      name: String(s.name ?? "").trim(),
      amount: Number(s.amount),
      description: s.description ? String(s.description).trim() : undefined,
      due_date: s.due_date ? String(s.due_date) : undefined,
    }));
  } catch {
    return { ok: false, message: "Las etapas no tienen un formato válido." };
  }

  if (stages.length === 0) return { ok: false, message: "Define al menos una etapa de pago." };
  for (const [i, stage] of stages.entries()) {
    if (!stage.name) return { ok: false, message: `La etapa ${i + 1} necesita un nombre.` };
    if (!Number.isFinite(stage.amount) || stage.amount <= 0) {
      return { ok: false, message: `La etapa ${i + 1} necesita un monto mayor a cero.` };
    }
  }
  const total = stages.reduce((acc, s) => acc + s.amount, 0);
  if (Math.abs(total - price) > 0.5) {
    return { ok: false, message: "La suma de las etapas debe ser igual al precio estimado." };
  }

  const supabase = await createClient();
  const { error } = await supabase.rpc("assign_service", {
    p_service_id: serviceId,
    p_expert_id: expertId,
    p_estimated_price: price,
    p_stages: stages.map((s) => ({
      name: s.name,
      amount: s.amount,
      description: s.description ?? null,
      due_date: s.due_date ?? null,
    })),
    p_scheduled_at: scheduledAt ? new Date(scheduledAt).toISOString() : undefined,
  });
  if (error) return fail(error);

  revalidateService(serviceId);
  return { ok: true, message: "Experto asignado y etapas creadas." };
}

export async function generateContract(_prev: ActionResult, formData: FormData): Promise<ActionResult> {
  const serviceId = fieldString(formData, "service_id");
  const extraTerms = fieldString(formData, "extra_terms");
  if (!serviceId) return { ok: false, message: "Servicio no válido." };

  const supabase = await createClient();
  const { error } = await supabase.rpc("generate_contract", {
    p_service_id: serviceId,
    p_extra_terms: extraTerms || undefined,
  });
  if (error) return fail(error);

  revalidateService(serviceId);
  return { ok: true, message: "Contrato generado." };
}

export async function reviewPayment(_prev: ActionResult, formData: FormData): Promise<ActionResult> {
  const serviceId = fieldString(formData, "service_id");
  const paymentId = fieldString(formData, "payment_id");
  const decision = fieldString(formData, "decision");
  const notes = fieldString(formData, "notes");

  if (!serviceId || !paymentId || (decision !== "verified" && decision !== "rejected")) {
    return { ok: false, message: "Acción no válida." };
  }
  if (decision === "rejected" && !notes) {
    return { ok: false, message: "Indica el motivo del rechazo." };
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("payments")
    .update({ status: decision, notes: notes || null })
    .eq("id", paymentId);
  if (error) return fail(error);

  revalidateService(serviceId);
  return { ok: true, message: decision === "verified" ? "Pago verificado." : "Pago rechazado." };
}

export async function openNextStage(_prev: ActionResult, formData: FormData): Promise<ActionResult> {
  const serviceId = fieldString(formData, "service_id");
  if (!serviceId) return { ok: false, message: "Servicio no válido." };

  const supabase = await createClient();
  const { error } = await supabase.rpc("open_next_stage", { p_service_id: serviceId });
  if (error) return fail(error);

  revalidateService(serviceId);
  return { ok: true, message: "Siguiente etapa abierta para pago." };
}
