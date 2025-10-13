# 🚀 DÉPLOIEMENT RAPIDE - 5 Étapes

## ❌ Problème actuel
```
Frontend Netlify  ❌  Backend localhost:3001 (inaccessible)
```
**Erreur** : "Failed to fetch" / "Erreur serveur"

## ✅ Solution
```
Frontend Netlify  ✅  Backend Render  ✅  Base Neon
```

---

## 📋 ÉTAPE 1 : Déployer le Backend sur Render (10 min)

### 1.1 Créer un compte
👉 https://render.com → Sign up with GitHub

### 1.2 Nouveau Web Service
1. Cliquer **"New +"** → **"Web Service"**
2. Sélectionner le repo `DrMiMi-Replit`
3. Remplir :
   ```
   Name: medimimi-backend
   Region: Frankfurt
   Branch: main
   Build Command: npm install && npm run build:backend
   Start Command: node dist/server/index.js
   Instance Type: Free
   ```

### 1.3 Variables d'environnement
Copier depuis ton `.env` local :

```env
NODE_ENV=production
PORT=3001
DATABASE_URL=postgresql://...   (copier depuis .env)
SESSION_SECRET=...              (copier depuis .env)
OWNER_PASSWORD_HASH=...         (copier depuis .env)
ADMIN_PASSWORD_HASH=...         (copier depuis .env)
OPENAI_API_KEY=...              (copier depuis .env)
```

### 1.4 Déployer
Cliquer **"Create Web Service"** → Attendre 5-10 min

### 1.5 Récupérer l'URL
Une fois déployé, noter l'URL : `https://medimimi-backend.onrender.com`

### 1.6 Tester
Ouvrir dans le navigateur :
```
https://medimimi-backend.onrender.com/api/health
```
✅ Doit afficher : `{"status":"ok",...}`

---

## 📋 ÉTAPE 2 : Configurer CORS Backend (2 min)

### 2.1 Récupérer l'URL Netlify
Dashboard Netlify → Noter l'URL : `https://TON-SITE.netlify.app`

### 2.2 Modifier `server/index.ts`
Ligne 27-30, remplacer :
```typescript
// AVANT
app.use(cors({
  origin: true,
  credentials: true,
}));
```

Par (remplacer `TON-SITE` par ton URL réelle) :
```typescript
// APRÈS
app.use(cors({
  origin: [
    'http://localhost:5000',
    'https://TON-SITE.netlify.app',  // ⚠️ REMPLACER ICI
  ],
  credentials: true,
}));
```

### 2.3 Commit & Push
```bash
git add server/index.ts
git commit -m "🔧 CORS: Autoriser Netlify"
git push origin main
```

Render redéploiera automatiquement (2-3 min).

---

## 📋 ÉTAPE 3 : Configurer Netlify (3 min)

### 3.1 Variable d'environnement
Dashboard Netlify → Site settings → Environment variables → Add variable

```
Key: VITE_API_URL
Value: https://medimimi-backend.onrender.com
```

### 3.2 Redéployer
Site overview → Deploys → Trigger deploy → Deploy site

Attendre 2-3 min.

---

## 📋 ÉTAPE 4 : Tester (2 min)

### 4.1 Ouvrir le site Netlify
`https://TON-SITE.netlify.app`

### 4.2 Ouvrir la console (F12)
Onglet Network pour voir les requêtes

### 4.3 Tester connexion Owner
```
Email: dr.mimi.ben@gmail.com
Password: (celui dans ton .env)
```

### 4.4 Vérifier
✅ Pas d'erreur "Failed to fetch"
✅ Requêtes API pointent vers `https://medimimi-backend.onrender.com`
✅ Connexion réussie

---

## 📋 ÉTAPE 5 : Réactiver PWA (optionnel, 1 min)

### 5.1 Modifier `src/main.tsx`
Décommenter le bloc Service Worker (lignes 7-28) :
```typescript
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
    // ...
  });
}
```

### 5.2 Commit & Push
```bash
git add src/main.tsx
git commit -m "🔧 PWA: Réactiver Service Worker"
git push origin main
```

Netlify redéploiera automatiquement.

---

## 🐛 Problèmes courants

### "Failed to fetch" persiste
1. ✅ Vérifier que Render est déployé (Dashboard → Logs)
2. ✅ Vérifier que `/api/health` fonctionne
3. ✅ Vérifier VITE_API_URL dans Netlify
4. ✅ Vérifier CORS dans `server/index.ts`

### Backend Render "Service unavailable"
➡️ **Normal** : Instance gratuite s'endort après 15 min
➡️ **Première requête** prend 30-60 sec (réveil)

### Erreur CORS
➡️ Vérifier que l'URL Netlify est exacte dans `server/index.ts`

---

## ✅ Checklist finale

- [ ] Backend Render déployé et accessible
- [ ] `/api/health` répond OK
- [ ] Variables d'environnement Render configurées
- [ ] CORS configuré avec URL Netlify
- [ ] Variable VITE_API_URL sur Netlify
- [ ] Frontend Netlify redéployé
- [ ] Test de connexion réussi
- [ ] Service Worker réactivé (optionnel)

---

## 🎉 Résultat

```
✅ Frontend : https://TON-SITE.netlify.app
✅ Backend  : https://medimimi-backend.onrender.com
✅ Database : Neon PostgreSQL

🎓 Plateforme MediMimi opérationnelle en production !
```

---

## 📞 Support

**Bloqué ?** Dis-moi à quelle étape et partage :
1. L'erreur exacte (capture console F12)
2. Les logs Render/Netlify
3. L'URL Netlify et Render

**Fichiers de référence** :
- `GUIDE_DEPLOIEMENT_PRODUCTION.md` (guide détaillé)
- `CONFIG_CORS_PRODUCTION.md` (config CORS)
- `.env.production` (variables frontend)
- `render.yaml` (config Render)
