import type { ReactNode } from "react";

export function PageHeader({
  title,
  objective,
  context,
  compact,
}: {
  title: string;
  objective?: string;
  context?: ReactNode;
  compact?: boolean;
}) {
  return (
    <header className={`page-header${compact ? " is-compact" : ""}`}>
      <h1 id="page-heading" className="display" tabIndex={-1}>
        {title}
      </h1>
      {objective ? <p className="page-lead">{objective}</p> : null}
      {context}
    </header>
  );
}
