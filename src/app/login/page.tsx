"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion"; // Pour les animations premium
import { Shield, Mail, Lock, Loader2, AlertCircle } from "lucide-react"; // Icônes premium
import { AuthService } from "@/services/auth.service";
import axios from "axios";
import LoginNotice from "@/components/auth/LoginNotice";
import { Suspense } from "react";

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

            if (data.user.role === 'utilisateur') {
                AuthService.logout();
                setError("Accès refusé. Ce portail est réservé à l'administration.");
                return;
            }

            router.push("/dashboard");

        } catch (err: unknown) { // <--- On utilise 'unknown' au lieu de 'any' pour la sécurité

            // 2. On vérifie si c'est bien une erreur venant d'Axios
            if (axios.isAxiosError(err)) {
                // 3. On "cast" la réponse pour que TS comprenne la structure (notre interface définie plus haut)
                const serverError = err.response?.data as LaravelErrorResponse;

                if (err.response?.status === 401) {
                    setError("Identifiants incorrects. Veuillez réessayer.");
                } else if (err.response?.status === 422) {
                    // Affiche le message de validation spécifique de Laravel
                    setError(serverError?.message || "Données invalides.");
                } else {
                    setError("Une erreur de communication avec le serveur est survenue.");
                }
            } else {
                // 4. Si c'est une erreur JavaScript classique
                setError("Une erreur inattendue est survenue.");
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#0f172a] flex items-center justify-center p-4 relative overflow-hidden">
            {/* Background décoratif (Cercles animés pour le côté premium) */}
            <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-red-900/20 rounded-full blur-[120px]" />
            <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-900/20 rounded-full blur-[120px]" />

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="w-full max-w-md"
            >
                {/* Logo & Titre */}
                <div className="text-center mb-8">
                    <div className="inline-flex p-4 rounded-2xl bg-red-600 mb-4 shadow-lg shadow-red-600/20">
                        <Shield size={40} className="text-white" />
                    </div>
                    <Suspense fallback={null}>
                        <LoginNotice />
                    </Suspense>
                    <h1 className="text-3xl font-bold text-white tracking-tight">KIN-ALERT</h1>
                    <p className="text-slate-400 mt-2"> Portail d&apos;Administration Sécurisé</p>
                </div>

                {/* Carte du Formulaire */}
                <div className="bg-slate-900/50 backdrop-blur-xl border border-slate-800 p-8 rounded-3xl shadow-2xl">
                    <form onSubmit={handleSubmit} className="space-y-6">

                        {/* Affichage des erreurs avec animation */}
                        <AnimatePresence mode="wait">
                            {error && (
                                <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: "auto" }}
                                    exit={{ opacity: 0, height: 0 }}
                                    className="bg-red-500/10 border border-red-500/50 p-4 rounded-xl flex items-center gap-3 text-red-500 text-sm"
                                >
                                    <AlertCircle size={18} />
                                    {error}
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
                </div>

                {/* Footer de page */}
                <p className="text-center text-slate-500 text-sm mt-8">
                    &copy; 2026 KIN-ALERT. Tous droits réservés.
                </p>
            </motion.div>
        </div>
    );
}