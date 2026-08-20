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
        <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950">
            {/* Container principal avec padding responsive */}
            <div className="relative p-4 sm:p-6 lg:p-8 space-y-6 lg:space-y-8 max-w-[1800px] mx-auto">

                {/* 
      ═══════════════════════════════════════════════════════════
      🔔 TOAST NOTIFICATION SYSTEM
      ═══════════════════════════════════════════════════════════
      Position fixe en haut à droite, z-index élevé
      Auto-dismiss après 5 secondes
    */}
                {toastConfig.show && (
                    <Toast
                        message={toastConfig.message}
                        type={toastConfig.type}
                        onClose={hideToast}
                    />
                )}




                {/* 
  ═══════════════════════════════════════════════════════════════
  📍 HEADER & FILTRES - Titre + Recherche + Filtres Statut
  ═══════════════════════════════════════════════════════════════
  Améliorations :
  - Glassmorphism moderne
  - Icône badge pour le titre
  - Bouton clear sur recherche
  - Dropdown filtres avec icône
  - Focus states optimisés
  - Micro-interactions hover
  ═══════════════════════════════════════════════════════════════
*/}

                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">

                    {/* 
  ═══════════════════════════════════════════════════════════════
  🎯 HEADER ANIMÉ - Version Fonctionnelle
  ═══════════════════════════════════════════════════════════════
*/}

                    <div className="space-y-3">
                        <div className="flex items-center gap-3">

                            {/* Badge icône avec animations */}
                            <div className="relative p-2 bg-red-600/20 rounded-xl border border-red-600/30 
                    backdrop-blur-sm animate-pulse-slow">
                                {/* Glow effect */}
                                <div className="absolute inset-0 bg-red-600/30 rounded-xl blur-md animate-pulse" />

                                <AlertTriangle
                                    className="relative w-5 h-5 text-red-500 animate-bounce-slow"
                                    strokeWidth={2.5}
                                />
                            </div>

                            {/* Titre avec effet typewriter */}
                            <h1 className="flex flex-wrap items-baseline gap-x-3 text-3xl md:text-4xl font-black text-white tracking-tight">
                                {/* KIN-ALERT */}
                                <span className="animate-typewriter-kin">
                                    KIN-ALERT
                                </span>

                                {/* MODÉRATION */}
                                <span className="animate-typewriter-mod text-red-600">
                                    MODÉRATION
                                </span>
                            </h1>
                        </div>

                        {/* Sous-titre avec fade-in */}
                        <p className="text-sm text-gray-400 font-medium pl-11 animate-fade-in-up">
                            Gestion du flux des incidents en temps réel
                        </p>
                    </div>



                    {/* Bloc droit : Recherche + Filtres */}
                    <div className="flex flex-wrap items-center gap-3">

                        {/* 
      ═══════════════════════════════════════════════════════════
      🔍 BARRE DE RECHERCHE
      ═══════════════════════════════════════════════════════════
    */}
                        <div className="relative group">
                            <Search
                                className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 
                   group-focus-within:text-red-500 group-focus-within:scale-110 
                   transition-all duration-300"
                                strokeWidth={2.5}
                            />
                            <input
                                type="text"
                                placeholder="Rechercher un incident..."
                                className="w-64 bg-white/5 backdrop-blur-md border border-white/10 
                   rounded-xl py-2.5 pl-11 pr-10 text-sm text-white 
                   placeholder:text-gray-500 
                   focus:bg-white/[0.08] focus:border-red-500/50 focus:ring-2 focus:ring-red-500/20
                   outline-none transition-all duration-300
                   hover:border-white/20"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />

                            {/* Bouton clear (visible si texte présent) */}
                            {searchTerm && (
                                <button
                                    onClick={() => setSearchTerm("")}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1 
                     text-gray-500 hover:text-red-500 hover:bg-red-500/10 
                     rounded-lg transition-all duration-200"
                                    aria-label="Effacer la recherche"
                                >
                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            )}
                        </div>

                        {/* 
      ═══════════════════════════════════════════════════════════
      🎚️ FILTRE STATUT
      ═══════════════════════════════════════════════════════════
    */}
                        <div className="relative group">
                            <Filter
                                className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 
                   group-focus-within:text-red-500 transition-colors duration-200"
                                strokeWidth={2.5}
                            />
                            <select
                                className="appearance-none w-48 bg-white/5 backdrop-blur-md border border-white/10 
                   rounded-xl py-2.5 pl-11 pr-10 text-sm text-white 
                   focus:bg-white/[0.08] focus:border-red-500/50 focus:ring-2 focus:ring-red-500/20
                   outline-none transition-all duration-300
                   hover:border-white/20
                   cursor-pointer"
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value)}
                            >
                                <option value="tous" className="bg-gray-900">Tous les statuts</option>
                                <option value="en_attente" className="bg-gray-900">En attente</option>
                                <option value="valide" className="bg-gray-900">Validés</option>
                                <option value="rejete" className="bg-gray-900">Rejetés</option>
                            </select>

                            {/* Icône chevron custom */}
                            <ChevronRight
                                className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 
                   rotate-90 pointer-events-none"
                                strokeWidth={2.5}
                            />
                        </div>

                    </div>
                </div>




                {/* 
  ═══════════════════════════════════════════════════════════════
  📊 LISTE INCIDENTS - Responsive Table/Cards
  ═══════════════════════════════════════════════════════════════
  - Desktop (≥ 1024px) : Tableau complet
  - Mobile/Tablet (< 1024px) : Cards empilées
  ═══════════════════════════════════════════════════════════════
*/}

                <div className="space-y-4">

                    {/* 
  ═══════════════════════════════════════════════════════════
  💻 VERSION DESKTOP - TABLEAU OPTIMISÉ (Sans scroll)
  ═══════════════════════════════════════════════════════════
  Colonnes compressées pour tout afficher sur une seule ligne
*/}
                    <div className="hidden lg:block bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden shadow-xl">
                        <table className="w-full text-left table-fixed">

                            {/* THEAD avec largeurs fixes */}
                            <thead>
                                <tr className="border-b border-white/10 bg-white/5">
                                    <th className="w-[30%] px-4 py-4 text-xs font-bold uppercase tracking-wider text-gray-400">
                                        Incident
                                    </th>
                                    <th className="w-[18%] px-3 py-4 text-xs font-bold uppercase tracking-wider text-gray-400">
                                        Localisation
                                    </th>
                                    <th className="w-[12%] px-3 py-4 text-xs font-bold uppercase tracking-wider text-gray-400 text-center">
                                        Confirm.
                                    </th>
                                    <th className="w-[15%] px-3 py-4 text-xs font-bold uppercase tracking-wider text-gray-400">
                                        Statut
                                    </th>
                                    <th className="w-[25%] px-4 py-4 text-xs font-bold uppercase tracking-wider text-gray-400 text-right">
                                        Actions
                                    </th>
                                </tr>
                            </thead>

                            {/* TBODY */}
                            <tbody className="divide-y divide-white/5">
                                {loading ? (
                                    /* SKELETON LOADERS */
                                    [...Array(5)].map((_, i) => (
                                        <tr key={i} className="animate-pulse">
                                            <td className="px-4 py-4">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-10 h-10 bg-white/10 rounded-xl flex-shrink-0" />
                                                    <div className="flex-1 min-w-0 space-y-2">
                                                        <div className="h-3 bg-white/10 rounded w-3/4" />
                                                        <div className="h-2 bg-white/5 rounded w-1/2" />
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-3 py-4">
                                                <div className="h-3 bg-white/10 rounded w-20" />
                                            </td>
                                            <td className="px-3 py-4">
                                                <div className="h-6 bg-white/10 rounded-full w-10 mx-auto" />
                                            </td>
                                            <td className="px-3 py-4">
                                                <div className="h-6 bg-white/10 rounded-lg w-16" />
                                            </td>
                                            <td className="px-4 py-4">
                                                <div className="flex justify-end gap-1">
                                                    <div className="w-7 h-7 bg-white/10 rounded-lg" />
                                                    <div className="w-7 h-7 bg-white/10 rounded-lg" />
                                                    <div className="w-7 h-7 bg-white/10 rounded-lg" />
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                ) : incidents.length === 0 ? (
                                    /* EMPTY STATE */
                                    <tr>
                                        <td colSpan={5} className="px-6 py-12 text-center">
                                            <div className="flex flex-col items-center gap-4">
                                                <div className="p-4 bg-gray-800/50 rounded-2xl">
                                                    <AlertTriangle className="w-12 h-12 text-gray-600" strokeWidth={1.5} />
                                                </div>
                                                <div>
                                                    <h3 className="text-lg font-bold text-white mb-1">
                                                        Aucun incident trouvé
                                                    </h3>
                                                    <p className="text-sm text-gray-400">
                                                        {searchTerm || statusFilter !== 'tous'
                                                            ? 'Essayez de modifier vos filtres'
                                                            : 'Aucun incident enregistré pour le moment'
                                                        }
                                                    </p>
                                                </div>
                                            </div>
                                        </td>
                                    </tr>
                                ) : (
                                    /* LIGNES INCIDENTS */
                                    incidents.map((incident) => (
                                        <tr
                                            key={incident.id}
                                            className="group hover:bg-white/[0.03] transition-all duration-200"
                                        >

                                            {/* Colonne Incident (30%) - Compacte */}
                                            <td className="px-4 py-3">
                                                <div className="flex items-center gap-2">
                                                    {/* Thumbnail réduit */}
                                                    <div className="relative w-10 h-10 rounded-lg bg-white/5 border border-white/10 overflow-hidden flex-shrink-0">
                                                        {incident.preuves && incident.preuves.length > 0 ? (
                                                            <img
                                                                src={getThumbnailUrl(incident.preuves[0].fichier)}
                                                                className="w-full h-full object-cover"
                                                                alt=""
                                                                loading="lazy"
                                                            />
                                                        ) : (
                                                            <div className="w-full h-full flex items-center justify-center">
                                                                <span className="text-[8px] text-gray-600 font-bold uppercase text-center">
                                                                    N/A
                                                                </span>
                                                            </div>
                                                        )}
                                                    </div>

                                                    {/* Info incident - Tronquée */}
                                                    <div className="flex flex-col min-w-0 flex-1">
                                                        <span className="text-sm font-bold text-white group-hover:text-red-500 transition-colors duration-200 uppercase truncate">
                                                            {incident.titre}
                                                        </span>
                                                        <span className="text-[10px] text-gray-500 font-medium truncate">
                                                            {incident.type_incident.titre}
                                                        </span>
                                                    </div>
                                                </div>
                                            </td>

                                            {/* Colonne Localisation (18%) - Compacte */}
                                            <td className="px-3 py-3">
                                                <button
                                                    onClick={() => setSelectedIncident(incident)}
                                                    className="group/loc text-left w-full"
                                                >
                                                    <span className="text-xs text-gray-300 flex items-center gap-1 group-hover/loc:text-red-400 transition-colors duration-200 truncate">
                                                        <MapPin className="w-3 h-3 flex-shrink-0" strokeWidth={2.5} />
                                                        <span className="font-medium truncate">{incident.commune.nom}</span>
                                                    </span>
                                                </button>
                                            </td>

                                            {/* Colonne Confirmations (12%) - Centrée */}
                                            <td className="px-3 py-3">
                                                <div className="flex justify-center">
                                                    <span className="inline-flex items-center justify-center px-2 py-1 
                               rounded-full bg-red-500/10 border border-red-500/20 
                               text-xs font-black text-red-500 tabular-nums min-w-[2rem]">
                                                        {incident.nombre_confirmations}
                                                    </span>
                                                </div>
                                            </td>

                                            {/* Colonne Statut (15%) - Compacte */}
                                            <td className="px-3 py-3">
                                                <div className="flex justify-start">
                                                    <StatusBadge status={incident.statut} />
                                                </div>
                                            </td>

                                            {/* Colonne Actions (25%) - 4 boutons compacts */}
                                            <td className="px-4 py-3">
                                                <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">

                                                    {/* Bouton Détails */}
                                                    <button
                                                        onClick={() => setSelectedIncident(incident)}
                                                        className="p-1.5 text-gray-400 hover:text-white hover:bg-white/10 
                           rounded-lg transition-all duration-200"
                                                        title="Détails"
                                                    >
                                                        <Eye className="w-4 h-4" strokeWidth={2.5} />
                                                    </button>

                                                    {/* Actions conditionnelles */}
                                                    {incident.deleted_at ? (
                                                        <button
                                                            onClick={() => handleAction(incident.id, 'restore')}
                                                            className="p-1.5 text-blue-400 hover:text-blue-300 hover:bg-blue-500/10 
                             rounded-lg transition-all duration-200"
                                                            title="Restaurer"
                                                        >
                                                            <RefreshCcw className="w-4 h-4" strokeWidth={2.5} />
                                                        </button>
                                                    ) : (
                                                        <>
                                                            {/* Bouton Valider */}
                                                            <button
                                                                onClick={() => handleAction(incident.id, 'valide')}
                                                                className="p-1.5 text-green-500 hover:text-green-400 hover:bg-green-500/10 
                               rounded-lg transition-all duration-200"
                                                                title="Valider"
                                                            >
                                                                <CheckCircle className="w-4 h-4" strokeWidth={2.5} />
                                                            </button>

                                                            {/* Bouton Rejeter */}
                                                            <button
                                                                onClick={() => handleAction(incident.id, 'rejete')}
                                                                className="p-1.5 text-orange-500 hover:text-orange-400 hover:bg-orange-500/10 
                               rounded-lg transition-all duration-200"
                                                                title="Rejeter"
                                                            >
                                                                <XCircle className="w-4 h-4" strokeWidth={2.5} />
                                                            </button>

                                                            {/* Bouton Supprimer */}
                                                            <button
                                                                onClick={() => handleAction(incident.id, 'delete')}
                                                                className="p-1.5 text-red-500 hover:text-red-400 hover:bg-red-500/10 
                               rounded-lg transition-all duration-200"
                                                                title="Supprimer"
                                                            >
                                                                <Trash2 className="w-4 h-4" strokeWidth={2.5} />
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

                        {/* Pagination Desktop (inchangée) */}
                        <div className="flex items-center justify-between px-6 py-4 bg-white/5 border-t border-white/10">
                            <span className="text-xs text-gray-400 font-semibold">
                                Total : <span className="text-white font-bold">{meta.total}</span> incidents
                            </span>

                            <div className="flex items-center gap-3">
                                <button
                                    disabled={currentPage === 1 || loading}
                                    onClick={() => handlePageChange(currentPage - 1)}
                                    className="p-2.5 rounded-lg bg-white/5 border border-white/10 
                   text-white hover:bg-red-500/10 hover:text-red-500 hover:border-red-500/30
                   disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-white/5
                   transition-all duration-200 active:scale-95"
                                >
                                    <ChevronLeft className="w-5 h-5" strokeWidth={2.5} />
                                </button>

                                <div className="flex items-center gap-2 px-4">
                                    <span className="text-sm font-black text-red-500 tabular-nums">
                                        {currentPage}
                                    </span>
                                    <span className="text-sm font-medium text-gray-600">/</span>
                                    <span className="text-sm font-bold text-gray-400 tabular-nums">
                                        {meta.last_page}
                                    </span>
                                </div>

                                <button
                                    disabled={currentPage === meta.last_page || loading}
                                    onClick={() => handlePageChange(currentPage + 1)}
                                    className="p-2.5 rounded-lg bg-white/5 border border-white/10 
                   text-white hover:bg-red-500/10 hover:text-red-500 hover:border-red-500/30
                   disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-white/5
                   transition-all duration-200 active:scale-95"
                                >
                                    <ChevronRight className="w-5 h-5" strokeWidth={2.5} />
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* 
    ═══════════════════════════════════════════════════════════
    📱 VERSION MOBILE - CARDS
    ═══════════════════════════════════════════════════════════
  */}
                    <div className="lg:hidden space-y-4">
                        {loading ? (
                            /* SKELETON LOADERS MOBILE */
                            [...Array(3)].map((_, i) => (
                                <div key={i} className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-5 space-y-4 animate-pulse">
                                    <div className="flex items-center gap-3">
                                        <div className="w-16 h-16 bg-white/10 rounded-xl" />
                                        <div className="flex-1 space-y-2">
                                            <div className="h-4 bg-white/10 rounded w-3/4" />
                                            <div className="h-3 bg-white/5 rounded w-1/2" />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <div className="h-3 bg-white/10 rounded w-full" />
                                        <div className="h-3 bg-white/10 rounded w-2/3" />
                                    </div>
                                </div>
                            ))
                        ) : incidents.length === 0 ? (
                            /* EMPTY STATE MOBILE */
                            <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-12 text-center">
                                <div className="flex flex-col items-center gap-4">
                                    <div className="p-4 bg-gray-800/50 rounded-2xl">
                                        <AlertTriangle className="w-12 h-12 text-gray-600" strokeWidth={1.5} />
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-bold text-white mb-1">
                                            Aucun incident trouvé
                                        </h3>
                                        <p className="text-sm text-gray-400">
                                            {searchTerm || statusFilter !== 'tous'
                                                ? 'Modifiez vos filtres'
                                                : 'Aucun incident enregistré'
                                            }
                                        </p>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            /* CARDS INCIDENTS */
                            incidents.map((incident) => (
                                <div
                                    key={incident.id}
                                    className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-5 space-y-4 hover:bg-white/[0.07] transition-all duration-200 shadow-lg"
                                >

                                    {/* Header Card : Image + Titre + Badge Statut */}
                                    <div className="flex items-start justify-between gap-3">
                                        <div className="flex items-center gap-3 flex-1 min-w-0">
                                            {/* Thumbnail */}
                                            <div className="relative w-16 h-16 rounded-xl bg-white/5 border border-white/10 overflow-hidden flex-shrink-0">
                                                {incident.preuves && incident.preuves.length > 0 ? (
                                                    <img
                                                        src={getThumbnailUrl(incident.preuves[0].fichier)}
                                                        className="w-full h-full object-cover"
                                                        alt="Thumbnail"
                                                        loading="lazy"
                                                    />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center">
                                                        <span className="text-[9px] text-gray-600 font-semibold uppercase text-center px-1">
                                                            Sans image
                                                        </span>
                                                    </div>
                                                )}
                                            </div>

                                            {/* Titre + Type */}
                                            <div className="flex flex-col min-w-0 flex-1">
                                                <span className="text-sm font-bold text-white uppercase truncate">
                                                    {incident.titre}
                                                </span>
                                                <span className="text-xs text-gray-500 font-medium truncate">
                                                    {incident.type_incident.titre}
                                                </span>
                                            </div>
                                        </div>

                                        {/* Badge Statut */}
                                        <StatusBadge status={incident.statut} />
                                    </div>

                                    {/* Infos : Localisation + Confirmations */}
                                    <div className="space-y-2 border-t border-white/10 pt-4">
                                        {/* Localisation */}
                                        <button
                                            onClick={() => setSelectedIncident(incident)}
                                            className="w-full flex items-center gap-2 text-left group/loc"
                                        >
                                            <MapPin className="w-4 h-4 text-gray-500 flex-shrink-0 group-hover/loc:text-red-400 transition-colors" strokeWidth={2.5} />
                                            <span className="text-xs text-gray-300 font-medium group-hover/loc:text-red-400 transition-colors">
                                                {incident.commune.nom}
                                            </span>
                                        </button>

                                        {/* Confirmations */}
                                        <div className="flex items-center gap-2">
                                            <CheckCircle className="w-4 h-4 text-gray-500 flex-shrink-0" strokeWidth={2.5} />
                                            <span className="text-xs text-gray-400 font-medium">
                                                <span className="font-black text-red-500">{incident.nombre_confirmations}</span> confirmations
                                            </span>
                                        </div>
                                    </div>

                                    {/* Actions */}
                                    <div className="flex items-center gap-2 pt-2">
                                        {/* Bouton Détails */}
                                        <button
                                            onClick={() => setSelectedIncident(incident)}
                                            className="flex-1 flex items-center justify-center gap-2 py-3 px-4 
                       bg-white/10 hover:bg-white/20 border border-white/10 
                       rounded-xl text-white text-xs font-bold uppercase tracking-wide
                       transition-all duration-200"
                                        >
                                            <Eye className="w-4 h-4" strokeWidth={2.5} />
                                            Détails
                                        </button>

                                        {/* Actions conditionnelles */}
                                        {incident.deleted_at ? (
                                            <button
                                                onClick={() => handleAction(incident.id, 'restore')}
                                                className="p-3 bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/20 
                         rounded-xl text-blue-400 transition-all duration-200"
                                                title="Restaurer"
                                            >
                                                <RefreshCcw className="w-5 h-5" strokeWidth={2.5} />
                                            </button>
                                        ) : (
                                            <>
                                                <button
                                                    onClick={() => handleAction(incident.id, 'valide')}
                                                    className="p-3 bg-green-500/10 hover:bg-green-500/20 border border-green-500/20 
                           rounded-xl text-green-500 transition-all duration-200"
                                                    title="Valider"
                                                >
                                                    <CheckCircle className="w-5 h-5" strokeWidth={2.5} />
                                                </button>
                                                <button
                                                    onClick={() => handleAction(incident.id, 'rejete')}
                                                    className="p-3 bg-orange-500/10 hover:bg-orange-500/20 border border-orange-500/20 
                           rounded-xl text-orange-500 transition-all duration-200"
                                                    title="Rejeter"
                                                >
                                                    <XCircle className="w-5 h-5" strokeWidth={2.5} />
                                                </button>
                                                <button
                                                    onClick={() => handleAction(incident.id, 'delete')}
                                                    className="p-3 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 
                           rounded-xl text-red-500 transition-all duration-200"
                                                    title="Supprimer"
                                                >
                                                    <Trash2 className="w-5 h-5" strokeWidth={2.5} />
                                                </button>
                                            </>
                                        )}
                                    </div>

                                </div>
                            ))
                        )}

                        {/* Pagination Mobile */}
                        <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-4">
                            <div className="flex flex-col gap-4">
                                {/* Info résultats */}
                                <div className="text-center">
                                    <span className="text-xs text-gray-400 font-semibold">
                                        Total : <span className="text-white font-bold">{meta.total}</span> incidents
                                    </span>
                                </div>

                                {/* Contrôles */}
                                <div className="flex items-center justify-center gap-3">
                                    <button
                                        disabled={currentPage === 1 || loading}
                                        onClick={() => handlePageChange(currentPage - 1)}
                                        className="p-3 rounded-xl bg-white/5 border border-white/10 
                       text-white hover:bg-red-500/10 hover:text-red-500 hover:border-red-500/30
                       disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-white/5
                       transition-all duration-200 active:scale-95"
                                    >
                                        <ChevronLeft className="w-5 h-5" strokeWidth={2.5} />
                                    </button>

                                    <div className="flex items-center gap-2 px-6">
                                        <span className="text-lg font-black text-red-500 tabular-nums">
                                            {currentPage}
                                        </span>
                                        <span className="text-sm font-medium text-gray-600">/</span>
                                        <span className="text-lg font-bold text-gray-400 tabular-nums">
                                            {meta.last_page}
                                        </span>
                                    </div>

                                    <button
                                        disabled={currentPage === meta.last_page || loading}
                                        onClick={() => handlePageChange(currentPage + 1)}
                                        className="p-3 rounded-xl bg-white/5 border border-white/10 
                       text-white hover:bg-red-500/10 hover:text-red-500 hover:border-red-500/30
                       disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-white/5
                       transition-all duration-200 active:scale-95"
                                    >
                                        <ChevronRight className="w-5 h-5" strokeWidth={2.5} />
                                    </button>
                                </div>

                                {/* Barre de progression */}
                                <div className="space-y-2">
                                    <div className="flex items-center justify-between text-xs text-gray-400">
                                        <span>Progression</span>
                                        <span className="font-semibold text-white">
                                            {Math.round((currentPage / meta.last_page) * 100)}%
                                        </span>
                                    </div>
                                    <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-gradient-to-r from-red-600 to-red-500 rounded-full transition-all duration-500"
                                            style={{ width: `${(currentPage / meta.last_page) * 100}%` }}
                                        />
                                    </div>
                                </div>
                            </div>
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
        </div>
    );
}