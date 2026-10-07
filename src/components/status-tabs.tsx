import Link from "next/link";
import { cn } from "@/components/ui/cn";

export function StatusTabs({
  basePath,
  param,
  current,
  tabs,
  extraParams,
}: {
  basePath: string;
  param: string;
  current: string | null;
  tabs: Array<{ value: string | null; label: string; count?: number }>;
  extraParams?: Record<string, string>;
}) {
  const hrefFor = (value: string | null) => {
    const params = new URLSearchParams(extraParams);
    if (value) params.set(param, value);
    const qs = params.toString();
    return qs ? `${basePath}?${qs}` : basePath;
  };

  return (
    <div role="tablist" className="flex flex-wrap gap-1 rounded-xl border border-border bg-white p-1">
      {tabs.map((tab) => {
        const active = tab.value === current;
        return (
          <Link
            key={tab.value ?? "all"}
            href={hrefFor(tab.value)}
            role="tab"
            aria-selected={active}
            className={cn(
              "rounded-lg px-3 py-1.5 text-sm font-medium transition-colors",
              active ? "bg-primary text-white" : "text-slate-600 hover:bg-slate-100",
            )}
          >
            {tab.label}
            {tab.count !== undefined && (
              <span className={cn("ml-1.5 text-xs", active ? "text-white/80" : "text-slate-400")}>{tab.count}</span>
            )}
          </Link>
        );
      })}
    </div>
  );
}
