"use client";

import { useId, useState, type CSSProperties, type ReactNode } from "react";
import type { SkillGroup } from "../../../data/profile";
import s from "./SkillTiles.module.css";

/* Each skill group is a tile: a looping illustration of the area at rest, the full list on hover,
   keyboard focus or tap. The list is always in the DOM, so screen readers get it without revealing. */

function LanguagesArt() {
  const lines = [
    [{ x: 34, w: 22, c: s.tokKey }, { x: 60, w: 46, c: s.tokText }, { x: 110, w: 18, c: s.tokAccent }],
    [{ x: 44, w: 30, c: s.tokText }, { x: 78, w: 54, c: s.tokAccent }],
    [{ x: 44, w: 18, c: s.tokKey }, { x: 66, w: 70, c: s.tokText }, { x: 140, w: 26, c: s.tokFaint }],
    [{ x: 54, w: 40, c: s.tokAccent }, { x: 98, w: 34, c: s.tokText }],
    [{ x: 44, w: 26, c: s.tokKey }, { x: 74, w: 42, c: s.tokText }],
    [{ x: 34, w: 12, c: s.tokFaint }],
  ];
  return (
    <svg viewBox="0 0 240 150" className={s.art} aria-hidden="true" focusable="false">
      <g className={s.tabs}>
        <rect x="10" y="10" width="220" height="16" className={s.chrome} />
        <text x="18" y="21.5" className={s.svgMono}>main.cpp</text>
        <text x="80" y="21.5" className={s.svgMono}>train.py</text>
        <text x="142" y="21.5" className={s.svgMono}>app.tsx</text>
        <rect x="14" y="24" width="50" height="2" className={`${s.fillAccent} ${s.tabMark}`} />
      </g>
      {lines.map((tokens, i) => (
        <g key={i}>
          <rect x="16" y={38 + i * 17} width="8" height="5" className={s.tokFaint} />
          {tokens.map((t, j) => (
            <rect
              key={j}
              x={t.x}
              y={37 + i * 17}
              width={t.w}
              height="7"
              rx="1"
              className={`${t.c} ${s.type}`}
              style={{ animationDelay: `${i * 0.45 + j * 0.15}s` }}
            />
          ))}
        </g>
      ))}
      <rect x="50" y="122" width="5" height="10" className={`${s.fillAccent} ${s.caret}`} />
    </svg>
  );
}

function RoboticsArt() {
  const points = [
    [150, 112], [176, 106], [204, 114], [162, 124], [192, 126], [218, 120], [170, 116], [208, 104],
  ];
  const clip = useId();
  return (
    <svg viewBox="0 0 240 150" className={s.art} aria-hidden="true" focusable="false">
      <clipPath id={clip}>
        <path d="M196 30 L140 132 L232 132 Z" />
      </clipPath>
      <line x1="10" y1="136" x2="230" y2="136" className={s.strokeFaint} />
      {/* camera and its view frustum */}
      <path d="M196 30 L140 132 L232 132 Z" className={s.frustum} />
      <rect x="186" y="18" width="22" height="14" rx="2" className={s.fillPaper} />
      <circle cx="197" cy="25" r="3.5" className={s.fillInk} />
      <g clipPath={`url(#${clip})`}>
        <rect x="140" y="36" width="92" height="2" className={`${s.fillAccent} ${s.scan}`} />
      </g>
      {points.map(([x, y], i) => (
        <g key={i} className={s.feature} style={{ animationDelay: `${i * 0.22}s` }}>
          <path d={`M${x - 3} ${y} H${x + 3} M${x} ${y - 3} V${y + 3}`} className={s.strokeAccent} />
        </g>
      ))}
      {/* arm: base, shoulder link, elbow link, gripper */}
      <rect x="34" y="124" width="44" height="12" className={s.fillPaper} />
      <g className={s.shoulder}>
        <rect x="50" y="76" width="12" height="52" rx="6" className={s.fillPaper} />
        <circle cx="56" cy="122" r="6" className={s.joint} />
        <g className={s.elbow}>
          <rect x="52" y="74" width="64" height="10" rx="5" className={s.fillPaperSoft} />
          <circle cx="56" cy="79" r="5" className={s.joint} />
          <g className={s.grip}>
            <path d="M114 72 h10 M114 86 h10" className={s.gripper} />
          </g>
        </g>
      </g>
    </svg>
  );
}

