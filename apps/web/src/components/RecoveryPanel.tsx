import type { ReactNode } from "react";

export function RecoveryPanel({
  title,
  body,
  children,
  role = "alert",
}: {
  title: string;
  body: string;
  children?: ReactNode;
  role?: "alert" | "status";
}) {
  return (
    <section className="card recovery-panel" role={role}>
      <h2>{title}</h2>
      <p>{body}</p>
      {children ? <div className="row">{children}</div> : null}
    </section>
  );
}
