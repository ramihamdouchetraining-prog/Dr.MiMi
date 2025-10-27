// 🌐 CLIENT API ROBUSTE Dr.MiMi - Gestion complète des erreurs et timeouts
const API_BASE_URL = import.meta.env.PROD 
  ? import.meta.env.VITE_API_URL || 'https://drmimi-replit.onrender.com'
  : 'http://localhost:5001';

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

interface RequestConfig extends RequestInit {
  timeout?: number;
  retries?: number;
}

class ApiClient {
  private baseURL: string;
  private abortController: AbortController | null = null;
  private defaultTimeout = 30000; // 30 secondes pour cold start
  private defaultRetries = 3;

  constructor(baseURL: string) {
    this.baseURL = baseURL;
    this.initializeHealthCheck();
  }

  private async initializeHealthCheck() {
    try {
      console.log('🔄 Dr.MiMi API: Test de connexion initiale...');
      await this.healthCheck();
      console.log('✅ Dr.MiMi API: Connexion établie avec succès');
    } catch (error) {
      console.warn('⚠️ Dr.MiMi API: Connexion initiale échouée (cold start possible)');
    }
  }

  private async requestWithTimeout<T>(
    url: string,
    config: RequestConfig = {}
  ): Promise<T> {
    const { timeout = this.defaultTimeout, retries = this.defaultRetries, ...options } = config;

    // Annuler la requête précédente si elle existe
    if (this.abortController) {
      this.abortController.abort();
    }
    
    this.abortController = new AbortController();

    const defaultOptions: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      credentials: 'include',
      signal: this.abortController.signal,
    };

    const finalOptions = { ...defaultOptions, ...options };

    let lastError: Error;

    // Système de retry avec backoff exponentiel
    for (let attempt = 1; attempt <= retries; attempt++) {
      try {
        console.log(`🌐 Dr.MiMi API Request (${attempt}/${retries}): ${finalOptions.method || 'GET'} ${url}`);
        
        const timeoutPromise = new Promise<never>((_, reject) => {
          setTimeout(() => reject(new Error('Timeout')), timeout);
        });

        const fetchPromise = fetch(url, finalOptions);
        const response = await Promise.race([fetchPromise, timeoutPromise]);

        if (!response.ok) {
          const errorText = await response.text();
          let errorMessage = `HTTP ${response.status}: ${response.statusText}`;
          
          try {
            const errorJson = JSON.parse(errorText);
            errorMessage = errorJson.message || errorMessage;
          } catch {
            // Si ce n'est pas du JSON, utiliser le message par défaut
          }
          
          throw new Error(errorMessage);
        }

        const contentType = response.headers.get('content-type');
        
        if (contentType && contentType.includes('application/json')) {
          const data = await response.json();
          console.log(`✅ Dr.MiMi API Success: ${url}`);
          return data;
        } else {
          const text = await response.text();
          console.log(`✅ Dr.MiMi API Success (text): ${url}`);
          return text as unknown as T;
        }

      } catch (error) {
        lastError = error instanceof Error ? error : new Error('Erreur inconnue');
        
        if (error instanceof Error && error.name === 'AbortError') {
          throw new Error('Requête annulée par l\'utilisateur');
        }

        if (error instanceof Error && error.message === 'Timeout') {
          console.warn(`⏰ Dr.MiMi API Timeout (${attempt}/${retries}): ${url} - ${timeout}ms`);
        } else {
          console.warn(`❌ Dr.MiMi API Error (${attempt}/${retries}): ${url}`, error.message);
        }

        if (attempt < retries) {
          // Attendre avant retry (backoff exponentiel)
          const delay = Math.min(1000 * Math.pow(2, attempt - 1), 5000);
          console.log(`⏳ Retry dans ${delay}ms...`);
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }
    }

    // Si tous les retries ont échoué
    console.error(`💥 Dr.MiMi API: Échec définitif après ${retries} tentatives: ${url}`);
    throw lastError!;
  }

  private async request<T>(
    endpoint: string,
    config: RequestConfig = {}
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    return this.requestWithTimeout<T>(url, config);
  }

  async get<T>(endpoint: string, config: RequestConfig = {}): Promise<T> {
    return this.request<T>(endpoint, { ...config, method: 'GET' });
  }

