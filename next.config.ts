import type { NextConfig } from "next";

const withSerwist = require("@serwist/next").default({
  swSrc: "src/service-worker/index.ts",
  swDest: "public/sw.js",
  // disable: process.env.NODE_ENV !== "production",
});

const nextConfig: NextConfig = {
  experimental: {
    reactCompiler: true,
  },
};

export default withSerwist(nextConfig);
