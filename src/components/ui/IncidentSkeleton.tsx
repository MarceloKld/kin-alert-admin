"use client";
import React from 'react';

export const IncidentSkeleton = () => {
    return (
        <div className="space-y-6 animate-pulse">
            {/* 1. SKELETON DES FILTRES (Grid 2 cols mobile / 5 cols PC) */}
            <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 mb-8">
                {[...Array(5)].map((_, i) => (
                    <div key={i} className="h-20 bg-[#1a2333] rounded-2xl border border-slate-800/50"></div>
                ))}
            </div>

            {/* 2. CONTAINER DU TABLEAU/LISTE */}
            <div className="bg-[#151c2c] border border-slate-800/60 rounded-3xl overflow-hidden">

                {/* VUE TABLEAU PC (Simulée) */}
                <div className="hidden md:block">
                    <div className="h-14 bg-[#0f172a] border-b border-slate-800"></div>
                    {[...Array(6)].map((_, i) => (
                        <div key={i} className="flex items-center px-6 py-5 border-b border-slate-800/40 gap-4">
                            <div className="w-1/3 h-4 bg-slate-800 rounded"></div>
                            <div className="w-12 h-10 bg-slate-800 rounded-lg"></div>
                            <div className="w-1/4 h-4 bg-slate-800 rounded"></div>
                            <div className="w-1/4 h-6 bg-slate-800 rounded-full ml-auto"></div>
                        </div>
                    ))}
                </div>

                {/* VUE LISTE MOBILE (Simulée par des cartes) */}
                <div className="block md:hidden divide-y divide-slate-800/40">
                    {[...Array(4)].map((_, i) => (
                        <div key={i} className="p-4 space-y-4">
                            <div className="flex justify-between">
                                <div className="space-y-2 w-2/3">
                                    <div className="h-3 bg-slate-800 rounded w-1/2"></div>
                                    <div className="h-4 bg-slate-800 rounded w-full"></div>
                                </div>
                                <div className="w-12 h-12 bg-slate-800 rounded-lg"></div>
                            </div>
                            <div className="h-8 bg-slate-800 rounded-xl w-full"></div>
                        </div>
                    ))}
                </div>

                {/* 3. SKELETON PAGINATION */}
                <div className="px-6 py-6 bg-[#0f172a] border-t border-slate-800 flex justify-between items-center">
                    <div className="h-4 w-32 bg-slate-800 rounded"></div>
                    <div className="flex gap-2">
                        <div className="h-10 w-24 bg-slate-800 rounded-xl"></div>
                        <div className="h-10 w-24 bg-slate-800 rounded-xl"></div>
                    </div>
                </div>
            </div>
        </div>
    );
};