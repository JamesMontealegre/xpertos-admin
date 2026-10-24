import { ActionButton } from "@/components/ui/action-form";
import { Alert } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { ActionDialog } from "@/components/ui/dialog";
import { FilePreview } from "@/components/ui/file-preview";
import { Field, Textarea } from "@/components/ui/input";
import { EmptyRow, Table, TBody, Td, THead, Tr } from "@/components/ui/table";
import type { Database } from "@/lib/database.types";
import { formatCOP, formatDate, formatDateTime, todayCO } from "@/lib/format";
import { PAYMENT_METHOD, PAYMENT_STATUS, STAGE_STATUS, type ServiceStatus } from "@/lib/labels";
import { reviewPayment } from "../actions";

type StageRow = Database["public"]["Tables"]["service_stages"]["Row"];
type PaymentRow = Database["public"]["Tables"]["payments"]["Row"] & { url: string | null };

/**
 * Plan de pagos del cliente ("Pago del servicio"): pago único o anticipo y cuotas, con sus comprobantes. Los pagos en
 * línea (Wompi) llegan verificados; las transferencias se verifican o rechazan aquí. Lo pagado se aplica en orden.
 */
export function PaymentsCard({
  serviceId,
  status,
  stages,
  payments,
  planLabel,
}: {
  serviceId: string;
  status: ServiceStatus;
  stages: StageRow[];
  payments: PaymentRow[];
  planLabel: string | null;
}) {
  const total = stages.reduce((sum, s) => sum + Number(s.amount), 0);
  const verified = payments.filter((p) => p.status === "verified").reduce((sum, p) => sum + Number(p.amount), 0);
  const awaitingProof = status === "pending_payment" && payments.every((p) => p.status !== "submitted");
  const today = todayCO();

  return (
    <Card>
      <CardHeader
        title="Pago del servicio"
        description={`${planLabel ?? "Sin plan"} · pagado ${formatCOP(verified)} de ${formatCOP(total)}`}
      />
      {(status === "pending_payment" || payments.some((p) => p.status === "submitted")) && (
        <CardBody className="space-y-2 border-b border-border">
          <Alert tone="info">
            Los pagos en línea (Wompi) se registran solos. Antes de verificar una transferencia, revisa en el banco que haya
            llegado a una cuenta de recaudo de Xpertos por ese valor. Al cubrir {stages.some((s) => s.kind === "installment") ? "el anticipo" : "el total"}, el
            servicio pasa solo a Programado y se fija la fecha de inicio.
          </Alert>
          {awaitingProof && <p className="text-sm text-slate-500">El cliente aún no ha subido un comprobante por verificar.</p>}
        </CardBody>
      )}
      <Table>
        <THead columns={["#", "Pago", "Fecha", "Monto", "Estado"]} />
        <TBody>
          {stages.map((stage) => {
            const stagePayments = payments.filter((p) => p.stage_id === stage.id);
            const overdue = stage.status !== "paid" && stage.status !== "pending" && stage.due_date != null && stage.due_date < today;
            return (
              <Tr key={stage.id} className="hover:bg-transparent">
                <Td className="align-top text-slate-500">{stage.position}</Td>
                <Td className="w-full align-top">
                  <p className="font-medium">{stage.name}</p>
                  {stage.description && <p className="text-xs text-slate-500">{stage.description}</p>}
                  {stagePayments.length > 0 && (
                    <ul className="mt-3 space-y-3">
                      {stagePayments.map((payment) => (
                        <li key={payment.id} className="rounded-xl border border-border bg-slate-50 p-3">
                          <div className="flex flex-wrap items-center justify-between gap-2">
                            <div className="text-sm">
                              <span className="font-medium">{formatCOP(payment.amount)}</span> · {PAYMENT_METHOD[payment.method]}
                              {payment.provider_ref && (
                                <span className="text-slate-500">
                                  {" "}
                                  · {payment.method === "wompi" ? "transacción" : "ref."} {payment.provider_ref}
                                </span>
                              )}
                              <span className="block text-xs text-slate-500">
                                Enviado el {formatDateTime(payment.created_at)}
                                {payment.verified_at && ` · revisado el ${formatDateTime(payment.verified_at)}`}
                              </span>
                            </div>
                            <Badge tone={PAYMENT_STATUS[payment.status].tone}>{PAYMENT_STATUS[payment.status].label}</Badge>
                          </div>
                          {payment.notes && <p className="mt-2 text-xs text-slate-600">Nota: {payment.notes}</p>}
                          <div className="mt-3">
                            {payment.proof_path ? (
                              <FilePreview url={payment.url} path={payment.proof_path} />
                            ) : (
                              <p className="text-xs text-slate-500">
                                {payment.method === "wompi" ? "Aprobado por Wompi; no requiere comprobante." : "Sin comprobante adjunto."}
                              </p>
                            )}
                          </div>
                          {payment.status === "submitted" && (
                            <div className="mt-3 flex flex-wrap gap-2">
                              <ActionButton
                                action={reviewPayment}
                                fields={{ service_id: serviceId, payment_id: payment.id, decision: "verified" }}
                                variant="primary"
                                pendingLabel="Verificando…"
                                confirm={{
                                  title: "Verificar el pago",
                                  description: `Confirmas que el pago de ${formatCOP(payment.amount)} aparece en el banco. Se aplica en orden al plan de pagos; si completa el anticipo, el servicio pasa a Programado y se fija la fecha de inicio.`,
                                  confirmLabel: "Verificar pago",
                                }}
                              >
                                Verificar
                              </ActionButton>
                              <ActionDialog
                                triggerLabel="Rechazar"
                                triggerVariant="danger"
                                title="Rechazar comprobante"
                                description="El cliente verá la nota y podrá enviar un nuevo comprobante."
                                action={reviewPayment}
                                fields={{ service_id: serviceId, payment_id: payment.id, decision: "rejected" }}
                                submitLabel="Rechazar pago"
                                submitVariant="danger"
                              >
                                <Field label="Motivo del rechazo" htmlFor={`notes-${payment.id}`}>
                                  <Textarea
                                    id={`notes-${payment.id}`}
                                    name="notes"
                                    required
                                    placeholder="Ej.: la transacción no aparece en la cuenta o el monto no coincide."
                                  />
                                </Field>
                              </ActionDialog>
                            </div>
                          )}
                        </li>
                      ))}
                    </ul>
                  )}
                </Td>
                <Td className="align-top whitespace-nowrap text-sm">
                  {stage.status === "pending" && stage.opens_on ? (
                    <span className="text-slate-500">Se habilita el {formatDate(stage.opens_on)}</span>
                  ) : stage.due_date ? (
                    <span className={overdue ? "font-medium text-red-700" : undefined}>Vence el {formatDate(stage.due_date)}</span>
                  ) : (
                    <span className="text-slate-500">{stage.kind === "installment" ? "Durante la obra" : "—"}</span>
                  )}
                </Td>
                <Td className="align-top whitespace-nowrap">{formatCOP(stage.amount)}</Td>
                <Td className="align-top">
                  {overdue ? (
                    <Badge tone="red">Vencido</Badge>
                  ) : (
                    <Badge tone={STAGE_STATUS[stage.status].tone}>{STAGE_STATUS[stage.status].label}</Badge>
                  )}
                </Td>
              </Tr>
            );
          })}
          {stages.length === 0 && <EmptyRow colSpan={5}>Sin pagos en el plan.</EmptyRow>}
        </TBody>
      </Table>
    </Card>
  );
}
