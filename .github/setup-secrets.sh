#!/bin/bash

# 🔐 Script de Configuration Automatique des Secrets GitHub Actions
# Pour Dr.MiMi - Plateforme d'Éducation Médicale

set -e

# Couleurs pour l'affichage
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}"
echo "╔═══════════════════════════════════════════════════════╗"
echo "║   🔐 Configuration des Secrets GitHub Actions        ║"
echo "║   Dr.MiMi - Plateforme d'Éducation Médicale          ║"
echo "╚═══════════════════════════════════════════════════════╝"
echo -e "${NC}"

# Vérifier que gh CLI est installé
if ! command -v gh &> /dev/null; then
    echo -e "${RED}❌ GitHub CLI (gh) n'est pas installé.${NC}"
    echo -e "${YELLOW}Installation:${NC}"
    echo -e "  macOS:   ${GREEN}brew install gh${NC}"
    echo -e "  Windows: ${GREEN}choco install gh${NC}"
    echo -e "  Linux:   ${GREEN}Voir https://cli.github.com${NC}"
    exit 1
fi

# Vérifier l'authentification
if ! gh auth status &> /dev/null; then
    echo -e "${YELLOW}🔑 Authentification GitHub requise...${NC}"
    gh auth login
fi

echo -e "${GREEN}✅ GitHub CLI configuré${NC}\n"

# Fonction pour demander un secret
ask_secret() {
    local secret_name=$1
    local description=$2
    local is_optional=$3
    
    echo -e "${BLUE}📝 Configuration: ${YELLOW}$secret_name${NC}"
    echo -e "   ${description}"
    
    if [ "$is_optional" = "true" ]; then
        echo -e "${YELLOW}   (Optionnel - Appuyez sur Entrée pour passer)${NC}"
    fi
    
    read -sp "   Entrez la valeur: " secret_value
    echo ""
    
    if [ -z "$secret_value" ] && [ "$is_optional" = "true" ]; then
        echo -e "${YELLOW}   ⏭️  Passé${NC}\n"
        return 1
    fi
    
    if [ -z "$secret_value" ] && [ "$is_optional" != "true" ]; then
        echo -e "${RED}   ❌ Valeur requise!${NC}\n"
        ask_secret "$secret_name" "$description" "$is_optional"
        return
    fi
    
    if echo "$secret_value" | gh secret set "$secret_name"; then
        echo -e "${GREEN}   ✅ $secret_name configuré${NC}\n"
    else
        echo -e "${RED}   ❌ Erreur lors de la configuration${NC}\n"
        return 1
    fi
}

# Fonction pour demander une variable
ask_variable() {
    local var_name=$1
    local description=$2
    
    echo -e "${BLUE}📝 Configuration: ${YELLOW}$var_name${NC}"
    echo -e "   ${description}"
    read -p "   Entrez la valeur: " var_value
    echo ""
    
    if [ -z "$var_value" ]; then
        echo -e "${RED}   ❌ Valeur requise!${NC}\n"
        ask_variable "$var_name" "$description"
        return
    fi
    
    if gh variable set "$var_name" --body "$var_value"; then
        echo -e "${GREEN}   ✅ $var_name configuré${NC}\n"
    else
        echo -e "${RED}   ❌ Erreur lors de la configuration${NC}\n"
        return 1
    fi
}

echo -e "${BLUE}═══════════════════════════════════════════════════════${NC}"
echo -e "${BLUE}  🗄️  CONFIGURATION NEON (Base de données)${NC}"
echo -e "${BLUE}═══════════════════════════════════════════════════════${NC}\n"

echo -e "${YELLOW}📖 Guide rapide Neon:${NC}"
echo -e "   1. Créer un compte sur ${GREEN}https://neon.tech${NC}"
echo -e "   2. Créer un projet PostgreSQL"
echo -e "   3. Obtenir les informations suivantes:\n"

# Configuration Neon
ask_variable "NEON_PROJECT_ID" "ID du projet Neon (Dashboard → Settings → Project ID)"
ask_secret "NEON_API_KEY" "Clé API Neon (Account Settings → API Keys)" "false"
ask_secret "DATABASE_URL" "URL de connexion PostgreSQL complète" "false"

echo -e "${GREEN}✅ Configuration Neon terminée!${NC}\n"

# Demander si l'utilisateur veut configurer Vercel
echo -e "${BLUE}═══════════════════════════════════════════════════════${NC}"
echo -e "${BLUE}  ⚡ CONFIGURATION VERCEL (Déploiement - Optionnel)${NC}"
echo -e "${BLUE}═══════════════════════════════════════════════════════${NC}\n"

read -p "Voulez-vous configurer le déploiement Vercel? (o/N): " configure_vercel

if [[ $configure_vercel =~ ^[oOyY]$ ]]; then
    echo -e "\n${YELLOW}📖 Guide rapide Vercel:${NC}"
    echo -e "   1. Installer: ${GREEN}npm i -g vercel${NC}"
    echo -e "   2. Se connecter: ${GREEN}vercel login${NC}"
    echo -e "   3. Lier le projet: ${GREEN}vercel link${NC}"
    echo -e "   4. Lire .vercel/project.json pour les IDs\n"
    
    ask_secret "VERCEL_TOKEN" "Token Vercel (vercel.com/account/tokens)" "true"
    
    if ask_secret "VERCEL_ORG_ID" "Organization ID (fichier .vercel/project.json)" "true"; then
        ask_secret "VERCEL_PROJECT_ID" "Project ID (fichier .vercel/project.json)" "true"
    fi
    
    echo -e "${GREEN}✅ Configuration Vercel terminée!${NC}\n"
else
    echo -e "${YELLOW}⏭️  Configuration Vercel ignorée${NC}\n"
fi

# Résumé
echo -e "${BLUE}═══════════════════════════════════════════════════════${NC}"
echo -e "${BLUE}  📊 RÉSUMÉ DE LA CONFIGURATION${NC}"
echo -e "${BLUE}═══════════════════════════════════════════════════════${NC}\n"

echo -e "${GREEN}✅ Secrets configurés:${NC}"
gh secret list | head -10

echo -e "\n${GREEN}✅ Variables configurées:${NC}"
gh variable list | head -10

echo -e "\n${BLUE}═══════════════════════════════════════════════════════${NC}"
echo -e "${BLUE}  🧪 PROCHAINES ÉTAPES${NC}"
echo -e "${BLUE}═══════════════════════════════════════════════════════${NC}\n"

echo -e "${YELLOW}Pour tester la configuration:${NC}"
echo -e "  1. Créer une branche de test:"
echo -e "     ${GREEN}git checkout -b test/github-actions${NC}"
echo -e ""
echo -e "  2. Faire un commit et pousser:"
echo -e "     ${GREEN}git commit --allow-empty -m 'test: CI/CD setup'${NC}"
echo -e "     ${GREEN}git push origin test/github-actions${NC}"
echo -e ""
echo -e "  3. Créer une Pull Request sur GitHub"
echo -e ""
echo -e "  4. Vérifier les workflows dans l'onglet ${GREEN}Actions${NC}"
echo -e ""
echo -e "  5. La branche Neon sera créée automatiquement!"

echo -e "\n${GREEN}✅ Configuration terminée avec succès!${NC}"
echo -e "${YELLOW}📚 Pour plus d'aide: ${GREEN}.github/SECRETS_SETUP.md${NC}\n"
