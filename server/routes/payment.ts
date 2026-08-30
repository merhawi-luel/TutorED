import { Router } from "express";
import { db } from "../db";
import { organizations } from "../db/schema";
import { requireAuth, requireRole } from "../middleware/auth";
import { eq } from "drizzle-orm";

const CHAPA_API_BASE = "https://api.chapa.co/v1";
const CHAPA_SECRET_KEY = process.env.CHAPA_SECRET_KEY!;

const router = Router();

// ─── POST /api/agency/pay-entrance ───────────────────────────
// Initialize Chapa payment for agency entrance fee

router.post("/pay-entrance", requireAuth, requireRole("agency"), async (req, res) => {
  try {
    const { email, firstName, lastName } = req.body;

    if (!email || !firstName || !lastName) {
      return res.status(400).json({ error: "email, firstName, and lastName are required" });
    }

    // Find the agency's organization
    const [org] = await db
      .select()
      .from(organizations)
      .where(eq(organizations.ownerUserId, req.user!.userId));

    if (!org) {
      return res.status(404).json({ error: "Organization not found. Please create your organization first." });
    }

    if (org.paymentStatus === "paid") {
      return res.status(400).json({ error: "Entrance fee already paid" });
    }

    // Generate unique tx_ref
    const txRef = `agency-entrance-${org.id}-${Date.now()}`;

    // Call Chapa initialize endpoint
    const response = await fetch(`${CHAPA_API_BASE}/transaction/initialize`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${CHAPA_SECRET_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        amount: "5000",
        currency: "ETB",
        tx_ref: txRef,
        callback_url: `${process.env.BACKEND_URL || "http://localhost:3001"}/api/payment/webhook`,
        return_url: `${process.env.FRONTEND_URL || "http://localhost:5173"}/agency/payment-status?tx_ref=${txRef}`,
        meta: {
          organization_id: org.id,
        },
      }),
    });

    const data = await response.json();

    if (!response.ok || !data.data?.checkout_url) {
      console.error("Chapa initialize error:", data);
      return res.status(500).json({ error: "Failed to initialize payment", details: data });
    }

    // Save tx_ref on the organization
    await db
      .update(organizations)
      .set({
        chapaTxRef: txRef,
        paymentStatus: "pending",
      })
      .where(eq(organizations.id, org.id));

    console.log(`💳 Payment initialized for org ${org.id}: tx_ref=${txRef}`);

    res.json({ checkoutUrl: data.data.checkout_url, txRef });
  } catch (error) {
    console.error("Pay entrance error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});



// ─── GET /api/payment/status ──────────────────────────────────
// Check payment status for an organization

router.get("/status", requireAuth, requireRole("agency"), async (req, res) => {
  try {
    const [org] = await db
      .select({
        paymentStatus: organizations.paymentStatus,
        chapaTxRef: organizations.chapaTxRef,
        paidAt: organizations.paidAt,
        isVerified: organizations.isVerified,
      })
      .from(organizations)
      .where(eq(organizations.ownerUserId, req.user!.userId));

    if (!org) {
      return res.status(404).json({ error: "Organization not found" });
    }

    res.json({
      paymentStatus: org.paymentStatus,
      txRef: org.chapaTxRef,
      paidAt: org.paidAt,
      isVerified: org.isVerified,
    });
  } catch (error) {
    console.error("Payment status error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// ─── POST /api/agency/:id/refund ──────────────────────────────
// Admin-only: refund an agency's payment

router.post("/refund/:id", requireAuth, requireRole("admin"), async (req, res) => {
  try {
    const [org] = await db
      .select()
      .from(organizations)
      .where(eq(organizations.id, req.params.id));

    if (!org) {
      return res.status(404).json({ error: "Organization not found" });
    }

    if (org.paymentStatus !== "paid") {
      return res.status(400).json({ error: "Can only refund agencies with paid status" });
    }

    if (org.chapaTxRef) {
      // Call Chapa refund endpoint
      const response = await fetch(`${CHAPA_API_BASE}/transaction/refund/${org.chapaTxRef}`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${CHAPA_SECRET_KEY}`,
          "Content-Type": "application/json",
        },
      });

      const data = await response.json();

      if (response.ok) {
        await db
          .update(organizations)
          .set({
            refundStatus: "refunded",
            paymentStatus: "refunded",
            isVerified: false,
          })
          .where(eq(organizations.id, org.id));

        console.log(`💰 Refund processed for org ${org.id}: ${org.chapaTxRef}`);
        res.json({ success: true, message: "Refund processed" });
      } else {
        console.error("Chapa refund error:", data);
        res.status(500).json({ error: "Refund failed", details: data });
      }
    } else {
      res.status(400).json({ error: "No transaction reference found" });
    }
  } catch (error) {
    console.error("Refund error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});



export default router;
