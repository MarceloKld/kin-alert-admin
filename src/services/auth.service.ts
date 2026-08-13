import api from "@/lib/axios";
import { User } from "@/types";

// Interface pour la réponse que tu as montrée sur Postman
interface LoginResponse {
  message: string;
  token: string;
  user: User;
}

export const AuthService = {
  login: async (credentials: {
    email: string;
    password: string;
  }): Promise<LoginResponse> => {
    // 1. Appel POST vers ton backend Laravel
    const response = await api.post("/login", credentials);

    // 2. Si le serveur répond avec succès (200)
    if (response.data.token) {
      // On stocke le token pour les futurs appels (via notre intercepteur axios)
      localStorage.setItem("token", response.data.token);
      // On stocke les infos utilisateur pour l'affichage (nom, role, etc.)
      localStorage.setItem("user", JSON.stringify(response.data.user));
    }

    return response.data;
  },

  // 👈 On ajoute 'redirect = true' par défaut
  logout: (redirect: boolean = true) => {
    // Nettoyage complet
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    // Redirection SEULEMENT si autorisée
    if (redirect && typeof window !== "undefined") {
      window.location.href = "/login";
    }
  },
};
