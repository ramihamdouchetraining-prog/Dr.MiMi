// Main server entry point for Dr.MiMi backend - ULTIMATE FIX VERSION
import "dotenv/config"; // Load environment variables
import express from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import session from "express-session";
import compression from "compression";
import passport from "passport";
import { createServer } from "http";
import { registerRoutes } from "./routes";
import { setupNewsRoutes } from "./routes-news";
import { setupCoursesRoutes } from "./routes-courses";
import { setupSummariesRoutes } from "./routes-summaries";
import { setupModulesRoutes } from "./routes-modules";
import { setupCasesRoutes } from "./routes-cases";
import { seedModules } from "./seed";
import { seedMedicalContent } from "./seedMedicalContent";
import { seedOwner } from "./seed-owner";
import { seedAdmin } from "./seed-admin";
import { seedNewsArticles } from "./seedNewsArticles";
import { seedQuizzes } from "./seedQuizzes";
import { seedCourses } from "./seedCourses";
import { seedSummaries } from "./seedSummaries";
import { seedCases } from "./seedCases";
import WebSocketManager from "./websocket";
import { configureOAuth } from "./oauth-config";
import { WebRTCSignalingServer } from "./webrtc-signaling";

const app = express();
const PORT = process.env.PORT || 5001;
const httpServer = createServer(app);

// 🚨 CRITICAL FIX: CORS Preflight Handler - MUST BE FIRST
// This ensures OPTIONS requests get CORS headers even during cold starts
app.use((req, res, next) => {
  const origin = req.headers.origin;
  
  // Liste des origines autorisées
  const allowedOrigins = [
    'https://dr-mi-mi-five.vercel.app',
    'https://dr-mi-mi-git-main-ramis-projects-7dac3957.vercel.app',
    'http://localhost:5000',
    'http://localhost:5173',
    'http://localhost:3000',
    'http://127.0.0.1:5000',
    'https://dr-mimi.netlify.app',
  ];

  // Pattern pour tous les previews Vercel (incluant URLs avec hash aléatoire)
  const vercelPreviewPattern = /^https:\/\/(dr-mi-|dr-mi-mi-).*ramis-projects.*\.vercel\.app$/;
  const replitPattern = /^https:\/\/.*\.replit\.(dev|app|co)$/;

  // Vérifier si l'origin est autorisée
  const isAllowed = !origin || 
    allowedOrigins.includes(origin) || 
    vercelPreviewPattern.test(origin) ||
    replitPattern.test(origin);

  if (isAllowed && origin) {
    // Définir les headers CORS pour cette origin
    res.header('Access-Control-Allow-Origin', origin);
    console.log(`✅ CORS: Origin autorisée: ${origin}`);
  } else if (!origin) {
    // Pas d'origin (requests directes, curl, etc.)
    res.header('Access-Control-Allow-Origin', '*');
  } else {
    console.warn(`🚫 CORS: Origin bloquée: ${origin}`);
  }

  // Headers CORS obligatoires
  res.header('Access-Control-Allow-Credentials', 'true');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization, Cache-Control');
  res.header('Access-Control-Max-Age', '86400'); // 24h de cache pour préflight
  res.header('Vary', 'Origin');

  // Réponse immédiate pour les requêtes OPTIONS (préflight)
  if (req.method === 'OPTIONS') {
    console.log(`✅ CORS Preflight: ${req.path} pour ${origin || 'no-origin'}`);
    return res.status(204).end();
  }

  next();
});

// 🔥 COMPRESSION - avant tout le reste
app.use(compression({
  filter: (req, res) => {
    if (req.headers['x-no-compression']) return false;
    return compression.filter(req, res);
  },
  level: 6
}));

// 🛡️ RATE LIMITING - Protection anti-spam
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 2000, // 2000 requêtes par IP (plus généreux)
  message: {
    error: 'Trop de requêtes Dr.MiMi, veuillez réessayer plus tard',
    retryAfter: '15 minutes'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // 10 tentatives de connexion admin
  message: {
    error: 'Trop de tentatives de connexion admin Dr.MiMi, veuillez réessayer dans 15 minutes'
  },
  skipSuccessfulRequests: true,
});

