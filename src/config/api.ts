// Configuration de l'API pour développement et production

// En développement: utilise le proxy Vite (/api -> http://localhost:5001)
// En production: utilise VITE_API_URL depuis .env.production
// Fallback: URL du backend Render pour éviter les erreurs de configuration
export const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://drmimi-replit.onrender.com';

// Helper pour obtenir l'URL de base (sans /api)
export function getBaseUrl(): string {
  const isVercel = window.location.hostname.includes('vercel.app');
  let baseUrl = API_BASE_URL;

  // Sécurité ultime: si baseUrl est vide ou relative en PROD, on force Render
  if (!baseUrl || baseUrl.startsWith('/') || isVercel) {
    if (isVercel && !baseUrl.includes('onrender.com')) {
      // console.warn('⚠️ Vercel détecté: Forçage de l\'URL backend Render.');
    }
    baseUrl = 'https://drmimi-replit.onrender.com';
  }
  return baseUrl;
}

// Helper pour construire les URLs d'API
export function getApiUrl(path: string): string {
  // Détection de l'environnement Vercel via le hostname
  const isVercel = window.location.hostname.includes('vercel.app');

  // En développement (localhost), le proxy Vite gère /api
  // MAIS si on est sur Vercel, on force le mode production même si DEV est true (cas rare)
  if (import.meta.env.DEV && !isVercel) {
    return path.startsWith('/api') ? path : `/api${path}`;
  }

  // En production (ou sur Vercel), on DOIT utiliser l'URL absolue du backend
  let baseUrl = getBaseUrl();

  // Nettoyage du path
  const cleanPath = path.startsWith('/api') ? path : `/api${path}`;

  // Construction de l'URL finale
  const fullUrl = `${baseUrl}${cleanPath}`;

  return fullUrl;
}

// Cache simple pour les requêtes GET
const apiCache = new Map<string, { data: any; timestamp: number }>();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes par défaut

// Map pour dédupliquer les requêtes en cours
const pendingRequests = new Map<string, Promise<any>>();

interface ApiOptions extends RequestInit {
  useCache?: boolean;
  cacheDuration?: number;
}

// Helper pour les requêtes fetch avec gestion automatique du 503, cache et déduplication
export async function apiFetch(path: string, options: ApiOptions = {}, retryCount = 0): Promise<any> {
  const url = getApiUrl(path);
  const maxRetries = 2;
  const retryDelay = 15000; // 15 secondes entre les tentatives

  // Clé de cache basée sur l'URL et les options (seulement pour GET)
  const isGet = !options.method || options.method === 'GET';
  const cacheKey = `${url}-${JSON.stringify(options.body || {})}`;

  // 1. Vérifier le cache si activé (par défaut true pour GET)
  const useCache = options.useCache !== false && isGet;
  if (useCache) {
    const cached = apiCache.get(cacheKey);
    const duration = options.cacheDuration || CACHE_DURATION;
    if (cached && Date.now() - cached.timestamp < duration) {
      // console.log(`📦 Cache hit for ${path}`);
      return cached.data;
    }
  }

  // 2. Déduplication des requêtes en cours
  if (isGet && pendingRequests.has(cacheKey)) {
    // console.log(`🔄 Deduplication for ${path}`);
    return pendingRequests.get(cacheKey);
  }

  const requestPromise = (async () => {
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
        const errorText = await response.text();
        const lowerErrorText = errorText.trim().toLowerCase();

        // Détecter si on reçoit du HTML au lieu de JSON (ex: page 404)
        if (lowerErrorText.startsWith('<!doctype') || lowerErrorText.startsWith('<html')) {
          console.error(`❌ API Error (HTML response) for ${url}. BaseURL: ${API_BASE_URL}`);
          throw new Error(
            `API endpoint not found: ${url}. Received HTML instead of JSON. ` +
            `Check if VITE_API_URL is correctly configured (current: ${API_BASE_URL})`
          );
        }

        throw new Error(errorText || `HTTP ${response.status}`);
      }

      // Vérifier le type de contenu avant de parser
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        const text = await response.text();
        const lowerText = text.trim().toLowerCase();

        // Si c'est du HTML, c'est probablement une erreur 404/500 déguisée ou une redirection SPA
        if (lowerText.startsWith('<!doctype') || lowerText.startsWith('<html')) {
          console.error(`❌ API Error (HTML content-type) for ${url}. BaseURL: ${API_BASE_URL}`);
          throw new Error(
            `API Error: Expected JSON but received HTML from ${url}. ` +
            `Check VITE_API_URL configuration.`
          );
        }
        // Si ce n'est pas du JSON mais pas du HTML évident, on peut essayer de le retourner ou throw
        throw new Error(`Invalid content-type: ${contentType}. Response: ${text.substring(0, 100)}...`);
      }

      const data = await response.json();

      // Mise en cache si succès
      if (useCache) {
        apiCache.set(cacheKey, { data, timestamp: Date.now() });
      }

      return data;
    } catch (error) {
      // Si erreur réseau et qu'on n'a pas épuisé les tentatives
      if (error instanceof TypeError && error.message.includes('fetch') && retryCount < maxRetries) {
        console.warn(`⚠️ Erreur réseau - Tentative ${retryCount + 1}/${maxRetries + 1}`);
        await new Promise(resolve => setTimeout(resolve, retryDelay));
        return apiFetch(path, options, retryCount + 1);
      }
      throw error;
    } finally {
      // Nettoyer la requête en cours
      if (isGet) {
        pendingRequests.delete(cacheKey);
      }
    }
  })();

  if (isGet) {
    pendingRequests.set(cacheKey, requestPromise);
  }

  return requestPromise;
}

// Configuration
console.log('🔧 API Configuration:', {
  mode: import.meta.env.MODE,
  isDev: import.meta.env.DEV,
  apiBaseUrl: API_BASE_URL || 'using proxy',
});
