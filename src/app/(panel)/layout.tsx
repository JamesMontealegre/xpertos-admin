import Link from "next/link";
import { requireAdmin } from "@/lib/auth";
import { SidebarNav } from "@/components/sidebar-nav";
import { logout } from "@/app/login/actions";
import { buttonClasses } from "@/components/ui/button";

export default async function PanelLayout({ children }: LayoutProps<"/">) {
  const { profile } = await requireAdmin();

  return (
    <div className="flex min-h-screen flex-col lg:flex-row">
      <aside className="border-b border-border bg-white lg:w-60 lg:shrink-0 lg:border-r lg:border-b-0">
        <div className="flex items-center gap-4 px-4 py-4 lg:flex-col lg:items-stretch lg:gap-6 lg:px-4 lg:py-6">
          <Link href="/" className="flex items-center gap-2.5">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-sm font-bold text-white">X</span>
            <span className="leading-tight">
              <span className="block text-base font-semibold">Xpertos</span>
              <span className="block text-xs text-slate-500">Panel de operación</span>
            </span>
          </Link>
          <SidebarNav />
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex items-center justify-between gap-4 border-b border-border bg-white px-4 py-3 sm:px-8">
          <p className="truncate text-sm text-slate-600">
            Operador: <span className="font-medium text-foreground">{profile.full_name || profile.email}</span>
          </p>
          <form action={logout}>
            <button type="submit" className={buttonClasses("ghost", "sm")}>
              Cerrar sesión
            </button>
          </form>
        </header>
        <main className="flex-1 px-4 py-6 sm:px-8 sm:py-8">
          <div className="mx-auto max-w-screen-2xl">{children}</div>
        </main>
      </div>
    </div>
  );
}
