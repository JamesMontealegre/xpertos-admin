import type { Metadata } from "next";
import Link from "next/link";
import { requireAdmin } from "@/lib/auth";
import {
  APPLICATION_STATUS,
  APPLICATION_STATUS_ORDER,
  applicationRequirements,
  payoutMethodLabel,
  type ApplicationStatus,
  type DocumentKind,
} from "@/lib/labels";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { PageHeader } from "@/components/ui/page-header";
import { EmptyRow, Table, TBody, Td, THead, Tr, type Column } from "@/components/ui/table";
import { StatusTabs } from "@/components/status-tabs";
import { buttonClasses, LinkButton } from "@/components/ui/button";
import { RequirementsBadge } from "@/components/requirements-badge";

export const metadata: Metadata = { title: "Solicitudes" };

// Tabla de ancho fijo: las columnas cortas tienen ancho fijo, "Aspirante" un porcentaje y
// "Categorías" y "Medio de pago" se reparten el resto. Por debajo de 1440 px, categorías y fecha se
// muestran dentro de la columna "Aspirante" para que nada se desborde.
const COLUMNS: Column[] = [
  { label: "Aspirante", className: "w-[30%]" },
  { label: "Categorías", className: "hidden min-[1440px]:table-cell" },
  { label: "Medio de pago" },
  { label: "Documentos", className: "w-[6.5rem]" },
  { label: "Estado", className: "w-[9.5rem]" },
  { label: "Recibida", className: "hidden w-[7rem] min-[1440px]:table-cell" },
  { label: "", className: "w-[7.5rem]" },
];

const shortDate = new Intl.DateTimeFormat("es-CO", { day: "2-digit", month: "2-digit", year: "numeric", timeZone: "America/Bogota" });