function AiArt() {
  const labels = ["scalpel 0.97", "forceps 0.94", "clamp 0.91"];
  return (
    <svg viewBox="0 0 240 150" className={s.art} aria-hidden="true" focusable="false">
      <circle cx="50" cy="88" r="17" className={s.shapeFill} />
      <path d="M120 70 L139 105 L101 105 Z" className={s.shapeFill} />
      <rect x="173" y="71" width="34" height="34" rx="6" className={s.shapeFill} />
      <g className={s.detect}>
        <path
          d="M26 72 v-8 h8 M66 64 h8 v8 M74 104 v8 h-8 M34 112 h-8 v-8"
          className={s.bracket}
        />
        <rect x="26" y="64" width="48" height="48" className={s.boxFill} />
        <rect x="26" y="50" width="72" height="13" className={s.fillAccent} />
        {labels.map((label, i) => (
          <text key={label} x="30" y="59.5" className={`${s.svgMonoInk} ${s[`label${i}`]}`}>
            {label}
          </text>
        ))}
      </g>
      <text x="14" y="138" className={s.svgMono}>
        seg / identity / contact
      </text>
      <rect x="150" y="133" width="76" height="4" className={s.fillChrome} />
      <rect x="150" y="133" width="76" height="4" className={`${s.fillAccent} ${s.conf}`} />
    </svg>
  );
}

function BackendArt() {
  const boxes = [
    { x: 10, y: 34, label: "client" },
    { x: 92, y: 34, label: "api" },
    { x: 174, y: 34, label: "queue" },
    { x: 92, y: 98, label: "db" },
    { x: 174, y: 98, label: "worker" },
  ];
  return (
    <svg viewBox="0 0 240 150" className={s.art} aria-hidden="true" focusable="false">
      <path d="M66 50 H92 M148 50 H174 M120 66 V98 M202 66 V98" className={s.wire} />
      {boxes.map((b, i) => (
        <g key={b.label}>
          <rect x={b.x} y={b.y} width="56" height="32" rx="3" className={s.service} />
          <circle cx={b.x + 48} cy={b.y + 8} r="2.5" className={`${s.fillAccent} ${s.led}`} style={{ animationDelay: `${i * 0.35}s` }} />
          <text x={b.x + 7} y={b.y + 21} className={s.svgMono}>
            {b.label}
          </text>
        </g>
      ))}
      <circle cx="68" cy="50" r="3.5" className={`${s.fillAccent} ${s.packetX}`} />
      <circle cx="150" cy="50" r="3.5" className={`${s.fillAccent} ${s.packetX}`} style={{ animationDelay: "0.6s" }} />
      <circle cx="120" cy="68" r="3.5" className={`${s.fillPaper} ${s.packetY}`} style={{ animationDelay: "0.9s" }} />
      <circle cx="202" cy="68" r="3.5" className={`${s.fillPaper} ${s.packetY}`} style={{ animationDelay: "1.5s" }} />
    </svg>
  );
}

