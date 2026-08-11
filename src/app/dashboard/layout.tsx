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

    return (
        <div className="min-h-screen bg-slate-50">
            {/* Sidebar PC */}
            <Sidebar />

            {/* Overlay Mobile (Fond sombre) */}
            {isMobileMenuOpen && (
                <div
                    className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-30 lg:hidden"
                    onClick={toggleMenu}
                />
            )}

            {/* Sidebar Mobile (Tiroir coulissant) */}
            <div
                className={`fixed inset-y-0 left-0 w-72 bg-slate-900 z-40 transform transition-transform duration-300 ease-in-out lg:hidden ${isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"
                    }`}
            >
                <Sidebar isMobile={true} closeMenu={toggleMenu} />
            </div>

            {/* Contenu Principal */}
            <div className="lg:ml-64">
                <Navbar onMenuClick={toggleMenu} isMobileMenuOpen={isMobileMenuOpen} />
                <main className="p-4 lg:p-8 pt-20 lg:pt-24 min-h-screen">
                    {children}
                </main>
            </div>
        </div>
    );
}