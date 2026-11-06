import { ArrowUpRight, Download, Mail } from "lucide-react";
import { contact } from "../data/contact";

type ContactLinksProps = {
  /** "dark" sits on paper (ink buttons); "light" sits on the desk (paper buttons). */
  tone?: "light" | "dark";
  className?: string;
};

/** Email first, then resume, LinkedIn and GitHub, as notebook buttons. */
export function ContactLinks({ tone = "dark", className = "" }: ContactLinksProps) {
  const solid = tone === "dark" ? "nb-btn" : "nb-btn nb-btn-light";
  const plain = tone === "dark" ? "nb-btn-ghost" : "nb-btn-ghost nb-btn-light";

  return (
    <ul className={`nb-contact ${className}`} aria-label="Contact">
      <li>
        <a href={`mailto:${contact.email}`} className={solid}>
          <Mail size={14} aria-hidden="true" />
          Email me
        </a>
      </li>
      <li>
        <a href={contact.resume} target="_blank" rel="noreferrer" className={plain}>
          <Download size={14} aria-hidden="true" />
          Resume (PDF)
        </a>
      </li>
      <li>
        <a href={contact.linkedin} target="_blank" rel="noreferrer" className={plain}>
          LinkedIn
          <ArrowUpRight size={13} aria-hidden="true" />
        </a>
      </li>
      <li>
        <a href={contact.github} target="_blank" rel="noreferrer" className={plain}>
          GitHub
          <ArrowUpRight size={13} aria-hidden="true" />
        </a>
      </li>
    </ul>
  );
}
