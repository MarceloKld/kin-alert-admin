"use client";

import React, { useEffect, useState } from 'react';
import {
    X, MapPin, Info, MessageSquare, User, Calendar,
    AlertCircle, ExternalLink, Loader2, Maximize2, Clock
} from 'lucide-react';
import { Incident, Commentaire } from '@/types';
import { IncidentService, STORAGE_URL } from '@/services/incident.service';
import StatusBadge from '@/components/ui/StatusBadge';

/* 
  ═══════════════════════════════════════════════════════════════
  🔍 INCIDENT DETAIL MODAL - Affichage complet incident
  ═══════════════════════════════════════════════════════════════
  Améliorations :
  - Glassmorphism moderne
  - Lightbox optimisé pour images
  - Layout responsive 2 colonnes (desktop) / stack (mobile)
  - Galerie photos avec hover effects
  - Skeleton loaders pour commentaires
  - Scrollbar custom
  - Animations fluides
  ═══════════════════════════════════════════════════════════════
*/

interface Props {
    incident: Incident;
    onClose: () => void;
}

const IncidentDetailModal = ({ incident, onClose }: Props) => {
    const [comments, setComments] = useState<Commentaire[]>([]);
    const [loadingComments, setLoadingComments] = useState(false);
    const [fullImage, setFullImage] = useState<string | null>(null);

    // Charger les commentaires
    useEffect(() => {
        const fetchComments = async () => {
            setLoadingComments(true);
            try {
                const res = await IncidentService.getComments(incident.id);
                setComments(Array.isArray(res) ? res : res.data || []);
            } catch (error) {
                console.error("Erreur chargement commentaires:", error);
            } finally {
                setLoadingComments(false);
            }
        };
        fetchComments();
    }, [incident.id]);

    // Fonction pour générer l'URL correcte des images
    const getImageUrl = (fichier: string): string => {
        if (fichier.startsWith('http')) return fichier;

        let baseUrl = process.env.NEXT_PUBLIC_STORAGE_URL || STORAGE_URL || '';
        if (!baseUrl.endsWith('/')) baseUrl += '/';

        const cleanFilePath = fichier.startsWith('/') ? fichier.substring(1) : fichier;
        return `${baseUrl}${cleanFilePath}`;
    };

    // Ouvrir dans Google Maps
    const openInGoogleMaps = () => {
        const url = `https://www.google.com/maps?q=${incident.latitude},${incident.longitude}`;
        window.open(url, '_blank');
    };

    // Fermeture avec Echap
    useEffect(() => {
        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                if (fullImage) setFullImage(null);
                else onClose();
            }
        };
        window.addEventListener('keydown', handleEscape);
        return () => window.removeEventListener('keydown', handleEscape);
    }, [fullImage, onClose]);

    return (
        <>
            {/* 
        ═══════════════════════════════════════════════════════════
        🖼️ LIGHTBOX - Image en plein écran
        ═══════════════════════════════════════════════════════════
      */}
            {fullImage && (
                <div
                    className="fixed inset-0 z-[9999] bg-black/95 backdrop-blur-2xl 
                     flex items-center justify-center p-4 
                     cursor-zoom-out animate-in fade-in zoom-in-95 duration-300"
                    onClick={() => setFullImage(null)}
                >
                    {/* Bouton fermeture */}
                    <button
                        className="absolute top-4 right-4 sm:top-8 sm:right-8 
                       p-2 sm:p-3 bg-white/10 hover:bg-red-600 
                       rounded-full text-white transition-all duration-200
                       active:scale-95"
                        aria-label="Fermer"
                    >
                        <X className="w-6 h-6 sm:w-8 sm:h-8" strokeWidth={2.5} />
                    </button>

                    {/* Image */}
                    <img
                        src={fullImage}
                        className="max-w-full max-h-full object-contain rounded-2xl 
                     shadow-2xl shadow-black/50"
                        alt="Agrandissement"
                        onClick={(e) => e.stopPropagation()}
                    />
                </div>
            )}

            {/* 
        ═══════════════════════════════════════════════════════════
        📦 MODAL PRINCIPAL
        ═══════════════════════════════════════════════════════════
      */}
            <div
                className="fixed inset-0 z-[9998] flex items-center justify-center p-4 
                   bg-black/80 backdrop-blur-md animate-in fade-in duration-200"
                onClick={onClose}
            >
                <div
                    className="relative bg-white/5 backdrop-blur-xl border border-white/10 
                     w-full max-w-7xl max-h-[95vh] 
                     rounded-2xl flex flex-col shadow-2xl
                     animate-in zoom-in-95 duration-300"
                    onClick={(e) => e.stopPropagation()}
                >

                    {/* 
            ═══════════════════════════════════════════════════════
            🎯 HEADER
            ═══════════════════════════════════════════════════════
          */}
                    <div className="p-4 sm:p-6 border-b border-white/10 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white/5">
                        <div className="flex items-start gap-3 sm:gap-4 flex-1 min-w-0">
                            {/* Badge icône */}
                            <div className="flex-shrink-0 p-2 sm:p-2.5 bg-red-600/20 rounded-xl border border-red-600/30">
                                <AlertCircle className="w-5 h-5 sm:w-6 sm:h-6 text-red-500" strokeWidth={2.5} />
                            </div>

                            {/* Titre + Type */}
                            <div className="flex-1 min-w-0">
                                <h2 className="text-lg sm:text-xl lg:text-2xl font-black text-white uppercase tracking-tight leading-tight truncate">
                                    {incident.titre}
                                </h2>
                                <p className="text-xs text-gray-400 font-semibold uppercase tracking-wider mt-1">
                                    {incident.type_incident.titre}
                                </p>
                            </div>
                        </div>

                        {/* Bouton fermeture */}
                        <button
                            onClick={onClose}
                            className="flex-shrink-0 p-2 sm:p-2.5 
                       text-gray-400 hover:text-white hover:bg-white/10 
                       rounded-lg transition-all duration-200
                       hover:rotate-90"
                            aria-label="Fermer"
                        >
                            <X className="w-5 h-5 sm:w-6 sm:h-6" strokeWidth={2.5} />
                        </button>
                    </div>

                    {/* 
            ═══════════════════════════════════════════════════════
            📄 CONTENU PRINCIPAL (scroll)
            ═══════════════════════════════════════════════════════
          */}
                    <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8">

                            {/* 
                ═══════════════════════════════════════════════════
                📸 COLONNE GAUCHE - Galerie + Description
                ═══════════════════════════════════════════════════
              */}
                            <div className="lg:col-span-8 space-y-6">

                                {/* Galerie Photos */}
                                {incident.preuves && incident.preuves.length > 0 && (
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                                        {incident.preuves.map((p, i) => {
                                            const imageUrl = getImageUrl(p.fichier);

                                            return (
                                                <div
                                                    key={i}
                                                    className="group relative aspect-video rounded-xl overflow-hidden 
                                   bg-white/5 border border-white/10 cursor-pointer"
                                                    onClick={() => setFullImage(imageUrl)}
                                                >
                                                    {/* Image */}
                                                    <img
                                                        src={imageUrl}
                                                        className="w-full h-full object-cover 
                                     transition-transform duration-500 
                                     group-hover:scale-110"
                                                        alt={`Preuve ${i + 1}`}
                                                        loading="lazy"
                                                        onError={(e) => {
                                                            console.error("Image non trouvée:", imageUrl);
                                                            e.currentTarget.src = '/placeholder-image.png';
                                                        }}
                                                    />

                                                    {/* Overlay hover */}
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
                                <div className="relative bg-white/5 backdrop-blur-sm border border-white/10 
                              p-5 sm:p-6 rounded-xl overflow-hidden">
                                    {/* Barre rouge accent */}
                                    <div className="absolute top-0 left-0 w-1 h-full bg-red-600" />

                                    <h3 className="text-red-500 text-xs font-bold uppercase tracking-wider 
                               mb-3 flex items-center gap-2 pl-4">
                                        <Info className="w-4 h-4" strokeWidth={2.5} />
                                        Rapport de situation
                                    </h3>

                                    <p className="text-gray-300 text-sm sm:text-base leading-relaxed pl-4">
                                        &quot;{incident.description}&quot;
                                    </p>
                                </div>

                                {/* Bouton Google Maps */}
                                <button
                                    onClick={openInGoogleMaps}
                                    className="w-full group py-4 
                           bg-red-600 hover:bg-red-700 
                           text-white font-bold text-sm uppercase tracking-wide
                           rounded-xl transition-all duration-200
                           shadow-lg shadow-red-900/30 hover:shadow-red-900/50
                           active:scale-[0.98]
                           flex items-center justify-center gap-2.5"
                                >
                                    <MapPin className="w-5 h-5 group-hover:scale-110 transition-transform duration-300" strokeWidth={2.5} />
                                    Voir sur Google Maps
                                    <ExternalLink className="w-4 h-4 opacity-70" strokeWidth={2.5} />
                                </button>
                            </div>

                            {/* 
                ═══════════════════════════════════════════════════
                📊 COLONNE DROITE - Métadonnées + Commentaires
                ═══════════════════════════════════════════════════
              */}
                            <div className="lg:col-span-4 space-y-6">

                                {/* Card Infos Métadonnées */}
                                <div className="bg-white/5 backdrop-blur-sm border border-white/10 
                              rounded-xl p-5 space-y-5">

                                    {/* Statut + Confirmations */}
                                    <div className="flex items-center justify-between pb-4 border-b border-white/10">
                                        <StatusBadge status={incident.statut} />
                                        <div className="flex items-center gap-1.5 px-3 py-1.5 
                                  bg-red-500/10 border border-red-500/20 rounded-lg">
                                            <span className="text-xs font-black text-red-500 tabular-nums">
                                                {incident.nombre_confirmations}
                                            </span>
                                            <span className="text-[10px] text-red-400 font-semibold uppercase">
                                                confirmations
                                            </span>
                                        </div>
                                    </div>

                                    {/* Infos détaillées */}
                                    <div className="space-y-4">

                                        {/* Utilisateur */}
                                        <div className="flex items-start gap-3">
                                            <div className="p-2 bg-white/5 rounded-lg">
                                                <User className="w-4 h-4 text-gray-400" strokeWidth={2.5} />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">
                                                    Signalé par
                                                </p>
                                                <p className="text-sm text-white font-semibold truncate">
                                                    {incident.utilisateur.nom}
                                                </p>
                                            </div>
                                        </div>

                                        {/* Commune */}
                                        <div className="flex items-start gap-3">
                                            <div className="p-2 bg-white/5 rounded-lg">
                                                <MapPin className="w-4 h-4 text-gray-400" strokeWidth={2.5} />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">
                                                    Commune
                                                </p>
                                                <p className="text-sm text-white font-semibold truncate">
                                                    {incident.commune.nom}
                                                </p>
                                            </div>
                                        </div>

                                        {/* Date */}
                                        <div className="flex items-start gap-3">
                                            <div className="p-2 bg-white/5 rounded-lg">
                                                <Calendar className="w-4 h-4 text-gray-400" strokeWidth={2.5} />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">
                                                    Date & Heure
                                                </p>
                                                <p className="text-sm text-white font-semibold">
                                                    {new Date(incident.date_creation).toLocaleString('fr-FR', {
                                                        day: '2-digit',
                                                        month: 'short',
                                                        year: 'numeric',
                                                        hour: '2-digit',
                                                        minute: '2-digit'
                                                    })}
                                                </p>
                                            </div>
                                        </div>

                                    </div>
                                </div>

                                {/* 
                  ═══════════════════════════════════════════════════
                  💬 SECTION COMMENTAIRES
                  ═══════════════════════════════════════════════════
                */}
                                <div className="space-y-4">

                                    {/* Header commentaires */}
                                    <h3 className="text-red-500 text-xs font-bold uppercase tracking-wider 
                               flex items-center gap-2">
                                        <MessageSquare className="w-4 h-4" strokeWidth={2.5} />
                                        Discussion ({comments.length})
                                    </h3>

                                    {/* Liste commentaires */}
                                    <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2 
                                scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">

                                        {loadingComments ? (
                                            /* Skeleton loaders */
                                            [...Array(3)].map((_, i) => (
                                                <div key={i} className="bg-white/5 p-4 rounded-xl border border-white/10 
                                               space-y-2 animate-pulse">
                                                    <div className="h-3 bg-white/10 rounded w-1/3" />
                                                    <div className="h-3 bg-white/5 rounded w-full" />
                                                    <div className="h-3 bg-white/5 rounded w-2/3" />
                                                </div>
                                            ))
                                        ) : comments.length > 0 ? (
                                            comments.map((c, i) => (
                                                <div
                                                    key={i}
                                                    className="bg-white/5 backdrop-blur-sm border border-white/10 
                                   p-4 rounded-xl hover:bg-white/[0.07] hover:border-red-500/20 
                                   transition-all duration-200"
                                                >
                                                    <div className="flex items-center justify-between mb-2">
                                                        <span className="text-xs text-red-500 font-bold uppercase">
                                                            {c.utilisateur?.nom || 'Anonyme'}
                                                        </span>
                                                        <span className="text-[10px] text-gray-500 flex items-center gap-1">
                                                            <Clock className="w-3 h-3" />
                                                            {new Date(c.date_creation).toLocaleDateString('fr-FR', {
                                                                day: '2-digit',
                                                                month: 'short'
                                                            })}
                                                        </span>
                                                    </div>
                                                    <p className="text-xs text-gray-300 leading-relaxed">
                                                        {c.contenu}
                                                    </p>
                                                </div>
                                            ))
                                        ) : (
                                            /* Empty state */
                                            <div className="flex flex-col items-center justify-center 
                                    py-12 bg-white/5 rounded-xl border border-dashed border-white/10">
                                                <MessageSquare className="w-8 h-8 text-gray-600 mb-2" strokeWidth={1.5} />
                                                <p className="text-xs text-gray-500 font-semibold uppercase tracking-wider">
                                                    Aucun commentaire
                                                </p>
                                            </div>
                                        )}

                                    </div>
                                </div>

                            </div>

                        </div>
                    </div>

                </div>
            </div>
        </>
    );
};

export default IncidentDetailModal;