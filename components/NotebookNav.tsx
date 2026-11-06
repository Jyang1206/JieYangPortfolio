"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { Mail, Menu, X } from "lucide-react";
import { contact } from "../data/contact";

type NotebookNavProps = {
  /**
   * "home": shown over the cover and the about section, hidden once the element with `hideBelow` reaches the top.
   * "world": shown at the top of the page and whenever the visitor scrolls up; hidden while scrolling down.
   */
  mode: "home" | "world";
  /** Home mode: id of the section after which the nav hides. */
  hideBelow?: string;
};

const LINKS = [
  { href: "/#hello", label: "About" },
  { href: "/#experience", label: "Experience" },
  { href: "/#projects", label: "Projects" },
];

/** The notebook's top bar: four links on a paper strip. It steps aside while a world is being read. */
export function NotebookNav({ mode, hideBelow }: NotebookNavProps) {
  const [hidden, setHidden] = useState(false);
  const [open, setOpen] = useState(false);
  const lastY = useRef(0);

  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY;
      if (mode === "home") {
        const el = hideBelow ? document.getElementById(hideBelow) : null;
        const top = el ? el.getBoundingClientRect().top : Infinity;
        setHidden(top < window.innerHeight * 0.5);
      } else {
        const down = y > lastY.current + 4;
        const up = y < lastY.current - 4;
        if (y < 80) setHidden(false);
        else if (down) setHidden(true);
        else if (up) setHidden(false);
      }
      lastY.current = y;
      if (open) setOpen(false);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [mode, hideBelow, open]);

  return (
    <header className={`nb-nav ${hidden && !open ? "is-hidden" : ""}`}>
      <Link href="/" className="nb-nav-brand nb-paper">
        <span className="nb-label">Jie Yang</span>
      </Link>
      <button
        type="button"
        className="nb-nav-toggle nb-paper"
        aria-expanded={open}
        aria-controls="nb-nav-menu"
        onClick={() => setOpen((v) => !v)}
      >
        {open ? <X size={16} aria-hidden="true" /> : <Menu size={16} aria-hidden="true" />}
        <span className="sr-only">{open ? "Close menu" : "Open menu"}</span>
      </button>
      <nav id="nb-nav-menu" className={`nb-nav-menu nb-paper ${open ? "is-open" : ""}`} aria-label="Site">
        {LINKS.map((link) => (
          <Link key={link.href} href={link.href} className="nb-label" onClick={() => setOpen(false)}>
            {link.label}
          </Link>
        ))}
        <a href={`mailto:${contact.email}`} className="nb-btn nb-nav-contact">
          <Mail size={13} aria-hidden="true" />
          Contact
        </a>
      </nav>
    </header>
  );
}
