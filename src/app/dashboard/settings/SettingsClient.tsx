"use client";

import React, { useEffect, useState } from 'react';
import { SettingsService } from '@/services/settings.service';
import { Setting } from '@/types/settings';
import { Settings, ShieldCheck, Activity, Save, AlertTriangle, Info } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { showToast } from '@/lib/toast-utils';

export default function SettingsClient() {
    const [settings, setSettings] = useState<Setting[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    // Valeur locale pour le seuil avant sauvegarde
    const [threshold, setThreshold] = useState<string>("2");

 
    useEffect(() => {
    const fetchSettings = async () => {
        try {
            const data = await SettingsService.getAll();
            setSettings(data.settings);
            // On cherche la clé spécifique dans le tableau
            const thresholdSetting = data.settings.find(s => s.key === 'incident_validation_threshold');
            if (thresholdSetting) setThreshold(thresholdSetting.value);
        } catch (error) {
            toast.error("Erreur lors du chargement des paramètres");
        } finally {
            setLoading(false);
        }
    };

   
        fetchSettings();
    }, []);

    const handleUpdateThreshold = async () => {
        setSaving(true);

        try {
            await SettingsService.update('incident_validation_threshold', threshold);

            // ✅ Toast personnalisé (remplace toast.success et son style lourd)
            showToast.success("Seuil mis à jour avec succès");

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

    if (loading) return <div className="animate-pulse text-slate-500">Chargement du panneau de contrôle...</div>;

    return (
        <div className="p-6 space-y-8 max-w-5xl mx-auto">

            {/* Header avec Breadcrumbs */}
            <div className="flex flex-col gap-2">
                <div className="flex items-center gap-2 text-sm text-slate-500">
                    <span>Dashboard</span>
                    <span>/</span>
                    <span className="text-[#FF2424]">Paramètres</span>
                </div>
                <h1 className="text-3xl font-bold text-white tracking-tight flex items-center gap-3">
                    <Settings className="text-[#FF2424] w-8 h-8" />
                    PARAMÈTRES SYSTÈME
                </h1>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                {/* CARTE 1 : SEUIL DE VALIDATION */}
                <div className="bg-[#141A28] border border-slate-800 rounded-xl p-6 shadow-2xl relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform duration-500">
                        <ShieldCheck size={80} className="text-[#FF2424]" />
                    </div>

                    <h2 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
                        <ShieldCheck className="text-[#FF2424] w-5 h-5" />
                        Validation des Incidents
                    </h2>

                    <div className="space-y-4 relative z-10">
                        <label className="text-sm text-slate-400 block underline decoration-[#FF2424]/30">
                            Seuil de confirmations requis
                        </label>
                        <div className="flex items-center gap-4">
                            <input
                                type="number"
                                value={threshold}
                                onChange={(e) => setThreshold(e.target.value)}
                                className="w-24 bg-[#080C14] border border-slate-700 rounded-lg py-3 px-4 text-white focus:outline-none focus:border-[#FF2424] transition-all"
                            />
                            <p className="text-xs text-slate-500 italic">
                                Nombre de votes citoyens nécessaires pour valider automatiquement un incident.
                            </p>
                        </div>

                        <button
                            onClick={handleUpdateThreshold}
                            disabled={saving}
                            className="mt-4 w-full bg-[#FF2424] hover:bg-[#D61F1F] text-white font-bold py-3 rounded-lg flex items-center justify-center gap-2 transition-all active:scale-95 disabled:opacity-50 shadow-[0_0_15px_rgba(255,36,36,0.2)]"
                        >
                            <Save size={18} />
                            {saving ? "SAUVEGARDE..." : "APPLIQUER LES MODIFICATIONS"}
                        </button>
                    </div>
                </div>

                {/* CARTE 2 : INFOS SYSTÈME (PROPOSITION) */}
                <div className="bg-[#141A28] border border-slate-800 rounded-xl p-6 shadow-2xl">
                    <h2 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
                        <Activity className="text-emerald-500 w-5 h-5" />
                        État du Serveur
                    </h2>

                    <div className="space-y-4">
                        <div className="flex justify-between items-center py-2 border-b border-slate-800">
                            <span className="text-slate-400">Version API</span>
                            <span className="text-white font-mono text-sm">v1.0.4 (Laravel 11)</span>
                        </div>
                        <div className="flex justify-between items-center py-2 border-b border-slate-800">
                            <span className="text-slate-400">Environnement</span>
                            <span className="px-2 py-1 bg-emerald-500/10 text-emerald-500 text-[10px] rounded uppercase font-bold">Production</span>
                        </div>
                        <div className="flex justify-between items-center py-2 border-b border-slate-800">
                            <span className="text-slate-400">Fuseau Horaire</span>
                            <span className="text-white text-sm">Africa/Kinshasa</span>
                        </div>
                        <div className="flex justify-between items-center py-2">
                            <span className="text-slate-400">Dernière Sync</span>
                            <span className="text-slate-500 text-xs italic">{new Date().toLocaleTimeString()}</span>
                        </div>
                    </div>
                </div>

                {/* CARTE 3 : SÉCURITÉ & AUDIT */}
                <div className="bg-[#141A28] border border-slate-800 rounded-xl p-6 shadow-2xl md:col-span-2 border-l-4 border-l-[#FF2424]">
                    <div className="flex items-start gap-4">
                        <div className="p-3 bg-[#FF2424]/10 rounded-lg">
                            <AlertTriangle className="text-[#FF2424]" />
                        </div>
                        <div>
                            <h3 className="text-white font-bold">Zone de Haute Vigilance</h3>
                            <p className="text-slate-400 text-sm mt-1">
                                Toute modification du seuil impacte immédiatement le flux des notifications citoyennes.
                                Les incidents ayant déjà atteint l&apos;ancien seuil ne seront pas rétroactivement modifiés.
                            </p>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
}