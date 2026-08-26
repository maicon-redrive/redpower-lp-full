import type { NextConfig } from "next";

const isDocker = process.env.DOCKER_BUILD === "true";

const nextConfig: NextConfig = {
  ...(isDocker && { output: "standalone", distDir: "build" }),
};

export default nextConfig;
