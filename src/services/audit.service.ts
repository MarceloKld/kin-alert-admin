import api from "@/lib/axios";
import { AuditResponse } from "@/types/audit";

export const AuditService = {
  // Récupérer tous les logs avec pagination
  getAll: async (page: number = 1): Promise<AuditResponse> => {
    const response = await api.get<AuditResponse>(
      `/admin/audit-logs?page=${page}`,
    );
    return response.data;
  },

  // Récupérer les logs d'un utilisateur spécifique
  getByUser: async (
    userId: number,
    page: number = 1,
  ): Promise<AuditResponse> => {
    const response = await api.get<AuditResponse>(
      `/admin/users/${userId}/audit-logs?page=${page}`,
    );
    return response.data;
  },
};
