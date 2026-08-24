export interface NotificationItem {
  id: number;
  message: string;
  lu: boolean;
  date_creation: string;
}

// Interface pour la pagination Laravel standard
export interface NotificationResponse {
  data: NotificationItem[];
  meta: {
    current_page: number;
    last_page: number;
    total: number;
    per_page: number;
  };
}
