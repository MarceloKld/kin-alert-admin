"use client";

import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import MarkerClusterGroup from 'react-leaflet-cluster';
import L from 'leaflet';
import { IncidentService, IncidentPublic } from '@/services/incident.service';
import {
    AlertTriangle, MapPin, Calendar, User, Eye, X,
    Filter, Loader2, RefreshCcw, Maximize2
} from 'lucide-react';
import StatusBadge from '@/components/ui/StatusBadge';
import 'leaflet/dist/leaflet.css';
import '@/styles/leaflet-custom.css';

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
    const [incidents, setIncidents] = useState<IncidentPublic[]>([]);
    const [communes, setCommunes] = useState<Array<{ id: number; nom: string }>>([]);
    const [loading, setLoading] = useState(true);
    const [selectedIncident, setSelectedIncident] = useState<IncidentPublic | null>(null);
    const [fullImage, setFullImage] = useState<string | null>(null);
    const [filters, setFilters] = useState({
        statut: 'tous',
        communeId: 0, // ✅ Changé de commune (string) à communeId (number)
        search: ''
    });

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
            {/* 
        ═══════════════════════════════════════════════════════
        🎛️ PANEL FILTRES
        ═══════════════════════════════════════════════════════
      */}
            <div className="absolute top-4 left-4 z-[999] 
                    bg-black/70 backdrop-blur-xl border border-white/10 
                    rounded-2xl p-4 space-y-4 w-80 shadow-2xl max-h-[calc(100vh-2rem)] overflow-y-auto">

                <div className="flex items-center justify-between">
                    <h3 className="text-sm font-bold text-white uppercase flex items-center gap-2">
                        <Filter className="w-4 h-4 text-red-500" />
                        Filtres
                    </h3>
                    <button
                        onClick={() => setFilters({ statut: 'tous', communeId: 0, search: '' })}
                        className="p-1.5 hover:bg-white/10 rounded-lg transition-all"
                        title="Réinitialiser"
                    >
                        <RefreshCcw className="w-4 h-4 text-gray-400 hover:text-white" />
                    </button>
                </div>

                {/* Recherche */}
                <div>
                    <label className="text-xs text-gray-400 font-semibold uppercase block mb-2">
                        Recherche
                    </label>
                    <input
                        type="text"
                        placeholder="Titre, avenue..."
                        value={filters.search}
                        onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                        className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 
                     text-sm text-white placeholder:text-gray-500
                     focus:border-red-500 focus:ring-1 focus:ring-red-500 
                     outline-none transition-all"
                    />
                </div>

                {/* ✅ FILTRE COMMUNE (par ID) */}
                <div>
                    <label className="text-xs text-gray-400 font-semibold uppercase block mb-2">
                        Commune
                    </label>
                    <select
                        value={filters.communeId}
                        onChange={(e) => setFilters(prev => ({ ...prev, communeId: Number(e.target.value) }))}
                        className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 
                     text-sm text-white 
                     focus:border-red-500 focus:ring-1 focus:ring-red-500 
                     outline-none transition-all cursor-pointer"
                    >
                        <option value={0} className="bg-gray-900">Toutes les communes</option>
                        {communes.map((commune) => (
                            <option key={commune.id} value={commune.id} className="bg-gray-900">
                                📍 {commune.nom}
                            </option>
                        ))}
                    </select>
                </div>

                {/* ✅ FILTRE STATUT */}
                <div>
                    <label className="text-xs text-gray-400 font-semibold uppercase block mb-2">
                        Statut
                    </label>
                    <select
                        value={filters.statut}
                        onChange={(e) => setFilters(prev => ({ ...prev, statut: e.target.value }))}
                        className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 
                     text-sm text-white 
                     focus:border-red-500 focus:ring-1 focus:ring-red-500 
                     outline-none transition-all cursor-pointer"
                    >
                        <option value="tous" className="bg-gray-900">Tous les statuts</option>
                        <option value="en_attente" className="bg-gray-900">⏳ En attente</option>
                        <option value="valide" className="bg-gray-900">✓ Validés</option>
                        <option value="rejete" className="bg-gray-900">✗ Rejetés</option>
                    </select>
                </div>

                {/* Stats */}
                <div className="pt-3 border-t border-white/10 space-y-2">
                    <div className="flex items-center justify-between text-xs">
                        <span className="text-gray-400">Affichés</span>
                        <span className="font-bold text-white text-lg tabular-nums">{incidents.length}</span>
                    </div>
                    {loading && (
                        <div className="flex items-center gap-2 text-blue-400 text-xs">
                            <Loader2 className="w-3 h-3 animate-spin" />
                            <span>Chargement...</span>
                        </div>
                    )}
                </div>
            </div>

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
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    {selectedIncident.preuves.map((preuve, i) => (
                                        <div
                                            key={preuve.id}
                                            className="group relative aspect-video rounded-xl overflow-hidden 
                 bg-white/5 border border-white/10 cursor-pointer"
                                            onClick={() => setFullImage(preuve.url)}
                                        >
                                            <img
                                                src={preuve.url}
                                                className="w-full h-full object-cover 
                   transition-transform duration-500 group-hover:scale-110"
                                                alt={`Preuve ${i + 1}`}
                                                loading="lazy"
                                                onError={(e) => {
                                                    console.error('Erreur image:', preuve.url);
                                                    e.currentTarget.style.display = 'none';
                                                }}
                                            />

                                            {/* Overlay hover */}
                                            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 
                      transition-opacity flex items-center justify-center">
                                                <div className="flex flex-col items-center gap-2">
                                                    <Maximize2 className="w-6 h-6 text-white" strokeWidth={2.5} />
                                                    <span className="text-xs text-white font-semibold">Agrandir</span>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
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