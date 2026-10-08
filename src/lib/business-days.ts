/**
 * Días hábiles en Colombia (sin fines de semana ni festivos de la tabla `holidays`), con la misma
 * regla de la base (`is_business_day`). Las fechas van como texto YYYY-MM-DD.
 */
function parse(day: string) {
  const [y, m, d] = day.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d));
}

function format(date: Date) {
  return date.toISOString().slice(0, 10);
}

export function isBusinessDay(day: string, holidays: Set<string>) {
  const weekday = parse(day).getUTCDay();
  return weekday !== 0 && weekday !== 6 && !holidays.has(day);
}

/** Días hábiles entre `from` y `to`, ambos incluidos. */
export function businessDaysInRange(from: string, to: string, holidays: Set<string>) {
  const days: string[] = [];
  const end = parse(to);
  for (let d = parse(from); d <= end; d.setUTCDate(d.getUTCDate() + 1)) {
    const day = format(d);
    if (isBusinessDay(day, holidays)) days.push(day);
  }
  return days;
}
