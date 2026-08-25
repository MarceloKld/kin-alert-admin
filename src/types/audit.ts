export interface AuditLog {
  id: number;
  utilisateur_id: number;
  action: string;
  cible: string;
  cible_id: number | null;
  ip_address: string;
  user_agent: string;
  date_creation: string;
  utilisateur: {
    id: number;
    nom: string;
    role: string; // On définit clairement le rôle ici
  };
}

export interface AuditResponse {
  current_page: number;
  data: AuditLog[];
  last_page: number;
  per_page: number;
  total: number;
  next_page_url: string | null;
  prev_page_url: string | null;
}
