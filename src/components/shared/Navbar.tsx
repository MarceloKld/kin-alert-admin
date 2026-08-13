"use client";

import { Bell, Menu, UserCircle, X, LogOut, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react"; // 👈1. On retire useEffect d'ici
import { User } from "@/types";
import { AuthService } from "@/services/auth.service";


interface NavbarProps {
    onMenuClick: () => void;
    isMobileMenuOpen: boolean;
}

export default function Navbar({ onMenuClick, isMobileMenuOpen }: NavbarProps) {
    // =========================================================
    // STATE - Récupération utilisateur connecté
    // =========================================================
    const [user] = useState<User | null>(() => {
        if (typeof window === "undefined") return null;
        try {
            const userString = localStorage.getItem("user");
            return userString ? JSON.parse(userString) : null;
        } catch (error) {
            console.error("Erreur parsing user:", error);
            return null;
        }
    });

// ... la suite de ton composant (retour JSX, etc.)
    // ========================================
    // FORMATAGE DU RÔLE
    // Mapping exact avec les rôles de l'API
    // ========================================
    const getRoleBadge = (role: string) => {
        const roles: Record<string, { label: string; color: string }> = {
            // Rôles selon votre enum UserRole
            administrateur: {
                label: "Administrateur",
                color: "from-red-600 to-red-700"
            },
            gestionnaire: {
                label: "Gestionnaire",
                color: "from-blue-600 to-blue-700"
            },
            utilisateur: {
                label: "Utilisateur",
                color: "from-slate-600 to-slate-700"
            }
        };

        // Fallback si rôle inconnu
        return roles[role.toLowerCase()] || {
            label: role,
            color: "from-gray-600 to-gray-700"
        };
    };

    const roleBadge = user ? getRoleBadge(user.role) : null;
    const [showMenu, setShowMenu] = useState(false);

    // ========================================
    // FONCTION DÉCONNEXION
    // Utilise AuthService pour nettoyer + rediriger
    // ========================================
    const handleLogout = () => {
        AuthService.logout();
    };


    return (
        <motion.header
            initial={{ y: -100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ type: "spring", stiffness: 100, damping: 20 }}
            className="
        h-16 
        bg-linear-to-r from-slate-900/95 via-slate-900/98 to-slate-900/95
        backdrop-blur-xl 
        border-b border-slate-800/50
        shadow-lg shadow-black/10
        fixed top-0 right-0 left-0 lg:left-64
        z-20 px-4 lg:px-6
        flex items-center justify-between
    "
        >
        
        {/* ========================================
    BOUTON MENU MOBILE
    - Couleurs sombres
======================================== */}
            <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={onMenuClick}
                className="
        lg:hidden relative group
        p-2.5 
        text-slate-300 hover:text-white
        bg-slate-800/50 hover:bg-slate-800
        rounded-xl
        border border-slate-700/50 hover:border-slate-600
        transition-all duration-300
        shadow-sm hover:shadow-md
    "
            >
                {/* Gradient rouge au hover */}
                <div className="absolute inset-0 bg-linear-to-br from-red-600/0 to-red-600/0 group-hover:from-red-600/10 group-hover:to-transparent rounded-xl transition-all duration-300" />

                {/* Icône avec rotation */}
                <motion.div
                    animate={{ rotate: isMobileMenuOpen ? 180 : 0 }}
                    transition={{ duration: 0.3 }}
                    className="relative"
                >
                    {isMobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
                </motion.div>
            </motion.button>




            {/* ========================================
    TITRE CENTRE DE CONTRÔLE
======================================== */}
            <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
                className="hidden lg:block"
            >
                <div className="flex items-center gap-2">
                    {/* Point indicateur */}
                    <div className="relative">
                        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse shadow-lg shadow-green-500/50" />
                        <div className="absolute inset-0 w-2 h-2 bg-green-500 rounded-full animate-ping" />
                    </div>

                    {/* Texte */}
                    <span className="text-sm font-medium text-slate-300">
                        Centre de contrôle{" "}
                        <span className="font-bold bg-linear-to-r from-red-500 to-red-600 bg-clip-text text-transparent">
                            KIN ALERT
                        </span>
                    </span>
                </div>
            </motion.div>


            {/* ========================================
    SECTION DROITE - Actions & Profil
    - Utilise ml-auto pour pousser à droite
======================================== */}
            <div className="flex items-center gap-3 ml-auto">


                {/* ========================================
        NOTIFICATIONS
    ======================================== */}
                <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="
            relative group
            p-2.5 
            text-slate-300 hover:text-white
            bg-slate-800/50 hover:bg-slate-800
            rounded-xl
            border border-slate-700/50 hover:border-red-500/50
            transition-all duration-300
            shadow-sm hover:shadow-md
        "
                >
                    {/* Gradient rouge au hover */}
                    <div className="absolute inset-0 bg-linear-to-br from-red-600/0 to-red-600/0 group-hover:from-red-600/10 group-hover:to-transparent rounded-xl transition-all duration-300" />

                    {/* Icône */}
                    <Bell size={20} className="relative" />

                    {/* Badge notification avec ping */}
                    <span className="absolute top-1.5 right-1.5 flex h-3 w-3">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-500 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500 border-2 border-slate-900 shadow-lg shadow-red-500/50"></span>
                    </span>
                </motion.button>

                {/* ===== SÉPARATEUR ===== */}
                <div className="w-px h-8 bg-slate-800/60" />

                {/* Section Profil (code suivant...) */}
            </div>


            {/* ========================================
    PROFIL UTILISATEUR DYNAMIQUE
    - Menu dropdown avec déconnexion
======================================== */}
            <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
                className="flex items-center gap-3 pl-4 border-l border-slate-800/60"
            >
                {/* ===== INFORMATIONS UTILISATEUR ===== */}
                <div className="text-right hidden sm:block">
                    {/* Nom utilisateur */}
                    <p className="text-sm font-bold text-white leading-tight">
                        {user?.nom || "Chargement..."}
                    </p>

                    {/* Badge rôle dynamique */}
                    {roleBadge && (
                        <div className="flex items-center gap-1.5 justify-end mt-1">
                            <motion.span
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{ delay: 0.4, type: "spring" }}
                                className={`
                        px-2 py-0.5 
                        text-[9px] uppercase tracking-wider font-bold
                        bg-linear-to-r ${roleBadge.color}
                        text-white
                        rounded-md
                        shadow-sm shadow-red-600/30
                    `}
                            >
                                {roleBadge.label}
                            </motion.span>
                        </div>
                    )}
                </div>

                {/* ===== AVATAR AVEC MENU DROPDOWN ===== */}
                <div className="relative">
                    <motion.button
                        whileHover={{ scale: 1.1, rotate: 5 }}
                        onClick={() => setShowMenu(!showMenu)}
                        className="relative group cursor-pointer"
                    >
                        {/* Glow effect au hover */}
                        <div className="absolute inset-0 bg-linear-to-br from-red-600 to-red-700 rounded-full blur-md opacity-0 group-hover:opacity-30 transition-opacity duration-300" />

                        {/* Avatar container */}
                        <div className="
                relative
                w-10 h-10 
                rounded-full 
                bg-linear-to-br from-slate-700 to-slate-800
                flex items-center justify-center 
                text-white
                border-2 border-slate-600
                group-hover:border-red-500
                shadow-md
                transition-all duration-300
                font-bold text-sm
            ">
                            {/* Initiales OU Icône par défaut */}
                            {user?.nom ? (
                                <span className="uppercase">
                                    {user.nom
                                        .split(" ")
                                        .map(word => word[0])
                                        .slice(0, 2)
                                        .join("")
                                    }
                                </span>
                            ) : (
                                <UserCircle size={26} />
                            )}
                        </div>

                        {/* Point statut (vert si actif) */}
                        {user?.statut === "actif" && (
                            <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-slate-900 shadow-lg shadow-green-500/50 animate-pulse" />
                        )}
                    </motion.button>
                    {/* ========================================
    MENU DROPDOWN PROFIL
    - Bouton X pour fermer
    - Info utilisateur
    - Déconnexion
======================================== */}
                    <AnimatePresence>
                        {showMenu && (
                            <>
                                {/* Overlay pour fermer au clic extérieur */}
                                <div
                                    className="fixed inset-0 z-30"
                                    onClick={() => setShowMenu(false)}
                                />

                                {/* Menu */}
                                <motion.div
                                    initial={{ opacity: 0, y: -10, scale: 0.95 }}
                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                    exit={{ opacity: 0, y: -10, scale: 0.95 }}
                                    transition={{ type: "spring", stiffness: 300, damping: 25 }}
                                    className="
                    absolute right-0 top-14 
                    w-64
                    bg-linear-to-b from-slate-900 to-slate-950
                    border border-slate-800
                    rounded-xl 
                    shadow-2xl shadow-black/50
                    overflow-hidden
                    z-40
                "
                                >
                                    {/* ===== HEADER AVEC BOUTON X ===== */}
                                    <div className="relative px-4 py-3 border-b border-slate-800/50 bg-slate-900/50">
                                        {/* Bouton fermer */}
                                        <motion.button
                                            whileHover={{ scale: 1.1, rotate: 90 }}
                                            whileTap={{ scale: 0.9 }}
                                            onClick={() => setShowMenu(false)}
                                            className="
                            absolute top-3 right-3
                            p-1.5
                            text-slate-400 hover:text-white
                            bg-slate-800/50 hover:bg-slate-800
                            rounded-lg
                            border border-slate-700/50 hover:border-slate-600
                            transition-all duration-300
                        "
                                        >
                                            <X size={14} />
                                        </motion.button>

                                        {/* Info utilisateur */}
                                        <div className="pr-8">
                                            <p className="text-sm font-bold text-white">
                                                {user?.nom}
                                            </p>
                                            <p className="text-xs text-slate-400 mt-0.5 truncate">
                                                {user?.email}
                                            </p>
                                        </div>
                                    </div>

                                    {/* ===== CONTENU MENU ===== */}
                                    <div className="py-2">
                                        {/* Informations supplémentaires */}
                                        <div className="px-4 py-3 bg-slate-800/30">
                                            {/* Info rôle dans le menu */}
                                            <div className="flex items-center justify-between text-xs">
                                                <span className="text-slate-400">Rôle</span>
                                                {roleBadge && (
                                                    <span className={`
            px-2 py-0.5 
            text-[9px] uppercase tracking-wider font-bold
            bg-linear-to-r ${roleBadge.color}
            text-white
            rounded-md
            shadow-sm
        `}>
                                                        {roleBadge.label}
                                                    </span>
                                                )}
                                            </div>  <div className="flex items-center justify-between text-xs mt-2">
                                                <span className="text-slate-400">Statut</span>
                                                <div className="flex items-center gap-1.5">
                                                    <div className={`
                                    w-2 h-2 rounded-full
                                    ${user?.statut === "actif" ? "bg-green-500 animate-pulse" : "bg-slate-500"}
                                `} />
                                                    <span className="text-slate-300 capitalize">
                                                        {user?.statut}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Séparateur */}
                                        <div className="my-2 h-px bg-slate-800/50" />

                                        {/* Bouton Déconnexion */}
                                        <motion.button
                                            whileHover={{ x: 4 }}
                                            whileTap={{ scale: 0.98 }}
                                            onClick={handleLogout}
                                            className="
                            w-full px-4 py-3 
                            text-left text-sm font-semibold
                            text-red-400 hover:text-red-300
                            hover:bg-red-500/10
                            transition-all duration-200
                            flex items-center gap-3
                            group
                        "
                                        >
                                            {/* Icône avec rotation */}
                                            <motion.div
                                                whileHover={{ rotate: -15 }}
                                                transition={{ type: "spring", stiffness: 300 }}
                                            >
                                                <LogOut size={18} className="drop-shadow-lg" />
                                            </motion.div>
                                            <span>Déconnexion</span>

                                            {/* Chevron */}
                                            <motion.div
                                                className="ml-auto"
                                                initial={{ x: 0 }}
                                                whileHover={{ x: 4 }}
                                            >
                                                <ChevronRight size={16} />
                                            </motion.div>
                                        </motion.button>
                                    </div>
                                </motion.div>
                            </>
                        )}
                    </AnimatePresence>
                </div>
            </motion.div>
        </motion.header>
    );
}