import type { Metadata } from "next";
import "./globals.css";

import Providers from "./providers";
import PWAInstallClient from "@/components/shared/PWAInstallClient";
import ToastProvider from "@/components/shared/ToastProvider";

export const metadata: Metadata = {
  title: "KIN ALERT - Admin",
  description: "Plateforme d'administration KIN ALERT",
  manifest: "/manifest.webmanifest",
  icons: {
    icon: "/icons/logo.png",
    shortcut: "/icons/logo.png",
    apple: "/icons/logo.png",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <body suppressHydrationWarning>
        <Providers>
          {children}
          {/* Le provider est placé ici, à la fin, pour être au-dessus de tout */}
          <ToastProvider />
          <PWAInstallClient />
        </Providers>
      </body>
    </html>
  );
}