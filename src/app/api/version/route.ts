/** Versión del despliegue que está sirviendo el panel (sin caché). La consulta components/version-watcher.tsx. */
export const dynamic = "force-dynamic";

export function GET() {
  return Response.json(
    { version: process.env.NEXT_PUBLIC_APP_VERSION ?? "local" },
    { headers: { "Cache-Control": "no-store, max-age=0" } },
  );
}
