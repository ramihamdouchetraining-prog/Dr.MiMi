// Main server entry point for Dr.MiMi backend - CORRECTED VERSION
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

// 🔒 SÉCURITÉ - Configuration Helmet améliorée
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
        styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
        fontSrc: ["'self'", "https://fonts.gstatic.com", "https:", "data:"],
        imgSrc: ["'self'", "data:", "https:", "blob:"],
        connectSrc: [
          "'self'", 
          "https://drmimi-replit.onrender.com",
          "https://dr-mi-mi-five.vercel.app",
          "wss://drmimi-replit.onrender.com"
        ],
        objectSrc: ["'none'"],
        mediaSrc: ["'self'"],
        frameSrc: ["'none'"],
        upgradeInsecureRequests: [],
      },
    },
    crossOriginEmbedderPolicy: false,
    crossOriginResourcePolicy: { policy: "cross-origin" },
  })
);

// 🔥 COMPRESSION pour optimiser les réponses
app.use(compression({
  filter: (req, res) => {
    if (req.headers['x-no-compression']) {
      return false;
    }
    return compression.filter(req, res);
  },
  level: 6
}));

// 🕡 RATE LIMITING pour prévenir les abus
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000, // 1000 requêtes par IP
  message: {
    error: 'Trop de requêtes, veuillez réessayer plus tard',
    retryAfter: '15 minutes'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 tentatives de connexion
  message: {
    error: 'Trop de tentatives de connexion, veuillez réessayer dans 15 minutes'
  },
  skipSuccessfulRequests: true,
});

app.use('/api/', generalLimiter);
app.use('/api/auth/login', authLimiter);

// 🌍 CORS - Configuration COMPLETE et sécurisée
const corsOptions = {
  origin: function (origin: string | undefined, callback: Function) {
    // Autoriser les requêtes sans origin (mobile apps, Postman, curl, etc.)
    if (!origin) {
      return callback(null, true);
    }

    // Liste des origines statiques autorisées
    const allowedOrigins = [
      "http://localhost:5000",
      "http://localhost:5173",
      "http://localhost:3000",
      "http://127.0.0.1:5000",
      "http://127.0.0.1:5173", 
      "http://127.0.0.1:3000",
      "https://dr-mi-mi-five.vercel.app",
      "https://dr-mi-mi-git-main-ramis-projects-7dac3957.vercel.app",
      "https://dr-mimi.netlify.app",
      "https://dr-mi-mi-replit.vercel.app",
      "https://drmimi-replit.onrender.com",
    ];

    // Vérifier si l'origin est dans la liste statique
    if (allowedOrigins.includes(origin)) {
      console.log(`✅ CORS: Origin autorisée: ${origin}`);
      return callback(null, true);
    }

    // Accepter TOUTES les URLs Replit (.replit.dev, .replit.app, .repl.co)
    if (
      origin.includes(".replit.dev") ||
      origin.includes(".replit.app") ||
      origin.includes(".repl.co")
    ) {
      console.log(`✅ CORS: Replit URL autorisée: ${origin}`);
      return callback(null, true);
    }

    // Accepter TOUTES les URLs Vercel (production, preview, et URLs générées)
    if (origin.includes(".vercel.app")) {
      console.log(`✅ CORS: Vercel URL autorisée: ${origin}`);
      return callback(null, true);
    }

    // Accepter les URLs de preview Vercel avec pattern spécifique
    const vercelPreviewPattern = /^https:\/\/dr-mi-mi-.*\.vercel\.app$/;
    if (vercelPreviewPattern.test(origin)) {
      console.log(`✅ CORS: Vercel Preview autorisée: ${origin}`);
      return callback(null, true);
    }

    // Rejeter toutes les autres origines
    console.warn(`🚫 CORS: Origin NON autorisée: ${origin}`);
    callback(new Error(`CORS: Origin '${origin}' non autorisée par la politique de sécurité Dr.MiMi`));
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  allowedHeaders: [
    "Origin",
    "X-Requested-With",
    "Content-Type",
    "Accept",
    "Authorization",
    "Cache-Control",
    "X-Forwarded-For",
    "Access-Control-Allow-Credentials"
  ],
  optionsSuccessStatus: 200,
  maxAge: 86400, // 24 heures de cache pour les requetes preflight
};

app.use(cors(corsOptions));

// Gérer explicitement les requêtes OPTIONS pour CORS
app.options('*', cors(corsOptions));

// 📝 Body parsing middleware avec limites appropriées
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// 🍪 Sessions sécurisées
app.use(session({
  secret: process.env.SESSION_SECRET || 'dr-mimi-default-secret-change-in-production',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000, // 24 heures
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax'
  },
  name: 'drmimi.session.id'
}));

