import api from "@/lib/axios";
import {
  Ville,
  Commune,
  IncidentType,
  PaginatedResponse,
} from "@/types/config";

export const ConfigService = {
  // Note : J'enlève le slash initial si ton baseURL le contient déjà
  getVilles: async () => {
    const res = await api.get<any>("villes");
    return Array.isArray(res.data) ? res.data : res.data.data;
  },
  createVille: async (nom: string) =>
    (await api.post<Ville>("villes", { nom })).data,

  // Modification ici pour supporter la pagination
  getCommunes: async (page: number = 1) => {
    const res = await api.get<PaginatedResponse<Commune>>(
      `communes?page=${page}`,
    );
    return res.data;
  },
  createCommune: async (data: { nom: string; ville_id: number }) =>
    (await api.post<Commune>("communes", data)).data,

  getIncidentTypes: async (): Promise<IncidentType[]> => {
    const res = await api.get<any>("types-incidents");
    const data = res.data;
    return Array.isArray(data) ? data : data?.data || [];
  },

  // À ajouter dans config.service.ts
  createIncidentType: async (data: { titre: string; description: string }) =>
    (await api.post<IncidentType>("types-incidents", data)).data,
};