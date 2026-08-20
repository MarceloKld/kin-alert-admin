"use client";

import React, { useState } from 'react';
import { X, UserPlus, Mail, Phone, Lock, Loader2, AlertCircle, Eye, EyeOff, Shield } from 'lucide-react';
import { UserService } from '@/services/user.service';
import { AxiosError } from 'axios';
import { ApiErrorResponse } from '@/types';

/* 
  ═══════════════════════════════════════════════════════════════
  ➕ CREATE MANAGER MODAL - Formulaire création staff
  ═══════════════════════════════════════════════════════════════
  Améliorations :
  - Glassmorphism moderne avec backdrop-blur
  - Animation d'entrée fluide (scale + fade)
  - Validation visuelle des champs
  - Indicateur de force du mot de passe
  - Messages d'erreur détaillés
  - États hover/focus optimisés
  - Espacement grille 8px cohérent
  - Feedback tactile sur les boutons
  ═══════════════════════════════════════════════════════════════
*/

interface Props {
    onClose: () => void;
    onSuccess: () => void;
}

export const CreateManagerModal = ({ onClose, onSuccess }: Props) => {
    const [loading, setLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);
    const [showPassword, setShowPassword] = useState(false);

    const [formData, setFormData] = useState({
        nom: '',
        email: '',
        telephone: '',
        password: ''
    });

    // Validation visuelle simple (optionnel)
    const isValidEmail = formData.email ? /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email) : true;
    const isValidPhone = formData.telephone ? /^\+?[0-9]{10,15}$/.test(formData.telephone) : true;
    const passwordStrength = formData.password.length >= 8 ? 'strong' : formData.password.length >= 6 ? 'medium' : 'weak';

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setErrorMsg(null);

        try {
            await UserService.createManager(formData);
            onSuccess();
            onClose();
        } catch (error) {
            const axiosError = error as AxiosError<ApiErrorResponse>;
            setErrorMsg(axiosError.response?.data?.message || "Erreur de validation.");
        } finally {
            setLoading(false);
        }
    };

    return (
        /* 
          ═══════════════════════════════════════════════════════════
          🎭 OVERLAY - Fond sombre avec blur
          ═══════════════════════════════════════════════════════════
        */
        <div
            className="fixed inset-0 z-[9997] flex items-center justify-center p-4 
                       bg-black/80 backdrop-blur-md 
                       animate-in fade-in duration-200"
            onClick={onClose}
        >
            {/* 
              ═══════════════════════════════════════════════════════
              📦 CONTAINER MODAL
              ═══════════════════════════════════════════════════════
            */}
            <div
                className="relative bg-white/5 backdrop-blur-xl border border-white/10 
                           w-full max-w-lg rounded-2xl overflow-hidden 
                           shadow-2xl
                           animate-in zoom-in-95 duration-300"
                onClick={(e) => e.stopPropagation()}
            >

                {/* 
                  ═══════════════════════════════════════════════════
                  🎯 HEADER - Titre + Bouton fermeture
                  ═══════════════════════════════════════════════════
                */}
                <div className="p-6 border-b border-white/10 flex items-center justify-between bg-white/5">
                    <div className="flex items-center gap-3">
                        {/* Badge icône */}
                        <div className="p-2 bg-red-600/20 rounded-xl border border-red-600/30">
                            <Shield className="w-5 h-5 text-red-500" strokeWidth={2.5} />
                        </div>
                        {/* Titre */}
                        <div>
                            <h2 className="text-xl font-black text-white tracking-tight">
                                Nouveau Staff
                            </h2>
                            <p className="text-xs text-gray-400 font-medium mt-0.5">
                                Créer un compte gestionnaire
                            </p>
                        </div>
                    </div>

                    {/* Bouton fermeture */}
                    <button
                        onClick={onClose}
                        disabled={loading}
                        className="p-2 text-gray-400 hover:text-white hover:bg-white/10 
                                   rounded-lg transition-all duration-200
                                   disabled:opacity-50 disabled:cursor-not-allowed"
                        aria-label="Fermer"
                    >
                        <X className="w-5 h-5" strokeWidth={2.5} />
                    </button>
                </div>

                {/* 
                  ═══════════════════════════════════════════════════
                  📝 FORMULAIRE
                  ═══════════════════════════════════════════════════
                */}
                <form onSubmit={handleSubmit} className="p-6 space-y-5">

                    {/* Message d'erreur global */}
                    {errorMsg && (
                        <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-xl 
                                      flex items-start gap-3 text-red-400 text-sm animate-in slide-in-from-top-2 duration-300">
                            <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" strokeWidth={2.5} />
                            <p className="font-medium">{errorMsg}</p>
                        </div>
                    )}

                    <div className="space-y-4">

                        {/* 
                          ═══════════════════════════════════════════════
                          👤 CHAMP NOM
                          ═══════════════════════════════════════════════
                        */}
                        <div className="relative group">
                            <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                                Nom complet
                            </label>
                            <UserPlus className="absolute left-4 top-[42px] w-4 h-4 text-gray-500 
                                                group-focus-within:text-red-500 transition-colors duration-200"
                                strokeWidth={2.5} />
                            <input
                                required
                                type="text"
                                placeholder="Ex: Marc Kapinga"
                                value={formData.nom}
                                className="w-full bg-white/5 border border-white/10 rounded-xl 
                                         py-3 pl-11 pr-4 text-sm text-white placeholder:text-gray-500
                                         focus:bg-white/[0.08] focus:border-red-500/50 focus:ring-2 focus:ring-red-500/20
                                         outline-none transition-all duration-200"
                                onChange={e => setFormData({ ...formData, nom: e.target.value })}
                            />
                        </div>

                        {/* 
                          ═══════════════════════════════════════════════
                          📧 CHAMP EMAIL
                          ═══════════════════════════════════════════════
                        */}
                        <div className="relative group">
                            <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                                Email
                            </label>
                            <Mail className="absolute left-4 top-[42px] w-4 h-4 text-gray-500 
                                           group-focus-within:text-red-500 transition-colors duration-200"
                                strokeWidth={2.5} />
                            <input
                                required
                                type="email"
                                placeholder="Ex: m.kapinga@alert.cd"
                                value={formData.email}
                                className={`w-full bg-white/5 border rounded-xl 
                                         py-3 pl-11 pr-4 text-sm text-white placeholder:text-gray-500
                                         focus:bg-white/[0.08] focus:border-red-500/50 focus:ring-2 focus:ring-red-500/20
                                         outline-none transition-all duration-200
                                         ${formData.email && !isValidEmail
                                        ? 'border-orange-500/50'
                                        : 'border-white/10'
                                    }`}
                                onChange={e => setFormData({ ...formData, email: e.target.value })}
                            />
                            {formData.email && !isValidEmail && (
                                <p className="text-xs text-orange-400 mt-1.5 ml-1">
                                    Format email invalide
                                </p>
                            )}
                        </div>

                        {/* 
                          ═══════════════════════════════════════════════
                          📞 CHAMP TÉLÉPHONE
                          ═══════════════════════════════════════════════
                        */}
                        <div className="relative group">
                            <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                                Téléphone
                            </label>
                            <Phone className="absolute left-4 top-[42px] w-4 h-4 text-gray-500 
                                            group-focus-within:text-red-500 transition-colors duration-200"
                                strokeWidth={2.5} />
                            <input
                                required
                                type="text"
                                placeholder="Ex: +243812345678"
                                value={formData.telephone}
                                className={`w-full bg-white/5 border rounded-xl 
                                         py-3 pl-11 pr-4 text-sm text-white placeholder:text-gray-500
                                         focus:bg-white/[0.08] focus:border-red-500/50 focus:ring-2 focus:ring-red-500/20
                                         outline-none transition-all duration-200
                                         ${formData.telephone && !isValidPhone
                                        ? 'border-orange-500/50'
                                        : 'border-white/10'
                                    }`}
                                onChange={e => setFormData({ ...formData, telephone: e.target.value })}
                            />
                            {formData.telephone && !isValidPhone && (
                                <p className="text-xs text-orange-400 mt-1.5 ml-1">
                                    Format téléphone invalide (10-15 chiffres)
                                </p>
                            )}
                        </div>

                        {/* 
                          ═══════════════════════════════════════════════
                          🔒 CHAMP MOT DE PASSE
                          ═══════════════════════════════════════════════
                        */}
                        <div className="relative group">
                            <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                                Mot de passe
                            </label>
                            <Lock className="absolute left-4 top-[42px] w-4 h-4 text-gray-500 
                                           group-focus-within:text-red-500 transition-colors duration-200"
                                strokeWidth={2.5} />
                            <input
                                required
                                type={showPassword ? "text" : "password"}
                                placeholder="Minimum 8 caractères"
                                value={formData.password}
                                className="w-full bg-white/5 border border-white/10 rounded-xl 
                                         py-3 pl-11 pr-11 text-sm text-white placeholder:text-gray-500
                                         focus:bg-white/[0.08] focus:border-red-500/50 focus:ring-2 focus:ring-red-500/20
                                         outline-none transition-all duration-200"
                                onChange={e => setFormData({ ...formData, password: e.target.value })}
                            />
                            {/* Bouton toggle visibilité */}
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-4 top-[42px] text-gray-500 hover:text-white 
                                         transition-colors duration-200"
                                tabIndex={-1}
                            >
                                {showPassword ?
                                    <EyeOff className="w-4 h-4" strokeWidth={2.5} /> :
                                    <Eye className="w-4 h-4" strokeWidth={2.5} />
                                }
                            </button>

                            {/* Indicateur force mot de passe */}
                            {formData.password && (
                                <div className="mt-2 space-y-1.5">
                                    <div className="flex gap-1">
                                        <div className={`h-1 flex-1 rounded-full transition-all duration-300 
                                            ${passwordStrength === 'weak' ? 'bg-red-500' :
                                                passwordStrength === 'medium' ? 'bg-orange-500' : 'bg-green-500'}`}
                                        />
                                        <div className={`h-1 flex-1 rounded-full transition-all duration-300 
                                            ${passwordStrength === 'medium' || passwordStrength === 'strong'
                                                ? passwordStrength === 'medium' ? 'bg-orange-500' : 'bg-green-500'
                                                : 'bg-white/10'}`}
                                        />
                                        <div className={`h-1 flex-1 rounded-full transition-all duration-300 
                                            ${passwordStrength === 'strong' ? 'bg-green-500' : 'bg-white/10'}`}
                                        />
                                    </div>
                                    <p className={`text-xs font-semibold ml-1
                                        ${passwordStrength === 'weak' ? 'text-red-400' :
                                            passwordStrength === 'medium' ? 'text-orange-400' : 'text-green-400'}`}>
                                        {passwordStrength === 'weak' ? 'Faible' :
                                            passwordStrength === 'medium' ? 'Moyen' : 'Fort'}
                                    </p>
                                </div>
                            )}
                        </div>

                    </div>

                    {/* 
                      ═══════════════════════════════════════════════
                      🎬 BOUTON SUBMIT
                      ═══════════════════════════════════════════════
                    */}
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-4 bg-red-600 hover:bg-red-700 
                                 disabled:bg-gray-700 disabled:cursor-not-allowed
                                 text-white font-bold text-sm uppercase tracking-wide
                                 rounded-xl transition-all duration-200
                                 shadow-lg shadow-red-900/30 hover:shadow-red-900/50
                                 active:scale-[0.98]
                                 flex items-center justify-center gap-2.5"
                    >
                        {loading ? (
                            <>
                                <Loader2 className="w-5 h-5 animate-spin" strokeWidth={2.5} />
                                <span>Création en cours...</span>
                            </>
                        ) : (
                            <>
                                <UserPlus className="w-5 h-5" strokeWidth={2.5} />
                                <span>Créer le compte gestionnaire</span>
                            </>
                        )}
                    </button>

                </form>
            </div>
        </div>
    );
};

export default CreateManagerModal;