# 🎯 Guide de Configuration Vercel - URGENCE

## ⚠️ Problème Actuel

Votre application affiche cette erreur :
```
❌ VITE_API_URL not configured! Please set it in Vercel environment variables.
Expected: https://drmimi-replit.onrender.com
```

**C'est NORMAL !** Le code détecte correctement que la variable manque.

---

## 📋 Solution en 5 Étapes

### Étape 1 : Accéder à Vercel Dashboard

1. Ouvrez votre navigateur
2. Allez sur : **https://vercel.com/dashboard**
3. Connectez-vous si nécessaire

### Étape 2 : Sélectionner le Projet

1. Dans la liste des projets, trouvez **Dr.MiMi** ou votre nom de projet
2. Cliquez dessus pour ouvrir le projet

### Étape 3 : Accéder aux Variables d'Environnement

1. Cliquez sur l'onglet **"Settings"** (en haut)
2. Dans le menu latéral, cliquez sur **"Environment Variables"**

### Étape 4 : Ajouter VITE_API_URL

1. Cliquez sur **"Add New"** ou **"Add Environment Variable"**

2. Remplissez le formulaire :

   **Key (Nom de la variable) :**
   ```
   VITE_API_URL
   ```

   **Value (Valeur) :**
   ```
   https://drmimi-replit.onrender.com
   ```

   **Environments (Environnements) :**
   - ✅ **Production** (obligatoire)
   - ✅ **Preview** (recommandé)
   - ✅ **Development** (optionnel)

3. Cliquez sur **"Save"**

### Étape 5 : Redéployer l'Application

**Option A : Redéploiement Automatique (Recommandé)**
- Vercel va automatiquement redéployer dans 1-2 minutes
- Vous recevrez une notification

**Option B : Redéploiement Manuel (Plus Rapide)**
1. Allez dans l'onglet **"Deployments"**
2. Trouvez le dernier déploiement (le premier de la liste)
3. Cliquez sur les **3 points "..."** à droite
4. Cliquez sur **"Redeploy"**
5. Confirmez en cliquant sur **"Redeploy"** à nouveau

---

## ✅ Vérification

### Après 2-3 minutes, testez votre site :

1. **Ouvrez votre site Vercel** (ex: `https://votre-app.vercel.app`)

2. **Ouvrez la Console du navigateur** (F12 → Console)

3. **Cherchez ce message :**
   ```
   🔧 API Configuration: {
     mode: "production",
     isDev: false,
     apiBaseUrl: "https://drmimi-replit.onrender.com"
   }
   ```

4. **✅ Si vous voyez ça = SUCCÈS !**
   - Plus d'erreur "API URL not configured"
   - Les requêtes API fonctionnent

5. **❌ Si vous voyez toujours l'erreur :**
   - Attendez 2 minutes de plus
   - Videz le cache (Ctrl+Shift+Delete)
   - Rafraîchissez (Ctrl+F5)
   - Vérifiez que vous avez bien cliqué "Save"

---

## 🎨 Capture d'Écran de Référence

### Voici à quoi ça doit ressembler sur Vercel :

```
┌─────────────────────────────────────────────────────┐
│ Environment Variables                               │
├─────────────────────────────────────────────────────┤
│                                                     │
│ Key: VITE_API_URL                                   │
│ Value: https://drmimi-replit.onrender.com          │
│ Environments:                                       │
│   ☑ Production                                      │
│   ☑ Preview                                         │
│   ☐ Development                                     │
│                                                     │
│ [Save]                                              │
└─────────────────────────────────────────────────────┘
```

---

## 🔍 Dépannage

### Erreur persiste après 5 minutes ?

1. **Vérifier l'orthographe exacte :**
   - Clé : `VITE_API_URL` (pas `API_URL` ou `VITE_URL`)
   - Valeur : `https://drmimi-replit.onrender.com` (avec https://)

2. **Vérifier que "Production" est coché**

3. **Forcer un nouveau déploiement :**
   - Deployments → ... → Redeploy

4. **Vider le cache du navigateur complètement :**
   - F12 → Application → Clear storage → Clear site data
   - Ou navigation privée

### Toujours des problèmes ?

Vérifiez les logs Vercel :
1. Onglet "Deployments"
2. Cliquez sur le dernier déploiement
3. Cliquez sur "Building" ou "Function Logs"
4. Cherchez des erreurs

---

## 📊 Autres Variables Optionnelles (Plus Tard)

Pour améliorer votre application, vous pouvez ajouter :

```bash
# Analytics (optionnel)
VITE_GOOGLE_ANALYTICS_ID=G-XXXXXXXXXX

# Feature flags (optionnel)
VITE_ENABLE_CHAT=true
VITE_ENABLE_3D_LAB=true

# Mode debug (optionnel, development seulement)
VITE_DEBUG=false
```

Mais **pour l'instant**, seul `VITE_API_URL` est **OBLIGATOIRE**.

---

## 🎯 Temps Estimé

- Configuration : **2 minutes**
- Redéploiement : **2-3 minutes**
- **Total : 5 minutes maximum**

---

## 🚀 Après Configuration Réussie

Une fois que `VITE_API_URL` est configuré et l'app redéployée :

### Fonctionnalités qui devraient marcher :
- ✅ Login / Register
- ✅ Chat avec Dr.MiMi
- ✅ Cours, Quiz, Cas Cliniques
- ✅ Dashboard Owner
- ✅ OAuth (Google, Facebook, Microsoft)
- ✅ 3D Virtual Lab (sans erreur HDR)

### Si ça ne marche toujours pas :
- Vérifier que le backend Render est en ligne : https://drmimi-replit.onrender.com/api/users/me
- Si 404 ou timeout → Backend pas déployé
- Si CORS error → Vérifier FRONTEND_URL sur Render

---

## 📞 Support Urgent

Si après avoir suivi ce guide à la lettre, ça ne fonctionne **toujours pas** :

1. Prenez une capture d'écran de la page "Environment Variables" sur Vercel
2. Prenez une capture d'écran de la console du navigateur (F12)
3. Copiez les logs du dernier déploiement Vercel
4. Contactez le support avec ces informations

---

## ✅ Checklist Finale

- [ ] Accéder à https://vercel.com/dashboard
- [ ] Sélectionner le projet Dr.MiMi
- [ ] Settings → Environment Variables
- [ ] Ajouter `VITE_API_URL` = `https://drmimi-replit.onrender.com`
- [ ] Cocher "Production"
- [ ] Cliquer "Save"
- [ ] Attendre 2-3 minutes
- [ ] Tester le site
- [ ] Vérifier la console (pas d'erreur API URL)
- [ ] Tester le login
- [ ] Tester le chat

---

**Dernière mise à jour :** 22 Octobre 2025  
**Fichiers modifiés :** Code déjà corrigé et pushé ✅  
**Action requise :** Configuration Vercel uniquement  
**Urgence :** ⚠️ Haute (5 minutes de travail)
