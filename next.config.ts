import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /*
   * cacheComponents ("use cache") is off on purpose: on Cloudflare Workers
   * its setTimeout-based rendering hangs and every request ends in a 500
   * (error 1101). Content caching lives in src/lib/content.ts instead.
   */
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
