// 🌐 CLIENT API ULTIMATE Dr.MiMi - Gestion complète des erreurs, cold starts et retry
import { useState, useEffect } from 'react';

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
  skipWarmup?: boolean;
}

class DrMiMiApiClient {
  private baseURL: string;
  private abortController: AbortController | null = null;
  private defaultTimeout = 45000; // 45s pour cold start Render
  private defaultRetries = 3;
  private isServerWarmedUp = false;
  private warmupPromise: Promise<void> | null = null;

  constructor(baseURL: string) {
    this.baseURL = baseURL;
    this.initializeApi();
  }

  private async initializeApi() {
    console.log('🩺 Dr.MiMi API: Initialisation...');
    try {
      await this.warmUpServer();
      this.isServerWarmedUp = true;
      console.log('✅ Dr.MiMi API: Serveur prêt !');
    } catch (error) {
      console.warn('⚠️ Dr.MiMi API: Initialisation partielle (cold start possible)');
    }
  }

  private async warmUpServer(): Promise<void> {
    if (this.warmupPromise) {
      return this.warmupPromise;
    }

    this.warmupPromise = (async () => {
      try {
        console.log('🔥 Dr.MiMi: Réchauffage du serveur...');

        // Tentative de réveil avec health check
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 60000); // 1 minute max

        const response = await fetch(`${this.baseURL}/api/warmup`, {
          method: 'GET',
          signal: controller.signal,
          headers: {
            'Accept': 'application/json',
            'User-Agent': 'Dr.MiMi-Frontend-Warmup/1.0'
          }
        });

        clearTimeout(timeoutId);

        if (response.ok) {
          console.log('✅ Dr.MiMi: Serveur réchauffé avec succès');
          this.isServerWarmedUp = true;
        } else {
          console.warn('⚠️ Dr.MiMi: Réchauffage partiel (serveur répond mais pas optimal)');
        }
      } catch (error) {
        if (error instanceof Error && error.name === 'AbortError') {
          console.warn('⏰ Dr.MiMi: Réchauffage timeout - serveur endormi');
        } else {
          console.warn('⚠️ Dr.MiMi: Échec du réchauffage:', error.message);
        }
      }
    })();

