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

export type Tone = "slate" | "amber" | "blue" | "teal" | "green" | "red" | "orange";

/**
 * Estado técnico del servicio en la base (se ve en el historial). Para el operador, el avance se
 * muestra con las etapas de `service-phase.ts` (Cotización → … → Finalizado).
 */
export const SERVICE_STATUS: Record<ServiceStatus, { label: string; tone: Tone }> = {
  requested: { label: "Solicitud recibida", tone: "slate" },
  in_review: { label: "En cotización", tone: "slate" },
  assigned: { label: "Experto asignado", tone: "blue" },
  in_progress: { label: "En ejecución", tone: "teal" },
  paused: { label: "En pausa", tone: "amber" },
  completed: { label: "Finalizado", tone: "green" },
  cancelled: { label: "Cancelado", tone: "red" },
};

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
};

export const APPLICATION_STATUS_ORDER: ApplicationStatus[] = [
  "pending",
  "in_review",
  "needs_info",
  "approved",
  "rejected",
];

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
  other: "Otro",
};

/**
 * Documentos requeridos de una postulación (los mismos que la app de usuarios marca como
 * "Requerido"). RUT, antecedentes, certificados, portafolio y "otro" son opcionales.
 */
export const REQUIRED_DOCUMENTS: DocumentKind[] = [
  "id_front",
  "id_back",
  "social_security",
  "photo",
  "recommendation_letter",
];

export function missingRequiredDocuments(uploaded: DocumentKind[]): DocumentKind[] {
  return REQUIRED_DOCUMENTS.filter((kind) => !uploaded.includes(kind));
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
};

export function eventLabel(type: string) {
  return EVENT_TYPE[type] ?? type;
}
