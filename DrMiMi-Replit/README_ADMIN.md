# Guide d'Administration Dr.MiMi

## 🔐 Accès Admin

L'accès administrateur est réservé à :
- **Email owner** : Défini dans la variable d'environnement `ADMIN_EMAIL`
- **Utilisateurs avec rôle admin** : Assigné manuellement dans la base de données

### Connexion
1. Accéder à `/admin` sur votre instance Dr.MiMi
2. Se connecter avec un compte autorisé
3. Le système vérifie automatiquement les permissions

## 📊 Tableau de Bord

### Vue d'ensemble
- **Statistiques en temps réel** : Utilisateurs actifs, revenus, visiteurs
- **Graphiques interactifs** : Tendances sur 7, 30, 90 jours ou 1 an
- **Export CSV** : Téléchargement des données pour analyse externe

### KPI principaux
- **Utilisateurs actifs** : Nombre total d'utilisateurs non blacklistés
- **Revenus du mois** : Total des transactions en DZD
- **Articles publiés** : Contenu disponible sur la plateforme
- **Visiteurs aujourd'hui** : Trafic quotidien unique

## 📝 Gestion du Contenu

### Articles (Blog/News)

#### Créer un article
1. Naviguer vers `/admin/articles`
2. Cliquer sur "Nouvel Article"
3. Remplir les champs obligatoires :
   - Titre
   - Catégorie (Actualités, Conseils, Études, Carrière, Innovation)
   - Contenu (éditeur WYSIWYG)
   - Extrait

#### Fonctionnalités avancées
- **Monétisation** : Définir un prix en DZD (taxe 19% appliquée automatiquement)
- **SEO** : Meta title et meta description pour le référencement
- **Upload média** : Images jusqu'à 10MB, vidéos jusqu'à 200MB
- **Versioning** : Historique automatique de toutes les modifications
- **Statuts** :
  - `draft` : Brouillon en cours d'édition
  - `review` : En attente de validation
  - `published` : Visible publiquement
  - `archived` : Retiré de la publication

#### Éditeur WYSIWYG
L'éditeur React Quill offre :
- Formatage riche (gras, italique, souligné)
- Titres hiérarchiques (H1-H6)
- Listes ordonnées et non ordonnées
- Citations et blocs de code
- Insertion d'images et vidéos
- Support RTL pour l'arabe

### Upload de Médias

Les médias sont stockés dans Object Storage avec :
- **Optimisation automatique** des images
- **CDN** pour diffusion rapide
- **Sécurité** : Scan antivirus automatique
- **Formats supportés** : JPG, PNG, GIF, WebP, MP4, WebM

## 💰 Monétisation avec Stripe

### Configuration
1. Ajouter les clés Stripe dans `.env` :
   ```env
   STRIPE_SECRET_KEY=sk_test_...
   STRIPE_PUBLISHABLE_KEY=pk_test_...
   STRIPE_WEBHOOK_SECRET=whsec_...
   ```

2. Configuration du webhook :
   - URL : `https://votre-domaine.replit.app/api/stripe/webhook`
   - Événements : `checkout.session.completed`

### Gestion des prix
- **Devise principale** : DZD (Dinar algérien)
- **Conversion automatique** : DZD vers USD pour Stripe
- **Taxe** : 19% appliquée automatiquement
- **Types de contenu payant** :
  - Articles premium
  - Cours complets
  - Résumés PDF

### Processus de paiement
1. Client clique sur "Acheter"
2. Création d'une session Stripe Checkout
3. Redirection vers la page de paiement sécurisée
4. Webhook confirme le paiement
5. Accès débloqué automatiquement

## 📈 Analytics

### Métriques disponibles
- **Visiteurs par jour** : Graphique d'évolution
- **Revenus par jour** : Performance financière
- **Pages populaires** : Top 10 des contenus
- **Taux d'engagement** : Ratio utilisateurs actifs/total
- **Sources de trafic** : Origine des visiteurs

### Export de données
- Format CSV pour Excel/Google Sheets
- Périodes personnalisables
- Données segmentées par type

### Filtres
- **Période** : 7 jours, 30 jours, 90 jours, 1 an
- **Type d'utilisateur** : Tous, Étudiants, Premium
- **Contenu** : Articles, Cours, Quiz

## 👥 Gestion des Utilisateurs

### Rôles disponibles
- **student** : Utilisateur standard
- **creator** : Peut créer du contenu
- **manager** : Gestion du contenu et modération
- **admin** : Accès complet au système

### Modération
- **Blacklist** : Bloquer des utilisateurs problématiques
- **Scopes** : `comments`, `chat`, `site`
- **Durée** : Temporaire ou permanente
- **Journal** : Historique de toutes les actions

## 🔧 Maintenance

### Base de données
```bash
# Appliquer les migrations
npm run db:push

# Forcer les migrations (attention aux données)
npm run db:push --force

# Seed initial
npm run seed
```

### Logs et monitoring
- Logs serveur dans la console Replit
- Erreurs client dans la console navigateur
- Webhook Stripe dans le dashboard Stripe

## 🚀 Déploiement

### Variables d'environnement requises
```env
DATABASE_URL=postgresql://...
ADMIN_EMAIL=merieme.bennamane@medecine.dz
SESSION_SECRET=random-secret-key
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
DEFAULT_CURRENCY=DZD
DEFAULT_TAX_RATE=19
UPLOAD_MAX_SIZE_IMAGE=10485760
UPLOAD_MAX_SIZE_VIDEO=209715200
```

### Checklist de production
- [ ] Variables d'environnement configurées
- [ ] Base de données PostgreSQL provisionnée
- [ ] Object Storage configuré
- [ ] Stripe en mode production
- [ ] Domaine personnalisé configuré
- [ ] SSL/HTTPS activé
- [ ] Backups automatiques configurés

## 📞 Support

Pour toute question ou problème :
- Documentation technique : `/docs`
- Email support : Défini dans `ADMIN_EMAIL`
- Dashboard Stripe : https://dashboard.stripe.com
- Console Replit : https://replit.com

---

*Dernière mise à jour : Décembre 2024*
*Version : 1.0.0*