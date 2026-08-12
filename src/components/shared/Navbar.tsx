"use client";

import { motion } from "framer-motion";
import { Bell, Menu, UserCircle, X } from "lucide-react";
import ThemeToggle from "@/components/shared/ThemeToggle";


interface NavbarProps {
    onMenuClick: () => void;
    isMobileMenuOpen: boolean;
}

export default function Navbar({ onMenuClick, isMobileMenuOpen }: NavbarProps) {
    return (
        <motion.header
            initial={{ y: -100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ type: "spring", stiffness: 100, damping: 20 }}
           
         className="h-16 bg-gradient-to-r from-white/90 via-white/95 to-white/90 backdrop-blur-xl border-b border-slate-200/60 shadow-sm shadow-slate-200/50 fixed top-0 right-0 left-0 lg:left-64 z-20 px-4 lg:px-6 flex items-center justify-between"



        >{/* ========================================
    BOUTON MENU MOBILE
    - Change d'icône selon l'état
    - Animation rotation
======================================== */}
            <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={onMenuClick}
                className="
        lg:hidden relative group
        p-2.5 
        text-slate-700 hover:text-slate-900
        bg-slate-100/50 hover:bg-slate-200/80
        rounded-xl
        border border-slate-200/50 hover:border-slate-300
        transition-all duration-300
        shadow-sm hover:shadow-md
    "
            >
                {/* Gradient au hover */}
                <div className="absolute inset-0 bg-gradient-to-br from-red-600/0 to-red-600/0 group-hover:from-red-600/5 group-hover:to-transparent rounded-xl transition-all duration-300" />

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
    - Visible desktop uniquement
    - Gradient texte
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
                    <span className="text-sm font-medium text-slate-600">
                        Centre de contrôle{" "}
                        <span className="font-bold bg-gradient-to-r from-red-600 to-red-700 bg-clip-text text-transparent">
                            KIN ALERT
                        </span>
                    </span>
                </div>
            </motion.div>





            <div className="flex items-center gap-4">
                {/* Bouton Dark Mode */}
                <ThemeToggle />



                {/* ========================================
    NOTIFICATIONS
    - Badge animé
    - Hover effect
======================================== */}
                <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="
        relative group
        p-2.5 
        text-slate-600 hover:text-red-600
        bg-slate-100/50 hover:bg-red-50
        rounded-xl
        border border-slate-200/50 hover:border-red-200
        transition-all duration-300
        shadow-sm hover:shadow-md
    "
                >
                    {/* Gradient au hover */}
                    <div className="absolute inset-0 bg-gradient-to-br from-red-600/0 to-red-600/0 group-hover:from-red-600/5 group-hover:to-transparent rounded-xl transition-all duration-300" />

                    {/* Icône */}
                    <Bell size={20} className="relative" />

                    {/* Badge notification avec ping */}
                    <span className="absolute top-1.5 right-1.5 flex h-3 w-3">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-500 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500 border-2 border-white shadow-lg"></span>
                    </span>
                </motion.button>



                {/* ========================================
    PROFIL UTILISATEUR
    - Avatar avec border gradient
    - Info responsive
======================================== */}
                <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 }}
                    className="flex items-center gap-3 pl-4 border-l border-slate-200/60"
                >
                    {/* Informations utilisateur */}
                    <div className="text-right hidden sm:block">
                        <p className="text-sm font-bold text-slate-900 leading-tight">
                            Admin Kin
                        </p>
                        <div className="flex items-center gap-1.5 justify-end mt-1">
                            {/* Badge role */}
                            <span className="
                px-2 py-0.5 
                text-[9px] uppercase tracking-wider font-bold
                bg-gradient-to-r from-red-600 to-red-700
                text-white
                rounded-md
                shadow-sm shadow-red-600/30
            ">
                                Super Admin
                            </span>
                        </div>
                    </div>

                    {/* Avatar avec effet gradient */}
                    <motion.div
                        whileHover={{ scale: 1.1, rotate: 5 }}
                        className="relative group cursor-pointer"
                    >
                        {/* Glow effect */}
                        <div className="absolute inset-0 bg-gradient-to-br from-red-600 to-red-700 rounded-full blur-md opacity-0 group-hover:opacity-30 transition-opacity duration-300" />

                        {/* Avatar container */}
                        <div className="
            relative
            w-10 h-10 
            rounded-full 
            bg-gradient-to-br from-slate-100 to-slate-200
            flex items-center justify-center 
            text-slate-600
            border-2 border-slate-300
            group-hover:border-red-400
            shadow-md
            transition-all duration-300
        ">
                            <UserCircle size={26} />
                        </div>

                        {/* Point statut online */}
                        <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white shadow-lg shadow-green-500/50" />
                    </motion.div>
                </motion.div>

            </div>
        </motion.header>
    );
}