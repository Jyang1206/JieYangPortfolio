"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { Mail, Menu, X } from "lucide-react";

type NotebookNavProps = {
  /**
   * "home": shown over the cover and the about section, hidden once the element with `hideBelow` reaches the top.
   * "world": shown at the top of the page and whenever the visitor scrolls up; hidden while scrolling down.
   */
  mode: "home" | "world";
  /** Home mode: id of the section after which the nav hides. */
  hideBelow?: string;
};

// Plain anchors, not next/link: a same-page hash change must fire `hashchange`, which the hub listens to.
const LINKS = [
  { hash: "about", label: "About" },
  { hash: "skills", label: "Skills" },
  { hash: "explore", label: "Experience & projects" },
  { hash: "contact", label: "Contact" },
];

/** Re-run the jump when the hash is already the one clicked (no hashchange fires then). */
function jumpAgain(event: React.MouseEvent<HTMLAnchorElement>, hash: string) {
  if (window.location.pathname !== "/" || window.location.hash !== `#${hash}`)
    return;
  event.preventDefault();
  const target =
    document.getElementById(hash) ?? document.getElementById("explore");
  target?.scrollIntoView({ behavior: "smooth", block: "start" });
}

/**
 * Home: the side nav lists the page's sections and marks the one in view; it fades while the page is still
 * and comes back on scroll or when the pointer nears the left edge. Phones get the same list in the menu.
 */
function SideNav() {
  const [active, setActive] = useState("about");
  const [awake, setAwake] = useState(true);
  // Kept out of the hero, where it would sit over the title; the top bar is enough there.
  const [past, setPast] = useState(false);
  useEffect(() => {
    // The section in view is the last one whose top has passed the upper part of the screen
    // (Skills sits inside About, so an intersection test would keep About marked).
    const mark = () => {
      let current = LINKS[0].hash;
      for (const link of LINKS) {
        const el = document.getElementById(link.hash);
        if (el && el.getBoundingClientRect().top <= window.innerHeight * 0.4) current = link.hash;
      }
      setActive(current);
    };
    let timer = 0;
    const wake = () => {
      mark();
      setPast(window.scrollY > window.innerHeight * 0.6);
      setAwake(true);
      window.clearTimeout(timer);
      timer = window.setTimeout(() => setAwake(false), 2200);
    };
    const near = (event: PointerEvent) => {
      if (event.clientX < 220) wake();
    };
    wake();
    window.addEventListener("scroll", wake, { passive: true });
    window.addEventListener("pointermove", near);
    return () => {
      window.clearTimeout(timer);
      window.removeEventListener("scroll", wake);
      window.removeEventListener("pointermove", near);
    };
  }, []);
  return (
    <nav
      className={`nb-side-nav ${awake ? "is-awake" : ""} ${past ? "" : "is-away"}`}
      aria-label="Sections"
    >
      {LINKS.map((link) => (
        <a
          key={link.hash}
          href={`/#${link.hash}`}
          aria-current={active === link.hash ? "true" : undefined}
          onClick={(event) => jumpAgain(event, link.hash)}
        >
          <span className="dot" aria-hidden="true" />
          <span className="label">{link.label}</span>
        </a>
      ))}
    </nav>
  );
}

/** The top bar: the name and the same sections as the side nav (a menu on phones); the home page adds the side nav. */
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
    <>
      {mode === "home" && <SideNav />}
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
          {open ? (
            <X size={16} aria-hidden="true" />
          ) : (
            <Menu size={16} aria-hidden="true" />
          )}
          <span className="sr-only">{open ? "Close menu" : "Open menu"}</span>
        </button>
        <nav
          id="nb-nav-menu"
          className={`nb-nav-menu nb-paper ${open ? "is-open" : ""}`}
          aria-label="Site"
        >
          {LINKS.filter((link) => link.hash !== "contact").map((link) => (
            <a
              key={link.hash}
              href={`/#${link.hash}`}
              className="nb-label"
              onClick={(event) => {
                setOpen(false);
                jumpAgain(event, link.hash);
              }}
            >
              {link.label}
            </a>
          ))}
          {/* A plain anchor on purpose: a same-page hash change must fire hashchange (see LINKS). */}
          {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
          <a
            href="/#contact"
            className="nb-btn nb-nav-contact"
            onClick={(event) => {
              setOpen(false);
              jumpAgain(event, "contact");
            }}
          >
            <Mail size={13} aria-hidden="true" />
            Contact
          </a>
        </nav>
      </header>
    </>
  );
}
