import path from "path";
import type { NextConfig } from "next";
import withPWA from "next-pwa";

const pwaOptions = {
  dest: "public",
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === "development",
  // Disable PWA from caching API routes to prevent Firestore connection issues
  runtimeCaching: [
    {
      urlPattern: /^https:\/\/firestore\.googleapis\.com\/.*/i,
      handler: "NetworkOnly" as const,
    },
  ],
};

const nextConfig = {
  sassOptions: {
    includePaths: [path.join(__dirname, "app/styles")],
  },
  reactStrictMode: true,
} as any;

export default withPWA(pwaOptions)(nextConfig);
