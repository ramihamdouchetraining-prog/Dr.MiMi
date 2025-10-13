# 👑 Guide d'Accès au Owner Dashboard - Dr.MiMi

## 🔐 Connexion Owner

### Étape 1 : Accéder à la Page de Connexion
Allez sur : **`/owner/login`** ou **`/owner`** (redirige automatiquement)

### Étape 2 : Identifiants
- **Username** : `MiMiBEN`
- **Password** : Votre mot de passe Owner (défini dans `OWNER_PASSWORD`)

### Étape 3 : Se Connecter
Cliquez sur **"Sign in as Owner"** 👑

---

## 📊 Fonctionnalités Disponibles Après Connexion

Une fois connecté, vous accédez au **Owner Dashboard** avec 6 onglets principaux :

### 1. 🏠 **Overview** (Vue d'Ensemble)
- **Statistiques en Temps Réel** :
  - Total utilisateurs
  - Utilisateurs actifs
  - Visiteurs du jour
  - Revenus du jour (DZD)
- **Aperçu du Contenu** :
  - Articles, Blog Posts, Cours
  - Approbations en attente
- **Actions Rapides** :
  - Nouveau contenu
  - Support
  - Produits
  - Événements

---

### 2. 📈 **Analytics Financiers** (Onglet "Analytics Financiers")

#### Fonctionnalités :
- **Dashboard Revenus** :
  - Revenus totaux par article
  - Revenus par auteur (Owner/Admin/Editor)
  - Tracking des pourcentages de partage :
    - Owner : 70%
    - Admin : 20%
    - Editor : 10%

- **Graphiques de Performance** :
  - 📊 Graphique à barres : Revenus mensuels (DZD/EUR)
  - 🥧 Graphique circulaire : Répartition des parts
  - 📈 KPI Cards : Métriques clés

- **Exports** :
  - 💾 Export CSV : Pour comptabilité
  - 📄 Export JSON : Pour analyses externes

#### Comment Utiliser :
1. Cliquez sur l'onglet **"Analytics Financiers"**
2. Consultez les graphiques et tableaux
3. Utilisez les filtres par période
4. Téléchargez les rapports avec les boutons Export

---

### 3. 📝 **Gestion des Contrats** (Onglet "Contrats")

#### Fonctionnalités :
- **Tableau de Bord Contrats** :
  - Liste de tous les contrats
  - Statuts : Draft, Pending, Active, Completed, Terminated
  - Filtres par statut et signataire

- **Création de Contrats** (Wizard 4 Étapes) :
  1. **Informations Générales** :
     - Titre du contrat
     - Type (Owner↔Admin, Owner↔Editor, Admin↔Editor)
     - Parties impliquées
     - Dates (début/fin)
  
  2. **Répartition des Revenus** :
     - Pourcentages personnalisables
     - Owner : 30-70%
     - Admin : 20-40%
     - Editor : 10-40%
  
  3. **Clauses Contractuelles** :
     - Confidentialité
     - Propriété intellectuelle
     - Résiliation anticipée
     - Clauses personnalisées
  
  4. **Révision et Validation** :
     - Preview complet du contrat
     - Vérification des détails
     - Création finale

- **Workflow de Signature Électronique** :
  - ✍️ Stepper visuel avec suivi en temps réel
  - 🔒 Signatures électroniques juridiques (conformité eIDAS/ESIGN)
  - 📝 Audit Trail complet :
    - IP Address
    - Timestamp exact
    - User-Agent (navigateur)
  - 🔔 Notifications temps réel (WebSocket) lors des signatures

- **Preview et Gestion** :
  - 👁️ Preview PDF des contrats
  - 📥 Téléchargement PDF avec watermarks et QR codes
  - 🗑️ Archivage/Suppression
  - 📊 Historique des modifications

#### Comment Utiliser :
1. Cliquez sur l'onglet **"Contrats"**
2. Cliquez sur **"+ Nouveau Contrat"** pour créer
3. Suivez le wizard 4 étapes
4. Les signataires reçoivent des notifications pour signer
5. Suivez le workflow d'approbation avec le stepper visuel
6. Téléchargez le PDF une fois signé

---

### 4. ✅ **Approbations** (Onglet "Approvals")
- **Contenu en Attente** :
  - Articles soumis par Editors
  - Blog posts
  - Nouveaux cours
- **Actions** :
  - ✅ Approuver
  - ❌ Rejeter
  - 👁️ Prévisualiser

#### Comment Utiliser :
1. Cliquez sur l'onglet **"Approvals"**
2. Consultez la liste des soumissions
3. Cliquez sur **"Preview"** pour voir le contenu
4. Approuvez ✅ ou rejetez ❌

---

### 5. 👥 **Gestion des Utilisateurs** (Onglet "Users")
- **Liste Complète** :
  - Tous les utilisateurs inscrits
  - Rôles : Owner, Admin, Editor, Viewer, Consultant
- **Actions** :
  - 🔄 Changer le rôle d'un utilisateur
  - 🚫 Blacklist / Unblacklist
  - 👁️ Voir le profil complet
  - 🗑️ Supprimer un compte

#### Comment Utiliser :
1. Cliquez sur l'onglet **"Users"**
2. Cherchez un utilisateur
3. Actions disponibles :
   - Changer rôle : Cliquez sur l'icône Shield
   - Blacklist : Cliquez sur l'icône interdiction
   - Voir profil : Cliquez sur l'icône œil

---

### 6. ⚙️ **Paramètres du Site** (Onglet "Settings")
- **Personnalisation** :
  - Nom du site
  - Slogan
  - Logo (upload)
  - Couleurs principales
- **Configuration SEO** :
  - Meta description
  - Keywords
  - Open Graph tags
- **Maintenance** :
  - Mode maintenance ON/OFF
  - Message personnalisé

