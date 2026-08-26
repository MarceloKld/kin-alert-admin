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
    Loader2,
    Target,
    Database,
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
        <div className="p-4 sm:p-6 lg:p-8 space-y-6 sm:space-y-8 max-w-[1600px] mx-auto">

            {/* ========================================== */}
            {/* 📌 HEADER - Titre, description et stats */}
            {/* ========================================== */}
            <header className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 sm:gap-6 pb-6 border-b border-slate-800/60">

                {/* Section titre et description */}
                <div className="space-y-2 flex-1">

                    {/* Titre principal avec icône */}
                    <div className="flex items-center gap-3 animate-fade-in-down">

                        {/* Icône Terminal avec effet glow animé */}
                        <div className="relative">
                            {/* Glow externe pulsant */}
                            <div className="absolute inset-0 bg-[#FF2424] opacity-20 blur-xl rounded-full animate-pulse" />

                            {/* Glow moyen qui scale */}
                            <div className="absolute inset-0 bg-[#FF2424] opacity-30 blur-md rounded-full animate-ping-slow" />

                            {/* Icône principale */}
                            <Terminal className="relative text-[#FF2424] w-7 h-7 sm:w-8 sm:h-8 shrink-0 drop-shadow-[0_0_12px_rgba(255,36,36,0.6)] animate-pulse-slow" />
                        </div>

                        {/* Titre */}
                        <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
                            System Audit Logs
                        </h1>
                    </div>

                    {/* Sous-titre / Description */}
                    <p className="text-slate-400 text-xs sm:text-sm pl-10 sm:pl-11 animate-fade-in-up animation-delay-100">
                        Traçabilité totale des opérations administratives
                    </p>
                </div>

                {/* ========================================== */}
                {/* 📈 STAT CARD - Total des entrées */}
                {/* ========================================== */}
                <div className="w-full sm:w-auto animate-fade-in-left animation-delay-200">
                    <div className="
                relative
                bg-slate-900/50 backdrop-blur-sm
                border border-slate-800/60
                rounded-xl
                px-5 py-4
                shadow-lg
                overflow-hidden
            ">
                        {/* Gradient décoratif */}
                        <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-[#FF2424]/10 to-transparent blur-2xl opacity-50" />

                        {/* Contenu */}
                        <div className="relative space-y-1">
                            {/* Label */}
                            <p className="text-slate-400 text-xs font-semibold uppercase tracking-wide">
                                Total des entrées
                            </p>

                            {/* Valeur */}
                            <p className="text-3xl sm:text-4xl font-bold text-white tabular-nums">
                                {totalLogs.toLocaleString()}
                            </p>
                        </div>
                    </div>
                </div>
            </header>

            {/* CONTAINER - Liste des logs */}
            <div className="relative min-h-[250px] bg-slate-900/50 backdrop-blur-sm border border-slate-800/60 rounded-3xl overflow-hidden shadow-2xl">

                {/* OVERLAY LOADING - État de chargement */}
                {loading && (
                    <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-md z-10 flex flex-col items-center justify-center animate-fade-in p-6">
                        <div className="flex flex-col items-center gap-4 max-w-xs w-full">
                            {/* Spinner avec glow */}
                            <div className="relative">
                                {/* Glow externe */}
                                <div className="absolute inset-0 bg-[#FF2424] opacity-30 blur-2xl rounded-full animate-pulse" />

                                {/* Spinner */}
                                <Loader2 className="relative animate-spin text-[#FF2424] w-10 h-10 sm:w-12 sm:h-12 drop-shadow-[0_0_12px_rgba(255,36,36,0.6)]" />
                            </div>

                            {/* Texte de chargement */}
                            <p className="text-slate-400 text-sm font-semibold animate-pulse">
                                Chargement des logs...
                            </p>

                            {/* Barre de progression */}
                            <div className="w-full h-1 bg-slate-800 rounded-full overflow-hidden">
                                <div className="h-full bg-gradient-to-r from-[#FF2424] to-[#FF6B6B] animate-progress" />
                            </div>
                        </div>
                    </div>
                )}
                {/* ========================================== */}
                {/* 💻 TABLEAU DESKTOP - Vue complète */}
                {/* ========================================== */}
                <div className="hidden lg:block overflow-x-auto">
                    <table className="w-full text-left">

                        {/* ========================================== */}
                        {/* 📋 THEAD - En-têtes de colonnes */}
                        {/* ========================================== */}
                        <thead className="bg-slate-950/80 text-slate-400 text-xs font-semibold uppercase tracking-wide border-b border-slate-800/60">
                            <tr>
                                <th className="px-6 py-4">
                                    <div className="flex items-center gap-2">
                                        <Clock className="w-4 h-4 text-slate-500" />
                                        <span>Horodatage</span>
                                    </div>
                                </th>
                                <th className="px-6 py-4">
                                    <div className="flex items-center gap-2">
                                        <User className="w-4 h-4 text-slate-500" />
                                        <span>Opérateur</span>
                                    </div>
                                </th>
                                <th className="px-6 py-4">
                                    <div className="flex items-center gap-2">
                                        <Activity className="w-4 h-4 text-slate-500" />
                                        <span>Action</span>
                                    </div>
                                </th>
                                <th className="px-6 py-4">
                                    <div className="flex items-center gap-2">
                                        <Target className="w-4 h-4 text-slate-500" />
                                        <span>Cible</span>
                                    </div>
                                </th>
                                <th className="px-6 py-4">
                                    <div className="flex items-center gap-2">
                                        <Globe className="w-4 h-4 text-slate-500" />
                                        <span>Origine IP</span>
                                    </div>
                                </th>
                            </tr>
                        </thead>

                        {/* ========================================== */}
                        {/* 📊 TBODY - Lignes de données */}
                        {/* ========================================== */}
                        <tbody className="divide-y divide-slate-800/40">
                            {logs.length === 0 ? (
                                /* Empty state dans le tableau */
                                <tr>
                                    <td colSpan={5} className="py-20">
                                        <div className="flex flex-col items-center justify-center">
                                            <div className="relative mb-4">
                                                <div className="absolute inset-0 bg-slate-700/20 blur-2xl rounded-full animate-pulse" />
                                                <Database className="relative text-slate-700 w-12 h-12" />
                                            </div>
                                            <p className="text-slate-500 font-semibold text-sm">
                                                Aucun log disponible
                                            </p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                logs.map((log, index) => (
                                    <tr
                                        key={log.id}
                                        className="
                            group
                            hover:bg-slate-800/30
                            transition-all duration-200
                            animate-fade-in-up
                        "
                                        style={{
                                            animationDelay: `${index * 30}ms`
                                        }}
                                    >
                                        {/* ========================================== */}
                                        {/* 🕐 COLONNE HORODATAGE */}
                                        {/* ========================================== */}
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center gap-3">
                                                {/* Icône Clock */}
                                                <div className="shrink-0 w-8 h-8 bg-slate-900/50 border border-slate-700/60 rounded-lg flex items-center justify-center">
                                                    <Clock className="w-4 h-4 text-slate-500" />
                                                </div>

                                                {/* Date et heure */}
                                                <div className="font-mono text-xs">
                                                    <time
                                                        dateTime={log.date_creation}
                                                        className="text-white font-semibold block"
                                                    >
                                                        {format(new Date(log.date_creation), 'dd/MM/yyyy')}
                                                    </time>
                                                    <span className="text-slate-500 text-[10px]">
                                                        {format(new Date(log.date_creation), 'HH:mm:ss')}
                                                    </span>
                                                </div>
                                            </div>
                                        </td>

                                        {/* ========================================== */}
                                        {/* 👤 COLONNE OPÉRATEUR */}
                                        {/* ========================================== */}
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                {/* Avatar avec initiales */}
                                                <div className="
                                    shrink-0 w-9 h-9
                                    bg-[#FF2424]/10
                                    border border-[#FF2424]/30
                                    rounded-xl
                                    flex items-center justify-center
                                    text-xs font-bold text-[#FF2424]
                                    group-hover:scale-110 group-hover:shadow-lg group-hover:shadow-[#FF2424]/20
                                    transition-all duration-200
                                ">
                                                    {log.utilisateur.nom.substring(0, 2).toUpperCase()}
                                                </div>

                                                {/* Nom et rôle */}
                                                <div className="flex flex-col">
                                                    <span className="text-white text-sm font-semibold">
                                                        {log.utilisateur.nom}
                                                    </span>
                                                    {getRoleBadge(log.utilisateur.role)}
                                                </div>
                                            </div>
                                        </td>

                                        {/* ========================================== */}
                                        {/* ⚡ COLONNE ACTION */}
                                        {/* ========================================== */}
                                        <td className="px-6 py-4">
                                            <span className="
                                inline-flex items-center
                                px-3 py-1.5
                                bg-slate-800/50
                                border border-slate-700/60
                                rounded-lg
                                text-xs font-semibold text-slate-200
                                group-hover:border-[#FF2424]/30
                                transition-colors duration-200
                            ">
                                                {log.action}
                                            </span>
                                        </td>

                                        {/* ========================================== */}
                                        {/* 🎯 COLONNE CIBLE */}
                                        {/* ========================================== */}
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                <ShieldAlert className="w-4 h-4 text-slate-500 shrink-0" />
                                                <span className="text-xs text-slate-300 font-medium">
                                                    {log.cible}
                                                </span>
                                                {log.cible_id && (
                                                    <span className="
                                        px-2 py-0.5
                                        bg-slate-900/50
                                        border border-slate-700/60
                                        rounded
                                        text-[10px] text-slate-500 font-mono
                                    ">
                                                        #{log.cible_id}
                                                    </span>
                                                )}
                                            </div>
                                        </td>

                                        {/* ========================================== */}
                                        {/* 🌐 COLONNE IP */}
                                        {/* ========================================== */}
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2 font-mono text-xs text-slate-400">
                                                <Globe className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                                                <span className="group-hover:text-slate-300 transition-colors">
                                                    {log.ip_address}
                                                </span>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>



                {/* ========================================== */}
                {/* 📱 MOBILE VIEW - Cartes empilées */}
                {/* ========================================== */}
                <div className="lg:hidden divide-y divide-slate-800/40">
                    {logs.length === 0 ? (
                        /* ========================================== */
                        /* 📭 EMPTY STATE - Aucun log */
                        /* ========================================== */
                        <div className="flex flex-col items-center justify-center py-16 px-6">
                            <div className="relative mb-4">
                                <div className="absolute inset-0 bg-slate-700/20 blur-2xl rounded-full animate-pulse" />
                                <Database className="relative text-slate-700 w-12 h-12" />
                            </div>
                            <p className="text-slate-500 font-semibold text-sm text-center">
                                Aucun log disponible
                            </p>
                        </div>
                    ) : (
                        logs.map((log, index) => (
                            <article
                                key={log.id}
                                className="
                    p-5 space-y-4
                    hover:bg-slate-800/20
                    transition-colors duration-200
                    animate-fade-in-up
                "
                                style={{
                                    animationDelay: `${index * 40}ms`
                                }}
                            >
                                {/* ========================================== */}
                                {/* 🕐 EN-TÊTE - Date et rôle */}
                                {/* ========================================== */}
                                <div className="flex justify-between items-center gap-3">
                                    {/* Horodatage */}
                                    <div className="flex items-center gap-2 min-w-0">
                                        <Clock className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                                        <time
                                            dateTime={log.date_creation}
                                            className="text-xs font-mono text-slate-400 truncate"
                                        >
                                            {format(new Date(log.date_creation), 'dd/MM/yyyy HH:mm:ss')}
                                        </time>
                                    </div>

                                    {/* Badge de rôle */}
                                    <div className="shrink-0">
                                        {getRoleBadge(log.utilisateur.role)}
                                    </div>
                                </div>

                                {/* ========================================== */}
                                {/* 👤 CONTENU - Utilisateur et action */}
                                {/* ========================================== */}
                                <div className="flex items-start gap-3">
                                    {/* Avatar avec initiales */}
                                    <div className="
                        shrink-0 w-10 h-10
                        bg-[#FF2424]/10
                        border border-[#FF2424]/30
                        rounded-xl
                        flex items-center justify-center
                        text-xs font-bold text-[#FF2424]
                    ">
                                        {log.utilisateur.nom.substring(0, 2).toUpperCase()}
                                    </div>

                                    {/* Informations */}
                                    <div className="flex-1 min-w-0 space-y-1.5">
                                        {/* Nom de l'utilisateur */}
                                        <p className="text-white text-sm font-semibold truncate">
                                            {log.utilisateur.nom}
                                        </p>

                                        {/* Action effectuée */}
                                        <div className="flex items-center gap-2 flex-wrap">
                                            <span className="text-xs text-slate-500">
                                                a effectué
                                            </span>
                                            <span className="
                                inline-flex items-center
                                px-2 py-1
                                bg-[#FF2424]/10
                                border border-[#FF2424]/20
                                rounded-lg
                                text-xs font-semibold text-[#FF2424]
                            ">
                                                {log.action}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                {/* ========================================== */}
                                {/* 📊 MÉTADONNÉES - Cible et IP */}
                                {/* ========================================== */}
                                <div className="
                    bg-slate-950/50
                    border border-slate-800/60
                    rounded-xl
                    p-3
                    space-y-2.5
                ">
                                    {/* Cible système */}
                                    <div className="flex items-center justify-between gap-3">
                                        <div className="flex items-center gap-2 min-w-0">
                                            <ShieldAlert className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                                            <span className="text-[10px] text-slate-500 uppercase font-semibold tracking-wide">
                                                Cible
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-1.5 min-w-0">
                                            <span className="text-xs text-slate-300 font-medium truncate">
                                                {log.cible}
                                            </span>
                                            {log.cible_id && (
                                                <span className="
                                    shrink-0
                                    px-1.5 py-0.5
                                    bg-slate-900/80
                                    border border-slate-700/60
                                    rounded
                                    text-[10px] text-slate-500 font-mono
                                ">
                                                    #{log.cible_id}
                                                </span>
                                            )}
                                        </div>
                                    </div>

                                    {/* Séparateur */}
                                    <div className="h-px bg-slate-800/60" />

                                    {/* Adresse IP */}
                                    <div className="flex items-center justify-between gap-3">
                                        <div className="flex items-center gap-2">
                                            <Globe className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                                            <span className="text-[10px] text-slate-500 uppercase font-semibold tracking-wide">
                                                Origine IP
                                            </span>
                                        </div>
                                        <span className="text-xs text-slate-300 font-mono truncate">
                                            {log.ip_address}
                                        </span>
                                    </div>
                                </div>
                            </article>
                        ))
                    )}
                </div>
            </div>

            {/* ========================================== */}
            {/* 📄 PAGINATION PREMIUM - Navigation pages */}
            {/* ========================================== */}
            {lastPage > 1 && (
                <nav
                    className="flex items-center justify-center gap-3 sm:gap-6 py-4 animate-fade-in-up"
                    aria-label="Pagination des logs d'audit"
                >
                    {/* ========================================== */}
                    {/* ⬅️ BOUTON PRÉCÉDENT */}
                    {/* ========================================== */}
                    <button
                        onClick={() => {
                            setCurrentPage(p => p - 1);
                            // Retour haptique léger sur mobile (logique conservée)
                            if (navigator.vibrate) navigator.vibrate(15);
                        }}
                        disabled={currentPage === 1 || loading}
                        aria-label="Page précédente"
                        className="
                group
                p-3 sm:p-3.5
                bg-slate-900/50 backdrop-blur-sm
                border border-slate-800/60
                rounded-2xl
                text-slate-400
                shadow-lg
                hover:border-[#FF2424]/60 hover:text-[#FF2424] hover:bg-slate-900/70
                hover:shadow-xl hover:shadow-[#FF2424]/10
                disabled:opacity-20 disabled:cursor-not-allowed
                disabled:hover:border-slate-800/60 disabled:hover:text-slate-400 disabled:hover:bg-slate-900/50
                transition-all duration-200
                active:scale-90
            "
                    >
                        <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6 group-hover:-translate-x-0.5 transition-transform duration-200" />
                    </button>

                    {/* ========================================== */}
                    {/* 🔢 INDICATEUR DE PAGE - Courante / Total */}
                    {/* ========================================== */}
                    <div className="
            flex items-center gap-2
            bg-slate-900/50 backdrop-blur-sm
            border border-slate-800/60
            rounded-2xl
            p-1.5
            shadow-lg
        ">
                        {/* Page courante (mise en avant) */}
                        <div className="
                w-11 h-11 sm:w-12 sm:h-12
                flex items-center justify-center
                bg-[#FF2424]
                text-white
                rounded-xl
                text-base font-bold tabular-nums
                shadow-lg shadow-[#FF2424]/30
                ring-1 ring-[#FF2424]/40
            ">
                            {currentPage}
                        </div>

                        {/* Séparateur */}
                        <span className="text-slate-600 font-bold px-1 select-none">
                            /
                        </span>

                        {/* Nombre total de pages */}
                        <div className="
                w-11 h-11 sm:w-12 sm:h-12
                flex items-center justify-center
                bg-slate-950/80
                border border-slate-800/60
                text-slate-400
                rounded-xl
                text-base font-semibold tabular-nums
            ">
                            {lastPage}
                        </div>
                    </div>

                    {/* ========================================== */}
                    {/* ➡️ BOUTON SUIVANT */}
                    {/* ========================================== */}
                    <button
                        onClick={() => {
                            setCurrentPage(p => p + 1);
                            // Retour haptique léger sur mobile (logique conservée)
                            if (navigator.vibrate) navigator.vibrate(15);
                        }}
                        disabled={currentPage === lastPage || loading}
                        aria-label="Page suivante"
                        className="
                group
                p-3 sm:p-3.5
                bg-slate-900/50 backdrop-blur-sm
                border border-slate-800/60
                rounded-2xl
                text-slate-400
                shadow-lg
                hover:border-[#FF2424]/60 hover:text-[#FF2424] hover:bg-slate-900/70
                hover:shadow-xl hover:shadow-[#FF2424]/10
                disabled:opacity-20 disabled:cursor-not-allowed
                disabled:hover:border-slate-800/60 disabled:hover:text-slate-400 disabled:hover:bg-slate-900/50
                transition-all duration-200
                active:scale-90
            "
                    >
                        <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6 group-hover:translate-x-0.5 transition-transform duration-200" />
                    </button>
                </nav>
            )}
        </div>
    );
}