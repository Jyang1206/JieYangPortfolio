import type { Story } from "../types";

// Sources: the user's resume (Movel AI, Dec 2025 – Apr 2026), data/worlds.ts and the previous
// data/projects.ts copy. The task diagram describes the shape of the workflows, not internal code.
export const movelStory: Story = {
  slug: "seer-fleet-management",
  worldId: "movel",
  theme: "movel",
  name: "Movel AI",
  role: "Full-Stack Developer Intern, Robotics Fleet Orchestration",
  dates: "Dec 2025 – Apr 2026",
  place: "Movel AI, Singapore",
  header: {
    word: "Movel AI",
    title: "Robotics fleet orchestration",
    lede: "Backend services that let a mixed fleet of robots work inside real buildings: ride lifts, pass secure doors, move inventory, and recover when a step fails, while operators stay in control.",
    figure: {
      src: "/images/fleet-management-ui.png",
      alt: "Fleet management and trolley inventory dashboard",
      caption: "Fleet management and trolley inventory, as operators used it.",
      width: 1842,
      height: 914,
    },
  },
  facts: [
    { label: "Role", value: "Full-Stack Developer Intern" },
    { label: "Dates", value: "Dec 2025 – Apr 2026" },
    { label: "Robots", value: "SEER AMRs, AGVs, an Omron robot dog" },
    { label: "Deployments", value: "Validated on site at NUS and GSK" },
  ],
  sections: [
    {
      id: "problem",
      nav: "The problem",
      title: "The problem",
      blocks: [
        {
          kind: "p",
          text: "A robot that can drive a corridor is not yet useful in a building. One delivery can need a lift, two secure doors, an inventory system that knows a trolley has left, and an operator who can see what is happening. Each of those systems has its own protocol, its own idea of state and its own way of failing.",
        },
        {
          kind: "p",
          text: "The hard cases are the half-finished ones: a robot waiting in a lift lobby when the car never arrives, a door that unlocks late, an RFID read that does not match the expected trolley. A fleet system has to notice, retry where that is safe, and otherwise leave the task in a state a person can understand and act on.",
        },
      ],
    },
    {
      id: "built",
      nav: "What I built",
      title: "What I built",
      blocks: [
        {
          kind: "list",
          items: [
            "Backend services in Node.js and TypeScript for fleet orchestration across autonomous mobile robots and enterprise systems.",
            "REST APIs, workflow orchestration and state management for robot tasks and inventory.",
            "Fault-tolerant workflows with validation, retries, resource reservation and recovery.",
            "Integrations with RFID, MQTT devices, KONE lift controls, SALTO door access, chutes and inventory platforms.",
            "React operator dashboards that show robot state, map intent and task queues.",
            "Docker deployments, with operational validation on site at NUS and GSK.",
          ],
        },
      ],
    },
    {
      id: "how",
      nav: "How it works",
      title: "How it works",
      blocks: [
        {
          kind: "p",
          text: "The orchestration services sit between the robots, the building and the people. A task is checked before any robot moves, claims the lift and doors it needs, and then runs; if a step fails it is retried within limits, and otherwise it releases what it holds and stops where an operator can see it.",
        },
        { kind: "diagram", id: "movel-integrations", caption: "What the orchestration services talk to. Each link is a different protocol with its own failure modes." },
        {
          kind: "concepts",
          items: ["Workflow orchestration", "Task state machines", "Resource reservation", "Bounded retries and recovery", "Event-driven integrations (MQTT)", "Operator-in-the-loop dashboards"],
        },
      ],
    },
    {
      id: "decisions",
      nav: "Decisions",
      title: "Decisions and trade-offs",
      blocks: [
        {
          kind: "decisions",
          items: [
            {
              choice: "Validate at the boundary",
              over: "Over finding out mid-route",
              why: "A request with a destination that does not exist or a robot that cannot do the job is cheapest to reject before anything moves.",
              cost: "Validation rules have to track the site's real configuration.",
            },
            {
              choice: "Reserve shared resources before dispatch",
              over: "Over first come, first served at the lift",
              why: "Two robots asking for the same lift car or door at once is a normal day in a building. Claiming them up front turns a physical collision of plans into a queue.",
              cost: "Every failure path must release what it holds, or the fleet slowly locks itself up.",
            },
            {
              choice: "Explicit task state with bounded retries",
              over: "Over fire-and-forget calls",
              why: "Recovery needs to know where a task stopped. Bounded retries handle the transient failures; anything beyond that goes to a person.",
              cost: "More states to design, test and show in the dashboard.",
            },
            {
              choice: "Validate deployments on site",
              over: "Over trusting the test environment",
              why: "Lifts and doors behave differently in each building. Docker images made the deployments repeatable, and on-site runs at NUS and GSK checked them against the real hardware.",
            },
          ],
        },
      ],
    },
    {
      id: "results",
      nav: "Results",
      title: "Results",
      blocks: [
        {
          kind: "p",
          text: "The services ran on real sites: they were deployed with Docker and validated in operation at NUS and GSK, with SEER AMRs, AGVs and an Omron robot dog working alongside KONE lifts, SALTO doors, RFID and inventory systems. I do not have throughput or uptime figures I can publish, so none are claimed here.",
        },
      ],
    },
    {
      id: "stack",
      nav: "Stack",
      title: "Stack",
      blocks: [
        {
          kind: "stack",
          groups: [
            { label: "Backend", items: ["TypeScript", "Node.js", "REST and JSON schemas", "FastAPI"] },
            { label: "Messaging", items: ["MQTT", "RabbitMQ"] },
            { label: "Integrations", items: ["KONE lifts", "SALTO doors", "RFID", "Inventory platforms"] },
            { label: "Frontend and ops", items: ["React operator dashboards", "Docker"] },
          ],
        },
      ],
    },
    {
      id: "learned",
      nav: "What I learned",
      title: "What I learned",
      blocks: [
        {
          kind: "list",
          items: [
            "Physical systems fail in the middle. Designing for a task that stopped halfway is most of the work.",
            "A resource you reserve is a resource you must release on every path, including the ones you did not expect.",
            "Operators need intent as well as state: where a robot is going and why it is waiting, not only that it is idle.",
            "A site visit finds problems no simulator shows.",
          ],
        },
      ],
    },
  ],
};
