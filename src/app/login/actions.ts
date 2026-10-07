"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { fieldString, type ActionResult } from "@/lib/actions";

const AUTH_ERRORS: Record<string, string> = {
  invalid_credentials: "Correo o contraseña incorrectos.",
  email_not_confirmed: "El correo aún no ha sido confirmado.",
  over_request_rate_limit: "Demasiados intentos. Espera un momento e inténtalo de nuevo.",
};

export async function login(_prev: ActionResult, formData: FormData): Promise<ActionResult> {
  const email = fieldString(formData, "email");
  const password = fieldString(formData, "password");

  if (!email || !password) {
    return { ok: false, message: "Ingresa tu correo y tu contraseña." };
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    const code = (error as { code?: string }).code ?? "";
    return { ok: false, message: AUTH_ERRORS[code] ?? "No fue posible iniciar sesión. Verifica tus datos." };
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", data.user.id)
    .maybeSingle();

  if (profile?.role !== "admin") {
    await supabase.auth.signOut();
    return { ok: false, message: "Esta cuenta no tiene acceso al panel." };
  }

  redirect("/");
}

export async function logout() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}
