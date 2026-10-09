import type { NextConfig } from "next";

/**
 * Versión de cada despliegue: fecha y hora de la compilación (Colombia) + commit, p. ej.
 * "20261009.1432-eddca78". Queda dentro del código del navegador y en /api/version; cuando el servidor
 * responde otra versión, el panel se recarga solo (components/version-watcher.tsx).
 */
function buildVersion() {
  const parts = Object.fromEntries(
    new Intl.DateTimeFormat("en-CA", {
      timeZone: "America/Bogota",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      hourCycle: "h23",
    })
      .formatToParts(new Date())
      .map((p) => [p.type, p.value]),
  );
  const commit = (process.env.VERCEL_GIT_COMMIT_SHA ?? "").slice(0, 7) || "local";
  return `${parts.year}${parts.month}${parts.day}.${parts.hour}${parts.minute}-${commit}`;
}

// El panel es 100 % dinámico (lee la sesión con cookies() en cada request),
// por eso no se activa cacheComponents / partialPrefetching.
const nextConfig: NextConfig = {
  env: {
    NEXT_PUBLIC_APP_VERSION: buildVersion(),
  },
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
