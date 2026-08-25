"use client";

import React, { useEffect, useState, useCallback } from 'react';
import { AuditService } from '@/services/audit.service';
import { AuditLog } from '@/types/audit';
import { showToast } from '@/lib/toast-utils';
import {
    ShieldCheck,
    Activity,
    Terminal,
    Globe,
    User,
    Clock,
    ChevronLeft,
    ChevronRight,
    Cpu,
    Search
} from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

export default function AuditClient() {
    const [logs, setLogs] = useState<AuditLog[]>([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [meta, setMeta] = useState({ total: 0, last_page: 1 });
    const [searchTerm, setSearchTerm] = useState("");

    const fetchLogs = useCallback(async (pageNum: number) => {
        setLoading(true);
        try {
            const res = await AuditService.getAll(pageNum);
            // Si res est un tableau direct (cas de l'admin index selon ton endpoint)
            // on l'adapte. Si c'est paginé (cas de user index), on prend .data
            const data = Array.isArray(res) ? res : res.data;
            setLogs(data);
            if (!Array.isArray(res)) {
                setMeta({ total: res.total, last_page: res.last_page });
            }
        } catch (error) {
            showToast.error("Échec de récupération des logs d'audit");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        const load = async () => {
            await fetchLogs(page);
        };
        void load();
    }, [page, fetchLogs]);

    // Fonction pour colorer l'action selon son importance
    const getActionStyle = (action: string) => {
        const a = action.toLowerCase();
        if (a.includes('delete') || a.includes('supprim')) return 'text-red-500 bg-red-500/10 border-red-500/20';
        if (a.includes('update') || a.includes('modif')) return 'text-amber-500 bg-amber-500/10 border-amber-500/20';
        if (a.includes('create') || a.includes('ajout')) return 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20';
        return 'text-blue-500 bg-blue-500/10 border-blue-500/20';
    };

    return (
        <div className="p-4 md:p-8 space-y-6 max-w-[1600px] mx-auto">

            {/* HEADER & KPI */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl md:text-3xl font-black text-white flex items-center gap-3">
                        <Terminal className="text-[#FF2424]" />
                        JOURNAL D&apos;AUDIT
                    </h1>
                    <p className="text-slate-500 text-xs uppercase tracking-[0.3em] font-bold mt-1">
                        Surveillance des actions système en temps réel
                    </p>
                </div>

                <div className="flex items-center gap-3 bg-[#141A28] border border-slate-800 p-2 rounded-xl">
                    <Search size={18} className="text-slate-500 ml-2" />
                    <input
                        type="text"
                        placeholder="Filtrer par action ou IP..."
                        className="bg-transparent border-none outline-none text-white text-sm w-full md:w-64"
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            {/* TABLEAU (PC) / CARTES (MOBILE) */}
            <div className="bg-[#141A28] border border-slate-800 rounded-2xl overflow-hidden shadow-2xl">

                {/* VERSION PC : TABLEAU CLASSIQUE */}
                <div className="hidden md:block overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-[#0F1523] border-b border-slate-800">
                                <th className="p-4 text-[10px] font-black text-slate-500 uppercase">Timestamp</th>
                                <th className="p-4 text-[10px] font-black text-slate-500 uppercase">Utilisateur</th>
                                <th className="p-4 text-[10px] font-black text-slate-500 uppercase">Action</th>
                                <th className="p-4 text-[10px] font-black text-slate-500 uppercase">Cible</th>
                                <th className="p-4 text-[10px] font-black text-slate-500 uppercase">Adresse IP</th>
                                <th className="p-4 text-[10px] font-black text-slate-500 uppercase text-right">Détails</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800/50">
                            {loading ? (
                                Array(8).fill(0).map((_, i) => (
                                    <tr key={i} className="animate-pulse">
                                        <td colSpan={6} className="p-4 h-12 bg-slate-800/10"></td>
                                    </tr>
                                ))
                            ) : logs.map((log) => (
                                <tr key={log.id} className="hover:bg-slate-800/20 transition-colors group">
                                    <td className="p-4">
                                        <div className="flex flex-col">
                                            <span className="text-white text-sm font-medium">
                                                {format(new Date(log.date_creation), 'dd/MM/yyyy')}
                                            </span>
                                            <span className="text-slate-500 text-[10px] font-mono">
                                                {format(new Date(log.date_creation), 'HH:mm:ss')}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="p-4">
                                        <div className="flex items-center gap-2">
                                            <div className="w-7 h-7 bg-[#FF2424]/10 rounded-full flex items-center justify-center text-[#FF2424] text-[10px] font-bold">
                                                ID{log.utilisateur_id}
                                            </div>
                                            <span className="text-slate-300 text-sm font-semibold">Staff #{log.utilisateur_id}</span>
                                        </div>
                                    </td>
                                    <td className="p-4">
                                        <span className={`px-3 py-1 rounded-full text-[10px] font-black border uppercase tracking-tighter ${getActionStyle(log.action)}`}>
                                            {log.action}
                                        </span>
                                    </td>
                                    <td className="p-4 text-slate-400 text-xs font-mono">
                                        {log.cible} <span className="text-slate-600">({log.cible_id})</span>
                                    </td>
                                    <td className="p-4">
                                        <div className="flex items-center gap-2 text-slate-500 text-xs">
                                            <Globe size={12} className="text-blue-500" />
                                            {log.ip_address}
                                        </div>
                                    </td>
                                    <td className="p-4 text-right">
                                        <button className="p-2 hover:bg-slate-700 rounded-lg transition-all text-slate-500 hover:text-white">
                                            <Activity size={16} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* VERSION MOBILE : LISTE DE CARTES STYLISÉES */}
                <div className="md:hidden divide-y divide-slate-800">
                    {loading ? (
                        <div className="p-4 text-center text-slate-500">Synchronisation des logs...</div>
                    ) : logs.map((log) => (
                        <div key={log.id} className="p-4 space-y-3 active:bg-slate-800/40 transition-colors">
                            <div className="flex justify-between items-start">
                                <div className="flex items-center gap-2">
                                    <Clock size={12} className="text-[#FF2424]" />
                                    <span className="text-white font-mono text-xs">
                                        {format(new Date(log.date_creation), 'dd MMM HH:mm', { locale: fr })}
                                    </span>
                                </div>
                                <span className={`px-2 py-0.5 rounded text-[9px] font-black border uppercase ${getActionStyle(log.action)}`}>
                                    {log.action}
                                </span>
                            </div>

                            <div className="text-sm text-slate-300 font-bold">
                                Utilisateur <span className="text-[#FF2424]">#{log.utilisateur_id}</span> a modifié <span className="text-blue-400">{log.cible}</span>
                            </div>

                            <div className="flex items-center justify-between text-[10px] text-slate-500 bg-[#080C14] p-2 rounded-lg">
                                <div className="flex items-center gap-1">
                                    <Globe size={10} /> {log.ip_address}
                                </div>
                                <div className="flex items-center gap-1">
                                    <Cpu size={10} /> Terminal Mobile
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* PAGINATION LOGIC */}
            {meta.last_page > 1 && (
                <div className="flex items-center justify-between mt-4 px-2">
                    <p className="text-[10px] text-slate-500 uppercase font-black">Total Logs: {meta.total}</p>
                    <div className="flex items-center gap-2">
                        <button
                            disabled={page === 1}
                            onClick={() => { setPage(p => p - 1); if (navigator.vibrate) navigator.vibrate(10); }}
                            className="p-2 bg-[#141A28] border border-slate-800 rounded-lg disabled:opacity-20 text-white"
                        >
                            <ChevronLeft size={20} />
                        </button>
                        <span className="text-white font-mono text-sm bg-[#FF2424] px-3 py-1 rounded-md shadow-[0_0_10px_rgba(255,36,36,0.2)]">
                            {page}
                        </span>
                        <button
                            disabled={page === meta.last_page}
                            onClick={() => { setPage(p => p + 1); if (navigator.vibrate) navigator.vibrate(10); }}
                            className="p-2 bg-[#141A28] border border-slate-800 rounded-lg disabled:opacity-20 text-white"
                        >
                            <ChevronRight size={20} />
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}