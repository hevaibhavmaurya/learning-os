/** en-GB short date: "14 Oct" */
export function fmtDate(isoOrMs: string | number | Date | null | undefined): string {
  if (isoOrMs == null) return "";
  const d =
    isoOrMs instanceof Date
      ? isoOrMs
      : new Date(typeof isoOrMs === "number" ? isoOrMs : Date.parse(isoOrMs));
  if (!Number.isFinite(d.getTime())) return "";
  return d.toLocaleDateString("en-GB", { day: "numeric", month: "short" });
}

/** en-GB date with year: "14 Oct 2026" */
export function fmtDateYear(
  isoOrMs: string | number | Date | null | undefined,
): string {
  if (isoOrMs == null) return "";
  const d =
    isoOrMs instanceof Date
      ? isoOrMs
      : new Date(typeof isoOrMs === "number" ? isoOrMs : Date.parse(isoOrMs));
  if (!Number.isFinite(d.getTime())) return "";
  return d.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function fmtLongDate(date = new Date()): string {
  return date.toLocaleDateString("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });
}

export function greeting(name = "Vaibhav"): string {
  const h = new Date().getHours();
  if (h < 5) return `Late night, ${name}`;
  if (h < 12) return `Good morning, ${name}`;
  if (h < 17) return `Good afternoon, ${name}`;
  return `Good evening, ${name}`;
}
