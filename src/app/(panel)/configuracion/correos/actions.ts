"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { fail, fieldString, type ActionResult } from "@/lib/actions";

/** Vuelve a poner en cola un correo fallido y pide el envío de inmediato. */
export async function retryEmail(_prev: ActionResult, formData: FormData): Promise<ActionResult> {
  const id = fieldString(formData, "id");
  if (!id) return { ok: false, message: "Correo no válido." };

  const supabase = await createClient();
  const { error } = await supabase.rpc("retry_email", { p_id: id });
  if (error) return fail(error);

  revalidatePath("/configuracion/correos");
  return { ok: true, message: "Correo en cola de nuevo." };
}
