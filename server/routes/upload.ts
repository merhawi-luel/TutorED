import { Router } from "express";
import { createClient } from "@supabase/supabase-js";
import { requireAuth } from "../middleware/auth";

const router = Router();

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const BUCKET_NAME = "documents";

// ─── POST /api/upload/presign ────────────────────────────────
// Generate a presigned URL for client-side upload

router.post("/presign", requireAuth, async (req, res) => {
  try {
    const { fileName, contentType } = req.body;

    console.log(`📤 Presign upload request:`, {
      userId: req.user!.userId,
      fileName,
      contentType,
      bucket: BUCKET_NAME
    });

    if (!fileName || !contentType) {
      return res.status(400).json({ error: "fileName and contentType are required" });
    }

    // Create a unique key: userId/timestamp-filename
    const fileKey = `${req.user!.userId}/${Date.now()}-${fileName}`;
    
    console.log(`🔑 Generated fileKey: ${fileKey}`);

    // Create signed upload URL (valid for 1 hour)
    const { data, error } = await supabase.storage
      .from(BUCKET_NAME)
      .createSignedUploadUrl(fileKey);

    if (error) {
      console.error("❌ Supabase presign error:", error);
      return res.status(500).json({ error: "Failed to generate upload URL", details: error.message });
    }

    console.log(`✅ Signed upload URL generated successfully`);

    res.json({
      signedUrl: data.signedUrl,
      fileKey,
      path: data.path,
    });
  } catch (error) {
    console.error("❌ Upload presign error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// ─── POST /api/upload/confirm ────────────────────────────────
// Confirm upload and get a signed download URL

router.post("/confirm", requireAuth, async (req, res) => {
  try {
    const { fileKey } = req.body;

    if (!fileKey) {
      return res.status(400).json({ error: "fileKey is required" });
    }

    // Create signed download URL (valid for 1 hour)
    const { data, error } = await supabase.storage
      .from(BUCKET_NAME)
      .createSignedUrl(fileKey, 3600);

    if (error) {
      console.error("Supabase confirm error:", error);
      return res.status(500).json({ error: "Failed to generate download URL" });
    }

    res.json({ downloadUrl: data.signedUrl });
  } catch (error) {
    console.error("Upload confirm error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// ─── GET /api/upload/:fileKey ────────────────────────────────
// Get a signed download URL for a file

router.get("/{*fileKey}", requireAuth, async (req, res) => {
  try {
    const fileKey = req.params.fileKey;

    const { data, error } = await supabase.storage
      .from(BUCKET_NAME)
      .createSignedUrl(fileKey, 3600);

    if (error) {
      return res.status(404).json({ error: "File not found" });
    }

    res.json({ downloadUrl: data.signedUrl });
  } catch (error) {
    console.error("Get file error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// ─── DELETE /api/upload/:fileKey ─────────────────────────────
// Delete a file from storage

router.delete("/{*fileKey}", requireAuth, async (req, res) => {
  try {
    const fileKey = req.params.fileKey;

    const { error } = await supabase.storage
      .from(BUCKET_NAME)
      .remove([fileKey]);

    if (error) {
      return res.status(500).json({ error: "Failed to delete file" });
    }

    res.json({ success: true });
  } catch (error) {
    console.error("Delete file error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
