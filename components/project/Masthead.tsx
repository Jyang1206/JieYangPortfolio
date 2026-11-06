import Image from "next/image";
import { ArrowUpRight, Lock } from "lucide-react";
import type { ProjectCategory } from "../../data/projects";
import type { ProjectLinks } from "../../data/links";
import type { Story } from "./types";

const CATEGORY_LABEL: Record<ProjectCategory, string> = {
  experience: "Professional experience",
  project: "Project",
  hackathon: "Hackathon",
};

type MastheadProps = { story: Story; category: ProjectCategory; links?: ProjectLinks };

export function Masthead({ story, category, links }: MastheadProps) {
  const { header, theme } = story;
  return (
    <header className="ps-mast">
      <Motif theme={theme} />
      <div className="ps-mast-top">
        <span className="ps-chip" data-cat={category}>
          {CATEGORY_LABEL[category]}
        </span>
        <p className="ps-meta" style={{ margin: 0 }}>
          <span>
            <b>{story.role}</b>
          </span>
          <span>{story.dates}</span>
          <span>{story.place}</span>
        </p>
      </div>
      <div className="ps-mast-grid">
        <div>
          <h1 className="ps-word">
            {theme === "tarii" ? (
              <Image src="/images/tarii/tarii-wordmark.png" alt="Tarii" width={356} height={181} priority />
            ) : (
              header.word
            )}
          </h1>
          <p className="ps-title">{header.title}</p>
          <p className="ps-lede">{header.lede}</p>
          {header.team && <p className="ps-team">{header.team}</p>}
          <StoryLinks links={links} />
        </div>
        {header.figure && (
          <figure className="ps-mast-figure">
            <div className="ps-mast-shot">
              <Image
              src={header.figure.src}
              alt={header.figure.alt}
              width={header.figure.width}
              height={header.figure.height}
              sizes="(max-width: 980px) 94vw, 560px"
              priority
            />
            </div>
            <figcaption>{header.figure.caption}</figcaption>
          </figure>
        )}
      </div>
      {theme === "guitar" && <GuitarNeck />}
    </header>
  );
}

function StoryLinks({ links }: { links?: ProjectLinks }) {
  if (!links || (!links.repo && !links.site)) return null;
  return (
    <p className="ps-links">
      {links.site && (
        <a href={links.site.url} target="_blank" rel="noreferrer">
          {links.site.label}
          <ArrowUpRight size={15} aria-hidden="true" />
        </a>
      )}
      {links.repo &&
        (links.repo.url ? (
          <a href={links.repo.url} target="_blank" rel="noreferrer">
            {links.repo.label}
            <ArrowUpRight size={15} aria-hidden="true" />
          </a>
        ) : (
          <span>
            <Lock size={14} aria-hidden="true" />
            {links.repo.label}
          </span>
        ))}
    </p>
  );
}

