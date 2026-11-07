import { ChooseYourJieYang } from "../components/about";
import { ContactLinks } from "../components/ContactLinks";
import { NotebookNav } from "../components/NotebookNav";
import { HomeStage } from "../components/worlds/HomeStage";
import { AboutSection } from "../components/worlds/notebook/AboutSection";
import { worlds } from "../data/worlds";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-ink">
      <NotebookNav mode="home" hideBelow="explore" />
      <ChooseYourJieYang />
      <AboutSection />
      <HomeStage worlds={worlds} />

      <footer id="contact" className="nb-cover nb-paper nb-back">
        <div className="nb-cover-corners">
          <p className="nb-label">
            <b>Let&rsquo;s talk</b>
          </p>
          <p className="nb-label right">
            Jie Yang, NUS Computer Science
            <br />
            Singapore
          </p>
        </div>
        <div className="nb-back-main">
          <h2 className="nb-display nb-back-title">Write to me.</h2>
          <p className="nb-back-note">Email is the fastest way to reach me. My resume, LinkedIn and GitHub are here too.</p>
          <ContactLinks tone="dark" className="nb-back-links" />
        </div>
        <div className="nb-cover-foot">
          <span className="nb-mono">Jie Yang, 2026</span>
          <span className="nb-mono">press 1&ndash;6 to jump to a place</span>
        </div>
      </footer>
    </main>
  );
}
