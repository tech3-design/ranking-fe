import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  // Native addon; do not bundle into the Next.js server graph.
  serverExternalPackages: ["better-sqlite3"],
  // Compiled next.config can live under .cache, so __dirname is not the app root. Turbopack
  // must resolve `@import "tailwindcss"` from ranking-fe (where package.json + node_modules are).
  turbopack: {
    root: path.resolve(process.cwd()),
  },
};

export default nextConfig;