/** One decorative motif per world, drawn behind the masthead text. */
function Motif({ theme }: { theme: Story["theme"] }) {
  switch (theme) {
    case "iris":
      // Aperture: concentric rings and six blades, the poster's lens.
      return (
        <svg className="ps-motif" viewBox="0 0 520 520" aria-hidden="true">
          {[250, 205, 160, 118].map((r, i) => (
            <circle key={r} cx={260} cy={260} r={r} fill="none" stroke={i === 1 ? "#2b2fd4" : "#111"} strokeOpacity={i === 1 ? 0.5 : 0.14} strokeWidth={i === 1 ? 3 : 1.2} />
          ))}
          {Array.from({ length: 72 }, (_, i) => (
            <line key={`t${i}`} x1={260} y1={6} x2={260} y2={i % 6 === 0 ? 24 : 14} stroke="#111" strokeOpacity={0.3} strokeWidth={1} transform={`rotate(${i * 5} 260 260)`} />
          ))}
          {Array.from({ length: 6 }, (_, i) => (
            <path key={i} d="M260 142 L338 186 L304 250 Z" fill="#2b2fd4" fillOpacity={0.07} stroke="#2b2fd4" strokeOpacity={0.25} transform={`rotate(${i * 60} 260 260)`} />
          ))}
        </svg>
      );
    case "tarii":
      return (
        <svg className="ps-motif" viewBox="0 0 400 300" preserveAspectRatio="xMaxYMin slice" aria-hidden="true">
          {[
            [250, 20, 0.5],
            [330, 20, 0.3],
            [250, 100, 0.25],
            [330, 100, 0.55],
            [170, 20, 0.18],
            [330, 180, 0.2],
          ].map(([x, y, o]) => (
            <rect key={`${x}-${y}`} x={x} y={y} width={66} height={66} rx={14} fill="#a4c8ba" fillOpacity={o} />
          ))}
          <rect x={250} y={180} width={66} height={66} rx={14} fill="#e4b23c" fillOpacity={0.35} />
        </svg>
      );
    case "movel":
      // A route on the floor: cyan polyline with waypoints, the way a fleet map draws it.
      return (
        <svg className="ps-motif" viewBox="0 0 1200 600" preserveAspectRatio="none" aria-hidden="true">
          <path d="M-20 520 L240 520 L240 360 L620 360 L620 120 L1220 120" fill="none" stroke="#40c7ff" strokeOpacity={0.3} strokeWidth={3} strokeDasharray="14 10" vectorEffect="non-scaling-stroke" />
          {[
            [240, 520],
            [240, 360],
            [620, 360],
            [620, 120],
          ].map(([x, y]) => (
            <rect key={`${x}-${y}`} x={x - 7} y={y - 7} width={14} height={14} fill="#40c7ff" fillOpacity={0.4} />
          ))}
        </svg>
      );
    case "st":
      // Road at night: lane lines in perspective, tracked points with short flow vectors.
      return (
        <svg className="ps-motif" viewBox="0 0 1200 600" preserveAspectRatio="xMidYMax slice" aria-hidden="true">
          <path d="M520 600 L590 250 M680 600 L610 250" stroke="#ffa040" strokeOpacity={0.35} strokeWidth={2} />
          <path d="M600 600 L600 560 M600 520 L600 490 M600 455 L600 432 M600 402 L600 386" stroke="#ffa040" strokeOpacity={0.45} strokeWidth={3} />
          {Array.from({ length: 46 }, (_, i) => {
            const x = 420 + ((i * 97) % 380);
            const y = 290 + ((i * 53) % 300);
            const dy = 6 + (y - 280) * 0.06;
            const dx = (x - 600) * 0.03;
            return (
              <g key={i} opacity={0.75}>
                <line x1={x} y1={y} x2={x + dx} y2={y + dy} stroke="#8cf2c8" strokeWidth={1.4} />
                <circle cx={x} cy={y} r={2.4} fill="#8cf2c8" />
              </g>
            );
          })}
        </svg>
      );
    case "battlecode":
      // Champion tokens with team rings on the board: blue (us) against red, and a gold gem pile.
      return (
        <svg className="ps-motif" viewBox="0 0 1200 600" preserveAspectRatio="xMaxYMid slice" aria-hidden="true">
          {[
            [880, 120, "#4f8dff"],
            [960, 190, "#4f8dff"],
            [905, 260, "#4f8dff"],
            [1110, 150, "#e2504a"],
            [1150, 260, "#e2504a"],
            [1060, 330, "#e2504a"],
          ].map(([x, y, c]) => (
            <g key={`${x}-${y}`} opacity={0.6}>
              <circle cx={x as number} cy={y as number} r={24} fill="#101310" stroke={c as string} strokeWidth={5} />
              <circle cx={x as number} cy={y as number} r={10} fill={c as string} fillOpacity={0.5} />
            </g>
          ))}
          {[
            [1000, 420],
            [1026, 432],
            [1012, 452],
          ].map(([x, y]) => (
            <path key={`${x}-${y}`} d={`M${x} ${y - 10} L${x + 9} ${y} L${x} ${y + 10} L${x - 9} ${y} Z`} fill="#f2c14e" opacity={0.75} />
          ))}
        </svg>
      );
    default:
      return null;
  }
}

/** A guitar neck across the bottom of the stage, lit at the A minor pentatonic box (frets 5–8). */
function GuitarNeck() {
  const W = 1200;
  const nut = 30;
  const scale = 1900; // virtual scale length, so 12 frets fill the width
  const fretX = (n: number) => nut + scale * (1 - Math.pow(2, -n / 12));
  const strings = [0, 1, 2, 3, 4, 5].map((s) => 28 + s * 26);
  // Tab order, high e at the top: frets in the box for each string.
  const box: number[][] = [[5, 8], [5, 8], [5, 7], [5, 7], [5, 7], [5, 8]];
  const roots = new Set(["0-5", "5-5", "3-7"]);
  const mid = (f: number) => (fretX(f - 1) + fretX(f)) / 2;
  return (
    <svg className="ps-guitar-neck" viewBox={`0 0 ${W} 186`} aria-hidden="true">
      <rect x={0} y={14} width={W} height={158} fill="#4a2412" />
      <rect x={nut - 8} y={14} width={8} height={158} fill="#efe3cf" />
      {Array.from({ length: 13 }, (_, n) => n + 1).map((n) => (
        <rect key={n} x={fretX(n) - 1.5} y={14} width={3} height={158} fill="#b9a68a" />
      ))}
      {[3, 5, 7, 9].map((n) => (
        <circle key={n} cx={mid(n)} cy={93} r={7} fill="#efe3cf" fillOpacity={0.35} />
      ))}
      <circle cx={mid(12)} cy={67} r={7} fill="#efe3cf" fillOpacity={0.35} />
      <circle cx={mid(12)} cy={119} r={7} fill="#efe3cf" fillOpacity={0.35} />
      {strings.map((y, i) => (
        <line key={y} x1={0} x2={W} y1={y + 2} y2={y + 2} stroke="#d8c7a6" strokeWidth={0.9 + i * 0.35} />
      ))}
      {box.flatMap((frets, s) =>
        frets.map((f) => {
          const root = roots.has(`${s}-${f}`);
          return (
            <circle
              key={`${s}-${f}`}
              cx={mid(f)}
              cy={strings[s] + 2}
              r={10}
              fill={root ? "#e2553a" : "#ffb347"}
              stroke={root ? "#efe3cf" : "#2a130a"}
              strokeWidth={2.5}
            />
          );
        }),
      )}
    </svg>
  );
}
