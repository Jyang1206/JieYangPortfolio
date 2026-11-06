import { Flow } from "./Flow";

const TURN: [string, string][] = [
  ["Dead?", "Shop, and end the turn."],
  ["Channels", "Cancel a recall or tribute that will be broken."],
  ["On spawn", "Shop, then heal to 90%."],
  ["Support", "Shield and heal casts."],
  ["Fight", "Only if the fight is worth committing to."],
  ["Retreat", "Back off when it is not."],
  ["Capture", "Take a cleared camp's region."],
  ["Shop recall", "Go home to spend at 180 gold."],
  ["Bank gems", "Carry gems to an altar and tribute."],
  ["Farm", "Pick the next camp."],
  ["Leftover budget", "Map and enemy bookkeeping."],
];

export function BattlecodeTurn() {
  return (
    <ol className="ps-strip" style={{ margin: 0 }}>
      {TURN.map(([title, body], i) => (
        <li key={title} data-go={title === "Fight" ? "true" : undefined}>
          <div className="ps-strip-n">{String(i + 1).padStart(2, "0")}</div>
          <div className="ps-strip-title">{title}</div>
          <div className="ps-strip-body">{body}</div>
        </li>
      ))}
    </ol>
  );
}

export function BattlecodeBook() {
  return (
    <div>
      <Flow
        label="Layer 2 · the strategy book"
        steps={[
          { title: "Resolve once", body: "On the first turn, from the map, our side and (on one map) the enemy draft." },
          { title: "One cell of 18", body: "Nine maps × two sides. Each cell sets the code family, draft list, guards and fixes.", tone: "acc" },
          { title: "Named plays", body: "Map-specific openings that call engine skills." },
        ]}
      />
      <Flow
        label="Layer 1 · the engine"
        steps={[
          { title: "Sense and move", body: "Memory, safe pathing." },
          { title: "Fight", body: "Evaluate, pick a target, disengage." },
          { title: "Economy", body: "Farm, bank, recall, shop." },
          { title: "Draft", body: "The champion picker." },
        ]}
      />
    </div>
  );
}
