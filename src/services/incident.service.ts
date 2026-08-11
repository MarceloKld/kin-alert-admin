import api from "@/lib/axios";
import { Incident } from "@/types";

export const IncidentService = {
  // Récupère tous les incidents pour l'admin
  getAllIncidents: async (): Promise<Incident[]> => {
    const response = await api.get("/admin/incidents");
    // Laravel retourne souvent les données dans response.data.data si vous utilisez les Resources
    return response.data.data || response.data;
  },

  // Change le statut d'un incident (Rejeté/Validé)
  forceStatus: async (id: number, status: string) => {
    const response = await api.patch(`/admin/incidents/${id}/force-status`, {
      statut: status,
    });
    return response.data;
  },
};