    return this.warmupPromise;
  }

  private async requestWithRetry<T>(
    endpoint: string,
    config: RequestConfig = {}
  ): Promise<T> {
    const {
      timeout = this.defaultTimeout,
      retries = this.defaultRetries,
      skipWarmup = false,
      ...options
    } = config;

    // Réchauffer le serveur si pas encore fait (sauf si skipé)
    if (!this.isServerWarmedUp && !skipWarmup) {
      try {
        await this.warmUpServer();
      } catch {
        console.log('🌊 Dr.MiMi: Tentative sans réchauffage...');
      }
    }

    // Annuler requête précédente
    if (this.abortController) {
      this.abortController.abort();
    }

    this.abortController = new AbortController();
    const url = `${this.baseURL}${endpoint}`;

    const defaultOptions: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'User-Agent': 'Dr.MiMi-Frontend/2.0',
        'X-Requested-With': 'XMLHttpRequest'
      },
      credentials: 'include',
      signal: this.abortController.signal,
    };

    const finalOptions = { ...defaultOptions, ...options };
    let lastError: Error;

    // Système de retry avec backoff exponentiel
    for (let attempt = 1; attempt <= retries; attempt++) {
      try {
        const method = finalOptions.method || 'GET';
        console.log(`🌐 Dr.MiMi API (${attempt}/${retries}): ${method} ${endpoint}`);

        // Promise de timeout
        const timeoutPromise = new Promise<never>((_, reject) => {
          setTimeout(() => {
            reject(new Error(`Timeout après ${timeout}ms - Serveur Dr.MiMi potentiellement endormi`));
          }, timeout);
        });

        // Requête réelle
        const fetchPromise = fetch(url, finalOptions);
        const response = await Promise.race([fetchPromise, timeoutPromise]);

        // Gérer les réponses d'erreur
        if (!response.ok) {
          let errorMessage = `HTTP ${response.status}: ${response.statusText}`;

          try {
            const errorText = await response.text();
            if (errorText) {
              const errorJson = JSON.parse(errorText);
              errorMessage = errorJson.message || errorJson.error || errorMessage;
            }
          } catch {
            // Pas JSON, garder le message HTTP
          }

          // Messages spéciaux pour les erreurs courantes
          if (response.status === 503) {
            errorMessage = 'Serveur Dr.MiMi en cours de démarrage - Veuillez patienter';
          } else if (response.status === 502) {
            errorMessage = 'Serveur Dr.MiMi temporairement indisponible';
          } else if (response.status === 401) {
            errorMessage = 'Authentification requise - Connectez-vous à Dr.MiMi';
          } else if (response.status === 403) {
            errorMessage = 'Accès refusé - Vérifiez vos permissions Dr.MiMi';
          }


          const isTimeoutError = error instanceof Error && error.message.includes('Timeout');
          const is503Error = error instanceof Error && error.message.includes('503');
          const isCorsError = error instanceof Error && error.message.includes('CORS');

          if (isTimeoutError || is503Error) {
            console.warn(`⏰ Dr.MiMi Cold Start (${attempt}/${retries}): ${endpoint} - Serveur se réveille...`);
          } else if (isCorsError) {
            console.error(`🚫 Dr.MiMi CORS Error (${attempt}/${retries}): ${endpoint}`);
          } else {
            console.warn(`❌ Dr.MiMi API Error (${attempt}/${retries}): ${endpoint}`, error.message);
          }

          if (attempt < retries) {
            // Backoff exponentiel plus long pour cold starts
            const baseDelay = isTimeoutError || is503Error ? 3000 : 1000;
            const delay = Math.min(baseDelay * Math.pow(2, attempt - 1), 15000);
            console.log(`⏳ Dr.MiMi Retry dans ${delay}ms...`);
            await new Promise(resolve => setTimeout(resolve, delay));

            // Si c'était un cold start, marquer le serveur comme non réchauffé
            if (isTimeoutError || is503Error) {
              this.isServerWarmedUp = false;
            }
          }
        }
      }

    // Si tous les retries ont échoué
    console.error(`💥 Dr.MiMi API: Échec définitif après ${retries} tentatives: ${endpoint}`);
      throw lastError!;
    }

  // Méthodes HTTP standard
  async get<T>(endpoint: string, config: RequestConfig = {}): Promise < T > {
      return this.requestWithRetry<T>(endpoint, { ...config, method: 'GET' });
    }

  async post<T>(endpoint: string, data ?: any, config: RequestConfig = {}): Promise < T > {
      return this.requestWithRetry<T>(endpoint, {
        ...config,
        method: 'POST',
        body: data ? JSON.stringify(data) : undefined,
      });
    }

  async put<T>(endpoint: string, data ?: any, config: RequestConfig = {}): Promise < T > {
      return this.requestWithRetry<T>(endpoint, {
        ...config,
        method: 'PUT',
        body: data ? JSON.stringify(data) : undefined,
      });
    }

  async delete <T>(endpoint: string, config: RequestConfig = {}): Promise < T > {
      return this.requestWithRetry<T>(endpoint, { ...config, method: 'DELETE' });
    }

  // Health check spécialisé
  async healthCheck(): Promise < boolean > {
      try {
        await this.get('/api/health', { timeout: 60000, skipWarmup: true });
        return true;
      } catch(error) {
        console.error('❌ Dr.MiMi Health Check failed:', error);
        return false;
      }
    }

  // État complet du serveur
  async getServerStatus(): Promise < {
      isHealthy: boolean;
      responseTime: number;
      endpoint: string;
      version?: string;
    } > {
      const startTime = Date.now();
      try {
        const healthData = await this.get<any>('/api/health', { timeout: 30000, skipWarmup: true });
        const responseTime = Date.now() - startTime;
        return {
          isHealthy: true,
          responseTime,
          endpoint: this.baseURL,
          version: healthData.version || 'unknown'
        };
      } catch(error) {
        const responseTime = Date.now() - startTime;
        return {
          isHealthy: false,
          responseTime,
          endpoint: this.baseURL,
        };
      }
    }

    // Annuler toutes les requêtes
    cancelAll(): void {
      if(this.abortController) {
      this.abortController.abort();
      this.abortController = null;
    }
  }
}

// Instance globale
export const apiClient = new DrMiMiApiClient(API_BASE_URL);

// Types Dr.MiMi
export interface Article {
  id: number;
  title: string;
  content: string;
  category: 'course' | 'news' | 'case' | 'summary';
  status: 'draft' | 'published' | 'archived';
  authorId?: number;
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

export interface ChatMessage {
  id?: number;
  message: string;
  response?: string;
  timestamp: string;
  userId?: number;
}

// APIs spécialisées Dr.MiMi avec gestion d'erreurs
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
};

export const quizzesApi = {
  getAll: () => apiClient.get<Quiz[]>('/api/quizzes'),
  getById: (id: number) => apiClient.get<Quiz>(`/api/quizzes/${id}`),
  create: (quiz: Partial<Quiz>) => apiClient.post<Quiz>('/api/quizzes', quiz),
  submitAnswers: (quizId: number, answers: number[]) =>
    apiClient.post<{ score: number; correctAnswers: number[]; totalQuestions: number }>(`/api/quizzes/${quizId}/submit`, { answers }),
};

export const casesApi = {
  getAll: () => apiClient.get<ClinicalCase[]>('/api/cases'),
  getById: (id: number) => apiClient.get<ClinicalCase>(`/api/cases/${id}`),
  getByCategory: (category: string) => apiClient.get<ClinicalCase[]>(`/api/cases/category/${category}`),
  create: (clinicalCase: Partial<ClinicalCase>) => apiClient.post<ClinicalCase>('/api/cases', clinicalCase),
};

