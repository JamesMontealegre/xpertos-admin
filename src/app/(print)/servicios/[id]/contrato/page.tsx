import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { requireAdmin } from "@/lib/auth";
import { formatDateTime, shortId } from "@/lib/format";
import { CONTRACT_STATUS, ROLE_LABEL } from "@/lib/labels";
import { STARTED_STATUSES } from "@/lib/service-phase";
import { PrintButton } from "./print-button";
import { Logo } from "@/components/logo";

export async function generateMetadata(props: PageProps<"/servicios/[id]/contrato">): Promise<Metadata> {
  const { id } = await props.params;
  return { title: `Contrato ${shortId(id)}` };
}

/**
 * Contrato imprimible (sin la barra lateral del panel). "Descargar PDF" abre la impresión del
 * navegador; los estilos de impresión dejan solo el documento en tamaño carta/A4.
 */
export default async function ContractPrintPage(props: PageProps<"/servicios/[id]/contrato">) {
  const { id } = await props.params;
  const { supabase } = await requireAdmin();

  const [{ data: service }, { data: contract }] = await Promise.all([
    supabase.from("services").select("id, title, status").eq("id", id).maybeSingle(),
    supabase
      .from("contracts")
      .select(
        "*, signatures:contract_signatures(id, signer_role, signed_at, ip, body_hash, signer:profiles!contract_signatures_signer_id_fkey(full_name))",
      )
      .eq("service_id", id)
      .maybeSingle(),
  ]);
  if (!service) notFound();

  const startContract = STARTED_STATUSES.includes(service.status) && contract?.status !== "void";
  const signatures = (contract?.signatures ?? []).filter((s) => s.body_hash === contract?.body_hash);

  return (
    <div className="min-h-screen bg-slate-100 print:bg-white">
      <div className="sticky top-0 z-10 border-b border-border bg-white/95 backdrop-blur print:hidden">
        <div className="mx-auto flex max-w-[52rem] flex-wrap items-center justify-between gap-3 px-4 py-3">
          <Link href={`/servicios/${id}`} className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-primary">
            <span aria-hidden>←</span> Volver al servicio
          </Link>
          <div className="flex items-center gap-3">
            {contract && (
              <span className="text-xs text-slate-500">
                Versión {contract.version} · {CONTRACT_STATUS[contract.status].label}
              </span>
            )}
            <PrintButton disabled={!contract || !startContract} />
          </div>
        </div>
      </div>

      {contract && !startContract && (
        <div className="mx-auto mt-4 max-w-[52rem] px-4 print:hidden">
          <p className="rounded-xl border border-amber-200 bg-amber-50 px-3.5 py-2.5 text-sm text-amber-900">
            {contract.status === "void"
              ? "Este contrato fue anulado."
              : "Este es el contrato de prestación de servicios. El contrato de inicio (con el acta de inicio y las fechas) se habilita para descarga al confirmar el pago del cliente."}
          </p>
        </div>
      )}

      <main className="contract-sheet mx-auto my-6 max-w-[52rem] bg-white px-6 py-8 shadow-sm ring-1 ring-border sm:px-14 sm:py-12 print:m-0 print:max-w-none print:p-0 print:shadow-none print:ring-0">
        <header className="mb-8 flex items-start justify-between gap-4 border-b-2 border-primary pb-4">
          <Logo variant="wordmark" height={40} priority className="h-10 w-auto print:[print-color-adjust:exact]" />
          <div className="text-right text-xs text-slate-500">
            <p>
              Servicio <span className="font-mono">{shortId(service.id)}</span>
            </p>
            {contract && (
              <>
                <p>Versión {contract.version}</p>
                <p>Actualizado {formatDateTime(contract.updated_at)}</p>
              </>
            )}
          </div>
        </header>

        {!contract ? (
          <p className="text-sm text-slate-500">
            Este servicio aún no tiene contrato. Se genera automáticamente al aprobar la cotización.
          </p>
        ) : (
          <>
            <article className="markdown contract-body text-sm">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>{contract.body_md}</ReactMarkdown>
            </article>

            <section className="mt-10 break-inside-avoid border-t border-border pt-6">
              <h2 className="text-sm font-semibold">Aceptación electrónica</h2>
              <div className="mt-4 grid gap-6 sm:grid-cols-2 print:grid-cols-2">
                {/* Contrato entre Xpertos y el cliente: Xpertos lo emite y acepta; el cliente lo acepta en la app. */}
                <div className="border-t border-slate-400 pt-2 text-xs">
                  <p className="font-medium text-foreground">Xpertos</p>
                  <p className="text-slate-600">Emitido y aceptado al generarlo en la plataforma · versión {contract.version}</p>
                </div>
                {(() => {
                  const sig = signatures.find((s) => s.signer_role === "client");
                  return (
                    <div className="border-t border-slate-400 pt-2 text-xs">
                      <p className="font-medium text-foreground">{ROLE_LABEL.client}</p>
                      {sig ? (
                        <p className="text-slate-600">
                          {sig.signer?.full_name ?? ""} · aceptado el {formatDateTime(sig.signed_at)} · IP {sig.ip ?? "—"}
                        </p>
                      ) : (
                        <p className="text-slate-500">Pendiente de aceptación en la app</p>
                      )}
                    </div>
                  );
                })()}
              </div>
              <p className="mt-6 break-all text-[10px] text-slate-400">Hash SHA-256 del documento: {contract.body_hash}</p>
            </section>
          </>
        )}
      </main>
    </div>
  );
}
