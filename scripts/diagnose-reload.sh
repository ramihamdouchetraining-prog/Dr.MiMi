#!/bin/bash

# Script de diagnostic pour identifier la cause des reloads automatiques
echo "🔍 Diagnostic de la plateforme MediMimi"
echo "======================================="
echo ""

# 1. Vérifier les processus en cours
echo "📊 Processus Node.js actifs :"
ps aux | grep -E "node|npm|tsx|vite" | grep -v grep | wc -l
echo ""

# 2. Vérifier les ports utilisés
echo "🔌 Ports utilisés (3001=backend, 5000=frontend) :"
lsof -i :3001 -i :5000 2>/dev/null | grep LISTEN || echo "Aucun processus trouvé"
echo ""

# 3. Vérifier les logs récents du backend
echo "📝 Dernières lignes des logs backend :"
if [ -f "server/logs/error.log" ]; then
  tail -n 5 server/logs/error.log
else
  echo "Pas de fichier de logs d'erreur"
fi
echo ""

# 4. Vérifier la configuration HMR
echo "⚡ Configuration HMR (vite.config.ts) :"
grep -A 5 "hmr:" vite.config.ts || echo "Configuration HMR non trouvée"
echo ""

# 5. Vérifier le Service Worker
echo "🔧 Service Worker actif ? :"
grep -c "serviceWorker.register" src/main.tsx
if [ $? -eq 0 ]; then
  echo "⚠️  Service Worker ACTIF (peut causer des reloads)"
else
  echo "✅ Service Worker désactivé"
fi
echo ""

# 6. Surveiller les reloads (à lancer manuellement)
echo "👁️  Pour surveiller les reloads en temps réel :"
echo "   1. Ouvrir http://localhost:5000"
echo "   2. Ouvrir la console (F12)"
echo "   3. Coller ce code dans la console :"
echo ""
cat <<'EOF'
let reloadCount = 0;
window.addEventListener('beforeunload', () => {
  reloadCount++;
  console.warn(`🔄 RELOAD #${reloadCount} détecté à ${new Date().toLocaleTimeString()}`);
});

// Surveiller les erreurs JS
window.addEventListener('error', (e) => {
  console.error('❌ Erreur JS:', e.message, e.filename, e.lineno);
});

// Surveiller les WebSocket
const originalWebSocket = window.WebSocket;
window.WebSocket = function(...args) {
  const ws = new originalWebSocket(...args);
  console.log('🔌 WebSocket ouvert:', args[0]);
  ws.addEventListener('close', () => console.warn('❌ WebSocket fermé'));
  ws.addEventListener('error', (e) => console.error('❌ WebSocket erreur:', e));
  return ws;
};

console.log('✅ Monitoring des reloads activé');
EOF
echo ""

echo "✅ Diagnostic terminé"
echo ""
echo "📌 Actions recommandées :"
echo "   - Si reloads persistent: ouvrir la console navigateur (F12)"
echo "   - Vérifier l'onglet Network pour requêtes en boucle"
echo "   - Vérifier l'onglet Console pour erreurs JavaScript"
echo "   - Vérifier l'onglet Application > Service Workers"
