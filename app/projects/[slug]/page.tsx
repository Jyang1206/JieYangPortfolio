import { notFound, permanentRedirect } from "next/navigation";
import { StoryPage } from "../../../components/project/StoryPage";
import { getStory } from "../../../components/project/stories";
import { getProjectBySlug, legacySlugs, nextProject, projects } from "../../../data/projects";
import { WorldStage } from "../../../components/worlds/WorldStage";
import { worlds } from "../../../data/worlds";

type ProjectPageProps = {
  params: Promise<{ slug: string }>;
};

export const dynamicParams = false;

export function generateStaticParams() {
  return [...projects.map((project) => project.slug), ...Object.keys(legacySlugs)].map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: ProjectPageProps) {
  const { slug } = await params;
  const project = getProjectBySlug(legacySlugs[slug] ?? slug);
  if (!project) return { title: "Project not found" };
  return {
    title: `${project.title}: ${project.subtitle} | Jie Yang`,
    description: project.shortDescription,
  };
}

export default async function ProjectPage({ params }: ProjectPageProps) {
  const { slug } = await params;
  if (legacySlugs[slug]) permanentRedirect(`/projects/${legacySlugs[slug]}`);

  const project = getProjectBySlug(slug);
  const story = getStory(slug);
  if (!project || !story) notFound();

  const worldIndex = worlds.findIndex((world) => world.id === project.worldId);
  return (
    <>
      {worldIndex >= 0 && <WorldStage worlds={worlds} index={worldIndex} />}
      <StoryPage story={story} project={project} next={nextProject(slug)} />
    </>
  );
}
