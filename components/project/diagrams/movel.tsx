import { Flow } from "./Flow";

export function MovelTask() {
  return (
    <div>
      <Flow
        label="When it goes right"
        steps={[
          { title: "Request", body: "From an operator or an enterprise system." },
          { title: "Validate", body: "Robot, destination and payload make sense before anything moves." },
          { title: "Reserve", body: "Claim the robot, lift and doors the task will need." },
          { title: "Run steps", body: "Drive, call the lift, open the door, update inventory." },
          { title: "Done", body: "Release reservations, record the result.", tone: "acc" },
        ]}
      />
      <Flow
        label="When a step fails"
        steps={[
          { title: "Retry", body: "Within a limit, for failures that are safe to repeat." },
          { title: "Recover", body: "Release what the task holds; bring the robot to a known state." },
          { title: "Hand to operator", body: "The task stops where the dashboard can show it.", tone: "acc" },
        ]}
      />
    </div>
  );
}

const SPOKES = [
  { label: "SEER AMRs, AGVs, robot dog", sub: "position, status, missions" },
  { label: "KONE lifts", sub: "call, hold, release" },
  { label: "SALTO doors", sub: "secure access" },
  { label: "RFID, MQTT, chutes", sub: "device events" },
  { label: "Inventory platforms", sub: "what is where" },
  { label: "Operator dashboard", sub: "React; state, intent, queues" },
];

export function MovelIntegrations() {
  const cx = 320;
  const cy = 170;
  return (
    <svg className="ps-svg" viewBox="0 0 640 340" role="img" aria-label="Orchestration services in the centre, connected to robots, KONE lifts, SALTO doors, RFID and MQTT devices, inventory platforms and the operator dashboard.">
      {SPOKES.map((s, i) => {
        const a = (-90 + i * 60) * (Math.PI / 180);
        const x = cx + Math.cos(a) * 235;
        const y = cy + Math.sin(a) * 128;
        return (
          <g key={s.label}>
            <line x1={cx} y1={cy} x2={x} y2={y} className="s-soft s-dash" />
            <rect x={x - 92} y={y - 24} width={184} height={48} rx={6} className="f-surface" />
            <rect x={x - 92} y={y - 24} width={184} height={48} rx={6} className="s-ink" />
            <text x={x} y={y - 3} textAnchor="middle" className="t-bold" style={{ fontSize: 13 }}>
              {s.label}
            </text>
            <text x={x} y={y + 14} textAnchor="middle" className="t-soft" style={{ fontSize: 11.5 }}>
              {s.sub}
            </text>
          </g>
        );
      })}
      <rect x={cx - 86} y={cy - 32} width={172} height={64} rx={8} className="f-acc" />
      <text x={cx} y={cy - 4} textAnchor="middle" className="t-bold t-on-acc" style={{ fontSize: 15 }}>
        Orchestration
      </text>
      <text x={cx} y={cy + 15} textAnchor="middle" className="t-on-acc" style={{ fontSize: 12 }}>
        Node.js · TypeScript · REST
      </text>
    </svg>
  );
}
