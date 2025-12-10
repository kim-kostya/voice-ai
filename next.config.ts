import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    reactCompiler: true,
  },
  serverExternalPackages: ["esbuild-wasm"],
  reactStrictMode: true,
};

export default nextConfig;