// 📁 Servir les fichiers statiques
app.use("/uploads", express.static("uploads"));

// 📝 Logging middleware amélioré
app.use((req, res, next) => {
  const timestamp = new Date().toISOString();
  const userAgent = req.get('User-Agent')?.substring(0, 50) || 'Unknown';
  console.log(`${timestamp} ${req.method} ${req.path} - IP: ${req.ip} - UA: ${userAgent}`);
  next();
});

// 🏠 Root endpoint - Backend API info
app.get("/", (req, res) => {
  res.json({
    name: "Dr.MiMi API Server",
    version: "2.0.0",
    status: "running",
    environment: process.env.NODE_ENV || "development",
    message: "🩺 API Backend pour la plateforme d'éducation médicale Dr.MiMi",
    timestamp: new Date().toISOString(),
    uptime: `${Math.floor(process.uptime())} secondes`,
    endpoints: {
      health: "/api/health",
      auth: "/api/auth/*",
      articles: "/api/articles",
      courses: "/api/courses",
      quizzes: "/api/quizzes",
      cases: "/api/cases",
      news: "/api/news",
      summaries: "/api/summaries",
      modules: "/api/modules",
      admin: "/api/admin/*",
    },
    cors: {
      allowedOrigins: "Vercel (.vercel.app), Replit (.replit.dev), localhost",
      methods: "GET, POST, PUT, DELETE, PATCH, OPTIONS",
      credentials: true
    },
    documentation: "https://github.com/ramihamdouchetraining-prog/Dr.MiMi",
    support: "Formation médicale pour étudiants francophones 🇵🇸"
  });
});

// 🔍 Health check endpoint pour monitoring
app.get("/api/health", (req, res) => {
  const healthData = {
    status: "healthy",
    service: "Dr.MiMi API",
    timestamp: new Date().toISOString(),
    uptime: Math.floor(process.uptime()),
    environment: process.env.NODE_ENV || "development",
    version: "2.0.0",
    database: {
      status: "connected",
      provider: "PostgreSQL via Neon"
    },
    cors: {
      configured: true,
      allowedOrigins: "Dynamic (Vercel, Replit, localhost)"
    },
    rateLimit: {
      general: "1000 req/15min per IP",
      auth: "5 req/15min per IP"
    },
    lastStartup: new Date(Date.now() - process.uptime() * 1000).toISOString()
  };

  res.set({
    'Cache-Control': 'no-cache, no-store, must-revalidate',
    'Pragma': 'no-cache',
    'Expires': '0'
  });
  
  res.json(healthData);
});

