"use client";
import React, { useEffect } from 'react';
import { CheckCircle, XCircle, Loader2, X } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'loading';

interface ToastProps {
    message: string;
    type: ToastType;
    onClose: () => void;
}

export const Toast = ({ message, type, onClose }: ToastProps) => {
    useEffect(() => {
        if (type !== 'loading') {
            // 5000ms (5s) pour les erreurs, 2000ms (2s) pour le succès
            const duration = type === 'error' ? 9000 : 3000;

            const timer = setTimeout(onClose, duration);
            return () => clearTimeout(timer);
        }
    }, [type, onClose]);

    const configs = {
        loading: { icon: <Loader2 size={18} className="animate-spin" />, color: 'text-blue-400', border: 'border-blue-500/30', bg: 'bg-[#0f172a]/90' },
        success: { icon: <CheckCircle size={18} />, color: 'text-emerald-400', border: 'border-emerald-500/30', bg: 'bg-[#061a14]/90' },
        error: { icon: <XCircle size={18} />, color: 'text-rose-400', border: 'border-rose-500/30', bg: 'bg-[#1a0606]/90' },
    };

    const config = configs[type];

    return (
        <div className={`fixed bottom-8 right-8 z-[200] flex items-center gap-4 px-5 py-4 rounded-2xl border backdrop-blur-xl shadow-2xl ${config.border} ${config.bg} animate-in slide-in-from-right-10 duration-300`}>
            <span className={config.color}>{config.icon}</span>
            <p className="text-[11px] font-black text-slate-200 uppercase tracking-[0.2em]">{message}</p>
            {type !== 'loading' && (
                <button onClick={onClose} className="text-slate-500 hover:text-white transition-colors ml-2">
                    <X size={14} />
                </button>
            )}
        </div>
    );
};