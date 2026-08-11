import axios from 'axios';

// 1. Creation de l'instance Axios personnalisee
const api = axios.create({
  // Fallback sur l'URL locale si la variable d'environnement n'est pas encore definie
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1',
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

// 2. Intercepteur de REQUÊTE : Injection securisee du Token Sanctum
api.interceptors.request.use((config) => {
  // Verification pour eviter de faire planter le SSR de Next.js
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

// 3. Intercepteur de RÉPONSE : Gestion globale des erreurs (401, 403, 500)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      const { status } = error.response;

      // Token expire ou non valide
      if (status === 401) {
        if (typeof window !== 'undefined') {
          localStorage.removeItem('token');
          // Redirection vers la page de connexion si on n'y est pas deja
          if (!window.location.pathname.startsWith('/login')) {
            window.location.href = '/login';
          }
        }
      }
    }
    
    return Promise.reject(error);
  }
);

export default api;