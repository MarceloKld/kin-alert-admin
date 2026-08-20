"use client";

import dynamic from 'next/dynamic';
import { Loader2 } from 'lucide-react';

/* 
  ═══════════════════════════════════════════════════════════════
  🗺️ CARTE CLIENT WRAPPER - Permet l'import dynamique avec ssr: false
  ═══════════════════════════════════════════════════════════════
*/

const MapView = dynamic(
    () => import('@/components/features/carte/MapView'),
    {
        ssr: false, // ✅ Autorisé ici car c'est un Client Component
        loading: () => (
            <div className="h-full w-full flex items-center justify-center 
                    bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950">
                <div className="text-center">
                    <Loader2 className="w-12 h-12 text-red-500 animate-spin mx-auto mb-4" strokeWidth={2.5} />
                    <p className="text-white font-semibold text-sm">Chargement de la carte interactive...</p>
                </div>
            </div>
        )
    }
);

export default function CarteClient() {
    return (
        <div className="h-[calc(100vh-4rem)] w-full">
            <MapView />
        </div>
    );
}