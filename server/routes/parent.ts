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

export default router;
