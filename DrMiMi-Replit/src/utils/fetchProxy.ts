/**
 * Proxy Fetch pour automatiquement préfixer les URLs /api avec l'API_BASE_URL en production
 * Remplace le fetch natif pour gérer les URLs relatives
 */

import { getApiUrl } from '../config/api';

// Sauvegarde du fetch original
const originalFetch = window.fetch;

// Fonction proxy qui intercepte toutes les requêtes
export function setupFetchProxy() {
  window.fetch = function(input: RequestInfo | URL, init?: RequestInit): Promise<Response> {
    // Convertir l'input en string pour analyse
    let url: string;
    
    if (typeof input === 'string') {
      url = input;
    } else if (input instanceof URL) {
      url = input.toString();
    } else if (input instanceof Request) {
      url = input.url;
    } else {
      url = '';
    }

    // Si l'URL commence par /api, utiliser getApiUrl pour la transformer
    if (url.startsWith('/api')) {
      const fullUrl = getApiUrl(url);
      console.log('🔄 Fetch Proxy:', url, '→', fullUrl);
      
      // Créer une nouvelle requête avec l'URL complète
      if (typeof input === 'string') {
        return originalFetch(fullUrl, init);
      } else if (input instanceof Request) {
        // Cloner la requête avec la nouvelle URL
        return originalFetch(new Request(fullUrl, input), init);
      }
    }

    // Sinon, utiliser le fetch original
    return originalFetch(input, init);
  };

  console.log('✅ Fetch Proxy activé pour les URLs /api');
}

// Fonction pour restaurer le fetch original (si besoin)
export function restoreFetch() {
  window.fetch = originalFetch;
  console.log('✅ Fetch original restauré');
}
