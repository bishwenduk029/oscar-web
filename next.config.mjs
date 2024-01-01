// import { withContentlayer } from "next-contentlayer"

import "./env.mjs"

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ["avatars.githubusercontent.com"],
  },
  experimental: {
    appDir: true,
    serverComponentsExternalPackages: [
      "@prisma/client",
      "@react-email/components",
      "@react-email/render",
      "@react-email/html",
      "@react-email/tailwind",
      "resend",
    ],
  },
  transpilePackages: [
    "@react-email/components",
    "@react-email/render",
    "@react-email/html",
  ],
}

export default nextConfig
