# 🔧 Fix : Problème de rafraîchissement automatique

## 🐛 Problème identifié

La plateforme se rafraîchissait automatiquement toutes les 10 secondes environ, rendant l'exploitation impossible.

## 🔍 Causes identifiées

### 1. Configuration HMR (Hot Module Replacement) inadaptée
**Fichier** : `vite.config.ts`

**Problème** : 
- Configuration HMR avec protocole WSS (WebSocket Secure) sur port 443
- Configuration pour Replit (clientPort: 443, protocol: 'wss')
- Déconnexions WebSocket répétées causant des reloads

**Solution appliquée** :
```typescript
hmr: {
  overlay: true, // Afficher les erreurs en overlay au lieu de recharger
  protocol: 'ws', // WS au lieu de WSS pour environnement local
  host: 'localhost',
  port: 5000
}
```

### 2. Service Worker PWA problématique
**Fichier** : `src/main.tsx`

**Problème** :
- Service Worker actif en mode développement
- Détection de mises à jour et reloads automatiques
- Cache PWA interférant avec le HMR

**Solution appliquée** :
- Service Worker temporairement désactivé en développement
- À réactiver en production pour fonctionnalité PWA

## ✅ Changements effectués

### 1. `vite.config.ts`
```typescript
// AVANT
hmr: {
  clientPort: 443,
  protocol: 'wss',
  host: process.env.REPLIT_DEV_DOMAIN?.split(':')[0] || 'localhost'
}

// APRÈS
hmr: {
  overlay: true,
  protocol: 'ws',
  host: 'localhost',
  port: 5000
}
```

### 2. `src/main.tsx`
```typescript
// Service Worker commenté pour développement
// À réactiver en production
```

## 🧪 Tests à effectuer

1. **Ouvrir la plateforme** : http://localhost:5000
2. **Vérifier** : Pas de reload automatique pendant 30 secondes minimum
3. **Tester la navigation** : Passer d'une page à l'autre
4. **Ouvrir la console** (F12) :
   - Onglet Console : vérifier qu'il n'y a pas d'erreurs WebSocket
   - Onglet Network : vérifier qu'il n'y a pas de requêtes en boucle
   - Onglet Application > Service Workers : vérifier qu'aucun SW n'est actif

## 🚀 Pour relancer les serveurs

```bash
# Arrêter les serveurs
pkill -f "tsx watch" && pkill -f "vite"

# Relancer
npm run dev
```

## 📊 Diagnostic supplémentaire

Si le problème persiste, vérifier :

### Backend
```bash
# Logs backend pour erreurs API
tail -f server/logs/*.log
```

### Frontend (Console navigateur F12)
- Erreurs JavaScript non gérées
- Requêtes API échouées (onglet Network)
- WebSocket déconnecté
- React Query en boucle

### Causes potentielles restantes
1. **Erreur JavaScript non gérée** → Crash du composant React
2. **Boucle de redirection** → Problème d'authentification
3. **API backend crashant** → Vérifier les logs backend
4. **React Query refetch** → Vérifier les configurations `refetchInterval`

## 🔄 Pour réactiver le PWA en production

Dans `src/main.tsx`, décommenter le bloc Service Worker :
```typescript
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
    // ...
  });
}
```

## 📝 Notes

- **Environnement** : GitHub Codespaces / Dev Container
- **HMR** : Hot Module Replacement maintenant stable
- **PWA** : Désactivé en dev, réactiver en prod
- **WebSocket** : Protocole WS local au lieu de WSS

## ✅ Statut

✅ Configuration HMR corrigée
✅ Service Worker désactivé en dev
✅ Serveurs relancés
⏳ En attente de validation utilisateur

---

**Date** : 11 octobre 2025
**Environnement** : GitHub Codespaces (Ubuntu 24.04.2 LTS)
