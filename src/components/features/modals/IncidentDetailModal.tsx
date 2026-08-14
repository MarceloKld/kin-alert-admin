"use client";
import React, { useEffect, useState } from 'react';
import { X, MapPin, AlertTriangle, Image as ImageIcon, MessageSquare, Loader2 } from 'lucide-react';
import { IncidentAdminService } from '@/services/incident.service';
import { CommentItem } from '@/components/ui/CommentItem';

export const IncidentDetailModal = ({ incident, isOpen, onClose }: any) => {
    const [comments, setComments] = useState([]);
    const [loading, setLoading] = useState(false);

    // Explication Prof : Dès que le modal s'ouvre pour un incident, on charge les commentaires
    useEffect(() => {
        if (isOpen && incident?.id) {
            loadComments();
        }
    }, [isOpen, incident]);

    const loadComments = async () => {
        setLoading(true);
        try {
            const data = await IncidentAdminService.getComments(incident.id);
            setComments(data.data || data); // S'adapte au format Laravel (Resource ou Array)
        } catch (error) {
            console.error("Erreur comments");
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen || !incident) return null;

    return (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-in fade-in duration-300">
            <div className="bg-[#0f172a] border border-slate-800 w-full max-w-5xl rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">

                {/* HEADER */}
                <div className="flex items-center justify-between p-6 border-b border-slate-800 bg-[#0f172a]">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-red-600/10 rounded-2xl border border-red-600/20">
                            <AlertTriangle className="text-red-600" size={24} />
                        </div>
                        <div>
                            <h3 className="text-lg font-black text-white uppercase tracking-tighter">{incident.titre}</h3>
                            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Incident #{incident.id} • {incident.commune?.nom}</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-slate-800 rounded-xl text-slate-400 transition-colors"><X size={24} /></button>
                </div>

                {/* CONTENU (3 Colonnes sur large écran) */}
                <div className="flex-1 overflow-y-auto p-6 grid grid-cols-1 lg:grid-cols-3 gap-6">

                    {/* COL 1 : INFOS GÉNÉRALES */}
                    <div className="space-y-6">
                        <div className="bg-slate-900/50 border border-slate-800 p-4 rounded-2xl">
                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-3">Description Rapportée</label>
                            <p className="text-xs text-slate-300 leading-relaxed italic">"{incident.description}"</p>
                        </div>

                        <div className="p-4 bg-slate-900/50 border border-slate-800 rounded-2xl flex items-start gap-3">
                            <MapPin className="text-red-500 mt-1" size={16} />
                            <div>
                                <label className="text-[10px] font-black text-slate-500 uppercase block">Localisation</label>
                                <p className="text-xs text-slate-200">{incident.avenue}</p>
                                <p className="text-[9px] text-slate-500 font-mono mt-1">{incident.latitude}, {incident.longitude}</p>
                            </div>
                        </div>
                    </div>

                    {/* COL 2 : PREUVES VISUELLES */}
                    <div className="space-y-4">
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                            <ImageIcon size={14} /> Galerie Preuves ({incident.preuves?.length || 0})
                        </label>
                        <div className="grid grid-cols-2 gap-2">
                            {incident.preuves?.map((p: any) => (
                                <div key={p.id} className="aspect-video rounded-xl overflow-hidden border border-slate-800 bg-slate-900">
                                    <img src={p.url} className="w-full h-full object-cover" alt="Preuve" />
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* COL 3 : FLUX DE COMMENTAIRES (Le nouveau bloc) */}
                    <div className="flex flex-col space-y-4 bg-slate-900/20 rounded-2xl p-4 border border-slate-800/50">
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2 border-b border-slate-800 pb-2">
                            <MessageSquare size={14} /> Rapport de Terrain
                        </label>

                        <div className="flex-1 overflow-y-auto space-y-3 pr-2 custom-scrollbar">
                            {loading ? (
                                <div className="flex flex-col items-center justify-center h-32 text-slate-600 gap-2">
                                    <Loader2 className="animate-spin" size={20} />
                                    <span className="text-[10px] font-bold uppercase">Chargement des rapports...</span>
                                </div>
                            ) : comments.length > 0 ? (
                                comments.map((c: any) => <CommentItem key={c.id} comment={c} />)
                            ) : (
                                <div className="text-center py-10 text-slate-600 text-[10px] font-bold uppercase italic">
                                    Aucun commentaire sur cet incident.
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};