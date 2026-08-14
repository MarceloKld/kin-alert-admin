"use client"; // Indique à Next.js que ce composant utilise du state (côté client)

import React, { useEffect, useState } from 'react';
import {
    Eye, CheckCircle, XCircle, ChevronLeft, ChevronRight,
    Activity, LayoutGrid, Clock, ShieldCheck, ShieldAlert, Trash2, Loader2, ImageIcon
} from 'lucide-react'; // Importation des icônes SVG premium

// Importation de nos services de communication avec Laravel
import { IncidentAdminService } from '@/services/incident.service';
import { DashboardService } from '@/services/dashboard.service';

// Importation des composants UI
import { IncidentDetailModal } from '@/components/features/modals/IncidentDetailModal';
import { IncidentSkeleton } from '@/components/ui/IncidentSkeleton';
import { Toast, ToastType } from '@/components/ui/Toast';
import { DashboardStats } from "@/types";

export default function IncidentsPage() {
    // --- ÉTATS (STATES) ---
    const [data, setData] = useState<any>(null); // Stocke les incidents paginés
    const [stats, setStats] = useState<any>(null); // Stocke les chiffres du dashboard (37, 19, etc.)
    const [loading, setLoading] = useState(true); // État de chargement initial
    const [navigating, setNavigating] = useState(false); // État de chargement des boutons page/filtre
    const [activeFilter, setActiveFilter] = useState<string>('all'); // Filtre sélectionné
    const [currentPage, setCurrentPage] = useState(1); // Page actuelle

    // États pour le Modal et le Toast
    const [selectedIncident, setSelectedIncident] = useState<any>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [toast, setToast] = useState<{ message: string, type: ToastType } | null>(null);

    // --- LOGIQUE DE CHARGEMENT ---

    // useEffect : S'exécute au chargement et chaque fois que la page ou le filtre change
    useEffect(() => {
        loadAllData();
    }, [currentPage, activeFilter]);

    // Dans ton fichier page.tsx

    // Dans loadAllData
    const loadAllData = async () => {
        setNavigating(true);
        try {
            const [dashboardRes, incidentRes] = await Promise.all([
                DashboardService.getStats(),
                IncidentAdminService.getAllIncidents(currentPage, activeFilter)
            ]);

            // PROF : Voilà le secret ! 
            // Ton debug montre que les chiffres sont dans dashboardRes.stats
            if (dashboardRes && dashboardRes.stats) {
                setStats(dashboardRes.stats);
            }

            setData(incidentRes);
        } catch (error) {
            showToast("Erreur de synchronisation", "error");
        } finally {
            setLoading(false);
            setNavigating(false);
        }
    };

    // Fonction pour afficher une notification propre
    const showToast = (message: string, type: ToastType) => {
        setToast({ message, type });
    };

    // Fonction de modération (Valider / Rejeter)
    const handleAction = async (id: number, status: 'valide' | 'rejete') => {
        showToast("Mise à jour en cours...", "loading");
        try {
            await IncidentAdminService.updateStatus(id, status);
            showToast("Statut mis à jour avec succès", "success");
            loadAllData(); // On rafraîchit tout pour mettre à jour les compteurs et la liste
        } catch (error: any) {
            showToast("Erreur : Action non autorisée", "error");
        }
    };

    // Si c'est le premier chargement, on affiche le squelette animé
    if (loading) return <div className="p-8 bg-[#0b101a] min-h-screen"><IncidentSkeleton /></div>;

    return (
        <div className="p-8 bg-[#0b101a] min-h-screen text-slate-300">
            {/* Système de notification flottant */}
            {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

            {/* TITRE DE LA PAGE */}
            <div className="mb-10">

                
                <h2 className="text-2xl font-black text-white uppercase tracking-tighter flex items-center gap-3">
                    <Activity className="text-red-600 animate-pulse" />
                    Kin-Alert Ops Center
                </h2>
                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-[0.3em] mt-1">Supervision des incidents urbains</p>
            </div>
            {/* --- BARRE DE FILTRES --- */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
                {[
                    { id: 'all', label: 'Total', key: 'incidents_total', icon: LayoutGrid, color: 'blue' },
                    { id: 'en_attente', label: 'En Attente', key: 'incidents_pending', icon: Clock, color: 'amber' },
                    { id: 'valide', label: 'Validés', key: 'incidents_validated', icon: ShieldCheck, color: 'emerald' },
                    { id: 'rejete', label: 'Rejetés', key: 'incidents_rejected', icon: ShieldAlert, color: 'rose' },
                    { id: 'supprime', label: 'Supprimés', key: 'incidents_deleted', icon: Trash2, color: 'slate' },
                ].map((item) => {

                    // PROF : stats contient maintenant directement l'objet {incidents_total: 37, ...}
                    const countValue = stats ? (stats as any)[item.key] : 0;

                    return (
                        <button
                            key={item.id}
                            onClick={() => { setActiveFilter(item.id); setCurrentPage(1); }}
                            className={`p-4 rounded-2xl border transition-all duration-500 flex flex-col items-start gap-2 group
        ${activeFilter === item.id
                                    ? `bg-${item.color}-500/10 border-${item.color}-500/50`
                                    : 'bg-[#151c2c] border-slate-800'}`}
                        >
                            <div className={`p-2 rounded-lg ${activeFilter === item.id ? `bg-${item.color}-500/20 text-${item.color}-500` : 'bg-slate-900 text-slate-500'}`}>
                                <item.icon size={18} />
                            </div>
                            <div>
                                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{item.label}</p>
                                <p className="text-xl font-black text-white leading-none mt-1">
                                    {countValue}
                                </p>
                            </div>
                        </button>
                    );
                })}
            </div>

            
            {/* --- TABLEAU DES INCIDENTS --- */}
            <div className="bg-[#151c2c] border border-slate-800/60 rounded-3xl shadow-2xl overflow-hidden backdrop-blur-md">
                <table className="w-full text-left">
                    <thead className="bg-[#0f172a]/80 border-b border-slate-800">
                        <tr>
                            <th className="px-6 py-5 text-[10px] font-black text-slate-500 uppercase tracking-widest">Détails Incident</th>
                            <th className="px-6 py-5 text-[10px] font-black text-slate-500 uppercase tracking-widest">Média</th>
                            <th className="px-6 py-5 text-[10px] font-black text-slate-500 uppercase tracking-widest">Localisation</th>
                            <th className="px-6 py-5 text-[10px] font-black text-slate-500 uppercase tracking-widest">Statut</th>
                            <th className="px-6 py-5 text-[10px] font-black text-slate-500 uppercase tracking-widest text-right">Décision</th>
                        </tr>
                    </thead>
                    <tbody className={`divide-y divide-slate-800/40 transition-opacity duration-300 ${navigating ? 'opacity-30' : 'opacity-100'}`}>
                        {data?.data.map((incident: any) => (
                            <tr key={incident.id} className="group hover:bg-white/2 transition-colors">
                                <td className="px-6 py-4">
                                    <div className="flex flex-col">
                                        <span className="text-sm font-bold text-slate-200 group-hover:text-red-500 transition-colors uppercase">{incident.titre}</span>
                                        <span className="text-[10px] font-mono text-slate-500">{incident.date_creation}</span>
                                    </div>
                                </td>

                                {/* Visualisation Photo : miniature avec badge du nombre de photos */}
                                <td className="px-6 py-4">
                                    {incident.preuves && incident.preuves.length > 0 ? (
                                        <div className="relative w-12 h-9 rounded-lg overflow-hidden border border-slate-700 bg-slate-900 group/thumb">
                                            <img src={incident.preuves[0].url} className="w-full h-full object-cover transition-transform group-hover/thumb:scale-110" />
                                            {incident.preuves.length > 1 && (
                                                <div className="absolute top-0 right-0 bg-red-600 text-[8px] font-bold px-1 text-white">+{incident.preuves.length - 1}</div>
                                            )}
                                        </div>
                                    ) : (
                                        <div className="w-12 h-9 rounded-lg border border-slate-800 flex items-center justify-center text-slate-700"><ImageIcon size={14} /></div>
                                    )}
                                </td>

                                <td className="px-6 py-4">
                                    <div className="flex flex-col">
                                        <span className="text-xs font-bold text-slate-300">{incident.commune?.nom}</span>
                                        <span className="text-[9px] text-slate-500 uppercase">{incident.avenue}</span>
                                    </div>
                                </td>

                                <td className="px-6 py-4">
                                    <span className={`px-2 py-0.5 rounded text-[9px] font-black border uppercase ${incident.statut === 'en_attente' ? 'bg-amber-500/5 border-amber-500/20 text-amber-500' :
                                            incident.statut === 'valide' ? 'bg-emerald-500/5 border-emerald-500/20 text-emerald-500' : 'bg-rose-500/5 border-rose-500/20 text-rose-500'
                                        }`}>
                                        {incident.statut.replace('_', ' ')}
                                    </span>
                                </td>

                                <td className="px-6 py-4">
                                    <div className="flex justify-end gap-2">
                                        <button onClick={() => { setSelectedIncident(incident); setIsModalOpen(true); }} className="p-2 hover:bg-slate-800 rounded-xl text-slate-400"><Eye size={16} /></button>
                                        <button onClick={() => handleAction(incident.id, 'valide')} className="p-2 hover:bg-emerald-500/20 rounded-xl text-emerald-500"><CheckCircle size={16} /></button>
                                        <button onClick={() => handleAction(incident.id, 'rejete')} className="p-2 hover:bg-rose-500/20 rounded-xl text-rose-500"><XCircle size={16} /></button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                {/* --- PAGINATION (DESIGN SCREENSHOT) --- */}
                <div className="px-6 py-6 bg-[#0f172a] border-t border-slate-800 flex justify-between items-center">
                    <div className="flex items-center gap-6">
                        <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
                            {data?.from}-{data?.to} de {data?.total} entrées
                        </span>
                    </div>

                    <div className="flex items-center gap-4">
                        <span className="text-[10px] font-black text-white uppercase tracking-widest">Page {data?.current_page} / {data?.last_page}</span>
                        <div className="flex gap-2">
                            <button
                                disabled={currentPage === 1 || navigating}
                                onClick={() => setCurrentPage(p => p - 1)}
                                className="px-5 py-2 bg-[#151c2c] border border-slate-800 rounded-xl text-[10px] font-black uppercase text-slate-400 hover:text-white disabled:opacity-20 flex items-center gap-2 transition-all"
                            >
                                {navigating && currentPage !== 1 ? <Loader2 size={12} className="animate-spin" /> : <ChevronLeft size={12} />}
                                Précédent
                            </button>
                            <button
                                disabled={currentPage === data?.last_page || navigating}
                                onClick={() => setCurrentPage(p => p + 1)}
                                className="px-5 py-2 bg-[#151c2c] border border-slate-800 rounded-xl text-[10px] font-black uppercase text-slate-400 hover:text-white disabled:opacity-20 flex items-center gap-2 transition-all"
                            >
                                Suivant
                                {navigating && currentPage !== data?.last_page ? <Loader2 size={12} className="animate-spin" /> : <ChevronRight size={12} />}
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <IncidentDetailModal incident={selectedIncident} isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
        </div>
    );
}