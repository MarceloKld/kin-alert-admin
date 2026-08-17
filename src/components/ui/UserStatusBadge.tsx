"use client";
import React from 'react';
import { ShieldCheck, UserCheck, UserX } from 'lucide-react';
import { UserRole, UserStatus } from '@/types';

interface Props {
    statut: UserStatus;
    role: UserRole;
}

export const UserStatusBadge = ({ statut, role }: Props) => {
    const isActif = statut === 'actif';
    const isAdmin = role === 'administrateur';

    // On prépare l'icône dans une variable pour stabiliser le rendu
    const Icon = isAdmin ? ShieldCheck : (isActif ? UserCheck : UserX);

    return (
        <div className={`flex items-center gap-2 px-3 py-1 rounded-full border text-[10px] font-black uppercase tracking-widest backdrop-blur-md transition-all
            ${isActif ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500' : 'bg-rose-500/10 border-rose-500/20 text-rose-500'}`}>
            <span className="shrink-0">
                <Icon size={12} />
            </span>
            <span>{statut}</span>
        </div>
    );
};