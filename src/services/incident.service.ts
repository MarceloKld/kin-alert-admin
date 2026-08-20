import api from "@/lib/axios";
import { Incident, PaginatedResponse } from "@/types";

// On utilise la variable d'environnement, sinon on retombe sur localhost par défaut
export const STORAGE_URL = process.env.NEXT_PUBLIC_STORAGE_URL || "http://localhost:8000";

// ✅ EXPORT DU TYPE (accessible dans MapView.tsx)
export interface IncidentPublic {
  id: number;
  titre: string;
  description: string;
  localisation: {
    latitude: number;
    longitude: number;
    avenue: string;
    commune: {
      id: number;
      nom: string;
    };
  };
  statut: "en_attente" | "valide" | "rejete";
  nombre_confirmations: number;
  auteur: {
    id: number;
    nom: string;
    role: string;
  };
  preuves: Array<{
    id: number;
    url: string;
    type: string;
  }>;
  date_creation: string;
  type_incident?: {
    id: number;
    titre: string;
  };
}

// On change le type de 'id' en 'string | number' dans toutes les méthodes
export const IncidentService = {
  getAll: async (page = 1, status?: string, search?: string) => {
    const response = await api.get<PaginatedResponse<Incident>>(
      `/admin/incidents`,
      {
        params: {
          page,
          status: status === "tous" ? undefined : status, // ✅ CHANGÉ DE 'statut' à 'status'
          search: search || undefined,
        },
      },
    );
    return response.data;
  },
  /* 
    ═══════════════════════════════════════════════════════
    🗺️ Tous les incidents pour la carte (API publique)
    ═══════════════════════════════════════════════════════
  */
  getAllForMap: async (
    status?: string,
    search?: string,
    commune?: string,
  ): Promise<IncidentPublic[]> => {
    try {
      const response = await api.get<{ data: IncidentPublic[] }>(`/incidents`, {
        params: {
          all: true,
          status: status === "tous" ? undefined : status,
          search: search || undefined,
          commune: commune || undefined,
        },
      });

      console.log(`✅ ${response.data.data.length} incidents récupérés`);

      return response.data.data;
    } catch (error) {
      console.error("❌ Erreur getAllForMap:", error);
      return [];
    }
  },
  getComments: async (incidentId: string | number) => {
    const response = await api.get(`/incidents/${incidentId}/comments`);
    return response.data;
  },

  forceStatus: async (id: string | number, status: string) => {
    const response = await api.patch(`/admin/incidents/${id}/force-status`, {
      status,
    });
    return response.data;
  },

  delete: async (id: string | number) => {
    const response = await api.delete(`/admin/incidents/${id}`);
    return response.data;
  },

  restore: async (id: string | number) => {
    const response = await api.patch(`/admin/incidents/${id}/restore`);
    return response.data;
  },
};