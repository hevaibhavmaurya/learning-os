const DAY = 86_400_000;

/** Relative time matching reference `ago()`. */
export function ago(input: string | number | Date | null | undefined): string {
  if (input == null || input === "") return "";
  const t =
    typeof input === "number"
      ? input
      : input instanceof Date
        ? input.getTime()
        : Date.parse(input);
  if (!Number.isFinite(t)) return "";
  const d = Date.now() - t;
  if (d < 60_000) return "just now";
  if (d < 3_600_000) return `${Math.floor(d / 60_000)}m ago`;
  if (d < DAY) return `${Math.floor(d / 3_600_000)}h ago`;
  if (d < 7 * DAY) return `${Math.floor(d / DAY)}d ago`;
  return new Date(t).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
  });
}

/** Short date matching reference `fmt()`. */
export function fmtDate(input: string | number | Date | null | undefined): string {
  if (input == null || input === "") return "";
  const t =
    typeof input === "number"
      ? input
      : input instanceof Date
        ? input.getTime()
        : Date.parse(input);
  if (!Number.isFinite(t)) return "";
  return new Date(t).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
  });
}

export function toDateInputValue(
  input: string | number | Date | null | undefined,
): string {
  if (input == null || input === "") return "";
  const d =
    typeof input === "number"
      ? new Date(input)
      : input instanceof Date
        ? input
        : new Date(input);
  if (Number.isNaN(d.getTime())) return "";
  const local = new Date(d.getTime() - d.getTimezoneOffset() * 60_000);
  return local.toISOString().slice(0, 10);
}
