import type { NextConfig } from "next";
// @ts-ignore
import withPWAInit from "next-pwa";

const withPWA = withPWAInit({
  dest: "public",
  disable: process.env.NODE_ENV === "development",
  register: true,
  skipWaiting: true,
});

const nextConfig: NextConfig = {
  // Silence l'erreur Turbopack sur Vercel
  turbopack: {},
  
  // On type explicitement config avec 'any' pour retirer l'erreur TS
  webpack: (config: any) => {
    return config;
  },
};

// Le cast 'as any' corrige l'erreur de typage propre à next-pwa
export default (withPWA as any)(nextConfig);