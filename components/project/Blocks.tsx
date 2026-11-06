import Image from "next/image";
import { DIAGRAMS } from "./diagrams";
import type { Block, Figure } from "./types";

export const isNumbered = (block: Block) => block.kind === "figure" || block.kind === "diagram";

/** Figure numbers run through the whole story; `firstFigure` is this section's first number. */
export function Blocks({ blocks, firstFigure }: { blocks: Block[]; firstFigure: number }) {
  return (
    <>
      {blocks.map((block, i) => {
        const key = `${block.kind}-${i}`;
        const figNo = firstFigure + blocks.slice(0, i).filter(isNumbered).length;
        switch (block.kind) {
          case "p":
            return (
              <p key={key} className="ps-p">
                {block.text}
              </p>
            );
          case "h3":
            return (
              <h3 key={key} className="ps-h3">
                {block.text}
              </h3>
            );
          case "callout":
            return (
              <p key={key} className="ps-callout">
                {block.text}
              </p>
            );
          case "list": {
            const List = block.ordered ? "ol" : "ul";
            return (
              <List key={key} className="ps-list">
                {block.items.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </List>
            );
          }
          case "concepts":
            return (
              <div key={key} className="ps-concepts">
                <p className="ps-label">Concepts</p>
                <ul>
                  {block.items.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </div>
            );
          case "figure":
            return <FigureBlock key={key} figure={block.figure} n={figNo} />;
          case "phones":
            return (
              <div key={key} className="ps-phones">
                {block.figures.map((figure) => (
                  <figure key={figure.src}>
                    <div className="ps-figure-frame">
                      <Image src={figure.src} alt={figure.alt} width={figure.width} height={figure.height} sizes="(max-width: 640px) 30vw, 230px" />
                    </div>
                    <figcaption className="ps-figcaption">{figure.caption}</figcaption>
                  </figure>
                ))}
              </div>
            );
          case "stats":
            return (
              <div key={key} className="ps-results">
                <div className="ps-stats">
                  {block.items.map((stat) => (
                    <div key={stat.label} className="ps-stat">
                      <p className="ps-stat-value" style={{ margin: 0 }}>{stat.value}</p>
                      {stat.interval && <p className="ps-stat-interval" style={{ margin: 0 }}>{stat.interval}</p>}
                      <p className="ps-stat-label" style={{ margin: 0 }}>{stat.label}</p>
                      {stat.detail && <p className="ps-stat-detail" style={{ margin: 0 }}>{stat.detail}</p>}
                    </div>
                  ))}
                </div>
                {block.note && <p className="ps-results-note">{block.note}</p>}
              </div>
            );
          case "decisions":
            return (
              <ul key={key} className="ps-decisions">
                {block.items.map((d) => (
                  <li key={d.choice} className="ps-decision">
                    <div>
                      <div className="ps-decision-choice">{d.choice}</div>
                      {d.over && <div className="ps-decision-over">{d.over}</div>}
                    </div>
                    <dl>
                      <div>
                        <dt className="ps-label">Why</dt>
                        <dd>{d.why}</dd>
                      </div>
                      {d.cost && (
                        <div>
                          <dt className="ps-label">What it cost</dt>
                          <dd>{d.cost}</dd>
                        </div>
                      )}
                    </dl>
                  </li>
                ))}
              </ul>
            );
          case "steps":
            return (
              <ol key={key} className="ps-strip">
                {block.items.map((step, j) => (
                  <li key={step.title}>
                    <div className="ps-strip-n">{String(j + 1).padStart(2, "0")}</div>
                    <div className="ps-strip-title">{step.title}</div>
                    <div className="ps-strip-body">{step.body}</div>
                  </li>
                ))}
              </ol>
            );
          case "stack":
            return (
              <dl key={key} className="ps-stack">
                {block.groups.map((group) => (
                  <div key={group.label}>
                    <dt className="ps-label">{group.label}</dt>
                    <dd>{group.items.join(", ")}</dd>
                  </div>
                ))}
              </dl>
            );
          case "diagram": {
            const Diagram = DIAGRAMS[block.id];
            const n = figNo;
            return (
              <figure key={key} className="ps-diagram">
                <div className="ps-diagram-body">
                  <Diagram />
                </div>
                <figcaption>
                  <span className="ps-fig-no">Fig. {n}</span> {block.caption}
                </figcaption>
              </figure>
            );
          }
        }
      })}
    </>
  );
}

function FigureBlock({ figure, n }: { figure: Figure; n: number }) {
  return (
    <figure className="ps-figure">
      <div className="ps-figure-frame" data-frame={figure.frame ?? "photo"}>
        <Image src={figure.src} alt={figure.alt} width={figure.width} height={figure.height} sizes="(max-width: 980px) 94vw, 860px" />
      </div>
      <figcaption className="ps-figcaption">
        <span className="ps-fig-no">Fig. {n}</span>
        <span>{figure.caption}</span>
      </figcaption>
    </figure>
  );
}
