import { ActionDialog } from "@/components/ui/dialog";
import { Alert } from "@/components/ui/alert";
import { Field, Textarea } from "@/components/ui/input";
import { DOCUMENT_KIND, type ApplicationStatus, type DocumentKind } from "@/lib/labels";
import { reviewApplication } from "./actions";

/**
 * Botones "Aprobar" y "Rechazar" de una postulación. Cada uno abre un diálogo que exige una
 * justificación; queda guardada como nota del operador y el aspirante la ve en la app.
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

      {application.status !== "rejected" && (
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
      )}
    </div>
  );
}
