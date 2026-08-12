"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";

type BeforeInstallPromptEvent = Event & {
    prompt: () => Promise<void>;
    userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

const STORAGE_KEY = "pwa:dismissed:v1";

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
    const [dismissed, setDismissed] = useState(() => {
        if (typeof window === "undefined") return false;
        return localStorage.getItem(STORAGE_KEY) === "1";
    });

    const [expanded, setExpanded] = useState(false);
    const [showHelp, setShowHelp] = useState(false);

    useEffect(() => {
        if (standalone) return;

        const onBeforeInstall = (e: Event) => {
            e.preventDefault();
            setDeferred(e as BeforeInstallPromptEvent);
            // optionnel: ouvrir automatiquement le panel dès que le prompt devient dispo
            // setExpanded(true);
        };

        const onInstalled = () => {
            localStorage.setItem(STORAGE_KEY, "1");
            setDismissed(true);
            setExpanded(false);
            setDeferred(null);
        };

        window.addEventListener("beforeinstallprompt", onBeforeInstall);
        window.addEventListener("appinstalled", onInstalled);

        return () => {
            window.removeEventListener("beforeinstallprompt", onBeforeInstall);
            window.removeEventListener("appinstalled", onInstalled);
        };
    }, [standalone]);

    if (standalone || dismissed) return null;

    const closeForever = () => {
        localStorage.setItem(STORAGE_KEY, "1");
        setDismissed(true);
        setExpanded(false);
    };

    const onInstall = async () => {
        // iOS: pas de prompt => afficher aide
        if (ios) {
            setExpanded(true);
            setShowHelp(true);
            return;
        }

        // Android/Chrome: si pas d'event => on ne peut pas forcer
        if (!deferred) {
            setExpanded(true);
            setShowHelp(true);
            return;
        }

        await deferred.prompt();
        const res = await deferred.userChoice;

        if (res.outcome === "accepted") {
            closeForever();
        } else {
            // s'il refuse, on garde le badge, et on montre l'aide
            setShowHelp(true);
        }
    };

    return (
        <div className="fixed bottom-4 left-4 z-50">
            {/* Badge style "Dev Overlay" */}
            <div className="flex items-center gap-2 rounded-full bg-red-500 px-2.5 py-1.5 text-white shadow-lg shadow-black/30">
                <button
                    type="button"
                    onClick={() => setExpanded((v) => !v)}
                    className="flex items-center gap-2 rounded-full px-1.5 py-0.5 text-xs font-semibold"
                    aria-expanded={expanded}
                >
                    <span className="grid size-6 place-items-center rounded-full bg-white/15">
                        <Image
                            src="/icons/kin-alert-logo.svg"
                            alt="Kin Alert"
                            width={16}
                            height={16}
                            unoptimized
                            priority
                        />
                    </span>

                    <span>Installer</span>

                    {/* Petit compteur comme "1 issue" */}
                    <span className="rounded-full bg-white/20 px-2 py-0.5 text-[11px]">
                        1
                    </span>
                </button>

                <button
                    type="button"
                    onClick={closeForever}
                    className="grid size-7 place-items-center rounded-full bg-white/15 text-sm leading-none text-white/90 hover:bg-white/25"
                    aria-label="Fermer"
                    title="Fermer"
                >
                    ×
                </button>
            </div>

            {/* Panel (comme quand tu cliques sur l'overlay) */}
            {expanded && (
                <div className="mt-3 w-[340px] max-w-[calc(100vw-2rem)] rounded-2xl border border-white/10 bg-slate-950/90 p-4 text-white backdrop-blur shadow-xl shadow-black/40">
                    <div className="flex items-start gap-3">
                        <Image
                            src="/icons/kin-alert-logo.svg"
                            alt="Kin Alert"
                            width={40}
                            height={40}
                            unoptimized
                        />

                        <div className="min-w-0 flex-1">
                            <div className="text-sm font-bold">Installer Kin Alert</div>
                            <div className="mt-1 text-xs text-white/75">
                                Accès rapide, plein écran, meilleure fluidité.
                            </div>

                            {(showHelp || !deferred || ios) && (
                                <div className="mt-2 text-[12px] text-white/85">
                                    {ios ? (
                                        <>
                                            iPhone/iPad : <b>Partager</b> → <b>Sur l’écran d’accueil</b>
                                        </>
                                    ) : (
                                        <>
                                            Android : menu <b>⋮</b> → <b>Installer l’application</b> / <b>Ajouter à l’écran d’accueil</b>
                                        </>
                                    )}
                                </div>
                            )}

                            {!ios && deferred && (
                                <div className="mt-2 text-[11px] text-emerald-300/90">
                                    Installation disponible sur cet appareil.
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="mt-3 flex gap-2">
                        <button
                            type="button"
                            onClick={onInstall}
                            className="flex-1 rounded-xl bg-gradient-to-r from-violet-600 to-cyan-400 px-3 py-2 text-xs font-bold text-white"
                        >
                            Installer
                        </button>

                        <button
                            type="button"
                            onClick={() => setExpanded(false)}
                            className="rounded-xl border border-white/15 px-3 py-2 text-xs text-white/90"
                        >
                            Plus tard
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}