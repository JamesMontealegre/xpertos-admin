import type { Database } from "@/lib/database.types";

type Enums = Database["public"]["Enums"];
export type ServiceStatus = Enums["service_status"];
export type StageStatus = Enums["stage_status"];
export type ApplicationStatus = Enums["application_status"];
export type PaymentStatus = Enums["payment_status"];
export type ContractStatus = Enums["contract_status"];
export type UserRole = Enums["user_role"];
export type DocumentKind = Enums["document_kind"];
export type PaymentMethod = Enums["payment_method"];
export type PricingMode = Enums["pricing_mode"];
export type QuoteStatus = Enums["quote_status"];
export type PayoutFrequency = Enums["payout_frequency"];
export type PayoutMethod = Enums["payout_method"];

export type Tone = "slate" | "amber" | "blue" | "teal" | "green" | "red" | "orange";

/** Estado del servicio (el mismo que ve el cliente y el experto en sus apps). */
export const SERVICE_STATUS: Record<ServiceStatus, { label: string; tone: Tone }> = {
  requested: { label: "Solicitado", tone: "slate" },
  assigned: { label: "Asignado", tone: "blue" },
  quoting: { label: "En cotización", tone: "blue" },
  pending_payment: { label: "Pendiente de pago", tone: "orange" },
  scheduled: { label: "Programado", tone: "teal" },
  in_progress: { label: "En ejecución", tone: "teal" },
  paused: { label: "En pausa", tone: "amber" },
  under_review: { label: "En observación", tone: "amber" },
  completed: { label: "Finalizado", tone: "green" },
  cancelled: { label: "Cancelado", tone: "red" },
};

/** Orden de los filtros del listado y de las tarjetas del dashboard. */
export const SERVICE_STATUS_ORDER: ServiceStatus[] = [
  "requested",
  "assigned",
  "quoting",
  "pending_payment",
  "scheduled",
  "in_progress",
  "paused",
  "under_review",
  "completed",
  "cancelled",
];

export function isServiceStatus(value: string): value is ServiceStatus {
  return (SERVICE_STATUS_ORDER as string[]).includes(value);
}

/** Estados en los que el servicio ocupa al experto (cuentan como "servicios activos"). */
export const ACTIVE_SERVICE_STATUSES: ServiceStatus[] = [
  "assigned",
  "quoting",
  "pending_payment",
  "scheduled",
  "in_progress",
  "paused",
  "under_review",
];

export const PRICING_MODE: Record<PricingMode, { label: string; short: string }> = {
  labor_only: { label: "Solo mano de obra", short: "Solo mano de obra" },
  all_inclusive: { label: "Todo incluido (materiales + mano de obra)", short: "Todo incluido" },
};

export const QUOTE_STATUS: Record<QuoteStatus, { label: string; tone: Tone }> = {
  draft: { label: "Borrador", tone: "slate" },
  submitted: { label: "Enviada", tone: "blue" },
  returned: { label: "Devuelta", tone: "orange" },
  approved: { label: "Aprobada", tone: "green" },
};

export const PAYOUT_FREQUENCY: Record<PayoutFrequency, string> = {
  daily: "Diario",
  weekly: "Semanal",
  biweekly: "Quincenal",
  monthly: "Mensual",
  on_completion: "Obra terminada",
};

export const PAYOUT_METHOD: Record<PayoutMethod, string> = {
  bank_account: "Cuenta bancaria",
  nequi: "Nequi",
  efecty: "Efectivo (Puntos Efecty)",
};

export const PAYOUT_METHOD_ORDER: PayoutMethod[] = ["bank_account", "nequi", "efecty"];

export function payoutMethodLabel(method: PayoutMethod | null | undefined) {
  return method ? PAYOUT_METHOD[method] : "Sin definir";
}

export const STAGE_STATUS: Record<StageStatus, { label: string; tone: Tone }> = {
  pending: { label: "Pendiente", tone: "slate" },
  awaiting_payment: { label: "Por pagar", tone: "amber" },
  proof_uploaded: { label: "Comprobante enviado", tone: "blue" },
  paid: { label: "Pagado", tone: "green" },
  rejected: { label: "Rechazado", tone: "red" },
};

export const APPLICATION_STATUS: Record<ApplicationStatus, { label: string; tone: Tone }> = {
  pending: { label: "Pendiente", tone: "slate" },
  in_review: { label: "En revisión", tone: "amber" },
  needs_info: { label: "Falta información", tone: "orange" },
  approved: { label: "Aprobada", tone: "green" },
  rejected: { label: "Rechazada", tone: "red" },
  expired: { label: "Vencida", tone: "slate" },
};

/** Pestañas de la lista ("Falta información" ya no se usa: el agente rechaza documentos puntuales). */
export const APPLICATION_STATUS_ORDER: ApplicationStatus[] = ["pending", "in_review", "approved", "rejected", "expired"];

/** Días calendario que una postulación puede estar abierta antes de vencer. */
export const APPLICATION_WINDOW_DAYS = 15;

export const PAYMENT_STATUS: Record<PaymentStatus, { label: string; tone: Tone }> = {
  submitted: { label: "Por verificar", tone: "amber" },
  verified: { label: "Verificado", tone: "green" },
  rejected: { label: "Rechazado", tone: "red" },
};

export const CONTRACT_STATUS: Record<ContractStatus, { label: string; tone: Tone }> = {
  draft: { label: "Borrador", tone: "slate" },
  pending_signatures: { label: "Pendiente de firmas", tone: "amber" },
  signed: { label: "Firmado", tone: "green" },
  void: { label: "Anulado", tone: "red" },
};