function FrontendArt() {
  return (
    <svg viewBox="0 0 240 150" className={s.art} aria-hidden="true" focusable="false">
      <path d="M58 8 V142 M182 8 V142" className={`${s.guide} ${s.build0}`} />
      <rect x="62" y="16" width="116" height="122" rx="6" className={`${s.cardFrame} ${s.build0}`} />
      <rect x="70" y="24" width="100" height="44" rx="3" className={`${s.fillAccent} ${s.build1}`} />
      <path d="M78 60 l14 -16 l10 10 l8 -6 l14 12" className={`${s.imgLine} ${s.build1}`} />
      <rect x="70" y="76" width="66" height="8" rx="1" className={`${s.fillPaper} ${s.build2}`} />
      <rect x="70" y="90" width="92" height="4" rx="1" className={`${s.fillPaperSoft} ${s.build3}`} />
      <rect x="70" y="98" width="78" height="4" rx="1" className={`${s.fillPaperSoft} ${s.build3}`} />
      <rect x="70" y="112" width="42" height="16" rx="8" className={`${s.fillPaper} ${s.build4}`} />
      <rect x="118" y="112" width="30" height="16" rx="8" className={`${s.ghostBtn} ${s.build4}`} />
      <g className={s.pointer}>
        <path d="M0 0 L0 14 L4 10 L7 16 L9 15 L6 9 L11 9 Z" className={s.cursor} />
      </g>
    </svg>
  );
}

function ToolsArt() {
  return (
    <svg viewBox="0 0 240 150" className={s.art} aria-hidden="true" focusable="false">
      <rect x="10" y="10" width="220" height="16" className={s.chrome} />
      <circle cx="20" cy="18" r="3" className={s.fillPaperSoft} />
      <circle cx="30" cy="18" r="3" className={s.fillPaperSoft} />
      <circle cx="40" cy="18" r="3" className={s.fillAccent} />
      <text x="16" y="44" className={s.svgMonoLg}>
        <tspan className={s.promptSign}>$</tspan> git merge feature/sort
      </text>
      <rect x="28" y="34" width="160" height="14" className={`${s.fillInkPanel} ${s.typeCover}`} />
      <text x="16" y="60" className={`${s.svgMono} ${s.okLine}`}>
        ok  ctest 42/42 passed
      </text>
      <path d="M20 118 H222" className={s.mainLine} />
      <path d="M62 118 C78 118 78 92 96 92 H160 C178 92 178 118 194 118" pathLength={1} className={s.branchLine} />
      {[
        [34, 118, 0], [62, 118, 1], [110, 92, 2], [140, 92, 3], [124, 118, 2.5], [194, 118, 4], [214, 118, 4.6],
      ].map(([x, y, d]) => (
        <circle key={`${x}-${y}`} cx={x} cy={y} r="5" className={`${y === 92 ? s.commitBranch : s.commit} ${s.commitPop}`} style={{ animationDelay: `${d * 0.4}s` }} />
      ))}
    </svg>
  );
}

const ART: Record<string, () => ReactNode> = {
  Languages: LanguagesArt,
  Robotics: RoboticsArt,
  "AI and machine learning": AiArt,
  "Backend and systems": BackendArt,
  "Frontend and design": FrontendArt,
  Tools: ToolsArt,
};

function SkillTile({ group, index }: { group: SkillGroup; index: number }) {
  const [open, setOpen] = useState(false);
  const listId = useId();
  const Art = ART[group.label] ?? LanguagesArt;
  return (
    <li className={s.tile} data-open={open ? "true" : undefined}>
      <div className={s.head}>
        <span className={s.index}>{String(index + 1).padStart(2, "0")}</span>
        <h3 className={s.title}>
          <button
            type="button"
            className={s.trigger}
            aria-expanded={open}
            aria-controls={listId}
            onClick={() => setOpen((v) => !v)}
          >
            {group.label}
          </button>
        </h3>
        <span className={s.count}>
          {group.items.length} skills
          <span className={s.plus} aria-hidden="true" />
        </span>
      </div>
      <div className={s.stage}>
        <Art />
        <ul id={listId} className={s.reveal} aria-label={`${group.label} skills`}>
          {group.items.map((item, i) => (
            <li key={item} className={s.chip} style={{ "--i": i } as CSSProperties}>
              {item}
            </li>
          ))}
        </ul>
      </div>
    </li>
  );
}

export function SkillTiles({ groups }: { groups: SkillGroup[] }) {
  return (
    <ul className={s.grid} aria-label="Skills">
      {groups.map((group, i) => (
        <SkillTile key={group.label} group={group} index={i} />
      ))}
    </ul>
  );
}
