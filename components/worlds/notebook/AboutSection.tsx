import { interests, languages, skills } from "../../../data/profile";
import { AtAGlance } from "./AtAGlance";
import { SkillTiles } from "./SkillTiles";

/** What I have done and work with: the at-a-glance list, three interests and the skill tiles. The hero holds the intro and contact links. */
export function AboutSection() {
  return (
    <section id="about" className="nb-about nb-paper" aria-label="About">
      <div className="nb-about-inner">
        <AtAGlance />

        <h2 className="nb-display nb-about-title">What I enjoy</h2>
        <div className="nb-about-interests">
          {interests.map((interest) => (
            <section key={interest.title} className="nb-note ruled">
              <h3 className="nb-about-h3">{interest.title}</h3>
              <p>{interest.body}</p>
            </section>
          ))}
        </div>

        <h2 id="skills" className="nb-display nb-about-title nb-about-title-2">
          Skills
        </h2>
        <SkillTiles groups={skills} languages={languages} />
      </div>
    </section>
  );
}
