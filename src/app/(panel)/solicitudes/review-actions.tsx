import { ActionDialog } from "@/components/ui/dialog";
import { Alert } from "@/components/ui/alert";
import { Field, Textarea } from "@/components/ui/input";
import { DOCUMENT_KIND, type ApplicationStatus, type DocumentKind } from "@/lib/labels";
import { reopenApplication, reviewApplication } from "./actions";

/**
 * Botones "Aprobar" y "Rechazar" de una postulación. Cada uno abre un diálogo que exige una
 * justificación; queda guardada como nota del operador y el aspirante la ve en la app.
 * Una postulación rechazada solo ofrece "Abrir postulación", que la devuelve a "En revisión".
 */
export function ReviewActions({
  application,
  missingDocuments,
  size = "sm",
  layout = "row",
}: {
  application: { id: string; full_name: string; status: ApplicationStatus; user_id: string | null };
  missingDocuments: DocumentKind[];
  size?: "sm" | "md";
  layout?: "row" | "stack";
}) {
  if (application.status === "approved") return null;

  const canApprove = Boolean(application.user_id);
  const fields = { application_id: application.id };
  const wrapper = layout === "row" ? "flex flex-wrap items-center gap-2" : "grid gap-2 [&>button]:w-full";

  if (application.status === "rejected") {
    return (
      <div className={wrapper}>
        <ActionDialog
          triggerLabel="Abrir postulación"
          triggerVariant="secondary"
          triggerSize={size}
          title={`Abrir de nuevo la postulación de ${application.full_name}`}
          description="Volverá al estado «En revisión» para que puedas evaluarla otra vez."
          action={reopenApplication}
          fields={fields}
          submitLabel="Abrir postulación"
          pendingLabel="Abriendo…"
        >
          <Field
            label="Motivo (opcional)"
            htmlFor={`reopen-notes-${application.id}`}
            hint="Reemplaza la justificación del rechazo. El aspirante lo verá en la app."
          >
            <Textarea
              id={`reopen-notes-${application.id}`}
              name="notes"
              placeholder="Ej.: el aspirante envió los documentos que faltaban."
            />
          </Field>
        </ActionDialog>
      </div>
    );
  }

  return (
    <div className={wrapper}>
      <ActionDialog
        triggerLabel="Aprobar"
        triggerVariant="primary"
        triggerSize={size}
        title={`Aprobar a ${application.full_name}`}
        description="La cuenta pasará a ser experto y podrá recibir servicios asignados."
        action={reviewApplication}
        fields={{ ...fields, status: "approved" }}
        submitLabel="Aprobar postulación"
        pendingLabel="Aprobando…"
        disabled={!canApprove}
        disabledReason="El aspirante aún no se registra en la app"
      >
        {missingDocuments.length > 0 && (
          <Alert tone="warning">
            Faltan documentos obligatorios: {missingDocuments.map((kind) => DOCUMENT_KIND[kind]).join(", ")}. Puedes
            aprobar igualmente, pero deja constancia en la justificación.
          </Alert>
        )}
        <Field label="Justificación" htmlFor={`approve-notes-${application.id}`} hint="Obligatoria. El aspirante la verá en la app.">
          <Textarea
            id={`approve-notes-${application.id}`}
            name="notes"
            required
            minLength={10}
            placeholder="Ej.: documentos verificados, experiencia comprobada en obra civil."
          />
        </Field>
      </ActionDialog>

      <ActionDialog
        triggerLabel="Rechazar"
        triggerVariant="danger"
        triggerSize={size}
        title={`Rechazar a ${application.full_name}`}
        description="La postulación quedará rechazada y el aspirante no podrá recibir servicios."
        action={reviewApplication}
        fields={{ ...fields, status: "rejected" }}
        submitLabel="Rechazar postulación"
        submitVariant="danger"
        pendingLabel="Rechazando…"
      >
        <Field label="Justificación" htmlFor={`reject-notes-${application.id}`} hint="Obligatoria. El aspirante la verá en la app.">
          <Textarea
            id={`reject-notes-${application.id}`}
            name="notes"
            required
            minLength={10}
            placeholder="Ej.: el certificado de antecedentes no es legible y no se pudo verificar la experiencia."
          />
        </Field>
      </ActionDialog>
    </div>
  );
}
