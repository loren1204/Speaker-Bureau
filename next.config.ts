import type { NextConfig } from "next"

const nextConfig: NextConfig = {
  // Allows verification builds to run alongside an active local dev server.
  distDir: process.env.NEXT_DIST_DIR || ".next",
}

export default nextConfig
