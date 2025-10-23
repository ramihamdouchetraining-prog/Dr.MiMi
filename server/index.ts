// Main server entry point for MediMimi backend
import "dotenv/config"; // Load environment variables
import express from "express";
import cors from "cors";
import helmet from "helmet";
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

// Security middleware
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
        fontSrc: ["'self'", "https://fonts.gstatic.com"],
        imgSrc: ["'self'", "data:", "https:"],
        scriptSrc: ["'self'"],
      },
    },
  })
);

// CORS configuration for frontend - Replit environment
app.use(
  cors({
    origin: (origin, callback) => {
      // Liste des origines statiques autorisées
      const allowedOrigins = [
        "http://localhost:5000",
        "http://localhost:5173",
        "https://dr-mimi.netlify.app",
        "https://dr-mi-mi-replit.vercel.app",
        "https://drmimi-replit.onrender.com",
      ];

      // Accepter les requêtes sans origin (Postman, curl, etc.)
      if (!origin) {
        return callback(null, true);
      }

      // Vérifier si l'origin est dans la liste statique
      if (allowedOrigins.includes(origin)) {
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

      // Rejeter toutes les autres origines
      console.warn(`⚠️ CORS: Origin NON autorisée: ${origin}`);
      callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
  })
);

// Body parsing middleware
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));

// Static file serving for uploads
app.use("/uploads", express.static("uploads"));

// Root endpoint - Backend API info
app.get("/", (req, res) => {
  res.json({
    name: "MediMimi API",
    version: "1.0.0",
    status: "running",
    message: "Backend API pour la plateforme MediMimi",
    endpoints: {
      health: "/api/health",
      auth: "/api/auth/*",
      courses: "/api/courses",
      quizzes: "/api/quizzes",
      cases: "/api/cases",
      admin: "/api/admin/*",
    },
    documentation:
      "https://github.com/ramihamdouchetraining-prog/DrMiMi-Replit",
  });
});

// Health check endpoint for monitoring
app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || "development",
  });
});

async function startServer() {
  try {
    // Seed database with initial data
    await seedModules();
    await seedMedicalContent();
    await seedOwner();
    await seedAdmin();
    await seedNewsArticles(); // Add news articles for testing
    await seedQuizzes(); // Add quiz data for testing
    await seedCourses(); // Add course data for testing
    await seedSummaries(); // Add summaries data for testing
    await seedCases(); // Add clinical cases for testing

    // Configure OAuth providers
    configureOAuth();
    app.use(passport.initialize());

    // Register routes and get HTTP server
    await registerRoutes(app);
    setupNewsRoutes(app); // Add news/blog routes
    setupCoursesRoutes(app); // Add courses routes
    setupSummariesRoutes(app); // Add summaries routes
    setupModulesRoutes(app); // Add modules routes
    setupCasesRoutes(app); // Add clinical cases routes

    // Initialize WebSocket server for messaging
    const wsManager = new WebSocketManager(httpServer);
    
    // Initialize WebRTC signaling server
    const webrtcSignaling = new WebRTCSignalingServer(httpServer);

    httpServer.listen(PORT, () => {
      console.log(`🚀 MediMimi backend server running on port ${PORT}`);
      console.log(`📊 Database: Connected to PostgreSQL`);
      console.log(`🔐 Authentication: Replit Auth enabled`);
      console.log(`🌱 Database seeded with medical modules and content`);
      console.log(`🔌 WebSocket server ready for real-time messaging`);
      console.log(`📹 WebRTC signaling server ready for collaborative platform`);
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
}

startServer();
