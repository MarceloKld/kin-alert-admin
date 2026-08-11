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
    X
} from "lucide-react";

interface SidebarProps {
    isMobile?: boolean;
    closeMenu?: () => void;
}

export default function Sidebar({ isMobile, closeMenu }: SidebarProps) {
    const pathname = usePathname();
    const router = useRouter();

    const menuItems = [
        { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
        { name: "Incidents", href: "/dashboard/incidents", icon: AlertTriangle },
        { name: "Utilisateurs", href: "/dashboard/users", icon: Users },
        { name: "Notifications", href: "/dashboard/notifications", icon: Bell },
        { name: "Paramètres", href: "/dashboard/settings", icon: Settings },
    ];

    const handleLogout = () => {
        // Suppression du token Sanctum
        if (typeof window !== "undefined") {
            localStorage.removeItem("token");
            localStorage.removeItem("user");
        }
        if (closeMenu) closeMenu();
        router.push("/login");
    };

    return (
        <aside
            className={`bg-slate-900 text-white flex flex-col border-r border-slate-800 ${isMobile
                    ? "w-full h-full"
                    : "w-64 h-screen fixed left-0 top-0 hidden lg:flex"
                }`}
        >
            {/* Header / Logo */}
            <div className="p-6 flex items-center justify-between border-b border-slate-800">
                <div className="flex items-center gap-3">
                    <div className="bg-red-600 p-2 rounded-lg">
                        <Shield size={24} className="text-white" />
                    </div>
                    <span className="text-xl font-bold tracking-tighter">
                        KIN ALERT <span className="text-red-500">ADMIN</span>
                    </span>
                </div>

                {/* Bouton fermer sur Mobile */}
                {isMobile && (
                    <button
                        onClick={closeMenu}
                        className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
                    >
                        <X size={24} />
                    </button>
                )}
            </div>

            {/* Navigation Principale */}
            <nav className="flex-1 px-4 mt-6 space-y-2 overflow-y-auto">
                {menuItems.map((item) => {
                    const isActive = pathname === item.href;
                    const Icon = item.icon;

                    return (
                        <Link
                            key={item.name}
                            href={item.href}
                            onClick={isMobile ? closeMenu : undefined}
                            className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${isActive
                                    ? "bg-red-600 text-white font-semibold shadow-lg shadow-red-600/30"
                                    : "text-slate-400 hover:bg-slate-800/60 hover:text-white"
                                }`}
                        >
                            <Icon size={20} />
                            <span className="font-medium">{item.name}</span>
                        </Link>
                    );
                })}
            </nav>

            {/* Pied de Sidebar / Déconnexion */}
            <div className="p-4 border-t border-slate-800">
                <button
                    onClick={handleLogout}
                    className="flex items-center gap-3 px-4 py-3 w-full text-slate-400 hover:text-white hover:bg-red-500/10 hover:border-red-500/30 border border-transparent rounded-xl transition-all"
                >
                    <LogOut size={20} className="text-red-400" />
                    <span className="font-medium text-red-400">Déconnexion</span>
                </button>
            </div>
        </aside>
    );
}