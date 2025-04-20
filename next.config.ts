import type { NextConfig } from "next"

const nextConfig: NextConfig = {
  images: {
    domains: ["images.unsplash.com"],
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  experimental: {
    webpackBuildWorker: true,
    parallelServerBuildTraces: true,
    parallelServerCompiles: true,
  },
  // Add this to help with potential transpilation issues
  transpilePackages: [],
  // Ensure we're using the correct React version
  reactStrictMode: true,
}

export default nextConfig
