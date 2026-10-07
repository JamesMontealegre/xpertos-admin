import Link from "next/link";
import { buttonClasses } from "@/components/ui/button";

export default function NotFound() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4 px-4 text-center">
      <p className="text-sm font-medium uppercase tracking-wide text-slate-500">Error 404</p>
      <h1 className="text-2xl font-semibold tracking-tight">No encontramos esta página</h1>
      <p className="max-w-sm text-sm text-slate-500">
        El registro puede haber sido eliminado o el enlace no es correcto.
      </p>
      <Link href="/" className={buttonClasses("primary")}>
        Ir al dashboard
      </Link>
    </main>
  );
}
