import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Alert } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { PdfDownloadButton, SignatureSvg } from "@/components/pdf-download-button";
import { Card, CardBody, CardHeader, DescriptionList } from "@/components/ui/card";
import { ActionDialog } from "@/components/ui/dialog";
import { Field, Textarea } from "@/components/ui/input";
import type { Database } from "@/lib/database.types";
import { formatDateTime } from "@/lib/format";
import { CONTRACT_STATUS, ROLE_LABEL, type UserRole } from "@/lib/labels";
import { regenerateContract } from "../actions";

export type ContractWithSignatures = Database["public"]["Tables"]["contracts"]["Row"] & {
  signatures: Array<{
    id: string;
    signer_role: UserRole;
    signed_at: string;
    ip: string | null;
    body_hash: string;
    method: string;
    signature_svg: string | null;
    signature_width: number | null;
    signature_height: number | null;
    document_type: string | null;
    document_number: string | null;
    signer: { full_name: string } | null;
  }>;
};

/**
 * Contrato del servicio entre Xpertos y el cliente (el experto no es parte ni lo firma). Se genera al pasar a
 * Pendiente de pago; el cliente lo firma a mano alzada. El PDF lleva la firma de Xpertos y la del cliente.
 */
export function ContractCard({ serviceId, contract }: { serviceId: string; contract: ContractWithSignatures | null }) {
  // Contratos anteriores al acta de inicio separada: al programar se regeneraban como "contrato y acta de inicio".
  const startContract = Boolean(contract?.body_md.includes("acta de inicio"));

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
            {contract && contract.status !== "void" && (
              <PdfDownloadButton body={{ contract_id: contract.id }} label="Descargar PDF" />
            )}
          </>
        }
      />
      {contract && (
        <CardBody className="space-y-4">
          <DescriptionList
            items={[
              { label: "Hash SHA-256", value: <span className="break-all font-mono text-xs">{contract.body_hash}</span> },
              { label: "Generado", value: formatDateTime(contract.created_at) },
            ]}
          />
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Firmas</p>
            <p className="mt-1 text-sm text-slate-500">
              Contrato entre Xpertos y el cliente: Xpertos lo emite y firma al generarlo; queda firmado cuando el cliente lo firma a mano alzada en la app o desde el enlace que le llega al correo (con código de verificación).
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
                      {sig.document_number ? ` · ${sig.document_type} ${sig.document_number}` : ""}
                    </span>
                    <span className="text-xs text-slate-500">
                      {formatDateTime(sig.signed_at)} · {sig.signature_svg ? "a mano alzada " : ""}
                      {sig.method === "email" ? "desde el correo con código" : "en la app"} · IP {sig.ip ?? "—"}
                      {sig.body_hash !== contract.body_hash && " · versión anterior"}
                    </span>
                    {sig.signature_svg && sig.signature_width && sig.signature_height && (
                      <span className="basis-full">
                        <SignatureSvg path={sig.signature_svg} width={sig.signature_width} height={sig.signature_height} />
                      </span>
                    )}
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
