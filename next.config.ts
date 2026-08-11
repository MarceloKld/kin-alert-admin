import withPWAInit from 'next-pwa';

const withPWA = withPWAInit({
  dest: 'public',
  disable: process.env.NODE_ENV === 'development',
  register: true,
  skipWaiting: true,
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Cette option permet de dire à Next.js qu'on assume l'utilisation de Webpack
  webpack: (config) => {
    return config;
  },
  // On ajoute un objet turbopack vide pour éviter le conflit
  experimental: {
    // Si ta version de Next est très récente, utilise cette syntaxe
    turbopack: {},
  }
};

export default withPWA(nextConfig);