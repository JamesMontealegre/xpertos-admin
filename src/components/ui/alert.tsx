import { cn } from "./cn";

export function Alert({
  tone = "info",
  children,
  className,
}: {
  tone?: "info" | "error" | "success" | "warning";
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      role={tone === "error" ? "alert" : "status"}
      className={cn(
        "rounded-xl border px-3.5 py-2.5 text-sm",
        tone === "info" && "border-slate-200 bg-slate-50 text-slate-700",
        tone === "error" && "border-red-200 bg-red-50 text-red-800",
        tone === "success" && "border-emerald-200 bg-emerald-50 text-emerald-800",
        tone === "warning" && "border-amber-200 bg-amber-50 text-amber-900",
        className,
      )}
    >
      {children}
    </div>
  );
}
