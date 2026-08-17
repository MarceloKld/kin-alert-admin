// ---------------------------------------------------------------------------
// TYPES D'ÉNUMÉRATION (Conservés de votre code)
// ---------------------------------------------------------------------------
export type UserRole = "utilisateur" | "gestionnaire" | "administrateur";
export type UserStatus = "actif" | "inactif" | "suspendu";
// src/types/index.ts
export type IncidentStatus = "en_attente" | "valide" | "rejete";

// ---------------------------------------------------------------------------
// ENTITÉS DE LA BASE DE DONNÉES
// ---------------------------------------------------------------------------

export interface ApiErrorResponse {
  message: string;
}

// Définition pour les commentaires


// Définition pour les erreurs API
export interface ApiError {
  response?: {
    data?: {
      message?: string;
    }
  }
}


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



export interface Evidence {
  id: string;
  incident_id: string;
  fichier: string; // URL de l'image
  type_fichier: string;
}


// Incident (Complet selon BDD)
export interface Incident {
  id: number;
  titre: string;
  description: string;
  statut: "en_attente" | "valide" | "rejete";
  nombre_confirmations: number;
  latitude: string;
  longitude: string;
  avenue: string;
  date_creation: string;
  deleted_at?: string | null;
  utilisateur: {
    id: number;
    nom: string;
    email: string;
  };
  commune: {
    id: number;
    nom: string;
  };
  type_incident: {
    id: number;
    titre: string;
  };
  preuves: { fichier: string }[];
  commentaires?: Commentaire[];
}

// Commentaires
export interface Commentaire {
  id: number;
  contenu: string;
  date_creation: string;
  utilisateur?: {
    nom: string;
    role: string;
  };
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
export interface DashboardStats {
  incidents_total: number;
  incidents_pending: number;
  incidents_validated: number;
  incidents_rejected: number;
  incidents_deleted: number;
}

// On définit aussi le type pour la réponse paginée des incidents pour éviter d'autres erreurs
export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    current_page: number;
    last_page: number;
    total: number;
    per_page: number;
  };
  links: {
    next: string | null;
    prev: string | null;
  };
}


// ---------------------------------------------------------------------------
// DASHBOARD GLOBAL PREMIUM
// ---------------------------------------------------------------------------
export interface DashboardData {
  stats: {
    users_total: number;
    gestionnaires_total: number;
    incidents_total: number;
    incidents_pending: number;
    incidents_validated: number;
    incidents_rejected: number;
    incidents_deleted: number;
  };
  charts: {
    incidents_by_month: { month: string; total: number }[];
    incidents_by_type: { titre: string; total: number }[];
    top_communes: { nom: string; total: number }[]; // Déplacé ici
    users_growth: { month: string; total: number }[]; // Déplacé ici
  };
  

}


