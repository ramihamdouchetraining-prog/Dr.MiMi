// Configuration de l'API pour développement et production

// En développement: utilise le proxy Vite (/api -> http://localhost:5001)
// En production: utilise VITE_API_URL depuis .env.production
export const API_BASE_URL = import.meta.env.VITE_API_URL || '';

// Helper pour construire les URLs d'API
export function getApiUrl(path: string): string {
  // En développement, le proxy Vite gère /api
  if (import.meta.env.DEV) {
    return path.startsWith('/api') ? path : `/api${path}`;
  }
  
  // En production, utilise l'URL complète du backend Render
  // IMPORTANT: Ne pas utiliser window.location.origin (Vercel) mais le backend (Render)
  const baseUrl = API_BASE_URL;
  
  // Si VITE_API_URL n'est pas défini, afficher une erreur claire
  if (!baseUrl) {
    console.error('❌ VITE_API_URL not configured! Please set it in Vercel environment variables.');
    console.error('Expected: https://drmimi-replit.onrender.com');
    throw new Error('API URL not configured. Please contact administrator.');
  }
  
  const cleanPath = path.startsWith('/api') ? path : `/api${path}`;
  return `${baseUrl}${cleanPath}`;
}

// Helper pour les requêtes fetch
export async function apiFetch(path: string, options?: RequestInit) {
  const url = getApiUrl(path);
  const response = await fetch(url, {
    ...options,
    credentials: 'include', // Important pour les cookies de session
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
  });
  
  if (!response.ok) {
    const error = await response.text();
    throw new Error(error || `HTTP ${response.status}`);
  }
  
  return response.json();
}

// Configuration
console.log('🔧 API Configuration:', {
  mode: import.meta.env.MODE,
  isDev: import.meta.env.DEV,
  apiBaseUrl: API_BASE_URL || 'using proxy',
});
