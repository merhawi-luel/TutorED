import { Router } from "express";
import { createClient } from "@supabase/supabase-js";
import { db } from "../db";
import { organizations, documents } from "../db/schema";
import { requireAuth, requireRole } from "../middleware/auth";
import { eq } from "drizzle-orm";

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);
const BUCKET_NAME = "documents";

const router = Router();

// ─── POST /api/payment/upload-receipt ────────────────────────
// Upload payment receipt/screenshot for agency verification

router.post("/upload-receipt", requireAuth, requireRole("agency"), async (req, res) => {
  try {
    const { file, fileName, description } = req.body;

    if (!file || !fileName) {
      return res.status(400).json({ error: "File and fileName are required" });
    }

    // Get agency's organization
    const [org] = await db
      .select()
      .from(organizations)
      .where(eq(organizations.ownerUserId, req.user!.userId));

    if (!org) {
      return res.status(404).json({ error: "Organization not found" });
    }

    // Check if already verified
    if (org.isVerified) {
      return res.status(400).json({ error: "Organization is already verified" });
    }

    // Decode base64 file
    const buffer = Buffer.from(file, "base64");
    const filePath = `receipts/${org.id}/${Date.now()}-${fileName}`;

    // Upload to Supabase Storage
    const { error: uploadError } = await supabase.storage
      .from(BUCKET_NAME)
      .upload(filePath, buffer, {
        contentType: "application/pdf",
        upsert: false,
      });

    if (uploadError) {
      console.error("Upload error:", uploadError);
      return res.status(500).json({ error: "Failed to upload file" });
    }

    // Create document record
    const [doc] = await db
      .insert(documents)
      .values({
        userId: req.user!.userId,
        type: "receipt",
        documentUrl: filePath,
        status: "pending",
        metadata: JSON.stringify({
          organizationId: org.id,
          description: description || "Payment receipt for agency verification",
        }),
      })
      .returning();

    // Update organization status
    await db
      .update(organizations)
      .set({
        paymentStatus: "pending",
      })
      .where(eq(organizations.id, org.id));

    console.log(`📄 Receipt uploaded for org ${org.id}: ${filePath}`);

    res.status(201).json({
      message: "Receipt uploaded successfully. Admin will review and verify your agency.",
      documentId: doc.id,
    });
  } catch (error) {
    console.error("Upload receipt error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// ─── GET /api/payment/status ──────────────────────────────────
// Check verification status for an organization

router.get("/status", requireAuth, requireRole("agency"), async (req, res) => {
  try {
    const [org] = await db
      .select({
        paymentStatus: organizations.paymentStatus,
        isVerified: organizations.isVerified,
        paidAt: organizations.paidAt,
      })
      .from(organizations)
      .where(eq(organizations.ownerUserId, req.user!.userId));

    if (!org) {
      return res.status(404).json({ error: "Organization not found" });
    }

    res.json({
      paymentStatus: org.paymentStatus,
      isVerified: org.isVerified,
      paidAt: org.paidAt,
    });
  } catch (error) {
    console.error("Payment status error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
