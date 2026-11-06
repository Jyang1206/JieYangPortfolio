import { Flow } from "./Flow";

export function IrisPipeline() {
  return (
    <ol className="ps-strip" style={{ margin: 0 }}>
      {[
        ["Capture scene", "RGB/depth survey from the wrist camera."],
        ["Detect + track", "YOLO masks and stable instrument tracks."],
        ["Confirm identity", "DINO evidence where required; operator review."],
        ["Determine order", "Contact heads + graph: upper instruments first."],
        ["Plan + approve", "Backend checks the pick and set-assigned slot."],
        ["Pick + place", "MoveIt / ros2_control; verify and refresh scene."],
      ].map(([title, body], i) => (
        <li key={title} data-go={i >= 4 ? "true" : undefined}>
          <div className="ps-strip-n">{String(i + 1).padStart(2, "0")}</div>
          <div className="ps-strip-title">{title}</div>
          <div className="ps-strip-body">{body}</div>
        </li>
      ))}
    </ol>
  );
}

// Four instruments: scissors (S) lies on forceps (F) and on the large handle (L); F lies on tweezers (T).
const NODES = [
  { id: "S", name: "Scissors", x: 120, y: 70 },
  { id: "F", name: "Artery forceps", x: 340, y: 70 },
  { id: "L", name: "Scalpel handle", x: 120, y: 230 },
  { id: "T", name: "Tissue forceps", x: 340, y: 230 },
] as const;
const EDGES: [string, string][] = [
  ["S", "F"],
  ["S", "L"],
  ["F", "T"],
];

export function IrisContactGraph() {
  const at = (id: string) => NODES.find((n) => n.id === id)!;
  return (
    <svg className="ps-svg" viewBox="0 0 640 300" role="img" aria-label="Contact graph: scissors on artery forceps and on scalpel handle, artery forceps on tissue forceps. Order: scissors, then artery forceps and scalpel handle, then tissue forceps.">
      <defs>
        <marker id="iris-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="8" markerHeight="8" orient="auto">
          <path d="M0 0 L10 5 L0 10 z" className="f-ink" />
        </marker>
      </defs>
      {EDGES.map(([a, b]) => {
        const p = at(a);
        const q = at(b);
        const dx = q.x - p.x;
        const dy = q.y - p.y;
        const len = Math.hypot(dx, dy);
        const r = 40;
        return (
          <line
            key={a + b}
            x1={p.x + (dx / len) * r}
            y1={p.y + (dy / len) * r}
            x2={q.x - (dx / len) * (r + 4)}
            y2={q.y - (dy / len) * (r + 4)}
            className="s-ink"
            markerEnd="url(#iris-arrow)"
          />
        );
      })}
      <text x={230} y={58} textAnchor="middle" className="t-soft">on top of</text>
      {NODES.map((n) => (
        <g key={n.id}>
          <circle cx={n.x} cy={n.y} r={36} className={n.id === "S" ? "f-acc" : "f-bg"} />
          <circle cx={n.x} cy={n.y} r={36} className={n.id === "S" ? "s-acc" : "s-ink"} />
          <text x={n.x} y={n.y + 6} textAnchor="middle" className={`t-bold ${n.id === "S" ? "t-on-acc" : ""}`} style={{ fontSize: 18 }}>
            {n.id}
          </text>
          <text x={n.x} y={n.y + 56} textAnchor="middle" className="t-soft">
            {n.name}
          </text>
        </g>
      ))}
      <g transform="translate(468 40)">
        <text className="t-bold" y={0}>Pick order</text>
        {[
          ["1", "S", "nothing on top"],
          ["2", "F, L", "once S is gone"],
          ["3", "T", "once F is gone"],
        ].map(([n, who, why], i) => (
          <g key={n} transform={`translate(0 ${34 + i * 56})`}>
            <circle cx={11} cy={-5} r={11} className={i === 0 ? "f-acc" : "f-bg"} />
            <circle cx={11} cy={-5} r={11} className={i === 0 ? "s-acc" : "s-ink"} />
            <text x={11} y={0} textAnchor="middle" className={`t-mono ${i === 0 ? "t-on-acc" : ""}`}>{n}</text>
            <text x={32} y={0} className="t-bold">{who}</text>
            <text x={32} y={20} className="t-soft">{why}</text>
          </g>
        ))}
      </g>
    </svg>
  );
}

export function IrisAuthority() {
  return (
    <div>
      <Flow
        steps={[
          { title: "pickable", body: "Geometry and robot-input gates: confidence, fresh frame, intrinsics, source-time transform, inside the shared workspace." },
          { title: "identity_confirmed", body: "The operator accepted the identity proposed from DINO evidence for this survey." },
          { title: "sorting_eligible", body: "Pickable, with a confirmed expected identity and a valid destination in the selected set.", tone: "acc" },
        ]}
      />
      <p className="ps-branch">
        <b>Then:</b> the backend plans the path inside the workspace, the operator approves, and the command is acknowledged by ID. Contact order and identity can make a pick wait; they cannot start one.
      </p>
    </div>
  );
}
