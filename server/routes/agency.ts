import { Router } from "express";
import { createClient } from "@supabase/supabase-js";
import { db } from "../db";
import {
  organizations,
  vacancies,
  applications,
  tutorProfiles,
  users,
  recruitmentRequests,
  documents,
  educationEntries,
} from "../db/schema";
import { requireAuth, requireRole } from "../middleware/auth";
import { eq, and, desc } from "drizzle-orm";

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);
const BUCKET_NAME = "documents";

const router = Router();

// Helper: get agency's organization
async function getAgencyOrg(userId: string) {
  console.log(`🔍 Looking for organization with owner_user_id: ${userId}`);
  const [org] = await db
    .select()
    .from(organizations)
    .where(eq(organizations.ownerUserId, userId));
  
  if (org) {
    console.log(`✅ Found organization: ${org.name} (ID: ${org.id})`);
  } else {
    console.log(`❌ No organization found for user: ${userId}`);
  }
  
  return org;
}

// ─── GET /api/agency/organization ────────────────────────────

router.get("/organization", requireAuth, requireRole("agency"), async (req, res) => {
  try {
    const org = await getAgencyOrg(req.user!.userId);
    if (!org) {
      return res.status(404).json({ error: "Organization not found" });
    }
    res.json(org);
  } catch (error) {
    console.error("Get org error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// ─── POST /api/agency/organization ───────────────────────────
// Create organization for agency user (first-time setup)

router.post("/organization", requireAuth, requireRole("agency"), async (req, res) => {
  try {
    console.log(`🏢 Agency user creating organization - User ID: ${req.user!.userId}`);
    
    // Check if organization already exists
    const existing = await getAgencyOrg(req.user!.userId);
    if (existing) {
      console.log(`⚠️ Organization already exists for user: ${req.user!.userId}`);
      return res.status(400).json({ error: "Organization already exists" });
    }

    const { name, description, location, subjects } = req.body;

    if (!name) {
      return res.status(400).json({ error: "Organization name is required" });
    }

    console.log(`📋 Creating organization:`, { name, location });

    const [newOrg] = await db
      .insert(organizations)
      .values({
        name,
        description: description || "",
        location: location || "",
        subjects: subjects || [],
        isVerified: false,
        ownerUserId: req.user!.userId,
      })
      .returning();

    console.log(`✅ Organization created successfully: ${newOrg.id}`);

    res.status(201).json(newOrg);
  } catch (error) {
    console.error("❌ Create organization error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// ─── PUT /api/agency/organization ────────────────────────────

router.put("/organization", requireAuth, requireRole("agency"), async (req, res) => {
  try {
    const org = await getAgencyOrg(req.user!.userId);
    if (!org) {
      return res.status(404).json({ error: "Organization not found" });
    }

    const updates = req.body;
    delete updates.id;
    delete updates.ownerUserId;
    delete updates.createdAt;

    const [updated] = await db
      .update(organizations)
      .set(updates)
      .where(eq(organizations.id, org.id))
      .returning();

    res.json(updated);
  } catch (error) {
    console.error("Update org error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// ─── GET /api/agency/vacancies ───────────────────────────────

router.get("/vacancies", requireAuth, requireRole("agency"), async (req, res) => {
  try {
    const org = await getAgencyOrg(req.user!.userId);
    if (!org) {
      return res.status(404).json({ error: "Organization not found" });
    }

    const myVacancies = await db
      .select()
      .from(vacancies)
      .where(eq(vacancies.organizationId, org.id))
      .orderBy(desc(vacancies.createdAt));

    res.json(myVacancies);
  } catch (error) {
    console.error("Get agency vacancies error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// ─── POST /api/agency/vacancies ──────────────────────────────

router.post("/vacancies", requireAuth, requireRole("agency"), async (req, res) => {
  try {
    console.log(`📝 Agency creating vacancy - User ID: ${req.user!.userId}`);
    
    const org = await getAgencyOrg(req.user!.userId);
    if (!org) {
      console.log(`❌ Organization not found for user: ${req.user!.userId}`);
      return res.status(404).json({ error: "Organization not found. Please contact support." });
    }

    // ✅ NEW: Check if organization is verified
    if (!org.isVerified) {
      console.log(`❌ Organization not verified: ${org.id}`);
      return res.status(403).json({ 
        error: "Your agency must be verified before posting vacancies. Please upload your payment receipt and wait for admin approval." 
      });
    }

    console.log(`🏢 Organization found and verified: ${org.name} (ID: ${org.id})`);

    const {
      title, description, subject, grade,
      requiredEducation, requiredExperience,
      location, teachingMode, salary, availability, deadline,
    } = req.body;

    console.log(`📋 Vacancy details:`, { title, subject, grade, location });

    if (!title || !subject || !grade) {
      console.log(`❌ Missing required fields`);
      return res.status(400).json({ error: "Title, subject, and grade are required" });
    }

    const [vacancy] = await db
      .insert(vacancies)
      .values({
        organizationId: org.id,
        title,
        description: description || "",
        subject,
        grade,
        requiredEducation: requiredEducation || "",
        requiredExperience: requiredExperience || 0,
        location: location || "",
        teachingMode: teachingMode || "in-person",
        salary: salary || "",
        availability: availability || "",
        deadline: deadline || "",
        status: "open",
      })
      .returning();

    console.log(`✅ Vacancy created successfully: ${vacancy.id}`);
    console.log(`📍 Organization: ${org.name}, Title: ${vacancy.title}, Grade: ${vacancy.grade}`);

    res.status(201).json(vacancy);
  } catch (error) {
    console.error("❌ Create vacancy error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// ─── GET /api/agency/vacancies/:id ───────────────────────────
// Get a single vacancy by ID (must belong to this agency)

router.get("/vacancies/:id", requireAuth, requireRole("agency"), async (req, res) => {
  try {
    const org = await getAgencyOrg(req.user!.userId);
    if (!org) {
      return res.status(404).json({ error: "Organization not found" });
    }

    const [vacancy] = await db
      .select()
      .from(vacancies)
      .where(and(eq(vacancies.id, req.params.id), eq(vacancies.organizationId, org.id)));

    if (!vacancy) {
      return res.status(404).json({ error: "Vacancy not found" });
    }

    res.json(vacancy);
  } catch (error) {
    console.error("Get vacancy error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// ─── PUT /api/agency/vacancies/:id ───────────────────────────

router.put("/vacancies/:id", requireAuth, requireRole("agency"), async (req, res) => {
  try {
    const org = await getAgencyOrg(req.user!.userId);
    if (!org) {
      return res.status(404).json({ error: "Organization not found" });
    }

    // Verify vacancy belongs to this org
    const [existing] = await db
      .select()
      .from(vacancies)
      .where(and(eq(vacancies.id, req.params.id), eq(vacancies.organizationId, org.id)));

    if (!existing) {
      return res.status(404).json({ error: "Vacancy not found" });
    }

    const updates = req.body;
    delete updates.id;
    delete updates.organizationId;
    delete updates.createdAt;
    delete updates.applicantCount;

    const [updated] = await db
      .update(vacancies)
      .set(updates)
      .where(eq(vacancies.id, req.params.id))
      .returning();

    res.json(updated);
  } catch (error) {
    console.error("Update vacancy error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// ─── PUT /api/agency/vacancies/:id/close ─────────────────────
// Hard-delete: removes vacancy and all related applications

router.put("/vacancies/:id/close", requireAuth, requireRole("agency"), async (req, res) => {
  try {
    const org = await getAgencyOrg(req.user!.userId);
    if (!org) {
      return res.status(404).json({ error: "Organization not found" });
    }

    const [existing] = await db
      .select()
      .from(vacancies)
      .where(and(eq(vacancies.id, req.params.id), eq(vacancies.organizationId, org.id)));

    if (!existing) {
      return res.status(404).json({ error: "Vacancy not found" });
    }

    // Delete related applications first
    await db.delete(applications).where(eq(applications.vacancyId, req.params.id));

    // Hard-delete the vacancy
    await db.delete(vacancies).where(eq(vacancies.id, req.params.id));

    res.json({ success: true, deletedId: req.params.id });
  } catch (error) {
    console.error("Close vacancy error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// ─── GET /api/agency/applicants/:vacancyId ───────────────────

router.get("/applicants/:vacancyId", requireAuth, requireRole("agency"), async (req, res) => {
  try {
    const org = await getAgencyOrg(req.user!.userId);
    if (!org) {
      return res.status(404).json({ error: "Organization not found" });
    }

    // Verify vacancy belongs to this org
    const [vacancy] = await db
      .select()
      .from(vacancies)
      .where(and(eq(vacancies.id, req.params.vacancyId), eq(vacancies.organizationId, org.id)));

    if (!vacancy) {
      return res.status(404).json({ error: "Vacancy not found" });
    }

    // Get all applications for this vacancy
    const apps = await db
      .select()
      .from(applications)
      .where(eq(applications.vacancyId, req.params.vacancyId))
      .orderBy(desc(applications.appliedAt));

    // Enrich with tutor info and education entries
    const enriched = await Promise.all(
      apps.map(async (a) => {
        const [tutorUser] = await db
          .select()
          .from(users)
          .where(eq(users.id, a.tutorId));
        const [profile] = await db
          .select()
          .from(tutorProfiles)
          .where(eq(tutorProfiles.userId, a.tutorId));
        const tutorEducationEntries = await db
          .select()
          .from(educationEntries)
          .where(eq(educationEntries.tutorId, a.tutorId));
        return {
          ...a,
          tutorName: tutorUser?.name ?? "Unknown",
          tutorProfile: profile ?? null,
          educationEntries: tutorEducationEntries,
        };
      })
    );

    res.json(enriched);
  } catch (error) {
    console.error("Get applicants error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// ─── GET /api/agency/applicants (all across vacancies) ───────

router.get("/applicants", requireAuth, requireRole("agency"), async (req, res) => {
  try {
    const org = await getAgencyOrg(req.user!.userId);
    if (!org) {
      return res.status(404).json({ error: "Organization not found" });
    }

    // Get all vacancy IDs for this org
    const myVacancies = await db
      .select({ id: vacancies.id })
      .from(vacancies)
      .where(eq(vacancies.organizationId, org.id));

    const vacancyIds = myVacancies.map((v) => v.id);
    if (vacancyIds.length === 0) {
      return res.json([]);
    }

    // Get all applications for these vacancies
    const allApps = [];
    for (const vId of vacancyIds) {
      const apps = await db
        .select()
        .from(applications)
        .where(eq(applications.vacancyId, vId));
      allApps.push(...apps);
    }

    // Enrich with tutor info, vacancy title, and education entries
    const enriched = await Promise.all(
      allApps.map(async (a) => {
        const [tutorUser] = await db
          .select()
          .from(users)
          .where(eq(users.id, a.tutorId));
        const [profile] = await db
          .select()
          .from(tutorProfiles)
          .where(eq(tutorProfiles.userId, a.tutorId));
        const [vacancy] = await db
          .select()
          .from(vacancies)
          .where(eq(vacancies.id, a.vacancyId));
        const tutorEducationEntries = await db
          .select()
          .from(educationEntries)
          .where(eq(educationEntries.tutorId, a.tutorId));
        return {
          ...a,
          tutorName: tutorUser?.name ?? "Unknown",
          tutorProfile: profile ?? null,
          vacancyTitle: vacancy?.title ?? "Unknown",
          educationEntries: tutorEducationEntries,
        };
      })
    );

    res.json(enriched);
  } catch (error) {
    console.error("Get all applicants error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// ─── PUT /api/applications/:id/status ────────────────────────

router.put("/applications/:id/status", requireAuth, requireRole("agency"), async (req, res) => {
  try {
    const { status } = req.body;
    const validStatuses = ["applied", "under_review", "shortlisted", "interview", "accepted", "rejected"];

    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: "Invalid status" });
    }

    const [app] = await db
      .select()
      .from(applications)
      .where(eq(applications.id, req.params.id));

    if (!app) {
      return res.status(404).json({ error: "Application not found" });
    }

    // Verify this vacancy belongs to the agency's org
    const org = await getAgencyOrg(req.user!.userId);
    if (!org) {
      return res.status(404).json({ error: "Organization not found" });
    }

    const [vacancy] = await db
      .select()
      .from(vacancies)
      .where(and(eq(vacancies.id, app.vacancyId), eq(vacancies.organizationId, org.id)));

    if (!vacancy) {
      return res.status(403).json({ error: "Not authorized" });
    }

    const [updated] = await db
      .update(applications)
      .set({ status, updatedAt: new Date() })
      .where(eq(applications.id, req.params.id))
      .returning();

    res.json(updated);
  } catch (error) {
    console.error("Update application status error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// ─── GET /api/agency/requests ──────────────────────────────
// Get incoming recruitment requests from parents

router.get("/requests", requireAuth, requireRole("agency"), async (req, res) => {
  try {
    const org = await getAgencyOrg(req.user!.userId);
    if (!org) {
      return res.status(404).json({ error: "Organization not found" });
    }

    const requests = await db
      .select({
        id: recruitmentRequests.id,
        subject: recruitmentRequests.subject,
        grade: recruitmentRequests.grade,
        location: recruitmentRequests.location,
        notes: recruitmentRequests.notes,
        status: recruitmentRequests.status,
        parentName: recruitmentRequests.parentName,
        parentEmail: recruitmentRequests.parentEmail,
        parentPhone: recruitmentRequests.parentPhone,
        createdAt: recruitmentRequests.createdAt,
      })
      .from(recruitmentRequests)
      .where(eq(recruitmentRequests.organizationId, org.id))
      .orderBy(desc(recruitmentRequests.createdAt));

    res.json(requests);
  } catch (error) {
    console.error("Get agency requests error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// ─── PUT /api/agency/requests/:id/status ────────────────────
// Update recruitment request status

router.put("/requests/:id/status", requireAuth, requireRole("agency"), async (req, res) => {
  try {
    const { status } = req.body;
    const validStatuses = ["pending", "contacted", "accepted", "completed", "rejected"];

    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: "Invalid status" });
    }

    const org = await getAgencyOrg(req.user!.userId);
    if (!org) {
      return res.status(404).json({ error: "Organization not found" });
    }

    // Verify this request belongs to this agency
    const [existing] = await db
      .select()
      .from(recruitmentRequests)
      .where(
        and(
          eq(recruitmentRequests.id, req.params.id),
          eq(recruitmentRequests.organizationId, org.id)
        )
      );

    if (!existing) {
      return res.status(404).json({ error: "Request not found" });
    }

    const [updated] = await db
      .update(recruitmentRequests)
      .set({ status })
      .where(eq(recruitmentRequests.id, req.params.id))
      .returning();

    res.json(updated);
  } catch (error) {
    console.error("Update request status error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// ─── GET /api/agency/tutors/:tutorId/documents ─────────────
// Get documents for a specific tutor (for agency to view)

router.get("/tutors/:tutorId/documents", requireAuth, requireRole("agency"), async (req, res) => {
  try {
    const org = await getAgencyOrg(req.user!.userId);
    if (!org) {
      return res.status(404).json({ error: "Organization not found" });
    }

    // Verify this tutor has applied to at least one of our vacancies
    const myVacancies = await db
      .select({ id: vacancies.id })
      .from(vacancies)
      .where(eq(vacancies.organizationId, org.id));

    const vacancyIds = myVacancies.map((v) => v.id);
    
    if (vacancyIds.length === 0) {
      return res.status(403).json({ error: "Not authorized" });
    }

    // Check if tutor has applied to any of our vacancies
    const hasApplied = await db
      .select()
      .from(applications)
      .where(eq(applications.tutorId, req.params.tutorId));

    const appliedToUs = hasApplied.some(a => vacancyIds.includes(a.vacancyId));
    
    if (!appliedToUs) {
      return res.status(403).json({ error: "Not authorized to view this tutor's documents" });
    }

    // Get tutor's documents
    const tutorDocs = await db
      .select()
      .from(documents)
      .where(eq(documents.tutorId, req.params.tutorId))
      .orderBy(desc(documents.submittedAt));

    res.json(tutorDocs);
  } catch (error) {
    console.error("Get tutor documents error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// ─── GET /api/agency/documents/:id/preview ──────────────────
// Preview a document (agency can only view verified documents)

router.get("/documents/:id/preview", requireAuth, requireRole("agency"), async (req, res) => {
  try {
    const [doc] = await db
      .select()
      .from(documents)
      .where(eq(documents.id, req.params.id));

    if (!doc) {
      return res.status(404).json({ error: "Document not found" });
    }

    // Only allow preview of verified documents
    if (doc.status !== "verified") {
      return res.status(403).json({ error: "Can only preview verified documents" });
    }

    // Verify agency has access (tutor applied to their vacancy)
    const org = await getAgencyOrg(req.user!.userId);
    if (!org) {
      return res.status(404).json({ error: "Organization not found" });
    }

    const myVacancies = await db
      .select({ id: vacancies.id })
      .from(vacancies)
      .where(eq(vacancies.organizationId, org.id));

    const vacancyIds = myVacancies.map((v) => v.id);

    const hasApplied = await db
      .select()
      .from(applications)
      .where(eq(applications.tutorId, doc.tutorId));

    const appliedToUs = hasApplied.some(a => vacancyIds.includes(a.vacancyId));
    
    if (!appliedToUs) {
      return res.status(403).json({ error: "Not authorized" });
    }

    if (!doc.fileKey) {
      return res.status(404).json({ error: "File not available" });
    }

    const { data, error } = await supabase.storage
      .from(BUCKET_NAME)
      .createSignedUrl(doc.fileKey, 7200);

    if (error) {
      console.error("Supabase signed URL error:", error);
      return res.status(500).json({ error: "Failed to generate preview URL" });
    }

    res.json({
      previewUrl: data.signedUrl,
      fileName: doc.fileName,
      type: doc.type,
      title: doc.title,
    });
  } catch (error) {
    console.error("Preview document error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// ─── GET /api/agency/documents/:id/download ─────────────────
// Download a document (agency can only download verified documents)

router.get("/documents/:id/download", requireAuth, requireRole("agency"), async (req, res) => {
  try {
    const [doc] = await db
      .select()
      .from(documents)
      .where(eq(documents.id, req.params.id));

    if (!doc) {
      return res.status(404).json({ error: "Document not found" });
    }

    // Only allow download of verified documents
    if (doc.status !== "verified") {
      return res.status(403).json({ error: "Can only download verified documents" });
    }

    // Verify agency has access
    const org = await getAgencyOrg(req.user!.userId);
    if (!org) {
      return res.status(404).json({ error: "Organization not found" });
    }

    const myVacancies = await db
      .select({ id: vacancies.id })
      .from(vacancies)
      .where(eq(vacancies.organizationId, org.id));

    const vacancyIds = myVacancies.map((v) => v.id);

    const hasApplied = await db
      .select()
      .from(applications)
      .where(eq(applications.tutorId, doc.tutorId));

    const appliedToUs = hasApplied.some(a => vacancyIds.includes(a.vacancyId));
    
    if (!appliedToUs) {
      return res.status(403).json({ error: "Not authorized" });
    }

    if (!doc.fileKey) {
      return res.status(404).json({ error: "File not available" });
    }

    const { data, error } = await supabase.storage
      .from(BUCKET_NAME)
      .createSignedUrl(doc.fileKey, 3600);

    if (error) {
      console.error("Supabase signed URL error:", error);
      return res.status(500).json({ error: "Failed to generate download URL" });
    }

    res.json({ downloadUrl: data.signedUrl, fileName: doc.fileName });
  } catch (error) {
    console.error("Download document error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
