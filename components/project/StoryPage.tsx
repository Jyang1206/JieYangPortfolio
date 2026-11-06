import "./story.css";
import { existsSync } from "node:fs";
import path from "node:path";
import Link from "next/link";
import { ArrowLeft, ArrowUpRight } from "lucide-react";
import { projectLinks } from "../../data/links";
import type { Project } from "../../data/projects";
import { Blocks, isNumbered } from "./Blocks";
import { Masthead } from "./Masthead";
import { StoryContents } from "./StoryContents";
import type { Block, Story } from "./types";

type StoryPageProps = { story: Story; project: Project; next: Project };

/** Drop figures marked optional whose image is not in public/ (checked at build time). */
function present(blocks: Block[]) {
  return blocks.filter(
    (block) => block.kind !== "figure" || !block.figure.optional || existsSync(path.join(process.cwd(), "public", block.figure.src)),
  );
}

export function StoryPage({ story, project, next }: StoryPageProps) {
  const sections = story.sections.map((section) => ({ ...section, blocks: present(section.blocks) }));
  const firstFigure = sections.map((_, i) => 1 + sections.slice(0, i).flatMap((s) => s.blocks).filter(isNumbered).length);

  return (
    <main id="story" className="ps-root" data-theme={story.theme}>
      <nav className="ps-topbar" aria-label="Site">
        <Link href="/">
          <ArrowLeft size={16} aria-hidden="true" />
          All work
        </Link>
      </nav>

      <article className="ps-article">
        <Masthead story={story} category={project.category} links={projectLinks[story.worldId]} />

        <div className="ps-body">
          <div className="ps-main">
            {sections.map((section, i) => (
              <section key={section.id} id={section.id} className="ps-section" aria-labelledby={`${section.id}-h`}>
                <h2 id={`${section.id}-h`} className="ps-h2">
                  {section.title}
                </h2>
                <Blocks blocks={section.blocks} firstFigure={firstFigure[i]} />
              </section>
            ))}
          </div>

          <aside className="ps-margin" aria-label="About this work">
            <div className="ps-margin-inner">
              <StoryContents sections={sections.map(({ id, nav }) => ({ id, nav }))} />
              <dl className="ps-facts">
                {story.facts.map((fact) => (
                  <div key={fact.label}>
                    <dt className="ps-label">{fact.label}</dt>
                    <dd>{fact.value}</dd>
                  </div>
                ))}
              </dl>
            </div>
          </aside>
        </div>
      </article>

      <nav className="ps-next" aria-label="Next story">
        <Link href={`/projects/${next.slug}`} className="ps-next-link">
          <span className="ps-label">Next story</span>
          <span className="ps-next-name">
            {next.title}
            <ArrowUpRight size={44} strokeWidth={2.4} aria-hidden="true" />
          </span>
          <span className="ps-next-sub" style={{ display: "block" }}>
            {next.subtitle}
          </span>
        </Link>
        <div className="ps-next-side">
          <Link href="/#explore">Back to all work</Link>
          <Link href="/">All work</Link>
        </div>
      </nav>
    </main>
  );
}