#### Comment Utiliser :
1. Cliquez sur l'onglet **"Settings"**
2. Modifiez les champs souhaités
3. Upload nouveau logo si besoin
4. Cliquez sur **"Save"**

---

## 🎨 **CMS Amélioré avec Extensions Modernes**

### Accès au CMS
1. Allez dans **"Approvals"** ou créez un nouvel article
2. Utilisez l'éditeur TipTap moderne

### Nouveaux Blocs Disponibles

#### 1. 🖼️ **ImageGallery** (Galerie d'Images)
- **Commande Slash** : `/galerie`
- **Fonctionnalités** :
  - Multi-images (2-12 images)
  - 3 layouts : Grid, Masonry, Horizontal
  - 2-4 colonnes configurables
  - Captions individuelles
- **Utilisation** :
  ```
  Tapez : /galerie
  → Choisissez les images
  → Sélectionnez le layout
  → Ajoutez des captions
  ```

#### 2. 📢 **Callout** (Blocs d'Alerte Colorés)
- **Commandes Slash** :
  - `/info` - Bloc bleu informatif 💙
  - `/warning` - Bloc orange attention ⚠️
  - `/success` - Bloc vert succès ✅
  - `/danger` - Bloc rouge danger 🚨
  - `/note` - Bloc violet note 📝
- **Utilisation** :
  ```
  Tapez : /warning
  → Écrivez votre message
  → Icône et couleur automatiques
  ```

#### 3. 💰 **PaywallBlock** (Contenu Premium)
- **Commande Slash** : `/paywall`
- **Fonctionnalités** :
  - Contenu flouté avant achat
  - Prix configurable (DZD/EUR)
  - Bouton d'achat stylé
  - Preview du contenu premium
- **Utilisation** :
  ```
  Tapez : /paywall
  → Définissez le prix
  → Rédigez le contenu premium
  → Prévisualisez le rendu
  ```

### 📋 **Templates Médicaux**
Cliquez sur le bouton **"Templates"** dans la toolbar :

1. **📚 Cours Complet** :
   - Structure pédagogique
   - Objectifs d'apprentissage
   - Contenu théorique
   - Exercices pratiques
   - Ressources

2. **🏥 Cas Clinique Détaillé** :
   - Présentation du patient
   - Anamnèse complète
   - Examen clinique
   - Hypothèses diagnostiques
   - Plan thérapeutique

3. **📖 Protocole Médical** :
   - Indications
   - Contre-indications
   - Procédure étape par étape
   - Complications possibles
   - Recommandations

4. **📝 Guide Pratique** :
   - Introduction
   - Étapes détaillées
   - Conseils pratiques
   - Erreurs à éviter
   - Conclusion

---

## 🔔 **Notifications en Temps Réel**

Le système utilise **WebSocket** pour les notifications instantanées :

### Événements Notifiés :
- 🔔 Nouvelle signature de contrat
- 📝 Contenu soumis pour approbation
- 💰 Nouveau paiement reçu
- 👤 Nouvel utilisateur inscrit
- ⚠️ Contrat expirant bientôt

### Où les Voir :
- Icône cloche en haut à droite (quand implémentée)
- Toasts en bas à droite
- Badge rouge sur l'onglet concerné

---

## 📱 **Responsive & Mobile**

Toutes les fonctionnalités Owner Dashboard sont **100% responsive** :
- 📱 **Mobile** : Menu hamburger, cards empilées
- 💻 **Tablet** : Grid 2 colonnes
- 🖥️ **Desktop** : Grid 3-4 colonnes, sidebar

---

## 🆘 **Dépannage Rapide**

### Problème : Je ne vois pas les onglets Analytics/Contrats
**Solution** : Vérifiez que vous êtes bien connecté en tant qu'Owner, pas Admin

### Problème : Les graphiques ne s'affichent pas
**Solution** : Attendez 2-3 secondes pour le chargement des données

### Problème : Je ne peux pas créer de contrat
**Solution** : Assurez-vous qu'il y a au moins 2 utilisateurs (Owner + Admin/Editor)

### Problème : Les signatures ne fonctionnent pas
**Solution** : Vérifiez que WebSocket est actif (console développeur)

---

## 🎯 **Raccourcis Clavier** (CMS)

- `Ctrl/Cmd + B` : Gras
- `Ctrl/Cmd + I` : Italique
- `Ctrl/Cmd + U` : Souligné
- `Ctrl/Cmd + K` : Insérer lien
- `Ctrl/Cmd + Z` : Annuler
- `Ctrl/Cmd + Shift + Z` : Rétablir
- `/` : Ouvrir menu slash commands

---

## 🌟 **Fonctionnalités Futures**

- 🤖 Chatbot Dr. Mimi avec IA (OpenAI/Claude)
- 💳 Paiements Stripe production (EUR)
- 📊 Exports Excel avancés
- 📧 Système d'emailing automatique
- 🎓 Certificats de formation automatiques

---

## 💡 **Conseils d'Utilisation**

1. **Créez vos contrats dès le début** pour formaliser les collaborations
2. **Consultez les analytics chaque semaine** pour suivre la croissance
3. **Utilisez les templates CMS** pour gagner du temps
4. **Activez les notifications** pour ne rien manquer
5. **Exportez régulièrement les données** pour archivage

---

## 📞 **Support**

Si vous avez besoin d'aide :
1. Consultez ce guide
2. Vérifiez la console développeur (F12)
3. Consultez `CONTRACT_MANAGEMENT_GUIDE.md` pour détails contrats
4. Consultez `CMS_ADVANCED_GUIDE.md` pour détails CMS

---

**🎉 Bon Usage de Votre Plateforme Dr.MiMi !**

*Dernière mise à jour : 9 Octobre 2025*
