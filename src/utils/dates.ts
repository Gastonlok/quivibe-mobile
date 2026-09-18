export const dateLabel = (value: string) =>
  new Intl.DateTimeFormat("fr-FR", {
    timeZone: "Africa/Kinshasa",
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(value));
export const timeLabel = (value: string) =>
  new Intl.DateTimeFormat("fr-FR", {
    timeZone: "Africa/Kinshasa",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
export function kinshasaDay(offset = 0) {
  return new Date(Date.now() + 3600000 + offset * 86400000)
    .toISOString()
    .slice(0, 10);
}
export const statusLabel: Record<string, string> = {
  CONFIRMED: "Confirmée",
  PENDING: "En attente de confirmation",
  CANCELLED: "Annulée",
  COMPLETED: "Terminée",
  NO_SHOW: "Non honorée",
};

export function eventWindow(
  period: "today" | "weekend" | "upcoming",
): Record<string, string> {
  const now = new Date(),
    start = new Date(kinshasaDay() + "T00:00:00+01:00");
  if (period === "upcoming") return {};
  if (period === "weekend") {
    const day = new Date(start.getTime() + 3600000).getUTCDay();
    start.setUTCDate(start.getUTCDate() + (day === 0 ? -1 : (6 - day + 7) % 7));
  }
  const end = new Date(
    start.getTime() + (period === "weekend" ? 2 : 1) * 86400000,
  );
  return {
    from: new Date(Math.max(now.getTime(), start.getTime())).toISOString(),
    to: end.toISOString(),
  };
}
