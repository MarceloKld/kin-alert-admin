"use client";
import { Bell, Menu, UserCircle, X } from 'lucide-react'; // Icônes SVG haute qualité
import ThemeToggle from "@/components/shared/ThemeToggle";

interface NavbarProps {
    onMenuClick: () => void;
    isMobileMenuOpen: boolean;
}

export default function Navbar({ onMenuClick, isMobileMenuOpen }: NavbarProps) {
    return (
        <header className="h-16 bg-white/80 backdrop-blur-md border-b border-slate-200 fixed top-0 right-0 left-0 lg:left-64 z-20 px-4 flex items-center justify-between">

            {/* Bouton Menu Mobile - On change l'icône selon l'état */}
            <button
                onClick={onMenuClick}
                className="lg:hidden p-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
            >
                {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>

            <div className="hidden lg:block text-slate-500 text-sm font-medium">
                Centre de contrôle <span className="text-red-600 font-bold">KIN ALERT</span>
            </div>

            <div className="flex items-center gap-4">
                {/* Bouton Dark Mode */}
                <ThemeToggle />

                {/* Notification avec point rouge SVG */}
                <button className="relative p-2 text-slate-600 hover:bg-slate-100 rounded-full transition-all active:scale-90">
                    <Bell size={20} />
                    <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
                </button>

                <div className="flex items-center gap-3 pl-4 border-l border-slate-200">
                    <div className="text-right hidden sm:block">
                        <p className="text-sm font-bold text-slate-900 leading-none">Admin Kin</p>
                        <p className="text-[10px] uppercase tracking-wider text-slate-400 font-bold mt-1">Super Admin</p>
                    </div>
                    <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-slate-500 border border-slate-300">
                        <UserCircle size={24} />
                    </div>
                </div>
            </div>
        </header>
    );
}