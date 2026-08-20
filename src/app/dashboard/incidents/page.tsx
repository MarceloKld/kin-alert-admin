"use client";

import React, { useEffect, useState, useCallback } from 'react';
import {
    Search, Filter, CheckCircle, XCircle, Trash2,
    RefreshCcw, ChevronLeft, ChevronRight, Eye, AlertTriangle, MapPin
} from 'lucide-react';
import { IncidentService } from '@/services/incident.service';
import { Incident } from '@/types';
import StatusBadge from '@/components/ui/StatusBadge';
import IncidentDetailModal from '@/components/features/modals/IncidentDetailModal';
import { toast, Toaster } from 'react-hot-toast';
// Ajoute STORAGE_URL dans les accolades des imports existants
import { STORAGE_URL } from '@/services/incident.service';
import { Toast, ToastType } from '@/components/ui/Toast'; 
import { AxiosError } from 'axios';
import { ApiErrorResponse } from '@/types';

export default function IncidentsPage() {
    // États
    const [incidents, setIncidents] = useState<Incident[]>([]);
    const [loading, setLoading] = useState(true);
    const [meta, setMeta] = useState({ current_page: 1, last_page: 1, total: 0 });

    // Filtres
    const [statusFilter, setStatusFilter] = useState('tous');
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedIncident, setSelectedIncident] = useState<Incident | null>(null);
    const [isProcessing, setIsProcessing] = useState(false); // CHARGEMENT PREMIUM POUR ACTIONS
    const [currentPage, setCurrentPage] = useState(1);





    // Typage correct pour éviter le rouge sur 'any'
    interface ApiError {
        response?: {
            data?: {
                message?: string;
            }
        }
    }

    // ÉTAT DU TOAST PERSONNALISÉ
    const [toastConfig, setToastConfig] = useState<{ show: boolean, message: string, type: ToastType }>({
        show: false,
        message: '',
        type: 'loading'
    });

    const showToast = (message: string, type: ToastType) => {
        setToastConfig({ show: true, message, type });
    };

    const hideToast = () => setToastConfig(prev => ({ ...prev, show: false }));




    // 3. FONCTION DE CHARGEMENT (Stabilisée avec useCallback)
    // Elle ne dépend plus de loadData(1) mais de l'état currentPage
    const fetchData = useCallback(async () => {
        setLoading(true);
        try {
            // Note : On utilise 'statut' car c'est ce que ton Postman attend
            const res = await IncidentService.getAll(currentPage, statusFilter, searchTerm);
            setIncidents(res.data);
            setMeta({
                current_page: res.meta.current_page,
                last_page: res.meta.last_page,
                total: res.meta.total
            });
        } catch (error) {
            console.error("Erreur API:", error);
            toast.error("Impossible de charger les données");
        } finally {
            setLoading(false);
        }
    }, [currentPage, statusFilter, searchTerm]); // Se recharge uniquement si l'un d'eux change


    // Fonction de chargement stable avec useCallback
    // 1. Stabiliser loadData avec useCallback
    const loadData = useCallback(async () => {
        try {
            // Note: On utilise 'status' (anglais) pour ton backend Laravel
            const res = await IncidentService.getAll(currentPage, statusFilter, searchTerm);
            setIncidents(res.data);
            setMeta({
                current_page: res.meta.current_page,
                last_page: res.meta.last_page,
                total: res.meta.total
            });
        } catch (error) {
            showToast("Erreur de connexion serveur", 'error');
        } finally {
            setLoading(false);
        }
    }, [currentPage, statusFilter, searchTerm]);
    


    // 4. L'EFFET UNIQUE (Propre et sans erreur de cascade)
    useEffect(() => {
        Promise.resolve().then(() => {
            fetchData();
        });
    }, [fetchData]);

    // 5. GESTIONNAIRES D'ÉVÉNEMENTS


    const handlePageChange = (newPage: number) => {
        if (newPage >= 1 && newPage <= meta.last_page) {
            setCurrentPage(newPage);
            // La vibration premium
            if (window.navigator.vibrate) window.navigator.vibrate(10);
        }
    };

    // Actions
    // Actions
    // 1. Mettre à jour handleAction pour accepter number | string
    const handleAction = async (id: string | number, action: string) => {
        // 1. Afficher le toast de chargement
        showToast("Traitement en cours...", 'loading');

        try {
            if (action === 'delete') await IncidentService.delete(id);
            else if (action === 'restore') await IncidentService.restore(id);
            else await IncidentService.forceStatus(id, action);

            // 2. Succès
            showToast("Opération réussie avec succès", 'success');
            await loadData();
        } catch (error: unknown) {
            // 3. Typage propre 'unknown' au lieu de 'any'
            const axiosError = error as AxiosError<ApiErrorResponse>;

            // Si le gestionnaire tente une action interdite (Code HTTP 403)
            if (axiosError.response?.status === 403) {
                showToast(
                    "Action non autorisée : Vous n'avez pas les droits requis pour effectuer cette opération. Veuillez contacter l'administrateur.",
                    'error'
                );
            } else {
                const msg = axiosError.response?.data?.message || "L'action a échoué";
                showToast(msg, 'error');
            }
        }
    };


    // Fonction pour corriger l'URL de l'image (Local vs Prod vs Cloudinary)
    const getThumbnailUrl = (fichier: string) => {
        if (!fichier) return '';

        // Si c'est déjà une URL absolue (ex: Cloudinary), on la retourne directement
        if (fichier.startsWith('http')) return fichier;

        // Déterminer la base URL (Local ou Prod)
        let baseUrl = process.env.NEXT_PUBLIC_STORAGE_URL || STORAGE_URL || '';
        if (!baseUrl.endsWith('/')) baseUrl += '/';

        // Nettoyer le chemin provenant de la BDD
        const cleanFilePath = fichier.startsWith('/') ? fichier.substring(1) : fichier;

        return `${baseUrl}${cleanFilePath}`;
    };


    return (
        <div className="p-6 space-y-6">
            {/* AFFICHAGE DU TOAST */}
            {toastConfig.show && (
                <Toast
                    message={toastConfig.message}
                    type={toastConfig.type}
                    onClose={hideToast}
                />
            )}

            {/* Header & Filtres */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-white tracking-tight italic">KIN-ALERT <span className="text-red-600">MODÉRATION</span></h1>
                    <p className="text-gray-500 text-sm italic">Gestion du flux des incidents en temps réel.</p>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                    {/* Recherche */}
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                        <input
                            type="text"
                            placeholder="Rechercher..."
                            className="bg-[#0f1117] border border-white/5 rounded-xl py-2 pl-10 pr-4 text-sm text-white w-64 focus:ring-1 focus:ring-red-500 transition-all"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>

                    {/* Filtre Statut */}
                    <select
                        className="bg-[#0f1117] border border-white/5 rounded-xl py-2 px-4 text-sm text-gray-300 focus:ring-1 focus:ring-red-500 outline-none"
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                    >
                        <option value="tous">Tous les statuts</option>
                        <option value="en_attente">En attente</option>
                        <option value="valide">Validés</option>
                        <option value="rejete">Rejetés</option>
                    </select>
                </div>
            </div>

            {/* Table Section */}
            <div className="bg-[#0f1117]/50 backdrop-blur-xl border border-white/5 rounded-3xl overflow-hidden shadow-2xl">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="border-b border-white/5 bg-white/2 text-xs uppercase tracking-widest text-gray-500">
                                <th className="p-5 font-semibold">Incident</th>
                                <th className="p-5 font-semibold">Localisation</th>
                                <th className="p-5 font-semibold text-center">Confirmations</th>
                                <th className="p-5 font-semibold">Statut</th>
                                <th className="p-5 font-semibold text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {loading ? (
                                // SKELETON LOADERS
                                [...Array(5)].map((_, i) => (
                                    <tr key={i} className="animate-pulse">
                                        <td colSpan={5} className="p-10">
                                            <div className="h-4 bg-white/5 rounded w-3/4 mb-2"></div>
                                            <div className="h-3 bg-white/5 rounded w-1/2"></div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                incidents.map((incident) => (
                                    <tr key={incident.id} className="group hover:bg-white/1 transition-all">
                                        <td className="p-5">
                                            <div className="flex items-center gap-3">
                                                {/* Mini Thumbnail */}
                                                <div className="w-10 h-10 rounded-lg bg-white/5 border border-white/10 overflow-hidden shrink-0">
                                                    {incident.preuves && incident.preuves.length > 0 ? (
                                                        <img
                                                            src={getThumbnailUrl(incident.preuves[0].fichier)}
                                                            className="w-full h-full object-cover"
                                                            alt="Thumbnail"
                                                        />
                                                    ) : (
                                                        <div className="w-full h-full flex items-center justify-center text-[8px] text-gray-600 font-bold uppercase p-1 text-center">
                                                            Pas d&apos;image
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="flex flex-col">
                                                    <span className="text-sm font-bold text-white group-hover:text-red-500 transition-colors uppercase">
                                                        {incident.titre}
                                                    </span>
                                                    <span className="text-[10px] text-gray-500 font-medium">{incident.type_incident.titre}</span>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="p-5">
                                            <button
                                                onClick={() => setSelectedIncident(incident)}
                                                className="flex flex-col text-left group/loc"
                                            >
                                                <span className="text-xs text-gray-300 flex items-center gap-1 group-hover/loc:text-red-400">
                                                    <MapPin className="w-3 h-3" /> {incident.commune.nom}
                                                </span>
                                                <span className="text-[10px] text-gray-600 italic underline">Cliquer pour voir les détails</span>
                                            </button>
                                        </td>
                                        <td className="p-5 text-center">
                                            <span className="px-3 py-1 rounded-full bg-red-500/5 text-red-500 border border-red-500/10 text-xs font-black">
                                                {incident.nombre_confirmations}
                                            </span>
                                        </td>
                                        <td className="p-5">
                                            <StatusBadge status={incident.statut} />
                                        </td>
                                        <td className="p-5">
                                            <div className="flex items-center justify-end gap-1">
                                                <button onClick={() => setSelectedIncident(incident)} className="p-2 text-gray-400 hover:text-white transition-colors" title="Détails">
                                                    <Eye className="w-4 h-4" />
                                                </button>

                                                {incident.deleted_at ? (
                                                    <button onClick={() => handleAction(incident.id, 'restore')} className="p-2 text-blue-400 hover:bg-blue-400/10 rounded-lg transition-all" title="Restaurer">
                                                        <RefreshCcw className="w-4 h-4" />
                                                    </button>
                                                ) : (
                                                    <>
                                                        <button onClick={() => handleAction(incident.id, 'valide')} className="p-2 text-emerald-500 hover:bg-emerald-500/10 rounded-lg transition-all" title="Valider">
                                                            <CheckCircle className="w-4 h-4" />
                                                        </button>
                                                        <button onClick={() => handleAction(incident.id, 'rejete')} className="p-2 text-amber-500 hover:bg-amber-500/10 rounded-lg transition-all" title="Rejeter">
                                                            <XCircle className="w-4 h-4" />
                                                        </button>
                                                        <button onClick={() => handleAction(incident.id, 'delete')} className="p-2 text-rose-500 hover:bg-rose-500/10 rounded-lg transition-all" title="Supprimer">
                                                            <Trash2 className="w-4 h-4" />
                                                        </button>
                                                    </>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* PAGINATION PREMIUM CORRIGÉE */}
                <div className="flex items-center justify-between px-6 py-4 bg-[#0b0c10]/50 rounded-4xl border border-white/5">
                    <span className="text-xs text-gray-500 font-bold uppercase tracking-widest">
                        Total : {meta.total} incidents
                    </span>

                    <div className="flex items-center gap-4">
                        <button
                            disabled={currentPage === 1 || loading}
                            onClick={() => handlePageChange(currentPage - 1)}
                            className="p-3 rounded-xl bg-white/5 border border-white/5 text-white disabled:opacity-20 hover:bg-red-500/10 hover:text-red-500 transition-all"
                        >
                            <ChevronLeft className="w-5 h-5" />
                        </button>

                        <div className="flex items-center gap-2">
                            <span className="text-sm font-black text-red-500">{currentPage}</span>
                            <span className="text-sm font-bold text-gray-600">/</span>
                            <span className="text-sm font-bold text-gray-400">{meta.last_page}</span>
                        </div>

                        <button
                            disabled={currentPage === meta.last_page || loading}
                            onClick={() => handlePageChange(currentPage + 1)}
                            className="p-3 rounded-xl bg-white/5 border border-white/5 text-white disabled:opacity-20 hover:bg-red-500/10 hover:text-red-500 transition-all"
                        >
                            <ChevronRight className="w-5 h-5" />
                        </button>
                    </div>
                </div>
            </div>

            {/* Modal de Détails */}
            {selectedIncident && (
                <IncidentDetailModal
                    incident={selectedIncident}
                    onClose={() => setSelectedIncident(null)}
                />
            )}
        </div>
    );
}