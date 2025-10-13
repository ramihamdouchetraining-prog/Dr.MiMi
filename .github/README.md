# 🚀 GitHub Actions Workflows

Ce répertoire contient les workflows GitHub Actions pour l'automatisation du déploiement et la gestion des bases de données Neon.

## 📋 Workflows Disponibles

### 1. 🚀 Deploy to Production (`deploy.yml`)

Workflow complet de déploiement avec tests automatiques et déploiement vers production.

**Déclencheurs:**
- Push sur `main` → Déploiement production automatique
- Pull Request → Déploiement preview
- Manuel (`workflow_dispatch`)

**Étapes:**
1. **Lint & Test** - Vérification du code et tests Playwright
2. **Build** - Construction frontend et backend
3. **Deploy Preview** - Déploiement preview sur Vercel (PR uniquement)
4. **Deploy Production** - Déploiement production (main uniquement)
5. **Notify** - Notifications de statut

**Environnements:**
- **Preview** - Pour les PR (auto-supprimé à la fermeture)
- **Production** - Pour la branche main

### 2. 🗄️ Neon Branch Management (`neon-branch.yml`)

Gestion automatique des branches de base de données Neon pour les PR.

**Déclencheurs:**
- PR ouverte/rouverte/synchronisée → Création de branche DB
- PR fermée → Suppression de branche DB

**Fonctionnalités:**
- ✅ Création automatique de branche DB pour chaque PR
- ✅ Migration du schéma automatique
- ✅ Seed optionnel de la base de données
- ✅ Commentaires sur PR avec infos de connexion
- ✅ Suppression automatique à la fermeture de la PR
- ✅ Expiration automatique après 14 jours
- ✅ Gestion des erreurs avec notifications

## 🔐 Configuration Requise

### Secrets GitHub

Ajoutez ces secrets dans `Settings > Secrets and variables > Actions`:

#### Pour Vercel (Déploiement)
```
VERCEL_TOKEN          # Token d'authentification Vercel
VERCEL_ORG_ID         # ID de votre organisation Vercel
VERCEL_PROJECT_ID     # ID de votre projet Vercel
```

#### Pour Neon (Base de données)
```
NEON_API_KEY          # Clé API Neon
DATABASE_URL          # URL de la base de données principale
```

### Variables GitHub

Ajoutez ces variables dans `Settings > Secrets and variables > Actions > Variables`:

```
NEON_PROJECT_ID       # ID de votre projet Neon
```

## 📦 Comment Configurer

### 1. Obtenir les Secrets Vercel

1. **Créer un compte Vercel**
   ```bash
   npm i -g vercel
   vercel login
   ```

2. **Lier votre projet**
   ```bash
   vercel link
   ```

3. **Obtenir les IDs**
   ```bash
   # Dans le fichier .vercel/project.json:
   {
     "orgId": "team_xxx...",      # → VERCEL_ORG_ID
     "projectId": "prj_xxx..."    # → VERCEL_PROJECT_ID
   }
   ```

4. **Créer un token**
   - Aller sur https://vercel.com/account/tokens
   - Créer un nouveau token → `VERCEL_TOKEN`

### 2. Obtenir les Secrets Neon

1. **Créer un compte Neon**
   - Aller sur https://console.neon.tech

2. **Créer un projet**
   - Créer un nouveau projet PostgreSQL
   - Copier le `Project ID` → `NEON_PROJECT_ID`

3. **Créer une clé API**
   - Aller dans Account Settings → API Keys
   - Créer une nouvelle clé → `NEON_API_KEY`

4. **Obtenir l'URL de connexion**
   - Dashboard → Connection String → `DATABASE_URL`

### 3. Ajouter les Secrets sur GitHub

```bash
# Via GitHub CLI
gh secret set VERCEL_TOKEN
gh secret set VERCEL_ORG_ID
gh secret set VERCEL_PROJECT_ID
gh secret set NEON_API_KEY
gh secret set DATABASE_URL

gh variable set NEON_PROJECT_ID
```

Ou manuellement via l'interface web:
1. Aller dans votre repo → Settings
2. Secrets and variables → Actions
3. New repository secret
4. Entrer le nom et la valeur

## 🔄 Utilisation

### Déploiement Automatique

