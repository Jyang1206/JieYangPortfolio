import type { Project } from "../../data/projects";

/** A company's logo on a small white tile, so it reads on paper and on dark worlds alike. */
export function CompanyLogo({ logo, size = 28, className = "" }: { logo: NonNullable<Project["logo"]>; size?: number; className?: string }) {
  return (
    <span className={`nb-logo ${logo.wide ? "is-wide" : ""} ${className}`} style={{ height: size }}>
      {/* eslint-disable-next-line @next/next/no-img-element -- small static logos at a fixed height. */}
      <img src={logo.src} alt={logo.alt} />
    </span>
  );
}
