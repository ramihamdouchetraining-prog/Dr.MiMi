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

// Helper pour les requêtes fetch avec gestion automatique du 503 (backend en veille)
export async function apiFetch(path: string, options?: RequestInit, retryCount = 0): Promise<any> {
  const url = getApiUrl(path);
  const maxRetries = 2;
  const retryDelay = 15000; // 15 secondes entre les tentatives
  
  try {
    const response = await fetch(url, {
      ...options,
      credentials: 'include', // Important pour les cookies de session
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
    });
    
    // Gestion spéciale du 503 (backend Render en veille)
    if (response.status === 503 && retryCount < maxRetries) {
      console.warn(`⚠️ Backend en veille (503) - Tentative ${retryCount + 1}/${maxRetries + 1}`);
      console.log(`⏳ Attente de ${retryDelay / 1000}s pour réveil du backend...`);
      
      // Attendre que le backend se réveille
      await new Promise(resolve => setTimeout(resolve, retryDelay));
      
      // Réessayer
      console.log('🔄 Nouvelle tentative...');
      return apiFetch(path, options, retryCount + 1);
    }
    
    if (!response.ok) {
      const error = await response.text();
      throw new Error(error || `HTTP ${response.status}`);
    }
    
    return response.json();
  } catch (error) {
    // Si erreur réseau et qu'on n'a pas épuisé les tentatives
    if (error instanceof TypeError && error.message.includes('fetch') && retryCount < maxRetries) {
      console.warn(`⚠️ Erreur réseau - Tentative ${retryCount + 1}/${maxRetries + 1}`);
      await new Promise(resolve => setTimeout(resolve, retryDelay));
      return apiFetch(path, options, retryCount + 1);
    }
    throw error;
  }
}

// Configuration
console.log('🔧 API Configuration:', {
  mode: import.meta.env.MODE,
  isDev: import.meta.env.DEV,
  apiBaseUrl: API_BASE_URL || 'using proxy',
});
