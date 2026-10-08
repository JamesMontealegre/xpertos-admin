import { Alert } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { PhotoGrid, type PhotoItem } from "@/components/ui/photo-grid";
import { formatDate, formatDayMonth, formatDuration, formatTime, formatWeekday, minutesBetween } from "@/lib/format";
import type { PayoutFrequency } from "@/lib/labels";

export type WorkLogView = {
  id: string;
  work_date: string;
  check_in: string | null;
  check_out: string | null;
  notes: string | null;
  photos: PhotoItem[];
};

/**
 * Jornadas registradas por el experto (una por día): ingreso, salida, horas, notas y fotos.
 * Marca el primer día (fecha de inicio) y el último (día del cierre) y lista los días hábiles sin
 * registro, que son obligatorios cuando el pago es diario.
 */
export function WorkLogsCard({
  logs,
  startDate,
  lastDay,
  closed,
  missingDays,
  payoutFrequency,
}: {
  logs: WorkLogView[];
  startDate: string | null;
  /** Día del cierre (si ya cerró) o hoy. */
  lastDay: string;
  closed: boolean;
  missingDays: string[];
  payoutFrequency: PayoutFrequency;
}) {
  const sorted = [...logs].sort((a, b) => a.work_date.localeCompare(b.work_date));
  const totalMinutes = sorted.reduce((acc, l) => acc + (minutesBetween(l.check_in, l.check_out) ?? 0), 0);
  const daily = payoutFrequency === "daily";

  return (
    <Card>
      <CardHeader
        title="Jornadas"
        description={`${sorted.length === 1 ? "1 jornada registrada" : `${sorted.length} jornadas registradas`} · ${formatDuration(totalMinutes)} en total${startDate ? ` · desde el ${formatDate(startDate)}` : ""}`}
      />
      <CardBody className="space-y-4">
        {missingDays.length > 0 && (
          <Alert tone={daily ? "warning" : "info"}>
            <span className="font-medium">
              {missingDays.length === 1 ? "1 día hábil sin registro" : `${missingDays.length} días hábiles sin registro`} desde el inicio
              {daily ? " (el pago es diario: el registro de cada jornada es obligatorio)" : ""}:
            </span>{" "}
            {missingDays.map((d) => `${formatWeekday(d)} ${formatDayMonth(d)}`).join(", ")}.
          </Alert>
        )}

        {sorted.length === 0 ? (
          <p className="text-sm text-slate-500">El experto aún no ha registrado jornadas.</p>
        ) : (
          <ol className="divide-y divide-border rounded-xl border border-border">
            {sorted.map((log) => {
              const minutes = minutesBetween(log.check_in, log.check_out);
              const isFirst = startDate ? log.work_date === startDate : log === sorted[0];
              const isLast = log.work_date === lastDay;
              return (
                <li key={log.id} className="flex flex-col gap-3 px-4 py-3 sm:flex-row sm:items-start sm:justify-between">
                  <div className="min-w-0 space-y-1">
                    <p className="flex flex-wrap items-center gap-2 text-sm">
                      <span className="font-medium">
                        <span className="capitalize">{formatWeekday(log.work_date)}</span> {formatDate(log.work_date)}
                      </span>
                      {isFirst && <Badge tone="teal">Primer día</Badge>}
                      {isLast && <Badge tone={closed ? "green" : "blue"}>{closed ? "Último día" : "Hoy"}</Badge>}
                    </p>
                    <p className="text-sm text-slate-600">
                      Ingreso {formatTime(log.check_in)} · Salida {formatTime(log.check_out)} · {formatDuration(minutes)}
                    </p>
                    {log.notes && <p className="whitespace-pre-line text-sm text-slate-700">{log.notes}</p>}
                  </div>
                  <PhotoGrid photos={log.photos} size="sm" empty="Sin fotos" />
                </li>
              );
            })}
          </ol>
        )}
      </CardBody>
    </Card>
  );
}
