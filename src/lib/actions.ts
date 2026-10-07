export type ActionResult =
  | { ok: true; message?: string }
  | { ok: false; message: string }
  | null;

export function errorMessage(error: unknown, fallback = "Ocurrió un error inesperado") {
  if (!error) return fallback;
  if (typeof error === "string") return error;
  if (typeof error === "object" && "message" in error && typeof error.message === "string") {
    return error.message || fallback;
  }
  return fallback;
}

export function fail(error: unknown, fallback?: string): ActionResult {
  return { ok: false, message: errorMessage(error, fallback) };
}

export function fieldString(formData: FormData, name: string) {
  const value = formData.get(name);
  return typeof value === "string" ? value.trim() : "";
}
