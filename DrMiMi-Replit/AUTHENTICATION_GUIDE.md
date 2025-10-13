# 🔐 Guide d'Authentification Utilisateur - Dr.MiMi

## 📋 Vue d'Ensemble

Dr.MiMi dispose maintenant d'un **système d'authentification complet** pour les étudiants en médecine, séparé du système admin/owner existant.

### ✅ Fonctionnalités Implémentées

- ✅ **Inscription** : Formulaire complet avec validation de mot de passe forte
- ✅ **Connexion** : Authentification sécurisée avec sessions Express
- ✅ **Déconnexion** : Destruction propre des sessions
- ✅ **Profil utilisateur** : Affichage des données personnelles et statistiques
- ✅ **Protection contre Session Fixation** : Régénération de session à chaque login
- ✅ **Design multilingue** : Support FR/EN/AR avec RTL
- ✅ **Validation robuste** : Côté client et serveur

---

## 🚀 Utilisation

### 1. Inscription d'un Nouvel Utilisateur

**URL** : `/register`

**Formulaire** :
- Prénom et Nom
- Adresse email (unique)
- Année d'étude (Y1, Y2, Y3, Y4, Y5, Y6, Intern)
- Mot de passe (8+ caractères, majuscule, minuscule, chiffre, caractère spécial)
- Confirmation du mot de passe
- Acceptation des conditions d'utilisation

