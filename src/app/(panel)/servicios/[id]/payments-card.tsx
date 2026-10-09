import { ActionButton } from "@/components/ui/action-form";
import { Alert } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { ActionDialog } from "@/components/ui/dialog";
import { FilePreview } from "@/components/ui/file-preview";
import { Field, Textarea } from "@/components/ui/input";
import { EmptyRow, Table, TBody, Td, THead, Tr } from "@/components/ui/table";
import type { Database } from "@/lib/database.types";
import { formatCOP, formatDateTime } from "@/lib/format";
import { PAYMENT_METHOD, PAYMENT_STATUS, STAGE_STATUS, type ServiceStatus } from "@/lib/labels";
import { reviewPayment } from "../actions";

type StageRow = Database["public"]["Tables"]["service_stages"]["Row"];
type PaymentRow = Database["public"]["Tables"]["payments"]["Row"] & { url: string | null };

/** Cobro al cliente ("Pago del servicio") con sus comprobantes: verificar o rechazar. */
export function PaymentsCard({
  serviceId,
  status,
  stages,
  payments,
}: {
  serviceId: string;
  status: ServiceStatus;
  stages: StageRow[];
  payments: PaymentRow[];
}) {
  const paid = stages.filter((s) => s.status === "paid").length;
  const awaitingProof = status === "pending_payment" && payments.every((p) => p.status !== "submitted");

  return (
    <Card>
      <CardHeader
        title="Pago del servicio"
        description={
          stages.length === 1
            ? `Un solo cobro por el total aprobado · ${paid ? "pagado" : "sin pagar"}`
            : `${paid} de ${stages.length} cobros pagados`
        }
      />
      {status === "pending_payment" && (
        <CardBody className="space-y-2 border-b border-border">
          <Alert tone="info">
            Antes de verificar, revisa en el banco que la transacción haya llegado a una de las cuentas de recaudo de
            Xpertos por el valor del cobro. Al verificar, el servicio pasa solo a Programado y se fija la fecha de inicio.
          </Alert>
          {awaitingProof && <p className="text-sm text-slate-500">El cliente aún no ha subido un comprobante por verificar.</p>}
        </CardBody>
      )}
      <Table>
        <THead columns={["#", "Cobro", "Monto", "Estado"]} />
        <TBody>
          {stages.map((stage) => {
            const stagePayments = payments.filter((p) => p.stage_id === stage.id);
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
                              {payment.provider_ref && <span className="text-slate-500"> · ref. {payment.provider_ref}</span>}
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
                              <p className="text-xs text-slate-500">Sin comprobante adjunto.</p>
                            )}
                          </div>
                          {payment.status === "submitted" && (
                            <div className="mt-3 flex flex-wrap gap-2">
                              <ActionButton
                                action={reviewPayment}
                                fields={{ service_id: serviceId, payment_id: payment.id, decision: "verified" }}
                                variant="primary"
                                pendingLabel="Verificando…"
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
                <Td className="align-top whitespace-nowrap">{formatCOP(stage.amount)}</Td>
                <Td className="align-top">
                  <Badge tone={STAGE_STATUS[stage.status].tone}>{STAGE_STATUS[stage.status].label}</Badge>
                </Td>
              </Tr>
            );
          })}
          {stages.length === 0 && <EmptyRow colSpan={4}>Sin cobros.</EmptyRow>}
        </TBody>
      </Table>
    </Card>
  );
}
