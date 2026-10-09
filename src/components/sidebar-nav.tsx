"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/components/ui/cn";
import { ApplicationsIcon, DashboardIcon, ExpertsIcon, MailIcon, ServicesIcon } from "@/components/icons";

const ITEMS = [
  { href: "/", label: "Dashboard", Icon: DashboardIcon },
  { href: "/solicitudes", label: "Solicitudes", Icon: ApplicationsIcon },
  { href: "/servicios", label: "Servicios", Icon: ServicesIcon },
  { href: "/expertos", label: "Expertos", Icon: ExpertsIcon },
  { href: "/configuracion/correos", label: "Correos", Icon: MailIcon },
];

/** Menú del panel. Colapsado muestra solo los íconos (el nombre queda como ayuda emergente). */
export function SidebarNav({ collapsed = false }: { collapsed?: boolean }) {
  const pathname = usePathname();
  return (
    <nav aria-label="Secciones" className="flex flex-col gap-1">
      {ITEMS.map(({ href, label, Icon }) => {
        const active = href === "/" ? pathname === "/" : pathname.startsWith(href);
        return (
          <Link
            key={href}
            href={href}
            aria-current={active ? "page" : undefined}
            title={collapsed ? label : undefined}
            className={cn(
              "flex items-center gap-3 rounded-xl py-2 text-sm font-medium transition-colors",
              collapsed ? "justify-center px-2" : "px-3",
              active ? "bg-primary text-white" : "text-slate-600 hover:bg-slate-100 hover:text-foreground",
            )}
          >
            <Icon className="size-5 shrink-0" />
            <span className={cn("truncate", collapsed && "sr-only")}>{label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
