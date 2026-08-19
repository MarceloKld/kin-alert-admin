"use client";
import React, { useEffect, useState } from 'react';
import { X, MapPin, Info, MessageSquare, User, Calendar, AlertCircle, ExternalLink, Loader2, Maximize2 } from 'lucide-react';
import { Incident, Commentaire } from '@/types';
import { IncidentService, STORAGE_URL } from '@/services/incident.service';
import StatusBadge from '@/components/ui/StatusBadge';

interface Props {
    incident: Incident;
    onClose: () => void;
}

const IncidentDetailModal = ({ incident, onClose }: Props) => {
    const [comments, setComments] = useState<Commentaire[]>([]);
    const [loadingComments, setLoadingComments] = useState(false);
    const [fullImage, setFullImage] = useState<string | null>(null); // ÉTAT POUR L'IMAGE EN GRAND

   useEffect(() => {
    const fetchComments = async () => {
      setLoadingComments(true);
      try {
        const res = await IncidentService.getComments(incident.id);
        setComments(Array.isArray(res) ? res : res.data || []);
      } catch (error) { console.error("Erreur commentaires"); }
      finally { setLoadingComments(false); }
    };
    fetchComments();
  }, [incident.id]);

    const openInGoogleMaps = () => {
        const url = `https://www.google.com/maps?q=${incident.latitude},${incident.longitude}`;
        window.open(url, '_blank');
    };
return (
  <>
        {/* 🖼️ LIGHTBOX (IMAGE EN GRAND) - DOIT ÊTRE EN HAUT DANS LE PORTAL/DOM */}
        {fullImage && (
            <div
                className="fixed inset-0 z-200 bg-black/95 backdrop-blur-2xl flex items-center justify-center p-4 cursor-zoom-out animate-in fade-in zoom-in duration-300"
                onClick={() => setFullImage(null)}
            >
                <button className="absolute top-8 right-8 p-3 bg-white/10 hover:bg-red-500 rounded-full text-white transition-colors">
                    <X className="w-8 h-8" />
                </button>
                <img
                    src={fullImage}
                    className="max-w-full max-h-full object-contain rounded-2xl shadow-[0_0_100px_rgba(0,0,0,0.8)]"
                    alt="Agrandissement"
                />
            </div>
        )}

        {/* 📦 MODAL PRINCIPAL */}
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/95 backdrop-blur-xl animate-in fade-in duration-300">
            <div className="bg-[#0b0c10] border border-white/10 w-full max-w-6xl max-h-[95vh] overflow-hidden rounded-4xl flex flex-col shadow-[0_0_50px_rgba(0,0,0,0.5)]">

                {/* Header de contrôle */}
                <div className="p-6 border-b border-white/5 flex justify-between items-center bg-white/2">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-red-600/20 flex items-center justify-center border border-red-600/30">
                            <AlertCircle className="w-6 h-6 text-red-500" />
                        </div>
                        <div>
                            <h2 className="text-xl font-black text-white uppercase italic leading-none">{incident.titre}</h2>
                            <p className="text-[10px] text-gray-500 font-bold tracking-[0.2em] mt-1">{incident.type_incident.titre}</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-3 hover:bg-white/10 rounded-full transition-all text-gray-400 hover:rotate-90">
                        <X className="w-6 h-6" />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">

                        {/* Colonne Gauche : Preuves et Description (8 cols) */}
                        <div className="lg:col-span-8 space-y-8">
                            {/* Galerie Photos */}
                            <div className="grid grid-cols-2 gap-4">
                                {incident.preuves.map((p, i) => {
                                    // 1. Déterminer la base URL (Local ou Prod)
                                    // On donne la priorité à la variable d'environnement, sinon on utilise la constante importée
                                    let baseUrl = process.env.NEXT_PUBLIC_STORAGE_URL || STORAGE_URL;

                                    // 2. Sécurité : S'assurer que la base finit par un seul "/"
                                    if (!baseUrl.endsWith('/')) baseUrl += '/';

                                    // 3. Nettoyer le chemin provenant de la BDD (ex: "preuves/photo.png")
                                    // On enlève le premier "/" s'il existe pour éviter le double "//"
                                    const cleanFilePath = p.fichier.startsWith('/') ? p.fichier.substring(1) : p.fichier;

                                    // 4. L'URL finale propre
                                    const finalUrl = p.fichier.startsWith('http') ? p.fichier : `${baseUrl}${cleanFilePath}`;

                                    return (
                                        <div
                                            key={i}
                                            className="group relative aspect-video rounded-4xl overflow-hidden bg-white/5 border border-white/10"
                                        >
                                            {/* L'image utilise la nouvelle URL calculée */}
                                            <img
                                                src={finalUrl}
                                                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                                alt="Preuve"
                                                onError={(e) => {
                                                    console.error("Image non trouvée :", finalUrl);
                                                }}
                                            />

                                            {/* BOUTON POUR OUVRIR EN GRAND DANS UN LIEN */}
                                            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2">
                                                <button
                                                    onClick={() => window.open(finalUrl, '_blank')} // Utilise l'URL corrigée ici
                                                    className="p-4 bg-red-600 text-white rounded-full hover:bg-red-700 transition-all shadow-xl active:scale-90"
                                                    title="Ouvrir l'image originale"
                                                >
                                                    <Maximize2 className="w-6 h-6" />
                                                </button>
                                                <span className="text-[10px] text-white font-black uppercase tracking-widest">Voir en grand</span>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>

                            {/* Description */}
                            <div className="bg-white/3 p-8 rounded-4xl border border-white/5 relative overflow-hidden">
                                <div className="absolute top-0 left-0 w-1 h-full bg-red-600"></div>
                                <h3 className="text-red-500 text-[10px] font-black uppercase tracking-widest mb-4 flex items-center gap-2">
                                    <Info className="w-4 h-4" /> Rapport de situation
                                </h3>
                                <p className="text-gray-300 text-lg leading-relaxed font-medium italic">
                                    &quot;{incident.description}&quot;
                                </p>
                            </div>

                            {/* Bouton Localisation */}
                            <button
                                onClick={openInGoogleMaps}
                                className="w-full group py-6 bg-red-600 hover:bg-red-700 text-white rounded-4xl font-black uppercase tracking-[0.2em] text-sm transition-all flex items-center justify-center gap-3 shadow-xl shadow-red-900/20 active:scale-[0.98]"
                            >
                                <MapPin className="w-5 h-5 group-hover:animate-bounce" />
                                Déployer la localisation Maps
                                <ExternalLink className="w-4 h-4 opacity-50" />
                            </button>
                        </div>

                        {/* Colonne Droite : Métadonnées et Commentaires (4 cols) */}
                        <div className="lg:col-span-4 space-y-6">
                            {/* Carte Infos */}
                            <div className="bg-white/2 border border-white/5 rounded-4xl p-6 space-y-6">
                                <div className="flex items-center justify-between">
                                    <StatusBadge status={incident.statut} />
                                    <span className="text-[10px] text-gray-600 font-bold">CONFIRMATIONS: {incident.nombre_confirmations}</span>
                                </div>

                                <div className="space-y-4">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 rounded-lg bg-white/5"><User className="w-4 h-4 text-gray-400" /></div>
                                        <div>
                                            <p className="text-[9px] text-gray-500 uppercase font-black">Signalé par</p>
                                            <p className="text-sm text-white font-bold">{incident.utilisateur.nom}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 rounded-lg bg-white/5"><MapPin className="w-4 h-4 text-gray-400" /></div>
                                        <div>
                                            <p className="text-[9px] text-gray-500 uppercase font-black">Commune</p>
                                            <p className="text-sm text-white font-bold">{incident.commune.nom}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 rounded-lg bg-white/5"><Calendar className="w-4 h-4 text-gray-400" /></div>
                                        <div>
                                            <p className="text-[9px] text-gray-500 uppercase font-black">Date & Heure</p>
                                            <p className="text-sm text-white font-bold">{new Date(incident.date_creation).toLocaleString()}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Section Commentaires */}
                            <div className="space-y-4">
                                <h3 className="text-red-500 text-[10px] font-black uppercase tracking-widest flex items-center gap-2 px-2">
                                    <MessageSquare className="w-4 h-4" /> Discussion ({comments.length})
                                </h3>
                                <div className="space-y-3 max-h-87.5 overflow-y-auto pr-2 custom-scrollbar">
                                    {loadingComments ? (
                                        <div className="flex justify-center py-10"><Loader2 className="w-6 h-6 animate-spin text-red-500" /></div>
                                    ) : comments.length > 0 ? (
                                        comments.map((c, i) => (
                                            <div key={i} className="bg-white/3 p-4 rounded-2xl border border-white/5 hover:border-red-500/20 transition-colors">
                                                <div className="flex justify-between items-center mb-1">
                                                    <span className="text-[10px] text-red-500 font-black uppercase">{c.utilisateur?.nom}</span>
                                                </div>
                                                <p className="text-xs text-gray-400 leading-relaxed">{c.contenu}</p>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="text-center py-10 bg-white/1 rounded-4xl border border-dashed border-white/5 text-gray-600 text-[10px] uppercase font-bold tracking-widest">
                                            Aucune interaction
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