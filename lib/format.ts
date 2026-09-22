import { format, formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";

const currencyFormatter = new Intl.NumberFormat("fr-FR", {
  style: "currency",
  currency: "EUR",
  maximumFractionDigits: 0,
});

export function formatCurrency(amount: string | number | null | undefined) {
  if (amount === null || amount === undefined) return "—";
  const value = typeof amount === "string" ? Number(amount) : amount;
  if (Number.isNaN(value)) return "—";
  return currencyFormatter.format(value);
}

export function formatDate(date: Date | string | null | undefined, pattern = "d MMM yyyy") {
  if (!date) return "—";
  const d = typeof date === "string" ? new Date(date) : date;
  return format(d, pattern, { locale: fr });
}

export function formatDateTime(date: Date | string | null | undefined) {
  return formatDate(date, "d MMM yyyy 'à' HH:mm");
}

export function formatRelative(date: Date | string | null | undefined) {
  if (!date) return "—";
  const d = typeof date === "string" ? new Date(date) : date;
  return formatDistanceToNow(d, { locale: fr, addSuffix: true });
}

export function formatDuration(seconds: number | null | undefined) {
  if (!seconds) return "—";
  const minutes = Math.round(seconds / 60);
  if (minutes < 60) return `${minutes} min`;
  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;
  return rest ? `${hours} h ${rest} min` : `${hours} h`;
}

export function daysSince(date: Date | string | null | undefined) {
  if (!date) return null;
  const d = typeof date === "string" ? new Date(date) : date;
  return Math.floor((Date.now() - d.getTime()) / 86_400_000);
}

export function initials(name: string) {
  return name
    .split(" ")
    .map((part) => part[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();
}
