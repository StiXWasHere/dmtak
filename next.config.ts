import path from "path";
import type { NextConfig } from "next";
import withPWA from "next-pwa"; // default import

const pwaOptions = {
  dest: "public",
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === "development",
};

const nextConfig = {
  sassOptions: {
    includePaths: [path.join(__dirname, "app/styles")],
  },
  reactStrictMode: true, // optional but recommended
} as any;

export default withPWA(pwaOptions)(nextConfig);
