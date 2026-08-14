"use client";
import React, { useEffect, useState } from 'react';
import { Eye, CheckCircle, XCircle, ChevronLeft, ChevronRight, Activity, ChevronDown, ImageIcon, Loader2 } from 'lucide-react';
import { IncidentAdminService } from '@/services/incident.service';
import { IncidentDetailModal } from '@/components/features/modals/IncidentDetailModal';
import { IncidentSkeleton } from '@/components/ui/IncidentSkeleton';
import { Toast, ToastType } from '@/components/ui/Toast';

export default function IncidentsPage() {
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [navigating, setNavigating] = useState(false); // État spécifique pour les boutons Précédent/Suivant
    const [currentPage, setCurrentPage] = useState(1);
    const [selectedIncident, setSelectedIncident] = useState<any>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [toast, setToast] = useState<{ message: string, type: ToastType } | null>(null);

    useEffect(() => { loadPage(currentPage); }, [currentPage]);

    const loadPage = async (page: number) => {
        if (data) setNavigating(true); // Si on a déjà des données, on active le mode "navigation"
        else setLoading(true);

        try {
            const res = await IncidentAdminService.getAllIncidents(page);
            setData(res);
        } catch (error) {
            setToast({ message: "Erreur serveur", type: 'error' });
        } finally {
            setLoading(false);
            setNavigating(false);
        }
    };

    const handleAction = async (id: number, status: 'valide' | 'rejete') => {
        setToast({ message: "Mise à jour du statut...", type: 'loading' });
        try {
            await IncidentAdminService.updateStatus(id, status);
            setToast({ message: `Incident #${id} traité`, type: 'success' });
            loadPage(currentPage);
        } catch (error: any) {
            setToast({ message: "Action impossible", type: 'error' });
        }
    };

    if (loading) return <div className="p-8 bg-[#0b101a] min-h-screen"><IncidentSkeleton /></div>;

    return (
        <div className="p-8 bg-[#0b101a] min-h-screen">
            {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

            <div className="mb-8 flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-black text-white uppercase tracking-tighter flex items-center gap-3">
                        <Activity className="text-red-600 animate-pulse" /> Surveillance Live
                    </h2>
                    <div className="h-1 w-20 bg-red-600 mt-2 rounded-full"></div>
                </div>
            </div>

            <div className="bg-[#151c2c] border border-slate-800/60 rounded-2xl shadow-2xl overflow-hidden backdrop-blur-sm">
                <table className="w-full text-left">
                    <thead className="bg-[#0f172a] border-b border-slate-800">
                        <tr>
                            <th className="px-6 py-5 text-[10px] font-black text-slate-500 uppercase tracking-widest">Informations</th>
                            <th className="px-6 py-5 text-[10px] font-black text-slate-500 uppercase tracking-widest">Preuves Visuelles</th>
                            <th className="px-6 py-5 text-[10px] font-black text-slate-500 uppercase tracking-widest text-center">Zone</th>
                            <th className="px-6 py-5 text-[10px] font-black text-slate-500 uppercase tracking-widest">Statut</th>
                            <th className="px-6 py-5 text-[10px] font-black text-slate-500 uppercase tracking-widest text-right">Décision</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/40">
                        {data?.data.map((incident: any) => (
                            <tr key={incident.id} className="group hover:bg-white/1 transition-all">
                                <td className="px-6 py-4">
                                    <div className="flex flex-col">
                                        <span className="text-sm font-bold text-slate-200 group-hover:text-red-500 transition-colors uppercase">{incident.titre}</span>
                                        <span className="text-[10px] font-mono text-slate-500">{incident.date_creation}</span>
                                    </div>
                                </td>

                                {/* PREUVE VISUELLE DIRECTE */}
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-2">
                                        {incident.preuves && incident.preuves.length > 0 ? (
                                            <div className="relative w-12 h-10 rounded-lg overflow-hidden border border-slate-700 bg-slate-800 group/img">
                                                <img
                                                    src={incident.preuves[0].url}
                                                    className="w-full h-full object-cover opacity-80 group-hover/img:opacity-100 transition-opacity"
                                                />
                                                {incident.preuves.length > 1 && (
                                                    <div className="absolute bottom-0 right-0 bg-red-600 text-[8px] font-black px-1 text-white">
                                                        +{incident.preuves.length - 1}
                                                    </div>
                                                )}
                                            </div>
                                        ) : (
                                            <div className="w-12 h-10 rounded-lg border border-slate-800 flex items-center justify-center text-slate-700">
                                                <ImageIcon size={16} />
                                            </div>
                                        )}
                                    </div>
                                </td>

                                <td className="px-6 py-4 text-center">
                                    <span className="text-xs font-semibold text-slate-400">{incident.commune?.nom}</span>
                                </td>
                                <td className="px-6 py-4">
                                    <span className={`px-2 py-0.5 rounded text-[9px] font-black border uppercase ${incident.statut === 'en_attente' ? 'bg-amber-500/5 border-amber-500/20 text-amber-500' :
                                            incident.statut === 'valide' ? 'bg-emerald-500/5 border-emerald-500/20 text-emerald-500' : 'bg-rose-500/5 border-rose-500/20 text-rose-500'
                                        }`}>
                                        {incident.statut}
                                    </span>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="flex justify-end gap-2">
                                        <button onClick={() => { setSelectedIncident(incident); setIsModalOpen(true); }} className="p-2 hover:bg-slate-800 rounded-xl text-slate-400 transition-all active:scale-95"><Eye size={16} /></button>
                                        <button onClick={() => handleAction(incident.id, 'valide')} className="p-2 hover:bg-emerald-500/20 rounded-xl text-emerald-500 transition-all active:scale-95"><CheckCircle size={16} /></button>
                                        <button onClick={() => handleAction(incident.id, 'rejete')} className="p-2 hover:bg-rose-500/20 rounded-xl text-rose-500 transition-all active:scale-95"><XCircle size={16} /></button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                {/* PAGINATION PREMIUM AVEC CHARGEMENT */}
                <div className="px-6 py-6 bg-[#0f172a] border-t border-slate-800 flex flex-col md:flex-row justify-between items-center gap-4">
                    <div className="flex items-center gap-6">
                        <div className="flex items-center gap-3">
                            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Lignes</span>
                            <div className="flex items-center gap-2 px-3 py-1 bg-[#151c2c] border border-slate-800 rounded text-[11px] text-slate-300 font-bold">
                                20 <ChevronDown size={12} className="text-slate-500" />
                            </div>
                        </div>
                        <span className="text-[10px] font-bold text-slate-600 uppercase tracking-tighter">
                            {data?.from}-{data?.to} sur {data?.total} incidents
                        </span>
                    </div>

                    <div className="flex items-center gap-8">
                        <span className="text-[10px] font-black text-white uppercase tracking-widest">
                            Page {data?.current_page} <span className="text-slate-600">/ {data?.last_page}</span>
                        </span>
                        <div className="flex gap-2">
                            <button
                                disabled={currentPage === 1 || navigating}
                                onClick={() => setCurrentPage(p => p - 1)}
                                className="px-6 py-2 bg-[#151c2c] border border-slate-800 rounded-xl text-[10px] font-black uppercase text-slate-400 hover:text-white disabled:opacity-20 transition-all flex items-center gap-2"
                            >
                                {navigating && currentPage !== 1 ? <Loader2 size={12} className="animate-spin" /> : <ChevronLeft size={12} />}
                                Précédent
                            </button>
                            <button
                                disabled={currentPage === data?.last_page || navigating}
                                onClick={() => setCurrentPage(p => p + 1)}
                                className="px-6 py-2 bg-[#151c2c] border border-slate-800 rounded-xl text-[10px] font-black uppercase text-slate-400 hover:text-white disabled:opacity-20 transition-all flex items-center gap-2"
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