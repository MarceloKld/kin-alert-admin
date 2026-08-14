"use client";
import React from 'react';
import { X, MapPin, User, AlertTriangle, Image as ImageIcon, Calendar } from 'lucide-react';
import { Incident } from '@/types';

interface Props {
    incident: Incident | null;
    isOpen: boolean;
    onClose: () => void;
}

export const IncidentDetailModal = ({ incident, isOpen, onClose }: Props) => {
    if (!isOpen || !incident) return null;

    return (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-300">
            <div className="bg-[#0f172a] border border-slate-800 w-full max-w-4xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">

                {/* Header */}
                <div className="flex items-center justify-between p-5 border-b border-slate-800 bg-slate-900/50">
                    <div className="flex items-center gap-3">
                        <AlertTriangle className="text-red-500" size={20} />
                        <h3 className="text-white font-bold text-sm tracking-widest uppercase">{incident.titre}</h3>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-slate-800 rounded-full text-slate-400 transition-colors">
                        <X size={20} />
                    </button>
                </div>

                {/* Content Scrollable */}
                <div className="overflow-y-auto p-6 grid grid-cols-1 lg:grid-cols-2 gap-8">

                    {/* Section Données */}
                    <div className="space-y-6">
                        <div className="bg-slate-900/50 border border-slate-800 p-4 rounded-xl">
                            <label className="text-[10px] font-bold text-slate-500 uppercase block mb-2">Description du sinistre</label>
                            <p className="text-sm text-slate-300 leading-relaxed">{incident.description}</p>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="p-3 bg-slate-900/30 border border-slate-800 rounded-lg">
                                <span className="text-[9px] font-bold text-slate-500 uppercase block">Signaleur</span>
                                <span className="text-xs text-blue-400 font-medium">{incident.utilisateur?.nom}</span>
                            </div>
                            <div className="p-3 bg-slate-900/30 border border-slate-800 rounded-lg">
                                <span className="text-[9px] font-bold text-slate-500 uppercase block">Commune</span>
                                <span className="text-xs text-slate-200 font-medium">{incident.commune?.nom}</span>
                            </div>
                        </div>

                        <div className="flex items-center gap-3 p-4 bg-red-500/5 border border-red-500/10 rounded-xl">
                            <MapPin className="text-red-500" size={18} />
                            <div>
                                <span className="text-[10px] font-bold text-slate-500 uppercase block">Localisation précise</span>
                                <p className="text-xs text-slate-200">{incident.avenue}</p>
                            </div>
                        </div>
                    </div>

                    {/* Section Preuves Photos - Explication Prof : On boucle sur 'preuves' du JSON */}
                    <div className="space-y-4">
                        <label className="text-[10px] font-bold text-slate-500 uppercase flex items-center gap-2">
                            <ImageIcon size={14} /> Preuves visuelles ({incident.preuves?.length || 0})
                        </label>

                        <div className="grid grid-cols-2 gap-2">
                            {incident.preuves && incident.preuves.length > 0 ? (
                                incident.preuves.map((preuve: any) => (
                                    <div key={preuve.id} className="group relative aspect-square rounded-lg overflow-hidden border border-slate-800 bg-slate-900">
                                        <img
                                            src={preuve.url}
                                            alt="Preuve incident"
                                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                                        />
                                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                            <a href={preuve.url} target="_blank" className="text-[10px] font-bold text-white bg-slate-900/80 px-3 py-1 rounded-full border border-white/20">VOIR PLEIN ÉCRAN</a>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="col-span-2 h-32 border-2 border-dashed border-slate-800 rounded-xl flex items-center justify-center text-slate-600 text-xs italic">
                                    Aucune photo jointe
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};