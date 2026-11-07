import Link from "next/link";
import { education } from "../../../data/profile";
import { projects } from "../../../data/projects";
import s from "./AtAGlance.module.css";

/** The thirty-second version for recruiters: experience and projects with dates, and education. */
export function AtAGlance() {
  // Most recent first.
  const order = ["tarii", "st-engineering", "movel", "battlecode", "iris", "guitar"];
  const sorted = [...projects].sort((a, b) => order.indexOf(a.worldId) - order.indexOf(b.worldId));
  const experience = sorted.filter((p) => p.category === "experience");
  const work = sorted.filter((p) => p.category !== "experience");
  const rows = (list: typeof projects) =>
    list.map((p) => (
      <li key={p.slug}>
        <Link href={`/projects/${p.slug}`} className={s.row}>
          <span className={s.name}>{p.title}</span>
          <span className={s.role}>{p.roleShort ?? p.role}</span>
          <span className={s.dates}>{p.dates}</span>
        </Link>
      </li>
    ));
  return (
    <section className={s.glance} aria-labelledby="glance-title">
      <h2 id="glance-title" className={s.title}>
        At a glance
      </h2>
      <div className={s.cols}>
        <div>
          <h3 className={s.h}>Experience</h3>
          <ul className={s.list}>{rows(experience)}</ul>
          <h3 className={s.h}>Projects</h3>
          <ul className={s.list}>{rows(work)}</ul>
        </div>
        <div>
          <h3 className={s.h}>Education</h3>
          <ul className={s.list}>
            {education.map((e) => (
              <li key={e.school} className={s.row}>
                <span className={s.name}>{e.school}</span>
                <span className={s.role}>{e.detail}</span>
                {e.dates && <span className={s.dates}>{e.dates}</span>}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
