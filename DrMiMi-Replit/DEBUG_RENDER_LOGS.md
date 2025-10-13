## 🔍 DEBUG: Vérifier Logs Render

**Commit:** bc9287d  
**Date:** 11 octobre 2025 - 19:15 UTC  
**Objectif:** Vérifier si session.save() fonctionne sur Render

---

## ⏱️ ATTENDRE 3-5 MINUTES

Render doit redéployer avec les logs de debug

---

## 📊 ÉTAPE 1: Vérifier Logs Render

### Aller sur Dashboard Render
```
https://dashboard.render.com/web/srv-cuqtujbtq21c73fd4dt0/logs
```

### Logs à Rechercher

#### 1. Au démarrage
```
✅ Chercher:
🚀 MediMimi backend server running on port 3001
📊 Database: Connected to PostgreSQL
🔐 Seeding owner account...
👤 Seeding admin account...
✅ Admin account created successfully
```

#### 2. Lors d'un login admin
```
🔐 Admin login: Saving session for user 79704a43-90bd-46f8-930b-3aeaeac22525
✅ Session saved successfully, sessionID: xxxxxx
```

#### 3. Erreurs possibles
```
❌ Session save error: [error message]
→ Problème PostgreSQL ou table sessions
```

---

## 🧪 ÉTAPE 2: Test Direct Backend

### Test Login avec Cookie Save
```bash
curl -X POST https://drmimi-replit.onrender.com/api/admin/login \
  -H "Content-Type: application/json" \
  -H "Origin: https://dr-mimi.netlify.app" \
  -d '{"email":"admin@medimimi.com","password":"DrMimiAdmin2025!"}' \
  -c /tmp/cookies.txt \
  -v 2>&1 | tee /tmp/login-response.txt
```

### Vérifier Set-Cookie Header
```bash
grep -i "set-cookie" /tmp/login-response.txt

# DOIT AFFICHER:
< set-cookie: connect.sid=s%3A...; Path=/; HttpOnly; Secure; SameSite=None
```

### Test Session Persistence
```bash
curl https://drmimi-replit.onrender.com/api/admin/check \
  -H "Origin: https://dr-mimi.netlify.app" \
  -b /tmp/cookies.txt \
  -v

# DOIT RETOURNER:
{"isAdmin": true, "user": {...}}

# PAS:
{"message": "Not authorized"}
```

---

## 🔧 ÉTAPE 3: Vérifier Table Sessions PostgreSQL

### Connexion à Neon Database
```bash
psql "postgresql://neondb_owner:npg_q69PUfjeILwr@ep-spring-math-adndwjep-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require"
```

### Vérifier Table Sessions
```sql
-- Vérifier si la table existe
\dt sessions

-- Voir les colonnes
\d sessions

-- Compter les sessions actives
SELECT COUNT(*) FROM sessions;

-- Voir les sessions récentes
SELECT sid, sess, expire 
FROM sessions 
ORDER BY expire DESC 
LIMIT 5;

-- Voir une session spécifique (si sessionID connu)
SELECT * FROM sessions WHERE sid = 'sessionID-from-logs';
```

---

## 🐛 PROBLÈMES POSSIBLES

### Problème 1: Table sessions n'existe pas
```
ERROR:  relation "sessions" does not exist
```

**Solution:**
```sql
-- Créer la table sessions
CREATE TABLE "sessions" (
  "sid" varchar NOT NULL COLLATE "default",
  "sess" json NOT NULL,
  "expire" timestamp(6) NOT NULL
) WITH (OIDS=FALSE);

ALTER TABLE "sessions" ADD CONSTRAINT "sessions_pkey" PRIMARY KEY ("sid") NOT DEFERRABLE INITIALLY IMMEDIATE;

CREATE INDEX "IDX_session_expire" ON "sessions" ("expire");
```

### Problème 2: Erreur de connexion PostgreSQL
```
❌ Session save error: Connection timeout
```

**Vérifier:**
1. Variable `DATABASE_URL` sur Render
2. Connexion Neon active
3. Firewall/IP whitelist Neon

### Problème 3: Render build échoue
```
Logs Render: Build failed
```

**Vérifier:**
1. `npm install` réussit
2. Pas d'erreur TypeScript bloquante
3. `tsx` installé dans dependencies

### Problème 4: Session save appelé mais pas de cookie
```
✅ Session saved successfully, sessionID: xxx
MAIS: Pas de Set-Cookie header
```

**Causes possibles:**
- Middleware session pas initialisé
- Cookie options incorrectes
- Response envoyée avant save (impossible avec await)

---

## 📋 CHECKLIST DEBUG

### Backend Render
- [ ] Déployé (commit bc9287d visible)
- [ ] Logs montrent "Session saved successfully"
- [ ] Pas d'erreur "Session save error"
- [ ] Table sessions existe en PostgreSQL
- [ ] Sessions créées dans la table

### Test curl
- [ ] Login retourne 200 OK
- [ ] Header `Set-Cookie` présent
- [ ] Cookie contient `connect.sid`
- [ ] Cookie a `SameSite=None; Secure`
- [ ] Session persiste (check retourne isAdmin=true)

### Frontend Netlify
- [ ] Login admin → Reste sur /admin/dashboard
- [ ] Console: Pas d'erreur 401
- [ ] F12 → Application → Cookies: connect.sid visible

---

## 🎯 SI TOUT FONCTIONNE

**Logs Render:**
```
🔐 Admin login: Saving session for user xxx
✅ Session saved successfully, sessionID: xxx
```

**Test curl:**
```bash
< set-cookie: connect.sid=s%3A...; SameSite=None; Secure
{"success":true,"user":{...}}

# Puis:
{"isAdmin": true}
```

**Frontend:**
```
✅ Login réussit
✅ Reste sur /admin/dashboard
✅ Interface chargée
✅ Cookie visible
```

---

## 🚨 SI ÇA NE MARCHE TOUJOURS PAS

### Copier et Envoyer:

1. **Logs Render complets** (dernières 100 lignes)
2. **Résultat curl login** (avec headers -v)
3. **Résultat psql** (SELECT COUNT(*) FROM sessions)
4. **Screenshot console browser** (F12 → Network → /api/admin/login)

---

## 📞 COMMANDES RAPIDES

### Vérifier Déploiement Render
```bash
curl -s https://drmimi-replit.onrender.com/ | jq .
```

### Tester Login Complet
```bash
# Login
curl -X POST https://drmimi-replit.onrender.com/api/admin/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@medimimi.com","password":"DrMimiAdmin2025!"}' \
  -c /tmp/cookies.txt -v 2>&1 | grep -i "set-cookie\|200"

# Check session
curl https://drmimi-replit.onrender.com/api/admin/check \
  -b /tmp/cookies.txt 2>&1 | jq .
```

### Voir Sessions Actives (si accès psql)
```sql
SELECT sid, 
       sess->>'adminUserId' as user_id,
       sess->>'adminRole' as role,
       expire
FROM sessions 
WHERE expire > NOW()
ORDER BY expire DESC;
```

---

**Status:** En attente logs Render (3-5 min)
