import type { ReactNode } from "react";

export function ReviewPanel({
  privateItems,
  publicItems,
}: {
  privateItems: { label: string; value: ReactNode }[];
  publicItems: { label: string; value: ReactNode }[];
}) {
  return (
    <div className="privacy-grid review-panel">
      <article className="card">
        <h2>Private on this device</h2>
        <dl>
          {privateItems.map((item) => (
            <div key={item.label}>
              <dt>{item.label}</dt>
              <dd>{item.value}</dd>
            </div>
          ))}
        </dl>
      </article>
      <article className="card blue">
        <h2>Public on Midnight</h2>
        <dl>
          {publicItems.map((item) => (
            <div key={item.label}>
              <dt>{item.label}</dt>
              <dd>{item.value}</dd>
            </div>
          ))}
        </dl>
      </article>
    </div>
  );
}

export const PublicPrivateSummary = ReviewPanel;