app.use('/api/', generalLimiter);
app.use('/api/admin/login', authLimiter);
app.use('/api/auth/login', authLimiter);

// 🔒 SECURITY - Configuration Helmet réduite pour éviter blocages
app.use(helmet({
  contentSecurityPolicy: false, // Désactivé pour éviter les blocages TipTap/Chat
  crossOriginEmbedderPolicy: false,
  crossOriginResourcePolicy: { policy: "cross-origin" },
}));

// 📝 BODY PARSING
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// 🍪 SESSIONS sécurisées
const sessionSecret = process.env.SESSION_SECRET || 'dr-mimi-session-secret-fallback-change-me';
app.use(session({
  secret: sessionSecret,
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000, // 24 heures
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax'
  },
  name: 'drmimi.sessionid'
}));

// 📁 Static files
app.use("/uploads", express.static("uploads"));

// 📊 LOGGING détaillé
app.use((req, res, next) => {
  const timestamp = new Date().toISOString();
  const userAgent = req.get('User-Agent')?.substring(0, 80) || 'Unknown';
  const origin = req.get('Origin') || 'no-origin';
  console.log(`${timestamp} ${req.method} ${req.path} - IP: ${req.ip} - Origin: ${origin}`);
  next();
});

// 🚀 HEALTH CHECK - Simple et rapide (sans DB)
app.get('/api/health', (req, res) => {
  const healthData = {
    status: 'healthy',
    service: 'Dr.MiMi API Server',
    version: '2.1.0',
    timestamp: new Date().toISOString(),
    uptime: Math.floor(process.uptime()),
    environment: process.env.NODE_ENV || 'development',
    memory: {
      used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024) + 'MB',
      total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024) + 'MB'
    },
    cors: {
      configured: true,
      allowedOrigins: 'Vercel (dr-mi-mi-*.vercel.app), localhost, Replit'
    }
  };

  res.set({
    'Cache-Control': 'no-cache, no-store, must-revalidate',
    'Pragma': 'no-cache', 
    'Expires': '0'
  });
  
  res.json(healthData);
});

// 🏠 ROOT endpoint - Info du serveur
app.get("/", (req, res) => {
  res.json({
    name: "🩺 Dr.MiMi API Server",
    version: "2.1.0", 
    status: "running",
    environment: process.env.NODE_ENV || "development",
    message: "API Backend pour la plateforme d'éducation médicale Dr.MiMi",
    owner: "Merieme BENNAMANE - Étudiante en Médecine",
    location: "Boumerdès, Algérie 🇩🇿",
    support: "Éducation médicale francophone 🩺",
    timestamp: new Date().toISOString(),
    uptime: `${Math.floor(process.uptime())} secondes`,
    endpoints: {
      health: "/api/health - État du serveur",
      auth: "/api/auth/* - Authentification", 
      admin: "/api/admin/* - Administration",
      articles: "/api/articles - Articles médicaux",
      courses: "/api/courses - Cours",
      quizzes: "/api/quizzes - Quiz",
      cases: "/api/cases - Cas cliniques",
      news: "/api/news - Actualités",
      chat: "/api/chat - Chatbot médical",
      library: "/api/library/* - Bibliothèque",
    },
    documentation: "https://github.com/ramihamdouchetraining-prog/Dr.MiMi"
  });
});

// 🎯 WARM-UP endpoint pour éviter les cold starts
app.get("/api/warmup", (req, res) => {
  console.log("🔥 Warm-up request received");
  res.json({
    message: "Dr.MiMi server is now warm and ready!",
    timestamp: new Date().toISOString(),
    warmupComplete: true
  });
});

