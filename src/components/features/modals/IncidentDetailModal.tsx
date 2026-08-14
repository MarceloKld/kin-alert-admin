"use client";
import React, { useEffect, useState } from 'react';
import {
    X, MapPin, User, AlertTriangle, Image as ImageIcon,
    Calendar, Phone, Mail, Navigation, MessageSquare,
    CheckCircle, XCircle, ChevronRight, Maximize2
} from 'lucide-react';
import { IncidentAdminService } from '@/services/incident.service';
import { CommentItem } from '@/components/ui/CommentItem';
import { Loader2 } from 'lucide-react';

export const IncidentDetailModal = ({ incident, isOpen, onClose }: any) => {
    const [comments, setComments] = useState([]);
    const [loadingComments, setLoadingComments] = useState(false);
    const [selectedPhoto, setSelectedPhoto] = useState<string | null>(null);

    // Charger les commentaires quand le modal s'ouvre
    useEffect(() => {
        if (isOpen && incident?.id) {
            const fetchComments = async () => {
                setLoadingComments(true);
                try {
                    const res = await IncidentAdminService.getComments(incident.id);
                    setComments(res.data || res);
                } finally {
                    setLoadingComments(false);
                }
            };
            fetchComments();
            setSelectedPhoto(incident.preuves?.[0]?.url || null); // Photo par défaut
        }
    }, [isOpen, incident]);

    if (!isOpen || !incident) return null;

    return (
        <div className="fixed inset-0 z-100 flex items-center justify-center p-0 md:p-4 bg-black/95 backdrop-blur-md animate-in fade-in duration-300">

            {/* Visualiseur de photo plein écran (Lightbox) */}
            {selectedPhoto && (
                <div className="absolute inset-0 z-110 bg-black/90 flex items-center justify-center p-4 md:p-10 animate-in zoom-in-95 duration-200" onClick={() => setSelectedPhoto(null)}>
                    <img src={selectedPhoto} className="max-w-full max-h-full rounded-xl shadow-2xl object-contain border border-slate-800" />
                    <button className="absolute top-5 right-5 p-3 bg-white/10 hover:bg-white/20 rounded-full text-white"><X size={24} /></button>
                </div>
            )}

            <div className="bg-[#0b101a] border border-slate-800 w-full max-w-7xl h-full md:h-[90vh] md:rounded-3xl shadow-2xl overflow-hidden flex flex-col">

                {/* HEADER : IDENTITÉ DE L'ALERTE */}
                <div className="flex items-center justify-between p-6 border-b border-slate-800 bg-[#0f172a]/50">
                    <div className="flex items-center gap-4">
                        <div className={`p-3 rounded-2xl border ${incident.statut === 'valide' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500' : 'bg-red-600/10 border-red-600/20 text-red-600'}`}>
                            <AlertTriangle size={28} />
                        </div>
                        <div>
                            <div className="flex items-center gap-2">
                                <h3 className="text-xl font-black text-white uppercase tracking-tighter">{incident.titre}</h3>
                                <span className="text-[10px] bg-slate-800 text-slate-400 px-2 py-0.5 rounded font-mono">ID-{incident.id}</span>
                            </div>
                            <p className="text-xs text-slate-500 font-bold uppercase tracking-[0.2em]">{incident.type_incident?.titre}</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-3 hover:bg-slate-800 rounded-2xl text-slate-500 transition-all active:scale-95"><X size={28} /></button>
                </div>

                {/* CORPS DU DOSSIER */}
                <div className="flex-1 overflow-y-auto flex flex-col lg:flex-row divide-y lg:divide-y-0 lg:divide-x divide-slate-800">

                    {/* COLONNE GAUCHE : PREUVES VISUELLES (40%) */}
                    <div className="lg:w-[45%] p-6 flex flex-col gap-4 bg-slate-900/10">
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                            <ImageIcon size={14} /> Galerie des preuves ({incident.preuves?.length || 0})
                        </label>

                        {incident.preuves?.length > 0 ? (
                            <div className="flex flex-col gap-4">
                                {/* Image Principale Cliquable */}
                                <div
                                    className="relative aspect-video rounded-2xl overflow-hidden border border-slate-800 bg-slate-900 group cursor-zoom-in"
                                    onClick={() => setSelectedPhoto(incident.preuves[0].url)}
                                >
                                    <img src={incident.preuves[0].url} className="w-full h-full object-cover transition-transform group-hover:scale-105 duration-700" />
                                    <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                                        <Maximize2 className="text-white" size={32} />
                                    </div>
                                </div>
                                {/* Miniatures */}
                                <div className="grid grid-cols-4 gap-2">
                                    {incident.preuves.map((p: any) => (
                                        <button key={p.id} onClick={() => setSelectedPhoto(p.url)} className="aspect-square rounded-lg overflow-hidden border border-slate-800 hover:border-red-500 transition-colors">
                                            <img src={p.url} className="w-full h-full object-cover" />
                                        </button>
                                    ))}
                                </div>
                            </div>
                        ) : (
                            <div className="flex-1 border-2 border-dashed border-slate-800 rounded-3xl flex flex-col items-center justify-center text-slate-600 italic text-sm">
                                <ImageIcon size={48} className="mb-2 opacity-20" />
                                Aucune image fournie
                            </div>
                        )}
                    </div>

                    {/* COLONNE CENTRALE : DÉTAILS & MAP (30%) */}
                    <div className="lg:w-[30%] p-6 space-y-6">
                        <div className="space-y-4">
                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Rapport de Situation</label>
                            <div className="p-4 bg-slate-900/50 border border-slate-800 rounded-2xl text-sm text-slate-300 leading-relaxed italic">
                                "{incident.description}"
                            </div>
                        </div>

                        <div className="space-y-4">
                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Localisation Précise</label>
                            <div className="space-y-3">
                                <div className="flex items-start gap-3 p-3 bg-slate-900/30 rounded-xl border border-slate-800">
                                    <MapPin className="text-red-500 shrink-0" size={18} />
                                    <div>
                                        <p className="text-xs font-bold text-slate-200">{incident.commune?.nom}</p>
                                        <p className="text-[11px] text-slate-500">{incident.avenue}</p>
                                    </div>
                                </div>
                                <div className="flex items-center justify-between p-3 bg-slate-900/30 rounded-xl border border-slate-800">
                                    <div className="flex items-center gap-2">
                                        <Navigation className="text-blue-500" size={14} />
                                        <span className="text-[10px] text-slate-400 font-mono">{incident.latitude}, {incident.longitude}</span>
                                    </div>
                                    <button className="text-[9px] font-black text-blue-500 hover:underline uppercase">Ouvrir Maps</button>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-4 pt-4 border-t border-slate-800">
                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Auteur du Signalement</label>
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center text-slate-400">
                                    <User size={20} />
                                </div>
                                <div>
                                    <p className="text-xs font-bold text-white uppercase tracking-tighter">{incident.utilisateur?.nom}</p>
                                    <p className="text-[10px] text-slate-500">{incident.utilisateur?.email}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* COLONNE DROITE : RAPPORTS TERRAIN (30%) */}
                    <div className="lg:w-[25%] p-6 flex flex-col bg-black/20">
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2 mb-4">
                            <MessageSquare size={14} /> Rapports Terrain ({comments.length})
                        </label>

                        <div className="flex-1 overflow-y-auto space-y-3 pr-2 custom-scrollbar">
                            {loadingComments ? (
                                <div className="flex flex-col items-center justify-center py-20 text-slate-700 animate-pulse">
                                    <Loader2 size={24} className="animate-spin mb-2" />
                                    <span className="text-[9px] font-black uppercase">Récupération...</span>
                                </div>
                            ) : comments.length > 0 ? (
                                comments.map((c: any) => <CommentItem key={c.id} comment={c} />)
                            ) : (
                                <div className="text-center py-20 text-slate-700 text-[10px] font-black uppercase tracking-widest">
                                    Aucun rapport
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* FOOTER : ACTIONS DE DÉCISION */}
                <div className="p-6 border-t border-slate-800 bg-[#0f172a] flex flex-col md:flex-row justify-between items-center gap-4">
                    <div className="flex items-center gap-4 text-slate-500">
                        <div className="flex items-center gap-1 text-[10px] font-black uppercase tracking-widest">
                            <Calendar size={14} /> Signalé le : {incident.date_creation}
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
};