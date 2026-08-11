export type UserRole = "utilisateur" | "gestionnaire" | "administrateur";
export type UserStatus = "actif" | "suspendu";
export type IncidentStatus = "en_attente" | "valide" | "rejete";

export interface User {
  id: number;
  nom: string;
  email: string;
  telephone?: string;
  role: UserRole;
  statut: UserStatus;
  date_creation: string;
}

export interface Incident {
  id: number;
  titre: string;
  description: string;
  statut: IncidentStatus;
  latitude: number;
  longitude: number;
  nombre_confirmations: number;
  utilisateur_id: number;
  commune_id: number;
  date_creation: string;
  // Relations optionnelles
  utilisateur?: User;
  preuves?: Preuve[];
}

export interface Preuve {
  id: number;
  fichier: string;
  type_fichier: string;
}
