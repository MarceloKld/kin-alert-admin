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

    // ✅ plus de setState dans useEffect: on lit localStorage à l'init
    const [closed, setClosed] = useState(() => {
        if (typeof window === "undefined") return false;
        return localStorage.getItem("pwa:dismissed") === "1";
    });

    const [showHelp, setShowHelp] = useState(false);

    useEffect(() => {
        if (standalone) return;

        const handler = (e: Event) => {
            e.preventDefault();
            setDeferred(e as BeforeInstallPromptEvent);
        };

        const onInstalled = () => {
            localStorage.setItem("pwa:dismissed", "1");
            setClosed(true);
            setDeferred(null);
        };

        window.addEventListener("beforeinstallprompt", handler);
        window.addEventListener("appinstalled", onInstalled);

        return () => {
            window.removeEventListener("beforeinstallprompt", handler);
            window.removeEventListener("appinstalled", onInstalled);
        };
    }, [standalone]);

    if (standalone || closed) return null;

    const onInstall = async () => {
        if (ios) {
            setShowHelp(true);
            return;
        }
        if (!deferred) {
            setShowHelp(true);
            return;
        }
        await deferred.prompt();
        const res = await deferred.userChoice;
        if (res.outcome === "accepted") {
            localStorage.setItem("pwa:dismissed", "1");
            setClosed(true);
        }
    };

    return (
        <div className="fixed left-3 right-3 top-3 z-50">
            <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-slate-950/85 px-4 py-3 text-white backdrop-blur">
                <Image
                    src="/icons/kin-alert-logo.svg"
                    alt="Kin Alert"
                    width={36}
                    height={36}
                    unoptimized
                    priority
                    className="shrink-0"
                />

                <div className="min-w-0 flex-1">
                    <div className="truncate text-sm font-semibold">Installer Kin Alert</div>
                    <div className="truncate text-xs text-white/70">Ajouter l’app sur ton écran</div>

                    {showHelp && (
                        <div className="mt-1 text-[11px] text-white/80">
                            {ios ? (
                                <>
                                    iPhone/iPad : <b>Partager</b> → <b>Sur l’écran d’accueil</b>
                                </>
                            ) : (
                                <>
                                    Android : menu <b>⋮</b> → <b>Installer l’application</b>
                                </>
                            )}
                        </div>
                    )}
                </div>

                <button
                    onClick={() => {
                        localStorage.setItem("pwa:dismissed", "1");
                        setClosed(true);
                    }}
                    className="rounded-xl border border-white/15 px-3 py-2 text-xs text-white/90"
                >
                    Fermer
                </button>

                <button
                    onClick={onInstall}
                    className="rounded-xl bg-white px-3 py-2 text-xs font-bold text-slate-900"
                >
                    Installer
                </button>
            </div>
        </div>
    );
}