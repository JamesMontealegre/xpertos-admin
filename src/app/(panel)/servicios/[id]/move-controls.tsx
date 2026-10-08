import { Alert } from "@/components/ui/alert";
import { Button, LinkButton } from "@/components/ui/button";
import { ActionDialog } from "@/components/ui/dialog";
import { Field, Textarea } from "@/components/ui/input";
import type { ServiceStatus } from "@/lib/labels";
import { FLOW_LABEL, nextStatus, previousStatus, type FlowStatus } from "@/lib/service-phase";
import { moveService } from "../actions";

/** Qué pasa al regresar desde cada estado (lo hace `admin_move_service`). */
const BACK_EFFECT: Partial<Record<ServiceStatus, string>> = {
  assigned: "Se quita el experto asignado y el servicio vuelve al pool para asignarlo de nuevo.",
  quoting: "La cotización vuelve al experto como devuelta, con el motivo, para que la corrija y la envíe otra vez.",
  pending_payment:
    "La cotización vuelve a revisión, se anula el contrato y se elimina el cobro si el cliente no ha subido comprobantes.",
  scheduled: "Se borran la fecha de pago y la fecha de inicio. El servicio queda esperando la confirmación del pago.",
  in_progress: "El inicio se reprograma para el siguiente día hábil.",
  under_review: "El experto podrá seguir registrando jornadas y volver a cerrar el trabajo.",
  completed: "El servicio vuelve a verificación con el cliente.",
};

/** Qué pasa al avanzar manualmente desde cada estado. */
const FORWARD_EFFECT: Partial<Record<ServiceStatus, string>> = {
  pending_payment:
    "Lo normal es verificar el comprobante del cliente en «Pago del servicio». Si avanzas manualmente, hoy queda como fecha de pago y el inicio se calcula según la modalidad (2 o 5 días hábiles).",
  scheduled: "El servicio inicia hoy (inicio anticipado). Normalmente inicia solo en la fecha acordada.",
  in_progress:
    "Cierra el trabajo sin exigir los registros del experto (primer y último día con fotos). Lo normal es que el experto lo cierre desde su app.",
  under_review: "Confirma que verificaste con el cliente que el trabajo quedó bien.",
};

const FORWARD_PLACEHOLDER: Partial<Record<ServiceStatus, string>> = {
  pending_payment: "Ej.: el cliente pagó en efectivo en la oficina.",
  scheduled: "Ej.: el cliente pidió adelantar el inicio.",
  in_progress: "Ej.: el experto terminó pero no pudo cerrar desde la app.",
  under_review: "Ej.: el cliente confirma por teléfono que todo está bien.",
};

/**
 * Botones "← Regresar a …" y "Avanzar a … →" junto a la barra. Cuando el avance tiene una acción
 * propia (asignar experto, evaluar la cotización) se muestra un enlace a esa acción.
 */
export function MoveControls({ serviceId, status }: { serviceId: string; status: ServiceStatus }) {
  const prev = previousStatus(status);
  const next = nextStatus(status);
  if (!prev && !next) return null;

  return (
    <div className="flex flex-wrap items-center justify-between gap-2 border-t border-border pt-4">
      <div>{prev && <BackDialog serviceId={serviceId} status={status} target={prev} />}</div>
      <div className="flex flex-wrap items-center justify-end gap-2">
        {next && <ForwardControl serviceId={serviceId} status={status} target={next} />}
      </div>
    </div>
  );
}

function BackDialog({ serviceId, status, target }: { serviceId: string; status: ServiceStatus; target: FlowStatus }) {
  return (
    <ActionDialog
      triggerLabel={`← Regresar a ${FLOW_LABEL[target]}`}
      triggerVariant="ghost"
      title={`Regresar a ${FLOW_LABEL[target]}`}
      description={BACK_EFFECT[status]}
      action={moveService}
      fields={{ service_id: serviceId, target }}
      submitLabel={`Regresar a ${FLOW_LABEL[target]}`}
      pendingLabel="Guardando…"
    >
      <Field label="Motivo" htmlFor={`back-reason-${serviceId}`} hint="Obligatorio. Queda en el historial del servicio.">
        <Textarea id={`back-reason-${serviceId}`} name="reason" required minLength={5} placeholder="Ej.: el cliente pidió cambiar el alcance." />
      </Field>
    </ActionDialog>
  );
}

function ForwardControl({ serviceId, status, target }: { serviceId: string; status: ServiceStatus; target: FlowStatus }) {
  if (status === "requested") {
    return (
      <LinkButton href="#asignacion" variant="primary" size="sm">
        Asignar experto ↓
      </LinkButton>
    );
  }
  if (status === "assigned") {
    return (
      <>
        <span className="text-xs text-slate-500">Pasa a En cotización cuando el experto envía la cotización desde su app.</span>
        <Button size="sm" variant="secondary" disabled title="El experto envía la cotización desde su app">
          Avanzar a {FLOW_LABEL[target]} →
        </Button>
      </>
    );
  }
  if (status === "quoting") {
    return (
      <LinkButton href="#cotizacion" variant="primary" size="sm">
        Evaluar la cotización ↓
      </LinkButton>
    );
  }

  return (
    <ActionDialog
      triggerLabel={`Avanzar a ${FLOW_LABEL[target]} →`}
      triggerVariant="primary"
      title={`Avanzar a ${FLOW_LABEL[target]}`}
      description="El cliente y el experto verán el nuevo estado."
      action={moveService}
      fields={{ service_id: serviceId, target }}
      submitLabel={`Avanzar a ${FLOW_LABEL[target]}`}
      pendingLabel="Guardando…"
    >
      {FORWARD_EFFECT[status] && <Alert tone={status === "under_review" ? "info" : "warning"}>{FORWARD_EFFECT[status]}</Alert>}
      <Field label="Motivo (opcional)" htmlFor={`forward-reason-${serviceId}`} hint="Queda en el historial del servicio.">
        <Textarea id={`forward-reason-${serviceId}`} name="reason" placeholder={FORWARD_PLACEHOLDER[status]} />
      </Field>
    </ActionDialog>
  );
}
