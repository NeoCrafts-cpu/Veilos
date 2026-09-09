import type { ReactNode } from "react";

export function StepPanel({
  kicker,
  title,
  body,
  children,
}: {
  kicker: string;
  title: string;
  body: string;
  children?: ReactNode;
}) {
  return (
    <section className="step-panel">
      <p className="label">{kicker}</p>
      <h2>{title}</h2>
      <p className="step-panel-body">{body}</p>
      {children ? <div className="row">{children}</div> : null}
    </section>
  );
}
