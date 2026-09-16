export function DeskStats({
  items,
  onRefresh,
  refreshing,
}: {
  items: { label: string; value: string }[];
  onRefresh?: () => void;
  refreshing?: boolean;
}) {
  return (
    <div className="desk-stats">
      {items.map((item) => (
        <p key={item.label}>
          <span className="desk-stats-label">{item.label}</span>
          <strong>{item.value}</strong>
        </p>
      ))}
      {onRefresh ? (
        <button type="button" className="btn ghost desk-stats-refresh" onClick={onRefresh}>
          {refreshing ? "Refreshing…" : "Refresh"}
        </button>
      ) : null}
    </div>
  );
}
