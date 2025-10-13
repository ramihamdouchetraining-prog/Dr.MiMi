// Authentication hook for Dr.MiMi platform
import { useQuery, useQueryClient } from "@tanstack/react-query";

export function useAuth() {
  const queryClient = useQueryClient();
  
  const { data: user, isLoading, error } = useQuery({
    queryKey: ["/api/auth/me"],
    queryFn: async () => {
      const response = await fetch("/api/auth/me", {
        credentials: 'include'
      });
      if (!response.ok) {
        if (response.status === 401) {
          return null; // Not authenticated
        }
        throw new Error("Failed to fetch user");
      }
      const data = await response.json();
      return data.user || null;
    },
    retry: false,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Login function to update user data after successful login
  const login = async (userData: any) => {
    queryClient.setQueryData(["/api/auth/me"], userData);
  };

  // Logout function
  const logout = async () => {
    try {
      // Essayer de déconnecter via l'auth classique
      const classicLogoutResponse = await fetch("/api/auth/logout", {
        method: 'POST',
        credentials: 'include'
      });

      // Essayer aussi de déconnecter via Replit Auth (OAuth)
      try {
        await fetch("/api/logout", {
          credentials: 'include'
        });
      } catch (oauthError) {
        // OAuth logout optionnel
        console.log("OAuth logout not applicable");
      }

      // Nettoyer le cache local
      queryClient.setQueryData(["/api/auth/me"], null);
      queryClient.invalidateQueries({ queryKey: ["/api/auth/me"] });
      
      // Préserver les préférences utilisateur (thème, langue)
      const theme = localStorage.getItem('theme');
      const language = localStorage.getItem('i18nextLng');
      
      // Nettoyer le localStorage et sessionStorage
      localStorage.clear();
      sessionStorage.clear();
      
      // Restaurer les préférences
      if (theme) localStorage.setItem('theme', theme);
      if (language) localStorage.setItem('i18nextLng', language);
      
      // Rediriger vers la page d'accueil après déconnexion
      window.location.href = '/';
    } catch (error) {
      console.error("Logout error:", error);
      // Même en cas d'erreur, nettoyer et rediriger
      localStorage.clear();
      sessionStorage.clear();
      queryClient.clear();
      window.location.href = '/';
    }
  };

  // Refresh user data
  const refetch = () => {
    queryClient.invalidateQueries({ queryKey: ["/api/auth/me"] });
  };

  return {
    user,
    isLoading,
    isAuthenticated: !!user,
    error,
    login,
    logout,
    refetch
  };
}
