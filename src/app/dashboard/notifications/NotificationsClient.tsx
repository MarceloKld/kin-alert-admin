"use client";

import React, { useEffect, useState, useCallback } from 'react';
import { NotificationService } from '@/services/notification.service';
import { NotificationItem, NotificationResponse } from '@/types/notification';
import { showToast } from '@/lib/toast-utils';
import { Megaphone, Bell, Send, CheckCheck, Inbox, Clock, ShieldAlert, ChevronLeft, ChevronRight } from 'lucide-react';
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

    // Remplacer les lignes 21 à 37 par ceci :

    useEffect(() => {
        const loadNotifications = async () => {
            setLoading(true);
            try {
                const res = await NotificationService.getPersonal(currentPage);
                setNotifications(res.data);
                setPaginationMeta(res.meta);
            } catch (error) {
                showToast.error("Impossible de charger vos notifications");
            } finally {
                setLoading(false);
            }
        };

        loadNotifications();
    }, [currentPage]);

    const handlePageChange = (newPage: number) => {
        if (newPage >= 1 && newPage <= (paginationMeta?.last_page || 1)) {
            setCurrentPage(newPage);
            // Vibration légère lors du changement de page
            if (navigator.vibrate) navigator.vibrate(10);
        }
    };

    // ... (Reste des fonctions handleMarkAsRead et handleBroadcast identiques) ...
    const handleMarkAsRead = async (id: number) => {
        try {
            await NotificationService.markAsRead(id);
            setNotifications(prev => prev.map(n => n.id === id ? { ...n, lu: true } : n));
            if (navigator.vibrate) navigator.vibrate(20);
        } catch (error) { showToast.error("Erreur"); }
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
        <div className="p-6 space-y-8 max-w-6xl mx-auto">
            {/* Header ... */}
            <div className="flex justify-between items-end">
                <div>
                    <h1 className="text-3xl font-bold text-white flex items-center gap-3">
                        <Bell className="text-[#FF2424] w-8 h-8" />
                        CENTRE DE NOTIFICATIONS
                    </h1>
                    <p className="text-slate-500 mt-2 text-sm uppercase tracking-widest font-medium">Communication & Alertes Système</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* COLONNE GAUCHE : DIFFUSION */}
                <div className="lg:col-span-1 space-y-6">
                    {/* ... Le bloc de diffusion reste le même ... */}
                    <div className="bg-[#141A28] border border-slate-800 rounded-2xl p-6 shadow-xl relative overflow-hidden">
                        <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                            <Megaphone className="text-[#FF2424] w-5 h-5" /> Diffuser une alerte
                        </h2>
                        <textarea
                            value={broadcastMsg}
                            onChange={(e) => setBroadcastMsg(e.target.value)}
                            placeholder="Écrivez votre message ici..."
                            className="w-full h-32 bg-[#080C14] border border-slate-700 rounded-xl p-4 text-white text-sm focus:ring-1 focus:ring-[#FF2424] outline-none resize-none transition-all"
                        />
                        <button
                            onClick={handleBroadcast}
                            disabled={isSending || !broadcastMsg}
                            className="w-full mt-4 bg-[#FF2424] hover:bg-[#D61F1F] text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2 transition-all active:scale-95 disabled:opacity-30 shadow-lg shadow-[#FF2424]/10"
                        >
                            <Send size={18} />
                            {isSending ? "ENVOI..." : "DIFFUSER MAINTENANT"}
                        </button>
                    </div>
                </div>

                {/* COLONNE DROITE : RÉCEPTION AVEC PAGINATION */}
                <div className="lg:col-span-2 flex flex-col gap-4">
                    <div className="flex items-center justify-between">
                        <h2 className="text-lg font-bold text-white flex items-center gap-2">
                            <Inbox className="text-slate-400 w-5 h-5" /> Messages récents
                        </h2>
                        {paginationMeta && (
                            <span className="text-[10px] text-slate-500 bg-slate-800/50 px-3 py-1 rounded-full border border-slate-700 font-mono italic">
                                Total: {paginationMeta.total}
                            </span>
                        )}
                    </div>

                    {/* Liste des notifications */}
                    <div className="space-y-3 min-h-[500px]">
                        {loading ? (
                            Array(5).fill(0).map((_, i) => (
                                <div key={i} className="h-24 bg-[#141A28] border border-slate-800 rounded-2xl animate-pulse" />
                            ))
                        ) : (
                            notifications.map((notif) => (
                                <div
                                    key={notif.id}
                                    className={`group relative p-5 rounded-2xl border transition-all duration-300 ${notif.lu
                                            ? 'bg-[#141A28]/40 border-slate-800/50 opacity-60'
                                            : 'bg-[#141A28] border-slate-800 hover:border-[#FF2424]/40 shadow-xl'
                                        }`}
                                >
                                    <div className="flex justify-between items-start gap-4">
                                        <div className="space-y-1">
                                            <p className={`text-sm leading-relaxed ${notif.lu ? 'text-slate-400 font-light italic' : 'text-slate-100 font-medium'}`}>
                                                {notif.message}
                                            </p>
                                            <div className="flex items-center gap-3 mt-3">
                                                <div className="flex items-center gap-1.5 text-[10px] text-slate-500 uppercase font-bold tracking-tighter">
                                                    <Clock size={12} className="text-[#FF2424]/50" />
                                                    {format(new Date(notif.date_creation), 'dd MMMM yyyy HH:mm', { locale: fr })}
                                                </div>
                                                {!notif.lu && (
                                                    <span className="w-1.5 h-1.5 bg-[#FF2424] rounded-full animate-ping" />
                                                )}
                                            </div>
                                        </div>
                                        {!notif.lu && (
                                            <button
                                                onClick={() => handleMarkAsRead(notif.id)}
                                                className="p-2 bg-[#FF2424]/10 text-[#FF2424] rounded-lg hover:bg-[#FF2424] hover:text-white transition-all opacity-0 group-hover:opacity-100"
                                            >
                                                <CheckCheck size={16} />
                                            </button>
                                        )}
                                    </div>
                                </div>
                            ))
                        )}
                    </div>

                    {/* CONTRÔLES DE PAGINATION PREMIUM */}
                    {paginationMeta && paginationMeta.last_page > 1 && (
                        <div className="flex items-center justify-between pt-6 border-t border-slate-800 mt-4">
                            <div className="text-xs text-slate-500">
                                Page <span className="text-white font-bold">{currentPage}</span> sur <span className="text-white font-bold">{paginationMeta.last_page}</span>
                            </div>

                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => handlePageChange(currentPage - 1)}
                                    disabled={currentPage === 1 || loading}
                                    className="p-2 bg-[#141A28] border border-slate-800 text-slate-400 rounded-lg hover:border-[#FF2424] hover:text-white disabled:opacity-20 disabled:cursor-not-allowed transition-all"
                                >
                                    <ChevronLeft size={20} />
                                </button>

                                <div className="flex items-center gap-1">
                                    {/* On peut générer des petits points ou numéros ici */}
                                    <span className="w-8 h-8 flex items-center justify-center bg-[#FF2424]/10 text-[#FF2424] border border-[#FF2424]/20 rounded-lg text-xs font-bold font-mono">
                                        {currentPage}
                                    </span>
                                </div>

                                <button
                                    onClick={() => handlePageChange(currentPage + 1)}
                                    disabled={currentPage === paginationMeta.last_page || loading}
                                    className="p-2 bg-[#141A28] border border-slate-800 text-slate-400 rounded-lg hover:border-[#FF2424] hover:text-white disabled:opacity-20 disabled:cursor-not-allowed transition-all"
                                >
                                    <ChevronRight size={20} />
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}