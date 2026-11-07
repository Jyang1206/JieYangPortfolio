import { greeting, interests, skills, tagline } from "../../../data/profile";
import { ContactLinks } from "../../ContactLinks";
import { SkillTiles } from "./SkillTiles";

/** Who I am and what I work with: the greeting and tagline, three interests, and one animated tile per skill group. */
export function AboutSection() {
  return (
    <section id="about" className="nb-about nb-paper" aria-labelledby="about-title">
      <div className="nb-about-inner">
        <div className="nb-intro">
          <div>
            <p id="about-title" className="nb-hand nb-intro-greeting">
              {greeting}
            </p>
            <p className="nb-intro-tagline">{tagline}</p>
          </div>
          <ContactLinks tone="dark" />
        </div>

        <h2 className="nb-display nb-about-title">What I enjoy</h2>
        <div className="nb-about-interests">
          {interests.map((interest) => (
            <section key={interest.title} className="nb-note ruled">
              <h3 className="nb-about-h3">{interest.title}</h3>
              <p>{interest.body}</p>
            </section>
          ))}
        </div>

        <h2 className="nb-display nb-about-title nb-about-title-2">Skills</h2>
        <SkillTiles groups={skills} />
      </div>
    </section>
  );
}
