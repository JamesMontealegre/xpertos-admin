import Link from "next/link";
import { requireAdmin } from "@/lib/auth";
import { formatDateTime, shortId } from "@/lib/format";
import { APPLICATION_STATUS, SERVICE_STATUS, SERVICE_STATUS_ORDER } from "@/lib/labels";
import { Badge } from "@/components/ui/badge";
import { Card, CardBody, CardHeader, StatCard } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";

type Dashboard = {
  applications_pending: number;
  services_by_status: Record<string, number>;
  payments_to_verify: number;
  experts_active: number;
  contracts_pending: number;
};

export default async function DashboardPage() {
  const { supabase } = await requireAdmin();

  const [{ data: metrics, error: metricsError }, { data: applications }, { data: services }] =
    await Promise.all([
      supabase.rpc("admin_dashboard"),
      supabase
        .from("expert_applications")
        .select("id, full_name, city, status, created_at")
        .order("created_at", { ascending: false })
        .limit(5),
      supabase
        .from("services")
        .select("id, title, city, status, created_at, category:service_categories(name)")
        .order("created_at", { ascending: false })
        .limit(5),
    ]);

  const dashboard = (metrics ?? {}) as Partial<Dashboard>;
  const byStatus = dashboard.services_by_status ?? {};
  const totalServices = Object.values(byStatus).reduce((acc, n) => acc + Number(n), 0);

  return (
    <>
      <PageHeader title="Dashboard" description="Resumen operativo de Xpertos." />

      {metricsError && (
        <p className="mb-4 text-sm text-red-700">No fue posible cargar las métricas: {metricsError.message}</p>
      )}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Postulaciones pendientes"
          value={dashboard.applications_pending ?? 0}
          hint="Pendientes, en revisión o con información faltante"
          href="/solicitudes"
        />
        <StatCard
          label="Pagos por verificar"
          value={dashboard.payments_to_verify ?? 0}
          hint="Comprobantes enviados por clientes"
          href="/servicios?estado=pending_payment"
          tone={(dashboard.payments_to_verify ?? 0) > 0 ? "accent" : "default"}
        />
        <StatCard
          label="Contratos sin firmar"
          value={dashboard.contracts_pending ?? 0}
          hint="Pendientes de firma de alguna parte"
        />
        <StatCard
          label="Expertos activos"
          value={dashboard.experts_active ?? 0}
          hint="Con disponibilidad activa"
          href="/expertos"
        />
      </div>

      <Card className="mt-6">
        <CardHeader title="Servicios por estado" description={`${totalServices} servicios en total`} />
        <CardBody>
          <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
            {SERVICE_STATUS_ORDER.map((status) => (
              <li key={status}>
                <Link
                  href={`/servicios?estado=${status}`}
                  className="block rounded-xl border border-border px-3 py-3 hover:border-primary/40 hover:bg-slate-50"
                >
                  <Badge tone={SERVICE_STATUS[status].tone}>{SERVICE_STATUS[status].label}</Badge>
                  <p className="mt-2 text-2xl font-semibold">{byStatus[status] ?? 0}</p>
                </Link>
              </li>
            ))}
          </ul>
        </CardBody>
      </Card>

      <div className="mt-6 grid gap-6 lg:grid-cols-2 [&>*]:min-w-0">
        <Card>
          <CardHeader
            title="Últimas solicitudes"
            action={
              <Link href="/solicitudes" className="text-sm font-medium text-primary hover:underline">
                Ver todas
              </Link>
            }
          />
          <ul className="divide-y divide-border">
            {(applications ?? []).length === 0 && (
              <li className="px-5 py-8 text-center text-sm text-slate-500">Aún no hay postulaciones.</li>
            )}
            {(applications ?? []).map((a) => (
              <li key={a.id}>
                <Link href={`/solicitudes/${a.id}`} className="flex items-center justify-between gap-3 px-5 py-3 hover:bg-slate-50">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">{a.full_name}</p>
                    <p className="text-xs text-slate-500">
                      {a.city ?? "Sin ciudad"} · {formatDateTime(a.created_at)}
                    </p>
                  </div>
                  <Badge tone={APPLICATION_STATUS[a.status].tone}>{APPLICATION_STATUS[a.status].label}</Badge>
                </Link>
              </li>
            ))}
          </ul>
        </Card>

        <Card>
          <CardHeader
            title="Últimos servicios"
            action={
              <Link href="/servicios" className="text-sm font-medium text-primary hover:underline">
                Ver todos
              </Link>
            }
          />
          <ul className="divide-y divide-border">
            {(services ?? []).length === 0 && (
              <li className="px-5 py-8 text-center text-sm text-slate-500">Aún no hay servicios.</li>
            )}
            {(services ?? []).map((s) => (
              <li key={s.id}>
                <Link href={`/servicios/${s.id}`} className="flex items-center justify-between gap-3 px-5 py-3 hover:bg-slate-50">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">{s.title}</p>
                    <p className="text-xs text-slate-500">
                      {s.category?.name ?? "Sin categoría"} · {s.city ?? "Sin ciudad"} ·{" "}
                      <span className="font-mono">{shortId(s.id)}</span>
                    </p>
                  </div>
                  <Badge tone={SERVICE_STATUS[s.status].tone}>{SERVICE_STATUS[s.status].label}</Badge>
                </Link>
              </li>
            ))}
          </ul>
        </Card>
      </div>
    </>
  );
}
