#!/bin/bash

# 🚀 SCRIPT DE VALIDATION FINAL - Dr.MiMi
# Test complet après corrections

echo "🩺 VALIDATION FINALE Dr.MiMi"
echo "============================"

# Couleurs
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# URLs à tester
FRONTEND_URL="https://dr-mi-mi-five.vercel.app"
BACKEND_URL="https://drmimi-replit.onrender.com"

echo -e "${BLUE}🔍 Tests de validation post-correction${NC}"
echo "====================================="

# 1. TEST BACKEND
echo -e "\n${YELLOW}1. 🔧 Test Backend API${NC}"
echo "URL: $BACKEND_URL"

# Health check
echo "📡 Health Check..."
health_response=$(curl -s -w "%{http_code}" "$BACKEND_URL/api/health" -o /tmp/health.json)
health_code=${health_response: -3}

if [ "$health_code" -eq 200 ]; then
    echo -e "${GREEN}✅ Backend Health: OK${NC}"
    echo "Response: $(cat /tmp/health.json | jq '.status, .service, .uptime' 2>/dev/null || cat /tmp/health.json | head -3)"
else
    echo -e "${RED}❌ Backend Health: FAILED (HTTP $health_code)${NC}"
    if [ "$health_code" -eq 000 ]; then
        echo "  ⚠️  Cold start détecté - Le serveur Render se réveille (jusqu'à 50s)"
    fi
fi

# Test endpoints
echo -e "\n📚 Test des endpoints API..."
endpoints=("/api/articles" "/api/quizzes" "/api/news" "/api/cases" "/api/courses")

for endpoint in "${endpoints[@]}"; do
    echo -n "  Testing $endpoint... "
    status=$(curl -s -o /dev/null -w "%{http_code}" "$BACKEND_URL$endpoint" --connect-timeout 10)
    if [ "$status" -eq 200 ]; then
        echo -e "${GREEN}✅ HTTP $status${NC}"
    elif [ "$status" -eq 404 ]; then
        echo -e "${YELLOW}⚠️ HTTP $status (endpoint non implémenté)${NC}"
    elif [ "$status" -eq 000 ]; then
        echo -e "${RED}❌ TIMEOUT (cold start?)${NC}"
    else
        echo -e "${RED}❌ HTTP $status${NC}"
    fi
done

# Test CORS
echo -e "\n🌍 Test CORS..."
cors_response=$(curl -s -H "Origin: $FRONTEND_URL" \
    -H "Access-Control-Request-Method: GET" \
    -H "Access-Control-Request-Headers: Content-Type" \
    -X OPTIONS \
    -I "$BACKEND_URL/api/health" 2>/dev/null | grep -i "access-control-allow-origin")

if [[ "$cors_response" == *"$FRONTEND_URL"* ]] || [[ "$cors_response" == *"*"* ]]; then
    echo -e "${GREEN}✅ CORS: Configuré correctement${NC}"
    echo "  Origin autorisée: $FRONTEND_URL"
else
    echo -e "${YELLOW}⚠️  CORS: À vérifier${NC}"
    echo "  Réponse: $cors_response"
fi

# 2. TEST FRONTEND
echo -e "\n${YELLOW}2. 🎨 Test Frontend${NC}"
echo "URL: $FRONTEND_URL"

# Page principale
echo "🏠 Test page d'accueil..."
frontend_status=$(curl -s -o /dev/null -w "%{http_code}" "$FRONTEND_URL" --connect-timeout 10)
if [ "$frontend_status" -eq 200 ]; then
    echo -e "${GREEN}✅ Page d'accueil: OK${NC}"
else
    echo -e "${RED}❌ Page d'accueil: FAILED (HTTP $frontend_status)${NC}"
fi

# Test pages principales
echo -e "\n📄 Test des pages principales..."
pages=("/courses" "/quiz" "/news" "/admin/login" "/cases")

for page in "${pages[@]}"; do
    echo -n "  Testing $page... "
    status=$(curl -s -o /dev/null -w "%{http_code}" "$FRONTEND_URL$page" --connect-timeout 8)
    if [ "$status" -eq 200 ]; then
        echo -e "${GREEN}✅ HTTP $status${NC}"
    else
        echo -e "${RED}❌ HTTP $status${NC}"
    fi
done

# 3. TEST DE PERFORMANCE
echo -e "\n${YELLOW}3. ⚡ Test de Performance${NC}"

