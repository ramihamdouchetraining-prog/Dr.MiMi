# ⚙️ Configuration CORS Backend pour Production

## 🔧 Problème

Le backend doit autoriser les requêtes depuis le frontend déployé sur Netlify.

## ✅ Solution

### Étape 1 : Récupérer l'URL Netlify

1. Aller sur ton dashboard Netlify
2. Noter l'URL de ton site : `https://TON-SITE.netlify.app`

### Étape 2 : Modifier `server/index.ts`

Remplacer la configuration CORS actuelle :

```typescript
// AVANT (permet tous les origins en dev)
app.use(cors({
  origin: true,
  credentials: true,
}));
```

Par :

```typescript
// APRÈS (configuration pour production)
app.use(cors({
  origin: [
    'http://localhost:5000',              // Développement local
    'https://TON-SITE.netlify.app',       // Production Netlify (REMPLACER)
    'https://medimimi-backend.onrender.com', // Backend Render (si nécessaire)
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));
```

**Important** : Remplacer `TON-SITE.netlify.app` par ton URL Netlify réelle !

### Étape 3 : Commit et push

```bash
git add server/index.ts
git commit -m "🔧 Config CORS pour production Netlify"
git push origin main
```

### Étape 4 : Redéployer sur Render

Render détectera automatiquement le commit et redéploiera le backend.

## 🧪 Vérifier que CORS fonctionne

1. Ouvrir le site Netlify
2. Ouvrir la console (F12)
3. Essayer de se connecter
4. Vérifier qu'il n'y a **pas** d'erreur CORS dans la console

### Erreurs CORS typiques

❌ **"Access to fetch at 'https://...' from origin 'https://...' has been blocked by CORS policy"**

➡️ **Solution** : Vérifier que l'URL Netlify est bien dans la liste `origin` du backend

❌ **"The 'Access-Control-Allow-Origin' header contains multiple values"**

➡️ **Solution** : Supprimer les doublons dans la configuration CORS

## 📝 Configuration complète recommandée

```typescript
import cors from 'cors';

// Liste des origins autorisés
const allowedOrigins = [
  'http://localhost:5000',
  'http://localhost:5173',
  'https://TON-SITE.netlify.app',
  process.env.FRONTEND_URL, // Variable d'environnement Render
].filter(Boolean); // Supprimer les valeurs undefined

app.use(cors({
  origin: (origin, callback) => {
    // Autoriser les requêtes sans origin (ex: apps mobiles, Postman)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      console.warn(`⚠️ CORS: Origin non autorisé: ${origin}`);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  exposedHeaders: ['Set-Cookie'],
}));
```

## 🔐 Variable d'environnement Render (optionnel)

Au lieu de hardcoder l'URL Netlify, tu peux la passer en variable d'environnement :

### Sur Render Dashboard

Ajouter la variable :
- **Key** : `FRONTEND_URL`
- **Value** : `https://TON-SITE.netlify.app`

### Dans le code

```typescript
const allowedOrigins = [
  'http://localhost:5000',
  process.env.FRONTEND_URL,
].filter(Boolean);
```

## ✅ Checklist CORS

- [ ] URL Netlify récupérée
- [ ] `server/index.ts` modifié avec URL Netlify
- [ ] Code committé et pushé
- [ ] Backend Render redéployé
- [ ] Test de connexion depuis Netlify réussi
- [ ] Pas d'erreur CORS dans la console navigateur

---

**Prochaine étape** : Modifier `server/index.ts` avec ton URL Netlify réelle !
