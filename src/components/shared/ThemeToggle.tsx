"use client";
import { useTheme } from "next-themes";
import { Sun, Moon, Monitor } from "lucide-react";
import { useEffect, useState } from "react";

export default function ThemeToggle() {
    const { theme, setTheme } = useTheme();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        // On utilise setTimeout 0 pour sortir de la file d'attente synchrone
        // Cela règle l'erreur de "cascading renders"
        const timer = setTimeout(() => {
            setMounted(true);
        }, 0);
        return () => clearTimeout(timer);
    }, []);

    if (!mounted) return <div className="w-[132px] h-[40px]" />;

    return (
        <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl border border-slate-200 dark:border-slate-700">
            <button
                onClick={() => setTheme("light")}
                className={`p-2 rounded-lg transition-all ${theme === 'light' ? 'bg-white text-orange-500 shadow-sm' : 'text-slate-500'}`}
            >
                <Sun size={18} />
            </button>
            <button
                onClick={() => setTheme("dark")}
                className={`p-2 rounded-lg transition-all ${theme === 'dark' ? 'bg-slate-900 text-blue-400 shadow-sm' : 'text-slate-500'}`}
            >
                <Moon size={18} />
            </button>
            <button
                onClick={() => setTheme("system")}
                className={`p-2 rounded-lg transition-all ${theme === 'system' ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm' : 'text-slate-500'}`}
            >
                <Monitor size={18} />
            </button>
        </div>
    );
}