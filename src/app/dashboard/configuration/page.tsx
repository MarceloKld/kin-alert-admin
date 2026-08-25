"use client";

import React, { useState, useEffect } from 'react';
import { ConfigService } from '@/services/config.service';
import { Ville, Commune, IncidentType } from '@/types/config';
import { showToast } from '@/lib/toast-utils';
import { MapPin, Home, AlertTriangle, Plus, Database, ChevronRight } from 'lucide-react';

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

    useEffect(() => {
        const loadData = async () => {
            setLoading(true);
            try {
                const [v, c, t] = await Promise.all([
                    ConfigService.getVilles(),
                    ConfigService.getCommunes(),
                    ConfigService.getIncidentTypes()
                ]);
                setVilles(v);
                setCommunes(c);
                setTypes(t);
            } catch (error) {
                showToast.error("Erreur de chargement des données");
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

                            <button className="w-full bg-[#FF2424] hover:bg-[#D61F1F] text-white font-black py-4 rounded-xl shadow-lg shadow-[#FF2424]/20 transition-all active:scale-95">
                                ENREGISTRER DANS LA BDD
                            </button>
                        </form>
                    </div>
                </div>

                {/* Liste des données */}
                <div className="lg:col-span-2 space-y-4">
                    {loading ? (
                        <div className="animate-pulse flex flex-col gap-4">
                            {[1, 2, 3].map(i => <div key={i} className="h-16 bg-[#141A28] rounded-xl border border-slate-800" />)}
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {(activeTab === 'villes' ? villes : activeTab === 'communes' ? communes : types).map((item: any) => (
                                <div key={item.id} className="bg-[#141A28] border border-slate-800 p-4 rounded-xl flex items-center justify-between group hover:border-slate-600 transition-all">
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-lg bg-[#080C14] flex items-center justify-center text-[#FF2424] font-bold">
                                            {item.id}
                                        </div>
                                        <div>
                                            <p className="text-white font-bold">{item.nom || item.titre}</p>
                                            {activeTab === 'communes' && (
                                                <p className="text-[10px] text-slate-500 uppercase tracking-widest">
                                                    Ville ID: {item.ville_id}
                                                </p>
                                            )}
                                            {activeTab === 'types' && (
                                                <p className="text-xs text-slate-500 truncate w-40">{item.description}</p>
                                            )}
                                        </div>
                                    </div>
                                    <ChevronRight size={16} className="text-slate-700 group-hover:text-[#FF2424] transition-colors" />
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}