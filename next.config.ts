import path from "node:path";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  outputFileTracingRoot: path.join(__dirname),
  experimental: {
    // Keep visited route segments in the client Router Cache so revisiting
    // dashboard ↔ tasks serves the (data-free) shell instantly instead of
    // re-fetching it. Live task data comes from the shared client store.
    staleTimes: {
      dynamic: 180,
      static: 300,
    },
  },
};

export default nextConfig;
