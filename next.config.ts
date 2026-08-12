import type { NextConfig } from "next";
import withPWAInit from "@ducanh2912/next-pwa";
import type { Configuration } from "webpack";

const withPWA = withPWAInit({
  dest: "public",
  register: true,
  disable: process.env.NODE_ENV === "development",
});

const nextConfig: NextConfig = {
  reactCompiler: true,
  webpack: (config: Configuration) => config,
};

export default withPWA(nextConfig);