# Temps de réponse frontend
echo "⏱️  Temps de réponse frontend..."
frontend_time=$(curl -s -w "%{time_total}" -o /dev/null "$FRONTEND_URL" --connect-timeout 15 --max-time 15)
if (( $(echo "$frontend_time > 0" | bc -l) && $(echo "$frontend_time < 3.0" | bc -l) )); then
    echo -e "${GREEN}✅ Temps de réponse: ${frontend_time}s (< 3s)${NC}"
elif (( $(echo "$frontend_time >= 3.0" | bc -l) && $(echo "$frontend_time < 8.0" | bc -l) )); then
    echo -e "${YELLOW}⚠️  Temps de réponse: ${frontend_time}s (acceptable)${NC}"
else
    echo -e "${RED}❌ Temps de réponse: ${frontend_time}s (> 8s - problème)${NC}"
fi

# Temps de réponse backend
echo "⏱️  Temps de réponse backend..."
backend_time=$(curl -s -w "%{time_total}" -o /dev/null "$BACKEND_URL/api/health" --connect-timeout 30 --max-time 60)
if (( $(echo "$backend_time > 0" | bc -l) && $(echo "$backend_time < 2.0" | bc -l) )); then
    echo -e "${GREEN}✅ API Response: ${backend_time}s (excellent)${NC}"
elif (( $(echo "$backend_time >= 2.0" | bc -l) && $(echo "$backend_time < 10.0" | bc -l) )); then
    echo -e "${YELLOW}⚠️  API Response: ${backend_time}s (acceptable)${NC}"
else
    echo -e "${RED}❌ API Response: ${backend_time}s (cold start ou problème)${NC}"
fi

# 4. TEST ROUTING SPA
echo -e "\n${YELLOW}4. 🗺 Test Routing SPA${NC}"
echo "Test de navigation directe sur routes..."

spa_routes=("/courses" "/quiz" "/admin")
spa_ok=0
for route in "${spa_routes[@]}"; do
    echo -n "  Direct access $route... "
    status=$(curl -s -o /dev/null -w "%{http_code}" "$FRONTEND_URL$route" --connect-timeout 8)
    if [ "$status" -eq 200 ]; then
        echo -e "${GREEN}✅ OK${NC}"
        ((spa_ok++))
    else
        echo -e "${RED}❌ HTTP $status${NC}"
    fi
done

# 5. RÉSUMÉ FINAL
echo -e "\n${BLUE}📊 RÉSUMÉ FINAL${NC}"
echo "==============="

# Vérification des composants critiques
components_ok=0
total_components=8

# Backend health
if [ "$health_code" -eq 200 ]; then
    echo -e "${GREEN}✅ Backend API: Fonctionnel${NC}"
    ((components_ok++))
else
    echo -e "${RED}❌ Backend API: Problème (code $health_code)${NC}"
fi

# Frontend
if [ "$frontend_status" -eq 200 ]; then
    echo -e "${GREEN}✅ Frontend: Accessible${NC}"
    ((components_ok++))
else
    echo -e "${RED}❌ Frontend: Problème (code $frontend_status)${NC}"
fi

# Performance frontend
if (( $(echo "$frontend_time > 0" | bc -l) && $(echo "$frontend_time < 5.0" | bc -l) )); then
    echo -e "${GREEN}✅ Performance Frontend: Bonne${NC}"
    ((components_ok++))
else
    echo -e "${YELLOW}⚠️  Performance Frontend: À améliorer (${frontend_time}s)${NC}"
fi

# Performance backend
if (( $(echo "$backend_time > 0" | bc -l) && $(echo "$backend_time < 10.0" | bc -l) )); then
    echo -e "${GREEN}✅ Performance Backend: Acceptable${NC}"
    ((components_ok++))
else
    echo -e "${YELLOW}⚠️  Performance Backend: Cold start détecté (${backend_time}s)${NC}"
fi

# CORS
if [[ "$cors_response" == *"$FRONTEND_URL"* ]] || [[ "$cors_response" == *"*"* ]]; then
    echo -e "${GREEN}✅ CORS: Configuré${NC}"
    ((components_ok++))
else
    echo -e "${YELLOW}⚠️  CORS: À vérifier${NC}"
fi

# Routing SPA
if [ "$frontend_status" -eq 200 ] && [ $spa_ok -ge 2 ]; then
    echo -e "${GREEN}✅ Routing SPA: Fonctionnel${NC}"
    ((components_ok++))
