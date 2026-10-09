"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { logout } from "@/app/login/actions";
import { CloseIcon, CollapseIcon, ExpandIcon, LogoutIcon, MenuIcon } from "@/components/icons";
import { Logo } from "@/components/logo";
import { SidebarNav } from "@/components/sidebar-nav";
import { buttonClasses } from "@/components/ui/button";
import { cn } from "@/components/ui/cn";
import { SIDEBAR_COOKIE } from "@/lib/sidebar";

type Operator = { full_name: string; email: string | null; is_super_admin: boolean };

function RoleBadge({ superAdmin }: { superAdmin: boolean }) {
  return (
    <span
      className={cn(
        "shrink-0 rounded-full px-2 py-0.5 text-xs",
        superAdmin ? "bg-accent/10 font-semibold text-accent-hover" : "bg-slate-100 font-medium text-slate-600",
      )}
    >
      {superAdmin ? "Superadmin" : "Agente"}
    </span>
  );
}

function LogoutButton({ compact = false }: { compact?: boolean }) {
  return (
    <form action={logout} data-navigates>
      <button
        type="submit"
        className={cn(buttonClasses("ghost", "sm"), compact && "px-2")}
        aria-label={compact ? "Cerrar sesión" : undefined}
        title={compact ? "Cerrar sesión" : undefined}
      >
        {compact ? <LogoutIcon /> : "Cerrar sesión"}
      </button>
    </form>
  );
}

/**
 * Estructura del panel:
 * - Escritorio (lg+): menú lateral fijo que se colapsa a una barra de íconos. La preferencia se guarda
 *   en una cookie para que la página llegue ya con el ancho correcto.
 * - Celular y tableta: barra superior con botón de menú; el menú se abre como panel lateral.
 */
