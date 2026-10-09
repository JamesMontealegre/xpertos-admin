import { Children, cloneElement, isValidElement, type ReactElement, type ReactNode } from "react";
import { cn } from "./cn";

export type Column = string | { label: string; className?: string };
const labelOf = (column: Column) => (typeof column === "string" ? column : column.label);

/** Debajo de qué ancho DEL CONTENEDOR la tabla se apila como tarjetas: "md" (600 px), "lg" (900 px) o nunca. */
type Stack = "md" | "lg" | false;

/**
 * `fit`: la tabla ocupa el ancho disponible sin scroll horizontal (`table-fixed`: los anchos se
 * definen en las columnas del encabezado y el contenido se ajusta o se recorta dentro de cada
 * celda). Sin `fit`, la tabla tiene un ancho mínimo y scroll horizontal.
 *
 * `stack`: cuando no hay espacio, cada fila se muestra como una tarjeta y cada dato lleva el nombre de
 * su columna (lo toma del encabezado). Se mide el ancho del contenedor, no de la pantalla, así que
 * abrir o colapsar el menú lateral cuenta. Por defecto bajo 600 px; "lg" (900 px) para tablas con
 * muchas columnas. Los estilos están en globals.css (`.xp-table-wrap`, `.xp-stack-md`, `.xp-stack-lg`).
 */
export function Table({
  children,
  className,
  fit = false,
  stack = "md",
}: {
  children: ReactNode;
  className?: string;
  fit?: boolean;
  stack?: Stack;
}) {
  let labels: string[] = [];
  Children.forEach(children, (child) => {
    if (isValidElement<{ columns?: Column[] }>(child) && child.type === THead) {
      labels = (child.props.columns ?? []).map(labelOf);
    }
  });
  const content = Children.map(children, (child) =>
    isValidElement(child) && child.type === TBody ? cloneElement(child as ReactElement<TBodyProps>, { labels }) : child,
  );
  const stackClass = stack === "lg" ? "xp-stack-lg" : stack === "md" ? "xp-stack-md" : undefined;

  if (fit) {
    return (
      <div className={cn("xp-table-wrap", className)}>
        <table className={cn("w-full table-fixed text-left text-sm", stackClass)}>{content}</table>
      </div>
    );
  }
  return (
    <div className={cn("xp-table-wrap overflow-x-auto", className)}>
      <table className={cn("w-full min-w-[640px] text-left text-sm", stackClass)}>{content}</table>
    </div>
  );
}

export function THead({ columns }: { columns: Column[] }) {
  return (
    <thead className="border-b border-border bg-slate-50 text-xs font-medium uppercase tracking-wide text-slate-500">
      <tr>
        {columns.map((c) => {
          const label = labelOf(c);
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

type TBodyProps = { children: ReactNode; labels?: string[] };

export function TBody({ children, labels }: TBodyProps) {
  return (
    <tbody className="divide-y divide-border">
      {labels?.length
        ? Children.map(children, (child) =>
            isValidElement(child) && child.type === Tr ? cloneElement(child as ReactElement<TrProps>, { labels }) : child,
          )
        : children}
    </tbody>
  );
}

type TrProps = { children: ReactNode; className?: string; labels?: string[] };

export function Tr({ children, className, labels }: TrProps) {
  return (
    <tr className={cn("hover:bg-slate-50/70", className)}>
      {labels?.length
        ? Children.map(children, (child, i) =>
            isValidElement(child) && child.type === Td ? cloneElement(child as ReactElement<TdProps>, { label: labels[i] }) : child,
          )
        : children}
    </tr>
  );
}

type TdProps = { children?: ReactNode; className?: string; label?: string };

export function Td({ children, className, label }: TdProps) {
  return (
    <td data-label={label} className={cn("px-4 py-3 align-middle text-foreground", className)}>
      {children}
    </td>
  );
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
