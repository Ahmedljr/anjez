/**
 * Arabic date formatting via the platform's built-in `Intl` — no date-fns
 * locale payload shipped to the browser. `ar-EG-u-nu-latn` matches the previous
 * date-fns `ar` output exactly: MSA month names with Latin digits (e.g. "12 يونيو").
 */
const DAY_MONTH = new Intl.DateTimeFormat("ar-EG-u-nu-latn", {
  day: "numeric",
  month: "long",
});

const DAY_MONTH_SHORT = new Intl.DateTimeFormat("ar-EG-u-nu-latn", {
  day: "numeric",
  month: "short",
});

const FULL_DATE = new Intl.DateTimeFormat("ar-EG-u-nu-latn", {
  day: "numeric",
  month: "long",
  year: "numeric",
});

/** e.g. "12 يونيو" */
export function formatDayMonth(value: string | Date): string {
  return DAY_MONTH.format(new Date(value));
}

/** e.g. "12 يونيو" (short month) */
export function formatDayMonthShort(value: string | Date): string {
  return DAY_MONTH_SHORT.format(new Date(value));
}

/** e.g. "12 يونيو 2026" */
export function formatFullDate(value: string | Date): string {
  return FULL_DATE.format(new Date(value));
}
