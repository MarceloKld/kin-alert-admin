import api from "@/lib/axios";
import { Incident, IncidentStatus } from "@/types";

// Explication du Prof : 
// Laravel utilise le paramètre ?page=X. 
// On passe un objet 'params' à Axios qui se chargera de construire l'URL.
export const IncidentAdminService = {
  getAllIncidents: async (page: number = 1) => {
    const response = await api.get(`/admin/incidents?page=${page}`);
    return response.data; // Retourne l'objet complet avec current_page, last_page, data, etc.
  },

  // Changer de force le statut d'un incident (Admin/Gestionnaire)
  // Utilise PATCH /api/v1/admin/incidents/{id}/force-status
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
};
