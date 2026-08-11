import api from "@/lib/axios";
import { GlobalStats } from "@/types";

export const StatService = {
  // Récupérer les chiffres clés pour les compteurs du haut
  getGlobalStats: async (): Promise<GlobalStats> => {
    // On appelle ton endpoint Laravel
    const response = await api.get("/admin/dashboard");
    // On retourne les données (Laravel les encapsule souvent dans 'data')
    return response.data;
  },
};