  async post<T>(endpoint: string, data?: any, config: RequestConfig = {}): Promise<T> {
    return this.request<T>(endpoint, {
      ...config,
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async put<T>(endpoint: string, data?: any, config: RequestConfig = {}): Promise<T> {
    return this.request<T>(endpoint, {
      ...config,
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async delete<T>(endpoint: string, config: RequestConfig = {}): Promise<T> {
    return this.request<T>(endpoint, { ...config, method: 'DELETE' });
  }

  // Méthodes spécialisées pour gérer les cold starts
  async healthCheck(): Promise<boolean> {
    try {
      await this.get('/api/health', { timeout: 60000 }); // 1 minute pour cold start
      return true;
    } catch (error) {
      console.error('❌ Dr.MiMi API Health Check failed:', error);
      return false;
    }
  }

  async warmUpServer(): Promise<void> {
    console.log('🔥 Dr.MiMi API: Réchauffage du serveur...');
    try {
      await this.healthCheck();
      console.log('✅ Dr.MiMi API: Serveur réchauffé avec succès');
    } catch (error) {
      console.warn('⚠️ Dr.MiMi API: Réchauffage échoué, mais le serveur peut encore démarrer');
    }
  }

  // Annuler toutes les requêtes en cours
  cancelRequests(): void {
    if (this.abortController) {
      this.abortController.abort();
      this.abortController = null;
    }
  }

  // Obtenir l'état de l'API
  async getApiStatus(): Promise<{
    isHealthy: boolean;
    responseTime: number;
    endpoint: string;
  }> {
    const startTime = Date.now();
    try {
      await this.healthCheck();
      const responseTime = Date.now() - startTime;
      return {
        isHealthy: true,
        responseTime,
        endpoint: this.baseURL,
      };
    } catch (error) {
      const responseTime = Date.now() - startTime;
      return {
        isHealthy: false,
        responseTime,
        endpoint: this.baseURL,
      };
    }
  }
}

// Instance globale du client API
export const apiClient = new ApiClient(API_BASE_URL);

// Types pour les réponses Dr.MiMi
export interface Article {
  id: number;
  title: string;
  content: string;
  category: 'course' | 'news' | 'case' | 'summary';
  status: 'draft' | 'published' | 'archived';
  authorId: number;
  createdAt: string;
  updatedAt: string;
  slug: string;
  excerpt?: string;
  imageUrl?: string;
  tags?: string[];
}

export interface Quiz {
  id: number;
  title: string;
  description: string;
  questions: Question[];
  category: string;
  difficulty: 'easy' | 'medium' | 'hard';
  timeLimit?: number;
  createdAt: string;
  updatedAt: string;
}

export interface Question {
  id: number;
  questionText: string;
  options: string[];
  correctAnswer: number;
  explanation?: string;
  points: number;
}

export interface User {
  id: number;
  username: string;
  email?: string;
  role: 'owner' | 'admin' | 'editor' | 'viewer' | 'consultant';
  firstName?: string;
  lastName?: string;
  avatar?: string;
  createdAt: string;
  lastLogin?: string;
}

export interface Course {
  id: number;
  title: string;
  description: string;
  content: string;
  category: string;
  level: string;
  duration?: number;
  imageUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ClinicalCase {
  id: number;
  title: string;
  description: string;
  patientInfo: string;
  symptoms: string;
  diagnosis: string;
  treatment: string;
  category: string;
  difficulty: 'easy' | 'medium' | 'hard';
  createdAt: string;
  updatedAt: string;
}

// API spécialisées Dr.MiMi
export const articlesApi = {
  getAll: (category?: string) => 
    apiClient.get<Article[]>(`/api/articles${category ? `?category=${category}` : ''}`),
  
  getById: (id: number) => 
    apiClient.get<Article>(`/api/articles/${id}`),
  
  getBySlug: (slug: string) => 
    apiClient.get<Article>(`/api/articles/slug/${slug}`),
  
  create: (article: Partial<Article>) => 
    apiClient.post<Article>('/api/articles', article),
  
  update: (id: number, article: Partial<Article>) => 
    apiClient.put<Article>(`/api/articles/${id}`, article),
  
  delete: (id: number) => 
    apiClient.delete<void>(`/api/articles/${id}`),
};

export const newsApi = {
  getAll: () => apiClient.get<Article[]>('/api/news'),
  getById: (id: number) => apiClient.get<Article>(`/api/news/${id}`),
  getLatest: (limit = 5) => apiClient.get<Article[]>(`/api/news/latest?limit=${limit}`),
};

export const coursesApi = {
  getAll: () => apiClient.get<Course[]>('/api/courses'),
  getById: (id: number) => apiClient.get<Course>(`/api/courses/${id}`),
  getByCategory: (category: string) => apiClient.get<Course[]>(`/api/courses/category/${category}`),
  create: (course: Partial<Course>) => apiClient.post<Course>('/api/courses', course),
  update: (id: number, course: Partial<Course>) => apiClient.put<Course>(`/api/courses/${id}`, course),
  delete: (id: number) => apiClient.delete<void>(`/api/courses/${id}`),
};

export const quizzesApi = {
  getAll: () => apiClient.get<Quiz[]>('/api/quizzes'),
  getById: (id: number) => apiClient.get<Quiz>(`/api/quizzes/${id}`),
  create: (quiz: Partial<Quiz>) => apiClient.post<Quiz>('/api/quizzes', quiz),
  update: (id: number, quiz: Partial<Quiz>) => apiClient.put<Quiz>(`/api/quizzes/${id}`, quiz),
  delete: (id: number) => apiClient.delete<void>(`/api/quizzes/${id}`),
  submitAnswers: (quizId: number, answers: number[]) => 
    apiClient.post<{ score: number; correctAnswers: number[] }>(`/api/quizzes/${quizId}/submit`, { answers }),
};

export const casesApi = {
  getAll: () => apiClient.get<ClinicalCase[]>('/api/cases'),
  getById: (id: number) => apiClient.get<ClinicalCase>(`/api/cases/${id}`),
  getByCategory: (category: string) => apiClient.get<ClinicalCase[]>(`/api/cases/category/${category}`),
  create: (clinicalCase: Partial<ClinicalCase>) => apiClient.post<ClinicalCase>('/api/cases', clinicalCase),
  update: (id: number, clinicalCase: Partial<ClinicalCase>) => apiClient.put<ClinicalCase>(`/api/cases/${id}`, clinicalCase),
  delete: (id: number) => apiClient.delete<void>(`/api/cases/${id}`),
};

export const authApi = {
  login: (username: string, password: string) => 
    apiClient.post<{ user: User; token?: string }>('/api/auth/login', { username, password }),
  
  logout: () => 
    apiClient.post<void>('/api/auth/logout'),
  
  getStatus: () => 
    apiClient.get<{ user: User | null; authenticated: boolean }>('/api/auth/status'),
  
  changePassword: (currentPassword: string, newPassword: string) => 
    apiClient.post<void>('/api/auth/change-password', { currentPassword, newPassword }),
};

// Hook personnalisé pour l'état de chargement
export const useApi = () => {
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const execute = async <T>(apiCall: () => Promise<T>): Promise<T | null> => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await apiCall();
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur inconnue';
      setError(errorMessage);
      return null;
    } finally {
      setLoading(false);
    }
  };

  return { execute, loading, error };
};

// Utilitaires pour les erreurs Dr.MiMi
export const handleApiError = (error: Error): string => {
  if (error.message.includes('404')) {
    return 'Contenu non trouvé - Peut être en cours de chargement';
  }
  if (error.message.includes('401')) {
    return 'Non autorisé - Veuillez vous connecter à votre compte Dr.MiMi';
  }
  if (error.message.includes('403')) {
    return 'Accès refusé - Permissions insuffisantes';
  }
  if (error.message.includes('500')) {
    return 'Erreur serveur Dr.MiMi - Veuillez réessayer dans quelques instants';
  }
  if (error.message.includes('Timeout')) {
    return 'Serveur en cours de démarrage (cold start) - Veuillez patienter...';
  }
  if (error.message.includes('Network') || error.message.includes('fetch')) {
    return 'Problème de connexion - Vérifiez votre internet ou réessayez';
  }
  
  return error.message || 'Une erreur inattendue est survenue sur Dr.MiMi';
};

// Test de connexion et warm-up au démarrage de l'application
export const initializeDrMiMiApi = async (): Promise<{
  isReady: boolean;
  responseTime: number;
  message: string;
}> => {
  console.log('🩺 Initialisation Dr.MiMi API...');
  
  const startTime = Date.now();
  const isHealthy = await apiClient.healthCheck();
  const responseTime = Date.now() - startTime;
  
  if (isHealthy) {
    console.log(`✅ Dr.MiMi API prête (${responseTime}ms)`);
    return {
      isReady: true,
      responseTime,
      message: 'Dr.MiMi API connectée avec succès'
    };
  } else {
    console.warn(`⚠️ Dr.MiMi API non disponible (${responseTime}ms) - Retry automatique en cours...`);
    
    // Tentative de warm-up
    await apiClient.warmUpServer();
    
    return {
      isReady: false,
      responseTime,
      message: 'Dr.MiMi API en cours de démarrage - Patientez quelques instants'
    };
  }
};

// Export par défaut
export default apiClient;