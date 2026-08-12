"use client";

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
    const [open, setOpen] = useState(() => !standalone && ios);

    useEffect(() => {
        if (standalone) return;

        const handler = (e: Event) => {
            e.preventDefault();
            setDeferred(e as BeforeInstallPromptEvent);
            setOpen(true);
        };

        window.addEventListener("beforeinstallprompt", handler);
        window.addEventListener("appinstalled", () => {
            setOpen(false);
            setDeferred(null);
        });

        return () => window.removeEventListener("beforeinstallprompt", handler);
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
                    <img src="/icons/kin-alert-logo.svg" alt="Kin Alert" width={40} height={40} />

                    <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 700, fontSize: 14 }}>Installer Kin Alert</div>
                        <div style={{ opacity: 0.85, fontSize: 12, marginTop: 2 }}>
                            Accès rapide, plein écran, meilleure fluidité.
                        </div>

                        {ios && (
                            <div style={{ marginTop: 8, fontSize: 12, opacity: 0.9 }}>
                                iPhone/iPad : <b>Partager</b> → <b>Sur l’écran d’accueil</b>
                            </div>
                        )}
                    </div>

                    <button
                        onClick={() => setOpen(false)}
                        style={{
                            background: "transparent",
                            color: "white",
                            border: "1px solid rgba(255,255,255,.18)",
                            padding: "8px 10px",
                            borderRadius: 12,
                            cursor: "pointer",
                        }}
                    >
                        Plus tard
                    </button>

                    {!ios && deferred && (
                        <button
                            onClick={async () => {
                                await deferred.prompt();
                                const choice = await deferred.userChoice;
                                if (choice.outcome === "accepted") setOpen(false);
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