**Validation du mot de passe** :
- ✅ Minimum 8 caractères
- ✅ Au moins une lettre majuscule (A-Z)
- ✅ Au moins une lettre minuscule (a-z)
- ✅ Au moins un chiffre (0-9)
- ✅ Au moins un caractère spécial (!@#$%^&*...)

**Après inscription** :
- Message de succès
- Redirection automatique vers `/login`
- L'utilisateur doit se connecter avec ses identifiants

---

### 2. Connexion

**URL** : `/login`

**Formulaire** :
- Email
- Mot de passe
- Option "Se souvenir de moi"
- Lien "Mot de passe oublié ?" (à implémenter)

**Après connexion réussie** :
- Session créée avec cookie sécurisé
- Régénération de l'ID de session (protection contre session fixation)
- Redirection automatique vers `/profile`

---

### 3. Page Profil

**URL** : `/profile`

**Accès** : Réservé aux utilisateurs authentifiés

**Contenu affiché** :
- Nom complet (Prénom + Nom)
- Email
- Année d'étude (Y1-Y6, Intern)
- Université
- Date d'inscription
- Statistiques d'étude (à enrichir)
- Achievements (succès)
- Activité récente

**Si non authentifié** :
- Message "Veuillez vous connecter"
- Boutons "Se Connecter" et "S'inscrire"

---

### 4. Déconnexion

**Méthode** : Appeler `logout()` depuis le hook `useAuth`

```typescript
const { logout } = useAuth();

// Déconnecter l'utilisateur
await logout();
```

**Effet** :
- Destruction de la session côté serveur
- Suppression du cookie de session
- Redirection vers page d'accueil

---

## 🔌 API Endpoints

### POST `/api/auth/register`

**Créer un nouveau compte utilisateur**

**Request Body** :
```json
{
  "firstName": "Merieme",
  "lastName": "BENNAMANE",
  "email": "merieme@example.com",
  "password": "SecurePass123!",
  "yearOfStudy": "Y3",
  "locale": "fr"
}
```

**Response (201 Created)** :
```json
{
  "success": true,
  "message": "Registration successful",
  "user": {
    "id": "uuid",
    "firstName": "Merieme",
    "lastName": "BENNAMANE",
    "email": "merieme@example.com",
    "yearOfStudy": "Y3",
    "role": "viewer",
    "locale": "fr",
    "createdAt": "2025-10-09T12:00:00Z"
  }
}
```

**Erreurs possibles** :
- `400` : Validation échouée (email invalide, mot de passe faible...)
- `400` : Email déjà enregistré
- `500` : Erreur serveur

---

### POST `/api/auth/login`

**Connexion avec email et mot de passe**

**Request Body** :
```json
{
  "email": "merieme@example.com",
  "password": "SecurePass123!"
}
```

**Response (200 OK)** :
```json
{
  "success": true,
  "message": "Login successful",
  "user": {
    "id": "uuid",
    "firstName": "Merieme",
    "lastName": "BENNAMANE",
    "email": "merieme@example.com",
    "yearOfStudy": "Y3",
    "role": "viewer",
    "lastLoginAt": "2025-10-09T14:30:00Z"
  }
}
```

**Erreurs possibles** :
- `400` : Email ou mot de passe manquant
- `401` : Identifiants invalides
- `403` : Compte suspendu (blacklisté)
- `500` : Erreur serveur

**Sécurité** :
- ✅ Régénération de session après login (protection contre session fixation)
- ✅ Vérification du statut blacklist
- ✅ Mise à jour de `lastLoginAt`
- ✅ Mot de passe jamais renvoyé dans la réponse

---

### GET `/api/auth/me`

**Récupérer les informations de l'utilisateur connecté**

**Authentification requise** : Session active

**Response (200 OK)** :
```json
{
  "success": true,
  "user": {
    "id": "uuid",
    "firstName": "Merieme",
    "lastName": "BENNAMANE",
    "email": "merieme@example.com",
    "yearOfStudy": "Y3",
    "role": "viewer",
    "locale": "fr"
  }
}
```

**Erreurs possibles** :
- `401` : Non authentifié (pas de session)
- `404` : Utilisateur introuvable
- `500` : Erreur serveur

---

### POST `/api/auth/logout`

**Déconnecter l'utilisateur**

**Response (200 OK)** :
```json
{
  "success": true,
  "message": "Logout successful"
}
```

**Erreurs possibles** :
- `500` : Erreur lors de la destruction de session

---

## 🛡️ Sécurité

### Protections Implémentées

1. **Hachage des mots de passe** : bcrypt avec salt automatique
2. **Validation côté serveur** : Toutes les entrées sont validées
3. **Protection Session Fixation** : Régénération d'ID de session à chaque login
4. **Vérification blacklist** : Les comptes suspendus ne peuvent pas se connecter
5. **Sanitization** : Les mots de passe ne sont JAMAIS renvoyés dans les réponses
6. **Sessions sécurisées** : Utilisation de Express Session avec cookies httpOnly

### Validation du Mot de Passe

**Règles strictes** :
- Minimum 8 caractères
- Au moins 1 majuscule
- Au moins 1 minuscule
- Au moins 1 chiffre
- Au moins 1 caractère spécial

**Indicateurs visuels** : La page d'inscription affiche en temps réel quelles règles sont satisfaites.

---

## 💻 Utilisation du Hook useAuth

Le hook `useAuth` simplifie l'authentification dans les composants React.

### Import
```typescript
import { useAuth } from '../hooks/useAuth';
```

### Utilisation
```typescript
const { user, isAuthenticated, isLoading, login, logout, refetch } = useAuth();

// Vérifier si l'utilisateur est connecté
if (isAuthenticated) {
  console.log('User:', user);
}

// Se connecter après un POST /api/auth/login réussi
await login(userData);

// Se déconnecter
await logout();

// Rafraîchir les données utilisateur
refetch();
```

### Propriétés disponibles

- `user` : Objet utilisateur (ou `null` si non connecté)
- `isAuthenticated` : `true` si connecté, `false` sinon
- `isLoading` : `true` pendant le chargement
- `error` : Erreur éventuelle
- `login(userData)` : Met à jour les données utilisateur après login
- `logout()` : Déconnecte l'utilisateur
- `refetch()` : Rafraîchit les données depuis le serveur

---

## 🧪 Tests Manuels

### Test Complet du Flux

1. **Inscription**
   - Aller sur `/register`
   - Remplir le formulaire avec des données valides
   - Vérifier les indicateurs de force du mot de passe
   - Soumettre
   - ✅ Vérifier la redirection vers `/login`

2. **Connexion**
   - Aller sur `/login`
   - Entrer email et mot de passe créés
   - Soumettre
   - ✅ Vérifier la redirection vers `/profile`
   - ✅ Vérifier que le nom et email s'affichent correctement

3. **Navigation**
   - ✅ Vérifier que `/login` et `/register` bypassent le StudyLevelSelector
   - ✅ Vérifier que le header reste visible
   - ✅ Vérifier que les liens fonctionnent

4. **Profil**
   - ✅ Vérifier l'affichage du nom complet
   - ✅ Vérifier l'affichage de l'email
   - ✅ Vérifier l'année d'étude

5. **Déconnexion**
   - Cliquer sur le bouton de déconnexion (à ajouter dans le header)
   - ✅ Vérifier la redirection vers la page d'accueil
   - ✅ Vérifier que `/profile` affiche "Veuillez vous connecter"

---

## 📊 Structure de la Base de Données

### Table `users`

La table existe déjà avec tous les champs nécessaires :

```typescript
{
  id: varchar (UUID)
  email: varchar (unique)
  username: varchar
  password: varchar (bcrypt hash)
  firstName: varchar
  lastName: varchar
  role: varchar (owner/admin/editor/viewer/consultant)
  yearOfStudy: varchar (Y1/Y2/Y3/Y4/Y5/Y6/Intern)
  locale: varchar (fr/en/ar)
  isBlacklisted: boolean
  blacklistReason: varchar
  createdAt: timestamp
  updatedAt: timestamp
  lastLoginAt: timestamp
}
```

**Migrations** : Utiliser `npm run db:push` ou `npm run db:push --force`

---

## 🔄 Différences avec Admin/Owner Auth

| Feature | User Auth | Admin/Owner Auth |
|---------|-----------|------------------|
| Routes | `/login`, `/register` | `/admin/login`, `/owner/login` |
| Endpoints | `/api/auth/*` | `/api/admin/auth/*` |
| Technologie | Express Sessions | Replit Auth |
| Rôle par défaut | `viewer` | `admin` ou `owner` |
| Page après login | `/profile` | `/admin` ou `/owner/dashboard` |

**Séparation claire** : Les deux systèmes coexistent sans interférence.

---

## 🚧 Améliorations Futures

### Priorité Haute
- [ ] **Forgot Password** : Réinitialisation par email
- [ ] **Email Verification** : Confirmer l'email après inscription
- [ ] **Rate Limiting** : Limiter les tentatives de login
- [ ] **2FA** : Authentification à deux facteurs

### Priorité Moyenne
- [ ] **OAuth** : Connexion via Google, Facebook, GitHub
- [ ] **Password Strength Meter** : Indicateur visuel amélioré
- [ ] **Account Settings** : Modifier email, mot de passe, préférences
- [ ] **Session Management** : Voir/révoquer sessions actives

### Priorité Basse
- [ ] **Avatar Upload** : Photo de profil
- [ ] **Bio personnalisée** : Description utilisateur
- [ ] **Achievements** : Système de badges dynamique
- [ ] **Leaderboard** : Classement national

---

## 🐛 Débogage

### Problème : "Not authenticated" sur `/api/auth/me`

**Cause** : Pas de session active

**Solution** :
1. Vérifier que l'utilisateur s'est connecté via `/api/auth/login`
2. Vérifier que les cookies sont acceptés dans le navigateur
3. Vérifier que `credentials: 'include'` est présent dans les requêtes fetch

### Problème : Session perdue après refresh

**Cause** : Cookie de session non persistant

**Solution** :
1. Vérifier la configuration Express Session dans `server/index.ts`
2. S'assurer que `cookie.maxAge` est défini
3. Utiliser "Se souvenir de moi" lors de la connexion

### Problème : Erreur 500 sur login

**Cause possible** : Session middleware non configuré

**Solution** :
1. Vérifier que Express Session est configuré dans `server/index.ts`
2. Vérifier les logs serveur pour plus de détails
3. S'assurer que `req.session` existe

---

## 📞 Support

Pour toute question ou problème :
- Vérifier les logs du serveur backend (port 3001)
- Vérifier la console browser pour les erreurs frontend
- Consulter le code dans `server/routes/auth.ts` et `src/pages/LoginPage.tsx`

---

## ✅ Checklist de Déploiement

Avant de déployer en production :

- [ ] Configurer `SESSION_SECRET` dans les variables d'environnement
- [ ] Activer HTTPS (obligatoire pour cookies sécurisés)
- [ ] Configurer CORS correctement pour le domaine de production
- [ ] Activer rate limiting sur les endpoints d'authentification
- [ ] Configurer les emails de vérification (si implémenté)
- [ ] Tester le flux complet sur l'environnement de production
- [ ] Monitorer les logs d'authentification
- [ ] Configurer les alertes pour tentatives de login suspectes

---

**Dernière mise à jour** : 9 octobre 2025  
**Version** : 1.0.0  
**Auteur** : Replit Agent pour Merieme BENNAMANE
