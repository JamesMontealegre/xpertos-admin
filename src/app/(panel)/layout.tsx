import Link from "next/link";
import { requireAdmin } from "@/lib/auth";
import { SidebarNav } from "@/components/sidebar-nav";
import { logout } from "@/app/login/actions";
import { buttonClasses } from "@/components/ui/button";
import { Logo } from "@/components/logo";

export default async function PanelLayout({ children }: LayoutProps<"/">) {
  const { profile } = await requireAdmin();

  return (
    <div className="flex min-h-screen flex-col lg:flex-row">
      <aside className="border-b border-border bg-white lg:w-60 lg:shrink-0 lg:border-r lg:border-b-0">
        <div className="flex items-center gap-4 px-4 py-4 lg:flex-col lg:items-stretch lg:gap-6 lg:px-4 lg:py-6">
          <Link href="/" className="block shrink-0" aria-label="Xpertos, panel de operación">
            <Logo variant="wordmark" height={34} priority className="h-8 w-auto lg:h-[34px]" />
            <span className="mt-1.5 hidden text-xs font-medium tracking-wide text-slate-500 uppercase lg:block">
              Panel de operación
            </span>
          </Link>
          <SidebarNav isSuperAdmin={profile.is_super_admin} />
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex items-center justify-between gap-4 border-b border-border bg-white px-4 py-3 sm:px-8">
          <p className="truncate text-sm text-slate-600">
            Operador: <span className="font-medium text-foreground">{profile.full_name || profile.email}</span>
            <span
              className={
                profile.is_super_admin
                  ? "ml-2 rounded-full bg-accent/10 px-2 py-0.5 text-xs font-semibold text-accent-hover"
                  : "ml-2 rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-600"
              }
            >
              {profile.is_super_admin ? "Superadmin" : "Agente"}
            </span>
          </p>
          <form action={logout} data-navigates>
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
