import api from "@/lib/axios";

export const AuthService = {
  login: async (email: string, password: string) => {
    // Appel exact à votre endpoint Laravel
    const response = await api.post("/login", { email, password });

    // Si Laravel renvoie un token (Sanctum)
    if (response.data.token) {
      localStorage.setItem("token", response.data.token);
      localStorage.setItem("user", JSON.stringify(response.data.user));
    }
    return response.data;
  },

  logout: async () => {
    await api.post("/logout");
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    window.location.href = "/login";
  },
};
