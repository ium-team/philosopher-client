import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // Use polling-based file watching to avoid EMFILE/inotify issues in this environment.
  watchOptions: {
    pollIntervalMs: 1000,
  },
};

export default nextConfig;
