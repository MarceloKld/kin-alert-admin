import api from "@/lib/axios";
import { DashboardResponse } from "@/types";

/**
 * Service pour récupérer les données complètes du Dashboard Global
 * @returns {Promise<DashboardResponse>} - Retourne { stats: {...}, charts: {...} }
 */
export const DashboardService = {
  getStats: async (): Promise<DashboardResponse> => {
    try {
      const response = await api.get("/admin/dashboard");
      return response.data; // Renvoie l'objet global intact
    } catch (error) {
      console.error("Erreur Dashboard:", error);
      throw error;
    }
  },
};
