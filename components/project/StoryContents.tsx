"use client";

import { useEffect, useState } from "react";

/** Section list in the margin; marks the section currently in the middle of the viewport. */
export function StoryContents({ sections }: { sections: { id: string; nav: string }[] }) {
  const [active, setActive] = useState(sections[0]?.id);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) if (entry.isIntersecting) setActive(entry.target.id);
      },
      { rootMargin: "-40% 0px -55% 0px" },
    );
    for (const { id } of sections) {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    }
    return () => observer.disconnect();
  }, [sections]);

  return (
    <nav className="ps-contents" aria-label="Sections">
      <span className="ps-label">In this story</span>
      <ol>
        {sections.map((s) => (
          <li key={s.id}>
            <a href={`#${s.id}`} aria-current={active === s.id ? "true" : undefined}>
              {s.nav}
            </a>
          </li>
        ))}
      </ol>
    </nav>
  );
}
