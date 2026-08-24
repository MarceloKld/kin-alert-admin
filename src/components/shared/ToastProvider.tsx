"use client";

import { Toaster } from "sonner";

export default function ToastProvider() {
    return (
        <Toaster
            theme="dark"
            position="top-right"
            // "toastOptions" permet de styliser le conteneur de base
            toastOptions={{
                style: {
                    background: "#141A28", // Ta couleur de carte
                    border: "1px solid #1E293B", // border-slate-800
                    color: "#FFFFFF",
                    borderRadius: "12px",
                    padding: "16px",
                },
                // On définit des styles spécifiques par type
                className: "group font-sans border-slate-800 shadow-2xl",
            }}
        // On peut personnaliser les icônes de chargement ou autres ici
        />
    );
}