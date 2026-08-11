"use client";

import { useState, ReactNode } from "react";
import Sidebar from "@/components/shared/Sidebar";
import Navbar from "@/components/shared/Navbar";

interface DashboardLayoutProps {
    children: ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    const toggleMenu = () => setIsMobileMenuOpen((prev) => !prev);
    const closeMenu = () => setIsMobileMenuOpen(false);

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors">
            {/* 1. Sidebar Desktop (Fixe à gauche lg:flex) */}
            <Sidebar />

            {/* 2. Overlay Mobile (Fond sombre cliquable pour fermer) */}
            {isMobileMenuOpen && (
                <div
                    className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm z-40 lg:hidden"
                    onClick={closeMenu}
                />
            )}

            {/* 3. Sidebar Mobile (Tiroir coulissant z-50) */}
            <div
                className={`fixed inset-y-0 left-0 w-72 bg-slate-900 z-50 transform transition-transform duration-300 ease-in-out lg:hidden ${isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"
                    }`}
            >
                <Sidebar isMobile={true} closeMenu={closeMenu} />
            </div>

            {/* 4. Zone de Contenu Principal (Décalée de 64 = 16rem sur Desktop) */}
            <div className="lg:ml-64 flex flex-col min-h-screen">
                <Navbar onMenuClick={toggleMenu} isMobileMenuOpen={isMobileMenuOpen} />

                <main className="flex-1 p-4 lg:p-8 pt-20 lg:pt-24">
                    {children}
                </main>
            </div>
        </div>
    );
}