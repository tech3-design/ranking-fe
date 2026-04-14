import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  // Compiled next.config can live under .cache, so __dirname is not the app root. Turbopack
  // must resolve `@import "tailwindcss"` from ranking-fe (where package.json + node_modules are).
  turbopack: {
    root: path.resolve(process.cwd()),
  },
};

export default nextConfig;
