const FALLBACK_TEXT = "—";

function getDate(value: string | number | Date): Date | null {
  const date = value instanceof Date ? value : new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

export function formatCurrency(
  value: number | string | null | undefined,
  currency = "USD",
): string {
  if (value === null || value === undefined || value === "") return FALLBACK_TEXT;
  const numericValue = Number(value);
  if (!Number.isFinite(numericValue)) return FALLBACK_TEXT;

  return new Intl.NumberFormat(undefined, {
    style: "currency",
    currency,
    maximumFractionDigits: 2,
  }).format(numericValue);
}

export function formatDate(
  value: string | number | Date | null | undefined,
  options: Intl.DateTimeFormatOptions = { dateStyle: "medium" },
): string {
  if (value === null || value === undefined || value === "") return FALLBACK_TEXT;
  const date = getDate(value);
  return date ? new Intl.DateTimeFormat(undefined, options).format(date) : FALLBACK_TEXT;
}

export function formatDateTime(value: string | number | Date | null | undefined): string {
  return formatDate(value, { dateStyle: "medium", timeStyle: "short" });
}

export function formatStatus(value: string | null | undefined): string {
  if (!value) return FALLBACK_TEXT;
  return value
    .toLowerCase()
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

export function truncate(value: string, maximumLength: number): string {
  if (value.length <= maximumLength) return value;
  return `${value.slice(0, Math.max(0, maximumLength - 1)).trimEnd()}…`;
}

export function pluralize(count: number, singular: string, plural = `${singular}s`): string {
  return `${count.toLocaleString()} ${count === 1 ? singular : plural}`;
}

export function formatFileSize(bytes: number): string {
  if (!Number.isFinite(bytes) || bytes < 0) return FALLBACK_TEXT;
  if (bytes < 1024) return `${bytes} B`;

  const units = ["KB", "MB", "GB"];
  let value = bytes / 1024;
  let unitIndex = 0;
  while (value >= 1024 && unitIndex < units.length - 1) {
    value /= 1024;
    unitIndex += 1;
  }
  return `${value.toFixed(value >= 10 ? 0 : 1)} ${units[unitIndex]}`;
}