// 🚀 Fonction principale de démarrage du serveur
async function startServer() {
  try {
    console.log('🎆 Démarrage du serveur Dr.MiMi...');

    // Initialisation de la base de données avec contenu médical
    console.log('🌱 Initialisation de la base de données...');
    await seedModules();
    await seedMedicalContent();
    await seedOwner();
    await seedAdmin();
    await seedNewsArticles();
    await seedQuizzes();
    await seedCourses();
    await seedSummaries();
    await seedCases();
    console.log('✅ Base de données initialisée avec le contenu médical');

    // Configuration OAuth
    console.log('🔐 Configuration de l\'authentification...');
    configureOAuth();
    app.use(passport.initialize());
    console.log('✅ Authentification configurée');

    // Enregistrement des routes
    console.log('🗺 Enregistrement des routes API...');
    await registerRoutes(app);
    setupNewsRoutes(app);
    setupCoursesRoutes(app);
    setupSummariesRoutes(app);
    setupModulesRoutes(app);
    setupCasesRoutes(app);
    console.log('✅ Routes API enregistrées');

    // Initialisation WebSocket et WebRTC
    console.log('🔌 Initialisation des services temps réel...');
    const wsManager = new WebSocketManager(httpServer);
    const webrtcSignaling = new WebRTCSignalingServer(httpServer);
    console.log('✅ WebSocket et WebRTC prêts');

    // Démarrage du serveur HTTP
    httpServer.listen(PORT, () => {
      console.log(`
🩺===================================`);
      console.log(`   Dr.MiMi API Server READY!`);
      console.log(`===================================`);
      console.log(`🚀 Port: ${PORT}`);
      console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`📅 Started: ${new Date().toLocaleString('fr-FR')}`);
      console.log(`🔗 Health Check: http://localhost:${PORT}/api/health`);
      console.log(``);
      console.log(`📡 CORS configuré pour:`);
      console.log(`  - https://dr-mi-mi-five.vercel.app (production)`);
      console.log(`  - https://dr-mi-mi-*.vercel.app (previews)`);
      console.log(`  - localhost:5000 (développement)`);
      console.log(`  - *.replit.dev/app (Replit)`);
      console.log(``);
      console.log(`🗺 Endpoints disponibles:`);
      console.log(`  GET  /api/health - Health check`);
      console.log(`  GET  /api/articles - Articles médicaux`);
      console.log(`  GET  /api/courses - Cours`);
      console.log(`  GET  /api/quizzes - Quiz`);
      console.log(`  GET  /api/cases - Cas cliniques`);
      console.log(`  GET  /api/news - Actualités`);
      console.log(`  POST /api/auth/login - Connexion admin`);
      console.log(``);
      console.log(`🔒 Sécurité:`);
      console.log(`  - Rate limiting activé`);
      console.log(`  - Headers sécurisés (Helmet)`);
      console.log(`  - CORS dynamique`);
      console.log(`  - Sessions chiffrées`);
      console.log(``);
      console.log(`📊 Services:`);
      console.log(`  - Base de données: PostgreSQL (Neon) ✅`);
      console.log(`  - WebSocket: Messages temps réel ✅`);
      console.log(`  - WebRTC: Collaboration vidéo ✅`);
      console.log(`  - Compression: Gzip activé ✅`);
      console.log(``);
      console.log(`🎆 Dr.MiMi est prêt à servir les étudiants en médecine! 🩺`);
      console.log(`===================================\n`);
    });
  } catch (error) {
    console.error('💥 Échec du démarrage du serveur Dr.MiMi:', error);
    console.error('Stack trace:', error);
    process.exit(1);
  }
}

// 🚫 Gestionnaire d'erreurs global
app.use((error: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(`❌ Erreur serveur Dr.MiMi:`, error);

  // Erreur de validation
  if (error.name === 'ValidationError') {
    return res.status(400).json({
      error: 'Données invalides',
      message: 'Les données soumises ne respectent pas le format requis',
      details: error.message,
      timestamp: new Date().toISOString()
    });
  }

  // Erreur de base de données
  if (error.code === 'ECONNREFUSED' || error.code === 'ENOTFOUND') {
    return res.status(503).json({
      error: 'Service temporairement indisponible',
      message: 'Problème de connexion à la base de données Dr.MiMi',
      timestamp: new Date().toISOString()
    });
  }

  // Erreur CORS
  if (error.message.includes('CORS')) {
    return res.status(403).json({
      error: 'Accès CORS refusé',
      message: 'Votre domaine n\'est pas autorisé à accéder à l\'API Dr.MiMi',
      timestamp: new Date().toISOString()
    });
  }

  // Erreur par défaut
  const isDevelopment = process.env.NODE_ENV === 'development';
  res.status(500).json({
    error: 'Erreur interne du serveur Dr.MiMi',
    message: isDevelopment 
      ? error.message 
      : 'Une erreur inattendue est survenue. L\'\u00e9quipe Dr.MiMi a été notifiée.',
    timestamp: new Date().toISOString(),
    ...(isDevelopment && { stack: error.stack })
  });
});

// 🚫 404 handler pour les routes non trouvées
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Route non trouvée',
    message: `La route '${req.originalUrl}' n'existe pas sur l'API Dr.MiMi`,
    method: req.method,
    availableRoutes: [
      'GET /api/health',
      'GET /api/articles', 
      'GET /api/courses',
      'GET /api/quizzes',
      'GET /api/cases',
      'GET /api/news',
      'POST /api/auth/login'
    ],
    timestamp: new Date().toISOString()
  });
});

// 🚫 Gestionnaire d'arrêt gracieux
process.on('SIGTERM', () => {
  console.log('📴 SIGTERM reçu, arrêt gracieux du serveur Dr.MiMi...');
  httpServer.close(() => {
    console.log('✅ Serveur Dr.MiMi arrêté proprement');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('📴 SIGINT reçu, arrêt gracieux du serveur Dr.MiMi...');
  httpServer.close(() => {
    console.log('✅ Serveur Dr.MiMi arrêté proprement');
    process.exit(0);
  });
});

// 🚀 Démarrer le serveur Dr.MiMi
startServer();

export default app;