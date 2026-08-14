import api from "@/lib/axios";
import { Incident, IncidentStatus } from "@/types";

export const IncidentAdminService = {
  // Récupérer tous les incidents avec pagination et filtre par statut
  getAllIncidents: async (page: number = 1, status?: string) => {
    const params: Record<string, any> = { page };

    // Si un filtre est sélectionné et qu'il ne s'agit pas de "all"
    if (status && status !== "all") {
      params.status = status; // ⚠️ Change en 'params.statut = status' si ton backend Laravel attend 'statut'
    }

    const response = await api.get("/admin/incidents", { params });
    return response.data;
  },

  // Changer de force le statut d'un incident (Admin/Gestionnaire)
  updateStatus: async (id: number, status: IncidentStatus) => {
    const response = await api.patch(`/admin/incidents/${id}/force-status`, {
      status: status,
    });
    return response.data;
  },

  // Supprimer un incident (Admin uniquement selon ton RBAC)
  deleteIncident: async (id: number) => {
    const response = await api.delete(`/admin/incidents/${id}`);
    return response.data;
  },

  // Récupérer l'historique des changements de statut
  getHistory: async (id: number) => {
    const response = await api.get(`/admin/incidents/${id}/history`);
    return response.data;
  },

  // 🔽 NOUVELLE MÉTHODE : Récupérer les commentaires d'un incident
  getComments: async (incidentId: number) => {
    // Note : utilise '/admin/incidents/...' si la route backend est dans le groupe admin
    const response = await api.get(`/incidents/${incidentId}/comments`);
    return response.data;
  },
  
};
