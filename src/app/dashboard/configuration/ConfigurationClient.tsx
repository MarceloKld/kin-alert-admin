"use client";

import React, { useState, useEffect } from 'react';
import { ConfigService } from '@/services/config.service';
import { Ville, Commune, IncidentType } from '@/types/config';
import { showToast } from '@/lib/toast-utils';
import { MapPin, Home, AlertTriangle, Plus, Database, ChevronRight, Hash } from 'lucide-react';

export default function ConfigurationClient() {
    const [activeTab, setActiveTab] = useState<'villes' | 'communes' | 'types'>('villes');
    const [loading, setLoading] = useState(true);

    // Data states
    const [villes, setVilles] = useState<Ville[]>([]);
    const [communes, setCommunes] = useState<Commune[]>([]);
    const [types, setTypes] = useState<IncidentType[]>([]);

    // Form states
    const [newItemName, setNewItemName] = useState("");
    const [selectedVilleId, setSelectedVilleId] = useState<string>(""); // Changé en string pour le select
    const [typeDesc, setTypeDesc] = useState("");

    useEffect(() => {
        const loadData = async () => {
            setLoading(true);
            try {
                const [v, c, t] = await Promise.all([
                    ConfigService.getVilles(),
                    ConfigService.getCommunes(),
                    ConfigService.getIncidentTypes()
                ]);
                setVilles(Array.isArray(v) ? v : []);
                setCommunes(Array.isArray(c) ? c : []);
                setTypes(Array.isArray(t) ? t : []);
            } catch (error) {
                showToast.error("Erreur de synchronisation API");
            } finally {
                setLoading(false);
            }
        };

        loadData();
    }, []);

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (activeTab === 'villes') {
                const res = await ConfigService.createVille(newItemName);
                setVilles([...villes, res]);
            } else if (activeTab === 'communes') {
                if (!selectedVilleId) return showToast.error("Sélectionnez une ville");
                const res = await ConfigService.createCommune({ nom: newItemName, ville_id: Number(selectedVilleId) });
                setCommunes([...communes, res]);
            } else {
                const res = await ConfigService.createIncidentType({ titre: newItemName, description: typeDesc });
                setTypes([...types, res]);
            }
            showToast.success("Entrée ajoutée avec succès");
            setNewItemName(""); setTypeDesc("");
        } catch (error: any) {
            // Ici on gère l'erreur 405 ou 422
            showToast.error(error.response?.status === 405 ? "Méthode non autorisée (Route API erronée)" : "Erreur de création");
        }
    };

    return (
        <div className="p-6 space-y-8 max-w-7xl mx-auto">
            {/* KPI STATS - AFFICHAGE DES NOMBRES */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[
                    { label: 'Villes', count: villes.length, icon: MapPin, color: 'text-blue-500' },
                    { label: 'Communes', count: communes.length, icon: Home, color: 'text-emerald-500' },
                    { label: 'Types Alertes', count: types.length, icon: AlertTriangle, color: 'text-[#FF2424]' },
                ].map((stat, i) => (
                    <div key={i} className="bg-[#141A28] border border-slate-800 p-5 rounded-2xl flex items-center justify-between">
                        <div>
                            <p className="text-slate-500 text-xs font-bold uppercase">{stat.label}</p>
                            <h3 className="text-3xl font-black text-white mt-1">{stat.count}</h3>
                        </div>
                        <div className={`p-3 bg-slate-900 rounded-xl ${stat.color}`}>
                            <stat.icon size={24} />
                        </div>
                    </div>
                ))}
            </div>

            <div className="flex gap-4 border-b border-slate-800 pb-px overflow-x-auto">
                {/* ... (Onglets identiques au code précédent) ... */}
                {['villes', 'communes', 'types'].map((tab) => (
                    <button key={tab} onClick={() => setActiveTab(tab as any)} className={`px-6 py-3 text-sm font-bold transition-all relative ${activeTab === tab ? 'text-[#FF2424]' : 'text-slate-500'}`}>
                        {tab.toUpperCase()}
                        {activeTab === tab && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-[#FF2424] shadow-[0_0_8px_#FF2424]" />}
                    </button>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Formulaire */}
                <div className="lg:col-span-1">
                    <div className="bg-[#141A28] border border-slate-800 rounded-2xl p-6 shadow-2xl">
                        <form onSubmit={handleCreate} className="space-y-4">
                            <h2 className="text-white font-bold mb-4">NOUVELLE ENTRÉE</h2>

                            <input
                                value={newItemName}
                                onChange={(e) => setNewItemName(e.target.value)}
                                className="w-full bg-[#080C14] border border-slate-700 rounded-xl p-3 text-white focus:border-[#FF2424] outline-none"
                                placeholder="Nom / Titre"
                                required
                            />

                            {/* FIX VILLE DE RATTACHEMENT */}
                            {activeTab === 'communes' && (
                                <select
                                    value={selectedVilleId}
                                    onChange={(e) => setSelectedVilleId(e.target.value)}
                                    className="w-full bg-[#080C14] border border-slate-700 rounded-xl p-3 text-white focus:border-[#FF2424] outline-none"
                                    required
                                >
                                    <option value="">-- Choisir une Ville --</option>
                                    {villes.map(v => (
                                        <option key={v.id} value={v.id}>{v.nom}</option>
                                    ))}
                                </select>
                            )}

                            {activeTab === 'types' && (
                                <textarea
                                    value={typeDesc}
                                    onChange={(e) => setTypeDesc(e.target.value)}
                                    className="w-full bg-[#080C14] border border-slate-700 rounded-xl p-3 text-white h-24 outline-none focus:border-[#FF2424]"
                                    placeholder="Description..."
                                />
                            )}

                            <button className="w-full bg-[#FF2424] text-white font-bold py-4 rounded-xl active:scale-95 transition-all">
                                AJOUTER À LA BASE
                            </button>
                        </form>
                    </div>
                </div>

                {/* Liste d'affichage */}
                <div className="lg:col-span-2 space-y-2 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
                    {(activeTab === 'villes' ? villes : activeTab === 'communes' ? communes : types).map((item: any) => (
                        <div key={item.id} className="flex items-center justify-between p-4 bg-[#141A28]/50 border border-slate-800 rounded-xl hover:bg-[#141A28] transition-all group">
                            <div className="flex items-center gap-4">
                                <Hash size={14} className="text-slate-600" />
                                <div>
                                    <p className="text-white font-medium">{item.nom || item.titre}</p>
                                    {activeTab === 'communes' && (
                                        <span className="text-[10px] bg-blue-500/10 text-blue-400 px-2 py-0.5 rounded uppercase font-bold">
                                            Ville ID: {item.ville_id}
                                        </span>
                                    )}
                                </div>
                            </div>
                            <span className="text-slate-700 text-xs font-mono group-hover:text-slate-400">ID #{item.id}</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}