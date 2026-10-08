import type { Metadata } from "next";
import Link from "next/link";
import { requireAdmin } from "@/lib/auth";
import { formatDate } from "@/lib/format";
import {
  APPLICATION_STATUS,
  APPLICATION_STATUS_ORDER,
  DOCUMENT_KIND,
  REQUIRED_DOCUMENTS,
  missingRequiredDocuments,
  type ApplicationStatus,
  type DocumentKind,
} from "@/lib/labels";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { PageHeader } from "@/components/ui/page-header";
import { EmptyRow, Table, TBody, Td, THead, Tr } from "@/components/ui/table";
import { StatusTabs } from "@/components/status-tabs";
import { buttonClasses, LinkButton } from "@/components/ui/button";

export const metadata: Metadata = { title: "Solicitudes" };

const COLUMNS = ["Nombre", "Ciudad", "Categorías", "Experiencia", "Documentos", "Estado", "Fecha", "Acciones"];

export default async function ApplicationsPage(props: PageProps<"/solicitudes">) {
  const searchParams = await props.searchParams;
  const estado = typeof searchParams.estado === "string" ? searchParams.estado : "";
  const q = typeof searchParams.q === "string" ? searchParams.q.trim() : "";
  const status = APPLICATION_STATUS_ORDER.includes(estado as ApplicationStatus) ? (estado as ApplicationStatus) : null;

  const { supabase } = await requireAdmin();

  let query = supabase
    .from("expert_applications")
    .select("id, full_name, email, city, category_ids, experience_years, status, created_at, user_id")
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
        <Table>
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
              const missing = missingRequiredDocuments(kindsByApplication.get(a.id) ?? []);
              const uploaded = REQUIRED_DOCUMENTS.length - missing.length;
              return (
                <Tr key={a.id}>
                  <Td>
                    <Link href={`/solicitudes/${a.id}`} className="font-medium text-primary hover:underline">
                      {a.full_name}
                    </Link>
                    <p className="text-xs text-slate-500">{a.email}</p>
                    {!a.user_id && <p className="text-xs text-slate-400">Sin registro en la app</p>}
                  </Td>
                  <Td>{a.city ?? "—"}</Td>
                  <Td>
                    <div className="flex max-w-xs flex-wrap gap-1">
                      {a.category_ids.length === 0 && <span className="text-slate-400">—</span>}
                      {a.category_ids.map((id) => (
                        <Badge key={id}>{categoryName.get(id) ?? "Categoría"}</Badge>
                      ))}
                    </div>
                  </Td>
                  <Td className="whitespace-nowrap">{a.experience_years != null ? `${a.experience_years} años` : "—"}</Td>
                  <Td>
                    <Badge tone={missing.length === 0 ? "green" : uploaded === 0 ? "slate" : "amber"}>
                      {uploaded}/{REQUIRED_DOCUMENTS.length} requeridos
                    </Badge>
                    {missing.length > 0 && (
                      <p className="mt-1 max-w-[14rem] text-xs text-slate-500">
                        Faltan: {missing.map((kind) => DOCUMENT_KIND[kind]).join(", ")}
                      </p>
                    )}
                  </Td>
                  <Td>
                    <Badge tone={APPLICATION_STATUS[a.status].tone}>{APPLICATION_STATUS[a.status].label}</Badge>
                  </Td>
                  <Td className="whitespace-nowrap text-slate-600">{formatDate(a.created_at)}</Td>
                  <Td>
                    <LinkButton href={`/solicitudes/${a.id}`} size="sm" className="whitespace-nowrap">
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