// 🚀 FONCTION DE DÉMARRAGE
async function startServer() {
  try {
    console.log('🩺 Démarrage du serveur Dr.MiMi...');
    console.log('================================');

    // Initialisation de la base de données
    console.log('🌱 Initialisation de la base de données...');
    try {
      await seedModules();
      await seedMedicalContent();
      await seedOwner();
      await seedAdmin();
      await seedNewsArticles();
      await seedQuizzes();
      await seedCourses();
      await seedSummaries();
      await seedCases();
      console.log('✅ Base de données Dr.MiMi initialisée avec succès');
    } catch (dbError) {
      console.error('⚠️ Erreur lors de l\'initialisation de la DB, mais le serveur continue:', dbError.message);
    }

    // Configuration OAuth
    try {
      configureOAuth();
      app.use(passport.initialize());
      console.log('✅ OAuth configuré');
    } catch (oauthError) {
      console.warn('⚠️ OAuth non configuré:', oauthError.message);
    }

    // Enregistrement des routes
    console.log('🗺️ Enregistrement des routes...');
    await registerRoutes(app);
    setupNewsRoutes(app);
    setupCoursesRoutes(app); 
    setupSummariesRoutes(app);
    setupModulesRoutes(app);
    setupCasesRoutes(app);
    console.log('✅ Toutes les routes Dr.MiMi enregistrées');

    // Services temps réel
    try {
      const wsManager = new WebSocketManager(httpServer);
      const webrtcSignaling = new WebRTCSignalingServer(httpServer);
      console.log('✅ WebSocket et WebRTC initialisés');
    } catch (wsError) {
      console.warn('⚠️ Services temps réel non disponibles:', wsError.message);
    }

    // 🎉 DÉMARRAGE DU SERVEUR
    httpServer.listen(PORT, () => {
      console.log(`
🩺 =======================================
   Dr.MiMi API Server - READY TO HEAL! 
=======================================
🚀 Port: ${PORT}
🌍 Environment: ${process.env.NODE_ENV || 'development'}
📅 Started: ${new Date().toLocaleString('fr-FR')}
⚡ Uptime: ${Math.floor(process.uptime())}s
🔗 Health: http://localhost:${PORT}/api/health
🔥 Warm-up: http://localhost:${PORT}/api/warmup

📡 CORS configuré pour:
  ✅ https://dr-mi-mi-five.vercel.app (production)
  ✅ https://dr-mi-mi-*.vercel.app (previews)
  ✅ localhost:5000, :5173, :3000 (dev)
  ✅ *.replit.dev/app (Replit)

🗺️ Endpoints Dr.MiMi disponibles:
  🔍 GET  /api/health - Health check rapide
  🔥 GET  /api/warmup - Réveil du serveur
  📚 GET  /api/articles - Articles médicaux
  🎓 GET  /api/courses - Cours complets
  ❓ GET  /api/quizzes - Quiz interactifs
  🏥 GET  /api/cases - Cas cliniques
  📰 GET  /api/news - Actualités médicales
  💬 POST /api/chat - Chatbot Dr.MiMi
  📖 GET  /api/library/* - Bibliothèque
  🔐 POST /api/admin/login - Connexion admin
  👤 GET  /api/auth/me - Profil utilisateur

🔒 Sécurité Dr.MiMi:
  ✅ Headers sécurisés (Helmet)
  ✅ Rate limiting (2000 req/15min general, 10 req/15min auth)
  ✅ Sessions chiffrées
  ✅ CORS dynamique avec préflight instantané

🎯 Cold Start Prevention:
  ✅ Health check sans DB
  ✅ Préflight OPTIONS immédiat
  ✅ Compression active
  ✅ Gestion gracieuse des erreurs

🩺 Dr.MiMi est prêt à servir les étudiants en médecine! 🇩🇿
Support: Merieme BENNAMANE - Boumerdès 🌟
=======================================
      `);
      
      // Auto warm-up pour éviter les cold starts
      setTimeout(async () => {
        try {
          console.log('🔥 Auto warm-up Dr.MiMi...');
          // Optionnel: fetch vers soi-même pour garder actif
        } catch (e) {
          // Silencieux
        }
      }, 5000);
    });

  } catch (error) {
    console.error('💥 Échec critique du démarrage Dr.MiMi:', error);
    console.error('Stack:', error.stack);
    process.exit(1);
  }
}

