# 🚀 Guide de Déploiement - MediMimi en Production

## 🎯 Architecture de déploiement

```
Frontend (Netlify)  ←→  Backend (Render)  ←→  Database (Neon PostgreSQL)
```

## 📋 Prérequis

- ✅ Compte GitHub (déjà configuré)
- ✅ Compte Netlify (déjà utilisé)
- ⏳ Compte Render (gratuit) - à créer
- ✅ Base de données Neon (déjà configurée)

## 🔧 Étape 1 : Déployer le Backend sur Render

### 1.1 Créer un compte Render

1. Aller sur https://render.com
2. S'inscrire avec GitHub
3. Autoriser l'accès au repo `DrMiMi-Replit`

### 1.2 Créer un nouveau Web Service

1. Cliquer sur **"New +"** → **"Web Service"**
2. Sélectionner le repo **`DrMiMi-Replit`**
3. Configurer :
   - **Name** : `medimimi-backend`
   - **Region** : `Frankfurt (EU Central)` (proche de tes utilisateurs)
   - **Branch** : `main`
   - **Root Directory** : (laisser vide)
   - **Runtime** : `Node`
   - **Build Command** : `npm install && npm run build:backend`
   - **Start Command** : `node dist/server/index.js`
   - **Instance Type** : `Free`

### 1.3 Configurer les variables d'environnement

Dans l'onglet **Environment** de Render, ajouter :

```env
NODE_ENV=production
PORT=3001
DATABASE_URL=<copier depuis ton .env local>
SESSION_SECRET=<copier depuis ton .env local>
OWNER_PASSWORD_HASH=<copier depuis ton .env local>
ADMIN_PASSWORD_HASH=<copier depuis ton .env local>
OPENAI_API_KEY=<copier depuis ton .env local>
```

**Important** : Copie les valeurs exactes depuis ton fichier `.env` local.

### 1.4 Déployer

1. Cliquer sur **"Create Web Service"**
2. Attendre le déploiement (5-10 minutes)
3. Noter l'URL du backend : `https://medimimi-backend.onrender.com`

## 🌐 Étape 2 : Configurer le Frontend Netlify

### 2.1 Configurer la variable d'environnement

1. Aller sur ton dashboard Netlify
2. Sélectionner ton site MediMimi
3. Aller dans **Site settings** → **Environment variables**
4. Ajouter la variable :
   - **Key** : `VITE_API_URL`
   - **Value** : `https://medimimi-backend.onrender.com`

### 2.2 Modifier le code frontend

Nous devons configurer Vite pour utiliser l'URL du backend en production.

**Fichier déjà préparé** : `vite.config.ts` utilise le proxy seulement en développement.

### 2.3 Créer un fichier d'environnement

Créer `.env.production` à la racine :

```env
VITE_API_URL=https://medimimi-backend.onrender.com
```

### 2.4 Redéployer sur Netlify

```bash
# Commit et push les changements
git add .
git commit -m "🚀 Production: Configuration backend Render"
git push origin main
```

Netlify redéploiera automatiquement.

## 🔍 Étape 3 : Vérifier le déploiement

### 3.1 Vérifier le backend (Render)

Ouvrir dans le navigateur :
```
https://medimimi-backend.onrender.com/api/health
```

Doit afficher :
```json
{
  "status": "ok",
  "timestamp": "2025-10-11T15:30:00.000Z"
}
```

### 3.2 Vérifier le frontend (Netlify)

1. Ouvrir ton site Netlify
2. Ouvrir la console (F12) → Onglet Network
3. Essayer de te connecter en Owner/Admin
4. Vérifier que les requêtes API pointent vers `https://medimimi-backend.onrender.com`

### 3.3 Tester la connexion

**Owner** :
- Email : `dr.mimi.ben@gmail.com`
- Mot de passe : (celui dans ton `.env` local)

**Admin** :
- Username : (celui dans ton `.env` local)
- Mot de passe : (celui dans ton `.env` local)

## 🐛 Résolution des problèmes courants

### "Failed to fetch" / "Erreur serveur"

**Cause** : Frontend ne peut pas joindre le backend

**Solutions** :
1. Vérifier que le backend Render est déployé : logs dans Render Dashboard
2. Vérifier l'URL du backend dans les variables Netlify
3. Vérifier que CORS est activé dans le backend (déjà configuré)
4. Vérifier que le backend répond : `curl https://medimimi-backend.onrender.com/api/health`

### Backend Render en erreur

**Solutions** :
1. Vérifier les logs dans Render Dashboard
2. Vérifier les variables d'environnement (DATABASE_URL, etc.)
3. Vérifier que la base Neon est accessible depuis Render

### "Service unavailable" sur Render Free

**Cause** : Les instances gratuites Render s'endorment après 15 min d'inactivité

**Solution** : 
- Première requête prend 30-60 secondes (réveil de l'instance)
- Configurer un service de ping (ex: UptimeRobot) pour garder l'instance active

## 📊 Configuration CORS (déjà faite)

Le backend doit autoriser les requêtes depuis Netlify. Vérifier dans `server/index.ts` :

```typescript
app.use(cors({
  origin: [
    'http://localhost:5000',
    'https://ton-site.netlify.app',  // Ajouter ton URL Netlify
  ],
  credentials: true
}));
```

## 🔐 Réactiver le Service Worker PWA

Une fois en production, réactiver dans `src/main.tsx` :

```typescript
// Décommenter ce bloc
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
    // ...
  });
}
```

## 📝 Checklist de déploiement

- [ ] Backend déployé sur Render
- [ ] Variables d'environnement configurées sur Render
- [ ] Backend répond à `/api/health`
- [ ] Variable `VITE_API_URL` configurée sur Netlify
- [ ] Frontend redéployé sur Netlify
- [ ] Test de connexion Owner/Admin réussi
- [ ] CORS configuré avec URL Netlify
- [ ] Service Worker réactivé (optionnel)

## 🎉 URL finales

**Frontend** : `https://ton-site.netlify.app`  
**Backend** : `https://medimimi-backend.onrender.com`  
**Base de données** : Neon PostgreSQL (déjà configuré)

## 💡 Alternatives à Render

Si Render pose problème :

### Railway.app
```bash
# Install Railway CLI
npm i -g @railway/cli

# Login
railway login

# Deploy
railway up
```

### Fly.io
```bash
# Install Fly CLI
curl -L https://fly.io/install.sh | sh

# Login
fly auth login

# Deploy
fly launch
```

## 📞 Support

Si problème persiste :
1. Vérifier les logs Render Dashboard
2. Vérifier les logs Netlify Deploy Logs
3. Partager les messages d'erreur de la console navigateur (F12)

---

**Prochaine étape** : Suivre ce guide étape par étape et me dire où tu bloques !
