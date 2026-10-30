"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { fail, fieldString, type ActionResult } from "@/lib/actions";

/**
 * Cambia las categorías de servicio de un experto aprobado. Son las que usa la asignación para
 * filtrar el pool; un experto sin categorías no aparece al filtrar por la actividad del servicio.
 */
export async function updateExpertCategories(_prev: ActionResult, formData: FormData): Promise<ActionResult> {
  const expertId = fieldString(formData, "expert_id");
  if (!expertId) return { ok: false, message: "Experto no válido." };
  const requested = [...new Set(formData.getAll("category_ids").filter((v): v is string => typeof v === "string" && v !== ""))];

  const supabase = await createClient();
  if (requested.length > 0) {
    const { data: known, error: readError } = await supabase.from("service_categories").select("id").in("id", requested);
    if (readError) return fail(readError);
    if ((known ?? []).length !== requested.length) return { ok: false, message: "Alguna categoría no existe." };
  }

  const { data, error } = await supabase
    .from("expert_profiles")
    .update({ category_ids: requested })
    .eq("user_id", expertId)
    .select("user_id");
  if (error) return fail(error);
  if (!data || data.length === 0) return { ok: false, message: "No encontramos el perfil del experto." };

  revalidatePath("/expertos");
  revalidatePath(`/expertos/${expertId}`);
  return {
    ok: true,
    message: requested.length === 0 ? "El experto quedó sin categorías." : "Categorías actualizadas.",
  };
}
