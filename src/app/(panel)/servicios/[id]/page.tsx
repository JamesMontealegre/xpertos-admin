import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { requireAdmin } from "@/lib/auth";
import { formatCOP, formatDate, formatDateTime, formatTime, shortId } from "@/lib/format";
import {
  CONTRACT_STATUS,
  PAYMENT_METHOD,
  PAYMENT_STATUS,
  ROLE_LABEL,
  STAGE_STATUS,
} from "@/lib/labels";
import { PHASE_INFO, servicePhase } from "@/lib/service-phase";
import { ServicePhaseBar } from "@/components/service-phase-bar";
import { signedUrl } from "@/lib/storage";
import { Alert } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Card, CardBody, CardHeader, DescriptionList } from "@/components/ui/card";
import { Field, Textarea } from "@/components/ui/input";
import { PageHeader } from "@/components/ui/page-header";
import { ActionButton } from "@/components/ui/action-form";
import { ActionDialog } from "@/components/ui/dialog";
import { FilePreview } from "@/components/ui/file-preview";
import { EmptyRow, Table, TBody, Td, THead, Tr } from "@/components/ui/table";
import { AssignForm, type ExpertOption } from "./assign-form";
import { Timeline, type TimelineEvent } from "./timeline";
import {
  cancelService,
  changeServiceStatus,
  generateContract,
  openNextStage,
  pauseService,
  resumeService,
  reviewPayment,
} from "../actions";

export const metadata: Metadata = { title: "Detalle de servicio" };

type Slot = { date?: string; from?: string; to?: string };

