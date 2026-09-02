import { Router } from "express";
import { createClient } from "@supabase/supabase-js";
import { db } from "../db";
import {
  users,
  tutorProfiles,
  documents,
  verificationRequests,
  organizations,
  educationEntries,
} from "../db/schema";
import { supabaseAdmin } from "../lib/supabase";
import { requireAuth, requireRole } from "../middleware/auth";
import { eq, desc, and } from "drizzle-orm";

const router = Router();

const storageClient = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);
const BUCKET_NAME = "documents";

// ─── GET /api/admin/documents ────────────────────────────────
// Fetch all documents across all tutors

router.get("/documents", requireAuth, requireRole("admin"), async (_req, res) => {
  try {
    const allDocs = await db
      .select()
      .from(documents)
      .orderBy(desc(documents.submittedAt));

    res.json(allDocs);
  } catch (error) {
    console.error("Get all documents error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// ─── GET /api/admin/verifications ────────────────────────────

router.get("/verifications", requireAuth, requireRole("admin"), async (_req, res) => {
  try {
    console.log("🔍 Admin fetching verification requests...");
    
    const requests = await db
      .select()
      .from(verificationRequests)
      .orderBy(desc(verificationRequests.requestedAt));

    console.log(`📋 Found ${requests.length} verification requests`);

    // Enrich with tutor name and documents
    const enriched = await Promise.all(
      requests.map(async (vr) => {
        const [tutor] = await db
          .select({ name: users.name })
          .from(users)
          .where(eq(users.id, vr.tutorId));
        const docs = await db
          .select()
          .from(documents)
          .where(eq(documents.tutorId, vr.tutorId));
        
        console.log(`👤 Tutor: ${tutor?.name} | Documents: ${docs.length} | Status: ${vr.status}`);
        
        return {
          ...vr,
          tutorName: tutor?.name ?? "Unknown",
          documents: docs,
        };
      })
    );

    console.log("✅ Verification requests enriched with documents");
    res.json(enriched);
  } catch (error) {
    console.error("❌ Get verifications error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// ─── PUT /api/admin/verifications/:id/approve ────────────────

router.put("/verifications/:id/approve", requireAuth, requireRole("admin"), async (req, res) => {
  try {
    const [vr] = await db
      .select()
      .from(verificationRequests)
      .where(eq(verificationRequests.id, req.params.id));

    if (!vr) {
      return res.status(404).json({ error: "Verification request not found" });
    }

    // Approve the verification request
    const [updated] = await db
      .update(verificationRequests)
      .set({ status: "approved", reviewedAt: new Date() })
      .where(eq(verificationRequests.id, req.params.id))
      .returning();

    // Update tutor's verification level
    await db
      .update(tutorProfiles)
      .set({ verificationLevel: "verified" })
      .where(eq(tutorProfiles.userId, vr.tutorId));

    // Mark only pending/under_review documents as verified (skip rejected ones)
    const pendingDocs = await db
      .select()
      .from(documents)
      .where(eq(documents.tutorId, vr.tutorId));

    for (const doc of pendingDocs) {
      if (doc.status === "pending" || doc.status === "under_review") {
        await db
          .update(documents)
          .set({ status: "verified", reviewedAt: new Date() })
          .where(eq(documents.id, doc.id));
      }
    }

    res.json(updated);
  } catch (error) {
    console.error("Approve verification error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// ─── PUT /api/admin/verifications/:id/reject ─────────────────

router.put("/verifications/:id/reject", requireAuth, requireRole("admin"), async (req, res) => {
  try {
    const [vr] = await db
      .select()
      .from(verificationRequests)
      .where(eq(verificationRequests.id, req.params.id));

    if (!vr) {
      return res.status(404).json({ error: "Verification request not found" });
    }

    const [updated] = await db
      .update(verificationRequests)
      .set({ status: "rejected", reviewedAt: new Date() })
      .where(eq(verificationRequests.id, req.params.id))
      .returning();

    res.json(updated);
  } catch (error) {
    console.error("Reject verification error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// ─── PUT /api/admin/documents/:id/approve ────────────────────

router.put("/documents/:id/approve", requireAuth, requireRole("admin"), async (req, res) => {
  try {
    const [doc] = await db
      .select()
      .from(documents)
      .where(eq(documents.id, req.params.id));

    if (!doc) {
      return res.status(404).json({ error: "Document not found" });
    }

    const [updated] = await db
      .update(documents)
      .set({ status: "verified", reviewedAt: new Date() })
      .where(eq(documents.id, req.params.id))
      .returning();

    res.json(updated);
  } catch (error) {
    console.error("Approve document error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// ─── PUT /api/admin/documents/:id/reject ─────────────────────

router.put("/documents/:id/reject", requireAuth, requireRole("admin"), async (req, res) => {
  try {
    const { note } = req.body;

    const [doc] = await db
      .select()
      .from(documents)
      .where(eq(documents.id, req.params.id));

    if (!doc) {
      return res.status(404).json({ error: "Document not found" });
    }

    const [updated] = await db
      .update(documents)
      .set({ status: "rejected", reviewedAt: new Date(), reviewerNote: note || "" })
      .where(eq(documents.id, req.params.id))
      .returning();

    res.json(updated);
  } catch (error) {
    console.error("Reject document error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// ─── GET /api/admin/documents/:id/download ──────────────────

router.get("/documents/:id/download", requireAuth, requireRole("admin"), async (req, res) => {
  try {
    console.log(`📥 Admin download request for document ID: ${req.params.id}`);
    
    const [doc] = await db
      .select()
      .from(documents)
      .where(eq(documents.id, req.params.id));

    if (!doc) {
      console.log(`❌ Document not found`);
      return res.status(404).json({ error: "Document not found" });
    }

    console.log(`📄 Document found:`, {
      id: doc.id,
      tutorId: doc.tutorId,
      fileName: doc.fileName,
      fileKey: doc.fileKey,
      type: doc.type,
      status: doc.status
    });

    if (!doc.fileKey) {
      console.log(`❌ Document has no fileKey - file not uploaded`);
      return res.status(404).json({ error: "File not available for download" });
    }

    console.log(`🔑 Generating signed URL for fileKey: ${doc.fileKey}`);

    const { data, error } = await storageClient.storage
      .from(BUCKET_NAME)
      .createSignedUrl(doc.fileKey, 3600);

    if (error) {
      console.error("❌ Supabase signed URL error:", error);
      return res.status(500).json({ error: "Failed to generate download URL" });
    }

    console.log(`✅ Signed URL generated successfully for admin`);
    res.json({ downloadUrl: data.signedUrl, fileName: doc.fileName });
  } catch (error) {
    console.error("❌ Download document error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// ─── GET /api/admin/documents/:id/preview ────────────────────

router.get("/documents/:id/preview", requireAuth, requireRole("admin"), async (req, res) => {
  try {
    const [doc] = await db
      .select()
      .from(documents)
      .where(eq(documents.id, req.params.id));

    if (!doc) {
      return res.status(404).json({ error: "Document not found" });
    }

    if (!doc.fileKey) {
      return res.status(404).json({ error: "File not available for preview" });
    }

    // Get tutor info for context
    const [tutor] = await db
      .select({ name: users.name, email: users.email })
      .from(users)
      .where(eq(users.id, doc.tutorId));

    const { data, error } = await storageClient.storage
      .from(BUCKET_NAME)
      .createSignedUrl(doc.fileKey, 7200); // 2 hours

    if (error) {
      console.error("Supabase preview URL error:", error);
      return res.status(500).json({ error: "Failed to generate preview URL" });
    }

    res.json({ 
      previewUrl: data.signedUrl, 
      fileName: doc.fileName,
      type: doc.type,
      title: doc.title,
      tutorName: tutor?.name || "Unknown",
      tutorEmail: tutor?.email || ""
    });
  } catch (error) {
    console.error("Preview document error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// ─── GET /api/admin/tutors ───────────────────────────────────

router.get("/tutors", requireAuth, requireRole("admin"), async (_req, res) => {
  try {
    const allTutors = await db
      .select({
        id: users.id,
        name: users.name,
        email: users.email,
        role: users.role,
        createdAt: users.createdAt,
        headline: tutorProfiles.headline,
        subjects: tutorProfiles.subjects,
        experience: tutorProfiles.experience,
        education: tutorProfiles.education,
        location: tutorProfiles.location,
        verificationLevel: tutorProfiles.verificationLevel,
        rating: tutorProfiles.rating,
      })
      .from(users)
      .leftJoin(tutorProfiles, eq(users.id, tutorProfiles.userId))
      .where(eq(users.role, "tutor"));

    res.json(allTutors);
  } catch (error) {
    console.error("Get tutors error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// ─── GET /api/admin/agencies ─────────────────────────────────

router.get("/agencies", requireAuth, requireRole("admin"), async (_req, res) => {
  try {
    const allOrgs = await db
      .select()
      .from(organizations)
      .orderBy(desc(organizations.createdAt));

    res.json(allOrgs);
  } catch (error) {
    console.error("Get agencies error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// ─── GET /api/admin/admins ────────────────────────────────────

router.get("/admins", requireAuth, requireRole("admin"), async (_req, res) => {
  try {
    const allAdmins = await db
      .select({
        id: users.id,
        name: users.name,
        email: users.email,
        createdAt: users.createdAt,
      })
      .from(users)
      .where(eq(users.role, "admin"))
      .orderBy(desc(users.createdAt));

    res.json(allAdmins);
  } catch (error) {
    console.error("Get admins error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// ─── POST /api/admin/create-admin ─────────────────────────────
// Create a new admin account (only existing admins can do this)

router.post("/create-admin", requireAuth, requireRole("admin"), async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ error: "Name, email, and password are required" });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: "Password must be at least 6 characters" });
    }

    // Check if email already exists in our database
    const existing = await db.select().from(users).where(eq(users.email, email.toLowerCase()));
    if (existing.length > 0) {
      return res.status(400).json({ error: "An account with this email already exists" });
    }

    // Create user in Supabase Auth
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email: email.toLowerCase(),
      password,
      email_confirm: true, // Auto-confirm admin accounts
      user_metadata: {
        name,
        role: "admin",
      },
    });

    if (authError) {
      console.error("Supabase create admin error:", authError);

      const msg = (authError.message || "").toLowerCase();
      const isDuplicate =
        (authError as any).code === "email_exists" ||
        msg.includes("already been registered") ||
        msg.includes("already exists") ||
        msg.includes("already registered");

      if (isDuplicate) {
        return res.status(400).json({
          error:
            "An account with this email already exists. Please use a different email address.",
        });
      }

      return res.status(400).json({ error: authError.message });
    }

    // Create user in our database
    const [newAdmin] = await db
      .insert(users)
      .values({
        id: authData.user.id,
        name,
        email: email.toLowerCase(),
        passwordHash: "managed-by-supabase",
        role: "admin",
      })
      .returning({ id: users.id, email: users.email, name: users.name });

    res.status(201).json({
      message: "Admin account created successfully",
      admin: {
        id: newAdmin.id,
        name: newAdmin.name,
        email: newAdmin.email,
      },
    });
  } catch (error) {
    console.error("Create admin error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// ─── GET /api/admin/education-entries ──────────────────────

router.get("/education-entries", requireAuth, requireRole("admin"), async (_req, res) => {
  try {
    const entries = await db
      .select()
      .from(educationEntries)
      .orderBy(desc(educationEntries.submittedAt));

    // Enrich with tutor name
    const enriched = await Promise.all(
      entries.map(async (e) => {
        const [tutor] = await db
          .select({ name: users.name })
          .from(users)
          .where(eq(users.id, e.tutorId));
        return {
          ...e,
          tutorName: tutor?.name ?? "Unknown",
        };
      })
    );

    res.json(enriched);
  } catch (error) {
    console.error("Get education entries error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// ─── PUT /api/admin/education-entries/:id/approve ───────────

router.put("/education-entries/:id/approve", requireAuth, requireRole("admin"), async (req, res) => {
  try {
    const [entry] = await db
      .select()
      .from(educationEntries)
      .where(eq(educationEntries.id, req.params.id));

    if (!entry) {
      return res.status(404).json({ error: "Education entry not found" });
    }

    const [updated] = await db
      .update(educationEntries)
      .set({ status: "approved", reviewedAt: new Date() })
      .where(eq(educationEntries.id, req.params.id))
      .returning();

    // Check if tutor should be verified (all entries approved)
    const allEntries = await db
      .select()
      .from(educationEntries)
      .where(eq(educationEntries.tutorId, entry.tutorId));

    const allApproved = allEntries.every((e) => e.status === "approved");
    if (allApproved) {
      await db
        .update(tutorProfiles)
        .set({ verificationLevel: "verified" })
        .where(eq(tutorProfiles.userId, entry.tutorId));
    }

    res.json(updated);
  } catch (error) {
    console.error("Approve education entry error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// ─── PUT /api/admin/education-entries/:id/reject ────────────

router.put("/education-entries/:id/reject", requireAuth, requireRole("admin"), async (req, res) => {
  try {
    const { note } = req.body;

    const [entry] = await db
      .select()
      .from(educationEntries)
      .where(eq(educationEntries.id, req.params.id));

    if (!entry) {
      return res.status(404).json({ error: "Education entry not found" });
    }

    const [updated] = await db
      .update(educationEntries)
      .set({ status: "rejected", reviewedAt: new Date(), reviewerNote: note || "" })
      .where(eq(educationEntries.id, req.params.id))
      .returning();

    // Tutor cannot be verified if any entry is rejected
    const allEntries = await db
      .select()
      .from(educationEntries)
      .where(eq(educationEntries.tutorId, entry.tutorId));

    const allApproved = allEntries.every((e) => e.status === "approved");
    if (!allApproved) {
      const currentProfile = await db
        .select({ verificationLevel: tutorProfiles.verificationLevel })
        .from(tutorProfiles)
        .where(eq(tutorProfiles.userId, entry.tutorId));

      if (currentProfile[0]?.verificationLevel === "verified") {
        await db
          .update(tutorProfiles)
          .set({ verificationLevel: "partial" })
          .where(eq(tutorProfiles.userId, entry.tutorId));
      }
    }

    res.json(updated);
  } catch (error) {
    console.error("Reject education entry error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// ─── GET /api/admin/agencies ─────────────────────────────────
// List all agencies for verification

router.get("/agencies", requireAuth, requireRole("admin"), async (_req, res) => {
  try {
    console.log("🔍 Admin fetching agencies for verification...");
    
    const agencies = await db
      .select({
        id: organizations.id,
        name: organizations.name,
        description: organizations.description,
        location: organizations.location,
        isVerified: organizations.isVerified,
        verificationStatus: organizations.verificationStatus,
        createdAt: organizations.createdAt,
        ownerUserId: organizations.ownerUserId,
      })
      .from(organizations)
      .orderBy(desc(organizations.createdAt));

    // Enrich with owner info
    const enriched = await Promise.all(
      agencies.map(async (org) => {
        const [owner] = await db
          .select({ name: users.name, email: users.email })
          .from(users)
          .where(eq(users.id, org.ownerUserId));

        return {
          ...org,
          ownerName: owner?.name || "Unknown",
          ownerEmail: owner?.email || "",
        };
      })
    );

    console.log(`📋 Found ${enriched.length} agencies`);
    res.json(enriched);
  } catch (error) {
    console.error("❌ Get agencies error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// ─── PUT /api/admin/agencies/:id/verify ──────────────────────
// Admin verifies an agency after checking payment receipt

router.put("/agencies/:id/verify", requireAuth, requireRole("admin"), async (req, res) => {
  try {
    const { orgId } = req.params;
    const orgIdFromBody = req.body.id || req.params.id;

    console.log(`✅ Admin verifying agency: ${orgIdFromBody}`);

    const [org] = await db
      .select()
      .from(organizations)
      .where(eq(organizations.id, orgIdFromBody));

    if (!org) {
      return res.status(404).json({ error: "Organization not found" });
    }

    // Mark organization as verified
    const [updated] = await db
      .update(organizations)
      .set({ 
        isVerified: true, 
        verificationStatus: "verified",
        verifiedAt: new Date(),
      })
      .where(eq(organizations.id, orgIdFromBody))
      .returning();

    console.log(`✅ Agency verified: ${org.name} (${orgIdFromBody})`);

    res.json({
      message: "Agency verified successfully",
      organization: updated,
    });
  } catch (error) {
    console.error("❌ Verify agency error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// ─── PUT /api/admin/agencies/:id/reject ──────────────────────
// Admin rejects an agency (payment proof not valid)

router.put("/agencies/:id/reject", requireAuth, requireRole("admin"), async (req, res) => {
  try {
    const { reason } = req.body;
    const orgId = req.params.id;

    console.log(`❌ Admin rejecting agency: ${orgId}, Reason: ${reason}`);

    const [org] = await db
      .select()
      .from(organizations)
      .where(eq(organizations.id, orgId));

    if (!org) {
      return res.status(404).json({ error: "Organization not found" });
    }

    // Reset verification status and ask for resubmission
    const [updated] = await db
      .update(organizations)
      .set({ 
        isVerified: false,
        verificationStatus: "unverified",
      })
      .where(eq(organizations.id, orgId))
      .returning();

    console.log(`✅ Agency rejection recorded: ${org.name}`);

    res.json({
      message: "Agency verification rejected. They can resubmit.",
      reason,
      organization: updated,
    });
  } catch (error) {
    console.error("❌ Reject agency error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// ─── GET /api/admin/agency-receipts ────────────────────────
// Fetch organizations with pending verification receipts

router.get("/agency-receipts", requireAuth, requireRole("admin"), async (_req, res) => {
  try {
    // Get all organizations with pending verification
    const pendingOrgs = await db
      .select()
      .from(organizations)
      .where(eq(organizations.verificationStatus, "pending"))
      .orderBy(desc(organizations.createdAt));

    // Enrich with owner info and receipt document
    const enriched = await Promise.all(
      pendingOrgs.map(async (org) => {
        const [owner] = await db
          .select({ name: users.name, email: users.email })
          .from(users)
          .where(eq(users.id, org.ownerUserId));

        // Get the receipt document uploaded by the owner
        const [receipt] = org.ownerUserId
          ? await db
              .select()
              .from(documents)
              .where(
                and(
                  eq(documents.tutorId, org.ownerUserId),
                  eq(documents.type, "government_id")
                )
              )
              .orderBy(desc(documents.submittedAt))
              .limit(1)
          : [undefined];

        return {
          orgId: org.id,
          orgName: org.name,
          orgDescription: org.description,
          orgLocation: org.location,
          ownerName: owner?.name || "Unknown",
          ownerEmail: owner?.email || "",
          receipt: receipt
            ? {
                id: receipt.id,
                fileName: receipt.fileName,
                fileKey: receipt.fileKey,
                status: receipt.status,
                submittedAt: receipt.submittedAt,
                reviewerNote: receipt.reviewerNote,
              }
            : null,
          createdAt: org.createdAt,
        }
      })
    );

    res.json(enriched);
  } catch (error) {
    console.error("❌ Get agency receipts error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// ─── GET /api/admin/agency-receipts/:orgId/preview ──────────
// Preview a receipt document for an agency

router.get("/agency-receipts/:orgId/preview", requireAuth, requireRole("admin"), async (req, res) => {
  try {
    const [org] = await db
      .select()
      .from(organizations)
      .where(eq(organizations.id, req.params.orgId));

    if (!org) {
      return res.status(404).json({ error: "Organization not found" });
    }

    if (!org.ownerUserId) {
      return res.status(404).json({ error: "Organization has no owner" });
    }

    // Get the most recent receipt from the owner
    const [receipt] = await db
      .select()
      .from(documents)
      .where(
        and(
          eq(documents.tutorId, org.ownerUserId),
          eq(documents.type, "government_id")
        )
      )
      .orderBy(desc(documents.submittedAt))
      .limit(1);

    if (!receipt || !receipt.fileKey) {
      return res.status(404).json({ error: "No receipt found" });
    }

    const { data, error } = await storageClient.storage
      .from(BUCKET_NAME)
      .createSignedUrl(receipt.fileKey, 7200);

    if (error) {
      console.error("Supabase signed URL error:", error);
      return res.status(500).json({ error: "Failed to generate preview URL" });
    }

    res.json({
      previewUrl: data.signedUrl,
      fileName: receipt.fileName,
      orgName: org.name,
    });
  } catch (error) {
    console.error("❌ Preview receipt error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
