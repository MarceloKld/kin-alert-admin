import api from "@/lib/axios";
import { Incident, PaginatedResponse } from "@/types";

export const STORAGE_URL = "http://localhost:8000/storage/";

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