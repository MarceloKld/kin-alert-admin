import api from "@/lib/axios";
import { SettingsResponse, SettingUpdateResponse } from "@/types/settings";

export const SettingsService = {
  // Récupérer tous les paramètres
  getAll: async (): Promise<SettingsResponse> => {
    const response = await api.get<SettingsResponse>("/admin/settings");
    return response.data;
  },

  // Mettre à jour un paramètre spécifique
  update: async (
    key: string,
    value: string,
  ): Promise<SettingUpdateResponse> => {
    const response = await api.put<SettingUpdateResponse>("/admin/settings", {
      key,
      value,
    });
    return response.data;
  },
};
