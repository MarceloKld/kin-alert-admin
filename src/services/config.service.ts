import api from "@/lib/axios";
import { Ville, Commune, IncidentType } from "@/types/config";

export const ConfigService = {
  // Note : J'enlève le slash initial si ton baseURL le contient déjà
  getVilles: async () => (await api.get<Ville[]>("villes")).data,
  createVille: async (nom: string) =>
    (await api.post<Ville>("villes", { nom })).data,

  getCommunes: async () => (await api.get<Commune[]>("communes")).data,
  createCommune: async (data: { nom: string; ville_id: number }) =>
    (await api.post<Commune>("communes", data)).data,

  getIncidentTypes: async () =>
    (await api.get<IncidentType[]>("types-incidents")).data,
  createIncidentType: async (data: { titre: string; description: string }) =>
    (await api.post<IncidentType>("types-incidents", data)).data,
};
