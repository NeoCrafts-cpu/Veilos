import { Link } from "react-router-dom";

export type JourneyStep = {
  id: string;
  label: string;
  to?: string;
};

export function GuidedStepper({
  steps,
  current,
}: {
  steps: JourneyStep[];
  current: number;
}) {
  return (
    <ol className="guided-stepper" aria-label="Guided steps">
      {steps.map((step, index) => {
        const state = index < current ? "complete" : index === current ? "current" : "upcoming";
        const content = (
          <>
            <span className="step-index">{index + 1}</span>
            <span>{step.label}</span>
          </>
        );
        return (
          <li key={step.id} data-state={state} aria-current={state === "current" ? "step" : undefined}>
            {state === "complete" && step.to ? <Link to={step.to}>{content}</Link> : <span>{content}</span>}
          </li>
        );
      })}
    </ol>
  );
}
