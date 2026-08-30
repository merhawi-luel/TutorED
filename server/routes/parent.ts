import { Router } from "express";
import { db } from "../db";
import { parentProfiles, vacancies, organizations, recruitmentRequests, users } from "../db/schema";
import { requireAuth } from "../middleware/auth";
import { eq, and, desc } from "drizzle-orm";

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
      .select({
        id: vacancies.id,
        title: vacancies.title,
        description: vacancies.description,
        subject: vacancies.subject,
        grade: vacancies.grade,
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
        organizationId: vacancies.organizationId,
        parentId: vacancies.parentId,
        organizationName: organizations.name,
        parentName: users.name,
      })
      .from(vacancies)
      .leftJoin(organizations, eq(vacancies.organizationId, organizations.id))
      .leftJoin(users, eq(vacancies.parentId, users.id))
      .where(eq(vacancies.status, "open"))
      .orderBy(desc(vacancies.createdAt));

    // Resolve organizationName: use org name if present, else parent name
    const resolved = openVacancies.map((v) => ({
      ...v,
      organizationName: v.organizationName || v.parentName || "Unknown",
    }));

    res.json(resolved);
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
// Close a vacancy owned by this parent

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

    const [updated] = await db
      .update(vacancies)
      .set({ status: "closed" })
      .where(eq(vacancies.id, req.params.id))
      .returning();

    res.json(updated);
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
        organizationName: organizations.name,
      })
      .from(recruitmentRequests)
      .leftJoin(organizations, eq(recruitmentRequests.organizationId, organizations.id))
      .where(eq(recruitmentRequests.parentId, req.user!.userId))
      .orderBy(desc(recruitmentRequests.createdAt));

    res.json(myRequests);
  } catch (error) {
    console.error("Get parent requests error:", error);
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

export default router;
