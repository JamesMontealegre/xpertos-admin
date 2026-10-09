"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { fail, fieldString, type ActionResult } from "@/lib/actions";
import { PAYOUT_METHOD_ORDER, SERVICE_STATUS, isServiceStatus, type PayoutMethod } from "@/lib/labels";
import { flowIndex } from "@/lib/service-phase";

function revalidateService(serviceId: string) {
  revalidatePath("/servicios");
  revalidatePath(`/servicios/${serviceId}`);
  revalidatePath(`/servicios/${serviceId}/contrato`);
  revalidatePath("/expertos");
  revalidatePath("/");
}

/**
 * Avanza o regresa el servicio un paso (`admin_move_service`). La base valida que el paso sea
 * adyacente y hace los ajustes; al regresar el motivo es obligatorio.
 */
export async function moveService(_prev: ActionResult, formData: FormData): Promise<ActionResult> {
  const serviceId = fieldString(formData, "service_id");
  const target = fieldString(formData, "target");
  const reason = fieldString(formData, "reason");
  if (!serviceId || !isServiceStatus(target)) return { ok: false, message: "Paso no válido." };

  const supabase = await createClient();
  const { data: current, error: readError } = await supabase.from("services").select("status").eq("id", serviceId).maybeSingle();
  if (readError) return fail(readError);
  if (!current) return { ok: false, message: "El servicio no existe." };

  const backwards = flowIndex(target) < flowIndex(current.status);
  if (backwards && reason.length < 5) return { ok: false, message: "Escribe el motivo para regresar el servicio." };

  const { error } = await supabase.rpc("admin_move_service", {
    p_service_id: serviceId,
    p_target: target,
    p_reason: reason || undefined,
  });
  if (error) return fail(error);

  revalidateService(serviceId);
  return { ok: true, message: `Servicio ahora en "${SERVICE_STATUS[target].label}".` };
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

/** Asigna (o reasigna) un experto del pool. El experto arma la cotización desde su app. */
export async function assignService(_prev: ActionResult, formData: FormData): Promise<ActionResult> {
  const serviceId = fieldString(formData, "service_id");
  const expertId = fieldString(formData, "expert_id");
  const scheduledAt = fieldString(formData, "scheduled_at");

  if (!serviceId) return { ok: false, message: "Servicio no válido." };
  if (!expertId) return { ok: false, message: "Selecciona un experto." };

  // datetime-local llega sin zona horaria: es hora de Colombia (UTC-5, sin horario de verano).
  let scheduledIso: string | undefined;
  if (scheduledAt) {
    const date = new Date(`${scheduledAt.length === 16 ? `${scheduledAt}:00` : scheduledAt}-05:00`);
    if (Number.isNaN(date.getTime())) return { ok: false, message: "La fecha de visita no es válida." };
    scheduledIso = date.toISOString();
  }

  const supabase = await createClient();
  const { error } = await supabase.rpc("assign_service", {
    p_service_id: serviceId,
    p_expert_id: expertId,
    p_scheduled_at: scheduledIso,
  });
  if (error) return fail(error);

  revalidateService(serviceId);
  return { ok: true, message: "Experto asignado. Ahora debe enviar la cotización desde su app." };
}

/** Montos de los campos numéricos (input type="number"); NaN si está vacío o no es número. */
function parseAmount(raw: string) {
  if (!raw) return NaN;
  const n = Number(raw);
  return Number.isFinite(n) ? n : NaN;
}

/**
 * Presenta la cotización al cliente con dos opciones: solo mano de obra y todo incluido (mano de obra +
 * materiales). El cliente elige en su app. Sin materiales hay una sola opción y se le cobra de una vez.
 */
export async function approveQuote(_prev: ActionResult, formData: FormData): Promise<ActionResult> {
  const serviceId = fieldString(formData, "service_id");
  const hasMaterials = fieldString(formData, "has_materials") === "1";
  const labor = parseAmount(fieldString(formData, "labor_total"));
  const materials = hasMaterials ? parseAmount(fieldString(formData, "materials_total")) : 0;
  const commission = Number(fieldString(formData, "commission_pct"));
  const notes = fieldString(formData, "notes");

  if (!serviceId) return { ok: false, message: "Servicio no válido." };
  if (!Number.isFinite(labor) || labor <= 0) return { ok: false, message: "La mano de obra aprobada debe ser mayor a cero." };
  if (hasMaterials && (!Number.isFinite(materials) || materials <= 0)) {
    return { ok: false, message: "Indica el valor de los materiales para la opción todo incluido." };
  }
  if (!Number.isFinite(commission) || commission < 0 || commission > 100) {
    return { ok: false, message: "La comisión debe estar entre 0 y 100 %." };
  }

  const supabase = await createClient();
  const { data: service, error: readError } = await supabase
    .from("services")
    .select("commission_pct")
    .eq("id", serviceId)
    .maybeSingle();
  if (readError) return fail(readError);
  if (!service) return { ok: false, message: "El servicio no existe." };

  // La comisión se guarda antes de aprobar porque el contrato se genera con ella.
  const previousCommission = Number(service.commission_pct);
  const commissionChanged = Math.abs(previousCommission - commission) > 0.001;
  if (commissionChanged) {
    const { error } = await supabase.from("services").update({ commission_pct: commission }).eq("id", serviceId);
    if (error) return fail(error);
  }

  const { error } = await supabase.rpc("approve_quote", {
    p_service_id: serviceId,
    p_labor_total: labor,
    p_materials_total: materials,
    p_notes: notes || undefined,
  });
  if (error) {
    if (commissionChanged) await supabase.from("services").update({ commission_pct: previousCommission }).eq("id", serviceId);
    return fail(error);
  }

  revalidateService(serviceId);
  return {
    ok: true,
    message: hasMaterials
      ? "Cotización presentada al cliente: elegirá entre solo mano de obra y todo incluido."
      : "Cotización aprobada. Sin materiales hay una sola opción: el servicio quedó Pendiente de pago.",
  };
}

/** Registra la opción que eligió el cliente (p. ej. por teléfono): crea el cobro y pasa a Pendiente de pago. */
export async function choosePricingMode(_prev: ActionResult, formData: FormData): Promise<ActionResult> {
  const serviceId = fieldString(formData, "service_id");
  const mode = fieldString(formData, "pricing_mode");
  if (!serviceId || (mode !== "labor_only" && mode !== "all_inclusive")) return { ok: false, message: "Opción no válida." };

  const supabase = await createClient();
  const { error } = await supabase.rpc("choose_pricing_mode", { p_service_id: serviceId, p_mode: mode });
  if (error) return fail(error);

  revalidateService(serviceId);
  return { ok: true, message: "Opción registrada. El servicio quedó Pendiente de pago." };
}

/** Devuelve la cotización al experto con el motivo; el servicio vuelve a Asignado. */
export async function returnQuote(_prev: ActionResult, formData: FormData): Promise<ActionResult> {
  const serviceId = fieldString(formData, "service_id");
  const notes = fieldString(formData, "notes");
  if (!serviceId) return { ok: false, message: "Servicio no válido." };
  if (notes.length < 5) return { ok: false, message: "Escribe qué debe corregir el experto." };

  const supabase = await createClient();
  const { error } = await supabase.rpc("return_quote", { p_service_id: serviceId, p_notes: notes });
  if (error) return fail(error);

  revalidateService(serviceId);
  return { ok: true, message: "Cotización devuelta al experto." };
}

/** Regenera el contrato con los datos actuales (invalida las firmas existentes). */
export async function regenerateContract(_prev: ActionResult, formData: FormData): Promise<ActionResult> {
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
  return { ok: true, message: "Contrato regenerado." };
}

/** Verifica o rechaza un comprobante. Al verificar el cobro, la base pasa el servicio a Programado. */
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

/** Registra un pago de Xpertos al experto. */
export async function registerPayout(_prev: ActionResult, formData: FormData): Promise<ActionResult> {
  const serviceId = fieldString(formData, "service_id");
  const expertId = fieldString(formData, "expert_id");
  const amount = parseAmount(fieldString(formData, "amount"));
  const method = fieldString(formData, "method") as PayoutMethod;
  const account = fieldString(formData, "account");
  const reference = fieldString(formData, "reference");
  const period = fieldString(formData, "period_label");

  if (!serviceId || !expertId) return { ok: false, message: "Servicio no válido." };
  if (!Number.isFinite(amount) || amount <= 0) return { ok: false, message: "El monto debe ser mayor a cero." };
  if (!PAYOUT_METHOD_ORDER.includes(method)) return { ok: false, message: "Selecciona el medio de pago." };

  const supabase = await createClient();
  const { error } = await supabase.from("expert_payouts").insert({
    service_id: serviceId,
    expert_id: expertId,
    amount,
    method,
    account: account || null,
    reference: reference || null,
    period_label: period || null,
  });
  if (error) return fail(error);

  revalidateService(serviceId);
  return { ok: true, message: "Pago al experto registrado." };
}
