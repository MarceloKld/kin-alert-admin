export interface Ville {
  id: number;
  nom: string;
}

export interface Commune {
  id: number;
  nom: string;
  ville_id: number;
  ville?: Ville; // Pour l'affichage
}

export interface IncidentType {
  id: number;
  titre: string;
  description: string;
}
