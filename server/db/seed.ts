import dotenv from "dotenv";
dotenv.config({ override: true });
import bcrypt from "bcryptjs";
import { db, schema } from "./index";
import { eq } from "drizzle-orm";

async function seed() {
  console.log("🌱 Seeding database...");

  // ─── Clear existing data ─────────────────────────────────

  await db.delete(schema.applications);
  await db.delete(schema.vacancies);
  await db.delete(schema.verificationRequests);
  await db.delete(schema.documents);
  await db.delete(schema.tutorProfiles);
  await db.delete(schema.organizationMembers);
  await db.delete(schema.organizations);
  await db.delete(schema.users);

  console.log("  ✓ Cleared existing data");

  // ─── Users ───────────────────────────────────────────────

  const passwordHash = await bcrypt.hash("password123", 10);

  const [tutor1] = await db
    .insert(schema.users)
    .values({ name: "Merhawi Luel", email: "merhawi@example.com", passwordHash, role: "tutor" })
    .returning({ id: schema.users.id });

  const [tutor2] = await db
    .insert(schema.users)
    .values({ name: "Hana Tesfaye", email: "hana@example.com", passwordHash, role: "tutor" })
    .returning({ id: schema.users.id });

  const [tutor3] = await db
    .insert(schema.users)
    .values({ name: "Daniel Mekonnen", email: "daniel@example.com", passwordHash, role: "tutor" })
    .returning({ id: schema.users.id });

  const [tutor4] = await db
    .insert(schema.users)
    .values({ name: "Sara Abebe", email: "sara@example.com", passwordHash, role: "tutor" })
    .returning({ id: schema.users.id });

  const [tutor5] = await db
    .insert(schema.users)
    .values({ name: "Yonas Tekle", email: "yonas@example.com", passwordHash, role: "tutor" })
    .returning({ id: schema.users.id });

  const [agencyUser] = await db
    .insert(schema.users)
    .values({ name: "Bright Futures Admin", email: "admin@brightfutures.com", passwordHash, role: "agency" })
    .returning({ id: schema.users.id });

  const [adminUser] = await db
    .insert(schema.users)
    .values({ name: "Admin User", email: "admin@eduverify.com", passwordHash, role: "admin" })
    .returning({ id: schema.users.id });

  console.log("  ✓ Created users (5 tutors, 1 agency, 1 admin)");

  // ─── Tutor Profiles ──────────────────────────────────────

  await db.insert(schema.tutorProfiles).values([
    {
      userId: tutor1.id,
      headline: "Mathematics Tutor",
      bio: "Passionate mathematics tutor with 4 years of experience helping students from Grade 9 to Grade 12 succeed.",
      subjects: ["Mathematics", "Physics"],
      grades: ["Grade 9", "Grade 10", "Grade 11", "Grade 12"],
      experience: 4,
      education: "BSc Mathematics",
      location: "Addis Ababa",
      teachingMode: "hybrid",
      availability: "Monday - Saturday",
      rating: "4.9",
      applicationCount: 12,
      verificationLevel: "unverified",
    },
    {
      userId: tutor2.id,
      headline: "English Language Instructor",
      bio: "Certified English instructor with TESOL qualification. 6 years teaching IELTS and general English.",
      subjects: ["English"],
      grades: ["Grade 11", "Grade 12"],
      experience: 6,
      education: "BA English, TESOL Certified",
      location: "Addis Ababa",
      teachingMode: "online",
      availability: "Flexible",
      rating: "4.7",
      applicationCount: 8,
      verificationLevel: "unverified",
    },
    {
      userId: tutor3.id,
      headline: "Physics & Science Tutor",
      bio: "Physics graduate with a love for making complex concepts accessible. 2 years tutoring experience.",
      subjects: ["Physics", "Science"],
      grades: ["Grade 10", "Grade 11", "Grade 12"],
      experience: 2,
      education: "BSc Physics",
      location: "Addis Ababa",
      teachingMode: "in-person",
      availability: "Weekends",
      rating: "4.5",
      applicationCount: 5,
      verificationLevel: "unverified",
    },
    {
      userId: tutor4.id,
      headline: "Primary School Teacher",
      bio: "Creative and patient educator specializing in primary education. 3 years of classroom experience.",
      subjects: ["Science", "Mathematics"],
      grades: ["Grade 5", "Grade 6", "Grade 7", "Grade 8"],
      experience: 3,
      education: "Diploma in Education",
      location: "Addis Ababa",
      teachingMode: "in-person",
      availability: "Monday - Friday",
      rating: "4.8",
      applicationCount: 6,
      verificationLevel: "unverified",
    },
    {
      userId: tutor5.id,
      headline: "Computer Science Tutor",
      bio: "Software developer and coding tutor. Teaching kids and teens the fundamentals of programming.",
      subjects: ["Computer Science"],
      grades: ["Grade 5", "Grade 6", "Grade 7", "Grade 8", "Grade 9"],
      experience: 2,
      education: "BSc Computer Science",
      location: "Addis Ababa",
      teachingMode: "in-person",
      availability: "Saturdays",
      rating: "4.6",
      applicationCount: 3,
      verificationLevel: "unverified",
    },
  ]);

  console.log("  ✓ Created tutor profiles");

  // ─── Organizations ───────────────────────────────────────

  const [org1] = await db
    .insert(schema.organizations)
    .values({
      name: "Bright Futures Academy",
      description: "Premier tutoring academy for Grades 5-12. We connect students with verified, experienced tutors across mathematics, science, and languages.",
      location: "Addis Ababa",
      subjects: ["Mathematics", "Physics", "English"],
      isVerified: true,
      ownerUserId: agencyUser.id,
    })
    .returning({ id: schema.organizations.id });

  const [org2] = await db
    .insert(schema.organizations)
    .values({
      name: "EduPath Institute",
      description: "Comprehensive education services and exam preparation.",
      location: "Addis Ababa",
      subjects: ["Physics", "English", "Chemistry"],
      isVerified: true,
    })
    .returning({ id: schema.organizations.id });

  const [org3] = await db
    .insert(schema.organizations)
    .values({
      name: "Sunrise Learning Centre",
      description: "Student-centered learning for primary and secondary students.",
      location: "Addis Ababa",
      subjects: ["Science", "Mathematics"],
      isVerified: false,
    })
    .returning({ id: schema.organizations.id });

  const [org4] = await db
    .insert(schema.organizations)
    .values({
      name: "TechKids Education",
      description: "Teaching coding and robotics to the next generation.",
      location: "Addis Ababa",
      subjects: ["Computer Science"],
      isVerified: true,
    })
    .returning({ id: schema.organizations.id });

  console.log("  ✓ Created 4 organizations");

  // ─── Vacancies ───────────────────────────────────────────

  const [v1] = await db
    .insert(schema.vacancies)
    .values({
      organizationId: org1.id,
      title: "Grade 12 Mathematics Tutor",
      description: "Looking for an experienced mathematics tutor for Grade 12 final exam preparation.",
      subject: "Mathematics",
      grade: "Grade 12",
      requiredEducation: "Bachelor's in Mathematics",
      requiredExperience: 2,
      location: "Addis Ababa",
      teachingMode: "in-person",
      salary: "$400–$600/mo",
      availability: "Weekends",
      deadline: "2026-09-15",
      status: "open",
      applicantCount: 8,
    })
    .returning({ id: schema.vacancies.id });

  const [v2] = await db
    .insert(schema.vacancies)
    .values({
      organizationId: org2.id,
      title: "Physics Tutor — Grades 10 & 11",
      description: "Physics tutor comfortable with theoretical and practical concepts.",
      subject: "Physics",
      grade: "Grade 10-11",
      requiredEducation: "BSc in Physics",
      requiredExperience: 1,
      location: "Addis Ababa",
      teachingMode: "hybrid",
      salary: "$350–$500/mo",
      availability: "Weekday evenings",
      deadline: "2026-09-20",
      status: "open",
      applicantCount: 5,
    })
    .returning({ id: schema.vacancies.id });

  const [v3] = await db
    .insert(schema.vacancies)
    .values({
      organizationId: org3.id,
      title: "Primary Science Teacher",
      description: "Engaging science tutor for primary school students.",
      subject: "Science",
      grade: "Grade 5-8",
      requiredEducation: "Diploma in Education",
      requiredExperience: 1,
      location: "Addis Ababa",
      teachingMode: "in-person",
      salary: "$250–$400/mo",
      availability: "Monday-Friday",
      deadline: "2026-09-10",
      status: "open",
      applicantCount: 12,
    })
    .returning({ id: schema.vacancies.id });

  const [v4] = await db
    .insert(schema.vacancies)
    .values({
      organizationId: org4.id,
      title: "Coding & Robotics Tutor",
      description: "Teach coding fundamentals to children aged 8-14.",
      subject: "Computer Science",
      grade: "Grade 5-9",
      requiredEducation: "CS background",
      requiredExperience: 2,
      location: "Addis Ababa",
      teachingMode: "in-person",
      salary: "$500–$700/mo",
      availability: "Saturdays",
      deadline: "2026-09-25",
      status: "open",
      applicantCount: 3,
    })
    .returning({ id: schema.vacancies.id });

  const [v5] = await db
    .insert(schema.vacancies)
    .values({
      organizationId: org2.id,
      title: "English Language Instructor",
      description: "IELTS preparation and general English courses.",
      subject: "English",
      grade: "Grade 11-12",
      requiredEducation: "BA in English or TESOL",
      requiredExperience: 3,
      location: "Addis Ababa",
      teachingMode: "online",
      salary: "$450–$650/mo",
      availability: "Flexible",
      deadline: "2026-09-30",
      status: "open",
      applicantCount: 7,
    })
    .returning({ id: schema.vacancies.id });

  const [v6] = await db
    .insert(schema.vacancies)
    .values({
      organizationId: org1.id,
      title: "Mathematics Tutor — Grades 9 & 10",
      description: "Patient tutor for foundational mathematics.",
      subject: "Mathematics",
      grade: "Grade 9-10",
      requiredEducation: "Bachelor's degree",
      requiredExperience: 1,
      location: "Addis Ababa",
      teachingMode: "in-person",
      salary: "$300–$450/mo",
      availability: "Weekday afternoons",
      deadline: "2026-09-05",
      status: "open",
      applicantCount: 15,
    })
    .returning({ id: schema.vacancies.id });

  const [v7] = await db
    .insert(schema.vacancies)
    .values({
      organizationId: org1.id,
      title: "Physics Tutor — Grade 12",
      description: "Experienced physics tutor for Grade 12 university entrance exam preparation.",
      subject: "Physics",
      grade: "Grade 12",
      requiredEducation: "BSc Physics",
      requiredExperience: 3,
      location: "Addis Ababa",
      teachingMode: "hybrid",
      salary: "$450–$650/mo",
      availability: "Weekends",
      deadline: "2026-09-10",
      status: "closed",
      applicantCount: 11,
    })
    .returning({ id: schema.vacancies.id });

  console.log("  ✓ Created 7 vacancies");

  // ─── Documents & Verification ──────────────────────────────
  // (none — upload real documents through the UI)

  console.log("  ✓ No fake documents or verification requests");

  // ─── Applications ────────────────────────────────────────

  await db.insert(schema.applications).values([
    { tutorId: tutor1.id, vacancyId: v1.id, status: "shortlisted", appliedAt: new Date("2026-08-02"), updatedAt: new Date("2026-08-05") },
    { tutorId: tutor1.id, vacancyId: v6.id, status: "applied", appliedAt: new Date("2026-08-14"), updatedAt: new Date("2026-08-14") },
    { tutorId: tutor1.id, vacancyId: v2.id, status: "under_review", appliedAt: new Date("2026-08-06"), updatedAt: new Date("2026-08-06") },
    { tutorId: tutor1.id, vacancyId: v7.id, status: "rejected", appliedAt: new Date("2026-07-17"), updatedAt: new Date("2026-07-25") },
    { tutorId: tutor2.id, vacancyId: v1.id, status: "applied", appliedAt: new Date("2026-08-03"), updatedAt: new Date("2026-08-03") },
    { tutorId: tutor2.id, vacancyId: v5.id, status: "shortlisted", appliedAt: new Date("2026-08-03"), updatedAt: new Date("2026-08-07") },
    { tutorId: tutor3.id, vacancyId: v1.id, status: "under_review", appliedAt: new Date("2026-08-04"), updatedAt: new Date("2026-08-06") },
    { tutorId: tutor3.id, vacancyId: v2.id, status: "applied", appliedAt: new Date("2026-08-16"), updatedAt: new Date("2026-08-16") },
    { tutorId: tutor3.id, vacancyId: v7.id, status: "accepted", appliedAt: new Date("2026-07-16"), updatedAt: new Date("2026-07-28") },
    { tutorId: tutor4.id, vacancyId: v6.id, status: "shortlisted", appliedAt: new Date("2026-07-30"), updatedAt: new Date("2026-08-02") },
    { tutorId: tutor4.id, vacancyId: v3.id, status: "accepted", appliedAt: new Date("2026-07-30"), updatedAt: new Date("2026-08-10") },
    { tutorId: tutor5.id, vacancyId: v4.id, status: "applied", appliedAt: new Date("2026-08-14"), updatedAt: new Date("2026-08-14") },
  ]);

  console.log("  ✓ Created 12 applications");

  // ─── Done ────────────────────────────────────────────────

  console.log("\n✅ Database seeded successfully!");
  console.log("\n📋 Demo accounts (password: password123):");
  console.log("   Tutor:    merhawi@example.com");
  console.log("   Tutor:    hana@example.com");
  console.log("   Agency:   admin@brightfutures.com");
  console.log("   Admin:    admin@eduverify.com");
  process.exit(0);
}

seed().catch((err) => {
  console.error("❌ Seed error:", err);
  process.exit(1);
});
