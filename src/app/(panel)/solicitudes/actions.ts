"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { fail, fieldString, type ActionResult } from "@/lib/actions";
import { APPLICATION_STATUS, type ApplicationStatus } from "@/lib/labels";

const ALLOWED: ApplicationStatus[] = ["in_review", "needs_info", "rejected", "approved"];

export async function reviewApplication(_prev: ActionResult, formData: FormData): Promise<ActionResult> {
  const applicationId = fieldString(formData, "application_id");
  const status = fieldString(formData, "status") as ApplicationStatus;
  const notes = fieldString(formData, "notes");

  if (!applicationId || !ALLOWED.includes(status)) {
    return { ok: false, message: "Acción no válida." };
  }
  if (status === "needs_info" && !notes) {
    return { ok: false, message: "Escribe en las notas qué información falta para el aspirante." };
  }
  if (status === "rejected" && notes.length < 10) {
    return { ok: false, message: "Escribe la justificación del rechazo (mínimo 10 caracteres)." };
  }
  if (status === "approved" && notes.length < 10) {
    return { ok: false, message: "Escribe la justificación de la aprobación (mínimo 10 caracteres)." };
  }

  const supabase = await createClient();
  const { error } = await supabase.rpc("review_application", {
    p_application_id: applicationId,
    p_status: status,
    p_notes: notes || undefined,
  });
  if (error) return fail(error);

  revalidatePath("/solicitudes");
  revalidatePath(`/solicitudes/${applicationId}`);
  revalidatePath("/expertos");
  revalidatePath("/");
  return { ok: true, message: `Postulación marcada como "${APPLICATION_STATUS[status].label}".` };
}

/** Reabre una postulación rechazada: vuelve a "En revisión" y reemplaza la justificación del rechazo. */
export async function reopenApplication(_prev: ActionResult, formData: FormData): Promise<ActionResult> {
  const applicationId = fieldString(formData, "application_id");
  const notes = fieldString(formData, "notes") || "Postulación reabierta para una nueva revisión.";
  if (!applicationId) return { ok: false, message: "Postulación no válida." };

  const supabase = await createClient();
  const { data: current, error: readError } = await supabase
    .from("expert_applications")
    .select("status")
    .eq("id", applicationId)
    .maybeSingle();
  if (readError) return fail(readError);
  if (current?.status !== "rejected") {
    return { ok: false, message: "Solo se pueden abrir postulaciones rechazadas." };
  }

  const { error } = await supabase.rpc("review_application", {
    p_application_id: applicationId,
    p_status: "in_review",
    p_notes: notes,
  });
  if (error) return fail(error);

  revalidatePath("/solicitudes");
  revalidatePath(`/solicitudes/${applicationId}`);
  revalidatePath("/");
  return { ok: true, message: "Postulación abierta de nuevo: quedó en revisión." };
}

export async function saveApplicationNotes(_prev: ActionResult, formData: FormData): Promise<ActionResult> {
  const applicationId = fieldString(formData, "application_id");
  const notes = fieldString(formData, "notes");
  if (!applicationId) return { ok: false, message: "Postulación no válida." };

  const supabase = await createClient();
  const { error } = await supabase
    .from("expert_applications")
    .update({ admin_notes: notes || null })
    .eq("id", applicationId);
  if (error) return fail(error);

  revalidatePath(`/solicitudes/${applicationId}`);
  return { ok: true, message: "Notas guardadas." };
}
