import type { ReactNode } from "react";

export function SuccessState({
  title,
  body,
  children,
}: {
  title: string;
  body: string;
  children?: ReactNode;
}) {
  return (
    <section className="card lime success-state">
      <h2>{title}</h2>
      <p>{body}</p>
      {children ? <div className="row">{children}</div> : null}
    </section>
  );
}
