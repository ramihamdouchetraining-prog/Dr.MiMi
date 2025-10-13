# 🩺 Dr.MiMi - Plateforme d'Éducation Médicale

![Dr.MiMi Logo](resources/icon-only.png)

**Plateforme éducative complète pour étudiants en médecine francophones** avec cours, quiz, cas cliniques, CMS moderne et système RBAC professionnel.

## ✨ Fonctionnalités

### 🎓 Éducation Médicale
- **Cours structurés** : 18+ cours médicaux organisés par année (PACES, DFGSM, DFASM)
- **Quiz interactifs** : 5+ quiz avec correction immédiate
- **Cas cliniques** : 4+ cas pratiques avec diagnostic guidé
- **Résumés** : 7+ fiches de révision concises

### 📝 CMS Moderne
- **Éditeur TipTap** : 22 extensions, slash commands (/image, /video, /quote...)
- **Blocs riches** : Texte, média, citation, liste, tableau, code, paywall
- **Templates** : Cours, Cas clinique, Fiche de révision
- **SEO intégré** : Meta tags, slug, prévisualisation SERP
- **Versioning** : Historique complet des articles

### 🌐 Multilingue (i18n)
- **3 langues** : Français (principal), Anglais, Arabe
- **Support RTL** : Interface complète en arabe
- **Traductions complètes** : 100% des contenus traduits

### 🔐 Système RBAC Professionnel
- **5 rôles hiérarchiques** :
  - **Owner** : Contrôle total, gestion admins, analytics
  - **Admin** : Gestion contenu/utilisateurs, support
  - **Editor** : Création/édition contenu
  - **Viewer** : Lecture contenu public et acheté
  - **Consultant** : Gestion consultations

### 📱 PWA (Progressive Web App)
- **Offline-first** : Fonctionne sans connexion Internet
- **Service Worker** : Cache intelligent des ressources
- **Installable** : Ajout à l'écran d'accueil (Android/iOS)
- **Notifications Push** : Support des notifications (à venir)
- **Responsive** : Compatible tous smartphones

### 🎨 Design
- **Thème Dual** : Mode clair/sombre avec persistance
- **Animations fluides** : Framer Motion, transitions 1s cubic-bezier
- **15+ Avatars Dr. Mimi** : Poses variées (réflexion, célébration, enseignement...)
- **Couleurs de marque** :
  - Primary (Teal) : `#0FA3B1`
  - Secondary (Blue) : `#1363DF`
  - Accent (Amber) : `#F59E0B`

### 💰 Monétisation
- **Hybride** : Contenu gratuit + premium
- **Paiements Stripe** : Support EUR (production)
- **DZD offline** : Validation manuelle pour l'Algérie
- **Système de dons** : Soutien au projet

## 🚀 Installation

### Prérequis
- Node.js 18+ ou 20+
- PostgreSQL 14+ (ou Replit Database)
- npm ou yarn

### 1. Cloner le projet
```bash
git clone https://github.com/votre-username/dr-mimi.git
cd dr-mimi
```

### 2. Installer les dépendances
```bash
npm install
```

### 3. Configuration de la base de données
```bash
# Créer la base de données PostgreSQL
# Puis configurer DATABASE_URL dans .env

# Pousser le schéma
npm run db:push
```

### 4. Variables d'environnement
Créer un fichier `.env` :
```env
DATABASE_URL=postgresql://user:password@localhost:5432/drmimi
PGHOST=localhost
PGPORT=5432
PGUSER=your_user
PGPASSWORD=your_password
PGDATABASE=drmimi
SESSION_SECRET=your-secret-key-here-min-32-chars
OWNER_PASSWORD=your-secure-owner-password
ADMIN_PASSWORD=your-secure-admin-password
```

**⚠️ IMPORTANT** : 
- `OWNER_PASSWORD` et `ADMIN_PASSWORD` sont **obligatoires** pour la sécurité
- Utilisez des mots de passe forts (min. 12 caractères)
- Ne commitez JAMAIS le fichier `.env` sur Git

### 5. Lancer en développement
```bash
npm run dev
```

L'application sera disponible sur `http://localhost:5000`

## 📦 Build & Déploiement

### Build de production
```bash
npm run build
```

### Prévisualiser la build
```bash
npm run preview
```

### Déploiement sur Replit
Le projet est optimisé pour Replit :
- Configuration automatique de la base de données
- Variables d'environnement intégrées
- Deploy en un clic

## 🛠️ Stack Technique

### Frontend
- **React 18** : Bibliothèque UI
- **TypeScript** : Typage statique
- **Vite** : Build tool moderne
- **TailwindCSS** : Styling utility-first
- **Framer Motion** : Animations
- **React Router v6** : Routing
- **TipTap v2** : Éditeur WYSIWYG
- **i18next** : Internationalisation

### Backend
- **Express 5** : Framework Node.js
- **PostgreSQL** : Base de données
- **Drizzle ORM** : ORM TypeScript-first
- **Passport** : Authentification
- **Express Session** : Gestion sessions
- **Bcrypt** : Hachage mots de passe

