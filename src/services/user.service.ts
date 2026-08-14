import api from "@/lib/axios";

// Explication Prof : Ce service centralise les privilèges d'administration des comptes
export const UserAdminService = {
  // Récupérer tous les utilisateurs (Citoyens)
  getUsers: async (page: number = 1, search?: string) => {
    const params = { page, search };
    const response = await api.get("/admin/users", { params });
    return response.data;
  },

  // Récupérer les gestionnaires (Équipe administrative)
  getManagers: async () => {
    const response = await api.get("/admin/managers");
    return response.data;
  },

  // Suspendre un compte (PATCH /api/v1/admin/users/{user}/suspend)
  suspendUser: async (id: number) => {
    const response = await api.patch(`/admin/users/${id}/suspend`);
    return response.data;
  },

  // Activer un compte (PATCH /api/v1/admin/users/{user}/activate)
  activateUser: async (id: number) => {
    const response = await api.patch(`/admin/users/${id}/activate`);
    return response.data;
  },

  // Supprimer définitivement un utilisateur
  deleteUser: async (id: number) => {
    const response = await api.delete(`/admin/users/${id}`);
    return response.data;
  },
};
