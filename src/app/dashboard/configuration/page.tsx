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
            console.error(error);
            showToast.error("Erreur lors de la création");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="p-4 sm:p-6 lg:p-8 space-y-6 sm:space-y-8 max-w-7xl mx-auto">

            {/* ========================================== */}
            {/* 📌 HEADER - Titre et description */}
            {/* ========================================== */}
            <header className="space-y-2">
                <div className="flex items-center gap-3">
                    {/* ========================================== */}
                    {/* 🎯 ICÔNE PRINCIPALE - Avec effet glow animé */}
                    {/* ========================================== */}
                    <div className="relative animate-fade-in-down">
                        {/* Glow externe pulsant */}
                        <div className="absolute inset-0 bg-[#FF2424] opacity-20 blur-xl rounded-full animate-pulse" />

                        {/* Glow moyen qui scale */}
                        <div className="absolute inset-0 bg-[#FF2424] opacity-30 blur-md rounded-full animate-ping-slow" />

                        {/* Icône principale */}
                        <Database className="relative text-[#FF2424] w-6 h-6 sm:w-8 sm:h-8 shrink-0 drop-shadow-[0_0_12px_rgba(255,36,36,0.6)] animate-float" />
                    </div>

                    {/* ========================================== */}
                    {/* 📝 TITRE PRINCIPAL - Animation slide-in */}
                    {/* ========================================== */}
                    <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight animate-fade-in-right animation-delay-100">
                        System Configuration
                    </h1>
                </div>

                {/* ========================================== */}
                {/* 📄 SOUS-TITRE - Animation fade-in retardée */}
                {/* ========================================== */}
                <p className="text-slate-400 text-xs sm:text-sm pl-9 sm:pl-11 animate-fade-in-up animation-delay-200">
                    Gestion des entités et paramètres structurels
                </p>
            </header>

            {/* ========================================== */}
            {/* 🔖 TABS NAVIGATION - Onglets premium */}
            {/* ========================================== */}
            <div className="relative">
                {/* Bordure inférieure avec gradient */}
                <div className="absolute bottom-0 left-0 right-0 h-px bg-linear-to-r from-transparent via-slate-700 to-transparent" />

                {/* Container des onglets */}
                <nav
                    className="flex gap-2 sm:gap-4 pb-px overflow-x-auto scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-transparent"
                    role="tablist"
                    aria-label="Configuration sections"
                >
                    {[
                        { id: 'villes', label: 'Villes', icon: MapPin },
                        { id: 'communes', label: 'Communes', icon: Home },
                        { id: 'types', label: "Types d'incidents", icon: AlertTriangle },
                    ].map((tab) => {
                        const isActive = activeTab === tab.id;

                        return (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id as any)}
                                role="tab"
                                aria-selected={isActive}
                                aria-controls={`panel-${tab.id}`}
                                className={`
                            group relative flex items-center gap-2 sm:gap-3
                            px-3 sm:px-6 py-3 sm:py-3.5
                            text-xs sm:text-sm font-semibold uppercase
                            transition-all duration-200 ease-out
                            shrink-0 rounded-t-lg
                            ${isActive
                                        ? 'text-[#FF2424] bg-slate-800/40'
                                        : 'text-slate-500 hover:text-slate-200 hover:bg-slate-800/20'
                                    }
                        `}
                            >
                                {/* Icône avec animation hover */}
                                <tab.icon
                                    className={`
                                w-4 h-4 sm:w-4.5 sm:h-4.5
                                transition-transform duration-200
                                ${isActive
                                            ? 'scale-110 drop-shadow-[0_0_8px_rgba(255,36,36,0.5)]'
                                            : 'group-hover:scale-105'
                                        }
                            `}
                                />

                                {/* Label du tab */}
                                <span className="whitespace-nowrap">
                                    {tab.label}
                                </span>

                                {/* Indicateur actif avec effet glow */}
                                {isActive && (
                                    <>
                                        {/* Ligne principale */}
                                        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#FF2424]" />
                                        {/* Effet blur/glow */}
                                        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#FF2424] blur-sm opacity-75" />
                                    </>
                                )}

                                {/* Subtle border top pour l'état actif */}
                                {isActive && (
                                    <div className="absolute top-0 left-0 right-0 h-px bg-linear-to-r from-transparent via-[#FF2424]/30 to-transparent" />
                                )}
                            </button>
                        );
                    })}
                </nav>
            </div>

            {/* ========================================== */}
            {/* 📋 GRID LAYOUT - Formulaire + Liste */}
            {/* ========================================== */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">

                {/* ========================================== */}
                {/* ✍️ FORMULAIRE DE CRÉATION - Sticky sidebar */}
                {/* ========================================== */}
                <div className="lg:col-span-1 animate-fade-in-right">
                    <div className="bg-slate-900/50 backdrop-blur-sm border border-slate-800/60 rounded-2xl p-6 sticky top-24 shadow-xl">

                        {/* En-tête du formulaire */}
                        <div className="mb-6 pb-4 border-b border-slate-800/50">
                            <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2.5">
                                <div className="relative">
                                    <div className="absolute inset-0 bg-[#FF2424] opacity-20 blur-md rounded-full" />
                                    <Plus className="relative text-[#FF2424] w-5 h-5" />
                                </div>
                                <span className="tracking-tight">
                                    Ajouter {activeTab === 'villes' ? 'une ville' : activeTab === 'communes' ? 'une commune' : 'un type'}
                                </span>
                            </h2>
                        </div>

                        {/* Formulaire */}
                        <form onSubmit={handleCreate} className="space-y-5">

                            {/* ========================================== */}
                            {/* 📝 CHAMP NOM/TITRE - Obligatoire */}
                            {/* ========================================== */}
                            <div className="space-y-2">
                                <label
                                    htmlFor="item-name"
                                    className="text-xs text-slate-400 uppercase font-semibold tracking-wide block"
                                >
                                    Nom / Titre <span className="text-[#FF2424]">*</span>
                                </label>
                                <input
                                    id="item-name"
                                    type="text"
                                    value={newItemName}
                                    onChange={(e) => setNewItemName(e.target.value)}
                                    className="
                            w-full bg-slate-950/80 border border-slate-700/60
                            rounded-xl px-4 py-3 text-white text-sm
                            placeholder:text-slate-500
                            focus:border-[#FF2424] focus:ring-2 focus:ring-[#FF2424]/20
                            outline-none transition-all duration-200
                            hover:border-slate-600
                        "
                                    placeholder="Entrez le nom..."
                                    required
                                    autoComplete="off"
                                />
                            </div>

                            {/* ========================================== */}
                            {/* 🏙️ SELECT VILLE - Conditionnel (Communes) */}
                            {/* ========================================== */}
                            {activeTab === 'communes' && (
                                <div className="space-y-2">
                                    <label
                                        htmlFor="ville-select"
                                        className="text-xs text-slate-400 uppercase font-semibold tracking-wide block"
                                    >
                                        Ville de rattachement <span className="text-[#FF2424]">*</span>
                                    </label>
                                    <select
                                        id="ville-select"
                                        onChange={(e) => setSelectedVilleId(Number(e.target.value))}
                                        className="
                                w-full bg-slate-950/80 border border-slate-700/60
                                rounded-xl px-4 py-3 text-white text-sm
                                focus:border-[#FF2424] focus:ring-2 focus:ring-[#FF2424]/20
                                outline-none transition-all duration-200
                                hover:border-slate-600 cursor-pointer
                            "
                                        required
                                    >
                                        <option value="" className="bg-slate-900">
                                            Sélectionner une ville
                                        </option>
                                        {villes.map(v => (
                                            <option
                                                key={v.id}
                                                value={v.id}
                                                className="bg-slate-900"
                                            >
                                                {v.nom}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            )}

                            {/* ========================================== */}
                            {/* 📄 TEXTAREA DESCRIPTION - Conditionnel (Types) */}
                            {/* ========================================== */}
                            {activeTab === 'types' && (
                                <div className="space-y-2">
                                    <label
                                        htmlFor="type-description"
                                        className="text-xs text-slate-400 uppercase font-semibold tracking-wide block"
                                    >
                                        Description
                                    </label>
                                    <textarea
                                        id="type-description"
                                        value={typeDesc}
                                        onChange={(e) => setTypeDesc(e.target.value)}
                                        className="
                                w-full bg-slate-950/80 border border-slate-700/60
                                rounded-xl px-4 py-3 text-white text-sm
                                placeholder:text-slate-500
                                focus:border-[#FF2424] focus:ring-2 focus:ring-[#FF2424]/20
                                outline-none transition-all duration-200
                                hover:border-slate-600
                                resize-none
                            "
                                        placeholder="Décrivez ce type d'incident..."
                                        rows={4}
                                    />
                                </div>
                            )}

                            {/* ========================================== */}
                            {/* ✅ BOUTON SUBMIT - Avec états loading */}
                            {/* ========================================== */}
                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="
                        group relative w-full 
                        bg-[#FF2424] hover:bg-[#D61F1F] 
                        disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-[#FF2424]
                        text-white font-bold text-sm
                        py-3.5 rounded-xl 
                        shadow-lg shadow-[#FF2424]/25
                        transition-all duration-200
                        hover:shadow-xl hover:shadow-[#FF2424]/40
                        active:scale-[0.98]
                        flex items-center justify-center gap-2.5
                        overflow-hidden
                    "
                            >
                                {/* Effet brillant au hover */}
                                <div className="absolute inset-0 bg-linear-to-r from-transparent via-white/10 to-transparent translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-700" />

                                {/* Contenu du bouton */}
                                <span className="relative flex items-center gap-2.5">
                                    {isSubmitting ? (
                                        <>
                                            <Loader2 className="w-5 h-5 animate-spin" />
                                            <span className="tracking-wide">Enregistrement...</span>
                                        </>
                                    ) : (
                                        <>
                                            <Plus className="w-5 h-5" />
                                            <span className="tracking-wide">Valider</span>
                                        </>
                                    )}
                                </span>
                            </button>
                        </form>
                    </div>
                </div>
                {/* ========================================== */}
                {/* 📊 LISTE DES DONNÉES - Col principale */}
                {/* ========================================== */}
                <div className="lg:col-span-2 space-y-6">

                    {loading ? (
                        /* ========================================== */
                        /* ⏳ SKELETON LOADER - État de chargement */
                        /* ========================================== */
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {[1, 2, 3, 4, 5, 6].map(i => (
                                <div
                                    key={i}
                                    className="h-24 bg-slate-900/40 rounded-2xl border border-slate-800/60 animate-pulse relative overflow-hidden"
                                >
                                    {/* Effet de brillance qui traverse */}
                                    <div className="absolute inset-0 bg-linear-to-r from-transparent via-slate-700/10 to-transparent translate-x-[-200%] animate-shimmer" />
                                </div>
                            ))}
                        </div>
                    ) : (() => {
                        /* ========================================== */
                        /* 🔒 SÉCURISATION DE LA LISTE */
                        /* ========================================== */
                        const rawList = activeTab === 'villes' ? villes : activeTab === 'communes' ? communes : types;
                        const safeList = Array.isArray(rawList) ? rawList : [];

                        /* ========================================== */
                        /* 📭 EMPTY STATE - Aucune donnée */
                        /* ========================================== */
                        if (safeList.length === 0) {
                            return (
                                <div className="flex flex-col items-center justify-center py-16 sm:py-20 bg-slate-900/20 border-2 border-dashed border-slate-800/60 rounded-3xl">
                                    {/* Icône avec animation */}
                                    <div className="relative mb-6">
                                        <div className="absolute inset-0 bg-slate-700/20 blur-2xl rounded-full animate-pulse" />
                                        <Database className="relative text-slate-700 w-12 h-12 sm:w-16 sm:h-16" />
                                    </div>

                                    {/* Message */}
                                    <p className="text-slate-500 font-semibold text-sm sm:text-base tracking-wide">
                                        Aucune donnée enregistrée
                                    </p>
                                    <p className="text-slate-600 text-xs sm:text-sm mt-2">
                                        Utilisez le formulaire pour ajouter un élément
                                    </p>
                                </div>
                            );
                        }

                        /* ========================================== */
                        /* 📋 GRID DE CARTES - Données existantes */
                        /* ========================================== */
                        return (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {safeList.map((item: any) => (
                                    <article
                                        key={item.id}
                                        className="
                            group relative
                            bg-slate-900/50 backdrop-blur-sm 
                            border border-slate-800/60
                            rounded-2xl p-5
                            hover:border-[#FF2424]/50 hover:bg-slate-900/70
                            transition-all duration-300 ease-out
                            shadow-lg hover:shadow-xl hover:shadow-[#FF2424]/10
                            cursor-pointer
                        "
                                    >
                                        <div className="flex items-center justify-between gap-4">

                                            {/* ========================================== */}
                                            {/* 📌 CONTENU PRINCIPAL */}
                                            {/* ========================================== */}
                                            <div className="flex items-center gap-4 flex-1 min-w-0">

                                                {/* Badge ID avec animation hover */}
                                                <div className="
                                    w-11 h-11 rounded-xl 
                                    bg-slate-950/80 
                                    flex items-center justify-center 
                                    text-slate-500 font-mono text-xs
                                    border border-slate-800/60
                                    group-hover:text-[#FF2424] 
                                    group-hover:border-[#FF2424]/40
                                    group-hover:bg-slate-950
                                    transition-all duration-300
                                    shrink-0
                                ">
                                                    {String(item.id).padStart(2, '0')}
                                                </div>

                                                {/* Informations textuelles */}
                                                <div className="flex flex-col min-w-0 flex-1">

                                                    {/* Titre/Nom principal */}
                                                    <h3 className="
                                        text-white font-bold 
                                        text-sm sm:text-base 
                                        tracking-tight
                                        truncate
                                        group-hover:text-[#FF2424]
                                        transition-colors duration-200
                                    ">
                                                        {item.nom || item.titre}
                                                    </h3>

                                                    {/* ========================================== */}
                                                    {/* 🏙️ META COMMUNE - Ville de rattachement */}
                                                    {/* ========================================== */}
                                                    {activeTab === 'communes' && (
                                                        <div className="flex items-center gap-2 mt-1.5">
                                                            {/* Bullet point avec glow */}
                                                            <div className="
                                                w-1.5 h-1.5 
                                                bg-[#FF2424] 
                                                rounded-full 
                                                shadow-[0_0_6px_#FF2424]
                                                animate-pulse
                                            " />

                                                            {/* Nom de la ville */}
                                                            <span className="
                                                text-[10px] sm:text-xs 
                                                text-slate-400 
                                                font-semibold 
                                                tracking-wide
                                                uppercase
                                            ">
                                                                {item.ville?.nom || villes.find(v => Number(v.id) === Number(item.ville_id))?.nom || "Ville inconnue"}
                                                            </span>
                                                        </div>
                                                    )}

                                                    {/* ========================================== */}
                                                    {/* 📝 META TYPE - Description */}
                                                    {/* ========================================== */}
                                                    {activeTab === 'types' && item.description && (
                                                        <p className="
                                            text-xs text-slate-500 
                                            mt-1.5 
                                            line-clamp-1
                                            max-w-50
                                        ">
                                                            {item.description}
                                                        </p>
                                                    )}
                                                </div>
                                            </div>

                                            {/* ========================================== */}
                                            {/* ➡️ ICÔNE HOVER - Indicateur d'action */}
                                            {/* ========================================== */}
                                            <div className="
                                flex items-center justify-center
                                w-8 h-8 rounded-lg 
                                bg-slate-950/80
                                opacity-0 group-hover:opacity-100
                                translate-x-2 group-hover:translate-x-0
                                transition-all duration-300
                                shrink-0
                            ">
                                                <ChevronRight className="w-4 h-4 text-[#FF2424]" />
                                            </div>
                                        </div>
                                    </article>
                                ))}
                            </div>
                        );
                    })()}

                    {/* ========================================== */}
                    {/* 📄 PAGINATION - Uniquement pour communes */}
                    {/* ========================================== */}
                    {activeTab === 'communes' && lastPage > 1 && (
                        <nav
                            className="flex items-center justify-center gap-4 sm:gap-6 pt-8 mt-6 border-t border-slate-800/60"
                            aria-label="Pagination des communes"
                        >
                            {/* Bouton Précédent */}
                            <button
                                onClick={() => handlePageChange(currentPage - 1)}
                                disabled={currentPage === 1 || loading}
                                aria-label="Page précédente"
                                className="
                    group p-3 
                    bg-slate-900/50 backdrop-blur-sm
                    border border-slate-800/60 
                    rounded-xl
                    disabled:opacity-30 disabled:cursor-not-allowed
                    hover:border-[#FF2424]/60 hover:bg-slate-900/70
                    active:scale-95
                    transition-all duration-200
                "
                            >
                                <ChevronLeft className="w-5 h-5 text-slate-400 group-hover:text-[#FF2424] transition-colors" />
                            </button>

                            {/* Indicateur de page actuelle */}
                            <div className="flex items-center gap-3">
                                {/* Page courante */}
                                <div className="
                    min-w-11 h-11 
                    flex items-center justify-center 
                    bg-[#FF2424] 
                    text-white 
                    rounded-xl 
                    font-bold text-base
                    shadow-lg shadow-[#FF2424]/30
                    ring-2 ring-[#FF2424]/20
                ">
                                    {currentPage}
                                </div>

                                {/* Séparateur */}
                                <span className="text-slate-600 font-bold text-lg">
                                    /
                                </span>

                                {/* Total de pages */}
                                <span className="text-slate-400 font-bold text-base min-w-6 text-center">
                                    {lastPage}
                                </span>
                            </div>

                            {/* Bouton Suivant */}
                            <button
                                onClick={() => handlePageChange(currentPage + 1)}
                                disabled={currentPage === lastPage || loading}
                                aria-label="Page suivante"
                                className="
                    group p-3 
                    bg-slate-900/50 backdrop-blur-sm
                    border border-slate-800/60 
                    rounded-xl
                    disabled:opacity-30 disabled:cursor-not-allowed
                    hover:border-[#FF2424]/60 hover:bg-slate-900/70
                    active:scale-95
                    transition-all duration-200
                "
                            >
                                <ChevronRight className="w-5 h-5 text-slate-400 group-hover:text-[#FF2424] transition-colors" />
                            </button>
                        </nav>
                    )}
                </div>
                </div>
            </div>
      
    );
   
}