export const ROLE_LABEL: Record<UserRole, string> = {
  client: "Cliente",
  expert: "Experto",
  admin: "Operador",
};

export const DOCUMENT_KIND: Record<DocumentKind, string> = {
  id_front: "Cédula (frente)",
  id_back: "Cédula (reverso)",
  social_security: "Planilla de seguridad social y ARL",
  photo: "Foto 3x4 fondo blanco",
  recommendation_letter: "Carta de recomendación del último trabajo",
  rut: "RUT",
  background_check: "Certificado de antecedentes",
  certificate: "Certificado o diploma",
  portfolio: "Portafolio de trabajos",
  bank_certificate: "Certificación bancaria",
  other: "Otro",
};

/**
 * Documentos requeridos de una postulación (los mismos que la app de usuarios marca como
 * "Requerido"). RUT, antecedentes, certificados, portafolio y "otro" son opcionales.
 * La certificación bancaria se exige solo si el aspirante elige recibir pagos en cuenta bancaria.
 */
export const REQUIRED_DOCUMENTS: DocumentKind[] = [
  "id_front",
  "id_back",
  "social_security",
  "photo",
  "recommendation_letter",
];

export type Requirement = {
  key: string;
  label: string;
  done: boolean;
  /** Aclaración corta, p. ej. qué medio de pago eligió. */
  detail?: string;
};

/**
 * Requisitos de una postulación: siempre 6. Los 5 documentos requeridos más el soporte del medio
 * de pago, que se cumple según lo que eligió el aspirante: certificación bancaria (cuenta bancaria),
 * número registrado (Nequi) o solo la elección (Efecty).
 */
export const REQUIREMENTS_TOTAL = REQUIRED_DOCUMENTS.length + 1;

export function applicationRequirements(
  uploaded: DocumentKind[],
  payoutMethod: PayoutMethod | null | undefined,
  payoutAccount: string | null | undefined,
): Requirement[] {
  const documents = REQUIRED_DOCUMENTS.map((kind) => ({
    key: kind,
    label: DOCUMENT_KIND[kind],
    done: uploaded.includes(kind),
  }));

  let payout: Requirement;
  if (payoutMethod === "bank_account") {
    payout = {
      key: "payout",
      label: DOCUMENT_KIND.bank_certificate,
      done: uploaded.includes("bank_certificate"),
      detail: "Medio de pago: cuenta bancaria",
    };
  } else if (payoutMethod === "nequi") {
    payout = {
      key: "payout",
      label: "Número Nequi",
      done: Boolean(payoutAccount?.trim()),
      detail: payoutAccount?.trim() ? `Medio de pago: Nequi ${payoutAccount.trim()}` : "Medio de pago: Nequi",
    };
  } else if (payoutMethod === "efecty") {
    payout = {
      key: "payout",
      label: "Medio de pago",
      done: true,
      detail: "Efectivo en Puntos Efecty, a nombre y cédula del aspirante",
    };
  } else {
    payout = { key: "payout", label: "Medio de pago", done: false, detail: "Aún no lo elige" };
  }

  return [...documents, payout];
}

export const PAYMENT_METHOD: Record<PaymentMethod, string> = {
  transfer: "Transferencia",
  cash: "Efectivo",
  mercado_pago: "Mercado Pago",
  tucompra: "TuCompra",
};

export const WEEKDAYS = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"];

export const EVENT_TYPE: Record<string, string> = {
  status_change: "Cambio de estado",
  assigned: "Experto asignado",
  stage_created: "Etapa creada",
  payment_submitted: "Comprobante enviado",
  payment_verified: "Pago verificado",
  payment_rejected: "Pago rechazado",
  contract_created: "Contrato generado",
  contract_signed: "Contrato firmado",
  review_created: "Reseña publicada",
  quote_submitted: "Cotización enviada",
  quote_approved: "Cotización aprobada",
  quote_returned: "Cotización devuelta",
  payout_frequency_set: "Periodicidad de pago elegida",
  work_closed: "Trabajo cerrado por el experto",
};

export function eventLabel(type: string) {
  return EVENT_TYPE[type] ?? type;
}

/** Correos de notificación (tabla email_outbox). */
export const EMAIL_TEMPLATE_LABEL: Record<string, string> = {
  service_requested: "Solicitud recibida",
  service_assigned: "Experto asignado",
  quote_submitted: "Cotización por revisar",
  quote_returned: "Cotización devuelta",
  quote_approved: "Cotización aprobada",
  payment_submitted: "Comprobante de pago",
  payment_verified: "Pago confirmado",
  payment_rejected: "Pago rechazado",
  service_scheduled: "Servicio programado",
  service_started: "Inicio de obra",
  service_paused: "Servicio en pausa",
  service_resumed: "Servicio reanudado",
  work_closed: "Trabajo cerrado",
  work_reopened: "Ajustes pendientes",
  service_completed: "Servicio finalizado",
  service_cancelled: "Servicio cancelado",
  payout_sent: "Pago al experto",
  application_received: "Postulación recibida",
  application_document_rejected: "Documento rechazado",
  application_expired: "Postulación vencida",
  application_credentials: "Acceso del aspirante",
  application_approved: "Postulación aprobada",
  application_rejected: "Postulación rechazada",
  application_needs_info: "Postulación: falta información",
  application_reopened: "Postulación reabierta",
};

export const EMAIL_AUDIENCE_LABEL: Record<string, string> = {
  client: "Cliente",
  expert: "Experto",
  admin: "Equipo",
  applicant: "Aspirante",
};

/** Intentos de envío antes de dejar un correo como fallido definitivo (igual que en la base). */
export const EMAIL_MAX_ATTEMPTS = 5;
