/* eslint-disable @typescript-eslint/no-explicit-any */
import type { NextConfig } from "next";

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import withPWAInit from "next-pwa";

const withPWA = withPWAInit({
  dest: "public",
  disable: process.env.NODE_ENV === "development",
  register: true,
  skipWaiting: true,
} as any);

const nextConfig: NextConfig = {
  reactCompiler: true,
  allowedDevOrigins: ["192.168.1.91", "localhost"],
  turbopack: {},
  
  webpack: (config: any) => {
    return config;
  },
};

export default (withPWA as any)(nextConfig);