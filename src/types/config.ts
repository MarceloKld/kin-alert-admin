export interface PaginatedResponse<T> {
  data: T[];
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
  // ... autres champs si nécessaire
}

export interface Ville {
  id: number;
  nom: string;
}

export interface Commune {
  id: number;
  nom: string;
  ville_id: number;
  ville: Ville; // Note : l'objet ville est inclus ici d'après ton JSON
}

export interface IncidentType {
  id: number;
  titre: string;
  description: string;
}
