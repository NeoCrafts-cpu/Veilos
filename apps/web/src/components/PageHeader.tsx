import type { ReactNode } from "react";

export function PageHeader({
  title,
  objective,
  context,
}: {
  title: string;
  objective?: string;
  context?: ReactNode;
}) {
  return (
    <header className="page-header">
      <h1 id="page-heading" className="display" tabIndex={-1}>
        {title}
      </h1>
      {objective ? <p className="page-lead">{objective}</p> : null}
      {context}
    </header>
  );
}
