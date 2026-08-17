// src/components/ui/StatusBadge.tsx
import React from 'react';
import { Circle, CheckCircle2, XCircle, AlertCircle } from 'lucide-react';

interface StatusBadgeProps {
    status: 'en_attente' | 'valide' | 'rejete';
}

const StatusBadge = ({ status }: StatusBadgeProps) => {
    const configs = {
        en_attente: {
            color: 'text-amber-400 bg-amber-400/10 border-amber-400/20',
            icon: <AlertCircle className="w-3 h-3" />,
            label: 'En attente'
        },
        valide: {
            color: 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20',
            icon: <CheckCircle2 className="w-3 h-3" />,
            label: 'Validé'
        },
        rejete: {
            color: 'text-rose-400 bg-rose-400/10 border-rose-400/20',
            icon: <XCircle className="w-3 h-3" />,
            label: 'Rejeté'
        }
    };

    const config = configs[status];

    return (
        <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full border backdrop-blur-md text-[11px] font-medium uppercase tracking-wider ${config.color}`}>
            {config.icon}
            {config.label}
        </div>
    );
};

export default StatusBadge;