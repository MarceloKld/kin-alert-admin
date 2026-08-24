export interface Setting {
  id: number;
  key: string;
  value: string;
  created_at: string;
  updated_at: string;
}

export interface SettingsResponse {
  status: string;
  settings: Setting[];
}

export interface SettingUpdateResponse {
  status: string;
  message: string;
  data: Setting;
}
