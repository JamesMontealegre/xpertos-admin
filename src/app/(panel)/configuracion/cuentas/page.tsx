import type { Metadata } from "next";
import { requireSuperAdmin } from "@/lib/auth";
import { ActionButton, ActionForm, SubmitButton } from "@/components/ui/action-form";
import { Badge } from "@/components/ui/badge";
import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { Field, Input, Select } from "@/components/ui/input";
import { PageHeader } from "@/components/ui/page-header";
import { EmptyRow, Table, TBody, Td, THead, Tr } from "@/components/ui/table";
import { createPaymentAccount, setPaymentAccountActive } from "./actions";

export const metadata: Metadata = { title: "Cuentas de recaudo" };

const COLUMNS = ["Orden", "Banco", "Tipo", "Número", "Titular", "Estado", "Acción"];
const ACCOUNT_TYPES = ["Ahorros", "Corriente", "Billetera"];

export default async function PaymentAccountsPage() {
  const { supabase } = await requireSuperAdmin();
  const { data: accounts, error } = await supabase
    .from("payment_accounts")
    .select("*")
    .order("active", { ascending: false })
    .order("sort_order")
    .order("bank");

  const activeCount = (accounts ?? []).filter((a) => a.active).length;
  const nextOrder = Math.max(0, ...(accounts ?? []).map((a) => a.sort_order)) + 1;

  return (
    <>
      <PageHeader
        title="Cuentas de recaudo"
        description="Cuentas de Xpertos donde el cliente paga. Las activas salen en el contrato y en la app del cliente, en este orden."
      />

      <div className="space-y-6">
        <Card>
          <CardHeader title="Cuentas" description={`${activeCount} activas · ${(accounts ?? []).length} en total`} />
          <Table>
            <THead columns={COLUMNS} />
            <TBody>
              {error && <EmptyRow colSpan={COLUMNS.length}>No fue posible cargar las cuentas: {error.message}</EmptyRow>}
              {!error && (accounts ?? []).length === 0 && (
                <EmptyRow colSpan={COLUMNS.length}>Aún no hay cuentas. Agrega la primera para que el cliente sepa dónde pagar.</EmptyRow>
              )}
              {(accounts ?? []).map((a) => (
                <Tr key={a.id} className={a.active ? undefined : "opacity-60"}>
                  <Td className="text-slate-500">{a.sort_order}</Td>
                  <Td className="font-medium">{a.bank}</Td>
                  <Td>{a.account_type}</Td>
                  <Td className="whitespace-nowrap font-mono text-xs">{a.account_number}</Td>
                  <Td>
                    {a.holder}
                    {a.holder_id && <span className="block text-xs text-slate-500">{a.holder_id}</span>}
                  </Td>
                  <Td>{a.active ? <Badge tone="green">Activa</Badge> : <Badge tone="slate">Inactiva</Badge>}</Td>
                  <Td>
                    <ActionButton
                      action={setPaymentAccountActive}
                      fields={{ id: a.id, active: a.active ? "false" : "true" }}
                      variant={a.active ? "ghost" : "secondary"}
                      pendingLabel="Guardando…"
                    >
                      {a.active ? "Desactivar" : "Activar"}
                    </ActionButton>
                  </Td>
                </Tr>
              ))}
            </TBody>
          </Table>
          <CardBody className="border-t border-border text-xs text-slate-500">
            Los cambios aplican a los contratos que se generen desde ahora; los contratos ya generados conservan las cuentas
            con las que se crearon (puedes regenerarlos desde el servicio).
          </CardBody>
        </Card>

        <Card>
          <CardHeader title="Agregar cuenta" description="Queda activa al agregarla." />
          <CardBody>
            <ActionForm action={createPaymentAccount} className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                <Field label="Banco o billetera" htmlFor="bank">
                  <Input id="bank" name="bank" required placeholder="Ej.: Bancolombia" />
                </Field>
                <Field label="Tipo de cuenta" htmlFor="account_type">
                  <Select id="account_type" name="account_type" defaultValue="Ahorros" required>
                    {ACCOUNT_TYPES.map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </Select>
                </Field>
                <Field label="Número" htmlFor="account_number">
                  <Input id="account_number" name="account_number" required placeholder="Ej.: 123-456789-01" />
                </Field>
                <Field label="Titular" htmlFor="holder">
                  <Input id="holder" name="holder" required placeholder="Ej.: Xpertos S.A.S." />
                </Field>
                <Field label="NIT o CC del titular (opcional)" htmlFor="holder_id">
                  <Input id="holder_id" name="holder_id" placeholder="Ej.: NIT 900.123.456-7" />
                </Field>
                <Field label="Orden" htmlFor="sort_order" hint="Las cuentas se muestran de menor a mayor.">
                  <Input id="sort_order" name="sort_order" type="number" step={1} defaultValue={String(nextOrder)} />
                </Field>
              </div>
              <div className="flex justify-end">
                <SubmitButton pendingLabel="Agregando…">Agregar cuenta</SubmitButton>
              </div>
            </ActionForm>
          </CardBody>
        </Card>
      </div>
    </>
  );
}
