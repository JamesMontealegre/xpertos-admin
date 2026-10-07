import type { NextConfig } from "next";

// El panel es 100 % dinámico (lee la sesión con cookies() en cada request),
// por eso no se activa cacheComponents / partialPrefetching.
const nextConfig: NextConfig = {
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
