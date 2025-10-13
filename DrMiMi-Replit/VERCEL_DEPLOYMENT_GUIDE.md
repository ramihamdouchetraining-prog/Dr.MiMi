# 🚀 Guide Déploiement Vercel - Dr.MiMi

## 📋 Vue d'ensemble

Ce guide vous accompagne pas à pas pour déployer Dr.MiMi sur Vercel (gratuit).

---

## 🎯 ÉTAPE 1: Créer un compte Vercel

### 1.1 Inscription (2 minutes)

1. Aller sur: **https://vercel.com/signup**
2. Choisir: **"Continue with GitHub"**
3. Autoriser Vercel à accéder à votre GitHub
4. Confirmer votre email si demandé

✅ **Résultat**: Compte Vercel créé et connecté à GitHub

---

## 🔗 ÉTAPE 2: Importer le projet depuis GitHub

### 2.1 Nouveau projet (1 minute)

1. Dans Vercel Dashboard: **"Add New..." → "Project"**
2. Sélectionner votre repo: **"ramihamdouchetraining-prog/DrMiMi-Replit"**
3. Cliquer: **"Import"**

### 2.2 Configuration du projet

**Framework Preset**: Vite
**Root Directory**: `./` (laisser vide)
**Build Command**: `npm run build`
**Output Directory**: `dist`
**Install Command**: `npm install`

---

## 🔑 ÉTAPE 3: Variables d'environnement (CRITIQUE)

### 3.1 Ajouter la variable d'environnement

Dans la page de configuration du projet Vercel:

1. Scroller jusqu'à: **"Environment Variables"**
2. Ajouter cette variable:

```
Key: VITE_API_URL
Value: https://drmimi-replit.onrender.com
```

3. Cocher: **Production**, **Preview**, **Development**

⚠️ **IMPORTANT**: Sans cette variable, le frontend ne pourra pas communiquer avec le backend!

---

## 🚀 ÉTAPE 4: Déployer

1. Cliquer sur: **"Deploy"**
2. Attendre 2-3 minutes (build + deploy)
3. Vercel vous donnera une URL: `https://dr-mimi-replit.vercel.app`

---

## 🔧 ÉTAPE 5: Configurer CORS sur Render (CRITIQUE)

### 5.1 Pourquoi?

Le backend Render doit autoriser les requêtes depuis la nouvelle URL Vercel.

### 5.2 Ajouter variable d'environnement sur Render

1. Aller sur: **https://dashboard.render.com/web/srv-cuqtujbtq21c73fd4dt0**
2. Environment → **Environment Variables**
3. Modifier `FRONTEND_URL`:

```
FRONTEND_URL=https://dr-mimi-replit.vercel.app
```

4. **Save Changes** → Render redémarre automatiquement (2 minutes)

### 5.3 Alternative: Ajouter origine CORS manuellement

Si vous voulez garder Netlify ET Vercel:

**Modifier `server/replitAuth.ts`** (je peux le faire pour vous):

```typescript
origin: [
  'http://localhost:5000',
  'https://dr-mimi.netlify.app',
  'https://dr-mimi-replit.vercel.app'  // ← NOUVELLE LIGNE
]
```

---

## ✅ ÉTAPE 6: Vérifier que tout fonctionne

### 6.1 Test Backend

```bash
curl https://drmimi-replit.onrender.com/health
```

✅ Attendu: `{"status":"ok"}`

### 6.2 Test Frontend

1. Ouvrir: `https://dr-mimi-replit.vercel.app`
2. Vérifier: Site charge correctement
3. F12 → Console: Aucune erreur CORS

### 6.3 Test Login Admin

1. Aller sur: `https://dr-mimi-replit.vercel.app/admin/login`
2. Email: `admin@medimimi.com`
3. Password: `DrMimiAdmin2025!`
4. Vérifier: Login réussit, reste sur `/admin/dashboard`

---

## 🎨 ÉTAPE 7: Personnaliser le domaine (Optionnel)

### 7.1 Domaine personnalisé

Si vous avez un domaine (ex: `drmimi.com`):

