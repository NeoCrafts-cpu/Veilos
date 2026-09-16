import { Button } from "./Button.js";
import type { CurrentTask } from "../lib/journey.js";
import { WindowChrome } from "./WindowChrome.js";

export function CurrentTaskCard({ task }: { task: CurrentTask }) {
  return (
    <section className="step-panel current-task">
      <WindowChrome />
      <p className="label">Start here</p>
      <h2>{task.title}</h2>
      <p className="step-panel-body">{task.body}</p>
      <div className="row">
        <Button to={task.primary.to}>{task.primary.label}</Button>
        {task.secondary ? (
          <Button to={task.secondary.to} variant="secondary">
            {task.secondary.label}
          </Button>
        ) : null}
      </div>
    </section>
  );
}
