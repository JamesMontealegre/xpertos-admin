import { isImagePath, isPdfPath } from "@/lib/storage";

/**
 * Vista previa de un archivo privado de Storage con URL firmada.
 * Se usa <img> porque las URLs firmadas apuntan a un host dinámico (Supabase)
 * y expiran en 60 s, lo que no se presta para la optimización de next/image.
 */
export function FilePreview({
  url,
  path,
  mime,
  name,
}: {
  url: string | null;
  path: string;
  mime?: string | null;
  name?: string;
}) {
  const label = name ?? path.split("/").pop() ?? "archivo";

  if (!url) {
    return (
      <div className="rounded-xl border border-dashed border-border bg-slate-50 px-3 py-6 text-center text-xs text-slate-500">
        No fue posible generar la URL firmada de <span className="font-mono">{label}</span>.
      </div>
    );
  }

  if (isImagePath(path, mime)) {
    return (
      <a href={url} target="_blank" rel="noreferrer" className="block overflow-hidden rounded-xl border border-border bg-slate-50">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={url} alt={label} className="max-h-72 w-full object-contain" />
      </a>
    );
  }

  if (isPdfPath(path, mime)) {
    return (
      <div className="overflow-hidden rounded-xl border border-border bg-slate-50">
        <iframe src={url} title={label} className="h-72 w-full" />
      </div>
    );
  }

  return (
    <a href={url} target="_blank" rel="noreferrer" className="text-sm font-medium text-primary hover:underline">
      Abrir {label}
    </a>
  );
}
