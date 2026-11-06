import { aiSummary, greeting, interests, skills, tagline } from "../../../data/profile";
import { ContactLinks } from "../../ContactLinks";

/** Who I am and what I work with: the greeting and tagline, three interests, one card per skill group, and the AI work I have done. */
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
        <ul className="nb-skills" aria-label="Skills">
          {skills.map((group, i) => (
            <li key={group.label} className="nb-card" style={{ transform: `rotate(${((i % 3) - 1) * 0.5}deg)` }}>
              <h3 className="nb-card-title">{group.label}</h3>
              <p className="nb-skill-items">{group.items.join(", ")}</p>
            </li>
          ))}
        </ul>

        <section className="nb-note nb-ai" aria-labelledby="ai-title">
          <h3 id="ai-title" className="nb-about-h3">
            Work with AI models
          </h3>
          <p>{aiSummary}</p>
        </section>
      </div>
    </section>
  );
}
