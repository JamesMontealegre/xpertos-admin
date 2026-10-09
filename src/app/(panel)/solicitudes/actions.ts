"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { fail, fieldString, type ActionResult } from "@/lib/actions";

function revalidateApplication(applicationId: string) {
  revalidatePath("/solicitudes");
  revalidatePath(`/solicitudes/${applicationId}`);
  revalidatePath("/expertos");
  revalidatePath("/");
}

/** Aprobar (envía el correo de bienvenida) o rechazar con motivo. Solo con la postulación En revisión. */
export async function reviewApplication(_prev: ActionResult, formData: FormData): Promise<ActionResult> {
  const applicationId = fieldString(formData, "application_id");
  const status = fieldString(formData, "status");
  const notes = fieldString(formData, "notes");

  if (!applicationId || (status !== "approved" && status !== "rejected")) {
    return { ok: false, message: "Acción no válida." };
  }
  if (status === "rejected" && notes.length < 10) {
    return { ok: false, message: "Escribe el motivo del rechazo (mínimo 10 caracteres)." };
  }

  const supabase = await createClient();
  const { error } = await supabase.rpc("review_application", {
    p_application_id: applicationId,
    p_status: status,
    p_notes: notes || undefined,
  });
  if (error) return fail(error);

  revalidateApplication(applicationId);
  return {
    ok: true,
    message:
      status === "approved"
        ? "Postulación aprobada. Le enviamos el correo de bienvenida."
        : "Postulación rechazada. El aspirante recibió el motivo por correo y en la app.",
  };
}

/** Rechaza un documento puntual: la postulación vuelve a Pendiente y el aspirante recibe el motivo. */
export async function rejectDocument(_prev: ActionResult, formData: FormData): Promise<ActionResult> {
  const applicationId = fieldString(formData, "application_id");
  const documentId = fieldString(formData, "document_id");
  const reason = fieldString(formData, "reason");
  if (!applicationId || !documentId) return { ok: false, message: "Documento no válido." };
  if (reason.length < 5) return { ok: false, message: "Escribe el motivo del rechazo del documento." };

  const supabase = await createClient();
  const { error } = await supabase.rpc("reject_application_document", { p_document_id: documentId, p_reason: reason });
  if (error) return fail(error);

  revalidateApplication(applicationId);
  return { ok: true, message: "Documento rechazado. El aspirante recibió el motivo por correo y en la app." };
}

/** Reabre una postulación rechazada o vencida con un plazo nuevo de 15 días. */
export async function reopenApplication(_prev: ActionResult, formData: FormData): Promise<ActionResult> {
  const applicationId = fieldString(formData, "application_id");
  const notes = fieldString(formData, "notes");
  if (!applicationId) return { ok: false, message: "Postulación no válida." };

  const supabase = await createClient();
  const { error } = await supabase.rpc("review_application", {
    p_application_id: applicationId,
    p_status: "in_review",
    p_notes: notes || undefined,
  });
  if (error) return fail(error);

  revalidateApplication(applicationId);
  return { ok: true, message: "Postulación abierta de nuevo con un plazo de 15 días." };
}
