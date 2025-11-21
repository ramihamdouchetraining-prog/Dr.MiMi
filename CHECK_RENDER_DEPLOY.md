# 🔄 Vérifier Déploiement Render

## 📋 Étapes de Vérification

### 1️⃣ Dashboard Render
```
https://dashboard.render.com
→ Services
→ drmimi-replit
→ Events tab
```

**Chercher** :
- ✅ **"Deploy live"** (vert) = Déploiement terminé
- ⏳ **"Building..."** (bleu) = En cours
- ❌ **"Deploy failed"** (rouge) = Échec

### 2️⃣ Logs Render
```
Dashboard → Logs tab
```

**Chercher** :
```
✅ Server starting on port 5001
✅ CORS: Origin autorisée: https://dr-mi-8gb8utcxc...
```

### 3️⃣ Test Backend Direct (PowerShell)
```powershell
$headers = @{ "Origin" = "https://dr-mi-8gb8utcxc-ramis-projects-7dac3957.vercel.app" }
$response = Invoke-WebRequest -Uri "https://drmimi-replit.onrender.com/api/health" -Headers $headers -Method OPTIONS -UseBasicParsing

# Afficher headers CORS
$response.Headers["Access-Control-Allow-Origin"]
# ATTENDU: https://dr-mi-8gb8utcxc-ramis-projects-7dac3957.vercel.app
```

### 4️⃣ Test Frontend Vercel
```
1. Ouvrir: https://dr-mi-8gb8utcxc-ramis-projects-7dac3957.vercel.app/modules
2. F12 → Console
3. Chercher:
   ✅ "Backend health check successful"
   ❌ "blocked by CORS policy"
```

---

## ⚠️ Si Déploiement Bloqué > 5 min

### Manual Redeploy
```
Dashboard Render → drmimi-replit
→ "Manual Deploy" (bouton en haut à droite)
→ "Deploy latest commit"
→ Confirmer
```

Durée: 2-3 min supplémentaires

---

## 🎯 Commit à Vérifier

```
Commit SHA: f94c0dd
Message: fix: Add wildcard CORS pattern for all Vercel deployments
Date: ~5 minutes ago
```

Le backend **DOIT** utiliser ce commit pour que wildcard CORS fonctionne.

---

## 📞 Troubleshooting

### Erreur Persiste Après Deploy Live
1. **Vérifier commit déployé** :
   ```
   Dashboard → Environment → Latest Commit SHA
   Doit être: f94c0dd ou plus récent
   ```

2. **Hard refresh frontend** :
   ```
   Ctrl + Shift + R (Chrome/Edge)
   Cmd + Shift + R (Mac)
   ```

3. **Vérifier backend logs** :
   ```
   Logs tab → Chercher "CORS: Origin"
   Doit afficher: "✅ CORS: Origin autorisée: https://dr-mi-8gb8utcxc..."
   Si affiche: "🚫 CORS: Origin bloquée" → Problème pattern
   ```

---

## ✅ Succès Attendu

**Console Frontend** :
```javascript
✅ Backend health check successful
GET /api/modules 200 OK
✅ 12 modules affichés
```

**Logs Backend** :
```
✅ CORS: Origin autorisée: https://dr-mi-8gb8utcxc-ramis-projects-7dac3957.vercel.app
GET /api/health 200 14ms
GET /api/modules 200 42ms
```

**Aucune erreur CORS** ✨
