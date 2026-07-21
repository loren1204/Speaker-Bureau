import type { NextConfig } from "next"

const nextConfig: NextConfig = {
  // Allows verification builds to run alongside an active local dev server.
  distDir: process.env.NEXT_DIST_DIR || ".next",
  poweredByHeader: false,
  productionBrowserSourceMaps: false,
}

export default nextConfig
