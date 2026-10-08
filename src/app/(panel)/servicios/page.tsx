import type { Metadata } from "next";
import Link from "next/link";
import { requireAdmin } from "@/lib/auth";
import { formatDate } from "@/lib/format";
import { PHASE_FILTER_ORDER, PHASE_INFO, isServicePhase, servicePhase } from "@/lib/service-phase";
import { ServicePhaseBarCompact } from "@/components/service-phase-bar";
import { Card } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";
import { EmptyRow, Table, TBody, Td, THead, Tr } from "@/components/ui/table";
import { StatusTabs } from "@/components/status-tabs";

export const metadata: Metadata = { title: "Servicios" };

const COLUMNS = ["Título", "Categoría", "Cliente", "Experto", "Ciudad", "Etapa", "Pagos", "Creado"];

export default async function ServicesPage(props: PageProps<"/servicios">) {
  const searchParams = await props.searchParams;
  const fase = typeof searchParams.fase === "string" ? searchParams.fase : "";
  const phaseFilter = isServicePhase(fase) ? fase : null;

  const { supabase } = await requireAdmin();

  // La etapa depende del pago del anticipo, así que se calcula aquí y se filtra en memoria.
  const { data: allServices, error } = await supabase
    .from("services")
    .select(
      "id, title, city, status, created_at, expert_id, category:service_categories(name), client:profiles!services_client_id_fkey(full_name), stages:service_stages(position, status)",
    )
    .order("created_at", { ascending: false })
    .limit(500);

  const withPhase = (allServices ?? []).map((s) => ({ ...s, phase: servicePhase(s.status, s.stages) }));
  const services = phaseFilter ? withPhase.filter((s) => s.phase === phaseFilter) : withPhase;

  const expertIds = Array.from(new Set((services ?? []).map((s) => s.expert_id).filter((v): v is string => Boolean(v))));
  const { data: experts } = expertIds.length
    ? await supabase.from("profiles").select("id, full_name").in("id", expertIds)
    : { data: [] as Array<{ id: string; full_name: string }> };
  const expertName = new Map((experts ?? []).map((e) => [e.id, e.full_name]));

  const countByPhase = withPhase.reduce<Record<string, number>>((acc, row) => {
    acc[row.phase] = (acc[row.phase] ?? 0) + 1;
    return acc;
  }, {});

  return (
    <>
      <PageHeader title="Servicios" description="Solicitudes de los clientes y su avance." />

      <div className="mb-4">
        <StatusTabs
          basePath="/servicios"
          param="fase"
          current={phaseFilter}
          tabs={[
            { value: null, label: "Todos", count: withPhase.length },
            ...PHASE_FILTER_ORDER.map((p) => ({
              value: p,
              label: PHASE_INFO[p].label,
              count: countByPhase[p] ?? 0,
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
                {phaseFilter ? "No hay servicios en esta etapa." : "Aún no hay servicios."}
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
                    <ServicePhaseBarCompact phase={s.phase} />
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