1. **Pour une PR (Preview)**
   ```bash
   git checkout -b feature/ma-fonctionnalite
   git push origin feature/ma-fonctionnalite
   # Créer une PR → Déploiement preview automatique
   ```

2. **Pour la Production**
   ```bash
   git checkout main
   git merge feature/ma-fonctionnalite
   git push origin main
   # → Déploiement production automatique
   ```

### Base de Données Preview

Chaque PR obtient automatiquement:
- ✅ Une branche de base de données dédiée
- ✅ Le schéma migré automatiquement
- ✅ Un commentaire avec les détails de connexion
- ✅ Suppression automatique à la fermeture

**Exemple de commentaire sur PR:**
```
🗄️ Neon Database Branch Created!

Branch Name: preview/pr-123-feature-auth
Host: ep-cool-meadow-123456.us-east-2.aws.neon.tech
Expires: 27 octobre 2025 à 14:30

DATABASE_URL=postgresql://user:pass@host/db
```

## 🛠️ Personnalisation

### Modifier le Workflow de Déploiement

1. **Changer la plateforme de déploiement**
   - Remplacer `amondnet/vercel-action` par Netlify, Render, etc.

2. **Ajouter des étapes**
   ```yaml
   - name: Custom Step
     run: npm run custom-script
   ```

3. **Modifier les tests**
   ```yaml
   - name: Run tests
     run: npm run test:e2e
   ```

### Modifier la Gestion Neon

1. **Changer la durée d'expiration**
   ```yaml
   # De 14 jours à 7 jours
   run: echo "EXPIRES_AT=$(date -u --date '+7 days' ...)"
   ```

2. **Activer le seed automatique**
   ```yaml
   - name: Seed Database
     run: npm run db:seed
   ```

3. **Personnaliser les commentaires**
   - Modifier le `commentBody` dans le script GitHub

## 📊 Monitoring

### Voir les Déploiements

- **GitHub Actions**: `Actions` → Sélectionner un workflow
- **Vercel Dashboard**: https://vercel.com/dashboard
- **Neon Console**: https://console.neon.tech

### Debug des Erreurs

1. **Workflow échoue**
   - Aller dans `Actions` → Workflow échoué
   - Voir les logs détaillés
   - Vérifier les secrets configurés

2. **Déploiement échoue**
   - Vérifier les logs Vercel
   - Vérifier les variables d'environnement
   - Tester le build localement: `npm run build`

3. **Neon branch échoue**
   - Vérifier `NEON_API_KEY` et `NEON_PROJECT_ID`
   - Vérifier les quotas Neon
   - Voir les logs dans Actions

## ⚡ Optimisations

### Cache des Dépendances

Les workflows utilisent le cache npm automatique:
```yaml
- uses: actions/setup-node@v4
  with:
    cache: 'npm'
```

### Concurrency

Les workflows utilisent la concurrence pour éviter les doublons:
```yaml
concurrency:
  group: ${{ github.workflow }}-${{ github.ref }}
  cancel-in-progress: true
```

### Artifacts

Les builds sont sauvegardés comme artifacts (7 jours):
```yaml
- uses: actions/upload-artifact@v4
  with:
    retention-days: 7
```

## 🔒 Sécurité

### Bonnes Pratiques

✅ **Utiliser des secrets GitHub** - Jamais de tokens en dur
✅ **Limiter les permissions** - Principe du moindre privilège
✅ **Vérifier les PR** - Review avant merge
✅ **Utiliser des environnements** - Protection de la production
✅ **Expirer les branches DB** - Nettoyer automatiquement

### Protection de Production

Activez la protection d'environnement:
1. Settings → Environments → production
2. Require reviewers (2 reviewers recommandés)
3. Restrict to protected branches (main uniquement)

## 📚 Ressources

- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Vercel Deployment](https://vercel.com/docs)
- [Neon Branching](https://neon.tech/docs/guides/branching)
- [Drizzle ORM](https://orm.drizzle.team)

## 🆘 Support

Pour toute question ou problème:
1. Vérifier les logs dans Actions
2. Consulter la documentation ci-dessus
3. Ouvrir une issue sur GitHub

---

**🎉 Bon déploiement avec Dr.MiMi!**
