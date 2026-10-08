import { cn } from "./cn";

/**
 * `fit`: la tabla ocupa el ancho disponible sin scroll horizontal (`table-fixed`: los anchos se
 * definen en las columnas del encabezado y el contenido se ajusta o se recorta dentro de cada
 * celda). Sin `fit`, la tabla tiene un ancho mínimo y scroll horizontal.
 */
export function Table({ children, className, fit = false }: { children: React.ReactNode; className?: string; fit?: boolean }) {
  if (fit) {
    return (
      <div className={className}>
        <table className="w-full table-fixed text-left text-sm">{children}</table>
      </div>
    );
  }
  return (
    <div className={cn("overflow-x-auto", className)}>
      <table className="w-full min-w-[640px] text-left text-sm">{children}</table>
    </div>
  );
}

export type Column = string | { label: string; className?: string };

export function THead({ columns }: { columns: Column[] }) {
  return (
    <thead className="border-b border-border bg-slate-50 text-xs font-medium uppercase tracking-wide text-slate-500">
      <tr>
        {columns.map((c) => {
          const label = typeof c === "string" ? c : c.label;
          return (
            <th key={label || "acciones"} scope="col" className={cn("px-4 py-3 whitespace-nowrap", typeof c === "string" ? null : c.className)}>
              {label}
            </th>
          );
        })}
      </tr>
    </thead>
  );
}

export function TBody({ children }: { children: React.ReactNode }) {
  return <tbody className="divide-y divide-border">{children}</tbody>;
}

export function Tr({ children, className }: { children: React.ReactNode; className?: string }) {
  return <tr className={cn("hover:bg-slate-50/70", className)}>{children}</tr>;
}

export function Td({ children, className }: { children: React.ReactNode; className?: string }) {
  return <td className={cn("px-4 py-3 align-middle text-foreground", className)}>{children}</td>;
}

export function EmptyRow({ colSpan, children }: { colSpan: number; children: React.ReactNode }) {
  return (
    <tr>
      <td colSpan={colSpan} className="px-4 py-12 text-center text-sm text-slate-500">
        {children}
      </td>
    </tr>
  );
}
