"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { ConfigService } from '@/services/config.service';
import { Ville, Commune, IncidentType } from '@/types/config';
import { showToast } from '@/lib/toast-utils';
import { MapPin, Home, AlertTriangle, Plus, Database, ChevronRight, ChevronLeft, Hash, Loader2 } from 'lucide-react';

export default function ConfigurationClient() {
    // 1. ÉTATS DES DONNÉES (Initialisés en tableaux vides pour éviter l'erreur .map)
    const [villes, setVilles] = useState<Ville[]>([]);
    const [communes, setCommunes] = useState<Commune[]>([]);
    const [types, setTypes] = useState<IncidentType[]>([]);

    // 2. ÉTATS DE CONTRÔLE
    const [activeTab, setActiveTab] = useState<'villes' | 'communes' | 'types'>('villes');
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [lastPage, setLastPage] = useState(1);
    const [totalCommunes, setTotalCommunes] = useState(0);

    // 3. ÉTATS DES FORMULAIRES
    const [nameInput, setNameInput] = useState("");
    const [selectedVilleId, setSelectedVilleId] = useState("");
    const [descriptionInput, setDescriptionInput] = useState("");

    // CHARGEMENT INITIAL
    // CHARGEMENT INITIAL (Remplace les lignes 28 à 57)
    useEffect(() => {
        let isMounted = true;

        const loadData = async () => {
            try {
                // On charge tout en parallèle pour la rapidité
                const [vData, cData, tData] = await Promise.all([
                    ConfigService.getVilles(),
                    ConfigService.getCommunes(1),
                    ConfigService.getIncidentTypes()
                ]);

                if (!isMounted) return;

                // Mises à jour d'état
                setVilles(Array.isArray(vData) ? vData : []);
                setTypes(Array.isArray(tData) ? tData : []);

                // Gestion flexible des communes
                const communesArray = Array.isArray(cData)
                    ? cData
                    : (Array.isArray(cData?.data) ? cData.data : []);

                setCommunes(communesArray);
                setLastPage(cData?.last_page || 1);
                setTotalCommunes(cData?.total || communesArray.length);

            } catch (error) {
                if (isMounted) {
                    showToast.error("Erreur de synchronisation avec le serveur");
                }
            } finally {
                if (isMounted) {
                    setLoading(false);
                }
            }
        };

        loadData();

        return () => {
            isMounted = false;
        };
    }, []); // Tableau de dépendances vide pour exécuter une seule fois au montage
    // CHANGER DE PAGE (COMMUNES)
    const handlePageChange = async (page: number) => {
        setLoading(true);
        try {
            const res = await ConfigService.getCommunes(page);
            setCommunes(res.data);
            setCurrentPage(page);
        } catch (error) {
            showToast.error("Erreur de chargement de la page");
        } finally {
            setLoading(false);
        }
    };

    // CRÉATION D'UNE ENTRÉE
    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (activeTab === 'villes') {
                const res = await ConfigService.createVille(nameInput);
                setVilles(prev => [...prev, res]);
            } else if (activeTab === 'communes') {
                const res = await ConfigService.createCommune({
                    nom: nameInput,
                    ville_id: Number(selectedVilleId)
                });
                setCommunes(prev => [...prev, res]);
                setTotalCommunes(prev => prev + 1);
            } else {
                const res = await ConfigService.createIncidentType({
                    titre: nameInput,
                    description: descriptionInput
                });
                setTypes(prev => [...prev, res]);
            }
            showToast.success("Enregistrement réussi");
            setNameInput(""); setDescriptionInput("");
        } catch (error) {
            showToast.error("Erreur lors de l'enregistrement");
        }
    };

    return (
        <div className="p-6 space-y-8 max-w-7xl mx-auto">
            {/* KPI HEADERS */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <StatCard label="Villes" count={villes.length} icon={MapPin} color="text-blue-500" />
                <StatCard label="Communes" count={totalCommunes} icon={Home} color="text-emerald-500" />
                <StatCard label="Types d'incidents" count={types.length} icon={AlertTriangle} color="text-[#FF2424]" />
            </div>

            {/* TABS SELECTOR */}
            <div className="flex gap-2 border-b border-slate-800 pb-px overflow-x-auto">
                {['villes', 'communes', 'types'].map((tab) => (
                    <button
                        key={tab}
                        onClick={() => { setActiveTab(tab as any); setCurrentPage(1); }}
                        className={`px-8 py-4 text-xs font-black tracking-widest uppercase transition-all relative ${activeTab === tab ? 'text-[#FF2424]' : 'text-slate-500 hover:text-white'
                            }`}
                    >
                        {tab}
                        {activeTab === tab && (
                            <div className="absolute bottom-0 left-0 w-full h-0.5 bg-[#FF2424] shadow-[0_0_12px_#FF2424]" />
                        )}
                    </button>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                {/* COLONNE GAUCHE : FORMULAIRE */}
                <div className="lg:col-span-1">
                    <div className="bg-[#141A28] border border-slate-800 rounded-3xl p-8 sticky top-24 shadow-2xl">
                        <form onSubmit={handleCreate} className="space-y-6">
                            <h2 className="text-white font-black text-xl flex items-center gap-3 italic">
                                <Plus size={20} className="text-[#FF2424]" />
                                NOUVEL AJOUT
                            </h2>

                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <label className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Nom / Titre</label>
                                    <input
                                        value={nameInput}
                                        onChange={(e) => setNameInput(e.target.value)}
                                        className="w-full bg-[#080C14] border border-slate-700 rounded-xl p-4 text-white focus:border-[#FF2424] outline-none transition-all"
                                        placeholder="Ex: Ngaliema, Kinshasa..."
                                        required
                                    />
                                </div>

                                {activeTab === 'communes' && (
                                    <div className="space-y-2">
                                        <label className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Ville de rattachement</label>
                                        <select
                                            value={selectedVilleId}
                                            onChange={(e) => setSelectedVilleId(e.target.value)}
                                            className="w-full bg-[#080C14] border border-slate-700 rounded-xl p-4 text-white focus:border-[#FF2424] outline-none appearance-none"
                                            required
                                        >
                                            <option value="">Sélectionner une ville</option>
                                            {villes.map(v => <option key={v.id} value={v.id}>{v.nom}</option>)}
                                        </select>
                                    </div>
                                )}

                                {activeTab === 'types' && (
                                    <div className="space-y-2">
                                        <label className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Description</label>
                                        <textarea
                                            value={descriptionInput}
                                            onChange={(e) => setDescriptionInput(e.target.value)}
                                            className="w-full bg-[#080C14] border border-slate-700 rounded-xl p-4 text-white h-32 focus:border-[#FF2424] outline-none resize-none"
                                            placeholder="Détails techniques du type..."
                                        />
                                    </div>
                                )}
                            </div>

                            <button className="w-full bg-[#FF2424] hover:bg-[#D61F1F] text-white font-black py-5 rounded-2xl shadow-[0_0_20px_rgba(255,36,36,0.15)] transition-all active:scale-95 uppercase tracking-tighter">
                                Enregistrer dans la Base
                            </button>
                        </form>
                    </div>
                </div>

                {/* COLONNE DROITE : LISTE DYNAMIQUE */}
                <div className="lg:col-span-2 space-y-4">
                    {loading ? (
                        <div className="flex flex-col items-center py-20 text-slate-600 gap-4">
                            <Loader2 className="animate-spin" size={40} />
                            <p className="font-mono text-xs uppercase tracking-widest">Accès aux données en cours...</p>
                        </div>
                    ) : (
                        <>
                            <div className="grid grid-cols-1 gap-3">
                                {(activeTab === 'villes' ? villes : activeTab === 'communes' ? communes : types).map((item: any) => (
                                    <div key={item.id} className="group bg-[#141A28]/50 border border-slate-800 p-5 rounded-2xl flex items-center justify-between hover:bg-[#141A28] transition-all border-l-2 hover:border-l-[#FF2424]">
                                        <div className="flex items-center gap-5">
                                            {/* ID stylisé avec padding à gauche */}
                                            <div className="text-slate-700 font-mono text-sm group-hover:text-[#FF2424] transition-colors">
                                                {String(item.id).padStart(3, '0')}
                                            </div>

                                            <div>
                                                {/* Titre principal (Nom de la commune, ville ou type) */}
                                                <h4 className="text-white font-bold text-lg leading-none">
                                                    {item.nom || item.titre}
                                                </h4>

                                                {/* AFFICHAGE DU NOM DE LA VILLE (Au lieu de l'ID) */}
                                                {activeTab === 'communes' && (
                                                    <div className="flex items-center gap-2 mt-2">
                                                        <div className="flex items-center gap-1.5 px-2.5 py-1 bg-[#FF2424]/10 border border-[#FF2424]/20 rounded-full">
                                                            <MapPin size={10} className="text-[#FF2424]" />
                                                            <span className="text-[10px] text-[#FF2424] uppercase font-black tracking-widest">
                                                                {/* On utilise item.ville?.nom pour éviter les crashs si ville est nulle */}
                                                                {item.ville?.nom || "Ville non définie"}
                                                            </span>
                                                        </div>
                                                    </div>
                                                )}

                                                {activeTab === 'types' && (
                                                    <p className="text-xs text-slate-500 mt-1 italic">{item.description}</p>
                                                )}
                                            </div>
                                        </div>
                                        <ChevronRight size={18} className="text-slate-800 group-hover:text-white transition-all transform group-hover:translate-x-1" />
                                    </div>
                                ))}
                            </div>


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
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}

// COMPOSANT STAT CARD INTERNE
function StatCard({ label, count, icon: Icon, color }: any) {
    return (
        <div className="bg-[#141A28] border border-slate-800 p-6 rounded-3xl flex items-center justify-between shadow-xl relative overflow-hidden group">
            <div className="absolute -right-4 -bottom-4 opacity-5 group-hover:scale-110 transition-transform duration-700">
                <Icon size={100} />
            </div>
            <div className="relative z-10">
                <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.2em]">{label}</p>
                <h3 className="text-4xl font-black text-white mt-2 tracking-tighter">{count}</h3>
            </div>
            <div className={`p-4 bg-[#080C14] rounded-2xl ${color} border border-slate-800 shadow-inner group-hover:shadow-[#FF2424]/10 transition-all`}>
                <Icon size={28} />
            </div>
        </div>
    );
}