export function PanelShell({
  operator,
  initialCollapsed,
  children,
}: {
  operator: Operator;
  initialCollapsed: boolean;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(initialCollapsed);
  const [drawer, setDrawer] = useState<{ open: boolean; at: string }>({ open: false, at: pathname });
  // El panel lateral se cierra solo al navegar a otra página.
  const drawerOpen = drawer.open && drawer.at === pathname;
  const name = operator.full_name || operator.email || "";

  const toggleCollapsed = () => {
    const next = !collapsed;
    setCollapsed(next);
    document.cookie = `${SIDEBAR_COOKIE}=${next ? "collapsed" : "expanded"}; path=/; max-age=31536000; samesite=lax`;
  };

  // Panel lateral abierto: Escape lo cierra y la página de fondo no se desplaza.
  useEffect(() => {
    if (!drawerOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setDrawer((d) => ({ ...d, open: false }));
    };
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = overflow;
      window.removeEventListener("keydown", onKey);
    };
  }, [drawerOpen]);

  return (
    <div className="min-h-screen lg:flex">
      {/* Menú lateral de escritorio */}
      <aside
        className={cn(
          "sticky top-0 hidden h-screen shrink-0 flex-col border-r border-border bg-white transition-[width] duration-200 lg:flex",
          collapsed ? "w-[4.5rem]" : "w-60",
        )}
      >
        <div className={cn("flex flex-col gap-6 py-6", collapsed ? "items-center px-3" : "px-4")}>
          <Link href="/" className="block" aria-label="Xpertos, panel de operación">
            {collapsed ? (
              <Logo variant="icon" height={36} priority className="size-9" />
            ) : (
              <>
                <Logo variant="wordmark" height={34} priority className="h-[34px] w-auto" />
                <span className="mt-1.5 block text-xs font-medium tracking-wide text-slate-500 uppercase">
                  Panel de operación
                </span>
              </>
            )}
          </Link>
          <div className={cn(collapsed && "w-full")}>
            <SidebarNav collapsed={collapsed} />
          </div>
        </div>
        <div className={cn("mt-auto border-t border-border py-3", collapsed ? "px-3" : "px-4")}>
          <button
            type="button"
            onClick={toggleCollapsed}
            aria-label={collapsed ? "Mostrar el menú" : "Ocultar el menú"}
            title={collapsed ? "Mostrar el menú" : "Ocultar el menú"}
            className={cn(
              "flex w-full items-center gap-3 rounded-xl py-2 text-sm font-medium text-slate-500 hover:bg-slate-100 hover:text-foreground",
              collapsed ? "justify-center px-2" : "px-3",
            )}
          >
            {collapsed ? <ExpandIcon className="size-5 shrink-0" /> : <CollapseIcon className="size-5 shrink-0" />}
            <span className={cn(collapsed && "sr-only")}>Ocultar menú</span>
          </button>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        {/* Barra superior en celular y tableta */}
        <header className="sticky top-0 z-30 flex items-center gap-3 border-b border-border bg-white/95 px-4 py-2.5 backdrop-blur lg:hidden">
          <button
            type="button"
            onClick={() => setDrawer({ open: true, at: pathname })}
            aria-label="Abrir el menú"
            aria-expanded={drawerOpen}
            className="-ml-1 rounded-lg p-1.5 text-slate-700 hover:bg-slate-100"
          >
            <MenuIcon className="size-6" />
          </button>
          <Link href="/" aria-label="Xpertos, panel de operación" className="min-w-0">
            <Logo variant="wordmark" height={26} priority className="h-[26px] w-auto" />
          </Link>
          <div className="ml-auto flex items-center gap-1">
            <RoleBadge superAdmin={operator.is_super_admin} />
            <LogoutButton compact />
          </div>
        </header>

        {/* Encabezado en escritorio */}
        <header className="hidden items-center justify-between gap-4 border-b border-border bg-white px-8 py-3 lg:flex">
          <p className="flex min-w-0 items-center gap-2 text-sm text-slate-600">
            <span className="truncate">
              Operador: <span className="font-medium text-foreground">{name}</span>
            </span>
            <RoleBadge superAdmin={operator.is_super_admin} />
          </p>
          <LogoutButton />
        </header>

        <main className="flex-1 px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
          <div className="mx-auto max-w-screen-2xl">{children}</div>
        </main>
      </div>

      {/* Menú como panel lateral en celular y tableta */}
      <div className={cn("fixed inset-0 z-40 lg:hidden", drawerOpen ? "visible" : "invisible")} aria-hidden={!drawerOpen}>
        <button
          type="button"
          tabIndex={drawerOpen ? 0 : -1}
          aria-label="Cerrar el menú"
          onClick={() => setDrawer((d) => ({ ...d, open: false }))}
          className={cn("absolute inset-0 bg-slate-900/40 transition-opacity duration-200", drawerOpen ? "opacity-100" : "opacity-0")}
        />
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Menú"
          className={cn(
            "absolute inset-y-0 left-0 flex w-72 max-w-[85vw] flex-col bg-white shadow-xl transition-transform duration-200",
            drawerOpen ? "translate-x-0" : "-translate-x-full",
          )}
        >
          <div className="flex items-center justify-between border-b border-border px-4 py-3">
            <Logo variant="wordmark" height={28} className="h-7 w-auto" />
            <button
              type="button"
              tabIndex={drawerOpen ? 0 : -1}
              onClick={() => setDrawer((d) => ({ ...d, open: false }))}
              aria-label="Cerrar el menú"
              className="rounded-lg p-1.5 text-slate-600 hover:bg-slate-100"
            >
              <CloseIcon className="size-5" />
            </button>
          </div>
          <div className="flex-1 overflow-y-auto px-3 py-4">
            <SidebarNav />
          </div>
          <div className="space-y-2 border-t border-border px-4 py-3">
            <p className="flex min-w-0 items-center gap-2 text-sm text-slate-600">
              <span className="truncate font-medium text-foreground">{name}</span>
              <RoleBadge superAdmin={operator.is_super_admin} />
            </p>
            <LogoutButton />
          </div>
        </div>
      </div>
    </div>
  );
}
