// Backend Health Check & Warming Service
// Pings the Render backend to keep it awake or wake it up

const BACKEND_URL = 'https://drmimi-replit.onrender.com';
const HEALTH_ENDPOINT = `${BACKEND_URL}/api/health`;

/**
 * Checks if backend is awake and responsive
 */
export async function checkBackendHealth(): Promise<{
  isAwake: boolean;
  responseTime: number;
  error?: string;
}> {
  const startTime = Date.now();
  
  try {
    const response = await fetch(HEALTH_ENDPOINT, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
      // Timeout after 60 seconds (Render cold start can take 30-60s)
      signal: AbortSignal.timeout(60000),
    });

    const responseTime = Date.now() - startTime;

    if (response.ok) {
      console.log(`✅ Backend is awake! Response time: ${responseTime}ms`);
      return { isAwake: true, responseTime };
    } else {
      console.warn(`⚠️ Backend responded with status: ${response.status}`);
      return { 
        isAwake: false, 
        responseTime, 
        error: `HTTP ${response.status}` 
      };
    }
  } catch (error) {
    const responseTime = Date.now() - startTime;
    console.error('❌ Backend health check failed:', error);
    
    return {
      isAwake: false,
      responseTime,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Wakes up the backend by pinging the health endpoint
 * Returns a promise that resolves when backend is responsive
 */
export async function wakeUpBackend(
  maxRetries = 3,
  retryDelay = 10000 // 10 seconds between retries
): Promise<boolean> {
  console.log('🔄 Waking up backend...');
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    console.log(`Attempt ${attempt}/${maxRetries}...`);
    
    const health = await checkBackendHealth();
    
    if (health.isAwake) {
      console.log('✅ Backend is now awake!');
      return true;
    }
    
    if (attempt < maxRetries) {
      console.log(`⏳ Backend still sleeping. Waiting ${retryDelay / 1000}s before retry...`);
      await new Promise(resolve => setTimeout(resolve, retryDelay));
    }
  }
  
  console.error('❌ Backend failed to wake up after', maxRetries, 'attempts');
  return false;
}

/**
 * Keeps backend warm by pinging periodically
 * Returns a function to stop the warming
 */
export function startBackendWarming(intervalMinutes = 10): () => void {
  console.log(`🔥 Starting backend warming (every ${intervalMinutes} minutes)`);
  
  // Initial ping
  checkBackendHealth();
  
  // Periodic pings
  const intervalId = setInterval(() => {
    console.log('🔥 Warming backend...');
    checkBackendHealth();
  }, intervalMinutes * 60 * 1000);
  
  // Return cleanup function
  return () => {
    console.log('🛑 Stopping backend warming');
    clearInterval(intervalId);
  };
}

/**
 * Smart fetch with automatic backend wake-up on 503
 */
export async function fetchWithWakeup(
  url: string,
  options?: RequestInit
): Promise<Response> {
  try {
    const response = await fetch(url, options);
    
    // If 503, try to wake up backend and retry
    if (response.status === 503) {
      console.log('⚠️ Got 503 - Backend is sleeping. Waking it up...');
      
      const isAwake = await wakeUpBackend();
      
      if (isAwake) {
        console.log('🔄 Retrying original request...');
        return await fetch(url, options);
      } else {
        console.error('❌ Could not wake up backend');
        throw new Error('Backend unavailable (503) - cold start timeout');
      }
    }
    
    return response;
  } catch (error) {
    console.error('Fetch error:', error);
    throw error;
  }
}
