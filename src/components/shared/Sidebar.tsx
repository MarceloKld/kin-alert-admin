"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
    LayoutDashboard,
    AlertTriangle,
    Users,
    Bell,
    Settings,
    LogOut,
    Shield,
    X,
    Map,
    Sliders // 1. Nouvelle icône ajoutée ici
} from "lucide-react";

import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

interface SidebarProps {
    isMobile?: boolean;
    closeMenu?: () => void;
}

export default function Sidebar({ isMobile, closeMenu }: SidebarProps) {
    const pathname = usePathname();
    const router = useRouter();
    const { isAdmin } = useAuth();

    const menuItems = [
        {
            name: "Dashboard",
            href: "/dashboard",
            icon: LayoutDashboard,
            roles: ["administrateur", "gestionnaire"]
        },
        {
            name: "Incidents",
            href: "/dashboard/incidents",
            icon: AlertTriangle,
            roles: ["administrateur", "gestionnaire"]
        },
        {
            name: "Carte Interactive",
            href: "/dashboard/carte",
            icon: Map,
            roles: ["administrateur", "gestionnaire"],
            badge: "NEW"
        },
        // 2. NOUVEAU MENU CONFIGURATION AJOUTÉ ICI
        {
            name: "Configuration",
            href: "/dashboard/configuration",
            icon: Sliders,
            roles: ["administrateur", "gestionnaire"]
        },
        {
            name: "Utilisateurs",
            href: "/dashboard/users",
            icon: Users,
            roles: ["administrateur"]
        },
        {
            name: "Notifications",
            href: "/dashboard/notifications",
            icon: Bell,
            roles: ["administrateur", "gestionnaire"]
        },
        {
            name: "Paramètres",
            href: "/dashboard/settings",
            icon: Settings,
            roles: ["administrateur"]
        },
    ];

    const handleLogout = () => {
        if (typeof window !== "undefined") {
            localStorage.removeItem("token");
            localStorage.removeItem("user");
        }
        if (closeMenu) closeMenu();
        router.push("/login");
    };

    const filteredMenu = menuItems.filter(item =>
        isAdmin ? true : item.roles.includes('gestionnaire')
    );

    return (
        <aside
            className={`bg-slate-900 text-white flex flex-col border-r border-slate-800 ${isMobile
                ? "w-full h-full"
                : "w-64 h-screen fixed left-0 top-0 hidden lg:flex"
                }`}
        >
            {/* HEADER / LOGO */}
            <div className="relative p-6 border-b border-slate-800/50 bg-slate-900/50 backdrop-blur-sm">
                <motion.div
                    className="absolute bottom-0 left-0 h-0.5 bg-linear-to-r from-red-600 via-red-500 to-transparent"
                    initial={{ width: 0 }}
                    animate={{ width: "100%" }}
                    transition={{ delay: 0.9, duration: 0.9 }}
                />

                <div className="relative flex items-center justify-between">
                    <motion.div
                        className="flex items-center gap-3"
                        whileHover={{ scale: 1.02 }}
                        transition={{ type: "spring", stiffness: 400 }}
                    >
                        <motion.div
                            className="relative"
                            animate={{ rotate: [0, 5, -5, 0] }}
                            transition={{
                                duration: 6,
                                repeat: Infinity,
                                ease: "easeInOut"
                            }}
                        >
                            <div className="absolute inset-0 bg-red-600 rounded-xl blur-xl opacity-40 animate-pulse" />
                            <div className="relative bg-linear-to-br from-red-600 via-red-600 to-red-700 p-2.5 rounded-xl shadow-lg shadow-red-600/40 border border-red-500/30">
                                <Shield size={26} className="text-white drop-shadow-2xl" strokeWidth={2.5} />
                            </div>
                            <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-slate-900 shadow-lg shadow-green-500/50 animate-pulse" />
                        </motion.div>

                        <div className="flex flex-col">
                            <span className="text-xl font-bold tracking-tight bg-linear-to-r from-white via-slate-100 to-slate-300 bg-clip-text text-transparent">
                                KIN ALERT
                            </span>
                            <span className="text-[10px] font-bold tracking-widest uppercase bg-linear-to-r from-red-500 via-red-600 to-red-700 bg-clip-text text-transparent">
                                Admin Panel
                            </span>
                        </div>
                    </motion.div>

                    {isMobile && (
                        <motion.button
                            whileHover={{ scale: 1.1, rotate: 90 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={closeMenu}
                            className="relative p-2.5 text-slate-400 hover:text-white rounded-xl bg-slate-800/50 hover:bg-slate-800 border border-slate-700/50 hover:border-slate-600 transition-all duration-300 group"
                        >
                            <div className="absolute inset-0 bg-linear-to-br from-red-600/0 to-red-600/0 group-hover:from-red-600/20 group-hover:to-transparent rounded-xl transition-all duration-300" />
                            <X size={20} className="relative" />
                        </motion.button>
                    )}
                </div>
            </div>

            {/* NAVIGATION */}
            <nav className="relative flex-1 px-3 py-6 space-y-1.5 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-transparent">
                {filteredMenu.map((item, index) => {
                    const isActive = pathname === item.href;
                    const Icon = item.icon;

                    return (
                        <motion.div
                            key={item.name}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.05 }}
                        >
                            <Link
                                href={item.href}
                                onClick={isMobile ? closeMenu : undefined}
                                className="block relative group"
                            >
                                <motion.div
                                    whileHover={{ scale: 1.02, x: 4 }}
                                    whileTap={{ scale: 0.98 }}
                                    className={`
                                        relative flex items-center gap-3 px-4 py-3.5 rounded-xl
                                        transition-all duration-300
                                        ${isActive
                                            ? "bg-linear-to-r from-red-600 to-red-700 text-white shadow-lg shadow-red-600/40"
                                            : "text-slate-400 hover:text-white hover:bg-slate-800/60"
                                        }
                                    `}
                                >
                                    {isActive && (
                                        <motion.div
                                            layoutId="activeTab"
                                            className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-white rounded-r-full shadow-lg shadow-white/50"
                                            transition={{
                                                type: "spring",
                                                stiffness: 300,
                                                damping: 30
                                            }}
                                        />
                                    )}

                                    <motion.div
                                        animate={isActive ? { rotate: [0, -10, 10, 0] } : {}}
                                        transition={{ duration: 0.5 }}
                                        className="relative z-10"
                                    >
                                        <Icon
                                            size={20}
                                            strokeWidth={isActive ? 2.5 : 2}
                                            className={isActive ? "drop-shadow-lg" : ""}
                                        />
                                    </motion.div>

                                    <span className={`
                                        relative z-10 font-medium tracking-wide
                                        ${isActive ? "font-semibold" : ""}
                                    `}>
                                        {item.name}
                                    </span>

                                    {item.badge && !isActive && (
                                        <span className="ml-auto px-2 py-0.5 text-[10px] font-black uppercase bg-red-500 text-white rounded-full animate-pulse">
                                            {item.badge}
                                        </span>
                                    )}

                                    <AnimatePresence>
                                        {!isActive && !item.badge && (
                                            <motion.div
                                                initial={{ opacity: 0, x: -10 }}
                                                whileHover={{ opacity: 1, x: 0 }}
                                                exit={{ opacity: 0 }}
                                                className="ml-auto"
                                            >
                                                <ChevronRight size={16} />
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </motion.div>
                            </Link>
                        </motion.div>
                    );
                })}
            </nav>

            {/* FOOTER */}
            <div className="relative p-4 border-t border-slate-800/50 bg-slate-900/30 backdrop-blur-sm">
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    className="mb-3 px-4 py-2 bg-slate-800/40 rounded-lg border border-slate-700/30"
                >
                    <div className="flex items-center gap-2">
                        <div className="relative">
                            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse shadow-lg shadow-green-500/50" />
                            <div className="absolute inset-0 w-2 h-2 bg-green-500 rounded-full animate-ping" />
                        </div>
                        <span className="text-xs text-slate-400 font-medium">
                            Système opérationnel
                        </span>
                    </div>
                </motion.div>
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-linear-to-r from-red-600 via-red-500 to-orange-500 opacity-50" />
            </div>
        </aside>
    );
}