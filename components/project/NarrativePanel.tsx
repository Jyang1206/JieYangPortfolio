import type { Project, StoryStep } from "../../data/projects";

type NarrativePanelProps = {
  project: Project;
  step: StoryStep;
  activeIndex: number;
};

export function NarrativePanel({ project, step, activeIndex }: NarrativePanelProps) {
  return (
    <aside className="rounded-lg border border-slate-200 bg-white/95 p-5 text-slate-950 shadow-2xl shadow-slate-950/10 backdrop-blur md:p-6">
      <div className="mb-5 flex items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">
          Step {activeIndex + 1} / {project.storySteps.length}
        </p>
        <span
          className="rounded-full px-3 py-1 text-xs font-semibold text-slate-950"
          style={{ backgroundColor: project.accentColor }}
        >
          {step.cameraTarget}
        </span>
      </div>
      <h2 className="text-2xl font-semibold tracking-normal text-slate-950">{step.title}</h2>
      <p className="mt-4 text-base leading-7 text-slate-700">{step.body}</p>
      {step.metrics && (
        <div className="mt-6 grid gap-2 sm:grid-cols-2">
          {step.metrics.map((metric) => (
            <div key={metric} className="rounded-md border border-slate-200 bg-slate-50 p-3">
              <p className="text-xs uppercase tracking-[0.16em] text-slate-500">Signal</p>
              <p className="mt-1 text-sm font-medium text-slate-900">{metric}</p>
            </div>
          ))}
        </div>
      )}
      {step.technicalDetails && (
        <div className="mt-5">
          <p className="mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
            Technical details
          </p>
          <ul className="space-y-2 text-sm leading-6 text-slate-700">
            {step.technicalDetails.map((detail) => (
              <li key={detail} className="flex gap-2">
                <span aria-hidden="true" className="mt-2 size-1.5 rounded-full bg-slate-400" />
                <span>{detail}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </aside>
  );
}
