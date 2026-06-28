import nextVitals from "eslint-config-next/core-web-vitals";
import nextTypescript from "eslint-config-next/typescript";

const eslintConfig = [
  ...nextVitals,
  ...nextTypescript,
  {
    ignores: ["PortfolioWebsite/**", ".next/**", "next-env.d.ts", "public/seer/assets/**"],
  },
];

export default eslintConfig;
