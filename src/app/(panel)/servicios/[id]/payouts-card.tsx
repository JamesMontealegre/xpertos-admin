import { ActionForm, SubmitButton } from "@/components/ui/action-form";
import { Card, CardBody, CardHeader, DescriptionList } from "@/components/ui/card";
import { Field, Input, Select } from "@/components/ui/input";
import type { Database } from "@/lib/database.types";
import { formatCOP, formatDateTime } from "@/lib/format";
import { PAYOUT_FREQUENCY, PAYOUT_METHOD, PAYOUT_METHOD_ORDER, payoutMethodLabel, type PayoutFrequency, type PayoutMethod } from "@/lib/labels";
import { registerPayout } from "../actions";

type PayoutRow = Database["public"]["Tables"]["expert_payouts"]["Row"];

/** Pagos de Xpertos al experto: medio de pago, neto estimado, pagos registrados y saldo. */
export function PayoutsCard({
  serviceId,
  expertId,
  payoutMethod,
  payoutAccount,
  payoutFrequency,
  netEstimate,
  payouts,
}: {
  serviceId: string;
  expertId: string;
  payoutMethod: PayoutMethod | null;
  payoutAccount: string | null;
  payoutFrequency: PayoutFrequency;
  netEstimate: number | null;
  payouts: PayoutRow[];
}) {
  const paid = payouts.reduce((acc, p) => acc + Number(p.amount), 0);
  const balance = netEstimate != null ? Math.max(netEstimate - paid, 0) : null;

  return (
    <Card>
      <CardHeader title="Pago al experto" description={`Periodicidad: ${PAYOUT_FREQUENCY[payoutFrequency]}`} />
      <CardBody className="space-y-5">
        <DescriptionList
          columns={3}
          items={[
            {
              label: "Medio de pago",
              value: (
                <>
                  {payoutMethodLabel(payoutMethod)}
                  {payoutAccount && <span className="block text-xs text-slate-500">{payoutAccount}</span>}
                </>
              ),
            },
            { label: "Neto estimado", value: formatCOP(netEstimate) },
            {
              label: "Saldo por pagar",
              value: (
                <span className={balance ? "font-semibold text-accent" : "font-semibold text-emerald-700"}>
                  {formatCOP(balance)}
                  <span className="block text-xs font-normal text-slate-500">Pagado: {formatCOP(paid)}</span>
                </span>
              ),
            },
          ]}
        />

        <div>
          <p className="mb-2 text-xs font-medium uppercase tracking-wide text-slate-500">Pagos registrados</p>
          {payouts.length === 0 ? (
            <p className="text-sm text-slate-500">Aún no se ha registrado ningún pago al experto.</p>
          ) : (
            <ul className="divide-y divide-border rounded-xl border border-border text-sm">
              {payouts.map((p) => (
                <li key={p.id} className="flex flex-wrap items-baseline justify-between gap-2 px-4 py-2.5">
                  <span>
                    <span className="font-medium">{formatCOP(p.amount)}</span>
                    <span className="text-slate-500">
                      {" "}
                      · {PAYOUT_METHOD[p.method]}
                      {p.account ? ` · ${p.account}` : ""}
                    </span>
                    {(p.reference || p.period_label) && (
                      <span className="block text-xs text-slate-500">
                        {p.reference ? `Ref. ${p.reference}` : ""}
                        {p.reference && p.period_label ? " · " : ""}
                        {p.period_label ? `Periodo: ${p.period_label}` : ""}
                      </span>
                    )}
                  </span>
                  <span className="text-xs text-slate-500">{formatDateTime(p.paid_at)}</span>
                </li>
              ))}
            </ul>
          )}
        </div>

        <ActionForm action={registerPayout} className="space-y-4 rounded-xl border border-border p-4">
          <p className="text-sm font-medium">Registrar pago al experto</p>
          <input type="hidden" name="service_id" value={serviceId} />
          <input type="hidden" name="expert_id" value={expertId} />
          <div className="grid gap-4 sm:grid-cols-3">
            <Field label="Monto (COP)" htmlFor="payout-amount">
              <Input
                id="payout-amount"
                name="amount"
                type="number"
                min={1}
                step={1}
                inputMode="numeric"
                required
                defaultValue={balance ? String(balance) : ""}
              />
            </Field>
            <Field label="Medio de pago" htmlFor="payout-method">
              <Select id="payout-method" name="method" defaultValue={payoutMethod ?? ""} required>
                <option value="" disabled>
                  Selecciona…
                </option>
                {PAYOUT_METHOD_ORDER.map((m) => (
                  <option key={m} value={m}>
                    {PAYOUT_METHOD[m]}
                  </option>
                ))}
              </Select>
            </Field>
            <Field label="Cuenta o número" htmlFor="payout-account">
              <Input id="payout-account" name="account" defaultValue={payoutAccount ?? ""} />
            </Field>
            <Field label="Referencia" htmlFor="payout-reference" hint="Número de la transacción.">
              <Input id="payout-reference" name="reference" placeholder="Ej.: NEQ-12345" />
            </Field>
            <Field label="Periodo" htmlFor="payout-period" className="sm:col-span-2">
              <Input
                id="payout-period"
                name="period_label"
                defaultValue={payoutFrequency === "on_completion" ? "Obra terminada" : ""}
                placeholder="Ej.: Semana del 13 al 17 de octubre"
              />
            </Field>
          </div>
          <div className="flex justify-end">
            <SubmitButton pendingLabel="Registrando…">Registrar pago</SubmitButton>
          </div>
        </ActionForm>
      </CardBody>
    </Card>
  );
}
