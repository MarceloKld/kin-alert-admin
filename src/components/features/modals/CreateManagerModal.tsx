"use client";
import React, { useState } from 'react';
import { X, UserPlus, Mail, Phone, Lock, Loader2, AlertCircle, Eye, EyeOff } from 'lucide-react';
import { UserService } from '@/services/user.service';
import { AxiosError } from 'axios';
import { ApiErrorResponse } from '@/types';

interface Props {
    onClose: () => void;
    onSuccess: () => void;
}

export const CreateManagerModal = ({ onClose, onSuccess }: Props) => {
    const [loading, setLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);
    const [showPassword, setShowPassword] = useState(false); // Pour afficher/cacher le MDP

    const [formData, setFormData] = useState({
        nom: '',
        email: '',
        telephone: '',
        password: '' // Remplacement de mot_de_passe par password
    });

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
            // Affiche l'erreur précise du validateur Laravel
            setErrorMsg(axiosError.response?.data?.message || "Erreur de validation.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-black/95 backdrop-blur-xl animate-in fade-in duration-300">
            <div className="bg-[#0b0c10] border border-white/10 w-full max-w-md rounded-[2.5rem] overflow-hidden shadow-2xl">

                {/* Header */}
                <div className="p-8 border-b border-white/5 flex justify-between items-center bg-white/[0.02]">
                    <h2 className="text-xl font-black text-white uppercase italic tracking-widest">Nouveau Staff</h2>
                    <button onClick={onClose} className="text-gray-500 hover:text-white transition-colors"><X size={24} /></button>
                </div>

                <form onSubmit={handleSubmit} className="p-8 space-y-6 text-white">
                    {errorMsg && (
                        <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-center gap-3 text-red-500 text-xs font-bold">
                            <AlertCircle size={16} /> {errorMsg}
                        </div>
                    )}

                    <div className="space-y-4">
                        {/* Champ Nom */}
                        <div className="relative group">
                            <UserPlus className="absolute left-4 top-4 w-4 h-4 text-gray-600 group-focus-within:text-red-500 transition-colors" />
                            <input
                                required type="text" placeholder="Nom complet (ex: Marc Kapinga)"
                                className="w-full bg-[#050505] border border-white/5 rounded-2xl py-4 pl-12 text-sm focus:border-red-500 outline-none transition-all"
                                onChange={e => setFormData({ ...formData, nom: e.target.value })}
                            />
                        </div>

                        {/* Champ Email */}
                        <div className="relative group">
                            <Mail className="absolute left-4 top-4 w-4 h-4 text-gray-600 group-focus-within:text-red-500 transition-colors" />
                            <input
                                required type="email" placeholder="Email (ex: m.kapinga@alert.cd)"
                                className="w-full bg-[#050505] border border-white/5 rounded-2xl py-4 pl-12 text-sm focus:border-red-500 outline-none transition-all"
                                onChange={e => setFormData({ ...formData, email: e.target.value })}
                            />
                        </div>

                        {/* Champ Téléphone */}
                        <div className="relative group">
                            <Phone className="absolute left-4 top-4 w-4 h-4 text-gray-600 group-focus-within:text-red-500 transition-colors" />
                            <input
                                required type="text" placeholder="Téléphone (ex: +243812345678)"
                                className="w-full bg-[#050505] border border-white/5 rounded-2xl py-4 pl-12 text-sm focus:border-red-500 outline-none transition-all"
                                onChange={e => setFormData({ ...formData, telephone: e.target.value })}
                            />
                        </div>

                        {/* ✅ NOUVEAU : Champ Mot de Passe */}
                        <div className="relative group">
                            <Lock className="absolute left-4 top-4 w-4 h-4 text-gray-600 group-focus-within:text-red-500 transition-colors" />
                            <input
                                required
                                type={showPassword ? "text" : "password"}
                                placeholder="Définir un mot de passe"
                                className="w-full bg-[#050505] border border-white/5 rounded-2xl py-4 pl-12 pr-12 text-sm focus:border-red-500 outline-none transition-all"
                                onChange={e => setFormData({ ...formData, password: e.target.value })}
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-4 top-4 text-gray-600 hover:text-white transition-colors"
                            >
                                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                            </button>
                        </div>
                    </div>

                    <button
                        disabled={loading}
                        className="w-full py-5 bg-red-600 hover:bg-red-700 disabled:bg-gray-800 text-white rounded-[2rem] font-black uppercase tracking-[0.2em] text-[10px] transition-all flex items-center justify-center gap-3 shadow-xl active:scale-95"
                    >
                        {loading ? <Loader2 className="animate-spin" size={16} /> : "Créer le compte gestionnaire"}
                    </button>
                </form>
            </div>
        </div>
    );
};