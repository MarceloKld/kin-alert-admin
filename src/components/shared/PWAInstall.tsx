"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Download, X, Smartphone } from "lucide-react";

export const PWAInstall = () => {
    const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        // On écoute l'événement d'installation du navigateur
        window.addEventListener("beforeinstallprompt", (e) => {
            e.preventDefault();
            setDeferredPrompt(e);
            // On affiche le message après 3 secondes pour ne pas agresser l'utilisateur
            setTimeout(() => setIsVisible(true), 3000);
        });
    }, []);

    const handleInstall = async () => {
        if (deferredPrompt) {
            deferredPrompt.prompt();
            const { outcome } = await deferredPrompt.userChoice;
            if (outcome === "accepted") {
                setDeferredPrompt(null);
                setIsVisible(false);
            }
        }
    };

    return (
        <AnimatePresence>
            {isVisible && (
                <motion.div
                    initial={{ y: 100, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: 100, opacity: 0 }}
                    className="fixed bottom-6 left-6 right-6 md:left-auto md:w-96 z-[100]"
                >
                    <div className="bg-slate-900 border border-slate-800 p-5 rounded-[2rem] shadow-2xl shadow-red-500/20 flex items-center gap-4">
                        <div className="bg-red-500 p-3 rounded-2xl text-white shadow-lg shadow-red-500/40">
                            <Smartphone size={24} />
                        </div>

                        <div className="flex-1">
                            <h4 className="text-white font-bold text-sm">KIN-ALERT sur mobile ?</h4>
                            <p className="text-slate-400 text-xs">Installez l'application pour un accès rapide.</p>
                        </div>

                        <div className="flex flex-col gap-2">
                            <button
                                onClick={handleInstall}
                                className="bg-white text-black px-4 py-2 rounded-xl text-xs font-bold hover:bg-red-500 hover:text-white transition-colors flex items-center gap-2"
                            >
                                <Download size={14} /> Installer
                            </button>
                            <button
                                onClick={() => setIsVisible(false)}
                                className="text-slate-500 text-[10px] uppercase font-bold text-center hover:text-white"
                            >
                                Plus tard
                            </button>
                        </div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};