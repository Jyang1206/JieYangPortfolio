import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  devIndicators: false,
  async redirects() {
    const slugs: Record<string, string> = {
      iris: "iris",
      tarii: "tarii",
      movel: "seer-fleet-management",
      "st-engineering": "st-engineering-bev-motion",
      guitar: "guitar-scale-visualizer",
      battlecode: "battlecode",
    };
    return Object.entries(slugs).map(([id, slug]) => ({ source: `/w/${id}`, destination: `/projects/${slug}`, permanent: true }));
  },
};

export default nextConfig;
