// ---------------------------------------------------------------------------
// TYPES D'ÉNUMÉRATION (Conservés de votre code)
// ---------------------------------------------------------------------------
export type UserRole = "utilisateur" | "gestionnaire" | "administrateur";
export type UserStatus = "actif" | "suspendu";
export type IncidentStatus = "en_attente" | "valide" | "rejete";

// ---------------------------------------------------------------------------
// ENTITÉS DE LA BASE DE DONNÉES
// ---------------------------------------------------------------------------

// Utilisateur
export interface User {
  id: number;
  nom: string;
  email: string;
  telephone?: string;
  role: UserRole;
  statut: UserStatus;
  date_creation: string;
}

// Type d'Incident
export interface IncidentType {
  id: number;
  titre: string;
  description: string;
}

// Villes & Communes
export interface Ville {
  id: number;
  nom: string;
}

export interface Commune {
  id: number;
  nom: string;
  ville_id: number;
  ville?: Ville;
}

// Preuves
export interface Preuve {
  id: number;
  incident_id?: number;
  fichier: string; // URL ou chemin de stockage
  type_fichier: string;
}

// Incident (Complet selon BDD)
export interface Incident {
  id: number;
  titre: string;
  description: string;
  type_incident_id: number;
  type_incident?: IncidentType;
  latitude: number;
  longitude: number;
  commune_id: number;
  commune?: Commune;
  avenue?: string;
  statut: IncidentStatus;
  nombre_confirmations: number;
  utilisateur_id: number;
  utilisateur?: User;
  date_creation: string;
  preuves?: Preuve[];
  commentaires?: Commentaire[];
  historique_statuts?: HistoriqueStatut[];
}

// Commentaires
export interface Commentaire {
  id: number;
  contenu: string;
  utilisateur_id: number;
  utilisateur?: User;
  incident_id: number;
  date_creation: string;
}

// Historique des statuts
export interface HistoriqueStatut {
  id: number;
  incident_id: number;
  ancien_statut: IncidentStatus;
  nouveau_statut: IncidentStatus;
  modifie_par: number;
  modificateur?: User;
  date_modification: string;
}

// Audit Logs (Pour le portail Admin)
export interface AuditLog {
  id: number;
  utilisateur_id: number;
  utilisateur?: User;
  action: string;
  cible: string;
  cible_id: number;
  ip_address: string;
  user_agent: string;
  date_creation: string;
}

// ---------------------------------------------------------------------------
// STATISTIQUES DASHBOARD ADMIN
// ---------------------------------------------------------------------------
export interface GlobalStats {
  total_incidents: number;
  incidents_valides: number;
  incidents_en_attente: number;
  incidents_rejetes?: number;
  total_utilisateurs: number;
  total_gestionnaires?: number;
}