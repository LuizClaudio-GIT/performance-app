const WEEKDAY_SHORT = ['DOM', 'SEG', 'TER', 'QUA', 'QUI', 'SEX', 'SÁB'];
const WEEKDAY_LONG = [
  'domingo',
  'segunda-feira',
  'terça-feira',
  'quarta-feira',
  'quinta-feira',
  'sexta-feira',
  'sábado',
];
const MONTH_LONG = [
  'janeiro',
  'fevereiro',
  'março',
  'abril',
  'maio',
  'junho',
  'julho',
  'agosto',
  'setembro',
  'outubro',
  'novembro',
  'dezembro',
];

function pad2(n: number): string {
  return n < 10 ? `0${n}` : `${n}`;
}

/** Builds a local (not UTC) Date at midnight for the given ISO date string. */
export function parseISODate(iso: string): Date {
  const [y, m, d] = iso.split('-').map(Number);
  return new Date(y, m - 1, d);
}

/** Formats a Date as YYYY-MM-DD using local calendar fields (avoids UTC day-shift bugs). */
export function toISODate(d: Date): string {
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
}

export function todayISO(): string {
  return toISODate(new Date());
}

export function addDays(iso: string, n: number): string {
  const d = parseISODate(iso);
  d.setDate(d.getDate() + n);
  return toISODate(d);
}

export function weekdayIndex(iso: string): number {
  return parseISODate(iso).getDay(); // 0 = domingo
}

export function weekdayShort(iso: string): string {
  return WEEKDAY_SHORT[weekdayIndex(iso)];
}

export function weekdayLongUpper(iso: string): string {
  return WEEKDAY_LONG[weekdayIndex(iso)].toUpperCase();
}

export function dayMonthLongUpper(iso: string): string {
  const d = parseISODate(iso);
  return `${d.getDate()} DE ${MONTH_LONG[d.getMonth()].toUpperCase()}`;
}

export function dayMonthShort(iso: string): string {
  const d = parseISODate(iso);
  return `${pad2(d.getDate())}/${pad2(d.getMonth() + 1)}`;
}

/** Monday of the week containing the given ISO date. */
export function startOfWeek(iso: string): string {
  const idx = weekdayIndex(iso); // 0=Sun..6=Sat
  const diffToMonday = idx === 0 ? -6 : 1 - idx;
  return addDays(iso, diffToMonday);
}

/** The 7 ISO dates, Monday through Sunday, of the week containing `iso`. */
export function weekDates(iso: string): string[] {
  const monday = startOfWeek(iso);
  return Array.from({ length: 7 }, (_, i) => addDays(monday, i));
}

export function isToday(iso: string): boolean {
  return iso === todayISO();
}

export function isPastDate(iso: string): boolean {
  return iso < todayISO();
}

export function isFutureDate(iso: string): boolean {
  return iso > todayISO();
}

export function formatTimeNow(): string {
  const d = new Date();
  return `${pad2(d.getHours())}:${pad2(d.getMinutes())}`;
}

/** Formats a number with a comma decimal separator, pt-BR style. */
export function formatDecimal(n: number, digits = 1): string {
  return n.toLocaleString('pt-BR', { minimumFractionDigits: digits, maximumFractionDigits: digits });
}

/** Formats an integer with thousands separators, pt-BR style (e.g. 8432 -> "8.432"). */
export function formatInt(n: number): string {
  return Math.round(n).toLocaleString('pt-BR');
}