### PWA
- **Service Worker** : Cache offline-first
- **Web Manifest** : Métadonnées PWA
- **Workbox** : Stratégies de cache

### Dev Tools
- **ESLint** : Linting
- **Playwright** : Tests E2E
- **Drizzle Kit** : Migrations DB
- **tsx** : Exécution TypeScript

## 📁 Structure du Projet

```
dr-mimi/
├── src/                      # Code source frontend
│   ├── components/          # Composants React
│   ├── pages/              # Pages de l'application
│   ├── contexts/           # Contextes React
│   ├── lib/                # Utilitaires
│   └── i18n/               # Traductions
├── server/                  # Code backend
│   ├── index.ts            # Point d'entrée serveur
│   ├── storage.ts          # Couche données
│   └── auth-admin.ts       # Authentification admin
├── shared/                  # Code partagé
│   └── schema.ts           # Schéma Drizzle
├── public/                  # Fichiers statiques
│   ├── manifest.webmanifest # Manifest PWA
│   ├── sw.js               # Service Worker
│   └── icons/              # Icônes PWA
├── resources/               # Ressources design
│   ├── icon-only.png       # Icône principale
│   └── splash-logo.png     # Logo splash
├── tests/                   # Tests Playwright
├── package.json            # Dépendances
├── vite.config.ts          # Configuration Vite
├── tailwind.config.js      # Configuration Tailwind
└── tsconfig.json           # Configuration TypeScript
```

## 🧪 Tests

### Tests E2E avec Playwright
```bash
# Exécuter les tests
npm run test

# Mode UI
npm run test:ui

# Mode debug
npm run test:debug
```

## 🗄️ Base de Données

### Migrations
```bash
# Générer une migration
npm run db:generate

# Pousser le schéma (recommandé)
npm run db:push

# Studio Drizzle (interface visuelle)
npm run db:studio
```

### Schéma Principal
- `users` : Utilisateurs et authentification
- `articles` : Contenus (cours, cas, résumés)
- `quizzes` : Quiz et questions
- `user_progress` : Progression des étudiants
- `payments` : Transactions et achats
- `consultations` : Rendez-vous consultants

## 👤 Accès Admin

### Connexion Owner
Le compte Owner est créé automatiquement au premier démarrage :
- **URL** : `/admin/login`
- **Username par défaut** : `MiMiBEN`
- **Mot de passe initial** : Défini lors du seed (voir `server/index.ts`)
- **⚠️ IMPORTANT** : Changez le mot de passe immédiatement après la première connexion

### Dashboard Owner
Après connexion :
- Analytics avancés
- Gestion des utilisateurs
- Approbation des contenus
- Personnalisation du site
- Support utilisateurs

### Sécurité
- Le mot de passe est hashé avec bcrypt
- Changement de mot de passe forcé au premier login
- Sessions sécurisées avec express-session
- Protection CSRF recommandée (à implémenter)

## 🌍 Internationalisation

### Langues Supportées
- **Français** (fr) : Langue principale
- **Anglais** (en) : Traduction complète
- **Arabe** (ar) : RTL + traduction complète

### Ajouter une Traduction
1. Ajouter les clés dans `public/locales/{lang}/translation.json`
2. Utiliser `useTranslation()` dans les composants
3. Tester avec le sélecteur de langue

## 🎨 Personnalisation

### Couleurs de Marque
Modifier dans `tailwind.config.js` :
```js
colors: {
  primary: '#0FA3B1',    // Teal
  secondary: '#1363DF',  // Blue
  accent: '#F59E0B',     // Amber
  neutral: '#0B132B',    // Dark Blue
}
```

### Avatars Dr. Mimi
15 poses disponibles dans `src/components/AvatarDrMimi.tsx` :
- `greeting`, `reading`, `stethoscope`, `medicine`, `idea`
- `pointing`, `writing`, `thinking`, `smiling`, `laptop`
- `pondering`, `celebration`, `teaching`, `encouragement`, `questioning`

## 📄 Scripts NPM

| Commande | Description |
|----------|-------------|
| `npm run dev` | Lancer en développement |
| `npm run build` | Build de production |
| `npm run preview` | Prévisualiser la build |
| `npm run lint` | Linter le code |
| `npm run test` | Exécuter les tests |
| `npm run db:push` | Synchroniser le schéma DB |
| `npm run db:studio` | Interface DB visuelle |

## 📝 Licence

Ce projet est la propriété de **Merieme BENNAMANE**, étudiante en 3ème année de médecine à Boumerdès, Algérie.

## 👩‍⚕️ À Propos

**Dr.MiMi** a été créé par Merieme BENNAMANE pour aider les étudiants en médecine francophones dans leur parcours éducatif. La plateforme combine pédagogie moderne et technologie pour offrir une expérience d'apprentissage optimale.

### Contact
- **Propriétaire** : Merieme BENNAMANE
- **Localisation** : Bordj-Menaïel, Boumerdès, Algérie
- **Support** : القضية الفلسطينية 🇵🇸

---

**🎉 Bon apprentissage avec Dr.MiMi !**
