import type { ReactNode } from "react";

export function EmptyState({
  title,
  body,
  children,
}: {
  title: string;
  body: string;
  children?: ReactNode;
}) {
  return (
    <section className="card empty-state">
      <h2>{title}</h2>
      <p className="muted">{body}</p>
      {children ? <div className="row">{children}</div> : null}
    </section>
  );
}
