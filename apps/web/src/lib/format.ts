export function shortAddress(value: string, head = 8, tail = 6): string {
  if (value.length <= head + tail + 1) return value;
  return `${value.slice(0, head)}…${value.slice(-tail)}`;
}

export function networkLabel(networkId: string): string {
  if (networkId === "preview") return "Preview";
  if (networkId === "preprod") return "Preprod";
  return "Local";
}

export function formatWindow(periodStart: bigint, periodEnd: bigint): string {
  const start = new Date(Number(periodStart) * 1000);
  const end = new Date(Number(periodEnd) * 1000);
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) return "—";
  return `${start.toISOString().slice(0, 10)} → ${end.toISOString().slice(0, 10)}`;
}
