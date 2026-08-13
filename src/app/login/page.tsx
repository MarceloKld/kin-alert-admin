"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion"; // Pour les animations premium
import { Shield, Mail, Lock, Loader2, AlertCircle, X } from "lucide-react"; // Icônes premium
import { AuthService } from "@/services/auth.service";
import axios from "axios";


export default function LoginPage() {
    const router = useRouter();

    // États pour gérer le formulaire et les retours API
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // 1. On définit d'abord une interface pour la structure des erreurs de ton API Laravel
    interface LaravelErrorResponse {
        message: string;
        errors?: Record<string, string[]>; // Pour les erreurs de validation (422)
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);

        try {
            const data = await AuthService.login({ email, password });

            // Liste des rôles autorisés à se connecter
            const allowedRoles = ['gestionnaire', 'administrateur', 'admin'];

            // 1. BLOCAGE FRONTEND : Si le rôle n'est NI gestionnaire NI administrateur
            if (!allowedRoles.includes(data.user.role)) {
                // 👈 'false' empêche le rechargement de la page
                AuthService.logout(false);
                setError("Accès refusé. Seuls les gestionnaires et les administrateurs ont accès à ce portail.");
                return;
            }

            // Redirection vers le tableau de bord
            router.push("/dashboard");

        } catch (err: unknown) {
            if (axios.isAxiosError(err)) {
                const serverError = err.response?.data as LaravelErrorResponse;

                if (err.response?.status === 401) {
                    setError("Email ou mot de passe incorrect.");
                } else if (err.response?.status === 403) {
                    setError(serverError?.message || "Accès interdit. Vous n'avez pas les droits nécessaires.");
                } else if (err.response?.status === 422) {
                    setError(serverError?.message || "Données saisies invalides.");
                } else {
                    setError("Une erreur de communication avec le serveur est survenue.");
                }
            } else {
                setError("Une erreur inattendue est survenue.");
            }
        } finally {
            setIsLoading(false);
        }
    };






    
    return (
        <div className="min-h-screen relative flex items-center justify-center p-4 overflow-hidden bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">

            {/* ===== BACKGROUND EFFECTS ===== */}
            <motion.div
                animate={{
                    scale: [1, 1.2, 1],
                    opacity: [0.15, 0.25, 0.15],
                }}
                transition={{
                    duration: 8,
                    repeat: Infinity,
                    ease: "easeInOut"
                }}
                className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-gradient-to-br from-red-600/30 to-orange-600/20 rounded-full blur-[120px]"
            />

            <motion.div
                animate={{
                    scale: [1.2, 1, 1.2],
                    opacity: [0.2, 0.3, 0.2],
                }}
                transition={{
                    duration: 10,
                    repeat: Infinity,
                    ease: "easeInOut",
                    delay: 1
                }}
                className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] bg-gradient-to-tl from-blue-600/20 to-purple-600/20 rounded-full blur-[120px]"
            />

            <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center opacity-[0.02]" />
            <div className="absolute inset-0 bg-noise opacity-[0.015]" />

            {/* =========================================================
               CONTENEUR CENTRAL UNIQUE (Englobe Logo + Formulaire + Footer)
            ========================================================= */}
            <div className="relative z-10 w-full max-w-md space-y-6">

                {/* LOGO & TITRE */}
                <div className="text-center">
                    <motion.div
                        initial={{ scale: 0, rotate: -180 }}
                        animate={{ scale: 1, rotate: 0 }}
                        transition={{
                            type: "spring",
                            stiffness: 200,
                            damping: 15,
                            delay: 0.2
                        }}
                        className="inline-flex relative mb-4"
                    >
                        <div className="absolute inset-0 bg-red-600 rounded-2xl blur-2xl opacity-40 animate-pulse" />
                        <div className="relative p-5 rounded-2xl bg-gradient-to-br from-red-600 via-red-600 to-red-700 shadow-2xl shadow-red-600/30 border border-red-500/30">
                            <Shield size={48} className="text-white drop-shadow-2xl" strokeWidth={2.5} />
                        </div>
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.5 }}
                            className="absolute -bottom-2 -right-2 px-2.5 py-1 bg-gradient-to-r from-orange-500 to-red-500 text-white text-[10px] font-bold uppercase tracking-wider rounded-lg shadow-lg"
                        >
                            Admin
                        </motion.div>
                    </motion.div>

                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        className="text-4xl font-bold tracking-tight mb-2"
                    >
                        <span className="bg-gradient-to-r from-white via-slate-100 to-slate-300 bg-clip-text text-transparent">
                            KIN-ALERT
                        </span>
                    </motion.h1>

                    <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.4 }}
                        className="text-slate-400 text-sm font-medium"
                    >
                        <span className="inline-flex items-center gap-2">
                            <Lock size={14} className="text-red-500" />
                            Portail d&apos;Administration Sécurisé
                        </span>
                    </motion.p>
                </div>

                {/* CARTE FORMULAIRE */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    className="relative bg-slate-900/80 backdrop-blur-2xl border border-slate-800/80 p-8 rounded-3xl shadow-2xl shadow-black/50"
                >
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1/2 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />

                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* MESSAGES D'ERREUR */}
                        <AnimatePresence mode="wait">
                            {error && (
                                <motion.div
                                    initial={{ opacity: 0, y: -10, scale: 0.95 }}
                                    animate={{
                                        opacity: 1,
                                        y: 0,
                                        scale: 1,
                                        x: [0, -5, 5, -5, 5, 0]
                                    }}
                                    exit={{ opacity: 0, y: -10, scale: 0.95 }}
                                    transition={{
                                        x: { duration: 0.4, delay: 0.1 },
                                        default: { duration: 0.3 }
                                    }}
                                    className="relative overflow-hidden"
                                >
                                    <motion.div
                                        animate={{ x: ['-100%', '100%'] }}
                                        transition={{
                                            duration: 2,
                                            repeat: Infinity,
                                            ease: "linear"
                                        }}
                                        className="absolute inset-0 bg-gradient-to-r from-transparent via-red-500/10 to-transparent"
                                    />
                                    <div className="relative bg-red-500/10 backdrop-blur-sm border border-red-500/30 p-4 rounded-xl flex items-start gap-3">
                                        <div className="relative">
                                            <div className="absolute inset-0 bg-red-500 rounded-full blur-md opacity-50 animate-pulse" />
                                            <AlertCircle size={20} className="relative text-red-400" />
                                        </div>
                                        <div className="flex-1">
                                            <p className="text-red-400 text-sm font-medium leading-relaxed">
                                                {error}
                                            </p>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => setError(null)}
                                            className="text-red-400/60 hover:text-red-400 transition-colors"
                                        >
                                            <X size={16} />
                                        </button>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {/* Champ Email */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-300 ml-1">Email professionnel</label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                                <input
                                    type="email"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full bg-slate-950/50 border border-slate-700 text-white rounded-xl py-3 pl-10 pr-4 outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-all"
                                    placeholder="admin@kinalert.com"
                                />
                            </div>
                        </div>

                        {/* Champ Mot de passe */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-300 ml-1">Mot de passe</label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                                <input
                                    type="password"
                                    required
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full bg-slate-950/50 border border-slate-700 text-white rounded-xl py-3 pl-10 pr-4 outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-all"
                                    placeholder="••••••••"
                                />
                            </div>
                        </div>

                        {/* Bouton de connexion */}
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold py-3 rounded-xl shadow-lg shadow-red-600/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isLoading ? (
                                <>
                                    <Loader2 className="animate-spin" size={20} />
                                    Vérification...
                                </>
                            ) : (
                                "Se connecter"
                            )}
                        </button>
                    </form>
                </motion.div>

                {/* Footer de page */}
                <p className="text-center text-slate-500 text-sm">
                    &copy; 2026 KIN-ALERT. Tous droits réservés.
                </p>

            </div> {/* FIN DU CONTENEUR CENTRAL */}

        </div>
    );
}