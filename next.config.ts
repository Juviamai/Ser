import type { NextConfig } from "next";

/**
 * Dev/local (default): plain Next.js — http://localhost:3000
 * Static deploy (NEXT_STATIC=1): exports ./out for GitHub Pages at
 * https://juviamai.github.io/Ser/ — basePath must match the repo name.
 */
const nextConfig: NextConfig = {
  reactStrictMode: true,
  ...(process.env.NEXT_STATIC === "1"
    ? {
        output: "export" as const,
        basePath: "/Ser",
        trailingSlash: true, // GitHub Pages: /route/ dirs serve reliably; deep links 301
        images: { unoptimized: true },
      }
    : {}),
};

export default nextConfig;
