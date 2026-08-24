"use client";

import React, { useEffect, useState, useCallback } from 'react';
import { NotificationService } from '@/services/notification.service';
import { NotificationItem } from '@/types/notification';
import { showToast } from '@/lib/toast-utils';
import { Megaphone, Bell, Send, CheckCheck, Inbox, Clock, ShieldAlert } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

export default function NotificationsClient() {
    const [notifications, setNotifications] = useState<NotificationItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [broadcastMsg, setBroadcastMsg] = useState("");
    const [isSending, setIsSending] = useState(false);

    // Charger les notifications
    // Remplacez le bloc useCallback + useEffect par ceci :

    useEffect(() => {
        const fetchNotifications = async () => {
            try {
                const res = await NotificationService.getPersonal();
                setNotifications(res.data);
            } catch (error) {
                console.error(error);
                showToast.error("Impossible de charger vos notifications");
            } finally {
                setLoading(false);
            }
        };

        fetchNotifications();
    }, []);

    // Marquer comme lue
    const handleMarkAsRead = async (id: number) => {
        try {
            await NotificationService.markAsRead(id);
            setNotifications(prev =>
                prev.map(n => n.id === id ? { ...n, lu: true } : n)
            );
            if (navigator.vibrate) navigator.vibrate(20);
        } catch (error) {
            console.error(error);
            showToast.error("Erreur lors de la mise à jour");
        }
    };

    // Envoyer un broadcast
    const handleBroadcast = async () => {
        if (!broadcastMsg.trim()) return;
        setIsSending(true);
        try {
            await NotificationService.broadcast(broadcastMsg);
            showToast.success("Message diffusé à tous les utilisateurs");
            setBroadcastMsg("");
            // Son de succès
            new Audio('/sounds/broadcast.mp3').play().catch(() => { });
        } catch (error) {
            console.error(error);
            showToast.error("Erreur lors de la diffusion");
        } finally {
            setIsSending(false);
        }
    };

    return (
        <div className="p-6 space-y-8 max-w-6xl mx-auto">
            {/* Header */}
            <div className="flex justify-between items-end">
                <div>
                    <h1 className="text-3xl font-bold text-white flex items-center gap-3">
                        <Bell className="text-[#FF2424] w-8 h-8" />
                        CENTRE DE NOTIFICATIONS
                    </h1>
                    <p className="text-slate-500 mt-2 text-sm uppercase tracking-widest font-medium">
                        Communication & Alertes Système
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                {/* COLONNE GAUCHE : DIFFUSION (ADMIN) */}
                <div className="lg:col-span-1 space-y-6">
                    <div className="bg-[#141A28] border border-slate-800 rounded-2xl p-6 shadow-xl relative overflow-hidden">
                        <div className="absolute -top-4 -right-4 opacity-5">
                            <Megaphone size={120} className="text-[#FF2424]" />
                        </div>

                        <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                            <Megaphone className="text-[#FF2424] w-5 h-5" />
                            Diffuser une alerte
                        </h2>

                        <textarea
                            value={broadcastMsg}
                            onChange={(e) => setBroadcastMsg(e.target.value)}
                            placeholder="Écrivez votre message ici..."
                            className="w-full h-32 bg-[#080C14] border border-slate-700 rounded-xl p-4 text-white text-sm focus:ring-1 focus:ring-[#FF2424] focus:border-[#FF2424] outline-none transition-all resize-none"
                        />

                        <button
                            onClick={handleBroadcast}
                            disabled={isSending || !broadcastMsg}
                            className="w-full mt-4 bg-[#FF2424] hover:bg-[#D61F1F] text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2 transition-all active:scale-95 disabled:opacity-30 disabled:cursor-not-allowed shadow-lg shadow-[#FF2424]/10"
                        >
                            <Send size={18} />
                            {isSending ? "ENVOI EN COURS..." : "DIFFUSER MAINTENANT"}
                        </button>

                        <div className="mt-6 p-4 bg-[#FF2424]/5 border border-[#FF2424]/20 rounded-lg">
                            <div className="flex gap-3">
                                <ShieldAlert size={16} className="text-[#FF2424] shrink-0" />
                                <p className="text-[11px] text-slate-400 leading-relaxed">
                                    Attention : ce message sera visible par TOUS les citoyens sur l&apos;application mobile KIN ALERT.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* COLONNE DROITE : RÉCEPTION (TOUS) */}
                <div className="lg:col-span-2 space-y-4">
                    <div className="flex items-center justify-between mb-2">
                        <h2 className="text-lg font-bold text-white flex items-center gap-2">
                            <Inbox className="text-slate-400 w-5 h-5" />
                            Vos messages récents
                        </h2>
                        <span className="text-xs text-slate-500 bg-slate-800/50 px-3 py-1 rounded-full border border-slate-700">
                            {notifications.length} notifications
                        </span>
                    </div>

                    <div className="space-y-3 h-[600px] overflow-y-auto pr-2 custom-scrollbar">
                        {loading ? (
                            Array(4).fill(0).map((_, i) => (
                                <div key={i} className="h-20 bg-[#141A28] border border-slate-800 rounded-xl animate-pulse" />
                            ))
                        ) : notifications.length === 0 ? (
                            <div className="text-center py-20 bg-[#141A28] border border-slate-800 rounded-2xl border-dashed">
                                <Bell className="mx-auto text-slate-700 w-12 h-12 mb-3" />
                                <p className="text-slate-500">Aucune notification pour le moment.</p>
                            </div>
                        ) : (
                            notifications.map((notif) => (
                                <div
                                    key={notif.id}
                                    className={`group relative p-5 rounded-2xl border transition-all duration-300 ${notif.lu
                                            ? 'bg-[#141A28]/40 border-slate-800/50 opacity-70'
                                            : 'bg-[#141A28] border-slate-800 hover:border-[#FF2424]/30 shadow-lg'
                                        }`}
                                >
                                    <div className="flex justify-between items-start gap-4">
                                        <div className="space-y-1">
                                            <p className={`text-sm leading-relaxed ${notif.lu ? 'text-slate-400' : 'text-slate-100 font-medium'}`}>
                                                {notif.message}
                                            </p>
                                            <div className="flex items-center gap-3 mt-3">
                                                <div className="flex items-center gap-1.5 text-[10px] text-slate-500 uppercase font-bold tracking-wider">
                                                    <Clock size={12} />
                                                    {format(new Date(notif.date_creation), 'dd MMMM yyyy HH:mm', { locale: fr })}
                                                </div>
                                                {!notif.lu && (
                                                    <span className="w-2 h-2 bg-[#FF2424] rounded-full animate-pulse shadow-[0_0_8px_#FF2424]" />
                                                )}
                                            </div>
                                        </div>

                                        {!notif.lu && (
                                            <button
                                                onClick={() => handleMarkAsRead(notif.id)}
                                                className="p-2 bg-[#FF2424]/10 text-[#FF2424] rounded-lg hover:bg-[#FF2424] hover:text-white transition-all opacity-0 group-hover:opacity-100"
                                                title="Marquer comme lu"
                                            >
                                                <CheckCheck size={16} />
                                            </button>
                                        )}
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}