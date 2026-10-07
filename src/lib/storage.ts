import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/database.types";

export type Bucket = "expert-documents" | "service-photos" | "payment-proofs" | "signatures";

/** URL firmada de 60 s; devuelve null si el objeto no existe o no hay permiso. */
export async function signedUrl(
  supabase: SupabaseClient<Database>,
  bucket: Bucket,
  path: string | null | undefined,
) {
  if (!path) return null;
  const { data, error } = await supabase.storage.from(bucket).createSignedUrl(path, 60);
  if (error) return null;
  return data.signedUrl;
}

export function isImagePath(path: string | null | undefined, mime?: string | null) {
  if (mime) return mime.startsWith("image/");
  return /\.(png|jpe?g|webp|gif)$/i.test(path ?? "");
}

export function isPdfPath(path: string | null | undefined, mime?: string | null) {
  if (mime) return mime === "application/pdf";
  return /\.pdf$/i.test(path ?? "");
}
