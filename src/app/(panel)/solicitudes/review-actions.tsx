import { ActionDialog } from "@/components/ui/dialog";
import { Field, Textarea } from "@/components/ui/input";
import type { ApplicationStatus } from "@/lib/labels";
import { rejectDocument, reopenApplication, reviewApplication } from "./actions";

type Application = { id: string; full_name: string; status: ApplicationStatus };

/**
 * Decisión sobre una postulación. Aprobar y rechazar solo aparecen En revisión (todos los requisitos
 * completos); una rechazada o vencida solo ofrece "Abrir postulación".
 */
export function ReviewActions({ application, size = "md" }: { application: Application; size?: "sm" | "md" }) {
  const fields = { application_id: application.id };

  if (application.status === "rejected" || application.status === "expired") {
    return (
      <ActionDialog
        triggerLabel="Abrir postulación"
        triggerVariant="secondary"
        triggerSize={size}
        title={`Abrir de nuevo la postulación de ${application.full_name}`}
        description="Vuelve a Pendiente con un plazo nuevo de 15 días calendario. Si ya tiene todos los requisitos, pasa directo a revisión."
        action={reopenApplication}
        fields={fields}
        submitLabel="Abrir postulación"
        pendingLabel="Abriendo…"
      >
        <Field label="Nota (opcional)" htmlFor={`reopen-notes-${application.id}`} hint="El aspirante la verá en la app.">
          <Textarea id={`reopen-notes-${application.id}`} name="notes" placeholder="Ej.: el aspirante actualizó la ARL." />
        </Field>
      </ActionDialog>
    );
  }

  if (application.status !== "in_review") return null;

  return (
    <div className="grid gap-2 [&>button]:w-full">
      <ActionDialog
        triggerLabel="Aprobar"
        triggerVariant="primary"
        triggerSize={size}
        title={`Aprobar a ${application.full_name}`}
        description="La cuenta pasará a ser experto, podrá recibir servicios asignados y le enviaremos el correo de bienvenida."
        action={reviewApplication}
        fields={{ ...fields, status: "approved" }}
        submitLabel="Aprobar postulación"
        pendingLabel="Aprobando…"
      >
        <Field label="Nota interna (opcional)" htmlFor={`approve-notes-${application.id}`}>
          <Textarea id={`approve-notes-${application.id}`} name="notes" placeholder="Ej.: documentos verificados con la ARL y antecedentes." />
        </Field>
      </ActionDialog>

      <ActionDialog
        triggerLabel="Rechazar"
        triggerVariant="danger"
        triggerSize={size}
        title={`Rechazar la postulación de ${application.full_name}`}
        description="Úsalo cuando algo no se alinea con el negocio. La postulación queda rechazada: el aspirante recibe el motivo por correo y en la app, y podrá presentar una nueva cuando lo resuelva. Para un detalle de un solo documento, rechaza solo ese documento."
        action={reviewApplication}
        fields={{ ...fields, status: "rejected" }}
        submitLabel="Rechazar postulación"
        submitVariant="danger"
        pendingLabel="Rechazando…"
      >
        <Field label="Motivo del rechazo" htmlFor={`reject-notes-${application.id}`} hint="Obligatorio. El aspirante lo verá tal cual.">
          <Textarea
            id={`reject-notes-${application.id}`}
            name="notes"
            required
            minLength={10}
            placeholder="Ej.: tiene antecedentes disciplinarios vigentes / al consultar la ARL no está vigente."
          />
        </Field>
      </ActionDialog>
    </div>
  );
}

/** Rechazo de un documento puntual (borroso, vencido, incompleto). */
export function RejectDocumentButton({
  applicationId,
  document,
}: {
  applicationId: string;
  document: { id: string; label: string };
}) {
  return (
    <ActionDialog
      triggerLabel="Rechazar documento"
      triggerVariant="ghost"
      triggerSize="sm"
      title={`Rechazar: ${document.label}`}
      description="Solo se rechaza este documento: la postulación queda Pendiente hasta que el aspirante lo suba de nuevo. Recibe el motivo por correo y en la app."
      action={rejectDocument}
      fields={{ application_id: applicationId, document_id: document.id }}
      submitLabel="Rechazar documento"
      submitVariant="danger"
      pendingLabel="Rechazando…"
    >
      <Field label="Motivo" htmlFor={`doc-reason-${document.id}`} hint="Obligatorio. El aspirante lo verá tal cual.">
        <Textarea
          id={`doc-reason-${document.id}`}
          name="reason"
          required
          minLength={5}
          placeholder="Ej.: la imagen está borrosa y no se leen los datos."
        />
      </Field>
    </ActionDialog>
  );
}
