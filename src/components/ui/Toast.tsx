"use client";

import React, { useEffect } from 'react';
import { CheckCircle, XCircle, Loader2, X, Info } from 'lucide-react';

/* 
  ═══════════════════════════════════════════════════════════════
  🔔 TOAST NOTIFICATION - Feedback utilisateur
  ═══════════════════════════════════════════════════════════════
  Améliorations :
  - Glassmorphism moderne
  - Type 'info' ajouté
  - Auto-dismiss optimisé
  - Barre de progression
  - Animations fluides
  - Responsive mobile/desktop
  - Bouton close amélioré
  ═══════════════════════════════════════════════════════════════
*/

export type ToastType = 'success' | 'error' | 'loading' | 'info';

interface ToastProps {
    message: string;
    type: ToastType;
    onClose: () => void;
}

export const Toast = ({ message, type, onClose }: ToastProps) => {
    // Auto-dismiss (sauf pour loading)
    useEffect(() => {
        if (type !== 'loading') {
            const duration = type === 'error' ? 5000 : 3000;
            const timer = setTimeout(onClose, duration);
            return () => clearTimeout(timer);
        }
    }, [type, onClose]);

    // Configuration par type
    const configs = {
        loading: {
            icon: <Loader2 className="w-5 h-5 animate-spin" strokeWidth={2.5} />,
            color: 'text-blue-400',
            bgGradient: 'from-blue-600/20 to-blue-800/20',
            border: 'border-blue-500/30',
            progress: 'bg-blue-500'
        },
        success: {
            icon: <CheckCircle className="w-5 h-5" strokeWidth={2.5} />,
            color: 'text-green-400',
            bgGradient: 'from-green-600/20 to-green-800/20',
            border: 'border-green-500/30',
            progress: 'bg-green-500'
        },
        error: {
            icon: <XCircle className="w-5 h-5" strokeWidth={2.5} />,
            color: 'text-red-400',
            bgGradient: 'from-red-600/20 to-red-800/20',
            border: 'border-red-500/30',
            progress: 'bg-red-500'
        },
        info: {
            icon: <Info className="w-5 h-5" strokeWidth={2.5} />,
            color: 'text-purple-400',
            bgGradient: 'from-purple-600/20 to-purple-800/20',
            border: 'border-purple-500/30',
            progress: 'bg-purple-500'
        }
    };

    const config = configs[type];

    return (
        <div
            className="fixed bottom-4 right-4 sm:bottom-8 sm:right-8 z-[9999] 
                 max-w-[calc(100vw-2rem)] sm:max-w-md
                 animate-in slide-in-from-right-5 fade-in duration-300"
            role="alert"
            aria-live="polite"
        >
            {/* Container principal */}
            <div className={`
        relative overflow-hidden
        bg-white/5 backdrop-blur-xl 
        border ${config.border}
        rounded-xl
        shadow-2xl shadow-black/20
        flex items-center gap-3 sm:gap-4 
        px-4 sm:px-5 py-3.5 sm:py-4
      `}>

                {/* Gradient accent background */}
                <div className={`
          absolute inset-0 -z-10 opacity-50
          bg-gradient-to-br ${config.bgGradient}
        `} />

                {/* Icône */}
                <div className={`flex-shrink-0 ${config.color}`}>
                    {config.icon}
                </div>

                {/* Message */}
                <p className="flex-1 text-xs sm:text-sm font-semibold text-white tracking-wide leading-relaxed">
                    {message}
                </p>

                {/* Bouton close (sauf loading) */}
                {type !== 'loading' && (
                    <button
                        onClick={onClose}
                        className="flex-shrink-0 p-1.5 
                     text-gray-400 hover:text-white 
                     hover:bg-white/10 rounded-lg
                     transition-all duration-200
                     active:scale-95"
                        aria-label="Fermer"
                    >
                        <X className="w-4 h-4" strokeWidth={2.5} />
                    </button>
                )}

                {/* Barre de progression (sauf loading) */}
                {type !== 'loading' && (
                    <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/5 overflow-hidden">
                        <div
                            className={`h-full ${config.progress} animate-[shrink_${type === 'error' ? '5000' : '3000'}ms_linear_forwards]`}
                            style={{
                                animation: `shrink ${type === 'error' ? '5000' : '3000'}ms linear forwards`
                            }}
                        />
                    </div>
                )}

            </div>
        </div>
    );
};

// Ajout de l'animation shrink dans globals.css ou dans un <style> tag
// @keyframes shrink {
//   from { width: 100%; }
//   to { width: 0%; }
// }