"use client";
import { User } from "@/types";

/**
 * Hook pour récupérer les informations de l'utilisateur connecté
 * Explication Prof : On extrait l'objet 'user' stocké lors du login
 */
export const useAuth = () => {
  if (typeof window === "undefined") return { user: null, isAdmin: false };

  const userJson = localStorage.getItem("user");
  const user: User | null = userJson ? JSON.parse(userJson) : null;

  return {
    user,
    isAdmin: user?.role === "administrateur",
    isManager: user?.role === "gestionnaire" || user?.role === "administrateur",
  };
};
