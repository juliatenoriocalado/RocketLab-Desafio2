export function formatDate(value: string) {
  // O SQLite devolve "2026-09-28T15:08:00" sem fuso; tratamos como UTC
  const hasTimezone = /Z|[+-]\d{2}:?\d{2}$/.test(value);
  const date = new Date(hasTimezone ? value : `${value}Z`);

  if (Number.isNaN(date.getTime())) return "";

  return date.toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export function formatDuration(minutes: number) {
  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;

  if (hours === 0) return `${rest} min`;
  return rest === 0 ? `${hours}h` : `${hours}h ${rest}min`;
}

export function splitGenres(genero: string | null) {
  if (!genero) return [];
  return genero
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

export function isValidUrl(value: string) {
  return value.startsWith("http://") || value.startsWith("https://");
}
