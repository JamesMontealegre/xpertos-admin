import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Alert } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button, LinkButton } from "@/components/ui/button";
import { Card, CardBody, CardHeader, DescriptionList } from "@/components/ui/card";
import { ActionDialog } from "@/components/ui/dialog";
import { Field, Textarea } from "@/components/ui/input";
import type { Database } from "@/lib/database.types";
import { formatDateTime } from "@/lib/format";
import { CONTRACT_STATUS, ROLE_LABEL, type ServiceStatus, type UserRole } from "@/lib/labels";
import { STARTED_STATUSES } from "@/lib/service-phase";
import { regenerateContract } from "../actions";

export type ContractWithSignatures = Database["public"]["Tables"]["contracts"]["Row"] & {
  signatures: Array<{
    id: string;
    signer_role: UserRole;
    signed_at: string;
    ip: string | null;
    body_hash: string;
    method: string;
    signer: { full_name: string } | null;
  }>;
};

/**
 * Contrato del servicio entre Xpertos y el cliente (el experto no es parte ni lo firma). Se genera al pasar a
 * Pendiente de pago y se regenera al confirmar el pago (pasa a ser el contrato de inicio, descargable).
 */
export function ContractCard({
  serviceId,
  status,
  contract,
}: {
  serviceId: string;
  status: ServiceStatus;
  contract: ContractWithSignatures | null;
}) {
  const startContract = STARTED_STATUSES.includes(status) || (status === "cancelled" && Boolean(contract?.body_md.includes("acta de inicio")));
  const downloadable = Boolean(contract) && startContract && contract?.status !== "void";

  return (
    <Card>
      <CardHeader
        title={startContract ? "Contrato y acta de inicio" : "Contrato"}
        description={
          contract
            ? `Versión ${contract.version} · actualizado el ${formatDateTime(contract.updated_at)}`
            : "Se genera automáticamente al aprobar la cotización."
        }
        action={
          <>
            {contract && <Badge tone={CONTRACT_STATUS[contract.status].tone}>{CONTRACT_STATUS[contract.status].label}</Badge>}
            {contract &&
              (downloadable ? (
                <LinkButton href={`/servicios/${serviceId}/contrato`} variant="primary" size="sm">
                  Descargar contrato
                </LinkButton>
              ) : (
                <Button size="sm" variant="secondary" disabled title="El contrato de inicio se habilita al confirmar el pago">
                  Descargar contrato
                </Button>
              ))}
          </>
        }
      />
      {contract && (
        <CardBody className="space-y-4">
          {!startContract && status !== "cancelled" && (
            <Alert tone="info">
              Este es el contrato de prestación de servicios. El contrato de inicio (con el acta de inicio y las fechas) se
              habilita para descarga al confirmar el pago del cliente.
            </Alert>
          )}
          <DescriptionList
            items={[
              { label: "Hash SHA-256", value: <span className="break-all font-mono text-xs">{contract.body_hash}</span> },
              { label: "Generado", value: formatDateTime(contract.created_at) },
            ]}
          />
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Firmas</p>
            <p className="mt-1 text-sm text-slate-500">
              Contrato entre Xpertos y el cliente: Xpertos lo emite y acepta al generarlo; queda firmado cuando el cliente lo acepta en la app o desde el enlace que le llega al correo (con código de verificación).
            </p>
            {contract.signatures.length === 0 ? (
              <p className="mt-1 text-sm text-slate-500">El cliente aún no ha firmado esta versión.</p>
            ) : (
              <ul className="mt-1 divide-y divide-border text-sm">
                {contract.signatures.map((sig) => (
                  <li key={sig.id} className="flex flex-wrap items-center justify-between gap-2 py-2">
                    <span>
                      <span className="font-medium">{ROLE_LABEL[sig.signer_role]}</span>
                      {sig.signer?.full_name ? ` · ${sig.signer.full_name}` : ""}
                    </span>
                    <span className="text-xs text-slate-500">
                      {formatDateTime(sig.signed_at)} · {sig.method === "email" ? "por correo con código" : "en la app"} · IP {sig.ip ?? "—"}
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
          <div className="flex flex-wrap items-center justify-end gap-2 border-t border-border pt-4 text-xs text-slate-500">
            <span>¿Cambió algún dato del servicio?</span>
            <ActionDialog
              triggerLabel="Regenerar contrato"
              triggerVariant="ghost"
              title="Regenerar contrato"
              description="Se creará una nueva versión con los datos actuales del servicio, la cotización y las cuentas de recaudo."
              action={regenerateContract}
              fields={{ service_id: serviceId }}
              submitLabel="Regenerar"
              pendingLabel="Generando…"
            >
              <Alert tone="warning">
                Al regenerar se invalida la firma actual: el cliente deberá aceptar de nuevo el contrato.
              </Alert>
              <Field label="Términos adicionales (opcional)" htmlFor="extra_terms">
                <Textarea id="extra_terms" name="extra_terms" placeholder="Condiciones particulares acordadas con el cliente." />
              </Field>
            </ActionDialog>
          </div>
        </CardBody>
      )}
    </Card>
  );
}
