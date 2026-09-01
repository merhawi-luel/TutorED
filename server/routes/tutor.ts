import { Router } from "express";
import { createClient } from "@supabase/supabase-js";
import { db } from "../db";
import {
  tutorProfiles,
  documents,
  verificationRequests,
  vacancies,
  applications,
  organizations,
  users,
  educationEntries,
  tutorReviews,
} from "../db/schema";
import { requireAuth, requireRole } from "../middleware/auth";
import { eq, and, desc, sql } from "drizzle-orm";

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);
const BUCKET_NAME = "documents";

const router = Router();

// ─── GET /api/tutor/profile ──────────────────────────────────

router.get("/profile", requireAuth, requireRole("tutor"), async (req, res) => {
  try {
    const [profile] = await db
      .select()
      .from(tutorProfiles)
      .where(eq(tutorProfiles.userId, req.user!.userId));

    if (!profile) {
      return res.status(404).json({ error: "Profile not found" });
    }

    res.json(profile);
  } catch (error) {
    console.error("Get profile error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// ─── PUT /api/tutor/profile ──────────────────────────────────

router.put("/profile", requireAuth, requireRole("tutor"), async (req, res) => {
  try {
    const updates = req.body;

    // Remove fields that shouldn't be updated directly
    delete updates.userId;
    delete updates.rating;
    delete updates.applicationCount;
    delete updates.verificationLevel;

    const [updated] = await db
      .update(tutorProfiles)
      .set(updates)
      .where(eq(tutorProfiles.userId, req.user!.userId))
      .returning();

    res.json(updated);
  } catch (error) {
    console.error("Update profile error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// ─── GET /api/tutor/documents ────────────────────────────────

router.get("/documents", requireAuth, requireRole("tutor"), async (req, res) => {
  try {
    const docs = await db
      .select()
      .from(documents)
      .where(eq(documents.tutorId, req.user!.userId))
      .orderBy(desc(documents.submittedAt));

    res.json(docs);
  } catch (error) {
    console.error("Get documents error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// ─── GET /api/tutor/documents/:id/download ───────────────────

router.get("/documents/:id/download", requireAuth, requireRole("tutor"), async (req, res) => {
  try {
    console.log(`📥 Download request for document ID: ${req.params.id} by user: ${req.user!.userId}`);
    
    const [doc] = await db
      .select()
      .from(documents)
      .where(and(eq(documents.id, req.params.id), eq(documents.tutorId, req.user!.userId)));

    if (!doc) {
      console.log(`❌ Document not found or access denied`);
      return res.status(404).json({ error: "Document not found" });
    }

    console.log(`📄 Document found:`, {
      id: doc.id,
      fileName: doc.fileName,
      fileKey: doc.fileKey,
      type: doc.type,
      status: doc.status
    });

    if (!doc.fileKey) {
      console.log(`❌ Document has no fileKey - file was not uploaded to storage`);
      return res.status(404).json({ error: "File not available for download" });
    }

    console.log(`🔑 Generating signed URL for fileKey: ${doc.fileKey}`);
    
    const { data, error } = await supabase.storage
      .from(BUCKET_NAME)
      .createSignedUrl(doc.fileKey, 3600);

    if (error) {
      console.error("❌ Supabase signed URL error:", error);
      return res.status(500).json({ error: "Failed to generate download URL", details: error.message });
    }

    console.log(`✅ Signed URL generated successfully`);
    res.json({ downloadUrl: data.signedUrl, fileName: doc.fileName });
  } catch (error) {
    console.error("❌ Download document error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// ─── GET /api/tutor/documents/:id/preview ────────────────────

router.get("/documents/:id/preview", requireAuth, requireRole("tutor"), async (req, res) => {
  try {
    const [doc] = await db
      .select()
      .from(documents)
      .where(and(eq(documents.id, req.params.id), eq(documents.tutorId, req.user!.userId)));

    if (!doc) {
      return res.status(404).json({ error: "Document not found" });
    }

    if (!doc.fileKey) {
      return res.status(404).json({ error: "File not available for preview" });
    }

    // Generate signed URL with longer expiry for preview
    const { data, error } = await supabase.storage
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
      title: doc.title 
    });
  } catch (error) {
    console.error("Preview document error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// ─── POST /api/tutor/documents ───────────────────────────────

router.post("/documents", requireAuth, requireRole("tutor"), async (req, res) => {
  try {
    const { type, title, fileName, fileKey } = req.body;

    if (!type || !title || !fileName) {
      return res.status(400).json({ error: "Type, title, and fileName are required" });
    }

    const [doc] = await db
      .insert(documents)
      .values({
        tutorId: req.user!.userId,
        type,
        title,
        fileName,
        fileKey: fileKey || null,
        status: "pending",
      })
      .returning();

    res.status(201).json(doc);
  } catch (error) {
    console.error("Create document error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// ─── DELETE /api/tutor/documents/:id ─────────────────────────

router.delete("/documents/:id", requireAuth, requireRole("tutor"), async (req, res) => {
  try {
    const { id } = req.params;

    // Only allow deleting pending documents
    const [doc] = await db
      .select()
      .from(documents)
      .where(and(eq(documents.id, id), eq(documents.tutorId, req.user!.userId)));

    if (!doc) {
      return res.status(404).json({ error: "Document not found" });
    }

    if (doc.status !== "pending") {
      return res.status(400).json({ error: "Can only delete pending documents" });
    }

    await db.delete(documents).where(eq(documents.id, id));
    res.json({ success: true });
  } catch (error) {
    console.error("Delete document error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// ─── POST /api/tutor/verify ──────────────────────────────────

router.post("/verify", requireAuth, requireRole("tutor"), async (req, res) => {
  try {
    // Check if there's already a pending/under_review request
    const existing = await db
      .select()
      .from(verificationRequests)
      .where(
        and(
          eq(verificationRequests.tutorId, req.user!.userId),
          eq(verificationRequests.status, "pending")
        )
      );

    if (existing.length > 0) {
      return res.status(400).json({ error: "You already have a pending verification request" });
    }

    // Also check for under_review
    const underReview = await db
      .select()
      .from(verificationRequests)
      .where(
        and(
          eq(verificationRequests.tutorId, req.user!.userId),
          eq(verificationRequests.status, "under_review")
        )
      );

    if (underReview.length > 0) {
      return res.status(400).json({ error: "Your verification request is currently under review" });
    }

    // Get tutor's documents
    const tutorDocs = await db
      .select()
      .from(documents)
      .where(eq(documents.tutorId, req.user!.userId));

    if (tutorDocs.length === 0) {
      return res.status(400).json({ error: "Upload at least one document before requesting verification" });
    }

    // Required document types — all must be uploaded (with non-rejected status)
    const REQUIRED_DOC_TYPES = ["government_id", "degree_certificate"];

    const missingTypes = REQUIRED_DOC_TYPES.filter((requiredType) => {
      const hasValidDoc = tutorDocs.some(
        (doc) => doc.type === requiredType && doc.status !== "rejected"
      );
      return !hasValidDoc;
    });

    if (missingTypes.length > 0) {
      const typeLabels: Record<string, string> = {
        government_id: "Government ID",
        degree_certificate: "Degree Certificate",
      };
      const missing = missingTypes.map((t) => typeLabels[t] || t).join(", ");
      return res.status(400).json({
        error: `Missing required documents: ${missing}. Please upload them before requesting verification.`,
      });
    }

    const [vr] = await db
      .insert(verificationRequests)
      .values({
        tutorId: req.user!.userId,
        status: "pending",
      })
      .returning();

    res.status(201).json(vr);
  } catch (error) {
    console.error("Request verification error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// ─── GET /api/tutor/verification ─────────────────────────────

router.get("/verification", requireAuth, requireRole("tutor"), async (req, res) => {
  try {
    const [vr] = await db
      .select()
      .from(verificationRequests)
      .where(eq(verificationRequests.tutorId, req.user!.userId))
      .orderBy(desc(verificationRequests.requestedAt));

    res.json(vr || null);
  } catch (error) {
    console.error("Get verification error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// ─── GET /api/tutor/vacancies (browse all open) ────────────────────

router.get("/vacancies", async (req, res) => {
  try {
    console.log("📋 GET /api/tutor/vacancies - Fetching all open vacancies");
    const allVacancies = await db
      .select({
        id: vacancies.id,
        organizationId: vacancies.organizationId,
        parentId: vacancies.parentId,
        title: vacancies.title,
        description: vacancies.description,
        subjects: vacancies.subjects,
        grades: vacancies.grades,
        requiredEducation: vacancies.requiredEducation,
        requiredExperience: vacancies.requiredExperience,
        location: vacancies.location,
        teachingMode: vacancies.teachingMode,
        salary: vacancies.salary,
        availability: vacancies.availability,
        deadline: vacancies.deadline,
        status: vacancies.status,
        applicantCount: vacancies.applicantCount,
        createdAt: vacancies.createdAt,
      })
      .from(vacancies)
      .where(eq(vacancies.status, "open"))
      .orderBy(desc(vacancies.createdAt));

    console.log(`✅ Found ${allVacancies.length} open vacancies`);

    // Enrich with organization name (or parent name for parent-posted vacancies)
    const enriched = await Promise.all(
      allVacancies.map(async (v) => {
        if (v.organizationId) {
          const [org] = await db
            .select({ name: organizations.name })
            .from(organizations)
            .where(eq(organizations.id, v.organizationId));
          return { ...v, organizationName: org?.name ?? "Unknown" };
        }
        if (v.parentId) {
          const [parent] = await db
            .select({ name: users.name })
            .from(users)
            .where(eq(users.id, v.parentId));
          return { ...v, organizationName: parent?.name ?? "Parent" };
        }
        return { ...v, organizationName: "Unknown" };
      })
    );

    console.log(`✅ Enriched vacancies, returning ${enriched.length} results`);
    res.json(enriched);
  } catch (error: any) {
    console.error("Get vacancies error:", error);
    console.error("Error details:", {
      message: error.message,
      code: error.code,
      detail: error.detail,
      cause: error.cause,
    });
    res.status(500).json({ 
      error: "Internal server error",
      message: error.cause?.detail || error.message 
    });
  }
});

// ─── GET /api/tutor/vacancies/:id (public single vacancy) ──

router.get("/vacancies/:id", async (req, res) => {
  try {
    const [vacancy] = await db
      .select()
      .from(vacancies)
      .where(eq(vacancies.id, req.params.id));

    if (!vacancy) {
      return res.status(404).json({ error: "Vacancy not found" });
    }

    // Enrich with organization or parent info
    let organizationName = "Unknown";
    let organizationLocation = "";
    let organizationDescription = "";
    let postedBy = "";

    if (vacancy.organizationId) {
      const [org] = await db
        .select()
        .from(organizations)
        .where(eq(organizations.id, vacancy.organizationId));
      if (org) {
        organizationName = org.name;
        organizationLocation = org.location || "";
        organizationDescription = org.description || "";
        postedBy = org.name;
      }
    } else if (vacancy.parentId) {
      const [parent] = await db
        .select({ name: users.name })
        .from(users)
        .where(eq(users.id, vacancy.parentId));
      organizationName = parent?.name ?? "Parent";
      postedBy = parent?.name ?? "Parent";
    }

    res.json({
      ...vacancy,
      organizationName,
      organizationLocation,
      organizationDescription,
      postedBy,
    });
  } catch (error) {
    console.error("Get vacancy detail error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// ─── POST /api/applications ──────────────────────────────────

router.post("/applications", requireAuth, requireRole("tutor"), async (req, res) => {
  try {
    const { vacancyId } = req.body;

    if (!vacancyId) {
      return res.status(400).json({ error: "vacancyId is required" });
    }

    // Check vacancy exists and is open
    const [vacancy] = await db
      .select()
      .from(vacancies)
      .where(and(eq(vacancies.id, vacancyId), eq(vacancies.status, "open")));

    if (!vacancy) {
      return res.status(404).json({ error: "Vacancy not found or closed" });
    }

    // Check if already applied
    const existing = await db
      .select()
      .from(applications)
      .where(
        and(
          eq(applications.tutorId, req.user!.userId),
          eq(applications.vacancyId, vacancyId)
        )
      );

    if (existing.length > 0) {
      return res.status(400).json({ error: "You have already applied to this vacancy" });
    }

    const [app] = await db
      .insert(applications)
      .values({
        tutorId: req.user!.userId,
        vacancyId,
        status: "applied",
      })
      .returning();

    // Increment applicant count
    await db
      .update(vacancies)
      .set({ applicantCount: (vacancy.applicantCount ?? 0) + 1 })
      .where(eq(vacancies.id, vacancyId));

    // Increment tutor application count
    const [profile] = await db
      .select()
      .from(tutorProfiles)
      .where(eq(tutorProfiles.userId, req.user!.userId));

    if (profile) {
      await db
        .update(tutorProfiles)
        .set({ applicationCount: (profile.applicationCount ?? 0) + 1 })
        .where(eq(tutorProfiles.userId, req.user!.userId));
    }

    res.status(201).json(app);
  } catch (error) {
    console.error("Apply error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// ─── GET /api/applications (list own) ────────────────────────

router.get("/applications", requireAuth, requireRole("tutor"), async (req, res) => {
  try {
    const apps = await db
      .select()
      .from(applications)
      .where(eq(applications.tutorId, req.user!.userId))
      .orderBy(desc(applications.appliedAt));

    // Enrich with vacancy title and org name
    const enriched = await Promise.all(
      apps.map(async (a) => {
        const [vacancy] = await db
          .select()
          .from(vacancies)
          .where(eq(vacancies.id, a.vacancyId));
        return {
          ...a,
          vacancyTitle: vacancy?.title ?? "Unknown",
          organizationName: "Unknown", // We can join later
        };
      })
    );

    res.json(enriched);
  } catch (error) {
    console.error("Get applications error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// ─── PUT /api/applications/:id/withdraw ──────────────────────

router.put("/applications/:id/withdraw", requireAuth, requireRole("tutor"), async (req, res) => {
  try {
    const [app] = await db
      .select()
      .from(applications)
      .where(
        and(
          eq(applications.id, req.params.id),
          eq(applications.tutorId, req.user!.userId)
        )
      );

    if (!app) {
      return res.status(404).json({ error: "Application not found" });
    }

    if (app.status !== "applied") {
      return res.status(400).json({ error: "Can only withdraw applications with 'applied' status" });
    }

    const [updated] = await db
      .update(applications)
      .set({ status: "withdrawn", updatedAt: new Date() })
      .where(eq(applications.id, req.params.id))
      .returning();

    res.json(updated);
  } catch (error) {
    console.error("Withdraw error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// ─── GET /api/tutor/education-entries ──────────────────────

router.get("/education-entries", requireAuth, requireRole("tutor"), async (req, res) => {
  try {
    const entries = await db
      .select()
      .from(educationEntries)
      .where(eq(educationEntries.tutorId, req.user!.userId))
      .orderBy(desc(educationEntries.submittedAt));

    res.json(entries);
  } catch (error) {
    console.error("Get education entries error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// ─── POST /api/tutor/education-entries ─────────────────────

router.post("/education-entries", requireAuth, requireRole("tutor"), async (req, res) => {
  try {
    const { name, title, description } = req.body;

    if (!name || !title) {
      return res.status(400).json({ error: "Name and title are required" });
    }

    const [entry] = await db
      .insert(educationEntries)
      .values({
        tutorId: req.user!.userId,
        name,
        title,
        description: description || "",
        status: "pending",
      })
      .returning();

    res.status(201).json(entry);
  } catch (error) {
    console.error("Create education entry error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// ─── DELETE /api/tutor/education-entries/:id ───────────────

router.delete("/education-entries/:id", requireAuth, requireRole("tutor"), async (req, res) => {
  try {
    const { id } = req.params;

    const [entry] = await db
      .select()
      .from(educationEntries)
      .where(and(eq(educationEntries.id, id), eq(educationEntries.tutorId, req.user!.userId)));

    if (!entry) {
      return res.status(404).json({ error: "Education entry not found" });
    }

    if (entry.status !== "pending") {
      return res.status(400).json({ error: "Can only delete pending entries" });
    }

    await db.delete(educationEntries).where(eq(educationEntries.id, id));
    res.json({ success: true });
  } catch (error) {
    console.error("Delete education entry error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// ─── GET /api/tutor/reviews ───────────────────────────────
router.get("/reviews", requireAuth, requireRole("tutor"), async (req, res) => {
  try {
    const userId = req.user!.userId;

    const reviews = await db
      .select({
        id: tutorReviews.id,
        applicationId: tutorReviews.applicationId,
        parentId: tutorReviews.parentId,
        tutorId: tutorReviews.tutorId,
        rating: tutorReviews.rating,
        description: tutorReviews.description,
        createdAt: tutorReviews.createdAt,
        parentName: users.name,
      })
      .from(tutorReviews)
      .innerJoin(users, eq(tutorReviews.parentId, users.id))
      .where(eq(tutorReviews.tutorId, userId))
      .orderBy(desc(tutorReviews.createdAt));

    res.json(reviews);
  } catch (error) {
    console.error("Get tutor reviews error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// ─── GET /api/tutor/reviews/stats ──────────────────────────
router.get("/reviews/stats", requireAuth, requireRole("tutor"), async (req, res) => {
  try {
    const userId = req.user!.userId;

    const [stats] = await db
      .select({
        avg: sql<number>`COALESCE(AVG(${tutorReviews.rating}), 0)`,
        count: sql<number>`COUNT(${tutorReviews.id})`,
      })
      .from(tutorReviews)
      .where(eq(tutorReviews.tutorId, userId));

    res.json({
      averageRating: Number(Number(stats.avg).toFixed(1)),
      totalReviews: Number(stats.count),
    });
  } catch (error) {
    console.error("Get tutor review stats error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
