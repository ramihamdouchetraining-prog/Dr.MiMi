# 🔐 Guide de Configuration des Secrets GitHub Actions

Ce guide vous aide à configurer tous les secrets et variables nécessaires pour les workflows GitHub Actions de Dr.MiMi.

## 📋 Liste des Secrets Requis

### ✅ Obligatoires pour Neon (Base de données)

#### Secrets (cryptés)
| Secret | Description | Comment l'obtenir |
|--------|-------------|-------------------|
| `NEON_API_KEY` | Clé API Neon | [Console Neon](https://console.neon.tech) → Account → API Keys |
| `DATABASE_URL` | URL de connexion principale | Dashboard Neon → Connection Details |

#### Variables (non cryptées)
| Variable | Description | Comment l'obtenir |
|----------|-------------|-------------------|
| `NEON_PROJECT_ID` | ID du projet Neon | Dashboard Neon → Votre projet → Settings |

### ⚡ Optionnels pour Vercel (Déploiement)

| Secret | Description | Comment l'obtenir |
|--------|-------------|-------------------|
| `VERCEL_TOKEN` | Token d'authentification | [Vercel](https://vercel.com/account/tokens) → Create Token |
| `VERCEL_ORG_ID` | ID de l'organisation | `.vercel/project.json` après `vercel link` |
| `VERCEL_PROJECT_ID` | ID du projet | `.vercel/project.json` après `vercel link` |

## 🚀 Configuration Rapide

### Option 1: Via GitHub CLI (Recommandé)

```bash
# Installer GitHub CLI si nécessaire
# macOS: brew install gh
# Windows: choco install gh
# Linux: voir https://cli.github.com

# Se connecter
gh auth login

# Ajouter les secrets Neon
gh secret set NEON_API_KEY
gh secret set DATABASE_URL
gh variable set NEON_PROJECT_ID

# Ajouter les secrets Vercel (optionnel)
gh secret set VERCEL_TOKEN
gh secret set VERCEL_ORG_ID
gh secret set VERCEL_PROJECT_ID
```

### Option 2: Via Interface Web GitHub

1. **Aller dans votre dépôt GitHub**
2. **Settings** → **Secrets and variables** → **Actions**
3. **New repository secret**
4. Entrer le nom et la valeur du secret
5. Cliquer sur **Add secret**

Répéter pour chaque secret.

## 📖 Guide Détaillé par Service

### 🗄️ Configuration Neon

#### 1. Créer un Compte et un Projet

1. Aller sur [neon.tech](https://neon.tech)
2. S'inscrire gratuitement
3. Créer un nouveau projet PostgreSQL
4. Choisir une région proche (ex: Europe West pour l'Algérie)

#### 2. Obtenir NEON_PROJECT_ID

```bash
# Méthode 1: Via l'interface
# Dashboard → Votre projet → Settings → copier "Project ID"

# Méthode 2: Via l'URL
# L'URL ressemble à: https://console.neon.tech/app/projects/[PROJECT_ID]
# Copier la partie [PROJECT_ID]
```

#### 3. Créer NEON_API_KEY

```bash
# 1. Aller dans Account Settings
#    https://console.neon.tech/app/settings/api-keys

# 2. Cliquer sur "Generate new API key"

# 3. Donner un nom: "GitHub Actions"

# 4. Copier la clé générée (elle ne sera plus visible!)
```

#### 4. Obtenir DATABASE_URL

```bash
# Dashboard → Votre projet → Connection Details
# Copier la connection string complète:
# postgresql://user:password@host/dbname?sslmode=require

# Exemple:
# postgresql://drmimi_owner:abc123@ep-cool-meadow-123456.us-east-2.aws.neon.tech/drmimi?sslmode=require
```

### ⚡ Configuration Vercel (Optionnel)

#### 1. Installer Vercel CLI

```bash
npm i -g vercel
```

#### 2. Se Connecter et Lier le Projet

```bash
# Se connecter à Vercel
vercel login

# Lier votre projet
cd /path/to/dr-mimi
vercel link

# Répondre aux questions:
# - Link to existing project? Yes
# - What's your project's name? dr-mimi
# - In which directory is your code located? ./
```

#### 3. Obtenir VERCEL_ORG_ID et VERCEL_PROJECT_ID

```bash
# Après vercel link, lire le fichier .vercel/project.json
cat .vercel/project.json

# Résultat:
# {
#   "orgId": "team_xxxxxxxxxxxxx",      # → VERCEL_ORG_ID
#   "projectId": "prj_xxxxxxxxxxxxx"    # → VERCEL_PROJECT_ID
# }
```

#### 4. Créer VERCEL_TOKEN

```bash
# 1. Aller sur https://vercel.com/account/tokens
# 2. Cliquer sur "Create Token"
# 3. Nom: "GitHub Actions Dr.MiMi"
# 4. Expiration: No Expiration (ou votre choix)
# 5. Scope: Full Account (recommandé pour CI/CD)
# 6. Copier le token (une seule fois!)
```

## 🔒 Sécurité des Secrets

### ✅ Bonnes Pratiques

1. **Ne jamais commiter les secrets**
   ```bash
   # .gitignore doit inclure:
   .env
   .vercel
   .env.local
   .env.production
   ```

2. **Utiliser des noms descriptifs**
   - ✅ `NEON_API_KEY_PRODUCTION`
   - ❌ `KEY1`

3. **Rotation régulière**
   - Changer les tokens tous les 3-6 mois
   - Révoquer les tokens non utilisés

4. **Principe du moindre privilège**
   - Donner uniquement les permissions nécessaires
   - Utiliser des tokens spécifiques par environnement

5. **Protection des credentials de base de données** 🔐
   - ⚠️ **IMPORTANT**: Les workflows ne publient JAMAIS `DATABASE_URL` dans les commentaires PR
   - Les credentials Neon sont accessibles uniquement via les logs d'Actions (maintainers uniquement)
   - Pour les déploiements preview, passez `DATABASE_URL` via les secrets de votre plateforme de déploiement
   - Cette mesure protège contre l'exposition accidentelle de credentials sensibles

### 🔐 Rotation des Secrets

```bash
# Pour changer un secret:
gh secret set NEON_API_KEY
# Entrer la nouvelle valeur

# Pour lister les secrets:
gh secret list

# Pour supprimer un secret:
gh secret delete OLD_SECRET_NAME
```

## 🧪 Tester la Configuration

### 1. Vérifier les Secrets

```bash
# Via GitHub CLI
gh secret list
gh variable list

# Résultat attendu:
# NEON_API_KEY       Updated 2025-10-13
# DATABASE_URL       Updated 2025-10-13
# NEON_PROJECT_ID    Updated 2025-10-13 (variable)
```

### 2. Tester le Workflow Neon

```bash
# 1. Créer une branche de test
git checkout -b test/github-actions

# 2. Faire un commit
echo "# Test" >> TEST.md
git add TEST.md
git commit -m "test: GitHub Actions setup"

# 3. Pousser et créer une PR
git push origin test/github-actions

# 4. Créer la PR sur GitHub
# → Le workflow doit créer une branche Neon automatiquement
```

### 3. Tester le Workflow de Déploiement

```bash
# Le workflow se lance automatiquement sur chaque PR
# Vérifier dans: Actions → Deploy to Production
```

## 🛠️ Dépannage

### ❌ Erreur: "NEON_API_KEY not found"

**Solution:**
```bash
# Vérifier que le secret existe
gh secret list | grep NEON_API_KEY

# Si absent, l'ajouter
gh secret set NEON_API_KEY
```

### ❌ Erreur: "Invalid Neon API key"

**Causes:**
- Clé expirée
- Copier/coller incorrect (espaces)
- Clé révoquée

**Solution:**
```bash
# Créer une nouvelle clé API sur Neon
# Puis la mettre à jour:
gh secret set NEON_API_KEY
```

### ❌ Erreur: "Vercel deployment failed"

**Solution:**
```bash
# Vérifier tous les secrets Vercel
gh secret list | grep VERCEL

# Doit afficher:
# VERCEL_TOKEN
# VERCEL_ORG_ID
# VERCEL_PROJECT_ID

# Re-lier le projet si nécessaire
vercel link --yes
```

### ❌ Workflow ne se déclenche pas

**Vérifier:**
1. Les workflows sont dans `.github/workflows/`
2. Le fichier YAML est valide
3. Les permissions GitHub Actions sont activées:
   - Settings → Actions → General
   - Allow all actions

## 📝 Checklist de Configuration

```
Configuration Neon:
□ Compte Neon créé
□ Projet PostgreSQL créé
□ NEON_PROJECT_ID configuré (variable)
□ NEON_API_KEY configuré (secret)
□ DATABASE_URL configuré (secret)
□ Test: Branche Neon créée sur PR ✓

Configuration Vercel (Optionnel):
□ Compte Vercel créé
□ vercel CLI installé
□ Projet lié avec `vercel link`
□ VERCEL_TOKEN configuré (secret)
□ VERCEL_ORG_ID configuré (secret)
□ VERCEL_PROJECT_ID configuré (secret)
□ Test: Déploiement preview sur PR ✓

Sécurité:
□ .env dans .gitignore
□ Secrets ne sont pas committés
□ Tokens avec expiration définie
□ Accès restreints aux collaborateurs
```

## 🔗 Ressources Utiles

### Documentation
- [GitHub Secrets](https://docs.github.com/en/actions/security-guides/encrypted-secrets)
- [Neon API](https://neon.tech/docs/reference/api-reference)
- [Vercel CLI](https://vercel.com/docs/cli)

### Support
- [Neon Discord](https://discord.gg/neon)
- [Vercel Support](https://vercel.com/support)
- [GitHub Actions Community](https://github.community/c/github-actions)

### Commandes Rapides
```bash
# GitHub CLI
gh secret set <NAME>              # Ajouter un secret
gh secret list                     # Lister les secrets
gh variable set <NAME>             # Ajouter une variable
gh workflow list                   # Lister les workflows
gh run list                        # Voir les exécutions

# Vercel CLI
vercel                             # Déployer
vercel env ls                      # Lister les variables
vercel secrets ls                  # Lister les secrets
```

---

**🎉 Configuration terminée! Vos workflows GitHub Actions sont prêts!**

Pour toute question, consultez le [README des workflows](.github/README.md).
