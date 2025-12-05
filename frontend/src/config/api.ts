// Configuration de l'API
// En production sur Vercel, utilise l'URL relative car backend et frontend sont sur le même domaine
// En développement, utilise l'URL complète du backend local
export const getApiBaseUrl = (): string => {
  // Si VITE_API_URL est défini, l'utiliser (priorité absolue)
  const viteApiUrl = (import.meta as any).env?.VITE_API_URL;
  if (viteApiUrl) {
    return viteApiUrl;
  }
  
  // Vérifier au runtime si on est en localhost (développement local)
  if (typeof window !== 'undefined') {
    const isLocalhost = window.location.hostname === 'localhost' || 
                        window.location.hostname === '127.0.0.1' ||
                        window.location.hostname === '';
    
    // Si on est en localhost, utiliser l'URL complète
    if (isLocalhost) {
      return 'http://localhost:3001/api';
    }
    
    // Sinon (production, Vercel, etc.), utiliser l'URL relative
    return '/api';
  }
  
  // Fallback : si window n'est pas disponible (SSR), utiliser l'URL relative
  return '/api';
};

export const API_CONFIG = {
  get BASE_URL() {
    return getApiBaseUrl();
  },
  TIMEOUT: 10000, // 10 secondes
  RETRY_ATTEMPTS: 3,
  RETRY_DELAY: 1000, // 1 seconde
};

// Fonction pour vérifier la santé de l'API
export const checkApiHealth = async (): Promise<boolean> => {
  try {
    const response = await fetch(`${API_CONFIG.BASE_URL}/health`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    return response.ok;
  } catch (error) {
    console.error('API health check failed:', error);
    return false;
  }
};

// Fonction pour obtenir l'URL complète d'un endpoint
export const getApiUrl = (endpoint: string): string => {
  const baseUrl = API_CONFIG.BASE_URL.endsWith('/') 
    ? API_CONFIG.BASE_URL.slice(0, -1) 
    : API_CONFIG.BASE_URL;
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  return `${baseUrl}${cleanEndpoint}`;
};
