import { Router } from "express";
import { createClient } from "@supabase/supabase-js";
import { db } from "../db";
import { parentProfiles, vacancies, organizations, recruitmentRequests, users, applications, tutorProfiles, documents, educationEntries } from "../db/schema";
import { requireAuth } from "../middleware/auth";
import { eq, and, desc } from "drizzle-orm";

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);
const BUCKET_NAME = "documents";

const router = Router();

// ─── GET /api/parent/profile ─────────────────────────────────
// Get parent profile

router.get("/profile", requireAuth, async (req, res) => {
  try {
    const profile = await db
      .select()
      .from(parentProfiles)
      .where(eq(parentProfiles.userId, req.user!.userId));

    if (profile.length === 0) {
      return res.status(404).json({ error: "Profile not found" });
    }

    res.json(profile[0]);
  } catch (error) {
    console.error("Get parent profile error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// ─── PUT /api/parent/profile ─────────────────────────────────
// Update parent profile

router.put("/profile", requireAuth, async (req, res) => {
  try {
    const { phone, childrenGrades, preferredSubjects, location, notes } = req.body;

    const updated = await db
      .update(parentProfiles)
      .set({
        phone,
        childrenGrades,
        preferredSubjects,
        location,
        notes,
      })
      .where(eq(parentProfiles.userId, req.user!.userId))
      .returning();

    if (updated.length === 0) {
      return res.status(404).json({ error: "Profile not found" });
    }

    res.json(updated[0]);
  } catch (error) {
    console.error("Update parent profile error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// ─── GET /api/parent/vacancies ───────────────────────────────
// Browse open vacancies (for self-recruitment)

router.get("/vacancies", requireAuth, async (req, res) => {
  try {
    const openVacancies = await db
      .select()
      .from(vacancies)
      .where(eq(vacancies.status, "open"))
      .orderBy(desc(vacancies.createdAt));

    // Enrich with organization name
    const enriched = await Promise.all(
      openVacancies.map(async (v) => {
        let organizationName = "Unknown";
        if (v.organizationId) {
          const [org] = await db
            .select({ name: organizations.name })
            .from(organizations)
            .where(eq(organizations.id, v.organizationId));
          organizationName = org?.name ?? "Unknown";
        } else if (v.parentId) {
          const [parent] = await db
            .select({ name: users.name })
            .from(users)
            .where(eq(users.id, v.parentId));
          organizationName = parent?.name ?? "Parent";
        }
        return { ...v, organizationName };
      })
    );

    res.json(enriched);
  } catch (error) {
    console.error("Get parent vacancies error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// ─── POST /api/parent/vacancies ──────────────────────────────
// Parent creates a vacancy (for self-recruitment)

router.post("/vacancies", requireAuth, async (req, res) => {
  try {
    const {
      title, description, subject, grade,
      requiredEducation, requiredExperience,
      location, teachingMode, salary, availability, deadline,
    } = req.body;

    if (!title || !subject || !grade) {
      return res.status(400).json({ error: "Title, subject, and grade are required" });
    }

    const [vacancy] = await db
      .insert(vacancies)
      .values({
        parentId: req.user!.userId,
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

    res.status(201).json(vacancy);
  } catch (error) {
    console.error("Create parent vacancy error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// ─── GET /api/parent/vacancies/mine ───────────────────────────
// Get vacancies created by this parent

router.get("/vacancies/mine", requireAuth, async (req, res) => {
  try {
    const myVacancies = await db
      .select()
      .from(vacancies)
      .where(eq(vacancies.parentId, req.user!.userId))
      .orderBy(desc(vacancies.createdAt));

    res.json(myVacancies);
  } catch (error) {
    console.error("Get parent own vacancies error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// ─── PUT /api/parent/vacancies/:id/close ─────────────────────
// Hard-delete: removes vacancy and all related applications

router.put("/vacancies/:id/close", requireAuth, async (req, res) => {
  try {
    const [existing] = await db
      .select()
      .from(vacancies)
      .where(
        and(
          eq(vacancies.id, req.params.id),
          eq(vacancies.parentId, req.user!.userId)
        )
      );

    if (!existing) {
      return res.status(404).json({ error: "Vacancy not found" });
    }

    // Delete related applications first
    await db.delete(applications).where(eq(applications.vacancyId, req.params.id));

    // Hard-delete the vacancy
    await db.delete(vacancies).where(eq(vacancies.id, req.params.id));

    res.json({ success: true, deletedId: req.params.id });
  } catch (error) {
    console.error("Close parent vacancy error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// ─── POST /api/parent/contact-agency ─────────────────────────
// Send a recruitment request to an agency

router.post("/contact-agency", requireAuth, async (req, res) => {
  try {
    const { organizationId, subject, grade, location, notes, parentName, parentEmail, parentPhone } = req.body;

    if (!subject || !grade) {
      return res.status(400).json({ error: "Subject and grade are required" });
    }

    const [request] = await db
      .insert(recruitmentRequests)
      .values({
        parentId: req.user!.userId,
        organizationId: organizationId || null,
        parentName: parentName || "",
        parentEmail: parentEmail || "",
        parentPhone: parentPhone || "",
        subject,
        grade,
        location: location || "",
        notes: notes || "",
        status: "pending",
      })
      .returning();

    res.status(201).json(request);
  } catch (error) {
    console.error("Contact agency error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// ─── GET /api/parent/requests ────────────────────────────────
// Get my recruitment requests

router.get("/requests", requireAuth, async (req, res) => {
  try {
    const myRequests = await db
      .select()
      .from(recruitmentRequests)
      .where(eq(recruitmentRequests.parentId, req.user!.userId))
      .orderBy(desc(recruitmentRequests.createdAt));

    // Enrich with organization name
    const enriched = await Promise.all(
      myRequests.map(async (r) => {
        let organizationName = null;
        if (r.organizationId) {
          const [org] = await db
            .select({ name: organizations.name })
            .from(organizations)
            .where(eq(organizations.id, r.organizationId));
          organizationName = org?.name ?? null;
        }
        return { ...r, organizationName };
      })
    );

    res.json(enriched);
  } catch (error) {
    console.error("Get parent requests error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// ─── GET /api/parent/subjects ──────────────────────────────────
// Get all unique subjects from agencies and vacancies

router.get("/subjects", requireAuth, async (_req, res) => {
  try {
    // Collect subjects from organizations
    const orgs = await db.select({ subjects: organizations.subjects }).from(organizations);
    const orgSubjects = orgs.flatMap((o) => o.subjects || []);

    // Collect subjects from vacancies
    const vacs = await db.select({ subject: vacancies.subject }).from(vacancies);
    const vacSubjects = vacs.map((v) => v.subject).filter(Boolean);

    // Deduplicate and sort
    const all = Array.from(new Set([...orgSubjects, ...vacSubjects])).sort();
    res.json(all);
  } catch (error) {
    console.error("Get subjects error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// ─── GET /api/parent/agencies ────────────────────────────────
// List verified agencies for contacting

router.get("/agencies", requireAuth, async (req, res) => {
  try {
    const verifiedAgencies = await db
      .select()
      .from(organizations)
      .where(eq(organizations.isVerified, true))
      .orderBy(organizations.name);

    res.json(verifiedAgencies);
  } catch (error) {
    console.error("Get agencies error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// ─── GET /api/parent/tutors ─────────────────────────────────
// Browse verified tutor profiles (for self-recruitment)

router.get("/tutors", requireAuth, async (req, res) => {
  try {
    // Get all tutor profiles with user info
    const profiles = await db
      .select()
      .from(tutorProfiles)
      .orderBy(desc(tutorProfiles.rating));

    // Enrich with user name and email
    const enriched = await Promise.all(
      profiles.map(async (p) => {
        const [user] = await db
          .select({ name: users.name, email: users.email })
          .from(users)
          .where(eq(users.id, p.userId));
        return {
          ...p,
          tutorName: user?.name ?? "Unknown",
          tutorEmail: user?.email ?? "",
        };
      })
    );

    res.json(enriched);
  } catch (error) {
    console.error("Get tutors error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// ─── GET /api/parent/applicants ──────────────────────────────
// Get all applicants who applied to this parent's vacancies

router.get("/applicants", requireAuth, async (req, res) => {
  try {
    // Get all vacancies owned by this parent
    const myVacancies = await db
      .select({ id: vacancies.id, title: vacancies.title })
      .from(vacancies)
      .where(eq(vacancies.parentId, req.user!.userId));

    const vacancyIds = myVacancies.map((v) => v.id);
    const vacancyMap = new Map(myVacancies.map((v) => [v.id, v.title]));

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

    // Enrich with tutor info, profile, and education entries
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
        const tutorEducationEntries = await db
          .select()
          .from(educationEntries)
          .where(eq(educationEntries.tutorId, a.tutorId));
        return {
          ...a,
          tutorName: tutorUser?.name ?? "Unknown",
          tutorEmail: tutorUser?.email ?? "",
          vacancyTitle: vacancyMap.get(a.vacancyId) ?? "Unknown",
          tutorProfile: profile ?? null,
          educationEntries: tutorEducationEntries,
        };
      })
    );

    res.json(enriched);
  } catch (error) {
    console.error("Get parent applicants error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// ─── GET /api/parent/tutors/:tutorId/documents ───────────────
// Get documents for a tutor who applied to this parent's vacancy

router.get("/tutors/:tutorId/documents", requireAuth, async (req, res) => {
  try {
    // Verify this tutor has applied to at least one of our vacancies
    const myVacancies = await db
      .select({ id: vacancies.id })
      .from(vacancies)
      .where(eq(vacancies.parentId, req.user!.userId));

    const vacancyIds = myVacancies.map((v) => v.id);

    if (vacancyIds.length === 0) {
      return res.status(403).json({ error: "Not authorized" });
    }

    // Check if tutor applied to any of our vacancies
    const hasApplied = await db
      .select()
      .from(applications)
      .where(eq(applications.tutorId, req.params.tutorId));

    const appliedToUs = hasApplied.some((a) => vacancyIds.includes(a.vacancyId));

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
    console.error("Get parent tutor documents error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// ─── GET /api/parent/documents/:id/preview ────────────────────
// Preview a document (only verified documents)

router.get("/documents/:id/preview", requireAuth, async (req, res) => {
  try {
    const [doc] = await db
      .select()
      .from(documents)
      .where(eq(documents.id, req.params.id));

    if (!doc) {
      return res.status(404).json({ error: "Document not found" });
    }

    if (doc.status !== "verified") {
      return res.status(403).json({ error: "Can only preview verified documents" });
    }

    // Verify parent has access (tutor applied to their vacancy)
    const myVacancies = await db
      .select({ id: vacancies.id })
      .from(vacancies)
      .where(eq(vacancies.parentId, req.user!.userId));

    const vacancyIds = myVacancies.map((v) => v.id);

    const hasApplied = await db
      .select()
      .from(applications)
      .where(eq(applications.tutorId, doc.tutorId));

    const appliedToUs = hasApplied.some((a) => vacancyIds.includes(a.vacancyId));

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

// ─── GET /api/parent/documents/:id/download ───────────────────
// Download a document (only verified documents)

router.get("/documents/:id/download", requireAuth, async (req, res) => {
  try {
    const [doc] = await db
      .select()
      .from(documents)
      .where(eq(documents.id, req.params.id));

    if (!doc) {
      return res.status(404).json({ error: "Document not found" });
    }

    if (doc.status !== "verified") {
      return res.status(403).json({ error: "Can only download verified documents" });
    }

    // Verify parent has access
    const myVacancies = await db
      .select({ id: vacancies.id })
      .from(vacancies)
      .where(eq(vacancies.parentId, req.user!.userId));

    const vacancyIds = myVacancies.map((v) => v.id);

    const hasApplied = await db
      .select()
      .from(applications)
      .where(eq(applications.tutorId, doc.tutorId));

    const appliedToUs = hasApplied.some((a) => vacancyIds.includes(a.vacancyId));

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
