import withPWAInit from "next-pwa";

const withPWA = withPWAInit({
  dest: "public",
  disable: process.env.NODE_ENV === "development", // Désactive en dev pour éviter le cache gênant
  register: true,
  skipWaiting: true,
});

import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
  allowedDevOrigins: ["192.168.1.91", "localhost"],
};

export default withPWA(nextConfig);
