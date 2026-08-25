"use client";

import React, { useState, useEffect } from 'react';
import { ConfigService } from '@/services/config.service';
import { Ville, Commune, IncidentType } from '@/types/config';
import { showToast } from '@/lib/toast-utils';
import { MapPin, Home, AlertTriangle, Plus, Database, ChevronRight, ChevronLeft, Loader2 } from 'lucide-react';
import ConfigurationClient from "./ConfigurationClient";

export default function ConfigurationPage() {
    const [activeTab, setActiveTab] = useState<'villes' | 'communes' | 'types'>('villes');
    const [loading, setLoading] = useState(true);

    // Data states
    const [villes, setVilles] = useState<Ville[]>([]);
    const [communes, setCommunes] = useState<Commune[]>([]);
    const [types, setTypes] = useState<IncidentType[]>([]);

    // Form states
    const [newItemName, setNewItemName] = useState("");
    const [selectedVilleId, setSelectedVilleId] = useState<number>(0);
    const [typeDesc, setTypeDesc] = useState("");
    const currentList = activeTab === 'villes' ? villes : activeTab === 'communes' ? communes : types;
    const safeList = Array.isArray(currentList) ? currentList : (currentList as any)?.data || [];

    // Pagination states
    const [currentPage, setCurrentPage] = useState<number>(1);
    const [lastPage, setLastPage] = useState<number>(1);
    const [totalCommunes, setTotalCommunes] = useState<number>(0);
    const [isSubmitting, setIsSubmitting] = useState(false);


    useEffect(() => {
        const loadData = async () => {
            setLoading(true);
            try {
                const [v, c, t] = await Promise.all([
                    ConfigService.getVilles(),
                    ConfigService.getCommunes(1),
                    ConfigService.getIncidentTypes()
                ]);

                setVilles(Array.isArray(v) ? v : []);

                // Extraction des données de communes et de pagination
                const cList = Array.isArray(c) ? c : (c?.data || []);
                setCommunes(cList);
                setCurrentPage(c?.current_page || 1);
                setLastPage(c?.last_page || 1);
                setTotalCommunes(c?.total || cList.length);

                setTypes(Array.isArray(t) ? t : []);
            } catch (error) {
                showToast.error("Erreur de chargement des données");
            } finally {
                setLoading(false);
            }
        };
        loadData();
    }, []);
    
   
    const handlePageChange = async (newPage: number) => {
        if (newPage < 1 || newPage > lastPage || loading) return;
        setLoading(true);
        try {
            const res = await ConfigService.getCommunes(newPage);
            const cList = Array.isArray(res) ? res : (res?.data || []);
            setCommunes(cList);
            setCurrentPage(res?.current_page || newPage);
            setLastPage(res?.last_page || 1);
        } catch (error) {
            showToast.error("Erreur lors du changement de page");
        } finally {
            setLoading(false);
        }
    };
    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            if (activeTab === 'villes') {
                const res = await ConfigService.createVille(newItemName);
                setVilles([...villes, res]);
                showToast.success("Ville ajoutée");
            } else if (activeTab === 'communes') {
                const res = await ConfigService.createCommune({ nom: newItemName, ville_id: selectedVilleId });
                setCommunes([...communes, res]);
                showToast.success("Commune ajoutée");
            } else {
                const res = await ConfigService.createIncidentType({ titre: newItemName, description: typeDesc });
                setTypes([...types, res]);
                showToast.success("Type d'incident ajouté");
            }
            setNewItemName("");
            setTypeDesc("");
        } catch (error) {
            showToast.error("Erreur lors de la création");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="p-6 space-y-8 max-w-7xl mx-auto">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold text-white flex items-center gap-3 italic">
                    <Database className="text-[#FF2424] w-8 h-8" />
                    SYSTEM CONFIGURATION
                </h1>
                <p className="text-slate-500 text-sm mt-1 uppercase tracking-tighter">Gestion des entités et paramètres structurels</p>
            </div>

            {/* Onglets Premium */}
            <div className="flex gap-4 border-b border-slate-800 pb-px">
                {[
                    { id: 'villes', label: 'Villes', icon: MapPin },
                    { id: 'communes', label: 'Communes', icon: Home },
                    { id: 'types', label: 'Types d\'incidents', icon: AlertTriangle },
                ].map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id as any)}
                        className={`flex items-center gap-2 px-6 py-3 text-sm font-bold transition-all relative ${activeTab === tab.id ? 'text-[#FF2424]' : 'text-slate-500 hover:text-white'
                            }`}
                    >
                        <tab.icon size={18} />
                        {tab.label.toUpperCase()}
                        {activeTab === tab.id && (
                            <div className="absolute bottom-0 left-0 w-full h-0.5 bg-[#FF2424] shadow-[0_0_8px_#FF2424]" />
                        )}
                    </button>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                {/* Formulaire de création */}
                <div className="lg:col-span-1">
                    <div className="bg-[#141A28] border border-slate-800 rounded-2xl p-6 sticky top-24">
                        <h2 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                            <Plus className="text-[#FF2424]" />
                            AJOUTER {activeTab === 'villes' ? 'UNE VILLE' : activeTab === 'communes' ? 'UNE COMMUNE' : 'UN TYPE'}
                        </h2>

                        <form onSubmit={handleCreate} className="space-y-4">
                            <div>
                                <label className="text-xs text-slate-500 uppercase font-bold mb-2 block">Nom / Titre</label>
                                <input
                                    value={newItemName}
                                    onChange={(e) => setNewItemName(e.target.value)}
                                    className="w-full bg-[#080C14] border border-slate-700 rounded-xl p-3 text-white focus:border-[#FF2424] outline-none transition-all"
                                    placeholder="Entrez le nom..."
                                    required
                                />
                            </div>

                            {activeTab === 'communes' && (
                                <div>
                                    <label className="text-xs text-slate-500 uppercase font-bold mb-2 block">Ville de rattachement</label>
                                    <select
                                        onChange={(e) => setSelectedVilleId(Number(e.target.value))}
                                        className="w-full bg-[#080C14] border border-slate-700 rounded-xl p-3 text-white focus:border-[#FF2424] outline-none"
                                        required
                                    >
                                        <option value="">Sélectionner une ville</option>
                                        {villes.map(v => <option key={v.id} value={v.id}>{v.nom}</option>)}
                                    </select>
                                </div>
                            )}

                            {activeTab === 'types' && (
                                <div>
                                    <label className="text-xs text-slate-500 uppercase font-bold mb-2 block">Description</label>
                                    <textarea
                                        value={typeDesc}
                                        onChange={(e) => setTypeDesc(e.target.value)}
                                        className="w-full bg-[#080C14] border border-slate-700 rounded-xl p-3 text-white focus:border-[#FF2424] outline-none h-24"
                                        placeholder="Décrivez ce type d'incident..."
                                    />
                                </div>
                            )}

                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="w-full bg-[#FF2424] hover:bg-[#D61F1F] disabled:opacity-50 disabled:cursor-not-allowed text-white font-black py-4 rounded-xl shadow-lg shadow-[#FF2424]/20 transition-all active:scale-95 flex items-center justify-center gap-2 tracking-wide"
                            >
                                {isSubmitting ? (
                                    <>
                                        <Loader2 className="w-5 h-5 animate-spin" />
                                        ENREGISTREMENT...
                                    </>
                                ) : (
                                    'VALIDER'
                                )}
                            </button>
                        </form>
                    </div>
                </div>

                {/* Liste des données */}
                <div className="lg:col-span-2 space-y-4">
                    {loading ? (
                        // Skeleton loader pendant le chargement
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-pulse">
                            {[1, 2, 3, 4, 5, 6].map(i => (
                                <div key={i} className="h-20 bg-[#141A28] rounded-2xl border border-slate-800" />
                            ))}
                        </div>
                    ) : (() => {
                        // Securisation de la liste selon l'onglet actif
                        const rawList = activeTab === 'villes' ? villes : activeTab === 'communes' ? communes : types;
                        const safeList = Array.isArray(rawList) ? rawList : [];

                        if (safeList.length === 0) {
                            return (
                                <div className="text-center py-20 bg-[#141A28]/30 border border-dashed border-slate-800 rounded-3xl">
                                    <Database className="mx-auto text-slate-700 mb-4" size={40} />
                                    <p className="text-slate-500 font-mono text-xs uppercase tracking-widest">Aucune donnée enregistrée</p>
                                </div>
                            );
                        }

                        return (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {safeList.map((item: any) => (
                                    <div
                                        key={item.id}
                                        className="group bg-[#141A28] border border-slate-800 p-5 rounded-2xl flex items-center justify-between hover:border-[#FF2424]/40 transition-all duration-300 shadow-lg hover:shadow-[#FF2424]/5"
                                    >
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 rounded-xl bg-[#080C14] flex items-center justify-center text-slate-500 font-mono text-xs border border-slate-800 group-hover:text-[#FF2424] group-hover:border-[#FF2424]/30 transition-all">
                                                {String(item.id).padStart(2, '0')}
                                            </div>

                                            <div className="flex flex-col">
                                                <span className="text-white font-bold tracking-tight text-sm md:text-base">
                                                    {item.nom || item.titre}
                                                </span>

                                                {activeTab === 'communes' && (
                                                    <div className="flex items-center gap-1.5 mt-1.5">
                                                        <div className="w-1 h-1 bg-[#FF2424] rounded-full shadow-[0_0_5px_#FF2424]" />
                                                        <span className="text-[10px] text-slate-400 uppercase font-black tracking-widest">
                                                            {item.ville?.nom || villes.find(v => Number(v.id) === Number(item.ville_id))?.nom || "Ville Inconnue"}
                                                        </span>
                                                    </div>
                                                )}

                                                {activeTab === 'types' && (
                                                    <span className="text-[11px] text-slate-500 italic mt-1 line-clamp-1 w-40">
                                                        {item.description}
                                                    </span>
                                                )}
                                            </div>
                                        </div>

                                        <div className="p-2 rounded-lg bg-[#080C14] opacity-0 group-hover:opacity-100 transition-all transform translate-x-2 group-hover:translate-x-0">
                                            <ChevronRight size={14} className="text-[#FF2424]" />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        );
                    })()}
               
                    {/* PAGINATION LOGIC */}
                    {activeTab === 'communes' && lastPage > 1 && (
                        <div className="flex items-center justify-center gap-6 mt-10 pt-6 border-t border-slate-800">
                            <button
                                onClick={() => handlePageChange(currentPage - 1)}
                                disabled={currentPage === 1 || loading}
                                className="p-3 bg-[#141A28] border border-slate-800 rounded-xl disabled:opacity-10 hover:border-[#FF2424] transition-all"
                            >
                                <ChevronLeft className="text-white" />
                            </button>

                            <div className="flex items-center gap-3">
                                <span className="w-10 h-10 flex items-center justify-center bg-[#FF2424] text-white rounded-lg font-black shadow-[0_0_15px_rgba(255,36,36,0.3)]">
                                    {currentPage}
                                </span>
                                <span className="text-slate-600 font-bold">/</span>
                                <span className="text-slate-400 font-bold">{lastPage}</span>
                            </div>

                            <button
                                onClick={() => handlePageChange(currentPage + 1)}
                                disabled={currentPage === lastPage || loading}
                                className="p-3 bg-[#141A28] border border-slate-800 rounded-xl disabled:opacity-10 hover:border-[#FF2424] transition-all"
                            >
                                <ChevronRight className="text-white" />
                            </button>
                        </div>
                    )}
                </div>
                </div>
            </div>
      
    );
   
}