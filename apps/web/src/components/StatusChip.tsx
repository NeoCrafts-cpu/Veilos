export function StatusChip({
  label,
  tone = "neutral",
}: {
  label: string;
  tone?: "ok" | "warn" | "neutral";
}) {
  return (
    <span className={`chip ${tone === "ok" ? "ok" : tone === "warn" ? "warn" : ""}`}>
      <span className={`dot ${tone === "ok" ? "on" : tone === "warn" ? "off" : ""}`} />
      {label}
    </span>
  );
}
