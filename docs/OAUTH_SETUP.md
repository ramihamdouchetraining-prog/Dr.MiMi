# Configuration OAuth pour Dr.MiMi

Ce document explique comment configurer l'authentification OAuth pour Google, Facebook et Microsoft.

## Variables d'environnement requises

Pour activer OAuth, vous devez ajouter ces variables dans votre fichier `.env` :

```env
# OAuth - Google
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret

# OAuth - Facebook  
FACEBOOK_APP_ID=your_facebook_app_id
FACEBOOK_APP_SECRET=your_facebook_app_secret

# OAuth - Microsoft (pour Outlook)
MICROSOFT_CLIENT_ID=your_microsoft_client_id
MICROSOFT_CLIENT_SECRET=your_microsoft_client_secret
```

## 1. Configuration Google OAuth

### Étapes pour obtenir les clés Google :

1. Allez sur [Google Cloud Console](https://console.cloud.google.com/)
2. Créez un nouveau projet ou sélectionnez un projet existant
3. Activez l'API Google+ dans la bibliothèque d'APIs
4. Allez dans "Identifiants" (Credentials)
5. Créez un nouvel ID client OAuth 2.0
6. Choisissez "Application Web"
7. Ajoutez ces URIs de redirection autorisés :
   - `http://localhost:5000/api/oauth/google/callback`
   - `https://votre-domaine.com/api/oauth/google/callback`
8. Copiez l'ID client et le secret client

## 2. Configuration Facebook OAuth

### Étapes pour obtenir les clés Facebook :

1. Allez sur [Facebook Developers](https://developers.facebook.com/)
2. Créez une nouvelle app ou utilisez une existante
3. Ajoutez le produit "Facebook Login"
4. Dans les paramètres de Facebook Login :
   - Activez "Client OAuth Login"
   - Activez "Web OAuth Login"
5. Ajoutez ces URIs de redirection OAuth valides :
   - `http://localhost:5000/api/oauth/facebook/callback`
   - `https://votre-domaine.com/api/oauth/facebook/callback`
6. Dans "Paramètres" → "Basique", trouvez :
   - App ID → FACEBOOK_APP_ID
   - App Secret → FACEBOOK_APP_SECRET

## 3. Configuration Microsoft OAuth (Outlook)

### Étapes pour obtenir les clés Microsoft :

1. Allez sur [Azure Portal](https://portal.azure.com/)
2. Allez dans "Azure Active Directory" → "Inscriptions d'applications"
3. Créez une nouvelle inscription
4. Choisissez "Comptes dans n'importe quel annuaire organisationnel et comptes Microsoft personnels"
5. Ajoutez l'URI de redirection :
   - Type: Web
   - URI: `http://localhost:5000/api/oauth/microsoft/callback`
6. Dans "Certificats & secrets", créez un nouveau secret client
7. Copiez :
   - Application (client) ID → MICROSOFT_CLIENT_ID
   - Secret client → MICROSOFT_CLIENT_SECRET

## 4. URLs de callback pour production

Pour la production, remplacez `localhost:5000` par votre domaine réel :

- Google: `https://votre-domaine.com/api/oauth/google/callback`
- Facebook: `https://votre-domaine.com/api/oauth/facebook/callback`
- Microsoft: `https://votre-domaine.com/api/oauth/microsoft/callback`

## 5. Test de la configuration

1. Redémarrez le serveur après avoir ajouté les variables d'environnement
2. Visitez `/api/oauth/status` pour vérifier quels providers sont configurés
3. Les boutons OAuth apparaîtront automatiquement sur la page de connexion si configurés

## Notes importantes

- Les providers OAuth ne s'affichent que s'ils sont correctement configurés
- Les utilisateurs OAuth sont automatiquement créés lors de leur première connexion
- Le rôle par défaut pour les nouveaux utilisateurs OAuth est "viewer"
- Les emails sont automatiquement vérifiés pour les utilisateurs OAuth

## Dépannage

Si OAuth ne fonctionne pas :

1. Vérifiez que les variables d'environnement sont définies
2. Vérifiez les URLs de callback dans les consoles des providers
3. Assurez-vous que les APIs sont activées (surtout pour Google)
4. Vérifiez les logs du serveur pour les erreurs détaillées