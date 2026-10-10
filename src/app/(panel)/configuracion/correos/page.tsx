import type { Metadata } from "next";
import Link from "next/link";
import { requireAdmin } from "@/lib/auth";
import { formatDateTime } from "@/lib/format";
import { EMAIL_AUDIENCE_LABEL, EMAIL_MAX_ATTEMPTS, EMAIL_TEMPLATE_LABEL } from "@/lib/labels";
import { ActionButton } from "@/components/ui/action-form";
import { Badge } from "@/components/ui/badge";
import { Card, CardBody } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";
import { EmptyRow, Table, TBody, Td, THead, Tr, type Column } from "@/components/ui/table";
import { StatusTabs } from "@/components/status-tabs";
import { retryEmail } from "./actions";

export const metadata: Metadata = { title: "Correos" };

const COLUMNS: Column[] = [
  { label: "Fecha", className: "w-36" },
  { label: "Para", className: "w-[28%]" },
  { label: "Correo" },
  { label: "Estado", className: "w-48" },
  { label: "", className: "w-28" },
];

const FILTERS = {
  enviados: ["sent"],
  pendientes: ["pending", "sending"],
  fallidos: ["failed"],
} as const;
type Filter = keyof typeof FILTERS;
const isFilter = (v: string): v is Filter => v in FILTERS;

const PROVIDER_LABEL: Record<string, string> = { resend: "Resend", mailpit: "Mailpit (local)" };

export default async function EmailsPage(props: PageProps<"/configuracion/correos">) {
  const searchParams = await props.searchParams;
  const estado = typeof searchParams.estado === "string" ? searchParams.estado : "";
  const filter = isFilter(estado) ? estado : null;

  const { supabase } = await requireAdmin();

  let query = supabase
    .from("email_outbox")
    .select(
      "id, template, audience, to_email, to_name, status, attempts, subject, provider, last_error, created_at, sent_at, next_attempt_at, service_id, application_id",
    )
    .order("created_at", { ascending: false })
    .limit(100);
  if (filter) query = query.in("status", [...FILTERS[filter]]);

  const count = (statuses: readonly ("pending" | "sending" | "sent" | "failed")[]) =>
    supabase.from("email_outbox").select("id", { count: "exact", head: true }).in("status", [...statuses]);

  const [{ data: emails, error }, all, sent, pending, failed] = await Promise.all([
    query,
    supabase.from("email_outbox").select("id", { count: "exact", head: true }),
    count(FILTERS.enviados),
    count(FILTERS.pendientes),
    count(FILTERS.fallidos),
  ]);

  return (
    <>
      <PageHeader
        title="Correos"
        description="Notificaciones que Xpertos envía a clientes, expertos, aspirantes y al equipo. Un correo fallido se reintenta solo hasta 5 veces; después puedes reintentarlo aquí."
      />

      <div className="mb-4">
        <StatusTabs
          basePath="/configuracion/correos"
          param="estado"
          current={filter}
          tabs={[
            { value: null, label: "Todos", count: all.count ?? 0 },
            { value: "enviados", label: "Enviados", count: sent.count ?? 0 },
            { value: "pendientes", label: "Pendientes", count: pending.count ?? 0 },
            { value: "fallidos", label: "Fallidos", count: failed.count ?? 0 },
          ]}
        />
      </div>

      <Card>
        <Table fit stack="lg">
          <THead columns={COLUMNS} />
          <TBody>
            {error && <EmptyRow colSpan={COLUMNS.length}>No fue posible cargar los correos: {error.message}</EmptyRow>}
            {!error && (emails ?? []).length === 0 && (
              <EmptyRow colSpan={COLUMNS.length}>{filter ? "No hay correos en este estado." : "Aún no se ha enviado ningún correo."}</EmptyRow>
            )}
            {(emails ?? []).map((e) => {
              const label = EMAIL_TEMPLATE_LABEL[e.template] ?? e.template;
              const finalFailure = e.status === "failed" && e.attempts >= EMAIL_MAX_ATTEMPTS;
              return (
                <Tr key={e.id}>
                  <Td className="text-xs text-slate-500">{formatDateTime(e.created_at)}</Td>
                  <Td>
                    <span className="block truncate font-medium" title={e.to_name ?? e.to_email}>
                      {e.to_name || e.to_email}
                    </span>
                    <span className="block truncate text-xs text-slate-500" title={e.to_email}>
                      {EMAIL_AUDIENCE_LABEL[e.audience] ?? e.audience} · {e.to_email}
                    </span>
                  </Td>
                  <Td>
                    <span className="block truncate" title={e.subject ?? label}>
                      {e.subject ?? label}
                    </span>
                    <span className="block truncate text-xs text-slate-500">
                      {label}
                      {e.service_id && (
                        <>
                          {" · "}
                          <Link href={`/servicios/${e.service_id}`} className="text-primary hover:underline">
                            Ver servicio
                          </Link>
                        </>
                      )}
                      {e.application_id && (
                        <>
                          {" · "}
                          <Link href={`/solicitudes/${e.application_id}`} className="text-primary hover:underline">
                            Ver postulación
                          </Link>
                        </>
                      )}
                    </span>
                  </Td>
                  <Td>
                    {e.status === "sent" && <Badge tone="green">Enviado</Badge>}
                    {(e.status === "pending" || e.status === "sending") && <Badge tone="slate">Pendiente</Badge>}
                    {e.status === "failed" && (finalFailure ? <Badge tone="red">Fallido</Badge> : <Badge tone="amber">Reintentando</Badge>)}
                    <span className="mt-1 block truncate text-xs text-slate-500" title={e.last_error ?? undefined}>
                      {e.status === "sent"
                        ? `Vía ${PROVIDER_LABEL[e.provider ?? ""] ?? e.provider ?? "—"}`
                        : e.status === "failed"
                          ? (e.last_error ?? "Error desconocido")
                          : `Intento ${e.attempts + 1}`}
                    </span>
                    {e.status === "failed" && !finalFailure && (
                      <span className="block text-xs text-slate-500">
                        Intento {e.attempts} de {EMAIL_MAX_ATTEMPTS} · próximo {formatDateTime(e.next_attempt_at)}
                      </span>
                    )}
                  </Td>
                  <Td className="text-right">
                    {e.status === "failed" && (
                      <ActionButton
                        action={retryEmail}
                        fields={{ id: e.id }}
                        pendingLabel="Enviando…"
                        confirm={{ title: "Reintentar el envío", description: `Se volverá a enviar el correo a ${e.to_email}.`, confirmLabel: "Reintentar" }}
                      >
                        Reintentar
                      </ActionButton>
                    )}
                  </Td>
                </Tr>
              );
            })}
          </TBody>
        </Table>
        <CardBody className="border-t border-border text-xs text-slate-500">
          Se muestran los últimos 100. Los correos salen por Resend desde notificaciones@xpertos.com.co; en el entorno
          local llegan al buzón de pruebas (Mailpit).
        </CardBody>
      </Card>
    </>
  );
}
