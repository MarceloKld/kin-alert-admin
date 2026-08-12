import type { Metadata } from "next";
import "./globals.css";

import Providers from "./providers";
import PWAInstallClient from "@/components/shared/PWAInstallClient";

export const metadata: Metadata = {
  title: "KIN ALERT - Admin",
  description: "Plateforme d'administration KIN ALERT",
  manifest: "/manifest.webmanifest",
  icons: {
    icon: "/icons/icon-192.png",
    shortcut: "/icons/icon-192.png",
    apple: "/icons/icon-192.png",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <body>
        <Providers>
          {children}
          <PWAInstallClient />
        </Providers>
      </body>
    </html>
  );
}