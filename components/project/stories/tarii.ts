import type { Story } from "../types";

// Sources: the Tarii repository (docs/design/tarii-design-kit.md; docs/product-docs/public/user-stories/
// bringing-data-in.md; docs/agent-prompts/design-telegram-bot-2026-10-08.md and the Telegram first-test
// checklist; README). Captures are the public Harbourline demo. No client or hospital is named.
export const tariiStory: Story = {
  slug: "tarii",
  worldId: "tarii",
  theme: "tarii",
  name: "Tarii",
  role: "UI/UX, product and full-stack",
  dates: "Oct 2026 – present",
  place: "Rostering for hospital departments in Singapore",
  header: {
    word: "Tarii",
    title: "Staff rosters that people review before they go out",
    lede: "Rosterers set the rules, a solver fills the grid, and staff check their postings from a phone. I worked on the parts people touch: the web app and its analytics, bringing in the spreadsheets departments already keep, and how changes reach staff.",
    figure: {
      src: "/images/tarii/p5-roster.png",
      alt: "Published fortnight roster with shifts, on-call and leave filled in",
      caption: "A solved fortnight from the Harbourline demo: every day covered, on-call and leave in place, ready for review.",
      width: 1380,
      height: 754,
    },
  },
  facts: [
    { label: "Role", value: "UI/UX, product and full-stack" },
    { label: "Product", value: "Tarii, staff rostering" },
    { label: "Users", value: "Rosterers and staff in a hospital department" },
    { label: "Captures", value: "Public Harbourline demo data" },
  ],
  sections: [
    {
      id: "problem",
      nav: "The problem",
      title: "The problem",
      blocks: [
        {
          kind: "p",
          text: "A department roster decides who covers which posting on which day. Before Tarii, the inputs arrive by email and message, the leave projection lives in one workbook, the on-call roster for each grade lives in another, and months of confirmed deployments sit in hidden tabs. The finished roster goes out by email, and every change after that is another round of messages.",
        },
        {
          kind: "p",
          text: "Tarii's job is to connect those steps into one workflow, without taking the decisions away from the people who are accountable for them. The product never promises a perfect roster. It proposes one, and people review it.",
        },
        { kind: "diagram", id: "tarii-flow", caption: "The workflow Tarii is built around. Review and publication stay with people." },
      ],
    },
    {
      id: "built",
      nav: "What I built",
      title: "What I built",
      blocks: [
        {
          kind: "p",
          text: "I did a lot of the UI/UX and product work, and built across the stack where that work needed it.",
        },
        {
          kind: "list",
          items: [
            "UI/UX and product design for the web app rosterers use every day: choosing what a solve covers, reading the solved grid, and making changes after publishing.",
            "The analytics rosterers use to review a roster before it goes out.",
            "Spreadsheet import that reads a department's own workbooks and matches staff names written in shortened or reordered forms, without guessing.",
            "Staff notifications through a Telegram bot, built ahead of a full mobile app.",
          ],
        },
        {
          kind: "figure",
          figure: {
            src: "/images/tarii/p4-console.png",
            alt: "Solve console with dates, readiness and scope options",
            caption: "The solve console. The rosterer picks the dates and what the solve should cover, and sees what is still missing before starting.",
            width: 575,
            height: 750,
            frame: "screen",
          },
        },
        {
          kind: "figure",
          figure: {
            src: "/images/tarii/p7-change.png",
            alt: "Day timeline with a cover-change form for one assignment",
            caption: "Changes after publishing: open a cell on the day timeline and pick a teammate to cover.",
            width: 1380,
            height: 638,
            frame: "screen",
          },
        },
        {
          kind: "phones",
          figures: [
            { src: "/images/tarii/hero-request-form.png", alt: "Phone leave request form", caption: "Staff request leave from their phone.", width: 780, height: 1688 },
            { src: "/images/tarii/p6-calendar.png", alt: "Phone month calendar of one person's shifts", caption: "Their postings land in a calendar.", width: 780, height: 1688 },
            { src: "/images/tarii/p6-inbox.png", alt: "Phone inbox with a roster-published update", caption: "The inbox says when a roster is out.", width: 780, height: 1688 },
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
          text: "Import starts with a read-only preview: every entry shows the sheet and cell it came from, and anything unreadable stays visible instead of being dropped. Names are matched only against the department's own members and spellings a lead has confirmed; anything else waits for a decision. Applying takes the exact preview that was reviewed, or nothing at all.",
        },
        { kind: "diagram", id: "tarii-name-match", caption: "How a name from a sheet is resolved. Grade, column position and similar spellings never pick a person." },
        {
          kind: "p",
          text: "For notifications, a staff member links their Telegram chat to Tarii once, with a sign-in link that works a single time. Roster news then arrives in the chat, and short commands answer the common questions: what am I on today, who is on tomorrow, when do requests close.",
        },
        {
          kind: "concepts",
          items: ["Human review before publishing", "Read-only import previews", "Provenance for every entry", "Alias matching without guessing", "Chat-first notifications", "One message grammar"],
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
              choice: "A Telegram bot before a mobile app",
              over: "Over waiting for native apps",
              why: "A bot ships much faster, staff already have the app on their phones, and it answers the most common questions (what am I on, who is on, when do requests close) in one message.",
              cost: "Telegram's chat layout limits what a reply can show, so every message had to be designed as text, and staff who do not use Telegram still need email.",
            },
            {
              choice: "Import is a preview you read first",
              over: "Over importing straight into the roster",
              why: "A roster lead has to trust what came in. Showing the cell behind every entry, and refusing to apply a stale preview, makes the import checkable.",
              cost: "One more step before data lands, and more screen to design.",
            },
            {
              choice: "Never guess who a name means",
              over: "Over fuzzy matching",
              why: "A wrong match puts leave or an on-call duty on the wrong person, which is worse than asking. Ambiguous and unmatched names wait in a queue with every cell they appear in.",
              cost: "More decisions the first time a sheet is imported. Per-sheet aliases and a one-click record for names that are certain keep that cost to once.",
            },
            {
              choice: "Aliases are kept per sheet",
              over: "Over one global alias list",
              why: "The same short name on two tabs can be two people.",
              cost: "A lead may answer the same spelling once on each sheet.",
            },
          ],
        },
      ],
    },
    {
      id: "results",
      nav: "Where it stands",
      title: "Where it stands",
      blocks: [
        {
          kind: "p",
          text: "Workbook import, the identity queue, per-sheet aliases and the one-click record of certain names are live in the app. The Telegram bot was registered and answering in production in October 2026, with turning it on for a first team as the next step. I have no usage figures to publish, so none are shown here.",
        },
        {
          kind: "figure",
          figure: {
            src: "/images/tarii/p9-publish.png",
            alt: "Published week of a demo roster, with each day's coverage summary above the member rows",
            caption: "A published week in the demo. Each day's header says whether it is complete and how many people are spare or off.",
            width: 1380,
            height: 555,
            frame: "screen",
          },
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
            { label: "Web app", items: ["React", "TypeScript", "Vite", "Hanken Grotesk and the Tarii design kit"] },
            { label: "Backend", items: ["Python", "FastAPI", "Postgres", "Redis and an RQ worker"] },
            { label: "Solver", items: ["CP-SAT, run asynchronously from a queue"] },
            { label: "Channels", items: ["Telegram bot (webhook and sign-in link)", "In-app inbox", "Email"] },
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
            "Trust comes from provenance. Showing the sheet and cell behind each imported entry did more for confidence than any summary.",
            "Ambiguity should be visible. A queue of names that need a decision is better than a silent best guess.",
            "Words are interface. Giving the bot one message grammar made it easier to read than any layout change would have.",
            "Ship the channel people already use. The bot reached staff long before an app could have.",
          ],
        },
      ],
    },
  ],
};
