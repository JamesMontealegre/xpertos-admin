import { cn } from "./cn";

export type PhotoItem = { id: string; url: string | null; label?: string };

/**
 * Miniaturas de fotos privadas de Storage (URLs firmadas). Cada miniatura abre la foto en otra
 * pestaña. Se usa <img> porque las URLs firmadas son de un host dinámico y expiran.
 */
export function PhotoGrid({
  photos,
  size = "md",
  empty,
}: {
  photos: PhotoItem[];
  size?: "sm" | "md";
  empty?: string;
}) {
  if (photos.length === 0) {
    return empty ? <p className="text-sm text-slate-500">{empty}</p> : null;
  }
  return (
    <ul className={cn("flex flex-wrap gap-2")}>
      {photos.map((photo) => (
        <li key={photo.id}>
          {photo.url ? (
            <a
              href={photo.url}
              target="_blank"
              rel="noreferrer"
              title={photo.label ?? "Abrir foto"}
              className={cn(
                "block overflow-hidden rounded-lg border border-border bg-slate-50 hover:ring-2 hover:ring-primary/30",
                size === "sm" ? "size-14" : "size-28",
              )}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={photo.url} alt={photo.label ?? "Foto"} className="size-full object-cover" />
            </a>
          ) : (
            <span
              className={cn(
                "flex items-center justify-center rounded-lg border border-dashed border-border bg-slate-50 text-center text-[10px] text-slate-400",
                size === "sm" ? "size-14" : "size-28",
              )}
            >
              Sin vista previa
            </span>
          )}
        </li>
      ))}
    </ul>
  );
}
