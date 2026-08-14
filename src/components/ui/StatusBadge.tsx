import React from 'react';
import { IncidentStatus } from '@/types';

// Explications du Prof :
// Ce composant est "pur". Il prend un statut et retourne un design spécifique.
// On utilise des classes Tailwind avec des opacités (bg-opacity-10) pour l'effet moderne.

interface StatusBadgeProps {
    status: IncidentStatus;
}

export const StatusBadge = ({ status }: StatusBadgeProps) => {
    const configs = {
        en_attente: {
            label: 'En attente',
            classes: 'bg-amber-100 text-amber-700 border-amber-200',
        },
        valide: {
            label: 'Validé',
            classes: 'bg-emerald-100 text-emerald-700 border-emerald-200',
        },
        rejete: {
            label: 'Rejeté',
            classes: 'bg-rose-100 text-rose-700 border-rose-200',
        },
    };

    const config = configs[status] || configs.en_attente;

    return (
        <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium border ${config.classes} transition-all duration-300`}>
            {config.label}
        </span>
    );
};