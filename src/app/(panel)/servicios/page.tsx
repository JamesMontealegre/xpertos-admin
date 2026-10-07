import type { Metadata } from "next";
import Link from "next/link";
import { requireAdmin } from "@/lib/auth";
import { formatDate } from "@/lib/format";
import { SERVICE_STATUS, SERVICE_STATUS_ORDER, type ServiceStatus } from "@/lib/labels";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";
import { EmptyRow, Table, TBody, Td, THead, Tr } from "@/components/ui/table";
import { StatusTabs } from "@/components/status-tabs";

export const metadata: Metadata = { title: "Servicios" };

const COLUMNS = ["Título", "Categoría", "Cliente", "Experto", "Ciudad", "Estado", "Etapas pagadas", "Creado"];

export default async function ServicesPage(props: PageProps<"/servicios">) {
  const searchParams = await props.searchParams;
  const estado = typeof searchParams.estado === "string" ? searchParams.estado : "";
  const status = SERVICE_STATUS_ORDER.includes(estado as ServiceStatus) ? (estado as ServiceStatus) : null;

  const { supabase } = await requireAdmin();

  let query = supabase
    .from("services")
    .select(
      "id, title, city, status, created_at, expert_id, category:service_categories(name), client:profiles!services_client_id_fkey(full_name), stages:service_stages(status)",
    )
    .order("created_at", { ascending: false })
    .limit(200);
  if (status) query = query.eq("status", status);

  const [{ data: services, error }, { data: counts }] = await Promise.all([
    query,
    supabase.from("services").select("status"),
  ]);

  const expertIds = Array.from(new Set((services ?? []).map((s) => s.expert_id).filter((v): v is string => Boolean(v))));
  const { data: experts } = expertIds.length
    ? await supabase.from("profiles").select("id, full_name").in("id", expertIds)
    : { data: [] as Array<{ id: string; full_name: string }> };
  const expertName = new Map((experts ?? []).map((e) => [e.id, e.full_name]));

  const countByStatus = (counts ?? []).reduce<Record<string, number>>((acc, row) => {
    acc[row.status] = (acc[row.status] ?? 0) + 1;
    return acc;
  }, {});

  return (
    <>
      <PageHeader title="Servicios" description="Solicitudes de los clientes y su avance." />

      <div className="mb-4">
        <StatusTabs
          basePath="/servicios"
          param="estado"
          current={status}
          tabs={[
            { value: null, label: "Todos", count: counts?.length ?? 0 },
            ...SERVICE_STATUS_ORDER.map((s) => ({
              value: s,
              label: SERVICE_STATUS[s].label,
              count: countByStatus[s] ?? 0,
            })),
          ]}
        />
      </div>

      <Card>
        <Table>
          <THead columns={COLUMNS} />
          <TBody>
            {error && <EmptyRow colSpan={COLUMNS.length}>No fue posible cargar los servicios: {error.message}</EmptyRow>}
            {!error && (services ?? []).length === 0 && (
              <EmptyRow colSpan={COLUMNS.length}>
                {status ? "No hay servicios en este estado." : "Aún no hay servicios."}
              </EmptyRow>
            )}
            {(services ?? []).map((s) => {
              const paid = s.stages.filter((st) => st.status === "paid").length;
              return (
                <Tr key={s.id}>
                  <Td>
                    <Link href={`/servicios/${s.id}`} className="font-medium text-primary hover:underline">
                      {s.title}
                    </Link>
                  </Td>
                  <Td>{s.category?.name ?? "—"}</Td>
                  <Td>{s.client?.full_name || "—"}</Td>
                  <Td>{s.expert_id ? expertName.get(s.expert_id) ?? "Experto" : <span className="text-slate-400">Sin asignar</span>}</Td>
                  <Td>{s.city ?? "—"}</Td>
                  <Td>
                    <Badge tone={SERVICE_STATUS[s.status].tone}>{SERVICE_STATUS[s.status].label}</Badge>
                  </Td>
                  <Td>{s.stages.length === 0 ? <span className="text-slate-400">—</span> : `${paid} / ${s.stages.length}`}</Td>
                  <Td className="whitespace-nowrap text-slate-600">{formatDate(s.created_at)}</Td>
                </Tr>
              );
            })}
          </TBody>
        </Table>
      </Card>
    </>
  );
}
