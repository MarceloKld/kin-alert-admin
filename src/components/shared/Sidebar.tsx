"use client";
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, AlertTriangle, Users, Bell, Settings, LogOut, Shield, X } from 'lucide-react';

// 1. On définit le "Contrat" (Interface)
interface SidebarProps {
    isMobile?: boolean;    // Le "?" veut dire que c'est optionnel
    closeMenu?: () => void; // Une fonction qui ne retourne rien
}

export default function Sidebar({ isMobile, closeMenu }: SidebarProps) {
    const pathname = usePathname();

    return (
        <aside className={`
      ${isMobile ? "w-full h-full" : "w-64 h-screen fixed left-0 top-0 hidden lg:flex"} 
      bg-slate-900 text-white flex flex-col border-r border-slate-800
    `}>
            <div className="p-6 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="bg-red-600 p-2 rounded-lg">
                        <Shield size={24} className="text-white" />
                    </div>
                    <span className="text-xl font-bold tracking-tighter">KIN ALERT <span className="text-red-500">ADMIN</span></span>
                </div>

                {/* Si on est sur mobile, on montre un bouton X pour fermer */}
                {isMobile && (
                    <button onClick={closeMenu} className="p-2 text-slate-400">
                        <X size={24} />
                    </button>
                )}
            </div>

            <nav className="flex-1 px-4 mt-4 space-y-2">
                {[
                    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
                    { name: 'Incidents', href: '/dashboard/incidents', icon: AlertTriangle },
                    { name: 'Utilisateurs', href: '/dashboard/users', icon: Users },
                    { name: 'Notifications', href: '/dashboard/notifications', icon: Bell },
                    { name: 'Paramètres', href: '/dashboard/settings', icon: Settings },
                ].map((item) => {
                    const isActive = pathname === item.href;
                    return (
                        <Link
                            key={item.name}
                            href={item.href}
                            onClick={isMobile ? closeMenu : undefined} // Ferme le menu si on clique sur un lien (mobile)
                            className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${isActive
                                    ? 'bg-red-600 text-white'
                                    : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                                }`}
                        >
                            <item.icon size={20} />
                            <span className="font-medium">{item.name}</span>
                        </Link>
                    );
                })}
            </nav>
            {/* ... reste du code (Logout) ... */}
        </aside>
    );
}