"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";

type BeforeInstallPromptEvent = Event & {
    prompt: () => Promise<void>;
    userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

function isIosUA() {
    if (typeof window === "undefined") return false;
    return /iphone|ipad|ipod/i.test(window.navigator.userAgent);
}

function isStandaloneMode() {
    if (typeof window === "undefined") return false;
    return (
        window.matchMedia?.("(display-mode: standalone)").matches ||
        // @ts-expect-error iOS legacy
        window.navigator.standalone === true
    );
}

export default function PWAInstall() {
    const ios = useMemo(() => isIosUA(), []);
    const standalone = useMemo(() => isStandaloneMode(), []);

    const [deferred, setDeferred] = useState<BeforeInstallPromptEvent | null>(null);
    const [open, setOpen] = useState(false);

    // 1) Ouvrir le banner après un délai (Android + iOS), même si beforeinstallprompt n'arrive pas
    useEffect(() => {
        if (standalone) return;

        const dismissed = localStorage.getItem("pwa:dismissed");
        if (dismissed === "1") return;

        const t = window.setTimeout(() => setOpen(true), 1500);
        return () => window.clearTimeout(t);
    }, [standalone]);

    // 2) Capturer beforeinstallprompt quand il arrive (Chrome/Edge Android/Desktop)
    useEffect(() => {
        if (standalone) return;

        const handler = (e: Event) => {
            e.preventDefault();
            setDeferred(e as BeforeInstallPromptEvent);
            setOpen(true);
        };

        const onInstalled = () => {
            setOpen(false);
            setDeferred(null);
            localStorage.setItem("pwa:dismissed", "1");
        };

        window.addEventListener("beforeinstallprompt", handler);
        window.addEventListener("appinstalled", onInstalled);

        return () => {
            window.removeEventListener("beforeinstallprompt", handler);
            window.removeEventListener("appinstalled", onInstalled);
        };
    }, [standalone]);

    if (!open || standalone) return null;

    return (
        <div style={{ position: "fixed", left: 16, right: 16, bottom: 16, zIndex: 50 }}>
            <div
                style={{
                    borderRadius: 16,
                    padding: 16,
                    background: "rgba(11,15,25,.92)",
                    color: "white",
                    border: "1px solid rgba(255,255,255,.12)",
                    backdropFilter: "blur(10px)",
                }}
            >
                <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                    <Image
                        src="/icons/kin-alert-logo.svg"
                        alt="Kin Alert"
                        width={40}
                        height={40}
                        priority
                        unoptimized
                    />

                    <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 700, fontSize: 14 }}>Installer Kin Alert</div>
                        <div style={{ opacity: 0.85, fontSize: 12, marginTop: 2 }}>
                            Accès rapide, plein écran, meilleure fluidité.
                        </div>

                        {ios ? (
                            <div style={{ marginTop: 8, fontSize: 12, opacity: 0.9 }}>
                                iPhone/iPad : <b>Partager</b> → <b>Sur l’écran d’accueil</b>
                            </div>
                        ) : deferred ? (
                            <div style={{ marginTop: 8, fontSize: 12, opacity: 0.9 }}>
                                Installation disponible sur cet appareil.
                            </div>
                        ) : (
                            <div style={{ marginTop: 8, fontSize: 12, opacity: 0.9 }}>
                                Android : menu <b>⋮</b> → <b>Installer l’application</b> / <b>Ajouter à l’écran d’accueil</b>
                            </div>
                        )}
                    </div>

                    <button
                        onClick={() => {
                            localStorage.setItem("pwa:dismissed", "1");
                            setOpen(false);
                        }}
                        style={{
                            background: "transparent",
                            color: "white",
                            border: "1px solid rgba(255,255,255,.18)",
                            padding: "8px 10px",
                            borderRadius: 12,
                            cursor: "pointer",
                        }}
                    >
                        Fermer
                    </button>

                    {!ios && deferred && (
                        <button
                            onClick={async () => {
                                await deferred.prompt();
                                const choice = await deferred.userChoice;
                                if (choice.outcome === "accepted") {
                                    setOpen(false);
                                    localStorage.setItem("pwa:dismissed", "1");
                                }
                            }}
                            style={{
                                background: "linear-gradient(135deg,#7C3AED,#22D3EE)",
                                color: "white",
                                border: "none",
                                padding: "8px 12px",
                                borderRadius: 12,
                                fontWeight: 700,
                                cursor: "pointer",
                            }}
                        >
                            Installer
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}