// Repository and website links per world. Private repositories are shown as such, without a link,
// so visitors never land on a GitHub 404. Checked with `gh repo view` on 7 Nov 2026.

export type ProjectLinks = {
  repo?: { url?: string; label: string; private?: boolean };
  site?: { url: string; label: string };
};

export const projectLinks: Record<string, ProjectLinks> = {
  iris: {
    repo: { label: "Private repository (team project with SNEC)", private: true },
  },
  tarii: {
    repo: { label: "Private company repository", private: true },
    site: { url: "https://tarii-time.com", label: "tarii-time.com" },
  },
  movel: {
    repo: { label: "Private company repository", private: true },
    site: { url: "https://www.movel.ai", label: "movel.ai" },
  },
  "st-engineering": {
    repo: { label: "Internal company code", private: true },
    site: { url: "https://www.stengg.com", label: "stengg.com" },
  },
  guitar: {
    repo: { url: "https://github.com/Jyang1206/Code-Chords", label: "Jyang1206/Code-Chords" },
    site: { url: "https://guitar-story.vercel.app/", label: "guitar-story.vercel.app" },
  },
  battlecode: {
    repo: { label: "Private team repository", private: true },
    site: { url: "https://2026a.battlecode.co.uk", label: "Cambridge Battlecode 2026" },
  },
};
