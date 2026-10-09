import type { NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/proxy";

export async function proxy(request: NextRequest) {
  return updateSession(request);
}

export const config = {
  matcher: [
    // /api/version es pública y liviana: la consulta el panel cada minuto para saber si hay versión nueva.
    "/((?!_next/static|_next/image|favicon.ico|api/version|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)",
  ],
};
