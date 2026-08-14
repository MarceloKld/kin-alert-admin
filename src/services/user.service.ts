import api from "@/lib/axios";

// Explication Prof : Ce service centralise les privilèges d'administration des comptes
export const UserAdminService = {
  // Récupérer tous les utilisateurs (Citoyens)
  getUsers: async (page: number = 1, search?: string) => {
    const response = await api.get("/admin/users", {
      params: {
        page: page,
        search: search || undefined, // N'envoie le paramètre que s'il y a du texte
      },
    });
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

  createManager: async (data: any) => {
    // Utilise l'endpoint POST /api/v1/admin/managers
    const response = await api.post("/admin/managers", data);
    return response.data;
  },
};
