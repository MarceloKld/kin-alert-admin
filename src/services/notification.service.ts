import api from "@/lib/axios";
import { NotificationItem, NotificationResponse } from "@/types/notification";

export const NotificationService = {
  // 1. Notifications personnelles du staff connecté
  getPersonal: async (page: number = 1): Promise<NotificationResponse> => {
    const response = await api.get<NotificationResponse>(
      `/notifications?page=${page}`,
    );
    return response.data;
  },

  // 2. Marquer comme lue
  markAsRead: async (id: number): Promise<{ message: string }> => {
    const response = await api.get<{ message: string }>(
      `/notifications/${id}/read`,
    );
    return response.data;
  },

  // 3. Envoyer à tout le monde (Admin uniquement)
  broadcast: async (message: string): Promise<{ message: string }> => {
    const response = await api.post("/admin/notifications/broadcast", {
      message,
    });
    return response.data;
  },

  // 4. Envoi spécifique (Staff/Gestionnaires)
  sendToStaff: async (message: string): Promise<{ message: string }> => {
    const response = await api.post("/admin/notifications/send", { message });
    return response.data;
  },
};
