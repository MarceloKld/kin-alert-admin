import api from "@/lib/axios";
import { UserPaginatedResponse, User } from "@/types";

export const UserService = {
  // On garde juste la recherche par texte pour l'instant
  getAll: async (page: number = 1, search?: string) => {
    const response = await api.get<UserPaginatedResponse>(`/admin/users`, {
      params: { page, search: search || undefined },
    });
    return response.data;
  },

  suspend: async (id: number) =>
    (await api.patch(`/admin/users/${id}/suspend`)).data,
  activate: async (id: number) =>
    (await api.patch(`/admin/users/${id}/activate`)).data,
  delete: async (id: number) => (await api.delete(`/admin/users/${id}`)).data,

  // src/services/user.service.ts
  createManager: async (data: {
    nom: string;
    email: string;
    telephone: string;
    password: string;
  }) => (await api.post(`/admin/managers`, data)).data,
};