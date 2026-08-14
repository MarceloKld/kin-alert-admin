"use client";
import React from 'react';
import { User, Clock } from 'lucide-react';

// Explication Prof : On définit l'interface pour que TypeScript connaisse la structure du commentaire
interface CommentProps {
    comment: any;
}

export const CommentItem = ({ comment }: CommentProps) => {
    // Déterminer la couleur du badge selon le rôle
    const isAdmin = comment.utilisateur?.role === 'administrateur';

    return (
        <div className="group p-3 bg-slate-900/40 border border-slate-800 rounded-xl transition-all hover:border-slate-700">
            <div className="flex justify-between items-start mb-2">
                <div className="flex items-center gap-2">
                    {/* Avatar simple avec icône */}
                    <div className={`p-1.5 rounded-lg ${isAdmin ? 'bg-red-500/10 text-red-500' : 'bg-blue-500/10 text-blue-500'}`}>
                        <User size={12} />
                    </div>
                    <div className="flex flex-col">
                        <span className="text-[11px] font-bold text-slate-200">{comment.utilisateur?.nom}</span>
                        {/* Badge de rôle - Explication Prof : Permet d'identifier la source de l'info */}
                        <span className={`text-[8px] uppercase font-black px-1.5 py-0.5 rounded ${isAdmin ? 'bg-red-500/20 text-red-500' : 'bg-slate-800 text-slate-500'}`}>
                            {comment.utilisateur?.role}
                        </span>
                    </div>
                </div>
                <span className="flex items-center gap-1 text-[9px] text-slate-500">
                    <Clock size={10} /> {comment.date_creation}
                </span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed italic">
                "{comment.contenu}"
            </p>
        </div>
    );
};