import dotenv from "dotenv";
dotenv.config({ override: true });
import express from "express";
import cors from "cors";

// Error handlers FIRST - before any imports that might fail
process.on("uncaughtException", (error) => {
  console.error("❌ Uncaught exception:", error);
  console.error("Stack:", error.stack);
});

process.on("unhandledRejection", (reason, promise) => {
  console.error("❌ Unhandled rejection at:", promise, "reason:", reason);
});

// Now import routes (any errors will be caught above)
import authRoutes from "./routes/auth";
import tutorRoutes from "./routes/tutor";
import agencyRoutes from "./routes/agency";
import adminRoutes from "./routes/admin";
import uploadRoutes from "./routes/upload";
import parentRoutes from "./routes/parent";
import paymentRoutes from "./routes/payment";

const app = express();
const PORT = process.env.PORT || 3001;

// ─── Middleware ───────────────────────────────────────────────

const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:3000",
  "http://localhost:3001",
];

// Add production and preview frontend URLs
if (process.env.FRONTEND_URL) {
  // Support comma-separated origins
  const frontendUrls = process.env.FRONTEND_URL.split(',').map(url => url.trim());
  allowedOrigins.push(...frontendUrls);
}

console.log("🔒 CORS Configuration:");
console.log("   Allowed origins:", allowedOrigins);
console.log("   FRONTEND_URL:", process.env.FRONTEND_URL || "NOT SET");

app.use(cors({
  origin: (origin, callback) => {
    console.log(`🌐 CORS request from origin: ${origin || 'no-origin'}`);
    
    // Allow requests with no origin (mobile apps, curl, etc.)
    if (!origin) {
      console.log("   ✓ Allowed (no origin)");
      return callback(null, true);
    }
    
    // Check against exact allowed origins
    if (allowedOrigins.includes(origin)) {
      console.log("   ✓ Allowed (in allowedOrigins list)");
      return callback(null, true);
    }
    
    // Allow all Vercel preview deployments (*.vercel.app)
    if (origin.endsWith('.vercel.app')) {
      console.log("   ✓ Allowed (Vercel deployment)");
      return callback(null, true);
    }
    
    console.log("   ✗ Blocked - not in allowed origins");
    console.log("   Origin:", origin);
    console.log("   Allowed:", allowedOrigins);
    callback(new Error("Not allowed by CORS"));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// Handle OPTIONS requests explicitly to prevent 500 errors
app.options('*', cors());

app.use(express.json({ limit: "10mb" }));
// ─── Routes ──────────────────────────────────────────────────

app.use("/api/auth", authRoutes);
app.use("/api/tutor", tutorRoutes);
app.use("/api/agency", agencyRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/upload", uploadRoutes);
app.use("/api/parent", parentRoutes);
app.use("/api/payment", paymentRoutes);

// ─── Debug endpoint ──────────────────────────────────────────

app.get("/api/debug/routes", (_req, res) => {
  res.json({
    message: "API is working",
    routes: {
      auth: "/api/auth/*",
      tutor: "/api/tutor/*",
      agency: "/api/agency/*",
      admin: "/api/admin/*",
      upload: "/api/upload/*",
      parent: "/api/parent/*",
      payment: "/api/payment/*",
    },
    important: {
      publicVacancies: "/api/tutor/vacancies",
      health: "/api/health",
    },
    cors: {
      allowedOrigins: allowedOrigins,
      frontendUrl: process.env.FRONTEND_URL || "not set",
    },
  });
});

// ─── Health check ────────────────────────────────────────────

app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// ─── Error handling middleware ───────────────────────────────

app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error("❌ Express error:", err);
  res.status(500).json({ error: "Internal server error", message: err.message });
});

// ─── Start server ────────────────────────────────────────────

const server = app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📋 API routes:`);
  console.log(`   POST /api/auth/register`);
  console.log(`   POST /api/auth/login`);
  console.log(`   GET  /api/auth/me`);
  console.log(`   GET  /api/tutor/profile`);
  console.log(`   PUT  /api/tutor/profile`);
  console.log(`   GET  /api/tutor/documents`);
  console.log(`   POST /api/tutor/documents`);
  console.log(`   POST /api/tutor/verify`);
  console.log(`   GET  /api/vacancies`);
  console.log(`   POST /api/applications`);
  console.log(`   GET  /api/applications`);
  console.log(`   GET  /api/agency/organization`);
  console.log(`   POST /api/agency/organization`);
  console.log(`   PUT  /api/agency/organization`);
  console.log(`   GET  /api/agency/vacancies`);
  console.log(`   POST /api/agency/vacancies`);
  console.log(`   PUT  /api/agency/vacancies/:id`);
  console.log(`   PUT  /api/agency/vacancies/:id/close`);
  console.log(`   GET  /api/agency/applicants/:vacancyId`);
  console.log(`   PUT  /api/applications/:id/status`);
  console.log(`   GET  /api/admin/verifications`);
  console.log(`   PUT  /api/admin/verifications/:id/approve`);
  console.log(`   PUT  /api/admin/verifications/:id/reject`);
  console.log(`   PUT  /api/admin/documents/:id/approve`);
  console.log(`   PUT  /api/admin/documents/:id/reject`);
  console.log(`\n✅ Server is ready and listening for requests...`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || "development"}`);
});

// Server error handling
server.on("error", (error: any) => {
  if (error.code === "EADDRINUSE") {
    console.error(`❌ Port ${PORT} is already in use`);
    console.error("   Run this to kill the process:");
    console.error(`   netstat -ano | findstr :${PORT}`);
    console.error("   Then: taskkill /PID <pid> /F");
  } else {
    console.error("❌ Server error:", error);
  }
});

// Keep process alive
setInterval(() => {
  // Heartbeat to prevent process from exiting
}, 1000 * 60 * 60); // Every hour

// ─── Keep-alive ping (prevent Render cold starts) ────────────

if (process.env.NODE_ENV === 'production' && process.env.BACKEND_URL) {
  // Ping self every 14 minutes to prevent Render from spinning down
  setInterval(async () => {
    try {
      const url = `${process.env.BACKEND_URL}/api/health`;
      console.log('⏰ Keep-alive ping:', url);
      await fetch(url);
    } catch (error) {
      console.error('❌ Keep-alive ping failed:', error);
    }
  }, 14 * 60 * 1000); // 14 minutes
  
  console.log('🔄 Keep-alive enabled - pinging every 14 minutes');
}
