import type { ReactNode } from "react";

export function RecoveryPanel({
  title,
  body,
  children,
}: {
  title: string;
  body: string;
  children?: ReactNode;
}) {
  return (
    <section className="card recovery-panel" role="alert">
      <h2>{title}</h2>
      <p>{body}</p>
      {children ? <div className="row">{children}</div> : null}
    </section>
  );
}
