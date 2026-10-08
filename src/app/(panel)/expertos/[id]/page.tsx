import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/auth";
import { formatCOP, formatDate, formatDateTime, formatTime } from "@/lib/format";
import { ACTIVE_SERVICE_STATUSES, SERVICE_STATUS, WEEKDAYS, payoutMethodLabel } from "@/lib/labels";
import { Badge } from "@/components/ui/badge";
import { Card, CardBody, CardHeader, DescriptionList } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";
import { EmptyRow, Table, TBody, Td, THead, Tr } from "@/components/ui/table";

export const metadata: Metadata = { title: "Detalle de experto" };

export default async function ExpertDetailPage(props: PageProps<"/expertos/[id]">) {
  const { id } = await props.params;
  const { supabase } = await requireAdmin();

  const { data: expert } = await supabase
    .from("expert_profiles")
    .select("*, profile:profiles!expert_profiles_user_id_fkey(full_name, email, phone, city, created_at), approver:profiles!expert_profiles_approved_by_fkey(full_name)")
    .eq("user_id", id)
    .maybeSingle();
  if (!expert) notFound();

  const [{ data: categories }, { data: availability }, { data: services }, { data: application }] = await Promise.all([
    supabase.from("service_categories").select("id, name"),
    supabase.from("expert_availability").select("*").eq("expert_id", id).order("weekday").order("start_time"),
    supabase
      .from("services")
      .select("id, title, status, city, estimated_price, scheduled_at, start_date, created_at, category:service_categories(name), client:profiles!services_client_id_fkey(full_name)")
      .eq("expert_id", id)
      .order("created_at", { ascending: false }),
    supabase.from("expert_applications").select("id, status").eq("user_id", id).order("created_at", { ascending: false }).limit(1).maybeSingle(),
  ]);

  const categoryName = new Map((categories ?? []).map((c) => [c.id, c.name]));
  const active = (services ?? []).filter((s) => ACTIVE_SERVICE_STATUSES.includes(s.status));

  return (
    <>
      <PageHeader
        backHref="/expertos"
        backLabel="Expertos"
        title={expert.profile?.full_name || "Experto"}
        meta={expert.is_available ? <Badge tone="green">Disponible</Badge> : <Badge tone="slate">No disponible</Badge>}
        description={`Aprobado el ${formatDateTime(expert.approved_at)}${expert.approver?.full_name ? ` por ${expert.approver.full_name}` : ""}`}
      />

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <Card>
            <CardHeader title="Perfil" />
            <CardBody className="space-y-5">
              <DescriptionList
                items={[
                  { label: "Email", value: expert.profile?.email ?? "—" },
                  { label: "Teléfono", value: expert.profile?.phone ?? "—" },
                  { label: "Ciudad", value: expert.profile?.city ?? "—" },
                  {
                    label: "Calificación",
                    value: `${Number(expert.rating_avg).toFixed(1)} / 5 (${expert.rating_count} reseñas)`,
                  },
                  {
                    label: "Categorías",
                    value: (
                      <span className="flex flex-wrap gap-1">
                        {expert.category_ids.length === 0 && "—"}
                        {expert.category_ids.map((cid) => (
                          <Badge key={cid}>{categoryName.get(cid) ?? "Categoría"}</Badge>
                        ))}
                      </span>
                    ),
                  },
                  {
                    label: "Medio de pago",
                    value: (
                      <>
                        {payoutMethodLabel(expert.payout_method)}
                        {expert.payout_account && <span className="block text-xs text-slate-500">{expert.payout_account}</span>}
                      </>
                    ),
                  },
                  {
                    label: "Postulación",
                    value: application ? (
                      <Link href={`/solicitudes/${application.id}`} className="font-medium text-primary hover:underline">
                        Ver postulación
                      </Link>
                    ) : (
                      "—"
                    ),
                  },
                ]}
              />
              {expert.bio && (
                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Reseña</p>
                  <p className="mt-1 whitespace-pre-line text-sm leading-relaxed">{expert.bio}</p>
                </div>
              )}
            </CardBody>
          </Card>

          <Card>
            <CardHeader title="Servicios asignados" description={`${active.length} activos · ${(services ?? []).length} en total`} />
            <Table>
              <THead columns={["Título", "Categoría", "Cliente", "Estado", "Total", "Inicio"]} />
              <TBody>
                {(services ?? []).length === 0 && <EmptyRow colSpan={6}>Este experto aún no tiene servicios asignados.</EmptyRow>}
                {(services ?? []).map((s) => (
                  <Tr key={s.id}>
                    <Td>
                      <Link href={`/servicios/${s.id}`} className="font-medium text-primary hover:underline">
                        {s.title}
                      </Link>
                    </Td>
                    <Td>{s.category?.name ?? "—"}</Td>
                    <Td>{s.client?.full_name || "—"}</Td>
                    <Td>
                      <Badge tone={SERVICE_STATUS[s.status].tone}>{SERVICE_STATUS[s.status].label}</Badge>
                    </Td>
                    <Td className="whitespace-nowrap">{formatCOP(s.estimated_price)}</Td>
                    <Td className="whitespace-nowrap text-slate-600">
                      {s.start_date ? formatDate(s.start_date) : s.scheduled_at ? `Visita ${formatDateTime(s.scheduled_at)}` : "—"}
                    </Td>
                  </Tr>
                ))}
              </TBody>
            </Table>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader title="Disponibilidad semanal" />
            <CardBody>
              {(availability ?? []).length === 0 ? (
                <p className="text-sm text-slate-500">El experto no ha declarado franjas de disponibilidad.</p>
              ) : (
                <ul className="divide-y divide-border text-sm">
                  {WEEKDAYS.map((day, weekday) => {
                    const slots = (availability ?? []).filter((a) => a.weekday === weekday);
                    if (slots.length === 0) return null;
                    return (
                      <li key={day} className="flex items-start justify-between gap-3 py-2">
                        <span className="font-medium">{day}</span>
                        <span className="text-right text-slate-600">
                          {slots.map((s) => (
                            <span key={s.id} className="block">
                              {formatTime(s.start_time)} – {formatTime(s.end_time)}
                            </span>
                          ))}
                        </span>
                      </li>
                    );
                  })}
                </ul>
              )}
            </CardBody>
          </Card>
        </div>
      </div>
    </>
  );
}