export default async function ApplicationsPage(props: PageProps<"/solicitudes">) {
  const searchParams = await props.searchParams;
  const estado = typeof searchParams.estado === "string" ? searchParams.estado : "";
  const q = typeof searchParams.q === "string" ? searchParams.q.trim() : "";
  const status = APPLICATION_STATUS_ORDER.includes(estado as ApplicationStatus) ? (estado as ApplicationStatus) : null;

  const { supabase } = await requireAdmin();

  let query = supabase
    .from("expert_applications")
    .select("id, full_name, email, city, category_ids, experience_years, status, created_at, user_id, payout_method, payout_account")
    .order("created_at", { ascending: false })
    .limit(200);
  if (status) query = query.eq("status", status);
  if (q) {
    const term = q.replace(/[%,()]/g, " ");
    query = query.or(`full_name.ilike.%${term}%,email.ilike.%${term}%`);
  }

  const [{ data: applications, error }, { data: categories }, { data: counts }] = await Promise.all([
    query,
    supabase.from("service_categories").select("id, name"),
    supabase.from("expert_applications").select("status"),
  ]);

  const ids = (applications ?? []).map((a) => a.id);
  const { data: documents } = ids.length
    ? await supabase.from("application_documents").select("application_id, kind").in("application_id", ids)
    : { data: [] as { application_id: string; kind: DocumentKind }[] };
  const kindsByApplication = new Map<string, DocumentKind[]>();
  for (const doc of documents ?? []) {
    kindsByApplication.set(doc.application_id, [...(kindsByApplication.get(doc.application_id) ?? []), doc.kind]);
  }

  const categoryName = new Map((categories ?? []).map((c) => [c.id, c.name]));
  const countByStatus = (counts ?? []).reduce<Record<string, number>>((acc, row) => {
    acc[row.status] = (acc[row.status] ?? 0) + 1;
    return acc;
  }, {});

  return (
    <>
      <PageHeader title="Solicitudes" description="Postulaciones de expertos recibidas desde la landing y la app." />

      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <StatusTabs
          basePath="/solicitudes"
          param="estado"
          current={status}
          extraParams={q ? { q } : undefined}
          tabs={[
            { value: null, label: "Todas", count: counts?.length ?? 0 },
            ...APPLICATION_STATUS_ORDER.map((s) => ({
              value: s,
              label: APPLICATION_STATUS[s].label,
              count: countByStatus[s] ?? 0,
            })),
          ]}
        />
        <form className="flex items-center gap-2" role="search">
          {status && <input type="hidden" name="estado" value={status} />}
          <Input name="q" defaultValue={q} placeholder="Buscar por nombre o email" className="w-64" aria-label="Buscar" />
          <button type="submit" className={buttonClasses("secondary", "md")}>
            Buscar
          </button>
        </form>
      </div>

      <Card>
        <Table fit>
          <THead columns={COLUMNS} />
          <TBody>
            {error && (
              <EmptyRow colSpan={COLUMNS.length}>No fue posible cargar las solicitudes: {error.message}</EmptyRow>
            )}
            {!error && (applications ?? []).length === 0 && (
              <EmptyRow colSpan={COLUMNS.length}>
                {q || status ? "No hay solicitudes que coincidan con el filtro." : "Aún no hay postulaciones."}
              </EmptyRow>
            )}
            {(applications ?? []).map((a) => {
              const requirements = applicationRequirements(kindsByApplication.get(a.id) ?? [], a.payout_method, a.payout_account);
              const categoryNames = a.category_ids.map((id) => categoryName.get(id) ?? "Categoría");
              return (
                <Tr key={a.id}>
                  <Td>
                    <Link href={`/solicitudes/${a.id}`} className="font-medium text-primary hover:underline">
                      {a.full_name}
                    </Link>
                    <p className="truncate text-xs text-slate-500" title={a.email}>
                      {a.email}
                    </p>
                    <p className="text-xs text-slate-500">
                      {[a.city, a.experience_years != null ? `${a.experience_years} años de experiencia` : null]
                        .filter(Boolean)
                        .join(" · ") || "Sin ciudad ni experiencia"}
                    </p>
                    {categoryNames.length > 0 && (
                      <p className="text-xs text-slate-500 min-[1440px]:hidden">{categoryNames.join(", ")}</p>
                    )}
                    <p className="text-xs text-slate-400 min-[1440px]:hidden">Recibida el {shortDate.format(new Date(a.created_at))}</p>
                    {!a.user_id && <p className="text-xs text-slate-400">Sin registro en la app</p>}
                  </Td>
                  <Td className="hidden min-[1440px]:table-cell">
                    <div className="flex flex-wrap gap-1">
                      {categoryNames.length === 0 && <span className="text-slate-400">—</span>}
                      {categoryNames.map((name) => (
                        <Badge key={name}>{name}</Badge>
                      ))}
                    </div>
                  </Td>
                  <Td className="break-words">
                    {a.payout_method ? (
                      <>
                        <span>{payoutMethodLabel(a.payout_method)}</span>
                        {a.payout_account && (
                          <span className="block truncate text-xs text-slate-500" title={a.payout_account}>
                            {a.payout_account}
                          </span>
                        )}
                      </>
                    ) : (
                      <Badge tone="orange">Sin elegir</Badge>
                    )}
                  </Td>
                  <Td className="whitespace-nowrap">
                    <RequirementsBadge requirements={requirements} compact />
                  </Td>
                  <Td className="whitespace-nowrap">
                    <Badge tone={APPLICATION_STATUS[a.status].tone}>{APPLICATION_STATUS[a.status].label}</Badge>
                  </Td>
                  <Td className="hidden whitespace-nowrap text-slate-600 min-[1440px]:table-cell">
                    {shortDate.format(new Date(a.created_at))}
                  </Td>
                  <Td className="whitespace-nowrap text-right">
                    <LinkButton href={`/solicitudes/${a.id}`} size="sm">
                      Ver detalle
                    </LinkButton>
                  </Td>
                </Tr>
              );
            })}
          </TBody>
        </Table>
      </Card>
    </>
  );
}
