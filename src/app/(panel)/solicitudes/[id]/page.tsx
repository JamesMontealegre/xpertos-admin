import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/auth";
import { formatDateTime } from "@/lib/format";
import { APPLICATION_STATUS, DOCUMENT_KIND } from "@/lib/labels";
import { signedUrl } from "@/lib/storage";
import { Alert } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Card, CardBody, CardHeader, DescriptionList } from "@/components/ui/card";
import { Field, Textarea } from "@/components/ui/input";
import { PageHeader } from "@/components/ui/page-header";
import { ActionForm, SubmitButton } from "@/components/ui/action-form";
import { FilePreview } from "@/components/ui/file-preview";
import { reviewApplication } from "../actions";

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

  const status = APPLICATION_STATUS[application.status];
  const isFinal = application.status === "approved";
  const canApprove = Boolean(application.user_id);

  return (
    <>
      <PageHeader
        backHref="/solicitudes"
        backLabel="Solicitudes"
        title={application.full_name}
        meta={<Badge tone={status.tone}>{status.label}</Badge>}
        description={`Recibida el ${formatDateTime(application.created_at)}`}
      />

      <div className="grid gap-6 lg:grid-cols-3">
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
            <CardBody>
              {docsWithUrls.length === 0 ? (
                <p className="text-sm text-slate-500">
                  El aspirante aún no ha subido documentos
                  {application.user_id ? "." : "; primero debe registrarse en la app."}
                </p>
              ) : (
                <ul className="grid gap-4 sm:grid-cols-2">
                  {docsWithUrls.map((doc) => (
                    <li key={doc.id} className="space-y-2">
                      <div className="flex items-center justify-between gap-2">
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
                    </li>
                  ))}
                </ul>
              )}
            </CardBody>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader title="Revisión" description="Las notas se guardan junto con la decisión." />
            <CardBody>
              {isFinal ? (
                <div className="space-y-3">
                  <Alert tone="success">Esta postulación ya fue aprobada; el aspirante ahora es experto.</Alert>
                  {application.admin_notes && (
                    <div>
                      <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Notas del operador</p>
                      <p className="mt-1 whitespace-pre-line text-sm">{application.admin_notes}</p>
                    </div>
                  )}
                </div>
              ) : (
                <ActionForm action={reviewApplication} className="space-y-4">
                  <input type="hidden" name="application_id" value={application.id} />
                  <Field
                    label="Notas del operador"
                    htmlFor="notes"
                    hint="Obligatorias al pedir información o rechazar."
                  >
                    <Textarea
                      id="notes"
                      name="notes"
                      defaultValue={application.admin_notes ?? ""}
                      placeholder="Ej.: falta el RUT actualizado y el certificado de antecedentes."
                    />
                  </Field>

                  <div className="grid gap-2">
                    <SubmitButton name="status" value="in_review" variant="secondary" disabled={application.status === "in_review"}>
                      Marcar en revisión
                    </SubmitButton>
                    <SubmitButton name="status" value="needs_info" variant="secondary">
                      Pedir más información
                    </SubmitButton>
                    <SubmitButton name="status" value="rejected" variant="danger" disabled={application.status === "rejected"}>
                      Rechazar
                    </SubmitButton>
                    <SubmitButton
                      name="status"
                      value="approved"
                      disabled={!canApprove}
                      title={!canApprove ? "El aspirante aún no se registra en la app" : undefined}
                    >
                      Aprobar
                    </SubmitButton>
                    {!canApprove && (
                      <p className="text-xs text-slate-500">
                        No es posible aprobar: el aspirante aún no se registra en la app. Al registrarse con el correo{" "}
                        <span className="font-medium">{application.email}</span>, la postulación se enlazará automáticamente.
                      </p>
                    )}
                  </div>
                </ActionForm>
              )}
            </CardBody>
          </Card>
        </div>
      </div>
    </>
  );
}