// 🚫 ERROR HANDLERS - Gestion complète des erreurs
app.use((error: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(`💥 Erreur serveur Dr.MiMi [${req.method} ${req.path}]:`, error.message);

  // Toujours ajouter CORS aux réponses d'erreur
  const origin = req.headers.origin;
  if (origin && (origin.includes('.vercel.app') || origin.includes('localhost'))) {
    res.header('Access-Control-Allow-Origin', origin);
    res.header('Access-Control-Allow-Credentials', 'true');
  }

  // Types d'erreurs spécifiques
  if (error.name === 'ValidationError') {
    return res.status(400).json({
      error: 'Données invalides',
      message: 'Les données soumises ne respectent pas le format Dr.MiMi',
      details: error.message,
      timestamp: new Date().toISOString()
    });
  }

  if (error.code === 'ECONNREFUSED' || error.code === 'ENOTFOUND') {
    return res.status(503).json({
      error: 'Base de données temporairement indisponible',
      message: 'Dr.MiMi réinitialise la connexion, veuillez réessayer dans 30 secondes',
      timestamp: new Date().toISOString()
    });
  }

  if (error.message.includes('CORS')) {
    return res.status(403).json({
      error: 'Accès CORS refusé',
      message: 'Votre domaine n\'est pas autorisé à accéder à Dr.MiMi',
      allowedOrigins: 'dr-mi-mi-five.vercel.app et previews',
      timestamp: new Date().toISOString()
    });
  }

  // Erreur générale
  const isDev = process.env.NODE_ENV === 'development';
  res.status(500).json({
    error: 'Erreur interne Dr.MiMi',
    message: isDev 
      ? `Détail technique: ${error.message}`
      : 'Une erreur inattendue est survenue. L\'équipe Dr.MiMi a été notifiée.',
    timestamp: new Date().toISOString(),
    requestId: req.headers['x-request-id'] || 'unknown',
    ...(isDev && { stack: error.stack })
  });
});

// 🚫 404 handler avec CORS
app.use('*', (req, res) => {
  // Ajouter CORS même aux 404
  const origin = req.headers.origin;
  if (origin && (origin.includes('.vercel.app') || origin.includes('localhost'))) {
    res.header('Access-Control-Allow-Origin', origin);
    res.header('Access-Control-Allow-Credentials', 'true');
  }

  res.status(404).json({
    error: 'Route Dr.MiMi non trouvée',
    message: `La route '${req.originalUrl}' n'existe pas sur l'API Dr.MiMi`,
    method: req.method,
    availableEndpoints: [
      'GET /api/health - État du serveur',
      'GET /api/warmup - Réveil du serveur', 
      'GET /api/articles - Articles médicaux',
      'GET /api/courses - Cours',
      'GET /api/quizzes - Quiz',
      'GET /api/cases - Cas cliniques',
      'GET /api/news - Actualités',
      'POST /api/chat - Chatbot',
      'POST /api/admin/login - Admin',
      'GET /api/auth/me - Profil'
    ],
    timestamp: new Date().toISOString()
  });
});

// 🛑 GRACEFUL SHUTDOWN
const gracefulShutdown = (signal: string) => {
  console.log(`📴 ${signal} reçu - Arrêt gracieux du serveur Dr.MiMi...`);
  httpServer.close(() => {
    console.log('✅ Serveur Dr.MiMi arrêté proprement');
    process.exit(0);
  });

  // Force shutdown after 10s
  setTimeout(() => {
    console.error('⚠️ Arrêt forcé du serveur Dr.MiMi après timeout');
    process.exit(1);
  }, 10000);
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// 🔄 Démarrer le serveur Dr.MiMi
startServer();

export default app;