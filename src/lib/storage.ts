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

/** URLs firmadas de 60 s para varios objetos de un bucket, en una sola llamada. */
export async function signedUrlMap(
  supabase: SupabaseClient<Database>,
  bucket: Bucket,
  paths: Array<string | null | undefined>,
) {
  const unique = Array.from(new Set(paths.filter((p): p is string => Boolean(p))));
  const map = new Map<string, string>();
  if (unique.length === 0) return map;
  const { data, error } = await supabase.storage.from(bucket).createSignedUrls(unique, 60);
  if (error || !data) return map;
  for (const item of data) {
    if (item.path && item.signedUrl && !item.error) map.set(item.path, item.signedUrl);
  }
  return map;
}

export function isImagePath(path: string | null | undefined, mime?: string | null) {
  if (mime) return mime.startsWith("image/");
  return /\.(png|jpe?g|webp|gif)$/i.test(path ?? "");
}

export function isPdfPath(path: string | null | undefined, mime?: string | null) {
  if (mime) return mime === "application/pdf";
  return /\.pdf$/i.test(path ?? "");
}
