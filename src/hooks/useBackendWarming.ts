// App initialization with backend warming
import { useEffect } from 'react';
import { checkBackendHealth, startBackendWarming } from '../utils/backendWarming';

/**
 * Hook to warm up backend on app mount
 * Should be used in main App component
 */
export function useBackendWarming() {
  useEffect(() => {
    // Check backend health on mount
    console.log('🔥 Initializing backend connection...');
    
    checkBackendHealth().then(health => {
      if (health.isAwake) {
        console.log(`✅ Backend ready (${health.responseTime}ms)`);
      } else {
        console.warn('⚠️ Backend is sleeping, will wake up on first request');
      }
    });

    // Start periodic warming (every 10 minutes)
    // This prevents backend from going to sleep during active sessions
    const stopWarming = startBackendWarming(10);

    // Cleanup on unmount
    return () => {
      stopWarming();
    };
  }, []);
}
