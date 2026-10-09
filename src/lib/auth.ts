import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export async function requireAdmin() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("id, full_name, email, role, is_super_admin")
    .eq("id", user.id)
    .maybeSingle();

  if (!profile || profile.role !== "admin") redirect("/login?error=sin_acceso");

  return { supabase, user, profile };
}

/** Páginas de configuración: solo el superadmin. Un agente vuelve al dashboard. */
export async function requireSuperAdmin() {
  const ctx = await requireAdmin();
  if (!ctx.profile.is_super_admin) redirect("/");
  return ctx;
}
