import api from "@/lib/axios";
import { DashboardData } from "@/types";

export const DashboardService = {
  getStats: async (): Promise<DashboardData> => {
    try {
      const response = await api.get("/admin/dashboard");
      // Si Laravel utilise un Resource, les données sont dans response.data.data
      // Si c'est un simple return response()->json(), c'est dans response.data
      return response.data;
    } catch (error) {
      console.error("Erreur Dashboard:", error);
      throw error;
    }
  },
};