import { LandingHero } from "../components/home/LandingHero";
import { AboutScroller } from "../components/home/AboutScroller";
import { MjswanSimEmbed } from "../components/home/MjswanSimEmbed";
import { ProjectGalaxy } from "../components/home/ProjectGalaxy";
import { SystemsShowcase } from "../components/home/SystemsShowcase";
import { aboutPanels } from "../data/about";
import { homeIntro, projects } from "../data/projects";

export default function HomePage() {
  const workItems = [
    ...projects.filter((project) => project.category === "experience"),
    ...projects.filter((project) => project.category === "project"),
  ];

  return (
    <main className="min-h-screen bg-slate-50 text-slate-950">
      <LandingHero copy={homeIntro} featuredProject={workItems[0]} />
      <MjswanSimEmbed />
      <ProjectGalaxy projects={workItems} />
      <SystemsShowcase projects={workItems} />
      <AboutScroller panels={aboutPanels} />
      <footer id="contact" className="border-t border-slate-200 bg-white px-6 py-10">
        <div className="mx-auto flex max-w-6xl flex-col gap-4 text-sm text-slate-600 md:flex-row md:items-center md:justify-between">
          <p>Jie Yang · Robotics, automation, and human-centered systems</p>
          <a
            className="w-fit rounded-full border border-slate-300 bg-white px-4 py-2 text-slate-800 transition hover:border-sky-400 hover:text-sky-700 focus:outline-none focus:ring-2 focus:ring-sky-300"
            href="mailto:ngjyang@u.nus.edu"
          >
            Contact
          </a>
        </div>
      </footer>
    </main>
  );
}
