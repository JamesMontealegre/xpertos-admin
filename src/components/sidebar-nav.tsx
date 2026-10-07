"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/components/ui/cn";

const ITEMS = [
  { href: "/", label: "Dashboard" },
  { href: "/solicitudes", label: "Solicitudes" },
  { href: "/servicios", label: "Servicios" },
  { href: "/expertos", label: "Expertos" },
] as const;

export function SidebarNav() {
  const pathname = usePathname();
  return (
    <nav aria-label="Secciones" className="flex gap-1 overflow-x-auto lg:flex-col">
      {ITEMS.map((item) => {
        const active = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={active ? "page" : undefined}
            className={cn(
              "rounded-xl px-3 py-2 text-sm font-medium whitespace-nowrap transition-colors",
              active ? "bg-primary text-white" : "text-slate-600 hover:bg-slate-100 hover:text-foreground",
            )}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
