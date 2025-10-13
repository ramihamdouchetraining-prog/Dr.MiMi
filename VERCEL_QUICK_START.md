# ⚡ Configuration Vercel - Guide Rapide

## 🎯 Ce dont vous avez besoin

### 1️⃣ Configuration du Projet

Quand Vercel vous demande la configuration :

```
Framework Preset:     Vite
Root Directory:       ./  (laisser vide)
Build Command:        npm run build
Output Directory:     dist
Install Command:      npm install
```

---

### 2️⃣ Variable d'Environnement

**UNE SEULE VARIABLE À AJOUTER :**

```
Key:   VITE_API_URL
Value: https://drmimi-replit.onrender.com
```

**Cocher les 3 cases :**
- ☑ Production
- ☑ Preview  
- ☑ Development

---

## 📋 Copier-Coller Direct

### Pour la section "Environment Variables" :

```
VITE_API_URL=https://drmimi-replit.onrender.com
```

---

## ✅ Checklist Complète

Pendant le déploiement Vercel :

- [ ] Framework : **Vite**
- [ ] Build Command : **npm run build**
- [ ] Output Directory : **dist**
- [ ] Variable ajoutée : **VITE_API_URL**
- [ ] Valeur : **https://drmimi-replit.onrender.com**
- [ ] Les 3 environnements cochés : **Production, Preview, Development**
- [ ] Cliquer : **Deploy**

---

## 🚀 Après le Déploiement

Une fois déployé, vous obtiendrez une URL comme :
```
https://dr-mimi-replit.vercel.app
```

### Étape Finale : Mettre à jour Render

1. Aller sur : https://dashboard.render.com/web/srv-cuqtujbtq21c73fd4dt0
2. **Environment** → Trouver `FRONTEND_URL`
3. Modifier vers : **VOTRE_URL_VERCEL** (celle que Vercel vous a donnée)
4. **Save Changes**
5. Attendre 2 minutes (redémarrage automatique)

---

## 🎨 Résumé Visuel

```
┌─────────────────────────────────────────┐
│  CONFIGURATION VERCEL                   │
├─────────────────────────────────────────┤
│                                         │
│  Framework:       Vite                  │
│  Build:           npm run build         │
│  Output:          dist                  │
│                                         │
│  Environment Variables:                 │
│  ┌───────────────────────────────────┐  │
│  │ VITE_API_URL                      │  │
│  │ https://drmimi-replit.onrender.com│  │
│  └───────────────────────────────────┘  │
│                                         │
│  [ Deploy ] ←── Cliquer                 │
└─────────────────────────────────────────┘
```

---

## ❌ Ce qu'il NE FAUT PAS ajouter

**N'ajoutez AUCUNE de ces variables sur Vercel :**

- ❌ DATABASE_URL
- ❌ SESSION_SECRET
- ❌ OWNER_PASSWORD
- ❌ ADMIN_PASSWORD
- ❌ OPENAI_API_KEY
- ❌ PORT
- ❌ NODE_ENV
- ❌ FRONTEND_URL

Ces variables restent **uniquement sur Render** (backend).

---

## 📞 Récapitulatif Ultra-Court

**Question :** Que mettre sur Vercel ?  
**Réponse :** UNE SEULE chose

```
VITE_API_URL=https://drmimi-replit.onrender.com
```

**C'est tout !** 🎉

---

## 🔗 Liens Utiles

- **S'inscrire Vercel :** https://vercel.com/signup
- **Dashboard Render :** https://dashboard.render.com/web/srv-cuqtujbtq21c73fd4dt0
- **Guide Complet :** Voir `VERCEL_DEPLOYMENT_GUIDE.md`

---

✅ **Vous êtes prêt à déployer !**
