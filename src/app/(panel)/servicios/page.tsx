import type { Metadata } from "next";
import Link from "next/link";
import { requireAdmin } from "@/lib/auth";
import { formatCOP, formatDate } from "@/lib/format";
import { SERVICE_STATUS, SERVICE_STATUS_ORDER, isServiceStatus } from "@/lib/labels";
import { ServicePhaseBarCompact } from "@/components/service-phase-bar";
import { Card } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";
import { EmptyRow, Table, TBody, Td, THead, Tr, type Column } from "@/components/ui/table";
import { StatusTabs } from "@/components/status-tabs";

export const metadata: Metadata = { title: "Servicios" };

// Bajo 1440 px, categoría, ciudad y fecha van dentro de la primera columna.
const COLUMNS: Column[] = [
  { label: "Servicio" },
  { label: "Categoría", className: "hidden w-[9rem] min-[1440px]:table-cell" },
  { label: "Cliente", className: "w-[11rem]" },
  { label: "Experto", className: "w-[11rem]" },
  { label: "Ciudad", className: "hidden w-[8rem] min-[1440px]:table-cell" },
  { label: "Estado", className: "w-[11rem]" },
  { label: "Total", className: "w-[8rem]" },
  { label: "Creado", className: "hidden w-[7rem] min-[1440px]:table-cell" },
];

export default async function ServicesPage(props: PageProps<"/servicios">) {
  const searchParams = await props.searchParams;
  const estado = typeof searchParams.estado === "string" ? searchParams.estado : "";
  const statusFilter = isServiceStatus(estado) ? estado : null;

  const { supabase } = await requireAdmin();

  let query = supabase
    .from("services")
    .select(
      "id, title, city, status, estimated_price, created_at, expert_id, category:service_categories(name), client:profiles!services_client_id_fkey(full_name)",
    )
    .order("created_at", { ascending: false })
    .limit(500);
  if (statusFilter) query = query.eq("status", statusFilter);

  const [{ data: services, error }, { data: statuses }] = await Promise.all([
    query,
    supabase.from("services").select("status"),
  ]);

  const expertIds = Array.from(new Set((services ?? []).map((s) => s.expert_id).filter((v): v is string => Boolean(v))));
  const { data: experts } = expertIds.length
    ? await supabase.from("profiles").select("id, full_name").in("id", expertIds)
    : { data: [] as Array<{ id: string; full_name: string }> };
  const expertName = new Map((experts ?? []).map((e) => [e.id, e.full_name]));

  const countByStatus = (statuses ?? []).reduce<Record<string, number>>((acc, row) => {
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
          current={statusFilter}
          tabs={[
            { value: null, label: "Todos", count: statuses?.length ?? 0 },
            ...SERVICE_STATUS_ORDER.map((s) => ({
              value: s,
              label: SERVICE_STATUS[s].label,
              count: countByStatus[s] ?? 0,
            })),
          ]}
        />
      </div>

      <Card>
        <Table fit stack="lg">
          <THead columns={COLUMNS} />
          <TBody>
            {error && <EmptyRow colSpan={COLUMNS.length}>No fue posible cargar los servicios: {error.message}</EmptyRow>}
            {!error && (services ?? []).length === 0 && (
              <EmptyRow colSpan={COLUMNS.length}>
                {statusFilter ? `No hay servicios en estado "${SERVICE_STATUS[statusFilter].label}".` : "Aún no hay servicios."}
              </EmptyRow>
            )}
            {(services ?? []).map((s) => (
              <Tr key={s.id}>
                <Td className="break-words">
                  <Link href={`/servicios/${s.id}`} className="font-medium text-primary hover:underline">
                    {s.title}
                  </Link>
                  <p className="text-xs text-slate-500 min-[1440px]:hidden">
                    {[s.category?.name, s.city].filter(Boolean).join(" · ") || "—"}
                  </p>
                  <p className="text-xs text-slate-400 min-[1440px]:hidden">Creado el {formatDate(s.created_at)}</p>
                </Td>
                <Td className="hidden min-[1440px]:table-cell">{s.category?.name ?? "—"}</Td>
                <Td className="break-words">{s.client?.full_name || "—"}</Td>
                <Td className="break-words">
                  {s.expert_id ? expertName.get(s.expert_id) ?? "Experto" : <span className="text-slate-400">Sin asignar</span>}
                </Td>
                <Td className="hidden min-[1440px]:table-cell">{s.city ?? "—"}</Td>
                <Td>
                  <ServicePhaseBarCompact status={s.status} />
                </Td>
                <Td className="whitespace-nowrap">
                  {s.estimated_price != null ? formatCOP(s.estimated_price) : <span className="text-slate-400">—</span>}
                </Td>
                <Td className="hidden whitespace-nowrap text-slate-600 min-[1440px]:table-cell">{formatDate(s.created_at)}</Td>
              </Tr>
            ))}
          </TBody>
        </Table>
      </Card>
    </>
  );
}