export const chatApi = {
  sendMessage: (message: string) =>
    apiClient.post<{ response: string; timestamp: string }>('/api/chat', { message }, { timeout: 30000 }),

  getHistory: () =>
    apiClient.get<ChatMessage[]>('/api/chat/history'),
};

export const libraryApi = {
  getCategories: (section?: string) =>
    apiClient.get<any[]>(`/api/library/categories${section ? `?section=${section}` : ''}`),

  getItems: (params: { section?: string; page?: number; limit?: number } = {}) => {
    const query = new URLSearchParams();
    if (params.section) query.set('section', params.section);
    if (params.page) query.set('page', params.page.toString());
    if (params.limit) query.set('limit', params.limit.toString());
    return apiClient.get<any[]>(`/api/library/items?${query}`);
  },
};

export const authApi = {
  login: (username: string, password: string) =>
    apiClient.post<{ user: User; token?: string; success: boolean }>('/api/auth/login', { username, password }),

  logout: () =>
    apiClient.post<void>('/api/auth/logout'),

  getMe: () =>
    apiClient.get<{ user: User | null; authenticated: boolean }>('/api/auth/me'),

  changePassword: (currentPassword: string, newPassword: string) =>
    apiClient.post<{ success: boolean; message: string }>('/api/auth/change-password', { currentPassword, newPassword }),
};

export const adminApi = {
  login: (username: string, password: string) =>
    apiClient.post<{ user: User; success: boolean; role: string }>('/api/admin/login', { username, password }),

  checkAccess: () =>
    apiClient.get<{ hasAccess: boolean; user: User | null }>('/api/admin/check'),

  getUsers: () =>
    apiClient.get<User[]>('/api/admin/users'),

  getDashboardStats: () =>
    apiClient.get<any>('/api/admin/dashboard/stats'),
};

// Hook React pour appels API avec gestion d'état
export const useDrMiMiApi = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<any>(null);

  const execute = async <T>(apiCall: () => Promise<T>): Promise<T | null> => {
    setLoading(true);
    setError(null);
    setData(null);

    try {
      const result = await apiCall();
      setData(result);
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? handleApiError(err) : 'Erreur inconnue Dr.MiMi';
      setError(errorMessage);
      console.error('❌ Dr.MiMi API Hook Error:', errorMessage);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setLoading(false);
    setError(null);
    setData(null);
  };

  return { execute, loading, error, data, reset };
};

// Gestion des erreurs avec messages utilisateur
export const handleApiError = (error: Error): string => {
  const message = error.message.toLowerCase();

  if (message.includes('404')) {
    return 'Contenu non trouvé sur Dr.MiMi - Il est peut-être en cours de chargement';
  }
  if (message.includes('401')) {
    return 'Authentification requise - Veuillez vous connecter à Dr.MiMi';
  }
  if (message.includes('403')) {
    return 'Accès refusé - Vérifiez vos permissions sur Dr.MiMi';
  }
  if (message.includes('500')) {
    return 'Erreur serveur Dr.MiMi - Notre équipe a été notifiée';
  }
  if (message.includes('503')) {
    return 'Serveur Dr.MiMi en cours de démarrage - Veuillez patienter 30 secondes';
  }
  if (message.includes('502')) {
    return 'Serveur Dr.MiMi temporairement indisponible - Réessayez dans un instant';
  }
  if (message.includes('timeout')) {
    return 'Le serveur Dr.MiMi met du temps à répondre (démarrage) - Patientez...';
  }
  if (message.includes('cors')) {
    return 'Problème de sécurité CORS - Rechargez la page Dr.MiMi';
  }
  if (message.includes('network') || message.includes('fetch')) {
    return 'Problème de connexion - Vérifiez votre internet';
  }

  return error.message || 'Une erreur inattendue est survenue sur Dr.MiMi';
};

// Initialisation de l'API au démarrage
export const initializeDrMiMi = async (): Promise<{
  isReady: boolean;
  responseTime: number;
  message: string;
  version?: string;
}> => {
  console.log('🩺 Initialisation complète de Dr.MiMi...');

  try {
    const status = await apiClient.getServerStatus();

    if (status.isHealthy) {
      console.log(`✅ Dr.MiMi API opérationnelle (${status.responseTime}ms)`);
      return {
        isReady: true,
        responseTime: status.responseTime,
        message: '🩺 Dr.MiMi est prêt pour l\'apprentissage médical !',
        version: status.version
      };
    } else {
      console.warn(`⚠️ Dr.MiMi API non disponible (${status.responseTime}ms)`);
      return {
        isReady: false,
        responseTime: status.responseTime,
        message: 'Dr.MiMi se réveille... Merci de patienter quelques instants 💪'
      };
    }
  } catch (error) {
    console.error('❌ Dr.MiMi: Échec de l\'initialisation:', error);
    return {
      isReady: false,
      responseTime: 0,
      message: 'Dr.MiMi rencontre des difficultés - Réessayez dans un moment'
    };
  }
};

// Export par défaut
export default apiClient;