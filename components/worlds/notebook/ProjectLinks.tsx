import { ArrowUpRight, Github, Globe, Lock } from "lucide-react";
import { projectLinks } from "../../../data/links";

type ProjectLinksProps = {
  worldId: string;
  /** "full" shows repo and site; "site" shows only the site (hub blurbs). */
  show?: "full" | "site";
  className?: string;
};

/** Repository and website for a world. Private repositories are named with a lock and never linked. */
export function ProjectLinks({ worldId, show = "full", className = "" }: ProjectLinksProps) {
  const links = projectLinks[worldId];
  if (!links) return null;
  const { repo, site } = links;
  return (
    <ul className={`nb-links ${className}`} aria-label="Links">
      {show === "full" && repo && (
        <li>
          {repo.url ? (
            <a href={repo.url} target="_blank" rel="noreferrer">
              <Github size={13} aria-hidden="true" />
              {repo.label}
              <ArrowUpRight size={11} aria-hidden="true" />
            </a>
          ) : (
            <span className="private">
              <Lock size={12} aria-hidden="true" />
              {repo.label}
            </span>
          )}
        </li>
      )}
      {site && (
        <li>
          <a href={site.url} target="_blank" rel="noreferrer">
            <Globe size={13} aria-hidden="true" />
            {site.label}
            <ArrowUpRight size={11} aria-hidden="true" />
          </a>
        </li>
      )}
    </ul>
  );
}
