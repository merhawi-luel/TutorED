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

const app = express();
const PORT = process.env.PORT || 3001;

// ─── Middleware ───────────────────────────────────────────────

app.use(cors({ origin: ["http://localhost:5173", "http://localhost:3000"], credentials: true }));
app.use(express.json({ limit: "10mb" }));

// ─── Routes ──────────────────────────────────────────────────

app.use("/api/auth", authRoutes);
app.use("/api/tutor", tutorRoutes);
app.use("/api/agency", agencyRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/upload", uploadRoutes);
app.use("/api/parent", parentRoutes);

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
