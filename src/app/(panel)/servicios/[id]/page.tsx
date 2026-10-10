import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/auth";
import { businessDaysInRange } from "@/lib/business-days";
import {
  businessDaysLabel,
  dateCO,
  formatCOP,
  formatDate,
  formatDateTime,
  formatDayMonth,
  formatTime,
  shortId,
  todayCO,
} from "@/lib/format";
import {
  ACTIVE_SERVICE_STATUSES,
  PAYOUT_FREQUENCY,
  ROLE_LABEL,
  SERVICE_STATUS,
  payoutMethodLabel,
  type ServiceStatus,
  PRICING_MODE,
  CONTRACT_STATUS,
} from "@/lib/labels";
import { STARTED_STATUSES, WORK_STATUSES } from "@/lib/service-phase";
import { signedUrlMap } from "@/lib/storage";
import { ServicePhaseBar } from "@/components/service-phase-bar";
import { Alert } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { ActionButton } from "@/components/ui/action-form";
import { Card, CardBody, CardHeader, DescriptionList } from "@/components/ui/card";
import { ActionDialog } from "@/components/ui/dialog";
import { Field, Textarea } from "@/components/ui/input";
import { PageHeader } from "@/components/ui/page-header";
import { PhotoGrid } from "@/components/ui/photo-grid";
import { AssignForm, type ExpertOption } from "./assign-form";
import { ContractCard, type ContractWithSignatures } from "./contract-card";
import { MoveControls } from "./move-controls";
import { PaymentsCard } from "./payments-card";
import { PayoutsCard } from "./payouts-card";
import { QuoteCard, expertNetEstimate, type QuoteWithLines } from "./quote-card";
import { ScheduleCard } from "./schedule-card";
import { Timeline, type TimelineEvent } from "./timeline";
import { NextSteps, Step } from "./next-steps";
import { WorkLogsCard, type WorkLogView } from "./work-logs-card";
import { cancelService, moveService, pauseService, resumeService } from "../actions";

export const metadata: Metadata = { title: "Detalle de servicio" };

type Slot = { date?: string; from?: string; to?: string };
type SectionKey = "review" | "assign" | "quote" | "payments" | "schedule" | "work" | "payout" | "contract" | "details" | "photos" | "reviews";

/**
 * Orden de las tarjetas según lo que más le sirve al equipo en cada estado: primero la acción que toca
 * (asignar, evaluar, verificar el pago, comprar materiales, revisar jornadas, verificar, pagar al experto),
 * luego el detalle del servicio. Las que no estén en la lista van al final en el orden base.
 */
const ORDER: Record<ServiceStatus, SectionKey[]> = {
  requested: ["assign", "details", "photos"],
  assigned: ["assign", "quote", "details", "photos"],
  quoting: ["quote", "details", "photos"],
  pending_payment: ["payments", "contract", "quote", "details", "photos"],
  scheduled: ["schedule", "quote", "contract", "payments", "payout", "details", "photos"],
  in_progress: ["work", "schedule", "payout", "quote", "contract", "payments", "details", "photos"],
  paused: ["work", "schedule", "payout", "quote", "contract", "payments", "details", "photos"],
  under_review: ["review", "work", "quote", "contract", "payments", "schedule", "payout", "details", "photos"],
  completed: ["payout", "reviews", "work", "quote", "contract", "payments", "schedule", "details", "photos"],
  cancelled: ["details", "quote", "payments", "contract", "schedule", "work", "payout", "photos", "reviews"],
};
const BASE_ORDER: SectionKey[] = ["review", "assign", "work", "schedule", "payout", "quote", "payments", "contract", "details", "photos", "reviews"];

/** Ancla de cada tarjeta (los botones de "Qué sigue" llevan hasta ella). */
const ANCHOR: Record<SectionKey, string> = {
  review: "verificacion",
  assign: "asignacion",
  quote: "cotizacion",
  payments: "pago",
  schedule: "inicio",
  work: "jornadas",
  payout: "pago-experto",
  contract: "contrato",
  details: "datos",
  photos: "fotos",
  reviews: "resenas",
};

