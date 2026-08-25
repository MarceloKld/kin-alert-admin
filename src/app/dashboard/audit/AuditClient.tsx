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
    Search,
    ShieldAlert,
    Loader2
} from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

export default function AuditClient() {
    const [logs, setLogs] = useState<AuditLog[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");

    // États de pagination
    const [currentPage, setCurrentPage] = useState(1);
    const [lastPage, setLastPage] = useState(1);
    const [totalLogs, setTotalLogs] = useState(0);

    // 1. Déclaration de la fonction de chargement
    const fetchLogs = useCallback(async (page: number) => {
        setLoading(true);
        try {
            const res = await AuditService.getAll(page);
            setLogs(res.data);
            setCurrentPage(res.current_page);
            setLastPage(res.last_page);
            setTotalLogs(res.total);
        } catch (error) {
            console.error(error);
            showToast.error("Erreur de chargement du journal d'audit");
        } finally {
            setLoading(false);
        }
    }, []);

    // 2. Execution asynchrone sécurisée dans l'effet
    useEffect(() => {
        let isMounted = true;

        const loadData = async () => {
            if (isMounted) {
                await fetchLogs(currentPage);
            }
        };

        loadData();

        return () => {
            isMounted = false;
        };
    }, [currentPage, fetchLogs]);




    const getRoleBadge = (role: string) => {
        const isAdm = role.toLowerCase().includes('admin');
        return (
            <span className={`text-[9px] px-2 py-0.5 rounded border font-black uppercase tracking-tighter ${isAdm ? 'text-[#FF2424] bg-[#FF2424]/10 border-[#FF2424]/20' : 'text-purple-400 bg-purple-400/10 border-purple-400/20'
                }`}>
                {role}
            </span>
        );
    };

    return (
        <div className="p-4 md:p-8 space-y-6 max-w-[1600px] mx-auto">

            {/* Titre & Stats */}
            <div className="flex justify-between items-end border-b border-slate-800 pb-6">
                <div>
                    <h1 className="text-2xl font-black text-white flex items-center gap-3 italic">
                        <Terminal className="text-[#FF2424]" />
                        SYSTEM AUDIT LOGS
                    </h1>
                    <p className="text-slate-500 text-[10px] uppercase tracking-[0.3em] font-bold mt-1">
                        Traçabilité totale des opérations administratives
                    </p>
                </div>
                <div className="hidden md:block text-right">
                    <p className="text-slate-500 text-[10px] uppercase font-bold">Total des entrées</p>
                    <p className="text-2xl font-black text-white font-mono">{totalLogs.toLocaleString()}</p>
                </div>
            </div>

            {/* Liste des logs */}
            <div className="bg-[#141A28] border border-slate-800 rounded-3xl overflow-hidden shadow-2xl relative">
                {loading && (
                    <div className="absolute inset-0 bg-[#080C14]/50 backdrop-blur-sm z-10 flex items-center justify-center">
                        <Loader2 className="animate-spin text-[#FF2424]" size={40} />
                    </div>
                )}

                {/* TABLEAU PC */}
                <div className="hidden lg:block overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-[#0F1523] text-slate-500 text-[10px] font-black uppercase tracking-widest border-b border-slate-800">
                            <tr>
                                <th className="p-5">Horodatage</th>
                                <th className="p-5">Opérateur</th>
                                <th className="p-5">Action Effectuée</th>
                                <th className="p-5">Cible Système</th>
                                <th className="p-5">Origine IP</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800/50">
                            {logs.map((log) => (
                                <tr key={log.id} className="hover:bg-white/2 transition-colors group">
                                    <td className="p-5 whitespace-nowrap">
                                        <div className="flex items-center gap-3">
                                            <Clock size={14} className="text-slate-600" />
                                            <div className="font-mono text-xs">
                                                <span className="text-white block">{format(new Date(log.date_creation), 'dd/MM/yyyy')}</span>
                                                <span className="text-slate-500">{format(new Date(log.date_creation), 'HH:mm:ss')}</span>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="p-5">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 bg-[#080C14] border border-slate-700 rounded-lg flex items-center justify-center text-[10px] font-bold text-[#FF2424]">
                                                {log.utilisateur.nom.substring(0, 2).toUpperCase()}
                                            </div>
                                            <div className="flex flex-col">
                                                <span className="text-white text-sm font-bold">{log.utilisateur.nom}</span>
                                                {getRoleBadge(log.utilisateur.role)}
                                            </div>
                                        </div>
                                    </td>
                                    <td className="p-5 text-xs font-bold text-slate-300">
                                        <span className="bg-slate-800/50 px-2 py-1 rounded border border-slate-700 italic">
                                            {log.action}
                                        </span>
                                    </td>
                                    <td className="p-5">
                                        <div className="flex items-center gap-2">
                                            <ShieldAlert size={14} className="text-slate-600" />
                                            <span className="text-[11px] text-slate-400 font-mono">
                                                {log.cible} <span className="text-slate-600">#{log.cible_id || 'N/A'}</span>
                                            </span>
                                        </div>
                                    </td>
                                    <td className="p-5 font-mono text-[10px] text-slate-500">
                                        <div className="flex items-center gap-2">
                                            <Globe size={12} /> {log.ip_address}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* MOBILE VIEW (Cartes) */}
                <div className="lg:hidden divide-y divide-slate-800">
                    {logs.map((log) => (
                        <div key={log.id} className="p-5 space-y-4">
                            <div className="flex justify-between items-center">
                                <span className="text-[10px] font-mono text-slate-500">{log.date_creation}</span>
                                {getRoleBadge(log.utilisateur.role)}
                            </div>
                            <div className="text-sm">
                                <span className="text-white font-bold">{log.utilisateur.nom}</span>
                                <span className="text-slate-500 ml-2">a fait</span>
                                <span className="text-[#FF2424] ml-2 font-mono italic">{log.action}</span>
                            </div>
                            <div className="text-[10px] text-slate-600 bg-[#080C14] p-3 rounded-xl flex justify-between">
                                <span>Cible: {log.cible}</span>
                                <span>IP: {log.ip_address}</span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* PAGINATION PREMIUM */}
            {lastPage > 1 && (
                <div className="flex items-center justify-center gap-6 py-4">
                    <button
                        onClick={() => { setCurrentPage(p => p - 1); if (navigator.vibrate) navigator.vibrate(15); }}
                        disabled={currentPage === 1 || loading}
                        className="p-3 bg-[#141A28] border border-slate-800 rounded-2xl text-white hover:border-[#FF2424] disabled:opacity-10 transition-all active:scale-90 shadow-xl"
                    >
                        <ChevronLeft size={24} />
                    </button>

                    <div className="flex items-center gap-2 bg-[#141A28] p-1.5 rounded-2xl border border-slate-800">
                        <div className="w-12 h-12 flex items-center justify-center bg-[#FF2424] text-white rounded-xl font-black shadow-[0_0_20px_rgba(255,36,36,0.3)]">
                            {currentPage}
                        </div>
                        <span className="text-slate-600 font-bold px-2">/</span>
                        <div className="w-12 h-12 flex items-center justify-center bg-[#080C14] text-slate-400 rounded-xl font-bold">
                            {lastPage}
                        </div>
                    </div>

                    <button
                        onClick={() => { setCurrentPage(p => p + 1); if (navigator.vibrate) navigator.vibrate(15); }}
                        disabled={currentPage === lastPage || loading}
                        className="p-3 bg-[#141A28] border border-slate-800 rounded-2xl text-white hover:border-[#FF2424] disabled:opacity-10 transition-all active:scale-90 shadow-xl"
                    >
                        <ChevronRight size={24} />
                    </button>
                </div>
            )}
        </div>
    );
}