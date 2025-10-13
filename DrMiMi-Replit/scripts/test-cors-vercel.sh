#!/bin/bash

# Script de test CORS pour URLs Vercel
# Usage: bash scripts/test-cors-vercel.sh [preview-url]

echo "╔══════════════════════════════════════════════════════════════╗"
echo "║           🧪 TEST CORS VERCEL - VALIDATION                   ║"
echo "╚══════════════════════════════════════════════════════════════╝"
echo ""

BACKEND_URL="https://drmimi-replit.onrender.com"
PRODUCTION_URL="https://dr-mi-mi-replit.vercel.app"
PREVIEW_URL="${1:-https://dr-mi-mi-replit-test-ramis-projects-7dac3957.vercel.app}"

echo "🎯 URLs de test:"
echo "  Backend: $BACKEND_URL"
echo "  Production: $PRODUCTION_URL"
echo "  Preview: $PREVIEW_URL"
echo ""

# Test 1: Health check
echo "┌─────────────────────────────────────────────────────────────┐"
echo "│ Test 1: Backend Health Check                                │"
echo "└─────────────────────────────────────────────────────────────┘"
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" "$BACKEND_URL/api/health")
if [ "$HTTP_CODE" = "200" ]; then
  echo "✅ Backend répond (HTTP $HTTP_CODE)"
else
  echo "❌ Backend ne répond pas (HTTP $HTTP_CODE)"
fi
echo ""

# Test 2: CORS Production URL
echo "┌─────────────────────────────────────────────────────────────┐"
echo "│ Test 2: CORS avec URL Production                            │"
echo "└─────────────────────────────────────────────────────────────┘"
CORS_HEADER=$(curl -s -X OPTIONS "$BACKEND_URL/api/auth/me" \
  -H "Origin: $PRODUCTION_URL" \
  -H "Access-Control-Request-Method: GET" \
  -i | grep -i "access-control-allow-origin")

if [ -n "$CORS_HEADER" ]; then
  echo "✅ CORS Production URL autorisée"
  echo "   $CORS_HEADER"
else
  echo "❌ CORS Production URL bloquée"
fi
echo ""

# Test 3: CORS Preview URL
echo "┌─────────────────────────────────────────────────────────────┐"
echo "│ Test 3: CORS avec URL Preview                               │"
echo "└─────────────────────────────────────────────────────────────┘"
CORS_HEADER=$(curl -s -X OPTIONS "$BACKEND_URL/api/auth/me" \
  -H "Origin: $PREVIEW_URL" \
  -H "Access-Control-Request-Method: GET" \
  -i | grep -i "access-control-allow-origin")

if [ -n "$CORS_HEADER" ]; then
  echo "✅ CORS Preview URL autorisée"
  echo "   $CORS_HEADER"
else
  echo "❌ CORS Preview URL bloquée"
fi
echo ""

# Test 4: CORS avec URL invalide
echo "┌─────────────────────────────────────────────────────────────┐"
echo "│ Test 4: CORS avec URL invalide (doit être rejetée)          │"
echo "└─────────────────────────────────────────────────────────────┘"
CORS_HEADER=$(curl -s -X OPTIONS "$BACKEND_URL/api/auth/me" \
  -H "Origin: https://malicious-site.com" \
  -H "Access-Control-Request-Method: GET" \
  -i | grep -i "access-control-allow-origin")

if [ -z "$CORS_HEADER" ]; then
  echo "✅ CORS URL invalide correctement rejetée"
else
  echo "❌ CORS URL invalide autorisée (PROBLÈME DE SÉCURITÉ !)"
  echo "   $CORS_HEADER"
fi
echo ""

# Test 5: API Login (test complet)
echo "┌─────────────────────────────────────────────────────────────┐"
echo "│ Test 5: Test API Login Admin                                │"
echo "└─────────────────────────────────────────────────────────────┘"
LOGIN_RESPONSE=$(curl -s -X POST "$BACKEND_URL/api/admin/login" \
  -H "Origin: $PRODUCTION_URL" \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@medimimi.com","password":"DrMimiAdmin2025!"}' \
  -w "\n%{http_code}")

HTTP_CODE=$(echo "$LOGIN_RESPONSE" | tail -n1)
RESPONSE_BODY=$(echo "$LOGIN_RESPONSE" | head -n-1)

if [ "$HTTP_CODE" = "200" ]; then
  echo "✅ API Login répond (HTTP $HTTP_CODE)"
  echo "   Response: $(echo $RESPONSE_BODY | jq -r '.user.email' 2>/dev/null || echo $RESPONSE_BODY | head -c 100)"
else
  echo "❌ API Login échoue (HTTP $HTTP_CODE)"
  echo "   Response: $(echo $RESPONSE_BODY | head -c 100)"
fi
echo ""

# Résumé
echo "╔══════════════════════════════════════════════════════════════╗"
echo "║                    📊 RÉSUMÉ DES TESTS                       ║"
echo "╚══════════════════════════════════════════════════════════════╝"
echo ""
echo "✅ Tests réussis attendus:"
echo "   1. Backend Health Check"
echo "   2. CORS Production URL"
echo "   3. CORS Preview URL"
echo "   4. CORS URL invalide rejetée"
echo "   5. API Login Admin"
echo ""
echo "Si tous les tests sont ✅, le CORS est correctement configuré !"
echo ""
