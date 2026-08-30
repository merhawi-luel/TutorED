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
if (process.env.FRONTEND_URL) {
  allowedOrigins.push(process.env.FRONTEND_URL);
}
app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (mobile apps, curl, etc.)
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    // In production, also allow the frontend URL
    if (process.env.FRONTEND_URL && origin === process.env.FRONTEND_URL) {
      return callback(null, true);
    }
    callback(new Error("Not allowed by CORS"));
  },
  credentials: true,
}));

// ─── Raw body for Chapa webhook (before JSON parser) ────────
app.post("/api/payment/webhook", express.raw({ type: "application/json" }), async (req, res) => {
  // Forward to the payment router's webhook handler
  // The raw body is available as req.body (Buffer)
  try {
    const crypto = await import("crypto");
    const { db } = await import("./db");
    const { organizations } = await import("./db/schema");
    const { eq } = await import("drizzle-orm");

    const CHAPA_API_BASE = "https://api.chapa.co/v1";
    const CHAPA_SECRET_KEY = process.env.CHAPA_SECRET_KEY!;
    const CHAPA_WEBHOOK_SECRET = process.env.CHAPA_WEBHOOK_SECRET!;

    const signature = req.headers["x-chapa-signature"] as string;
    const rawBody = req.body.toString("utf8");

    if (CHAPA_WEBHOOK_SECRET && signature) {
      const expectedSignature = crypto
        .createHmac("sha256", CHAPA_WEBHOOK_SECRET)
        .update(rawBody)
        .digest("hex");

      if (signature !== expectedSignature) {
        console.error("⚠️ Webhook signature mismatch");
        return res.status(401).json({ error: "Invalid signature" });
      }
    }

    const body = JSON.parse(rawBody);
    const { tx_ref, status } = body;

    if (!tx_ref) {
      return res.status(400).json({ error: "Missing tx_ref" });
    }

    console.log(`🔔 Webhook received: tx_ref=${tx_ref}, status=${status}`);

    // Re-verify with Chapa
    const verifyResponse = await fetch(`${CHAPA_API_BASE}/transaction/verify/${tx_ref}`, {
      headers: { "Authorization": `Bearer ${CHAPA_SECRET_KEY}` },
    });
    const verifyData = await verifyResponse.json();

    if (verifyData.status === "success") {
      const [org] = await db
        .select()
        .from(organizations)
        .where(eq(organizations.chapaTxRef, tx_ref));

      if (org) {
        await db
          .update(organizations)
          .set({
            paymentStatus: "paid",
            paidAt: new Date(),
            isVerified: true,
          })
          .where(eq(organizations.id, org.id));
        console.log(`✅ Payment confirmed for org ${org.id}: ${tx_ref}`);
      } else {
        console.error(`❌ Organization not found for tx_ref: ${tx_ref}`);
      }
    }

    res.status(200).json({ received: true });
  } catch (error) {
    console.error("Webhook error:", error);
    res.status(200).json({ received: true });
  }
});

app.use(express.json({ limit: "10mb" }));
// ─── Routes ──────────────────────────────────────────────────

app.use("/api/auth", authRoutes);
app.use("/api/tutor", tutorRoutes);
app.use("/api/agency", agencyRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/upload", uploadRoutes);
app.use("/api/parent", parentRoutes);
app.use("/api/payment", paymentRoutes);

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
