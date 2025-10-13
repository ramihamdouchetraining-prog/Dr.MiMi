#!/bin/bash

echo "🔍 TEST CONNEXION NETLIFY ↔ RENDER"
echo "===================================="
echo ""

# Couleurs
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Test 1: Backend accessible
echo "1️⃣ Test Backend Render accessible..."
BACKEND_STATUS=$(curl -s -o /dev/null -w "%{http_code}" https://drmimi-replit.onrender.com/api/health)
if [ "$BACKEND_STATUS" = "200" ]; then
  echo -e "${GREEN}✅ Backend OK${NC} (Status: $BACKEND_STATUS)"
else
  echo -e "${RED}❌ Backend DOWN${NC} (Status: $BACKEND_STATUS)"
  exit 1
fi

# Test 2: CORS headers
echo ""
echo "2️⃣ Test CORS Headers..."
CORS_ORIGIN=$(curl -s -I -H "Origin: https://dr-mimi.netlify.app" https://drmimi-replit.onrender.com/api/health | grep -i "access-control-allow-origin" | cut -d' ' -f2 | tr -d '\r')

if [ -z "$CORS_ORIGIN" ]; then
  echo -e "${YELLOW}⚠️  Pas de header Access-Control-Allow-Origin${NC}"
  echo "   Note: Certains serveurs ne renvoient pas ce header pour GET simple"
else
  echo -e "${GREEN}✅ CORS Origin:${NC} $CORS_ORIGIN"
fi

# Test 3: Credentials header
CORS_CREDS=$(curl -s -I -H "Origin: https://dr-mimi.netlify.app" https://drmimi-replit.onrender.com/api/health | grep -i "access-control-allow-credentials" | cut -d' ' -f2 | tr -d '\r')

if [ "$CORS_CREDS" = "true" ]; then
  echo -e "${GREEN}✅ CORS Credentials:${NC} $CORS_CREDS"
else
  echo -e "${RED}❌ CORS Credentials manquant${NC}"
fi

# Test 4: Test login endpoint (OPTIONS preflight)
echo ""
echo "3️⃣ Test Login Endpoint (OPTIONS preflight)..."
OPTIONS_STATUS=$(curl -s -o /dev/null -w "%{http_code}" -X OPTIONS -H "Origin: https://dr-mimi.netlify.app" -H "Access-Control-Request-Method: POST" https://drmimi-replit.onrender.com/api/auth/login)

if [ "$OPTIONS_STATUS" = "200" ] || [ "$OPTIONS_STATUS" = "204" ]; then
  echo -e "${GREEN}✅ Preflight OK${NC} (Status: $OPTIONS_STATUS)"
else
  echo -e "${RED}❌ Preflight FAILED${NC} (Status: $OPTIONS_STATUS)"
fi

# Test 5: Vérifier route root
echo ""
echo "4️⃣ Test Route Root..."
ROOT_RESPONSE=$(curl -s https://drmimi-replit.onrender.com/ | jq -r '.name' 2>/dev/null)

if [ "$ROOT_RESPONSE" = "MediMimi API" ]; then
  echo -e "${GREEN}✅ Route Root OK${NC} (Nom: $ROOT_RESPONSE)"
else
  echo -e "${YELLOW}⚠️  Route Root:${NC} $ROOT_RESPONSE"
fi

# Résumé
echo ""
echo "===================================="
echo "📊 RÉSUMÉ:"
echo "   Backend: https://drmimi-replit.onrender.com"
echo "   Frontend: https://dr-mimi.netlify.app"
echo ""
echo "🎯 PROCHAINE ÉTAPE:"
echo "   1. Attends 3-4 min que Netlify finisse le déploiement"
echo "   2. Ouvre https://dr-mimi.netlify.app/login"
echo "   3. Ouvre Console (F12) → Network tab"
echo "   4. Tente de te connecter"
echo "   5. Vérifie les requêtes vers https://drmimi-replit.onrender.com"
echo ""
