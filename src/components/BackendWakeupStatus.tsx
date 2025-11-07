import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, CheckCircle, AlertCircle, Coffee } from 'lucide-react';

interface BackendStatusProps {
  show: boolean;
  onReady?: () => void;
}

export function BackendWakeupStatus({ show, onReady }: BackendStatusProps) {
  const [status, setStatus] = useState<'checking' | 'waking' | 'ready' | 'error'>('checking');
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    if (!show) return;

    let timer: NodeJS.Timeout;
    const startTime = Date.now();

    // Update elapsed time every second
    timer = setInterval(() => {
      setElapsed(Math.floor((Date.now() - startTime) / 1000));
    }, 1000);

    // Check backend health
    fetch('https://drmimi-replit.onrender.com/api/health')
      .then(res => {
        if (res.ok) {
          setStatus('ready');
          onReady?.();
          setTimeout(() => clearInterval(timer), 2000);
        } else {
          setStatus('waking');
        }
      })
      .catch(() => {
        setStatus('waking');
      });

    return () => clearInterval(timer);
  }, [show, onReady]);

  if (!show) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center"
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="bg-gray-900 border border-gray-800 rounded-2xl p-8 max-w-md mx-4 shadow-2xl"
        >
          {/* Status Icon */}
          <div className="flex justify-center mb-6">
            {status === 'checking' && (
              <Loader2 className="w-16 h-16 text-blue-500 animate-spin" />
            )}
            {status === 'waking' && (
              <Coffee className="w-16 h-16 text-amber-500 animate-pulse" />
            )}
            {status === 'ready' && (
              <CheckCircle className="w-16 h-16 text-green-500" />
            )}
            {status === 'error' && (
              <AlertCircle className="w-16 h-16 text-red-500" />
            )}
          </div>

          {/* Status Message */}
          <div className="text-center">
            {status === 'checking' && (
              <>
                <h3 className="text-xl font-bold text-white mb-2">
                  Connexion au serveur...
                </h3>
                <p className="text-gray-400">
                  Vérification de l'état du backend
                </p>
              </>
            )}

            {status === 'waking' && (
              <>
                <h3 className="text-xl font-bold text-white mb-2">
                  ☕ Réveil du serveur...
                </h3>
                <p className="text-gray-400 mb-4">
                  Le serveur était en veille. Première connexion peut prendre 30-60 secondes.
                </p>
                <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>{elapsed}s écoulées</span>
                </div>
                <p className="text-xs text-gray-600 mt-4">
                  Ceci est normal avec les services gratuits Render
                </p>
              </>
            )}

            {status === 'ready' && (
              <>
                <h3 className="text-xl font-bold text-green-400 mb-2">
                  ✅ Serveur prêt !
                </h3>
                <p className="text-gray-400">
                  Connexion établie en {elapsed}s
                </p>
              </>
            )}

            {status === 'error' && (
              <>
                <h3 className="text-xl font-bold text-red-400 mb-2">
                  ❌ Erreur de connexion
                </h3>
                <p className="text-gray-400 mb-4">
                  Impossible de contacter le serveur
                </p>
                <button
                  onClick={() => window.location.reload()}
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
                >
                  Réessayer
                </button>
              </>
            )}
          </div>

          {/* Progress Bar for Waking */}
          {status === 'waking' && (
            <div className="mt-6">
              <div className="w-full bg-gray-800 rounded-full h-2 overflow-hidden">
                <motion.div
                  className="h-full bg-gradient-to-r from-amber-500 to-orange-500"
                  initial={{ width: '0%' }}
                  animate={{ width: `${Math.min((elapsed / 60) * 100, 100)}%` }}
                  transition={{ duration: 1 }}
                />
              </div>
            </div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
