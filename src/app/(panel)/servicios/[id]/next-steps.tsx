import { buttonClasses } from "@/components/ui/button";
import { cn } from "@/components/ui/cn";

export type StepState = "todo" | "waiting" | "alert" | "done";

/** "Qué sigue" del resumen: lo que le toca al equipo (o lo que se espera) en el estado actual. */
export function NextSteps({ children, footer }: { children: React.ReactNode; footer?: React.ReactNode }) {
  return (
    <div className="rounded-xl bg-primary/5 px-4 py-3 ring-1 ring-inset ring-primary/15">
      <p className="text-xs font-semibold uppercase tracking-wide text-primary">Qué sigue</p>
      <ul className="mt-2 space-y-3">{children}</ul>
      {footer && <p className="mt-3 text-xs text-slate-500">{footer}</p>}
    </div>
  );
}

const ICON: Record<StepState, { path: React.ReactNode; className: string }> = {
  todo: { path: <circle cx="12" cy="12" r="8" />, className: "text-primary" },
  waiting: { path: <path d="M7 3h10M7 21h10M8 3c0 5 8 5 8 9s-8 4-8 9M16 3c0 5-8 5-8 9s8 4 8 9" />, className: "text-blue-600" },
  alert: { path: <path d="M12 8v5M12 16.5v.5M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18Z" />, className: "text-red-600" },
  done: { path: <path d="M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18ZM8 12.5l2.5 2.5L16 9.5" />, className: "text-emerald-600" },
};

/** Un paso con su estado y, si aplica, un botón que lleva a la tarjeta donde se hace (`href="#…"`). */
export function Step({
  state,
  title,
  detail,
  action,
}: {
  state: StepState;
  title: string;
  detail?: React.ReactNode;
  action?: { label: string; href: string } | null;
}) {
  const icon = ICON[state];
  return (
    <li className="flex items-start gap-3">
      <svg viewBox="0 0 24 24" className={cn("mt-0.5 size-5 shrink-0", icon.className)} fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
        {icon.path}
      </svg>
      <div className="min-w-0 flex-1">
        <p className={cn("text-sm font-semibold", state === "done" ? "text-slate-500" : "text-foreground")}>{title}</p>
        {detail && <p className="mt-0.5 text-sm text-slate-600">{detail}</p>}
      </div>
      {action && (
        <a href={action.href} className={cn(buttonClasses(state === "todo" || state === "alert" ? "primary" : "secondary", "sm"), "shrink-0")}>
          {action.label}
        </a>
      )}
    </li>
  );
}
