"use client";

import React from 'react';
import { AlertTriangle, Trash2, X, Loader2 } from 'lucide-react';

/* 
  ═══════════════════════════════════════════════════════════════
  🗑️ DELETE CONFIRM MODAL - Confirmation suppression
  ═══════════════════════════════════════════════════════════════
  Améliorations :
  - Glassmorphism moderne avec backdrop-blur
  - Animation d'entrée fluide (scale + fade)
  - Bouton fermeture (X) en haut à droite
  - États hover/disabled optimisés
  - Icône animée au chargement
  - Espacement grille 8px cohérent
  - Bordures et ombres subtiles
  ═══════════════════════════════════════════════════════════════
*/

interface Props {
    isOpen: boolean;
    userName: string;
    loading: boolean;
    onClose: () => void;
    onConfirm: () => void;
}

export const DeleteConfirmModal = ({ isOpen, userName, loading, onClose, onConfirm }: Props) => {
    // Ne rien rendre si la modale est fermée
    if (!isOpen) return null;

    return (
        /* 
          ═══════════════════════════════════════════════════════════
          🎭 OVERLAY - Fond sombre avec blur
          ═══════════════════════════════════════════════════════════
        */
        <div
            className="fixed inset-0 z-[9998] flex items-center justify-center p-4 
                       bg-black/80 backdrop-blur-md 
                       animate-in fade-in duration-200"
            onClick={onClose} // Fermeture au clic sur l'overlay
        >
            {/* 
              ═══════════════════════════════════════════════════════
              📦 CONTAINER MODAL
              ═══════════════════════════════════════════════════════
            */}
            <div
                className="relative bg-white/5 backdrop-blur-xl border border-red-500/30 
                           w-full max-w-md rounded-2xl overflow-hidden 
                           shadow-2xl shadow-red-900/20
                           animate-in zoom-in-95 duration-300"
                onClick={(e) => e.stopPropagation()} // Empêche la fermeture au clic interne
            >

                {/* 
                  ═══════════════════════════════════════════════════
                  ❌ BOUTON FERMETURE
                  ═══════════════════════════════════════════════════
                */}
                <button
                    onClick={onClose}
                    disabled={loading}
                    className="absolute top-4 right-4 p-2 
                               text-gray-400 hover:text-white hover:bg-white/10 
                               rounded-lg transition-all duration-200
                               disabled:opacity-50 disabled:cursor-not-allowed
                               z-10"
                    aria-label="Fermer"
                >
                    <X className="w-5 h-5" strokeWidth={2.5} />
                </button>

                {/* 
                  ═══════════════════════════════════════════════════
                  🎯 HEADER - Icône + Titre
                  ═══════════════════════════════════════════════════
                */}
                <div className="p-8 pb-6 flex flex-col items-center text-center space-y-4">
                    {/* Icône d'alerte avec animation pulse */}
                    <div className="relative">
                        <div className="w-20 h-20 rounded-2xl bg-red-500/10 border border-red-500/30 
                                      flex items-center justify-center">
                            <AlertTriangle className="w-10 h-10 text-red-500" strokeWidth={2.5} />
                        </div>
                        {/* Effet pulse animé */}
                        <div className="absolute inset-0 rounded-2xl bg-red-500/20 animate-ping opacity-75" />
                    </div>

                    {/* Titre + sous-titre */}
                    <div className="space-y-2">
                        <h2 className="text-2xl font-black text-white tracking-tight">
                            Confirmation requise
                        </h2>
                        <p className="text-xs text-red-400 font-bold uppercase tracking-widest">
                            Action Irréversible
                        </p>
                    </div>
                </div>

                {/* 
                  ═══════════════════════════════════════════════════
                  📝 CORPS - Message d'avertissement
                  ═══════════════════════════════════════════════════
                */}
                <div className="px-8 pb-6 text-center">
                    <p className="text-sm text-gray-300 leading-relaxed">
                        Voulez-vous vraiment supprimer le compte de{' '}
                        <span className="font-bold text-white bg-white/10 px-2 py-0.5 rounded">
                            {userName}
                        </span>
                        {' '}?
                    </p>
                    <p className="text-xs text-gray-400 mt-3">
                        Toutes les données associées seront définitivement effacées.
                    </p>
                </div>

                {/* 
                  ═══════════════════════════════════════════════════
                  🎬 FOOTER - Boutons d'action
                  ═══════════════════════════════════════════════════
                */}
                <div className="p-6 bg-white/5 border-t border-white/10 flex gap-3">
                    {/* Bouton Annuler */}
                    <button
                        onClick={onClose}
                        disabled={loading}
                        className="flex-1 py-3 px-4 
                                   bg-white/5 hover:bg-white/10 border border-white/10 
                                   text-white font-bold text-sm uppercase tracking-wide 
                                   rounded-xl transition-all duration-200
                                   disabled:opacity-50 disabled:cursor-not-allowed
                                   active:scale-95"
                    >
                        Annuler
                    </button>

                    {/* Bouton Supprimer */}
                    <button
                        onClick={onConfirm}
                        disabled={loading}
                        className="flex-1 py-3 px-4 
                                   bg-red-600 hover:bg-red-700 border border-red-600 
                                   text-white font-bold text-sm uppercase tracking-wide 
                                   rounded-xl transition-all duration-200
                                   disabled:opacity-70 disabled:cursor-not-allowed
                                   shadow-lg shadow-red-900/30 hover:shadow-red-900/50
                                   active:scale-95
                                   flex items-center justify-center gap-2"
                    >
                        {loading ? (
                            <>
                                <Loader2 className="w-4 h-4 animate-spin" strokeWidth={2.5} />
                                <span>Suppression...</span>
                            </>
                        ) : (
                            <>
                                <Trash2 className="w-4 h-4" strokeWidth={2.5} />
                                <span>Supprimer</span>
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default DeleteConfirmModal;