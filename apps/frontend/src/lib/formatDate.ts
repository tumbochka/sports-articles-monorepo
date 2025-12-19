const TZ = process.env.NEXT_PUBLIC_TZ || "UTC";
const LOCALE = process.env.NEXT_PUBLIC_LOCALE || "en-GB";

export function formatDateTime(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";

  return new Intl.DateTimeFormat(LOCALE, {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
    timeZone: TZ,
  }).format(d);
}
