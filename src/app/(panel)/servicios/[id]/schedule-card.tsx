import { Card, CardBody, CardHeader, DescriptionList } from "@/components/ui/card";
import type { Database } from "@/lib/database.types";
import { businessDaysLabel, formatDate, formatDateTime } from "@/lib/format";
import { PAYOUT_FREQUENCY, PRICING_MODE, payoutMethodLabel, type PayoutMethod, type ServiceStatus } from "@/lib/labels";

type ScheduleRow = Database["public"]["Views"]["service_schedule"]["Row"];

/** "Inicio de obra": fechas de pago, inicio y terminación estimada (vista `service_schedule`). */
export function ScheduleCard({
  status,
  schedule,
  startedAt,
  payoutMethod,
  payoutAccount,
}: {
  status: ServiceStatus;
  schedule: ScheduleRow | null;
  startedAt: string | null;
  payoutMethod: PayoutMethod | null;
  payoutAccount: string | null;
}) {
  const daysToStart = schedule?.business_days_to_start ?? null;
  const pricing = schedule?.pricing_mode ?? "labor_only";
  const offset = schedule?.start_offset_days ?? (pricing === "all_inclusive" ? 5 : 2);

  let countdown: React.ReactNode;
  if (status === "scheduled") {
    countdown =
      daysToStart == null ? (
        "Sin fecha de inicio"
      ) : daysToStart === 0 ? (
        <span className="font-semibold text-primary">Inicia hoy</span>
      ) : (
        <span className="font-semibold text-primary">{businessDaysLabel(daysToStart)} para el inicio</span>
      );
  } else {
    countdown = startedAt ? `Inició el ${formatDateTime(startedAt)}` : "—";
  }

  return (
    <Card>
      <CardHeader
        title="Inicio de obra"
        description={status === "scheduled" ? "El servicio inicia solo en la fecha acordada." : undefined}
      />
      <CardBody>
        <DescriptionList
          columns={3}
          items={[
            { label: "Fecha de pago", value: formatDate(schedule?.payment_date) },
            { label: "Fecha de inicio", value: formatDate(schedule?.start_date) },
            { label: status === "scheduled" ? "Para el inicio" : "Inicio real", value: countdown },
            {
              label: "Regla de inicio",
              value: `${businessDaysLabel(offset)} después del pago (${PRICING_MODE[pricing].short.toLowerCase()})`,
            },
            {
              label: "Duración estimada",
              value: schedule?.estimated_days ? businessDaysLabel(schedule.estimated_days) : "—",
            },
            { label: "Terminación estimada", value: formatDate(schedule?.estimated_end_date) },
            {
              label: "Periodicidad de pago al experto",
              value: schedule?.payout_frequency ? PAYOUT_FREQUENCY[schedule.payout_frequency] : "—",
            },
            {
              label: "Medio de pago del experto",
              value: (
                <>
                  {payoutMethodLabel(payoutMethod)}
                  {payoutAccount && <span className="block text-xs text-slate-500">{payoutAccount}</span>}
                </>
              ),
            },
          ]}
        />
      </CardBody>
    </Card>
  );
}
