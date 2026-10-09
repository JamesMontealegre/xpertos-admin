import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/auth";
import { daysUntil, formatDate, formatDateTime } from "@/lib/format";
import {
  APPLICATION_STATUS,
  DOCUMENT_KIND,
  applicationRequirements,
  REQUIREMENTS_TOTAL,
  payoutMethodLabel,
} from "@/lib/labels";
import { signedUrl } from "@/lib/storage";
import { Alert } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Card, CardBody, CardHeader, DescriptionList } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";
import { FilePreview } from "@/components/ui/file-preview";
import { RejectDocumentButton, ReviewActions } from "../review-actions";

export const metadata: Metadata = { title: "Detalle de solicitud" };

export default async function ApplicationDetailPage(props: PageProps<"/solicitudes/[id]">) {
  const { id } = await props.params;
  const { supabase } = await requireAdmin();

  const { data: application } = await supabase
    .from("expert_applications")
    .select("*, reviewer:profiles!expert_applications_reviewed_by_fkey(full_name)")
    .eq("id", id)
    .maybeSingle();
  if (!application) notFound();

  const [{ data: categories }, { data: documents }, { data: profile }] = await Promise.all([
    supabase.from("service_categories").select("id, name"),
    supabase
      .from("application_documents")
      .select("*")
      .eq("application_id", id)
      .order("created_at", { ascending: true }),
    application.user_id
      ? supabase.from("profiles").select("id, role, full_name, created_at").eq("id", application.user_id).maybeSingle()
      : Promise.resolve({ data: null }),
  ]);

  const categoryName = new Map((categories ?? []).map((c) => [c.id, c.name]));
  const docsWithUrls = await Promise.all(
    (documents ?? []).map(async (doc) => ({
      ...doc,
      url: await signedUrl(supabase, "expert-documents", doc.storage_path),
    })),
  );

  // Los documentos rechazados no cuentan: el aspirante debe subirlos de nuevo.
  const activeDocs = docsWithUrls.filter((d) => d.status !== "rejected");
  const rejectedDocs = docsWithUrls.filter((d) => d.status === "rejected");
  const requirements = applicationRequirements(
    activeDocs.map((d) => d.kind),
    application.payout_method,
    application.payout_account,
  );
  const missing = requirements.filter((r) => !r.done);
  const status = APPLICATION_STATUS[application.status];
  // Abierta: el aspirante aún completa (pendiente) o el agente revisa (en revisión).
  const isPending = application.status === "pending" || application.status === "needs_info";
  const isOpen = isPending || application.status === "in_review";
  const daysLeft = daysUntil(application.expires_at);

  return (
    <>
      <PageHeader
        backHref="/solicitudes"
        backLabel="Solicitudes"
        title={application.full_name}
        meta={<Badge tone={status.tone}>{status.label}</Badge>}
        description={`Recibida el ${formatDateTime(application.created_at)}`}
      />

      <div className="grid gap-6 lg:grid-cols-3 [&>*]:min-w-0">
        <div className="space-y-6 lg:col-span-2">
          <Card>
            <CardHeader title="Datos del aspirante" />
            <CardBody>
              <DescriptionList
                items={[
                  { label: "Nombre", value: application.full_name },
                  { label: "Email", value: application.email },
                  { label: "Teléfono", value: application.phone ?? "—" },
                  { label: "Ciudad", value: application.city ?? "—" },
                  {
                    label: "Experiencia",
                    value: application.experience_years != null ? `${application.experience_years} años` : "—",
                  },
                  {
                    label: "Medio de pago",
                    value: application.payout_method ? (
                      payoutMethodLabel(application.payout_method)
                    ) : (
                      <Badge tone="orange">Sin elegir</Badge>
                    ),
                  },
                  {
                    label: application.payout_method === "bank_account" ? "Datos de la cuenta" : "Número / cuenta",
                    value: application.payout_account ? (
                      <span className="whitespace-pre-line">{application.payout_account}</span>
                    ) : application.payout_method === "efecty" ? (
                      "No aplica (cobra en Puntos Efecty con su cédula)"
                    ) : (
                      "—"
                    ),
                  },
                  {
                    label: "Registro en la app",
                    value: application.user_id ? (
                      <span className="flex flex-wrap items-center gap-2">
                        <Badge tone="green">Registrado</Badge>
                        {profile && (
                          <span className="text-xs text-slate-500">
                            Rol actual: {profile.role} · desde {formatDateTime(profile.created_at)}
                          </span>
                        )}
                      </span>
                    ) : (
                      <Badge tone="slate">Sin registrar</Badge>
                    ),
                  },
                  {
                    label: "Categorías",
                    value: (
                      <span className="flex flex-wrap gap-1">
                        {application.category_ids.length === 0 && "—"}
                        {application.category_ids.map((cid) => (
                          <Badge key={cid}>{categoryName.get(cid) ?? "Categoría"}</Badge>
                        ))}
                      </span>
                    ),
                  },
                  {
                    label: "Plazo para completar",
                    value: isPending
                      ? `Hasta el ${formatDate(application.expires_at)} · ${daysLeft === 0 ? "vence hoy" : daysLeft === 1 ? "queda 1 día" : `quedan ${daysLeft} días`}`
                      : application.status === "expired"
                        ? `Venció el ${formatDate(application.expires_at)}`
                        : "—",
                  },
                  {
                    label: "Última revisión",
                    value: application.reviewed_at
                      ? `${formatDateTime(application.reviewed_at)}${application.reviewer?.full_name ? ` · ${application.reviewer.full_name}` : ""}`
                      : "Sin revisar",
                  },
                ]}
              />
              {application.bio && (
                <div className="mt-5">
                  <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Reseña</p>
                  <p className="mt-1 whitespace-pre-line text-sm leading-relaxed">{application.bio}</p>
                </div>
              )}
            </CardBody>
          </Card>

          <Card>
            <CardHeader
              title="Documentos"
              description="Los enlaces están firmados y expiran a los 60 segundos; recarga la página si vencen."
            />
            <CardBody className="space-y-4">
              {missing.length > 0 ? (
                <Alert tone="warning">
                  <p className="font-medium">
                    Faltan {missing.length} de {REQUIREMENTS_TOTAL} requisitos:
                  </p>
                  <ul className="mt-1 list-inside list-disc">
                    {missing.map((r) => (
                      <li key={r.key}>
                        {r.label}
                        {r.detail ? <span className="text-amber-800/80"> · {r.detail}</span> : null}
                      </li>
                    ))}
                  </ul>
                </Alert>
              ) : (
                <Alert tone="success">Los {REQUIREMENTS_TOTAL} requisitos están completos.</Alert>
              )}
              <p className="text-xs text-slate-500">
                Requisitos: cédula (frente y reverso), planilla de seguridad social y ARL, foto 3x4, carta de
                recomendación y el soporte del medio de pago (certificación bancaria, número Nequi o Efecty).
              </p>
              {activeDocs.length === 0 ? (
                <p className="text-sm text-slate-500">
                  El aspirante aún no ha subido documentos
                  {application.user_id ? "." : "; primero debe registrarse en la app."}
                </p>
              ) : (
                <ul className="grid gap-4 sm:grid-cols-2">
                  {activeDocs.map((doc) => (
                    <li key={doc.id} className="space-y-2">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <p className="text-sm font-medium">{DOCUMENT_KIND[doc.kind]}</p>
                          <p className="truncate text-xs text-slate-500">{doc.file_name}</p>
                        </div>
                        {doc.url && (
                          <a href={doc.url} target="_blank" rel="noreferrer" className="text-xs font-medium text-primary hover:underline">
                            Abrir
                          </a>
                        )}
                      </div>
                      <FilePreview url={doc.url} path={doc.storage_path} mime={doc.mime_type} name={doc.file_name} />
                      {isOpen && (
                        <RejectDocumentButton applicationId={application.id} document={{ id: doc.id, label: DOCUMENT_KIND[doc.kind] }} />
                      )}
                    </li>
                  ))}
                </ul>
              )}
              {rejectedDocs.length > 0 && (
                <div className="space-y-2 border-t border-border pt-4">
                  <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Documentos rechazados</p>
                  <ul className="divide-y divide-border rounded-lg border border-border">
                    {rejectedDocs.map((doc) => (
                      <li key={doc.id} className="flex items-start justify-between gap-3 p-3">
                        <div className="min-w-0 space-y-1">
                          <p className="flex flex-wrap items-center gap-2 text-sm font-medium">
                            {DOCUMENT_KIND[doc.kind]} <Badge tone="red">Rechazado</Badge>
                          </p>
                          {doc.rejection_reason && <p className="text-sm text-slate-700">Motivo: {doc.rejection_reason}</p>}
                          <p className="truncate text-xs text-slate-500">
                            {doc.file_name}
                            {doc.reviewed_at ? ` · ${formatDateTime(doc.reviewed_at)}` : ""}
                          </p>
                        </div>
                        {doc.url && (
                          <a href={doc.url} target="_blank" rel="noreferrer" className="shrink-0 text-xs font-medium text-primary hover:underline">
                            Abrir
                          </a>
                        )}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </CardBody>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader title="Revisión" />
            <CardBody className="space-y-4">
              {isPending && (
                <>
                  <Alert tone="warning">
                    <p className="font-medium">Esperando documentos del aspirante</p>
                    <p className="mt-1">
                      Pasa sola a En revisión cuando complete los {REQUIREMENTS_TOTAL} requisitos. Tiene hasta el{" "}
                      {formatDate(application.expires_at)}
                      {daysLeft != null && ` (${daysLeft === 0 ? "vence hoy" : daysLeft === 1 ? "queda 1 día" : `quedan ${daysLeft} días`})`}; si no,
                      la postulación se vence automáticamente.
                    </p>
                  </Alert>
                  <p className="text-xs text-slate-500">
                    Aprobar y rechazar se habilitan cuando la postulación está En revisión. Si un documento tiene un
                    problema, recházalo puntualmente en la sección Documentos.
                  </p>
                </>
              )}

              {application.status === "in_review" && (
                <>
                  <Alert tone="info">
                    Los {REQUIREMENTS_TOTAL} requisitos están completos. Revisa los documentos y decide. Si solo un
                    documento es inconsistente, recházalo en la sección Documentos y la postulación vuelve a Pendiente.
                  </Alert>
                  <ReviewActions application={application} />
                  {!application.user_id && (
                    <p className="text-xs text-slate-500">
                      No es posible aprobar: el aspirante aún no tiene cuenta en la app con el correo{" "}
                      <span className="font-medium">{application.email}</span>.
                    </p>
                  )}
                </>
              )}

              {application.status === "approved" && (
                <Alert tone="success">Esta postulación ya fue aprobada; el aspirante ahora es experto.</Alert>
              )}

              {application.status === "rejected" && (
                <>
                  <Alert tone="error">
                    <p className="font-medium">Postulación rechazada</p>
                    <p className="mt-1">
                      El aspirante ve el motivo en la app y puede presentar una nueva postulación cuando lo resuelva.
                    </p>
                  </Alert>
                  <ReviewActions application={application} />
                </>
              )}

              {application.status === "expired" && (
                <>
                  <Alert tone="info">
                    Venció el {formatDate(application.expires_at)} sin completarse. El aspirante puede presentar una nueva
                    postulación desde la app.
                  </Alert>
                  <ReviewActions application={application} />
                </>
              )}

              {application.admin_notes && (
                <div className="border-t border-border pt-4">
                  <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                    {application.status === "rejected" ? "Motivo del rechazo" : "Notas del operador"}
                  </p>
                  <p className="mt-1 whitespace-pre-line text-sm">{application.admin_notes}</p>
                </div>
              )}
            </CardBody>
          </Card>
        </div>
      </div>
    </>
  );
}
