// Reflowing step diagrams: a row of boxes with arrows on desktop, a column on small screens.

export type FlowStep = { title: string; body?: string; tone?: "acc" };

export function Flow({ steps, label }: { steps: FlowStep[]; label?: string }) {
  return (
    <div className="ps-flow-lane">
      {label && <span className="ps-label">{label}</span>}
      <ol className="ps-flow">
        {steps.map((step) => (
          <li key={step.title} data-tone={step.tone}>
            <div className="ps-flow-title">{step.title}</div>
            {step.body && <div className="ps-flow-body">{step.body}</div>}
          </li>
        ))}
      </ol>
    </div>
  );
}
