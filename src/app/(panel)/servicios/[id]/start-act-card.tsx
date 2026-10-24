import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { PdfDownloadButton, SignatureSvg } from "@/components/pdf-download-button";
import { Badge } from "@/components/ui/badge";
import { Card, CardBody, CardHeader, DescriptionList } from "@/components/ui/card";
import type { Database } from "@/lib/database.types";
import { formatDate, formatDateTime } from "@/lib/format";
import type { Tone } from "@/lib/labels";

type Act = Database["public"]["Tables"]["start_acts"]["Row"];
type ActSignature = Database["public"]["Tables"]["start_act_signatures"]["Row"];
export type StartActWithSignatures = Act & { signatures: ActSignature[] };

export const START_ACT_STATUS: Record<string, { label: string; tone: Tone }> = {
  pending_signatures: { label: "Pendiente de firmas", tone: "amber" },
  signed: { label: "Firmada", tone: "green" },
  void: { label: "Anulada", tone: "slate" },
};

/**
 * Acta de inicio de obra: la firman a mano alzada el cliente y el experto, cada uno en su app, el día de inicio y
 * antes de la primera jornada. Sin ella firmada por los dos, el experto no puede registrar jornadas.
 */
export function StartActCard({ act, startDate }: { act: StartActWithSignatures; startDate: string | null }) {
  const current = act.signatures.filter((s) => s.body_hash === act.body_hash);
  const rows = (["client", "expert"] as const).map((role) => ({ role, sig: current.find((s) => s.signer_role === role) }));
  const status = START_ACT_STATUS[act.status] ?? START_ACT_STATUS.pending_signatures;

  return (
    <Card>
      <CardHeader
        title="Acta de inicio"
        description={`Versión ${act.version} · se firma el día de inicio${startDate ? ` (${formatDate(startDate)})` : ""}, antes de la primera jornada`}
        action={
          <>
            <Badge tone={status.tone}>{status.label}</Badge>
            {act.status !== "void" && <PdfDownloadButton body={{ start_act_id: act.id }} label="Descargar PDF" />}
          </>
        }
      />
      <CardBody className="space-y-4">
        <DescriptionList
          items={[
            { label: "Hash SHA-256", value: <span className="break-all font-mono text-xs">{act.body_hash}</span> },
            { label: "Firmada", value: act.signed_at ? formatDateTime(act.signed_at) : "—" },
          ]}
        />
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Firmas</p>
          <ul className="mt-1 divide-y divide-border text-sm">
            {rows.map(({ role, sig }) => (
              <li key={role} className="flex flex-wrap items-center justify-between gap-2 py-2">
                <span>
                  <span className="font-medium">{role === "client" ? "Cliente" : "Experto"}</span>
                  {sig?.signer_name ? ` · ${sig.signer_name}` : ""}
                  {sig?.document_number ? ` · ${sig.document_type} ${sig.document_number}` : ""}
                </span>
                <span className="text-xs text-slate-500">
                  {sig ? `${formatDateTime(sig.signed_at)} · a mano alzada en la app · IP ${sig.ip ?? "—"}` : "Pendiente"}
                </span>
                {sig && (
                  <span className="basis-full">
                    <SignatureSvg path={sig.signature_svg} width={sig.signature_width} height={sig.signature_height} />
                  </span>
                )}
              </li>
            ))}
          </ul>
        </div>
        <details className="group rounded-xl border border-border">
          <summary className="cursor-pointer select-none px-4 py-2.5 text-sm font-medium text-primary">Ver texto del acta</summary>
          <div className="markdown border-t border-border px-4 py-3 text-sm">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{act.body_md}</ReactMarkdown>
          </div>
        </details>
      </CardBody>
    </Card>
  );
}
