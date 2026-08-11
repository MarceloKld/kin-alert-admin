import type { NextConfig } from "next";

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import withPWAInit from "next-pwa";

const withPWA = withPWAInit({
  dest: "public",
  disable: process.env.NODE_ENV === "development",
  register: true,
  skipWaiting: true,
});

const nextConfig: NextConfig = {
  // Vos configurations d'origine restaurées :
  reactCompiler: true,
  allowedDevOrigins: ["192.168.1.91", "localhost"],
  
  // La configuration pour Vercel :
  turbopack: {},
  
  // On désactive l'avertissement ESLint pour cette ligne
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  webpack: (config: any) => {
    return config;
  },
};

// On désactive l'avertissement ESLint pour le cast final
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default (withPWA as any)(nextConfig);