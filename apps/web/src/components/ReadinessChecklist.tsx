import { Button } from "./Button.js";
import type { ReadinessItem } from "../lib/journey.js";
import { StatusChip } from "./StatusChip.js";

export function ReadinessChecklist({
  items,
  onConnect,
  onRetry,
}: {
  items: ReadinessItem[];
  onConnect?: () => void;
  onRetry?: () => void;
}) {
  return (
    <ul className="readiness-list">
      {items.map((item) => {
        const tone = item.ok === true ? "ok" : item.ok === false ? "warn" : "neutral";
        return (
          <li key={item.id} className="card readiness-item">
            <div className="readiness-head">
              <strong>{item.label}</strong>
              <StatusChip
                tone={tone}
                label={item.ok === true ? "Ready" : item.ok === false ? "Needs attention" : "Checking"}
              />
            </div>
            <p className="muted">{item.detail}</p>
            {item.ok === false && item.repair ? (
              item.repair.to ? (
                <Button to={item.repair.to} variant="secondary">
                  {item.repair.label}
                </Button>
              ) : (
                <Button
                  variant="secondary"
                  onClick={() => {
                    if (item.repair?.action === "connect") onConnect?.();
                    if (item.repair?.action === "retry") onRetry?.();
                  }}
                >
                  {item.repair.label}
                </Button>
              )
            ) : null}
          </li>
        );
      })}
    </ul>
  );
}
