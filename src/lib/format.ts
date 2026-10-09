const cop = new Intl.NumberFormat("es-CO", {
  style: "currency",
  currency: "COP",
  maximumFractionDigits: 0,
});

const dateFmt = new Intl.DateTimeFormat("es-CO", {
  day: "2-digit",
  month: "short",
  year: "numeric",
  timeZone: "America/Bogota",
});

const dateTimeFmt = new Intl.DateTimeFormat("es-CO", {
  day: "2-digit",
  month: "short",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
  timeZone: "America/Bogota",
});

export function formatCOP(value: number | string | null | undefined) {
  if (value === null || value === undefined || value === "") return "—";
  const n = typeof value === "string" ? Number(value) : value;
  return Number.isFinite(n) ? cop.format(n) : "—";
}

export function formatDate(value: string | null | undefined) {
  if (!value) return "—";
  // Las fechas tipo `date` (YYYY-MM-DD) se interpretan en hora local para no restar un día.
  const d = /^\d{4}-\d{2}-\d{2}$/.test(value) ? new Date(`${value}T12:00:00`) : new Date(value);
  return Number.isNaN(d.getTime()) ? "—" : dateFmt.format(d);
}

export function formatDateTime(value: string | null | undefined) {
  if (!value) return "—";
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? "—" : dateTimeFmt.format(d);
}

export function formatTime(value: string | null | undefined) {
  if (!value) return "—";
  return value.slice(0, 5);
}

export function shortId(id: string) {
  return id.slice(0, 8);
}

function toDate(value: string) {
  // Las fechas tipo `date` (YYYY-MM-DD) se interpretan al mediodía para no restar un día.
  return /^\d{4}-\d{2}-\d{2}$/.test(value) ? new Date(`${value}T12:00:00`) : new Date(value);
}

const dayMonthFmt = new Intl.DateTimeFormat("es-CO", { day: "numeric", month: "short", timeZone: "America/Bogota" });
const weekdayFmt = new Intl.DateTimeFormat("es-CO", { weekday: "short", timeZone: "America/Bogota" });

/** "16 oct" */
export function formatDayMonth(value: string | null | undefined) {
  if (!value) return "—";
  const d = toDate(value);
  if (Number.isNaN(d.getTime())) return "—";
  const parts = dayMonthFmt.formatToParts(d);
  const day = parts.find((p) => p.type === "day")?.value ?? "";
  const month = (parts.find((p) => p.type === "month")?.value ?? "").replace(".", "");
  return `${day} ${month}`;
}

/** "vie" */
export function formatWeekday(value: string | null | undefined) {
  if (!value) return "";
  const d = toDate(value);
  return Number.isNaN(d.getTime()) ? "" : weekdayFmt.format(d).replace(".", "");
}

/** Fecha de hoy en Colombia, YYYY-MM-DD (igual que `today_co()` en la base). */
export function todayCO() {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "America/Bogota" }).format(new Date());
}

/** Fecha (YYYY-MM-DD) de un timestamp en hora de Colombia. */
export function dateCO(value: string | null | undefined) {
  if (!value) return null;
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? null : new Intl.DateTimeFormat("en-CA", { timeZone: "America/Bogota" }).format(d);
}

/** Minutos entre dos horas HH:MM[:SS]; null si falta alguna. */
export function minutesBetween(start: string | null | undefined, end: string | null | undefined) {
  if (!start || !end) return null;
  const [h1, m1] = start.split(":").map(Number);
  const [h2, m2] = end.split(":").map(Number);
  const minutes = h2 * 60 + m2 - (h1 * 60 + m1);
  return Number.isFinite(minutes) && minutes > 0 ? minutes : null;
}

/** "8 h 30 min" */
export function formatDuration(minutes: number | null | undefined) {
  if (!minutes) return "—";
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m ? `${h} h ${m} min` : `${h} h`;
}

/** "1 día hábil" / "5 días hábiles" */
export function businessDaysLabel(n: number) {
  return n === 1 ? "1 día hábil" : `${n} días hábiles`;
}

const bogotaDay = new Intl.DateTimeFormat("en-CA", { timeZone: "America/Bogota" });

/** Días calendario (hora de Colombia) que faltan hasta `value`: 0 si vence hoy o ya pasó. */
export function daysUntil(value: string | null | undefined) {
  if (!value) return null;
  const target = new Date(value);
  if (Number.isNaN(target.getTime())) return null;
  const diff = Date.parse(bogotaDay.format(target)) - Date.parse(bogotaDay.format(new Date()));
  return Math.max(0, Math.round(diff / 86_400_000));
}
