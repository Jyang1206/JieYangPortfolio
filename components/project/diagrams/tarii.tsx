import { Flow } from "./Flow";

export function TariiFlow() {
  return (
    <Flow
      steps={[
        { title: "Staff inputs", body: "Leave and MCs, availability, preferences, restrictions." },
        { title: "Roster requirements", body: "Stations, shift times, coverage, roles, qualifications, workload rules." },
        { title: "Optimised roster", body: "A proposed, constraint-aware roster." },
        { title: "Human review", body: "People adjust, resolve exceptions and approve.", tone: "acc" },
        { title: "Publication", body: "Postings, updates and change requests in one place." },
      ]}
    />
  );
}

const RULES: { when: string; then: string; out: "match" | "check" | "decide" }[] = [
  { when: "Matches a member's display name or abbreviation exactly", then: "Matched", out: "match" },
  { when: "Matches an alias a lead recorded for this sheet", then: "Matched", out: "match" },
  { when: "Sits wholly inside exactly one member's name (\"Ong Wei\" in a longer name)", then: "Sure; one click records all", out: "match" },
  { when: "Matches one member's given name only", then: "Matched, flagged to check", out: "check" },
  { when: "Could be two or more members", then: "Ambiguous: needs a decision", out: "decide" },
  { when: "Matches no one", then: "Unmatched: needs a decision", out: "decide" },
];

export function TariiNameMatch() {
  return (
    <ol className="ps-tree" aria-label="Name matching rules">
      {RULES.map((rule) => (
        <li key={rule.when}>
          <span className="ps-tree-if">{rule.when}</span>
          <span className="ps-tree-then" data-out={rule.out}>
            {rule.then}
          </span>
        </li>
      ))}
    </ol>
  );
}
