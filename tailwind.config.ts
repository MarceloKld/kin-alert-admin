import type { Config } from "tailwindcss";
import tailwindScrollbar from "tailwind-scrollbar";

const config: Config = {
  darkMode: "class",
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      keyframes: {
        'typewriter-kin': {
          '0%': { width: '0', opacity: '0' },
          '1%': { opacity: '1' },
          '50%, 100%': { width: '100%' }
        },
        'typewriter-mod': {
          '0%, 50%': { width: '0', opacity: '0' },
          '51%': { opacity: '1' },
          '100%': { width: '100%' }
        },
        'fade-in-up': {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' }
        },
        'pulse-slow': {
          '0%, 100%': { opacity: '1', transform: 'scale(1)' },
          '50%': { opacity: '0.8', transform: 'scale(1.05)' }
        },
        'bounce-slow': {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-5px)' }
        }

      },
      animation: {
        'typewriter-kin': 'typewriter-kin 2s steps(10) forwards',
        'typewriter-mod': 'typewriter-mod 2s steps(11) forwards',
        'fade-in-up': 'fade-in-up 0.8s ease-out forwards',
        'pulse-slow': 'pulse-slow 3s ease-in-out infinite',
        'bounce-slow': 'bounce-slow 2s ease-in-out infinite'
      
      },
    },
  },
  plugins: [tailwindScrollbar],
};

export default config;
