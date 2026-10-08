"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { fail, fieldString, type ActionResult } from "@/lib/actions";

function revalidateAccounts() {
  revalidatePath("/configuracion/cuentas");
}

/** Agrega una cuenta de recaudo (sale en el contrato y en la app del cliente si está activa). */
export async function createPaymentAccount(_prev: ActionResult, formData: FormData): Promise<ActionResult> {
  const bank = fieldString(formData, "bank");
  const accountType = fieldString(formData, "account_type");
  const accountNumber = fieldString(formData, "account_number");
  const holder = fieldString(formData, "holder");
  const holderId = fieldString(formData, "holder_id");
  const sortOrder = Number(fieldString(formData, "sort_order") || "0");

  if (!bank) return { ok: false, message: "Indica el banco o la billetera." };
  if (!accountType) return { ok: false, message: "Indica el tipo de cuenta." };
  if (!accountNumber) return { ok: false, message: "Indica el número de la cuenta." };
  if (!holder) return { ok: false, message: "Indica el titular." };
  if (!Number.isInteger(sortOrder)) return { ok: false, message: "El orden debe ser un número entero." };

  const supabase = await createClient();
  const { error } = await supabase.from("payment_accounts").insert({
    bank,
    account_type: accountType,
    account_number: accountNumber,
    holder,
    holder_id: holderId || null,
    sort_order: sortOrder,
  });
  if (error) return fail(error);

  revalidateAccounts();
  return { ok: true, message: "Cuenta agregada." };
}

export async function setPaymentAccountActive(_prev: ActionResult, formData: FormData): Promise<ActionResult> {
  const id = fieldString(formData, "id");
  const active = fieldString(formData, "active") === "true";
  if (!id) return { ok: false, message: "Cuenta no válida." };

  const supabase = await createClient();
  const { error } = await supabase.from("payment_accounts").update({ active }).eq("id", id);
  if (error) return fail(error);

  revalidateAccounts();
  return { ok: true, message: active ? "Cuenta activada." : "Cuenta desactivada." };
}
