import api from "@/lib/axios";
import { DashboardStats } from "@/types";

export const StatService = {
  // Récupérer les chiffres clés pour les compteurs du haut
  getGlobalStats: async (): Promise<DashboardStats> => {
    const response = await api.get("/admin/dashboard");
    return response.data;
  },
};