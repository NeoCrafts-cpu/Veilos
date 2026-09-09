import type { ReactNode } from "react";
import { PageHeader } from "./PageHeader.js";
import { GuidedStepper, type JourneyStep } from "./GuidedStepper.js";

export function JourneyLayout({
  title,
  objective,
  steps,
  current,
  children,
  actions,
}: {
  title: string;
  objective: string;
  steps?: JourneyStep[];
  current?: number;
  children: ReactNode;
  actions?: ReactNode;
}) {
  return (
    <div className="page journey">
      <PageHeader title={title} objective={objective} />
      {steps && current !== undefined ? <GuidedStepper steps={steps} current={current} /> : null}
      <div className="journey-body">{children}</div>
      {actions ? <div className="journey-actions">{actions}</div> : null}
    </div>
  );
}
