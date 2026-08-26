"use client";

import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import MarkerClusterGroup from 'react-leaflet-cluster';
import L from 'leaflet';
import { IncidentService, IncidentPublic, STORAGE_URL } from '@/services/incident.service';
import {
    AlertTriangle, MapPin, Calendar, User, Eye, X,
    Filter, Loader2, RefreshCcw, Maximize2
} from 'lucide-react';
import StatusBadge from '@/components/ui/StatusBadge';
import 'leaflet/dist/leaflet.css';
import '@/styles/leaflet-custom.css';

import {
    Search,
    ChevronDown,
    Clock,
    CheckCircle2,
    XCircle,
    LayoutGrid,
    AlertCircle,
} from 'lucide-react';

/* Fix icônes Leaflet */
const fixLeafletIcons = () => {
    type IconDefaultPrototype = L.Icon.Default & { _getIconUrl?: () => void };
    delete (L.Icon.Default.prototype as IconDefaultPrototype)._getIconUrl;

    L.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
        iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
    });
};

fixLeafletIcons();

const KINSHASA_CENTER: [number, number] = [-4.3276, 15.3136];

export default function MapView() {
    //  Placez le hook ICI, à l'intérieur de la fonction
    const [showMobileFilters, setShowMobileFilters] = useState(false);

    const [incidents, setIncidents] = useState<IncidentPublic[]>([]);
    const [communes, setCommunes] = useState<Array<{ id: number; nom: string }>>([]);
    const [loading, setLoading] = useState(true);
    const [selectedIncident, setSelectedIncident] = useState<IncidentPublic | null>(null);
    const [fullImage, setFullImage] = useState<string | null>(null);
    const [filters, setFilters] = useState({
        statut: 'tous',
        communeId: 0,
        search: ''
    });
   
    /* 
      ═══════════════════════════════════════════════════════════
      🖼️ FONCTION GÉNÉRATION URL (Corrigée)
      ═══════════════════════════════════════════════════════════
    */
    // Fonction pour générer l'URL correcte des images
    const getImageUrl = (path?: string): string => {
        if (!path) return '';

        // 1. Si l'URL contient Cloudinary (même imbriquée dans le domaine Render), on extrait la vraie URL Cloudinary
        if (path.includes('https://res.cloudinary.com')) {
            const cloudinaryIndex = path.indexOf('https://res.cloudinary.com');
            return path.substring(cloudinaryIndex);
        }

        // 2. Si c'est déjà une URL HTTP/HTTPS valide
        if (path.startsWith('http://') || path.startsWith('https://')) {
            return path;
        }

        // 3. Sinon, ajouter l'URL du stockage de base (Render/Local)
        let baseUrl = process.env.NEXT_PUBLIC_STORAGE_URL || '';
        if (baseUrl.endsWith('/')) baseUrl = baseUrl.slice(0, -1);
        const cleanPath = path.startsWith('/') ? path.substring(1) : path;

        return `${baseUrl}/${cleanPath}`;
    };

    /* 
      ═══════════════════════════════════════════════════════════
      📡 CHARGEMENT INCIDENTS
      ═══════════════════════════════════════════════════════════
    */
    useEffect(() => {
        const loadData = async () => {
            setLoading(true);
            try {
                const allIncidents = await IncidentService.getAllForMap(
                    filters.statut === 'tous' ? undefined : filters.statut,
                    filters.search || undefined,
                    filters.communeId === 0 ? undefined : filters.communeId // ✅ Envoie l'ID numérique
                );

                const validIncidents = allIncidents.filter((incident: IncidentPublic) => {
                    const lat = incident.localisation.latitude;
                    const lng = incident.localisation.longitude;
                    return !isNaN(lat) && !isNaN(lng) && lat !== 0 && lng !== 0;
                });

                setIncidents(validIncidents);

                // Extraire communes uniques
                const uniqueCommunes = Array.from(
                    new Map(
                        validIncidents.map(i => [i.localisation.commune.id, i.localisation.commune])
                    ).values()
                ).sort((a, b) => a.nom.localeCompare(b.nom));

                setCommunes(uniqueCommunes);

                console.log(`✅ ${validIncidents.length} incidents géolocalisés`);
                console.log(`📍 ${uniqueCommunes.length} communes trouvées`);

            } catch (error) {
                console.error('❌ Erreur chargement:', error);
                setIncidents([]);
            } finally {
                setLoading(false);
            }
        };

        loadData();
    }, [filters.statut, filters.communeId, filters.search]); // ✅ Dépendance sur communeId

    /* Création icônes */
    const createCustomIcon = (statut: string) => {
        const config: Record<string, { color: string; emoji: string }> = {
            'en_attente': { color: '#f97316', emoji: '⏳' },
            'valide': { color: '#22c55e', emoji: '✓' },
            'rejete': { color: '#ef4444', emoji: '✗' }
        };

        const { color, emoji } = config[statut] || config['en_attente'];

        return L.divIcon({
            html: `
        <div style="
          background: ${color};
          width: 36px;
          height: 36px;
          border-radius: 50% 50% 50% 0;
          transform: rotate(-45deg);
          border: 3px solid white;
          box-shadow: 0 4px 16px rgba(0,0,0,0.4);
          display: flex;
          align-items: center;
          justify-content: center;
        ">
          <div style="
            transform: rotate(45deg);
            font-size: 18px;
            color: white;
            font-weight: bold;
          ">${emoji}</div>
        </div>
      `,
            className: 'custom-marker',
            iconSize: [36, 36],
            iconAnchor: [18, 36],
            popupAnchor: [0, -36]
        });
    };

    // ==========================================
    // 🔢 Nombre de filtres actifs (UI uniquement)
    // ==========================================
    const activeFiltersCount =
        (filters.statut !== 'tous' ? 1 : 0) +
        (filters.communeId !== 0 ? 1 : 0) +
        (filters.search.trim() !== '' ? 1 : 0);



    return (
        <div className="relative h-full w-full">

            {/* LIGHTBOX */}
            {fullImage && (
                <div
                    className="fixed inset-0 z-[10000] bg-black/95 backdrop-blur-2xl 
                     flex items-center justify-center p-4 cursor-zoom-out"
                    onClick={() => setFullImage(null)}
                >
                    <button className="absolute top-4 right-4 p-3 bg-white/10 hover:bg-red-600 
                           rounded-full text-white transition-all">
                        <X className="w-8 h-8" />
                    </button>
                    <img
                        src={fullImage}
                        className="max-w-full max-h-full object-contain rounded-2xl shadow-2xl"
                        alt="Agrandissement"
                        onClick={(e) => e.stopPropagation()}
                    />
                </div>
            )}
            {/* ═══════════════════════════════════════════════════════
    🎛️ PANEL FILTRES (RESPONSIVE)
    ═══════════════════════════════════════════════════════ */}

            {/* ──────────────────────────────────────────────────────
    🔢 Compteur de filtres actifs (dérivé — UI uniquement)
    À placer avec les autres constantes du composant
    ────────────────────────────────────────────────────── */}
            {/*
const activeFiltersCount =
    (filters.statut !== 'tous' ? 1 : 0) +
    (filters.communeId !== 0 ? 1 : 0) +
    (filters.search.trim() !== '' ? 1 : 0);
*/}

            {/* ══════════════════════════════════════════════════════
    📱 BOUTON TOGGLE MOBILE
    left-14 pour dégager les contrôles de zoom Leaflet
    ══════════════════════════════════════════════════════ */}
            <button
                onClick={() => setShowMobileFilters(!showMobileFilters)}
                aria-expanded={showMobileFilters}
                aria-controls="filters-panel"
                aria-label={showMobileFilters ? "Masquer les filtres" : "Afficher les filtres"}
                className="
        sm:hidden absolute top-4 left-14 z-20
        flex items-center gap-2
        bg-slate-950/85 backdrop-blur-xl
        border border-white/10
        text-white
        px-3 py-2.5 rounded-xl
        text-xs font-bold uppercase tracking-wide
        shadow-xl
        hover:border-white/20 hover:bg-slate-950/95
        active:scale-95
        transition-all duration-200
    "
            >
                <Filter className="w-4 h-4 text-[#FF2424] shrink-0" />
                <span>{showMobileFilters ? "Masquer" : "Filtres"}</span>

                {/* Badge du nombre de filtres actifs */}
                {activeFiltersCount > 0 && (
                    <span className="
            flex items-center justify-center
            min-w-[18px] h-[18px] px-1
            bg-[#FF2424] text-white
            rounded-full
            text-[10px] font-bold tabular-nums
            shadow-lg shadow-[#FF2424]/40
        ">
                        {activeFiltersCount}
                    </span>
                )}
            </button>

            {/* ══════════════════════════════════════════════════════
    🎛️ CONTENEUR DES FILTRES
    sm:left-16 décale le panneau après le zoom Leaflet (desktop)
    ══════════════════════════════════════════════════════ */}
            <aside
                id="filters-panel"
                aria-label="Filtres de la carte"
                className={`
        absolute top-16 sm:top-4 left-4 right-4 sm:right-auto sm:left-16 z-20
        w-auto sm:w-80
        bg-slate-950/85 backdrop-blur-xl
        border border-white/10
        rounded-2xl
        shadow-2xl
        max-h-[calc(100vh-6rem)] sm:max-h-[calc(100vh-2rem)]
        overflow-y-auto overscroll-contain
        scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent
        transition-all duration-300 ease-out
        ${showMobileFilters
                        ? 'block opacity-100 translate-y-0'
                        : 'hidden sm:block sm:opacity-100'
                    }
    `}
            >
                {/* ══════════════════════════════════════════════════
        📌 EN-TÊTE — Titre + actions
        Sticky pour rester visible pendant le scroll
        ══════════════════════════════════════════════════ */}
                <header className="
        sticky top-0 z-10
        flex items-center justify-between gap-3
        px-4 py-3.5
        bg-slate-950/90 backdrop-blur-xl
        border-b border-white/10
    ">
                    <h3 className="flex items-center gap-2 text-sm font-bold text-white tracking-tight">
                        <span className="
                relative flex items-center justify-center
                w-7 h-7 rounded-lg
                bg-[#FF2424]/10 border border-[#FF2424]/25
            ">
                            <Filter className="w-3.5 h-3.5 text-[#FF2424]" />
                        </span>
                        <span>Filtres</span>

                        {/* Compteur inline (desktop) */}
                        {activeFiltersCount > 0 && (
                            <span className="
                    px-2 py-0.5 rounded-full
                    bg-[#FF2424]/15 text-[#FF2424]
                    ring-1 ring-[#FF2424]/30
                    text-[10px] font-bold tabular-nums
                ">
                                {activeFiltersCount}
                            </span>
                        )}
                    </h3>

                    <div className="flex items-center gap-1 shrink-0">
                        {/* Réinitialiser */}
                        <button
                            onClick={() => setFilters({ statut: 'tous', communeId: 0, search: '' })}
                            disabled={activeFiltersCount === 0}
                            title="Réinitialiser les filtres"
                            aria-label="Réinitialiser les filtres"
                            className="
                    group p-2 rounded-lg
                    text-slate-400
                    hover:bg-white/10 hover:text-white
                    disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-transparent disabled:hover:text-slate-400
                    active:scale-90
                    transition-all duration-200
                "
                        >
                            <RefreshCcw className="w-4 h-4 group-hover:-rotate-90 transition-transform duration-300" />
                        </button>

                        {/* Fermer (mobile uniquement) */}
                        <button
                            onClick={() => setShowMobileFilters(false)}
                            aria-label="Fermer le panneau de filtres"
                            className="
                    sm:hidden p-2 rounded-lg
                    text-slate-400
                    hover:bg-white/10 hover:text-white
                    active:scale-90
                    transition-all duration-200
                "
                        >
                            <X className="w-4 h-4" />
                        </button>
                    </div>
                </header>

                {/* ══════════════════════════════════════════════════
        📋 CORPS DU PANNEAU
        ══════════════════════════════════════════════════ */}
                <div className="p-4 space-y-5">

                    {/* ──────────────────────────────────────────────
            🔍 RECHERCHE
            ────────────────────────────────────────────── */}
                    <div className="space-y-2">
                        <label
                            htmlFor="filter-search"
                            className="block text-[11px] text-slate-400 font-semibold uppercase tracking-wide"
                        >
                            Recherche
                        </label>

                        <div className="relative">
                            {/* Icône loupe */}
                            <Search className="
                    absolute left-3 top-1/2 -translate-y-1/2
                    w-4 h-4 text-slate-500 pointer-events-none
                " />

                            <input
                                id="filter-search"
                                type="text"
                                placeholder="Titre, avenue..."
                                value={filters.search}
                                onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                                autoComplete="off"
                                className="
                        w-full h-10
                        bg-white/5 border border-white/15
                        rounded-xl
                        pl-9 pr-9
                        text-sm text-white placeholder:text-slate-500
                        hover:border-white/25
                        focus:border-[#FF2424] focus:ring-2 focus:ring-[#FF2424]/20
                        outline-none transition-all duration-200
                    "
                            />

                            {/* Bouton effacer la recherche */}
                            {filters.search && (
                                <button
                                    onClick={() => setFilters(prev => ({ ...prev, search: '' }))}
                                    aria-label="Effacer la recherche"
                                    className="
                            absolute right-2 top-1/2 -translate-y-1/2
                            p-1 rounded-md
                            text-slate-500 hover:text-white hover:bg-white/10
                            transition-all duration-200
                        "
                                >
                                    <X className="w-3.5 h-3.5" />
                                </button>
                            )}
                        </div>
                    </div>

                    {/* ──────────────────────────────────────────────
            🏙️ FILTRE COMMUNE (select natif — liste longue)
            ────────────────────────────────────────────── */}
                    <div className="space-y-2">
                        <label
                            htmlFor="filter-commune"
                            className="block text-[11px] text-slate-400 font-semibold uppercase tracking-wide"
                        >
                            Commune
                        </label>

                        <div className="relative">
                            {/* Icône localisation */}
                            <MapPin className="
                    absolute left-3 top-1/2 -translate-y-1/2
                    w-4 h-4 text-slate-500 pointer-events-none z-10
                " />

                            <select
                                id="filter-commune"
                                value={filters.communeId}
                                onChange={(e) => setFilters(prev => ({ ...prev, communeId: Number(e.target.value) }))}
                                className="
                        w-full h-10
                        bg-white/5 border border-white/15
                        rounded-xl
                        pl-9 pr-9
                        text-sm text-white
                        hover:border-white/25
                        focus:border-[#FF2424] focus:ring-2 focus:ring-[#FF2424]/20
                        outline-none transition-all duration-200
                        cursor-pointer
                        appearance-none
                    "
                            >
                                <option value={0} className="bg-slate-900">
                                    Toutes les communes
                                </option>
                                {communes.map((commune) => (
                                    <option key={commune.id} value={commune.id} className="bg-slate-900">
                                        {commune.nom}
                                    </option>
                                ))}
                            </select>

                            {/* Chevron custom (appearance-none) */}
                            <ChevronDown className="
                    absolute right-3 top-1/2 -translate-y-1/2
                    w-4 h-4 text-slate-500 pointer-events-none
                " />
                        </div>
                    </div>

                    {/* ──────────────────────────────────────────────
            🏷️ FILTRE STATUT (segmented control + icônes SVG)
            Remplace le select natif pour supprimer les emojis
            ────────────────────────────────────────────── */}
                    <div className="space-y-2">
                        <span className="block text-[11px] text-slate-400 font-semibold uppercase tracking-wide">
                            Statut
                        </span>

                        <div
                            role="radiogroup"
                            aria-label="Filtrer par statut"
                            className="grid grid-cols-2 gap-2"
                        >
                            {[
                                {
                                    value: 'tous',
                                    label: 'Tous',
                                    icon: LayoutGrid,
                                    active: 'bg-slate-500/15 text-slate-100 border-slate-400/40 ring-slate-400/20',
                                    dot: 'bg-slate-400',
                                },
                                {
                                    value: 'en_attente',
                                    label: 'En attente',
                                    icon: Clock,
                                    active: 'bg-amber-500/15 text-amber-300 border-amber-500/40 ring-amber-500/20',
                                    dot: 'bg-amber-400',
                                },
                                {
                                    value: 'valide',
                                    label: 'Validés',
                                    icon: CheckCircle2,
                                    active: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/40 ring-emerald-500/20',
                                    dot: 'bg-emerald-400',
                                },
                                {
                                    value: 'rejete',
                                    label: 'Rejetés',
                                    icon: XCircle,
                                    active: 'bg-[#FF2424]/15 text-[#FF6B6B] border-[#FF2424]/40 ring-[#FF2424]/20',
                                    dot: 'bg-[#FF2424]',
                                },
                            ].map((option) => {
                                const isSelected = filters.statut === option.value;

                                return (
                                    <button
                                        key={option.value}
                                        type="button"
                                        role="radio"
                                        aria-checked={isSelected}
                                        onClick={() => setFilters(prev => ({ ...prev, statut: option.value }))}
                                        className={`
                                group relative
                                flex items-center gap-2
                                h-10 px-3
                                rounded-xl border
                                text-xs font-semibold
                                transition-all duration-200
                                active:scale-[0.97]
                                ${isSelected
                                                ? `${option.active} ring-1`
                                                : 'bg-white/5 border-white/10 text-slate-400 hover:border-white/25 hover:text-slate-200'
                                            }
                            `}
                                    >
                                        <option.icon
                                            className={`
                                    w-3.5 h-3.5 shrink-0
                                    transition-transform duration-200
                                    ${isSelected ? 'scale-110' : 'group-hover:scale-105'}
                                `}
                                        />
                                        <span className="truncate">{option.label}</span>

                                        {/* Pastille indicatrice quand sélectionné */}
                                        {isSelected && (
                                            <span className={`
                                    absolute top-1.5 right-1.5
                                    w-1.5 h-1.5 rounded-full
                                    ${option.dot}
                                    animate-pulse
                                `} />
                                        )}
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* ──────────────────────────────────────────────
            📊 STATISTIQUES
            ────────────────────────────────────────────── */}
                    <div className="pt-4 border-t border-white/10 space-y-3">
                        {/* Compteur d'incidents affichés */}
                        <div className="
                flex items-center justify-between gap-3
                px-3 py-2.5 rounded-xl
                bg-white/5 border border-white/10
            ">
                            <div className="flex items-center gap-2 min-w-0">
                                <MapPin className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                                <span className="text-xs text-slate-400 font-medium truncate">
                                    Incidents affichés
                                </span>
                            </div>

                            <span className="
                    shrink-0
                    text-lg font-bold text-white tabular-nums
                ">
                                {incidents.length}
                            </span>
                        </div>

                        {/* Indicateur de chargement */}
                        {loading && (
                            <div className="
                    flex items-center gap-2
                    px-3 py-2 rounded-xl
                    bg-blue-500/10 border border-blue-500/25
                    animate-fade-in
                ">
                                <Loader2 className="w-3.5 h-3.5 text-blue-400 animate-spin shrink-0" />
                                <span className="text-xs text-blue-300 font-medium">
                                    Chargement des données...
                                </span>
                            </div>
                        )}

                        {/* Empty state — aucun résultat */}
                        {!loading && incidents.length === 0 && (
                            <div className="
                    flex items-start gap-2.5
                    px-3 py-2.5 rounded-xl
                    bg-amber-500/10 border border-amber-500/25
                ">
                                <AlertCircle className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                                <p className="text-xs text-amber-200/90 leading-relaxed">
                                    Aucun incident ne correspond aux filtres sélectionnés.
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </aside>

            {/* CARTE */}
            <MapContainer
                center={KINSHASA_CENTER}
                zoom={12}
                className="h-full w-full z-0"
                zoomControl={true}
                style={{ background: '#1a1a1a' }}
            >
                <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

                <MarkerClusterGroup chunkedLoading maxClusterRadius={50}>
                    {incidents.map((incident) => (
                        <Marker
                            key={incident.id}
                            position={[incident.localisation.latitude, incident.localisation.longitude]}
                            icon={createCustomIcon(incident.statut)}
                            eventHandlers={{ click: () => setSelectedIncident(incident) }}
                        >
                            <Popup>
                                <div className="p-3 min-w-[250px]">
                                    <h3 className="font-bold text-sm text-white mb-2">{incident.titre}</h3>
                                    {incident.type_incident && (
                                        <p className="text-xs text-gray-400 mb-2">{incident.type_incident.titre}</p>
                                    )}
                                    <p className="text-xs text-gray-500 mb-3">📍 {incident.localisation.commune.nom}</p>
                                    <div className="flex items-center justify-between">
                                        <StatusBadge status={incident.statut} />
                                        <span className="text-[10px] text-gray-500">
                                            {incident.nombre_confirmations} confirmations
                                        </span>
                                    </div>
                                </div>
                            </Popup>
                        </Marker>
                    ))}
                </MarkerClusterGroup>
            </MapContainer>
            {/* 
        ═══════════════════════════════════════════════════════
        📋 MODAL DÉTAILS (ADAPTÉ avec Next.js Image)
        ═══════════════════════════════════════════════════════
      */}
            {/* MODAL DÉTAILS */}
            {selectedIncident && (
                <div
                    className="fixed inset-0 z-[9999] bg-black/80 backdrop-blur-md 
                   flex items-center justify-center p-4"
                    onClick={() => setSelectedIncident(null)}
                >
                    <div
                        className="bg-white/10 backdrop-blur-xl border border-white/20 
                     rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Header */}
                        <div className="p-6 border-b border-white/10 flex justify-between items-start">
                            <div className="flex-1">
                                <h2 className="text-xl font-black text-white uppercase">
                                    {selectedIncident.titre}
                                </h2>
                                {selectedIncident.type_incident && (
                                    <p className="text-sm text-gray-400 mt-1">
                                        {selectedIncident.type_incident.titre}
                                    </p>
                                )}
                            </div>
                            <button
                                onClick={() => setSelectedIncident(null)}
                                className="p-2 hover:bg-white/10 rounded-lg transition-all ml-4"
                            >
                                <X className="w-5 h-5 text-gray-400" />
                            </button>
                        </div>

                        {/* Contenu */}
                        <div className="p-6 space-y-6">

                            {/* GALERIE PHOTOS */}
                            {selectedIncident.preuves && selectedIncident.preuves.length > 0 && (
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                                    {selectedIncident.preuves.map((preuve, i) => {
                                        // On récupère 'url' (API Publique) ou 'fichier' (API Admin)
                                        const imagePath = (preuve as any).url || (preuve as any).fichier || '';
                                        const imageUrl = getImageUrl(imagePath);

                                        return (
                                            <div
                                                key={preuve.id}
                                                className="group relative aspect-video rounded-xl overflow-hidden bg-white/5 border border-white/10 cursor-pointer"
                                                onClick={() => setFullImage(imageUrl)}
                                            >
                                                <img
                                                    src={imageUrl}
                                                    alt={`Preuve ${i + 1}`}
                                                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                                                    loading="lazy"
                                                    onError={(e) => {
                                                        console.error('❌ Erreur image:', imageUrl);
                                                        e.currentTarget.style.display = 'none';
                                                    }}
                                                />

                                                <div className="absolute inset-0 bg-black/60 
                                      opacity-0 group-hover:opacity-100 
                                      transition-opacity duration-300
                                      flex flex-col items-center justify-center gap-2">
                                                    <div className="p-3 bg-red-600 rounded-full 
                                        group-hover:scale-110 transition-transform duration-300
                                        shadow-lg">
                                                        <Maximize2 className="w-5 h-5 text-white" strokeWidth={2.5} />
                                                    </div>
                                                    <span className="text-xs text-white font-bold uppercase tracking-wider">
                                                        Agrandir
                                                    </span>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}

                            {/* Description */}
                            <div className="bg-white/5 border border-white/10 rounded-xl p-4">
                                <p className="text-gray-300 text-sm leading-relaxed">
                                    {selectedIncident.description}
                                </p>
                            </div>

                            {/* Infos */}
                            <div className="grid grid-cols-2 gap-4">
                                <div className="flex items-start gap-2">
                                    <MapPin className="w-4 h-4 text-gray-500 flex-shrink-0 mt-0.5" />
                                    <div>
                                        <p className="text-[10px] text-gray-500 uppercase font-bold">Localisation</p>
                                        <p className="text-sm text-white font-semibold">
                                            {selectedIncident.localisation.commune.nom}
                                        </p>
                                        <p className="text-xs text-gray-400">{selectedIncident.localisation.avenue}</p>
                                    </div>
                                </div>

                                <div className="flex items-start gap-2">
                                    <Calendar className="w-4 h-4 text-gray-500 flex-shrink-0 mt-0.5" />
                                    <div>
                                        <p className="text-[10px] text-gray-500 uppercase font-bold">Date</p>
                                        <p className="text-sm text-white font-semibold">
                                            {new Date(selectedIncident.date_creation).toLocaleDateString('fr-FR')}
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-start gap-2">
                                    <User className="w-4 h-4 text-gray-500 flex-shrink-0 mt-0.5" />
                                    <div>
                                        <p className="text-[10px] text-gray-500 uppercase font-bold">Auteur</p>
                                        <p className="text-sm text-white font-semibold">{selectedIncident.auteur.nom}</p>
                                    </div>
                                </div>

                                <div className="flex items-start gap-2">
                                    <Eye className="w-4 h-4 text-gray-500 flex-shrink-0 mt-0.5" />
                                    <div>
                                        <p className="text-[10px] text-gray-500 uppercase font-bold">Confirmations</p>
                                        <p className="text-sm text-white font-semibold">
                                            {selectedIncident.nombre_confirmations}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* GPS */}
                            <div className="bg-white/5 border border-white/10 rounded-xl p-4">
                                <p className="text-xs text-gray-500 uppercase font-bold mb-2">Coordonnées GPS</p>
                                <div className="flex gap-4 text-sm text-gray-300 font-mono">
                                    <span>Lat: {selectedIncident.localisation.latitude}</span>
                                    <span>Lng: {selectedIncident.localisation.longitude}</span>
                                </div>
                            </div>

                            <div className="pt-4 border-t border-white/10">
                                <StatusBadge status={selectedIncident.statut} />
                            </div>
                        </div>
                    </div>
                </div>
            )}

        </div>
    );
}