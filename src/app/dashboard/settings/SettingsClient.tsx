"use client";

import React, { useEffect, useMemo, useState } from 'react';
import { SettingsService } from '@/services/settings.service';
import { Setting } from '@/types/settings';
import {
    Settings,
    ShieldCheck,
    Save,
    AlertTriangle,
    Gauge,
    Minus,
    Plus,
    Users,
    ArrowRight,
    SlidersHorizontal,
    Loader2,
    Database,
    ChevronRight,
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { showToast } from '@/lib/toast-utils';
import Link from 'next/link';

export default function SettingsClient() {
    // ==========================================
    // 🎯 STATE MANAGEMENT (logique métier inchangée)
    // ==========================================
    const [settings, setSettings] = useState<Setting[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    // Valeur locale pour le seuil avant sauvegarde
    const [threshold, setThreshold] = useState<string>("2");

    // 🆕 Valeur réellement persistée (pour détecter les modifications non enregistrées)
    const [savedThreshold, setSavedThreshold] = useState<string>("2");

    // ==========================================
    // 🔄 CHARGEMENT INITIAL DES PARAMÈTRES
    // ==========================================
    useEffect(() => {
        const fetchSettings = async () => {
            try {
                const data = await SettingsService.getAll();
                setSettings(data.settings);

                // On cherche la clé spécifique dans le tableau
                const thresholdSetting = data.settings.find(
                    (s) => s.key === 'incident_validation_threshold'
                );

                if (thresholdSetting) {
                    setThreshold(thresholdSetting.value);
                    setSavedThreshold(thresholdSetting.value); // 🆕 référence de comparaison
                }
            } catch (error) {
                toast.error("Erreur lors du chargement des paramètres");
            } finally {
                setLoading(false);
            }
        };

        fetchSettings();
    }, []);

    // ==========================================
    // 💾 MISE À JOUR DU SEUIL (logique inchangée)
    // ==========================================
    const handleUpdateThreshold = async () => {
        setSaving(true);

        try {
            await SettingsService.update('incident_validation_threshold', threshold);

            // ✅ Toast personnalisé
            showToast.success("Seuil mis à jour avec succès");

            // 🆕 On synchronise la référence après succès
            setSavedThreshold(threshold);

            // Vibration et son de confirmation
            if (navigator.vibrate) navigator.vibrate(50);
            const audio = new Audio('/sounds/success.mp3');
            audio.play().catch(() => { });

        } catch (error) {
            // ✅ Toast d'erreur propre
            showToast.error("Erreur lors de la mise à jour");
        } finally {
            setSaving(false);
        }
    };

    // ==========================================
    // 🧮 VALEURS DÉRIVÉES (UI uniquement)
    // ==========================================

    /** Conversion sécurisée du seuil en nombre */
    const thresholdNumber = useMemo(() => {
        const parsed = Number.parseInt(threshold, 10);
        return Number.isNaN(parsed) ? 0 : parsed;
    }, [threshold]);

    /** Détecte si des modifications ne sont pas encore enregistrées */
    const hasUnsavedChanges = threshold !== savedThreshold;

    /** Profil de validation calculé selon le seuil (feedback pédagogique) */
    const validationProfile = useMemo(() => {
        if (thresholdNumber <= 2) {
            return {
                label: 'Réactif',
                hint: 'Validation rapide, vigilance accrue sur les faux positifs',
                color: 'text-amber-400',
                bg: 'bg-amber-500/10',
                ring: 'ring-amber-500/30',
                bar: 'bg-amber-500',
                width: '33%',
            };
        }
        if (thresholdNumber <= 5) {
            return {
                label: 'Équilibré',
                hint: 'Bon compromis entre réactivité et fiabilité',
                color: 'text-emerald-400',
                bg: 'bg-emerald-500/10',
                ring: 'ring-emerald-500/30',
                bar: 'bg-emerald-500',
                width: '66%',
            };
        }
        return {
            label: 'Strict',
            hint: 'Fiabilité maximale, validation plus lente',
            color: 'text-blue-400',
            bg: 'bg-blue-500/10',
            ring: 'ring-blue-500/30',
            bar: 'bg-blue-500',
            width: '100%',
        };
    }, [thresholdNumber]);

    /** Incrémente / décrémente le seuil (min 1, max 20) */
    const adjustThreshold = (delta: number) => {
        const next = Math.min(20, Math.max(1, thresholdNumber + delta));
        setThreshold(String(next));
        if (navigator.vibrate) navigator.vibrate(10);
    };

    // ==========================================
    // ⏳ SKELETON LOADER
    // ==========================================
    if (loading) {
        return (
            <div className="p-4 sm:p-6 lg:p-8 space-y-6 sm:space-y-8 max-w-5xl mx-auto">
                {/* Skeleton header */}
                <div className="space-y-3">
                    <div className="h-3 w-40 bg-slate-800/60 rounded animate-pulse" />
                    <div className="h-9 w-72 bg-slate-800/60 rounded-lg animate-pulse" />
                </div>

                {/* Skeleton cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {[0, 1].map((i) => (
                        <div
                            key={i}
                            className="relative h-72 bg-slate-900/40 border border-slate-800/60 rounded-2xl overflow-hidden"
                        >
                            {/* Effet shimmer */}
                            <div className="absolute inset-0 bg-linear-to-r from-transparent via-slate-700/10 to-transparent -translate-x-full animate-shimmer" />
                            <div className="p-6 space-y-4 animate-pulse">
                                <div className="h-5 w-1/2 bg-slate-800/60 rounded" />
                                <div className="h-3 w-2/3 bg-slate-800/60 rounded" />
                                <div className="h-12 w-full bg-slate-800/60 rounded-xl" />
                                <div className="h-12 w-full bg-slate-800/60 rounded-xl" />
                            </div>
                        </div>
                    ))}
                    <div className="md:col-span-2 h-28 bg-slate-900/40 border border-slate-800/60 rounded-2xl animate-pulse" />
                </div>
            </div>
        );
    }

    // ==========================================
    // 🎨 RENDER
    // ==========================================
    return (
        <div className="p-4 sm:p-6 lg:p-8 space-y-6 sm:space-y-8 max-w-5xl mx-auto">

            {/* ========================================== */}
            {/* 🧭 BREADCRUMBS + HEADER */}
            {/* ========================================== */}
            <header className="space-y-3">
                {/* Fil d'ariane */}
                <nav aria-label="Fil d'ariane" className="animate-fade-in-down">
                    <ol className="flex items-center gap-1.5 text-xs sm:text-sm text-slate-500">
                        <li>
                            <Link
                                href="/dashboard"
                                className="hover:text-slate-300 transition-colors cursor-pointer"
                            >
                                Dashboard
                            </Link>
                        </li>
                        <li aria-hidden="true">
                            <ChevronRight className="w-3.5 h-3.5 text-slate-700" />
                        </li>
                        <li aria-current="page" className="text-[#FF2424] font-semibold">
                            Paramètres
                        </li>
                    </ol>
                </nav>

                {/* Titre principal */}
                <div className="flex items-center gap-3 animate-fade-in-down animation-delay-100">
                    <div className="relative">
                        {/* Glow externe pulsant */}
                        <div className="absolute inset-0 bg-[#FF2424] opacity-20 blur-xl rounded-full animate-pulse" />
                        {/* Glow moyen */}
                        <div className="absolute inset-0 bg-[#FF2424] opacity-30 blur-md rounded-full animate-ping-slow" />
                        <Settings className="relative text-[#FF2424] w-7 h-7 sm:w-8 sm:h-8 shrink-0 drop-shadow-[0_0_12px_rgba(255,36,36,0.6)] animate-spin-slow" />
                    </div>

                    <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
                        Paramètres système
                    </h1>
                </div>

                <p className="text-slate-400 text-xs sm:text-sm pl-10 sm:pl-11 animate-fade-in-up animation-delay-200">
                    Configuration du moteur de validation et des règles métier
                </p>
            </header>

            {/* ========================================== */}
            {/* 🗂️ GRILLE DES CARTES */}
            {/* ========================================== */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-6">

                {/* ================================================= */}
                {/* 🛡️ CARTE 1 — SEUIL DE VALIDATION */}
                {/* ================================================= */}
                <section className="
                    group relative
                    bg-slate-900/50 backdrop-blur-sm
                    border border-slate-800/60
                    rounded-2xl p-6
                    shadow-xl
                    overflow-hidden
                    hover:border-slate-700
                    transition-colors duration-300
                    animate-fade-in-up animation-delay-200
                ">
                    {/* Gradient décoratif */}
                    <div className="absolute -top-10 -right-10 w-40 h-40 bg-linear-to-br from-[#FF2424]/15 to-transparent blur-3xl opacity-60 group-hover:opacity-90 transition-opacity duration-500" />

                    <div className="relative space-y-6">
                        {/* En-tête de carte */}
                        <div className="flex items-start justify-between gap-4 pb-4 border-b border-slate-800/60">
                            <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2.5">
                                <span className="relative flex items-center justify-center w-9 h-9 rounded-xl bg-[#FF2424]/10 border border-[#FF2424]/25">
                                    <ShieldCheck className="w-5 h-5 text-[#FF2424]" />
                                </span>
                                <span className="tracking-tight">Validation des incidents</span>
                            </h2>

                            {/* Badge modifications non enregistrées */}
                            {hasUnsavedChanges && (
                                <span className="shrink-0 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide bg-amber-500/10 text-amber-400 ring-1 ring-amber-500/30 animate-pulse">
                                    Non enregistré
                                </span>
                            )}
                        </div>

                        {/* Champ seuil avec stepper */}
                        <div className="space-y-3">
                            <label
                                htmlFor="threshold-input"
                                className="text-xs text-slate-400 uppercase font-semibold tracking-wide block"
                            >
                                Seuil de confirmations requis
                            </label>

                            <div className="flex items-center gap-3">
                                {/* Bouton décrémenter */}
                                <button
                                    type="button"
                                    onClick={() => adjustThreshold(-1)}
                                    disabled={thresholdNumber <= 1}
                                    aria-label="Diminuer le seuil"
                                    className="
                                        shrink-0 w-11 h-11 rounded-xl
                                        bg-slate-950/80 border border-slate-700/60
                                        text-slate-400
                                        hover:border-[#FF2424]/50 hover:text-[#FF2424]
                                        disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:border-slate-700/60 disabled:hover:text-slate-400
                                        transition-all duration-200 active:scale-90
                                        flex items-center justify-center
                                    "
                                >
                                    <Minus className="w-4 h-4" />
                                </button>

                                {/* Input numérique */}
                                <input
                                    id="threshold-input"
                                    type="number"
                                    min={1}
                                    max={20}
                                    value={threshold}
                                    onChange={(e) => setThreshold(e.target.value)}
                                    className="
                                        w-24 h-11 text-center
                                        bg-slate-950/80 border border-slate-700/60 rounded-xl
                                        text-white text-lg font-bold tabular-nums
                                        focus:border-[#FF2424] focus:ring-2 focus:ring-[#FF2424]/20
                                        hover:border-slate-600
                                        outline-none transition-all duration-200
                                        [appearance:textfield]
                                        [&::-webkit-outer-spin-button]:appearance-none
                                        [&::-webkit-inner-spin-button]:appearance-none
                                    "
                                />

                                {/* Bouton incrémenter */}
                                <button
                                    type="button"
                                    onClick={() => adjustThreshold(1)}
                                    disabled={thresholdNumber >= 20}
                                    aria-label="Augmenter le seuil"
                                    className="
                                        shrink-0 w-11 h-11 rounded-xl
                                        bg-slate-950/80 border border-slate-700/60
                                        text-slate-400
                                        hover:border-[#FF2424]/50 hover:text-[#FF2424]
                                        disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:border-slate-700/60 disabled:hover:text-slate-400
                                        transition-all duration-200 active:scale-90
                                        flex items-center justify-center
                                    "
                                >
                                    <Plus className="w-4 h-4" />
                                </button>

                                {/* Aide contextuelle */}
                                <p className="text-xs text-slate-500 leading-relaxed">
                                    Votes citoyens nécessaires pour valider automatiquement un incident.
                                </p>
                            </div>
                        </div>

                        {/* Bouton de sauvegarde */}
                        <button
                            onClick={handleUpdateThreshold}
                            disabled={saving}
                            className="
                                group/btn relative w-full overflow-hidden
                                bg-[#FF2424] hover:bg-[#D61F1F]
                                disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-[#FF2424]
                                text-white font-bold text-sm
                                py-3.5 rounded-xl
                                shadow-lg shadow-[#FF2424]/25
                                hover:shadow-xl hover:shadow-[#FF2424]/40
                                transition-all duration-200 active:scale-[0.98]
                                flex items-center justify-center gap-2.5
                            "
                        >
                            {/* Effet brillant au hover */}
                            <span className="absolute inset-0 bg-linear-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover/btn:translate-x-full transition-transform duration-700" />

                            <span className="relative flex items-center gap-2.5">
                                {saving ? (
                                    <>
                                        <Loader2 className="w-5 h-5 animate-spin" />
                                        <span className="tracking-wide">Sauvegarde...</span>
                                    </>
                                ) : (
                                    <>
                                        <Save className="w-5 h-5" />
                                        <span className="tracking-wide">Appliquer les modifications</span>
                                    </>
                                )}
                            </span>
                        </button>
                    </div>
                </section>

                {/* ================================================= */}
                {/* 📊 CARTE 2 — APERÇU DE L'IMPACT (remplace État du Serveur) */}
                {/* ================================================= */}
                <section className="
                    group relative
                    bg-slate-900/50 backdrop-blur-sm
                    border border-slate-800/60
                    rounded-2xl p-6
                    shadow-xl overflow-hidden
                    hover:border-slate-700
                    transition-colors duration-300
                    animate-fade-in-up animation-delay-300
                ">
                    {/* Gradient décoratif */}
                    <div className="absolute -top-10 -right-10 w-40 h-40 bg-linear-to-br from-emerald-500/10 to-transparent blur-3xl opacity-60" />

                    <div className="relative space-y-6">
                        {/* En-tête */}
                        <div className="flex items-center justify-between gap-4 pb-4 border-b border-slate-800/60">
                            <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2.5">
                                <span className="relative flex items-center justify-center w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/25">
                                    <Gauge className="w-5 h-5 text-emerald-400" />
                                </span>
                                <span className="tracking-tight">Aperçu de l&apos;impact</span>
                            </h2>

                            {/* Badge profil de validation */}
                            <span className={`shrink-0 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide ring-1 ${validationProfile.bg} ${validationProfile.color} ${validationProfile.ring}`}>
                                {validationProfile.label}
                            </span>
                        </div>

                        {/* Visualisation des votes requis */}
                        <div className="space-y-3">
                            <p className="text-xs text-slate-400 uppercase font-semibold tracking-wide">
                                Confirmations nécessaires
                            </p>

                            {/* Points représentant les votes */}
                            <div className="flex items-center gap-1.5 flex-wrap">
                                {Array.from({ length: Math.min(Math.max(thresholdNumber, 0), 12) }).map((_, i) => (
                                    <span
                                        key={i}
                                        className="w-7 h-7 rounded-lg bg-[#FF2424]/15 border border-[#FF2424]/35 flex items-center justify-center animate-fade-in-up"
                                        style={{ animationDelay: `${i * 40}ms` }}
                                    >
                                        <Users className="w-3.5 h-3.5 text-[#FF2424]" />
                                    </span>
                                ))}
                                {thresholdNumber > 12 && (
                                    <span className="text-xs text-slate-500 font-mono ml-1">
                                        +{thresholdNumber - 12}
                                    </span>
                                )}
                                {thresholdNumber <= 0 && (
                                    <span className="text-xs text-slate-500 italic">
                                        Valeur invalide
                                    </span>
                                )}
                            </div>
                        </div>

                        {/* Jauge du profil */}
                        <div className="space-y-2">
                            <div className="flex items-center justify-between text-xs">
                                <span className="text-slate-500">Niveau d&apos;exigence</span>
                                <span className={`font-semibold ${validationProfile.color}`}>
                                    {validationProfile.label}
                                </span>
                            </div>
                            <div className="h-1.5 w-full bg-slate-800/80 rounded-full overflow-hidden">
                                <div
                                    className={`h-full rounded-full ${validationProfile.bar} transition-all duration-500 ease-out`}
                                    style={{ width: validationProfile.width }}
                                />
                            </div>
                            <p className="text-xs text-slate-500 leading-relaxed">
                                {validationProfile.hint}
                            </p>
                        </div>

                        {/* Comparaison avant / après */}
                        <div className="flex items-center justify-between gap-3 p-3 rounded-xl bg-slate-950/60 border border-slate-800/60">
                            {/* Valeur enregistrée */}
                            <div className="text-center flex-1">
                                <p className="text-[10px] text-slate-500 uppercase font-semibold tracking-wide">
                                    Actuel
                                </p>
                                <p className="text-xl font-bold text-slate-300 tabular-nums">
                                    {savedThreshold}
                                </p>
                            </div>

                            <ArrowRight className={`w-4 h-4 shrink-0 ${hasUnsavedChanges ? 'text-[#FF2424]' : 'text-slate-700'}`} />

                            {/* Nouvelle valeur */}
                            <div className="text-center flex-1">
                                <p className="text-[10px] text-slate-500 uppercase font-semibold tracking-wide">
                                    Après application
                                </p>
                                <p className={`text-xl font-bold tabular-nums ${hasUnsavedChanges ? 'text-[#FF2424]' : 'text-slate-300'}`}>
                                    {threshold || '—'}
                                </p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* ================================================= */}
                {/* ⚠️ CARTE 4 — ZONE DE HAUTE VIGILANCE */}
                {/* ================================================= */}
                <section className="
                    relative md:col-span-2
                    bg-slate-900/50 backdrop-blur-sm
                    border border-slate-800/60 border-l-4 border-l-[#FF2424]
                    rounded-2xl p-6
                    shadow-xl overflow-hidden
                    animate-fade-in-up animation-delay-500
                ">
                    {/* Gradient décoratif */}
                    <div className="absolute -top-8 left-0 w-48 h-24 bg-linear-to-r from-[#FF2424]/10 to-transparent blur-3xl opacity-70" />

                    <div className="relative flex items-start gap-4">
                        {/* Icône alerte */}
                        <div className="shrink-0 p-3 bg-[#FF2424]/10 border border-[#FF2424]/25 rounded-xl">
                            <AlertTriangle className="w-5 h-5 text-[#FF2424]" />
                        </div>

                        {/* Message */}
                        <div className="space-y-1.5">
                            <h3 className="text-white font-bold text-sm sm:text-base tracking-tight">
                                Zone de haute vigilance
                            </h3>
                            <p className="text-slate-400 text-xs sm:text-sm leading-relaxed">
                                Toute modification du seuil impacte immédiatement le flux des notifications citoyennes.
                                Les incidents ayant déjà atteint l&apos;ancien seuil ne seront pas rétroactivement modifiés.
                            </p>
                        </div>
                    </div>
                </section>

            </div>
        </div>
    );
}