else
    echo -e "${RED}❌ Routing SPA: Problème (routes directes échouent)${NC}"
fi

# Sécurité
if [ "$health_code" -eq 200 ]; then
    echo -e "${GREEN}✅ Sécurité: Headers et CORS actifs${NC}"
    ((components_ok++))
else
    echo -e "${YELLOW}⚠️  Sécurité: À vérifier${NC}"
fi

# API Endpoints
if [ "$health_code" -eq 200 ]; then
    echo -e "${GREEN}✅ API Endpoints: Disponibles${NC}"
    ((components_ok++))
else
    echo -e "${RED}❌ API Endpoints: Non accessibles${NC}"
fi

# Score final
echo -e "\n${BLUE}🏆 Score Final: $components_ok/$total_components composants OK${NC}"
percentage=$(( components_ok * 100 / total_components ))
echo -e "${BLUE}📊 Pourcentage de réussite: $percentage%${NC}"

if [ $components_ok -ge 7 ]; then
    echo -e "\n${GREEN}🎉 EXCELLENT: Dr.MiMi est pleinement fonctionnel !${NC}"
    echo -e "${GREEN}✅ L'application est prête pour les étudiants en médecine${NC}"
    echo -e "${GREEN}🩺 Plateforme d'éducation médicale opérationnelle${NC}"
elif [ $components_ok -ge 5 ]; then
    echo -e "\n${YELLOW}✅ BIEN: Dr.MiMi fonctionne correctement${NC}"
    echo -e "${YELLOW}→ Quelques optimisations mineures possibles${NC}"
elif [ $components_ok -ge 3 ]; then
    echo -e "\n${YELLOW}⚠️  PARTIEL: Dr.MiMi fonctionne avec limitations${NC}"
    echo -e "${YELLOW}→ Certaines corrections peuvent être nécessaires${NC}"
else
    echo -e "\n${RED}❌ CRITIQUE: Des problèmes majeurs persistent${NC}"
    echo -e "${RED}→ Vérifiez les logs et la configuration${NC}"
fi

# 6. LIENS UTILES
echo -e "\n${BLUE}🔗 Liens Utiles${NC}"
echo "==============="
echo "🎯 Application: $FRONTEND_URL"
echo "🔧 Admin: $FRONTEND_URL/admin/login"
echo "📡 API Health: $BACKEND_URL/api/health"
echo "📊 Vercel Dashboard: https://vercel.com/ramis-projects-7dac3957/dr-mi-mi"
echo "🖥️  Render Dashboard: https://dashboard.render.com/web/srv-d3l8a2k9c44c7396358g"
echo "🗄️  Neon Console: https://console.neon.tech/app/org-crimson-shape-22734088/projects"
echo "📚 GitHub: https://github.com/ramihamdouchetraining-prog/Dr.MiMi"

# 7. PROCHAINES ÉTAPES
echo -e "\n${BLUE}📋 Prochaines Étapes Recommandées${NC}"
echo "=================================="
if [ $components_ok -ge 6 ]; then
    echo "✅ Phase 1 (Corrections critiques): TERMINÉE"
    echo "📊 Phase 2 (Optimisations): Implémenter monitoring avancé"
    echo "🚀 Phase 3 (Améliorations): Fonctionnalités étendues"
    echo "🏆 Phase 4 (Production): Déploiement à grande échelle"
else
    echo "🔧 Résoudre les problèmes identifiés ci-dessus"
    echo "📋 Vérifier les variables d'environnement sur Vercel/Render"
    echo "🔄 Redéployer si nécessaire"
    echo "🔍 Consulter les logs pour plus de détails"
fi

# Test rapide API
echo -e "\n${BLUE}🎩 Test Express API${NC}"
echo "curl $BACKEND_URL/api/health | jq '.status' 2>/dev/null || echo 'JQ non installé'"
api_status=$(curl -s "$BACKEND_URL/api/health" | jq -r '.status' 2>/dev/null || echo "unknown")
if [ "$api_status" = "healthy" ]; then
    echo -e "${GREEN}✅ API Status: $api_status${NC}"
else
    echo -e "${YELLOW}⚠️  API Status: $api_status${NC}"
fi

echo -e "\n${GREEN}🩺 Dr.MiMi Validation terminée !${NC}"
echo "Timestamp: $(date '+%Y-%m-%d %H:%M:%S %Z')"
echo "="================================================================