export default async function ServiceDetailPage(props: PageProps<"/servicios/[id]">) {
  const { id } = await props.params;
  const { supabase } = await requireAdmin();

  const { data: service } = await supabase
    .from("services")
    .select(
      "*, category:service_categories(id, name), client:profiles!services_client_id_fkey(id, full_name, email, phone, city)",
    )
    .eq("id", id)
    .maybeSingle();
  if (!service) notFound();

  const [
    { data: expertProfile },
    { data: stages },
    { data: payments },
    { data: contract },
    { data: events },
    { data: photos },
    { data: reviews },
    { data: candidates },
  ] = await Promise.all([
    service.expert_id
      ? supabase
          .from("expert_profiles")
          .select("user_id, rating_avg, rating_count, is_available, profile:profiles!expert_profiles_user_id_fkey(full_name, email, phone, city)")
          .eq("user_id", service.expert_id)
          .maybeSingle()
      : Promise.resolve({ data: null }),
    supabase.from("service_stages").select("*").eq("service_id", id).order("position"),
    supabase.from("payments").select("*").eq("service_id", id).order("created_at"),
    supabase
      .from("contracts")
      .select("*, signatures:contract_signatures(id, signer_role, signed_at, ip, user_agent, body_hash, signer:profiles!contract_signatures_signer_id_fkey(full_name))")
      .eq("service_id", id)
      .maybeSingle(),
    supabase
      .from("service_events")
      .select("id, type, from_status, to_status, payload, created_at, actor:profiles!service_events_actor_id_fkey(full_name, role)")
      .eq("service_id", id)
      .order("created_at", { ascending: true }),
    supabase.from("service_photos").select("*").eq("service_id", id).order("created_at"),
    supabase
      .from("service_reviews")
      .select("*, author:profiles!service_reviews_author_id_fkey(full_name, role), target:profiles!service_reviews_target_id_fkey(full_name)")
      .eq("service_id", id),
    service.status === "requested" || service.status === "in_review"
      ? supabase
          .from("expert_profiles")
          .select(
            "user_id, rating_avg, rating_count, is_available, profile:profiles!expert_profiles_user_id_fkey(full_name, city), availability:expert_availability(weekday, start_time, end_time)",
          )
          .contains("category_ids", [service.category_id])
          .eq("is_available", true)
          .order("rating_avg", { ascending: false })
      : Promise.resolve({ data: null }),
  ]);

  const photoUrls = await Promise.all(
    (photos ?? []).map(async (p) => ({ ...p, url: await signedUrl(supabase, "service-photos", p.storage_path) })),
  );
  const paymentUrls = await Promise.all(
    (payments ?? []).map(async (p) => ({ ...p, url: await signedUrl(supabase, "payment-proofs", p.proof_path) })),
  );

  const expertOptions: ExpertOption[] = (candidates ?? []).map((c) => ({
    id: c.user_id,
    full_name: c.profile?.full_name || "Experto",
    city: c.profile?.city ?? null,
    rating_avg: Number(c.rating_avg),
    rating_count: c.rating_count,
    is_available: c.is_available,
    availability: [...c.availability].sort((a, b) => a.weekday - b.weekday || a.start_time.localeCompare(b.start_time)),
  }));

  const stageList = stages ?? [];
  const phase = servicePhase(service.status, stageList);
  const phaseInfo = PHASE_INFO[phase];
  // Para un servicio cancelado, la etapa en la que estaba al cancelarse (según el historial).
  const cancelEvent = [...(events ?? [])].reverse().find((e) => e.to_status === "cancelled");
  const cancelledAt = cancelEvent?.from_status ? servicePhase(cancelEvent.from_status, stageList) : null;
  const firstStage = stageList[0];
  const contractSigned = contract?.status === "signed";
  const firstStagePaid = firstStage?.status === "paid";
  const startBlockers = [
    !contract && "falta generar el contrato",
    contract && !contractSigned && "el contrato aún no está firmado por ambas partes",
    !firstStage && "no hay etapas de pago",
    firstStage && !firstStagePaid && "la primera etapa aún no está pagada",
  ].filter((v): v is string => Boolean(v));
  const canStart = startBlockers.length === 0;

  const hasOpenStage = stageList.some((s) => s.status === "awaiting_payment" || s.status === "proof_uploaded" || s.status === "rejected");
  const nextPending = stageList.find((s) => s.status === "pending");
  const canOpenNext = Boolean(nextPending) && !hasOpenStage;

  const availability = Array.isArray(service.availability) ? (service.availability as Slot[]) : [];
  const canCancel = service.status !== "completed" && service.status !== "cancelled";
  const cancelDialog = canCancel && (
    <ActionDialog
      triggerLabel="Cancelar servicio"
      triggerVariant="danger"
      triggerSize="md"
      title="Cancelar servicio"
      description="El cliente y el experto verán el servicio como cancelado. Esta acción no se puede deshacer."
      action={cancelService}
      fields={{ service_id: service.id }}
      submitLabel="Confirmar cancelación"
      submitVariant="danger"
    >
      <Field label="Motivo" htmlFor="reason">
        <Textarea id="reason" name="reason" required placeholder="Ej.: el cliente ya resolvió el problema." />
      </Field>
    </ActionDialog>
  );

  return (
    <>
      <PageHeader
        backHref="/servicios"
        backLabel="Servicios"
        title={service.title}
        meta={<Badge tone={phaseInfo.tone}>{phaseInfo.label}</Badge>}
        description={
          <>
            <span className="font-mono">{shortId(service.id)}</span> · {service.category?.name ?? "Sin categoría"} · creado el{" "}
            {formatDateTime(service.created_at)}
          </>
        }
        actions={
          <>
            {service.status === "requested" && (
              <ActionButton
                action={changeServiceStatus}
                fields={{ service_id: service.id, status: "in_review" }}
                variant="primary"
                size="md"
              >
                Iniciar cotización
              </ActionButton>
            )}
            {service.status === "assigned" && (
              <ActionButton
                action={changeServiceStatus}
                fields={{ service_id: service.id, status: "in_progress" }}
                variant="primary"
                size="md"
                disabled={!canStart}
                title={!canStart ? `No se puede iniciar: ${startBlockers.join("; ")}.` : undefined}
              >
                Iniciar servicio
              </ActionButton>
            )}
            {service.status === "in_progress" && (
              <>
                <ActionDialog
                  triggerLabel="Pausar"
                  triggerVariant="secondary"
                  triggerSize="md"
                  title="Pausar servicio"
                  description="El servicio quedará En pausa hasta que lo reanudes. El cliente y el experto lo verán."
                  action={pauseService}
                  fields={{ service_id: service.id }}
                  submitLabel="Pausar servicio"
                  pendingLabel="Pausando…"
                >
                  <Field label="Motivo" htmlFor="pause-reason">
                    <Textarea
                      id="pause-reason"
                      name="reason"
                      required
                      minLength={5}
                      placeholder="Ej.: esperando que lleguen los materiales."
                    />
                  </Field>
                </ActionDialog>
                <ActionButton
                  action={changeServiceStatus}
                  fields={{ service_id: service.id, status: "completed" }}
                  variant="primary"
                  size="md"
                >
                  Marcar finalizado
                </ActionButton>
              </>
            )}
            {service.status === "paused" && (
              <ActionButton action={resumeService} fields={{ service_id: service.id }} variant="primary" size="md">
                Reanudar
              </ActionButton>
            )}
            {cancelDialog}
          </>
        }
      />

      <Card className="mb-6">
        <CardBody>
          <ServicePhaseBar
            phase={phase}
            cancelledAt={cancelledAt}
            note={phase === "paused" ? service.pause_reason : phase === "done" ? `Finalizado el ${formatDate(service.completed_at)}` : null}
          />
        </CardBody>
      </Card>

      {service.status === "paused" && (
        <Alert tone="warning" className="mb-6">
          Servicio en pausa{service.pause_reason ? `: ${service.pause_reason}` : "."}
        </Alert>
      )}
      {service.status === "assigned" && !canStart && (
        <Alert tone="warning" className="mb-6">
          Para iniciar el servicio {startBlockers.join(" y ")}.
        </Alert>
      )}
      {service.status === "cancelled" && (
        <Alert tone="error" className="mb-6">
          Servicio cancelado{service.cancel_reason ? `: ${service.cancel_reason}` : "."}
        </Alert>
      )}

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <Card>
            <CardHeader title="Datos del servicio" />
            <CardBody className="space-y-5">
              <p className="whitespace-pre-line text-sm leading-relaxed">{service.description}</p>
              <DescriptionList
                columns={3}
                items={[
                  { label: "Categoría", value: service.category?.name ?? "—" },
                  { label: "Ciudad", value: service.city ?? "—" },
                  { label: "Dirección", value: service.address ?? "—" },
                  { label: "Precio estimado", value: formatCOP(service.estimated_price) },
                  { label: "Comisión", value: `${service.commission_pct} %` },
                  { label: "Fecha programada", value: formatDateTime(service.scheduled_at) },
                  { label: "Asignado", value: formatDateTime(service.assigned_at) },
                  { label: "Iniciado", value: formatDateTime(service.started_at) },
                  { label: "Completado", value: formatDateTime(service.completed_at) },
                ]}
              />
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Disponibilidad del cliente</p>
                {availability.length === 0 ? (
                  <p className="mt-1 text-sm text-slate-500">El cliente no indicó franjas.</p>
                ) : (
                  <ul className="mt-1 flex flex-wrap gap-1.5">
                    {availability.map((slot, i) => (
                      <li key={i} className="rounded-md bg-slate-100 px-2 py-0.5 text-xs">
                        {formatDate(slot.date ?? null)} {slot.from ? `${formatTime(slot.from)}–${formatTime(slot.to)}` : ""}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </CardBody>
          </Card>

          <Card>
            <CardHeader title="Fotos" description="URLs firmadas de 60 segundos." />
            <CardBody>
              {photoUrls.length === 0 ? (
                <p className="text-sm text-slate-500">El cliente no adjuntó fotos.</p>
              ) : (
                <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {photoUrls.map((photo) => (
                    <li key={photo.id}>
                      <FilePreview url={photo.url} path={photo.storage_path} />
                    </li>
                  ))}
                </ul>
              )}
            </CardBody>
          </Card>

          {(service.status === "requested" || service.status === "in_review") && (
            <Card>
              <CardHeader
                title="Asignar experto"
                description="Solo se muestran expertos disponibles de la categoría del servicio. Al asignar se crean las etapas de pago."
              />
              <CardBody>
                <AssignForm serviceId={service.id} experts={expertOptions} />
              </CardBody>
            </Card>
          )}

          {service.expert_id && (
            <Card>
              <CardHeader
                title="Contrato"
                description={
                  contract
                    ? `Versión ${contract.version} · generado el ${formatDateTime(contract.created_at)}`
                    : "Aún no se ha generado el contrato de este servicio."
                }
                action={
                  <>
                    {contract && <Badge tone={CONTRACT_STATUS[contract.status].tone}>{CONTRACT_STATUS[contract.status].label}</Badge>}
                    <ActionDialog
                      triggerLabel={contract ? "Regenerar contrato" : "Generar contrato"}
                      triggerVariant={contract ? "secondary" : "primary"}
                      title={contract ? "Regenerar contrato" : "Generar contrato"}
                      description={
                        contract
                          ? "Se creará una nueva versión con los datos actuales del servicio. Las firmas existentes quedarán invalidadas y las partes deberán firmar de nuevo."
                          : "Se generará el contrato a partir de la plantilla con los datos del servicio, el cliente, el experto y las etapas."
                      }
                      action={generateContract}
                      fields={{ service_id: service.id }}
                      submitLabel={contract ? "Regenerar" : "Generar"}
                      pendingLabel="Generando…"
                    >
                      {contract && <Alert tone="warning">Al regenerar se invalidan las firmas actuales.</Alert>}
                      <Field label="Términos adicionales (opcional)" htmlFor="extra_terms">
                        <Textarea id="extra_terms" name="extra_terms" placeholder="Condiciones particulares acordadas con las partes." />
                      </Field>
                    </ActionDialog>
                  </>
                }
              />
              {contract && (
                <CardBody className="space-y-4">
                  <DescriptionList
                    items={[
                      { label: "Hash SHA-256", value: <span className="break-all font-mono text-xs">{contract.body_hash}</span> },
                      { label: "Actualizado", value: formatDateTime(contract.updated_at) },
                    ]}
                  />
                  <div>
                    <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Firmas</p>
                    {contract.signatures.length === 0 ? (
                      <p className="mt-1 text-sm text-slate-500">Ninguna de las partes ha firmado todavía.</p>
                    ) : (
                      <ul className="mt-1 divide-y divide-border text-sm">
                        {contract.signatures.map((sig) => (
                          <li key={sig.id} className="flex flex-wrap items-center justify-between gap-2 py-2">
                            <span>
                              <span className="font-medium">{ROLE_LABEL[sig.signer_role]}</span>
                              {sig.signer?.full_name ? ` · ${sig.signer.full_name}` : ""}
                            </span>
                            <span className="text-xs text-slate-500">
                              {formatDateTime(sig.signed_at)} · IP {sig.ip ?? "—"}
                              {sig.body_hash !== contract.body_hash && " · versión anterior"}
                            </span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                  <details className="group rounded-xl border border-border">
                    <summary className="cursor-pointer select-none px-4 py-2.5 text-sm font-medium text-primary">
                      Ver texto del contrato
                    </summary>
                    <div className="markdown border-t border-border px-4 py-3 text-sm">
                      <ReactMarkdown remarkPlugins={[remarkGfm]}>{contract.body_md}</ReactMarkdown>
                    </div>
                  </details>
                </CardBody>
              )}
            </Card>
          )}

          {stageList.length > 0 && (
            <Card>
              <CardHeader
                title="Etapas y pagos"
                description={`${stageList.filter((s) => s.status === "paid").length} de ${stageList.length} etapas pagadas`}
                action={
                  nextPending && (
                    <ActionButton
                      action={openNextStage}
                      fields={{ service_id: service.id }}
                      variant="primary"
                      disabled={!canOpenNext}
                      title={!canOpenNext ? "La etapa actual debe estar pagada antes de abrir la siguiente." : undefined}
                    >
                      Abrir siguiente etapa
                    </ActionButton>
                  )
                }
              />
              <Table>
                <THead columns={["#", "Etapa", "Monto", "Fecha límite", "Estado"]} />
                <TBody>
                  {stageList.map((stage) => {
                    const stagePayments = paymentUrls.filter((p) => p.stage_id === stage.id);
                    return (
                      <Tr key={stage.id} className="hover:bg-transparent">
                        <Td className="align-top text-slate-500">{stage.position}</Td>
                        <Td className="align-top">
                          <p className="font-medium">{stage.name}</p>
                          {stage.description && <p className="text-xs text-slate-500">{stage.description}</p>}
                          {stagePayments.length > 0 && (
                            <ul className="mt-3 space-y-3">
                              {stagePayments.map((payment) => (
                                <li key={payment.id} className="rounded-xl border border-border bg-slate-50 p-3">
                                  <div className="flex flex-wrap items-center justify-between gap-2">
                                    <div className="text-sm">
                                      <span className="font-medium">{formatCOP(payment.amount)}</span> · {PAYMENT_METHOD[payment.method]}
                                      {payment.provider_ref && <span className="text-slate-500"> · ref. {payment.provider_ref}</span>}
                                      <span className="block text-xs text-slate-500">
                                        Enviado el {formatDateTime(payment.created_at)}
                                        {payment.verified_at && ` · revisado el ${formatDateTime(payment.verified_at)}`}
                                      </span>
                                    </div>
                                    <Badge tone={PAYMENT_STATUS[payment.status].tone}>{PAYMENT_STATUS[payment.status].label}</Badge>
                                  </div>
                                  {payment.notes && <p className="mt-2 text-xs text-slate-600">Nota: {payment.notes}</p>}
                                  <div className="mt-3">
                                    {payment.proof_path ? (
                                      <FilePreview url={payment.url} path={payment.proof_path} />
                                    ) : (
                                      <p className="text-xs text-slate-500">Sin comprobante adjunto.</p>
                                    )}
                                  </div>
                                  {payment.status === "submitted" && (
                                    <div className="mt-3 flex flex-wrap gap-2">
                                      <ActionButton
                                        action={reviewPayment}
                                        fields={{ service_id: service.id, payment_id: payment.id, decision: "verified" }}
                                        variant="primary"
                                      >
                                        Verificar
                                      </ActionButton>
                                      <ActionDialog
                                        triggerLabel="Rechazar"
                                        triggerVariant="danger"
                                        title="Rechazar comprobante"
                                        description="El cliente verá la nota y podrá enviar un nuevo comprobante."
                                        action={reviewPayment}
                                        fields={{ service_id: service.id, payment_id: payment.id, decision: "rejected" }}
                                        submitLabel="Rechazar pago"
                                        submitVariant="danger"
                                      >
                                        <Field label="Motivo del rechazo" htmlFor={`notes-${payment.id}`}>
                                          <Textarea
                                            id={`notes-${payment.id}`}
                                            name="notes"
                                            required
                                            placeholder="Ej.: el comprobante no corresponde al monto de la etapa."
                                          />
                                        </Field>
                                      </ActionDialog>
                                    </div>
                                  )}
                                </li>
                              ))}
                            </ul>
                          )}
                        </Td>
                        <Td className="align-top whitespace-nowrap">{formatCOP(stage.amount)}</Td>
                        <Td className="align-top whitespace-nowrap text-slate-600">{formatDate(stage.due_date)}</Td>
                        <Td className="align-top">
                          <Badge tone={STAGE_STATUS[stage.status].tone}>{STAGE_STATUS[stage.status].label}</Badge>
                        </Td>
                      </Tr>
                    );
                  })}
                  {stageList.length === 0 && <EmptyRow colSpan={5}>Sin etapas.</EmptyRow>}
                </TBody>
              </Table>
            </Card>
          )}

          {(reviews ?? []).length > 0 && (
            <Card>
              <CardHeader title="Reseñas" />
              <ul className="divide-y divide-border">
                {(reviews ?? []).map((review) => (
                  <li key={review.id} className="px-5 py-4">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <p className="text-sm">
                        <span className="font-medium">{review.author?.full_name || "Usuario"}</span>
                        <span className="text-slate-500">
                          {" "}
                          ({review.author ? ROLE_LABEL[review.author.role] : "—"}) sobre {review.target?.full_name || "—"}
                        </span>
                      </p>
                      <span className="text-sm font-medium text-accent" aria-label={`${review.rating} de 5`}>
                        {"★".repeat(review.rating)}
                        <span className="text-slate-300">{"★".repeat(5 - review.rating)}</span>
                      </span>
                    </div>
                    {review.comment && <p className="mt-1 text-sm text-slate-700">{review.comment}</p>}
                    <p className="mt-1 text-xs text-slate-500">{formatDateTime(review.created_at)}</p>
                  </li>
                ))}
              </ul>
            </Card>
          )}
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader title="Cliente" />
            <CardBody>
              <DescriptionList
                columns={1}
                items={[
                  { label: "Nombre", value: service.client?.full_name || "—" },
                  { label: "Teléfono", value: service.client?.phone ?? "—" },
                  { label: "Email", value: service.client?.email ?? "—" },
                  { label: "Ciudad", value: service.client?.city ?? "—" },
                ]}
              />
            </CardBody>
          </Card>

          <Card>
            <CardHeader title="Experto asignado" />
            <CardBody>
              {!service.expert_id ? (
                <p className="text-sm text-slate-500">Sin experto asignado.</p>
              ) : (
                <DescriptionList
                  columns={1}
                  items={[
                    {
                      label: "Nombre",
                      value: (
                        <Link href={`/expertos/${service.expert_id}`} className="font-medium text-primary hover:underline">
                          {expertProfile?.profile?.full_name || "Experto"}
                        </Link>
                      ),
                    },
                    { label: "Teléfono", value: expertProfile?.profile?.phone ?? "—" },
                    { label: "Email", value: expertProfile?.profile?.email ?? "—" },
                    { label: "Ciudad", value: expertProfile?.profile?.city ?? "—" },
                    {
                      label: "Calificación",
                      value: expertProfile
                        ? `${Number(expertProfile.rating_avg).toFixed(1)} (${expertProfile.rating_count} reseñas)`
                        : "—",
                    },
                  ]}
                />
              )}
            </CardBody>
          </Card>

          <Card>
            <CardHeader title="Línea de tiempo" />
            <CardBody>
              <Timeline events={(events ?? []) as TimelineEvent[]} />
            </CardBody>
          </Card>
        </div>
      </div>
    </>
  );
}
