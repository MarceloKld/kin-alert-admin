"use client";
import React from 'react';

// Explication Prof : On reproduit exactement les 5 colonnes du tableau
export const IncidentSkeleton = () => {
    return (
        <div className="space-y-6 animate-pulse">
            {/* Header simulateur */}
            <div className="flex justify-between items-center mb-8">
                <div className="h-8 w-48 bg-slate-800 rounded-lg"></div>
                <div className="h-10 w-32 bg-slate-800 rounded-xl"></div>
            </div>

            {/* Tableau simulateur */}
            <div className="bg-[#151c2c] border border-slate-800/60 rounded-2xl overflow-hidden">
                <div className="h-12 bg-[#0f172a] border-b border-slate-800"></div>
                {[...Array(6)].map((_, i) => (
                    <div key={i} className="flex items-center px-6 py-4 border-b border-slate-800/40 gap-4">
                        <div className="w-1/4 space-y-2"><div className="h-4 bg-slate-800 rounded w-3/4"></div><div className="h-2 bg-slate-800/50 rounded w-1/2"></div></div>
                        <div className="w-1/6"><div className="h-10 w-10 bg-slate-800 rounded-lg"></div></div>
                        <div className="w-1/6"><div className="h-4 bg-slate-800 rounded w-2/3"></div></div>
                        <div className="w-1/6"><div className="h-6 bg-slate-800 rounded-full w-20"></div></div>
                        <div className="w-1/4 flex justify-end gap-2"><div className="h-8 w-8 bg-slate-800 rounded-lg"></div><div className="h-8 w-8 bg-slate-800 rounded-lg"></div></div>
                    </div>
                ))}
            </div>
        </div>
    );
};