/** datetime-local (hora de Colombia) a partir de un timestamp. */
function toLocalInput(value: string | null) {
  if (!value) return "";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "";
  const co = new Date(d.getTime() - 5 * 60 * 60 * 1000);
  return co.toISOString().slice(0, 16);
}

export default async function ServiceDetailPage(props: PageProps<"/servicios/[id]">) {
  const { id } = await props.params;
  const { supabase } = await requireAdmin();
  const today = todayCO();

  const { data: service } = await supabase
    .from("services")
    .select(
      "*, category:service_categories(id, name), client:profiles!services_client_id_fkey(id, full_name, email, phone, city)",
    )
    .eq("id", id)
    .maybeSingle();
  if (!service) notFound();

  const status = service.status;
  const assigning = status === "requested" || status === "assigned";

  const [
    { data: expertProfile },
    { data: stages },
    { data: payments },
    { data: contract },
    { data: events },
    { data: photos },
    { data: reviews },
    { data: quote },
    { data: schedule },
    { data: workLogs },
    { data: payouts },
    { data: candidates },
    { data: categoryRows },
    { data: holidays },
  ] = await Promise.all([
    service.expert_id
      ? supabase
          .from("expert_profiles")
          .select(
            "user_id, rating_avg, rating_count, is_available, payout_method, payout_account, profile:profiles!expert_profiles_user_id_fkey(full_name, email, phone, city)",
          )
          .eq("user_id", service.expert_id)
          .maybeSingle()
      : Promise.resolve({ data: null }),
    supabase.from("service_stages").select("*").eq("service_id", id).order("position"),
    supabase.from("payments").select("*").eq("service_id", id).order("created_at"),
    supabase
      .from("contracts")
      .select(
        "*, signatures:contract_signatures(id, signer_role, signed_at, ip, body_hash, method, signer:profiles!contract_signatures_signer_id_fkey(full_name))",
      )
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
    supabase.from("service_quotes").select("*, items:quote_items(*), materials:quote_materials(*)").eq("service_id", id).maybeSingle(),
    supabase.from("service_schedule").select("*").eq("service_id", id).maybeSingle(),
    supabase
      .from("work_logs")
      .select("id, work_date, check_in, check_out, notes, photos:work_log_photos(id, storage_path)")
      .eq("service_id", id)
      .order("work_date"),
    supabase.from("expert_payouts").select("*").eq("service_id", id).order("paid_at"),
    assigning
      ? supabase
          .from("expert_profiles")
          .select(
            "user_id, category_ids, rating_avg, rating_count, is_available, payout_method, payout_account, profile:profiles!expert_profiles_user_id_fkey!inner(full_name, city, role), availability:expert_availability(weekday, start_time, end_time)",
          )
          // Solo expertos aprobados (un admin puede tener perfil de experto de pruebas).
          .eq("profile.role", "expert")
          // Todos los disponibles (el agente filtra por actividad) y el experto ya asignado aunque no lo esté.
          .or(service.expert_id ? `is_available.eq.true,user_id.eq.${service.expert_id}` : "is_available.eq.true")
          .order("rating_avg", { ascending: false })
      : Promise.resolve({ data: null }),
    assigning
      ? supabase.from("service_categories").select("id, name").eq("active", true).order("sort_order")
      : Promise.resolve({ data: null }),
    service.start_date
      ? supabase.from("holidays").select("day").gte("day", service.start_date).lte("day", today)
      : Promise.resolve({ data: null }),
  ]);

  // Servicios activos de cada candidato del pool.
  const candidateIds = (candidates ?? []).map((c) => c.user_id);
  const { data: activeRows } = candidateIds.length
    ? await supabase.from("services").select("expert_id").in("expert_id", candidateIds).in("status", ACTIVE_SERVICE_STATUSES)
    : { data: [] as Array<{ expert_id: string | null }> };
  const activeCount = (activeRows ?? []).reduce<Record<string, number>>((acc, r) => {
    if (r.expert_id) acc[r.expert_id] = (acc[r.expert_id] ?? 0) + 1;
    return acc;
  }, {});

  const logs = workLogs ?? [];
  const [photoUrls, proofUrls] = await Promise.all([
    signedUrlMap(supabase, "service-photos", [
      ...(photos ?? []).map((p) => p.storage_path),
      ...logs.flatMap((l) => l.photos.map((p) => p.storage_path)),
    ]),
    signedUrlMap(supabase, "payment-proofs", (payments ?? []).map((p) => p.proof_path)),
  ]);

  const requestPhotos = (photos ?? []).filter((p) => p.kind !== "before");
  const beforePhotos = (photos ?? [])
    .filter((p) => p.kind === "before")
    .map((p) => ({ id: p.id, url: photoUrls.get(p.storage_path) ?? null, label: "Foto del antes" }));
  const paymentRows = (payments ?? []).map((p) => ({ ...p, url: p.proof_path ? proofUrls.get(p.proof_path) ?? null : null }));
  const logViews: WorkLogView[] = logs.map((l) => ({
    id: l.id,
    work_date: l.work_date,
    check_in: l.check_in,
    check_out: l.check_out,
    notes: l.notes,
    photos: l.photos.map((p) => ({ id: p.id, url: photoUrls.get(p.storage_path) ?? null, label: `Jornada ${l.work_date}` })),
  }));

  const expertOptions: ExpertOption[] = (candidates ?? []).map((c) => ({
    id: c.user_id,
    full_name: c.profile?.full_name || "Experto",
    category_ids: c.category_ids,
    city: c.profile?.city ?? null,
    rating_avg: Number(c.rating_avg),
    rating_count: c.rating_count,
    is_available: c.is_available,
    active_services: activeCount[c.user_id] ?? 0,
    payout_method: c.payout_method,
    payout_account: c.payout_account,
    availability: [...c.availability].sort((a, b) => a.weekday - b.weekday || a.start_time.localeCompare(b.start_time)),
  }));

  const quoteWithLines = (quote ?? null) as QuoteWithLines | null;
  const commissionPct = Number(service.commission_pct);
  const netEstimate = expertNetEstimate(quoteWithLines, commissionPct);
  const stageList = stages ?? [];

  // Para un servicio cancelado, el estado que tenía al cancelarse (según el historial).
  const cancelEvent = [...(events ?? [])].reverse().find((e) => e.to_status === "cancelled");
  const cancelledFrom = cancelEvent?.from_status ?? null;

  // Jornadas: último día (cierre o hoy) y días hábiles sin registro desde el inicio.
  const closedDay = dateCO(service.closed_at) ?? (status === "completed" ? dateCO(service.completed_at) : null);
  const lastDay = closedDay && closedDay < today ? closedDay : today;
  const loggedDays = new Set(logs.map((l) => l.work_date));
  const holidaySet = new Set((holidays ?? []).map((h) => h.day));
  const missingDays =
    service.start_date && WORK_STATUSES.includes(status) && service.start_date <= lastDay
      ? businessDaysInRange(service.start_date, lastDay, holidaySet).filter(
          // Hoy no cuenta como faltante mientras el día está en curso (salvo que ya haya cerrado).
          (d) => !loggedDays.has(d) && (d !== today || Boolean(closedDay)),
        )
      : [];

  const hasProofToVerify = paymentRows.some((p) => p.status === "submitted");
  const daysToStart = schedule?.business_days_to_start ?? null;

  const hint: string | null = (() => {
    switch (status) {
      case "requested":
        return "Asignar un experto del pool";
      case "assigned":
        return quoteWithLines?.status === "returned"
          ? "Cotización devuelta: el experto la corrige"
          : quoteWithLines
            ? "El experto está armando la cotización"
            : "Esperando la cotización del experto";
      case "quoting":
        return quoteWithLines?.status === "approved"
          ? "Presentada: el cliente elige solo mano de obra o todo incluido"
          : "Revisar y presentar la cotización al cliente";
      case "pending_payment":
        return hasProofToVerify ? "Hay un comprobante por verificar" : "Esperando el comprobante del cliente";
      case "scheduled":
        if (!service.start_date) return "Sin fecha de inicio";
        return `Inicia el ${formatDayMonth(service.start_date)} · ${
          daysToStart == null ? "" : daysToStart === 0 ? "inicia hoy" : `${daysToStart === 1 ? "falta" : "faltan"} ${businessDaysLabel(daysToStart)}`
        }`;
      case "in_progress":
        return schedule?.estimated_end_date
          ? `Desde el ${formatDayMonth(service.start_date)} · fin estimado ${formatDayMonth(schedule.estimated_end_date)}`
          : service.start_date
            ? `Desde el ${formatDayMonth(service.start_date)}`
            : null;
      case "paused":
        return service.pause_reason ? `En pausa: ${service.pause_reason}` : "En pausa";
      case "under_review":
        return service.review_due_date ? `Verificar con el cliente antes del ${formatDayMonth(service.review_due_date)}` : null;
      case "completed":
        return `Finalizado el ${formatDayMonth(service.completed_at)}`;
      case "cancelled":
        return "Cancelado en este paso";
    }
  })();

  const availability = Array.isArray(service.availability) ? (service.availability as Slot[]) : [];
  const canCancel = status !== "completed" && status !== "cancelled";
  const reviewOverdue = status === "under_review" && service.review_due_date != null && service.review_due_date < today;

  const showPayout =
    Boolean(service.expert_id) &&
    (status === "completed" ||
      ((status === "in_progress" || status === "paused" || status === "under_review") && service.payout_frequency !== "on_completion") ||
      (payouts ?? []).length > 0);

  const sections: Array<{ key: SectionKey; node: React.ReactNode }> = [];

  if (status === "under_review") {
    sections.push({
      key: "review",
      node: (
        <Card>
          <CardHeader
            title="En observación"
            description={`El experto cerró el trabajo el ${formatDateTime(service.closed_at)}; verifica con el cliente que todo quedó bien.`}
          />
          <CardBody className="space-y-4">
            <Alert tone={reviewOverdue ? "error" : "warning"}>
              Fecha límite para verificar con el cliente: <span className="font-semibold">{formatDate(service.review_due_date)}</span>{" "}
              (1 día hábil desde el cierre){reviewOverdue ? " · vencida" : ""}.
            </Alert>
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Notas de cierre del experto</p>
              <p className="mt-1 whitespace-pre-line text-sm leading-relaxed">
                {service.closing_notes || <span className="text-slate-500">El experto no dejó notas.</span>}
              </p>
            </div>
            <div className="flex flex-wrap justify-end gap-2 border-t border-border pt-4">
              <ActionDialog
                triggerLabel="Devolver a ejecución"
                triggerVariant="secondary"
                triggerSize="md"
                title="Devolver a ejecución"
                description="El experto podrá seguir registrando jornadas y volver a cerrar el trabajo."
                action={moveService}
                fields={{ service_id: service.id, target: "in_progress" }}
                submitLabel="Devolver a ejecución"
                pendingLabel="Guardando…"
              >
                <Field label="Motivo" htmlFor="reopen-reason" hint="Obligatorio. Lo verán el experto y el historial.">
                  <Textarea id="reopen-reason" name="reason" required minLength={5} placeholder="Ej.: el cliente reporta una fuga en la unión." />
                </Field>
              </ActionDialog>
              <ActionDialog
                triggerLabel="Finalizar servicio"
                triggerVariant="primary"
                triggerSize="md"
                title="Finalizar servicio"
                description="Confirma que verificaste con el cliente que el trabajo quedó bien. Luego registra el pago al experto."
                action={moveService}
                fields={{ service_id: service.id, target: "completed" }}
                submitLabel="Finalizar servicio"
                pendingLabel="Finalizando…"
              >
                <Field label="Nota (opcional)" htmlFor="complete-reason">
                  <Textarea id="complete-reason" name="reason" placeholder="Ej.: el cliente confirma por teléfono que todo está bien." />
                </Field>
              </ActionDialog>
            </div>
          </CardBody>
        </Card>
      ),
    });
  }

  if (assigning) {
    sections.push({
      key: "assign",
      node: (
        <Card>
          <CardHeader
            title={status === "assigned" ? "Reasignar experto" : "Asignar experto"}
            description="Filtra por actividad, elige al experto y revisa su detalle. El experto elegido arma la cotización desde su app."
          />
          <CardBody>
            <AssignForm
              // Al asignar o reasignar se vuelve a montar con el experto vigente seleccionado.
              key={service.expert_id ?? "sin-experto"}
              serviceId={service.id}
              experts={expertOptions}
              categories={categoryRows ?? []}
              serviceCategoryId={service.category_id}
              serviceCity={service.city}
              currentExpertId={service.expert_id}
              defaultScheduledAt={toLocalInput(service.scheduled_at)}
            />
          </CardBody>
        </Card>
      ),
    });
  }

  if (quoteWithLines || status === "assigned" || status === "quoting") {
    sections.push({
      key: "quote",
      node: (
        <QuoteCard
          serviceId={service.id}
          status={status}
          quote={quoteWithLines}
          beforePhotos={beforePhotos}
          commissionPct={commissionPct}
          clientFeePct={Number(service.client_fee_pct)}
        />
      ),
    });
  }

  if (stageList.length > 0) {
    sections.push({
      key: "payments",
      node: <PaymentsCard serviceId={service.id} status={status} stages={stageList} payments={paymentRows} />,
    });
  }

  if (STARTED_STATUSES.includes(status) || (status === "cancelled" && service.start_date)) {
    sections.push({
      key: "schedule",
      node: (
        <ScheduleCard
          status={status}
          schedule={schedule ?? null}
          startedAt={service.started_at}
          payoutMethod={expertProfile?.payout_method ?? null}
          payoutAccount={expertProfile?.payout_account ?? null}
        />
      ),
    });
  }

  if (WORK_STATUSES.includes(status) || logViews.length > 0) {
    sections.push({
      key: "work",
      node: (
        <WorkLogsCard
          logs={logViews}
          startDate={service.start_date}
          lastDay={closedDay ?? today}
          closed={Boolean(closedDay)}
          missingDays={missingDays}
          payoutFrequency={service.payout_frequency}
        />
      ),
    });
  }

  if (showPayout && service.expert_id) {
    sections.push({
      key: "payout",
      node: (
        <PayoutsCard
          serviceId={service.id}
          expertId={service.expert_id}
          payoutMethod={expertProfile?.payout_method ?? null}
          payoutAccount={expertProfile?.payout_account ?? null}
          payoutFrequency={service.payout_frequency}
          netEstimate={netEstimate}
          payouts={payouts ?? []}
        />
      ),
    });
  }

  if (contract || (service.expert_id && status !== "cancelled")) {
    sections.push({
      key: "contract",
      node: <ContractCard serviceId={service.id} status={status} contract={(contract ?? null) as ContractWithSignatures | null} />,
    });
  }

  sections.push({
    key: "details",
    node: (
      <Card>
        <CardHeader title="Datos del servicio" />
        <CardBody className="space-y-5">
          <p className="whitespace-pre-line text-sm leading-relaxed">{service.description}</p>
          <DescriptionList
            columns={3}
            items={[
              { label: "Categoría", value: service.category?.name ?? "—" },
              { label: "Modalidad", value: service.pricing_mode ? `${PRICING_MODE[service.pricing_mode].label} · la eligió el cliente` : "La elige el cliente al presentarle la cotización" },
              { label: "Ciudad", value: service.city ?? "—" },
              { label: "Dirección", value: service.address ?? "—" },
              { label: "Total aprobado", value: formatCOP(service.estimated_price) },
              { label: "Comisiones", value: `Experto ${commissionPct} % · cliente ${Number(service.client_fee_pct)} %` },
              { label: "Fecha de visita", value: formatDateTime(service.scheduled_at) },
              { label: "Asignado", value: formatDateTime(service.assigned_at) },
              { label: "Iniciado", value: formatDateTime(service.started_at) },
              { label: "Finalizado", value: formatDateTime(service.completed_at) },
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
    ),
  });

  sections.push({
    key: "photos",
    node: (
      <Card>
        <CardHeader title="Fotos del cliente" description="Las que adjuntó al solicitar. URLs firmadas de 60 segundos." />
        <CardBody>
          <PhotoGrid
            photos={requestPhotos.map((p) => ({ id: p.id, url: photoUrls.get(p.storage_path) ?? null, label: "Foto del cliente" }))}
            empty="El cliente no adjuntó fotos."
          />
        </CardBody>
      </Card>
    ),
  });

  if ((reviews ?? []).length > 0) {
    sections.push({
      key: "reviews",
      node: (
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
      ),
    });
  }

  const order = ORDER[status];
  const rank = (key: SectionKey) => {
    const i = order.indexOf(key);
    return i >= 0 ? i : order.length + BASE_ORDER.indexOf(key);
  };
  const ordered = [...sections].sort((a, b) => rank(a.key) - rank(b.key));
  const statusInfo = SERVICE_STATUS[status];

  // Resumen: valores del servicio, estado del pago del cliente y del contrato.
  const labor = quoteWithLines ? Number(quoteWithLines.approved_labor_total ?? quoteWithLines.labor_total ?? 0) : null;
  const chosen = quoteWithLines?.total != null;
  const xpertosGain =
    chosen && labor != null && netEstimate != null ? Number(quoteWithLines?.client_fee_total ?? 0) + (labor - netEstimate) : null;
  const allPaid = stageList.length > 0 && stageList.every((s) => s.status === "paid");
  const proofRejected = !allPaid && !hasProofToVerify && stageList.some((s) => s.status === "rejected");
  const clientPayment = allPaid ? "Verificado" : hasProofToVerify ? "Comprobante por verificar" : proofRejected ? "Comprobante rechazado" : "Pendiente";
  const typedContract = (contract ?? null) as ContractWithSignatures | null;
  const contractSigned = typedContract?.status === "signed";
  const startAct = Boolean(typedContract?.body_md.includes("acta de inicio"));
  const payoutCount = (payouts ?? []).length;
  const expertName = expertProfile?.profile?.full_name || "el experto";
  const expertPhone = expertProfile?.profile?.phone;

  const steps: React.ReactNode = (() => {
    switch (status) {
      case "requested":
        return (
          <Step state="todo" title="Asigna un experto del pool" detail="Filtra por actividad y revisa disponibilidad y calificación." action={{ label: "Asignar experto", href: `#${ANCHOR.assign}` }} />
        );
      case "assigned":
        return (
          <Step
            state={quoteWithLines?.status === "returned" ? "alert" : "waiting"}
            title={
              quoteWithLines?.status === "returned"
                ? "El experto corrige la cotización devuelta"
                : quoteWithLines
                  ? "El experto está armando la cotización"
                  : "Esperando la cotización del experto"
            }
            detail={`${expertName}${expertPhone ? ` · ${expertPhone}` : ""}${service.scheduled_at ? ` · visita ${formatDateTime(service.scheduled_at)}` : ""}`}
            action={{ label: "Reasignar", href: `#${ANCHOR.assign}` }}
          />
        );
      case "quoting":
        return quoteWithLines?.status === "approved" && !chosen ? (
          <Step
            state="waiting"
            title="El cliente elige solo mano de obra o todo incluido"
            detail="Si te dice su elección por otro medio, regístrala en la cotización."
            action={{ label: "Ver cotización", href: `#${ANCHOR.quote}` }}
          />
        ) : (
          <Step state="todo" title="Revisa y presenta la cotización al cliente" detail="Valida la mano de obra y pon el valor por unidad de cada material." action={{ label: "Evaluar cotización", href: `#${ANCHOR.quote}` }} />
        );
      case "pending_payment":
        return (
          <>
            <Step
              state={hasProofToVerify ? "todo" : proofRejected ? "alert" : "waiting"}
              title={hasProofToVerify ? "Verifica el comprobante en el banco" : proofRejected ? "El cliente debe subir otro comprobante" : "Esperando el comprobante del cliente"}
              detail={`Total ${formatCOP(service.estimated_price)}.`}
              action={hasProofToVerify ? { label: "Verificar pago", href: `#${ANCHOR.payments}` } : null}
            />
            <Step
              state={contractSigned ? "done" : "waiting"}
              title={contractSigned ? "El cliente firmó el contrato" : "Firma del cliente pendiente"}
              detail={contractSigned ? undefined : "Le llegó el enlace para firmar por correo; también puede firmar en la app."}
              action={{ label: "Ver contrato", href: `#${ANCHOR.contract}` }}
            />
          </>
        );
      case "scheduled":
        return (
          <>
            {service.pricing_mode === "all_inclusive" && (
              <Step
                state="todo"
                title={`Compra los materiales y llévalos al lugar antes del ${formatDayMonth(service.start_date)}`}
                detail={`${quoteWithLines?.materials.length ?? 0} materiales · ${[service.address, service.city].filter(Boolean).join(", ")}`}
                action={{ label: "Ver materiales", href: `#${ANCHOR.quote}` }}
              />
            )}
            <Step state="waiting" title={hint ?? "Programado"} detail="El servicio inicia solo en la fecha acordada." action={{ label: "Ver fechas", href: `#${ANCHOR.schedule}` }} />
            {typedContract && !contractSigned && (
              <Step state="waiting" title={startAct ? "Firma del acta de inicio pendiente" : "Firma del contrato pendiente"} action={{ label: "Ver contrato", href: `#${ANCHOR.contract}` }} />
            )}
          </>
        );
      case "in_progress":
      case "paused":
        return (
          <>
            <Step
              state={missingDays.length > 0 ? "alert" : "done"}
              title={missingDays.length > 0 ? `${missingDays.length === 1 ? "1 día hábil" : `${missingDays.length} días hábiles`} sin registro de jornada` : "Jornadas al día"}
              detail={`${logViews.length} ${logViews.length === 1 ? "jornada registrada" : "jornadas registradas"}.`}
              action={{ label: "Ver jornadas", href: `#${ANCHOR.work}` }}
            />
            {service.payout_frequency !== "on_completion" && (
              <Step
                state="todo"
                title={`Pagos ${PAYOUT_FREQUENCY[service.payout_frequency].toLowerCase()} al experto`}
                detail={`${payoutCount} ${payoutCount === 1 ? "pago registrado" : "pagos registrados"}.`}
                action={{ label: "Registrar pago", href: `#${ANCHOR.payout}` }}
              />
            )}
          </>
        );
      case "under_review":
        return (
          <Step
            state={reviewOverdue ? "alert" : "todo"}
            title="Verifica con el cliente y finaliza o devuelve a ejecución"
            detail={service.review_due_date ? `Plazo: ${formatDate(service.review_due_date)}${reviewOverdue ? " · vencido" : ""}.` : undefined}
            action={{ label: "Verificar", href: `#${ANCHOR.review}` }}
          />
        );
      case "completed":
        return (
          <Step
            state={payoutCount > 0 ? "done" : "todo"}
            title={payoutCount > 0 ? "Pago al experto registrado" : `Registra el pago al experto${netEstimate != null ? `: ${formatCOP(netEstimate)}` : ""}`}
            detail={`${payoutMethodLabel(expertProfile?.payout_method)}${expertProfile?.payout_account ? ` · ${expertProfile.payout_account}` : ""}`}
            action={{ label: payoutCount > 0 ? "Ver pago" : "Registrar pago", href: `#${ANCHOR.payout}` }}
          />
        );
      default:
        return null;
    }
  })();

  const facts = [
    { label: "Total que paga el cliente", value: chosen ? formatCOP(service.estimated_price) : null },
    { label: "Modalidad", value: service.pricing_mode ? PRICING_MODE[service.pricing_mode].label : null },
    { label: "Cotización del experto", value: labor ? formatCOP(labor) : null },
    { label: "Neto para el experto", value: netEstimate != null ? formatCOP(netEstimate) : null },
    { label: "Ganancia Xpertos", value: xpertosGain != null ? formatCOP(xpertosGain) : null },
    { label: "Pago del cliente", value: stageList.length > 0 ? clientPayment : null },
    { label: "Contrato", value: typedContract ? CONTRACT_STATUS[typedContract.status].label : null },
    { label: "Visita acordada", value: service.scheduled_at && assigning ? formatDateTime(service.scheduled_at) : null },
    { label: "Inicio de obra", value: schedule?.start_date ? formatDate(schedule.start_date) : null },
    { label: "Fin estimado", value: schedule?.estimated_end_date ? formatDate(schedule.estimated_end_date) : null },
  ].filter((f): f is { label: string; value: string } => Boolean(f.value));

  return (
    <>
      <PageHeader
        backHref="/servicios"
        backLabel="Servicios"
        title={service.title}
        meta={<Badge tone={statusInfo.tone}>{statusInfo.label}</Badge>}
        description={
          <>
            <span className="font-mono">{shortId(service.id)}</span> · {service.category?.name ?? "Sin categoría"} · creado el{" "}
            {formatDateTime(service.created_at)}
          </>
        }
        actions={
          <>
            {status === "in_progress" && (
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
                  <Textarea id="pause-reason" name="reason" required minLength={5} placeholder="Ej.: esperando que lleguen los materiales." />
                </Field>
              </ActionDialog>
            )}
            {status === "paused" && (
              <ActionButton
                action={resumeService}
                fields={{ service_id: service.id }}
                variant="primary"
                size="md"
                confirm={{
                  title: "Reanudar el servicio",
                  description: "Vuelve a En ejecución y avisamos al cliente y al experto.",
                  confirmLabel: "Reanudar",
                }}
              >
                Reanudar
              </ActionButton>
            )}
            {canCancel && (
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
            )}
          </>
        }
      />

      <Card className="mb-6">
        <CardBody className="space-y-4">
          <ServicePhaseBar status={status} cancelledFrom={cancelledFrom} hint={hint} />
          {steps && <NextSteps>{steps}</NextSteps>}
          {facts.length > 0 && <DescriptionList columns={3} items={facts} />}
          {status === "paused" && (
            <Alert tone="warning">Servicio en pausa{service.pause_reason ? `: ${service.pause_reason}` : "."}</Alert>
          )}
          {status === "cancelled" && (
            <Alert tone="error">
              Servicio cancelado{cancelledFrom ? ` cuando estaba ${SERVICE_STATUS[cancelledFrom].label}` : ""}
              {service.cancel_reason ? `. Motivo: ${service.cancel_reason}` : "."}
            </Alert>
          )}
          <MoveControls serviceId={service.id} status={status} />
        </CardBody>
      </Card>

      <div className="grid gap-6 lg:grid-cols-3 [&>*]:min-w-0">
        <div className="min-w-0 space-y-6 lg:col-span-2">
          {ordered.map((section) => (
            <div key={section.key} id={ANCHOR[section.key]} className="scroll-mt-6">
              {section.node}
            </div>
          ))}
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
                    {
                      label: "Calificación",
                      value: expertProfile
                        ? `${Number(expertProfile.rating_avg).toFixed(1)} (${expertProfile.rating_count} reseñas)`
                        : "—",
                    },
                    {
                      label: "Medio de pago",
                      value: (
                        <>
                          {payoutMethodLabel(expertProfile?.payout_method)}
                          {expertProfile?.payout_account && (
                            <span className="block text-xs text-slate-500">{expertProfile.payout_account}</span>
                          )}
                        </>
                      ),
                    },
                    { label: "Periodicidad de pago", value: PAYOUT_FREQUENCY[service.payout_frequency] },
                  ]}
                />
              )}
            </CardBody>
          </Card>

          <Card>
            <CardHeader title="Historial" />
            <CardBody>
              <Timeline events={(events ?? []) as TimelineEvent[]} />
            </CardBody>
          </Card>
        </div>
      </div>
    </>
  );
}
