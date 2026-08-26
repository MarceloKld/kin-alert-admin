"use client";

import React, { useEffect, useState, useCallback } from 'react';
import { NotificationService } from '@/services/notification.service';
import { NotificationItem, NotificationResponse } from '@/types/notification';
import { showToast } from '@/lib/toast-utils';
import { Megaphone, Bell, Send, CheckCheck, Inbox, Clock, ShieldAlert, ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

export default function NotificationsClient() {
    const [notifications, setNotifications] = useState<NotificationItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [broadcastMsg, setBroadcastMsg] = useState("");
    const [isSending, setIsSending] = useState(false);

    // ÉTATS POUR LA PAGINATION
    const [currentPage, setCurrentPage] = useState(1);
    const [paginationMeta, setPaginationMeta] = useState<NotificationResponse['meta'] | null>(null);
    const [updatingId, setUpdatingId] = useState<number | null>(null);
    const [isRinging, setIsRinging] = useState(false);

    // Remplacer les lignes 21 à 37 par ceci :

    useEffect(() => {
        const loadNotifications = async () => {
            setLoading(true);
            try {
                const res = await NotificationService.getPersonal(currentPage);
                setNotifications(res.data);
                setPaginationMeta(res.meta);
            } catch (error) {
                console.error(error);
                showToast.error("Impossible de charger vos notifications");
            } finally {
                setLoading(false);
            }
        };

        loadNotifications();
    }, [currentPage]);
    

    // ... (Reste des fonctions handleMarkAsRead et handleBroadcast identiques) ...
    const handleMarkAsRead = async (id: number) => {
        setUpdatingId(id);
        try {
            await NotificationService.markAsRead(id);
            setNotifications(prev =>
                prev.map(n => (n.id === id ? { ...n, lu: true } : n))
            );
            if (typeof window !== 'undefined' && navigator.vibrate) {
                navigator.vibrate(20);
            }
        } catch (error) {
            showToast.error("Erreur lors de la mise à jour");
        } finally {
            setUpdatingId(null);
        }
    };

    const handlePageChange = (newPage: number) => {
        if (newPage >= 1 && newPage <= (paginationMeta?.last_page || 1)) {
            setCurrentPage(newPage);
            // Vibration légère lors du changement de page
            if (navigator.vibrate) navigator.vibrate(10);
        }
    };



    const handleBroadcast = async () => {
        if (!broadcastMsg.trim()) return;
        setIsSending(true);
        try {
            await NotificationService.broadcast(broadcastMsg);
            showToast.success("Message diffusé");
            setBroadcastMsg("");
        } catch (error) { showToast.error("Erreur de diffusion"); }
        finally { setIsSending(false); }
    };

    return (
        <div className="p-4 sm:p-6 lg:p-8 space-y-6 sm:space-y-8 max-w-6xl mx-auto">

            {/* ========================================== */}
            {/* 📌 HEADER - Titre et actions */}
            {/* ========================================== */}
            <header className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 sm:gap-6">

                {/* Section titre et description */}
                <div className="space-y-2 flex-1">
                    {/* Titre principal avec icône */}
                    <div className="flex items-center gap-3 animate-fade-in-down">
                        {/* Icône Bell avec effet glow animé */}
                        <div
                            className="relative cursor-pointer"
                            onClick={() => {
                                setIsRinging(true);
                                setTimeout(() => setIsRinging(false), 2000);
                            }}
                        >
                            <div className="absolute inset-0 bg-[#FF2424] opacity-20 blur-xl rounded-full animate-pulse" />
                            <div className="absolute inset-0 bg-[#FF2424] opacity-30 blur-md rounded-full animate-ping-slow" />
                            <Bell className={`relative text-[#FF2424] w-7 h-7 sm:w-8 sm:h-8 shrink-0 drop-shadow-[0_0_12px_rgba(255,36,36,0.6)] ${isRinging ? 'animate-swing' : ''}`} />
                        </div>

                        {/* Titre */}
                        <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight animate-fade-in-right">
                            Centre de Notifications
                        </h1>
                    </div>

                    {/* Sous-titre / Description */}
                    <p className="text-slate-400 text-xs sm:text-sm pl-10 sm:pl-11 animate-fade-in-up animation-delay-100">
                        Communication & Alertes Système
                    </p>
                </div>
            </header>

            {/* ========================================== */}
            {/* 📋 GRID LAYOUT - Diffusion + Liste */}
            {/* ========================================== */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">

                {/* ========================================== */}
                {/* 📢 COLONNE GAUCHE - Diffusion d'alerte */}
                {/* ========================================== */}
                <div className="lg:col-span-1 space-y-6">
                    <article className="
            relative
            bg-slate-900/50 backdrop-blur-sm
            border border-slate-800/60
            rounded-2xl p-6
            shadow-xl
            overflow-hidden
            animate-fade-in-right
        ">
                        {/* Gradient décoratif en arrière-plan */}
                        <div className="absolute top-0 right-0 w-40 h-40 bg-linear-to-br from-[#FF2424]/10 to-transparent blur-3xl opacity-50" />

                        {/* Contenu principal */}
                        <div className="relative space-y-5">

                            {/* ========================================== */}
                            {/* 📌 EN-TÊTE - Titre avec icône */}
                            {/* ========================================== */}
                            <div className="pb-4 border-b border-slate-800/50">
                                <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2.5">
                                    <div className="relative">
                                        {/* Glow animé autour de l'icône */}
                                        <div className="absolute inset-0 bg-[#FF2424] opacity-20 blur-md rounded-full animate-pulse" />
                                        <Megaphone className="relative text-[#FF2424] w-5 h-5 sm:w-6 sm:h-6" />
                                    </div>
                                    <span className="tracking-tight">
                                        Diffuser une alerte
                                    </span>
                                </h2>
                            </div>

                            {/* ========================================== */}
                            {/* ✍️ FORMULAIRE DE DIFFUSION */}
                            {/* ========================================== */}
                            <div className="space-y-4">

                                {/* Label du textarea */}
                                <label
                                    htmlFor="broadcast-message"
                                    className="text-xs text-slate-400 uppercase font-semibold tracking-wide block"
                                >
                                    Message d&apos;alerte <span className="text-[#FF2424]">*</span>
                                </label>

                                {/* Textarea */}
                                <textarea
                                    id="broadcast-message"
                                    value={broadcastMsg}
                                    onChange={(e) => setBroadcastMsg(e.target.value)}
                                    placeholder="Écrivez votre message ici..."
                                    className="
                            w-full h-32 sm:h-36
                            bg-slate-950/80 
                            border border-slate-700/60
                            rounded-xl 
                            px-4 py-3
                            text-white text-sm
                            placeholder:text-slate-500
                            focus:border-[#FF2424] focus:ring-2 focus:ring-[#FF2424]/20
                            outline-none 
                            resize-none
                            transition-all duration-200
                            hover:border-slate-600
                        "
                                    maxLength={500}
                                />

                                {/* Compteur de caractères */}
                                <div className="flex items-center justify-between text-xs">
                                    <span className="text-slate-500">
                                        {broadcastMsg.length}/500 caractères
                                    </span>
                                    {broadcastMsg.length > 450 && (
                                        <span className="text-amber-500 font-semibold animate-pulse">
                                            Limite proche
                                        </span>
                                    )}
                                </div>
                            </div>

                            {/* ========================================== */}
                            {/* 🚀 BOUTON DE DIFFUSION */}
                            {/* ========================================== */}
                            <button
                                onClick={handleBroadcast}
                                disabled={isSending || !broadcastMsg.trim()}
                                className="
                        group relative w-full
                        bg-[#FF2424] hover:bg-[#D61F1F]
                        disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-[#FF2424]
                        text-white font-bold text-sm
                        py-3.5 rounded-xl
                        shadow-lg shadow-[#FF2424]/25
                        transition-all duration-200
                        hover:shadow-xl hover:shadow-[#FF2424]/40
                        active:scale-[0.98]
                        flex items-center justify-center gap-2.5
                        overflow-hidden
                    "
                            >
                                {/* Effet brillant au hover */}
                                <div className="absolute inset-0 bg-linear-to-r from-transparent via-white/10 to-transparent translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-700" />

                                {/* Contenu du bouton */}
                                <span className="relative flex items-center gap-2.5">
                                    {isSending ? (
                                        <>
                                            <Loader2 className="w-5 h-5 animate-spin" />
                                            <span className="tracking-wide">Envoi en cours...</span>
                                        </>
                                    ) : (
                                        <>
                                            <Send className="w-5 h-5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform duration-200" />
                                            <span className="tracking-wide">Diffuser maintenant</span>
                                        </>
                                    )}
                                </span>
                            </button>

                            {/* ========================================== */}
                            {/* ℹ️ INFO BOX - Conseils (optionnel) */}
                            {/* ========================================== */}
                            <div className="flex items-start gap-3 p-4 bg-blue-500/5 border border-blue-500/20 rounded-xl">
                                <div className="shrink-0 w-1 h-1 bg-blue-500 rounded-full mt-2 animate-pulse" />
                                <p className="text-xs text-slate-400 leading-relaxed">
                                    <span className="text-blue-400 font-semibold">Conseil :</span> Rédigez des messages clairs et concis pour une meilleure compréhension.
                                </p>
                            </div>
                        </div>
                    </article>
                </div>




                {/* ========================================== */}
                {/* 📬 COLONNE DROITE - Réception avec pagination */}
                {/* ========================================== */}
                <div className="lg:col-span-2 flex flex-col gap-6 animate-fade-in-right animation-delay-100">

                    {/* ========================================== */}
                    {/* 📌 EN-TÊTE - Titre et compteur total */}
                    {/* ========================================== */}
                    <div className="flex items-center justify-between gap-4 flex-wrap">

                        {/* Titre avec icône */}
                        <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2.5">
                            <div className="relative">
                                {/* Glow subtil autour de l'icône */}
                                <div className="absolute inset-0 bg-slate-400/20 blur-md rounded-full animate-pulse" />
                                <Inbox className="relative text-slate-400 w-5 h-5 sm:w-6 sm:h-6" />
                            </div>
                            <span className="tracking-tight">
                                Messages récents
                            </span>
                        </h2>

                        {/* Badge compteur total */}
                        {paginationMeta && (
                            <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-800/50 backdrop-blur-sm border border-slate-700/60 rounded-full">
                                <span className="text-xs text-slate-400 font-semibold">
                                    Total
                                </span>
                                <span className="text-xs text-white font-bold tabular-nums">
                                    {paginationMeta.total}
                                </span>
                            </div>
                        )}
                    </div>


                    {/* ========================================== */}
                    {/* 📋 LISTE DES NOTIFICATIONS */}
                    {/* ========================================== */}
                    <div className="space-y-3 min-h-125">
                        {loading ? (
                            /* ========================================== */
                            /* ⏳ SKELETON LOADER - État de chargement */
                            /* ========================================== */
                            Array(5).fill(0).map((_, i) => (
                                <div
                                    key={i}
                                    className="relative h-24 bg-slate-900/40 border border-slate-800/60 rounded-2xl overflow-hidden"
                                >
                                    {/* Effet shimmer qui traverse */}
                                    <div className="absolute inset-0 bg-linear-to-r from-transparent via-slate-700/10 to-transparent -translate-x-full animate-shimmer" />

                                    {/* Contenu skeleton */}
                                    <div className="p-5 space-y-3 animate-pulse">
                                        <div className="h-4 bg-slate-800/60 rounded w-3/4" />
                                        <div className="h-3 bg-slate-800/60 rounded w-1/2" />
                                    </div>
                                </div>
                            ))
                        ) : notifications.length === 0 ? (
                            /* ========================================== */
                            /* 📭 EMPTY STATE - Aucune notification */
                            /* ========================================== */
                            <div className="flex flex-col items-center justify-center py-20 bg-slate-900/20 border-2 border-dashed border-slate-800/60 rounded-3xl">
                                <div className="relative mb-6">
                                    <div className="absolute inset-0 bg-slate-700/20 blur-2xl rounded-full animate-pulse" />
                                    <Inbox className="relative text-slate-700 w-16 h-16" />
                                </div>
                                <p className="text-slate-500 font-semibold text-base tracking-wide">
                                    Aucune notification
                                </p>
                                <p className="text-slate-600 text-sm mt-2">
                                    Vous êtes à jour !
                                </p>
                            </div>
                        ) : (
        /* ========================================== */
        /* 💬 CARTES DE NOTIFICATIONS */
        /* ========================================== */
        notifications.map((notif) => {
            const isUnread = !notif.lu;

                        return (
                        <article
                            key={notif.id}
                            className={`
                        group relative 
                        p-5 rounded-2xl border
                        transition-all duration-300 ease-out
                        ${isUnread
                                    ? 'bg-slate-900/50 backdrop-blur-sm border-slate-800/60 hover:border-[#FF2424]/50 hover:bg-slate-900/70 shadow-lg hover:shadow-xl'
                                    : 'bg-slate-900/20 border-slate-800/30 opacity-60 hover:opacity-80'
                                }
                    `}
                        >
                            {/* Badge "Nouveau" pour les messages non lus */}
                            {isUnread && (
                                <div className="absolute -top-2 -right-2 px-2 py-1 bg-[#FF2424] text-white text-[10px] font-bold uppercase rounded-full shadow-lg shadow-[#FF2424]/30 animate-bounce-slow">
                                    Nouveau
                                </div>
                            )}

                            <div className="flex justify-between items-start gap-4">

                                {/* ========================================== */}
                                {/* 💬 CONTENU DU MESSAGE */}
                                {/* ========================================== */}
                                <div className="flex-1 min-w-0 space-y-3">

                                    {/* Message */}
                                    <p className={`
                                text-sm leading-relaxed
                                ${isUnread
                                            ? 'text-slate-100 font-medium'
                                            : 'text-slate-400 font-light'
                                        }
                            `}>
                                        {notif.message}
                                    </p>

                                    {/* Métadonnées (date + indicateur non lu) */}
                                    <div className="flex items-center gap-3 flex-wrap">

                                        {/* Date et heure */}
                                        <div className="flex items-center gap-1.5 text-[10px] sm:text-xs text-slate-500 font-semibold">
                                            <Clock className="w-3 h-3 text-[#FF2424]/50 shrink-0" />
                                            <time dateTime={notif.date_creation}>
                                                {format(new Date(notif.date_creation), 'dd MMMM yyyy HH:mm', { locale: fr })}
                                            </time>
                                        </div>

                                        {/* Indicateur "non lu" animé */}
                                        {isUnread && (
                                            <div className="flex items-center gap-1.5">
                                                <span className="relative flex h-2 w-2">
                                                    {/* Ping animé */}
                                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#FF2424] opacity-75" />
                                                    {/* Dot statique */}
                                                    <span className="relative inline-flex rounded-full h-2 w-2 bg-[#FF2424]" />
                                                </span>
                                                <span className="text-[10px] text-[#FF2424] font-bold uppercase tracking-wide">
                                                    Non lu
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* ========================================== */}
                                {/* ✅ BOUTON "MARQUER COMME LU" */}
                                {/* ========================================== */}
                                {isUnread && (
                                    <button
                                        onClick={() => handleMarkAsRead(notif.id)}
                                        disabled={updatingId === notif.id}
                                        className={`
                                    shrink-0
                                    p-2.5 rounded-xl
                                    bg-[#FF2424]/10 text-[#FF2424]
                                    border border-[#FF2424]/20
                                    hover:bg-[#FF2424] hover:text-white hover:border-[#FF2424]
                                    transition-all duration-200
                                    disabled:opacity-50 disabled:cursor-not-allowed
                                    ${updatingId === notif.id
                                                ? 'opacity-100'
                                                : 'opacity-0 group-hover:opacity-100'
                                            }
                                `}
                                        title="Marquer comme lu"
                                        aria-label="Marquer cette notification comme lue"
                                    >
                                        {updatingId === notif.id ? (
                                            <Loader2 className="w-4 h-4 animate-spin" />
                                        ) : (
                                            <CheckCheck className="w-4 h-4" />
                                        )}
                                    </button>
                                )}
                            </div>
                        </article>
                        );
        })
    )}
                    </div>

                    {/* ========================================== */}
                    {/* 📄 PAGINATION - Contrôles de navigation */}
                    {/* ========================================== */}
                    {paginationMeta && paginationMeta.last_page > 1 && (
                        <nav
                            className="flex items-center justify-between gap-4 pt-6 border-t border-slate-800/60 mt-4"
                            aria-label="Pagination des notifications"
                        >
                            {/* Indicateur de page */}
                            <div className="text-xs sm:text-sm text-slate-500 font-medium">
                                Page{' '}
                                <span className="text-white font-bold tabular-nums">
                                    {currentPage}
                                </span>
                                {' '}sur{' '}
                                <span className="text-white font-bold tabular-nums">
                                    {paginationMeta.last_page}
                                </span>
                            </div>

                            {/* Contrôles de navigation */}
                            <div className="flex items-center gap-2 sm:gap-3">

                                {/* Bouton Précédent */}
                                <button
                                    onClick={() => handlePageChange(currentPage - 1)}
                                    disabled={currentPage === 1 || loading}
                                    aria-label="Page précédente"
                                    className="
                        p-2 sm:p-2.5
                        bg-slate-900/50 backdrop-blur-sm
                        border border-slate-800/60
                        text-slate-400
                        rounded-xl
                        hover:border-[#FF2424]/60 hover:text-[#FF2424] hover:bg-slate-900/70
                        disabled:opacity-20 disabled:cursor-not-allowed disabled:hover:border-slate-800/60 disabled:hover:text-slate-400
                        transition-all duration-200
                        active:scale-95
                    "
                                >
                                    <ChevronLeft className="w-5 h-5" />
                                </button>

                                {/* Indicateur page courante */}
                                <div className="
                    min-w-10 h-10
                    flex items-center justify-center
                    bg-[#FF2424]/10
                    text-[#FF2424]
                    border border-[#FF2424]/30
                    rounded-xl
                    text-sm font-bold
                    tabular-nums
                    shadow-lg shadow-[#FF2424]/20
                ">
                                    {currentPage}
                                </div>

                                {/* Bouton Suivant */}
                                <button
                                    onClick={() => handlePageChange(currentPage + 1)}
                                    disabled={currentPage === paginationMeta.last_page || loading}
                                    aria-label="Page suivante"
                                    className="
                        p-2 sm:p-2.5
                        bg-slate-900/50 backdrop-blur-sm
                        border border-slate-800/60
                        text-slate-400
                        rounded-xl
                        hover:border-[#FF2424]/60 hover:text-[#FF2424] hover:bg-slate-900/70
                        disabled:opacity-20 disabled:cursor-not-allowed disabled:hover:border-slate-800/60 disabled:hover:text-slate-400
                        transition-all duration-200
                        active:scale-95
                    "
                                >
                                    <ChevronRight className="w-5 h-5" />
                                </button>
                            </div>
                        </nav>
                    )}
                </div>
            </div>
        </div>
    );
}