declare module "next-pwa" {
  import { NextConfig } from "next";
  function withPWA(
    config: NextConfig,
  ): (phase: string, nextConfig: NextConfig) => NextConfig;
  export default withPWA;
}