1. Vercel Dashboard → Project Settings → **Domains**
2. Add Domain: `drmimi.com`
3. Suivre instructions DNS (ajouter CNAME)

---

## 📊 Comparaison Netlify vs Vercel

| Fonctionnalité | Netlify (Gratuit) | Vercel (Gratuit) |
|---------------|-------------------|------------------|
| Bande passante | 100 GB/mois | 100 GB/mois |
| Builds | 300 min/mois | **Illimité** ✅ |
| Sites | 100 | **Illimité** ✅ |
| Fonctions serverless | 125k requêtes | 100k requêtes |
| Support | Community | Community |

---

## 🔐 Variables d'environnement complètes

### Frontend (Vercel)

```env
# OBLIGATOIRE
VITE_API_URL=https://drmimi-replit.onrender.com
```

C'est tout ! Le frontend n'a besoin que de ça.

### Backend (Render) - DÉJÀ CONFIGURÉ

```env
# Database
DATABASE_URL=postgresql://neondb_owner:npg_q69PUfjeILwr@ep-spring-math-adndwjep-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require

# Session
SESSION_SECRET=aiHVH1n3moZR6ASmOhBonAPUh7XZmu70CYbLGeiXAw0=

# Admin
OWNER_PASSWORD=DrMimiOwner2025!
ADMIN_PASSWORD=DrMimiAdmin2025!

# OpenAI
OPENAI_API_KEY=ydc-sk-e107650eddb0d4f6-2D9twUNs9JwxPtB36qXqvhpORJ13yjWO-89c6a041<__>1SC1j1ETU8N2v5f4wSjb1DSS

# Server
PORT=3001
NODE_ENV=production

# CORS - À MODIFIER
FRONTEND_URL=https://dr-mimi-replit.vercel.app
```

---

## 🐛 Dépannage

### Problème 1: CORS Error

**Symptôme**: `Access to fetch blocked by CORS policy`

**Solution**:
1. Vérifier `FRONTEND_URL` sur Render = URL Vercel exacte
2. Attendre 2 minutes que Render redémarre
3. Vider cache browser (Ctrl+Shift+R)

### Problème 2: 404 sur routes React

**Symptôme**: Refresh page → 404 error

**Solution**: Vercel gère automatiquement avec `vercel.json`:

```json
{
  "rewrites": [
    { "source": "/(.*)", "destination": "/index.html" }
  ]
}
```

Je vais créer ce fichier pour vous.

### Problème 3: Build échoue

**Symptôme**: Build fails sur Vercel

**Solution**:
```bash
# Localement, tester:
npm run build

# Si erreurs TypeScript:
npm run build -- --mode production
```

---

## 📱 URLs Finales

| Service | URL | Rôle |
|---------|-----|------|
| **Frontend (Vercel)** | https://dr-mimi-replit.vercel.app | Interface utilisateur |
| **Backend (Render)** | https://drmimi-replit.onrender.com | API + Database |
| **Database (Neon)** | ep-spring-math-adndwjep-pooler... | PostgreSQL |

---

## 🎯 Checklist finale

- [ ] Compte Vercel créé
- [ ] Projet importé depuis GitHub
- [ ] Variable `VITE_API_URL` ajoutée sur Vercel
- [ ] Projet déployé (URL Vercel obtenue)
- [ ] Variable `FRONTEND_URL` mise à jour sur Render
- [ ] Test: Site Vercel charge
- [ ] Test: Login admin fonctionne
- [ ] Test: Dashboard admin accessible
- [ ] (Optionnel) Domaine personnalisé configuré

---

## 💡 Conseils

1. **Bookmarker** votre URL Vercel
2. **Partager** avec vos utilisateurs
3. **Monitorer** usage sur Vercel Dashboard
4. **Auto-deploy**: Chaque push sur GitHub redéploie automatiquement
5. **Preview**: Chaque PR GitHub crée un preview automatique

---

## 📞 Support

- **Vercel Docs**: https://vercel.com/docs
- **Vercel Status**: https://www.vercel-status.com
- **Support**: https://vercel.com/support

---

✅ **Votre plateforme médicale est prête pour la production !**
