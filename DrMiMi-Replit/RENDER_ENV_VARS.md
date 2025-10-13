## 🔧 CONFIGURATION VARIABLES D'ENVIRONNEMENT RENDER

**Urgence:** Le backend Render ne redémarrera PAS automatiquement correctement sans ces variables !

---

## 📋 VARIABLES À AJOUTER SUR RENDER

Va sur : https://dashboard.render.com/web/srv-cuqtujbtq21c73fd4dt0/env

### 1. **DATABASE_URL** ✅ (Déjà configuré)
```
postgresql://neondb_owner:npg_q69PUfjeILwr@ep-spring-math-adndwjep-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require
```

### 2. **SESSION_SECRET** ✅ (Déjà configuré probablement)
```
aiHVH1n3moZR6ASmOhBonAPUh7XZmu70CYbLGeiXAw0=
```

### 3. **OWNER_PASSWORD** ⚠️ IMPORTANT
```
DrMimiOwner2025!
```
**Pourquoi:** Seed le compte Owner (dr.mimi.ben@gmail.com)

### 4. **ADMIN_PASSWORD** ⚠️ NOUVEAU - URGENT !
```
DrMimiAdmin2025!
```
**Pourquoi:** Seed le compte Admin (admin@medimimi.com)  
**Sans ça:** Le login admin retournera toujours 401 Unauthorized

### 5. **OPENAI_API_KEY** (Optionnel pour chatbot)
```
ydc-sk-e107650eddb0d4f6-2D9twUNs9JwxPtB36qXqvhpORJ13yjWO-89c6a041___1SC1j1ETU8N2v5f4wSjb1DSS
```

### 6. **PORT** (Automatique Render)
```
3001
```
**Note:** Render définit automatiquement `PORT`, pas besoin de le changer

### 7. **NODE_ENV**
```
production
```

### 8. **FRONTEND_URL** (Pour CORS)
```
https://dr-mimi.netlify.app
```

---

## 🚀 ÉTAPES DE CONFIGURATION

### Option A: Via Dashboard Web (Recommandé)

1. **Ouvrir Render Dashboard**
   ```
   https://dashboard.render.com/web/srv-cuqtujbtq21c73fd4dt0/env
   ```

2. **Cliquer "Add Environment Variable"**

3. **Ajouter chaque variable:**
   ```
   Key: ADMIN_PASSWORD
   Value: DrMimiAdmin2025!
   ```
   
4. **Important:** Cliquer "Save Changes" après chaque ajout

5. **Attendre le redéploiement automatique** (2-3 min)

### Option B: Via Render.yaml (Pour référence)

Les variables sont déjà dans le fichier `render.yaml` mais **Render ne les synchronise pas automatiquement** :

```yaml
envVars:
  - key: DATABASE_URL
    sync: false  # À définir manuellement
  - key: SESSION_SECRET
    generateValue: true
  - key: ADMIN_PASSWORD
    sync: false  # ⚠️ DOIT ÊTRE DÉFINI MANUELLEMENT
```

---

## ✅ VÉRIFICATION APRÈS CONFIG

### 1. Attendre 3 minutes que Render redémarre

### 2. Tester health check
```bash
curl https://drmimi-replit.onrender.com/api/health
# Doit retourner: {"status":"ok",...}
```

### 3. Vérifier les logs Render
```
Aller sur: https://dashboard.render.com/web/srv-cuqtujbtq21c73fd4dt0/logs

Rechercher:
✅ "👤 Seeding admin account..."
✅ "✅ Admin account created successfully"
✅ "   Email: admin@medimimi.com"
❌ "⚠️  ADMIN_PASSWORD not set" → Variable manquante !
```

### 4. Tester login admin
```bash
curl -X POST https://drmimi-replit.onrender.com/api/admin/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@medimimi.com","password":"DrMimiAdmin2025!"}' \
  | jq .

# Succès attendu:
{
  "success": true,
  "user": {
    "id": "...",
    "email": "admin@medimimi.com",
    "role": "admin"
  }
}

# Échec si variable manquante:
{
  "message": "Invalid credentials"
}
```

---

## 🔐 COMPTES CRÉÉS PAR SEED

### Compte Owner (Propriétaire)
```
Email: dr.mimi.ben@gmail.com
Password: DrMimiOwner2025! (depuis OWNER_PASSWORD)
Role: owner
Accès: Panel Owner complet + Toutes les permissions
Route login: /owner-login
```

### Compte Admin
```
Email: admin@medimimi.com
Password: DrMimiAdmin2025! (depuis ADMIN_PASSWORD)
Role: admin
Accès: Panel Admin (gestion utilisateurs, contenu, analytics)
Route login: /admin/login
```

### Compte Utilisateur Normal
```
Email: À créer via /register
Password: Défini par l'utilisateur
Role: user
Accès: Cours, quiz, profil
Route login: /login
```

---

## 🐛 TROUBLESHOOTING

### Problème: "Invalid credentials" après config

**Solution 1:** Vérifier que la variable existe
```bash
# Sur Render, aller dans l'onglet "Environment"
# Vérifier que ADMIN_PASSWORD est visible dans la liste
```

**Solution 2:** Forcer un redéploiement manuel
```
Dashboard Render → Manual Deploy → Deploy latest commit
```

**Solution 3:** Vérifier les logs de seed
```
Render Logs → Rechercher "Seeding admin account"
```

### Problème: Compte créé mais password ne marche pas

**Cause:** Le password dans Render est différent de celui en local

**Solution:** S'assurer que `ADMIN_PASSWORD` sur Render = `DrMimiAdmin2025!` EXACTEMENT (sensible à la casse)

### Problème: "ADMIN_PASSWORD not set" dans les logs

**Solution:** 
1. Retourner sur Render Dashboard
2. Environment Variables
3. Vérifier que `ADMIN_PASSWORD` existe et n'est pas vide
4. Si manquant, l'ajouter et sauvegarder
5. Attendre redéploiement automatique (2-3 min)

---

## 📞 PROCHAINES ÉTAPES

1. ⏱️ **Maintenant:** Aller sur Render Dashboard
2. 🔧 **Ajouter:** `ADMIN_PASSWORD=DrMimiAdmin2025!`
3. 💾 **Sauvegarder:** Cliquer "Save Changes"
4. ⏳ **Attendre:** 3 minutes (redéploiement automatique)
5. 🧪 **Tester:** Login admin sur https://dr-mimi.netlify.app/admin/login

---

## 📚 RESSOURCES

- **Render Dashboard:** https://dashboard.render.com/web/srv-cuqtujbtq21c73fd4dt0
- **Render Logs:** https://dashboard.render.com/web/srv-cuqtujbtq21c73fd4dt0/logs
- **Render Env Vars:** https://dashboard.render.com/web/srv-cuqtujbtq21c73fd4dt0/env
- **Guide Render:** https://render.com/docs/environment-variables
