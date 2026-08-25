export interface AuditLog {
  id: number;
  utilisateur_id: number;
  action: string;
  cible: string;
  cible_id: number;
  ip_address: string;
  user_agent: string;
  date_creation: string;
  // Optionnel : si ton API renvoie l'objet utilisateur joint
  utilisateur?: {
    nom: string;
    email: string;
  };
}

export interface AuditResponse {
  data: AuditLog[];
  current_page: number;
  last_page: number;
  total: number;
}
