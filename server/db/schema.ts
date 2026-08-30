import {
  pgTable,
  uuid,
  text,
  varchar,
  integer,
  decimal,
  boolean,
  timestamp,
  pgEnum,
} from "drizzle-orm/pg-core";

// ─── Enums ───────────────────────────────────────────────────

export const userRoleEnum = pgEnum("user_role", ["tutor", "agency", "admin", "parent"]);

export const verificationLevelEnum = pgEnum("verification_level", [
  "unverified",
  "partial",
  "verified",
  "suspended",
]);

export const teachingModeEnum = pgEnum("teaching_mode", [
  "in-person",
  "online",
  "hybrid",
]);

export const documentTypeEnum = pgEnum("document_type", [
  "government_id",
  "degree_certificate",
  "diploma",
  "transcript",
  "teaching_certificate",
  "professional_certification",
  "experience_letter",
]);

export const documentStatusEnum = pgEnum("document_status", [
  "pending",
  "under_review",
  "verified",
  "rejected",
  "expired",
]);

export const verificationRequestStatusEnum = pgEnum(
  "verification_request_status",
  ["pending", "under_review", "approved", "rejected"]
);

export const vacancyStatusEnum = pgEnum("vacancy_status", [
  "open",
  "closed",
  "draft",
]);

export const paymentStatusEnum = pgEnum("payment_status", [
  "unpaid",
  "pending",
  "paid",
  "refunded",
]);

export const refundStatusEnum = pgEnum("refund_status", [
  "none",
  "pending",
  "refunded",
]);

export const applicationStatusEnum = pgEnum("application_status", [
  "applied",
  "under_review",
  "shortlisted",
  "interview",
  "accepted",
  "rejected",
  "withdrawn",
]);

// ─── Users ───────────────────────────────────────────────────

export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: varchar("name", { length: 255 }).notNull(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  role: userRoleEnum("role").notNull().default("tutor"),
  avatarUrl: text("avatar_url"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ─── Tutor Profiles ──────────────────────────────────────────

export const tutorProfiles = pgTable("tutor_profiles", {
  userId: uuid("user_id")
    .primaryKey()
    .references(() => users.id, { onDelete: "cascade" }),
  headline: varchar("headline", { length: 255 }).default(""),
  bio: text("bio").default(""),
  subjects: text("subjects").array().default([]),
  grades: text("grades").array().default([]),
  experience: integer("experience").default(0),
  education: varchar("education", { length: 255 }).default(""),
  location: varchar("location", { length: 255 }).default(""),
  teachingMode: teachingModeEnum("teaching_mode").default("in-person"),
  availability: varchar("availability", { length: 255 }).default(""),
  rating: decimal("rating", { precision: 2, scale: 1 }).default("0.0"),
  applicationCount: integer("application_count").default(0),
  verificationLevel: verificationLevelEnum("verification_level")
    .default("unverified")
    .notNull(),
});

// ─── Parent Profiles ───────────────────────────────────────

export const parentProfiles = pgTable("parent_profiles", {
  userId: uuid("user_id")
    .primaryKey()
    .references(() => users.id, { onDelete: "cascade" }),
  phone: varchar("phone", { length: 50 }).default(""),
  childrenGrades: text("children_grades").array().default([]),
  preferredSubjects: text("preferred_subjects").array().default([]),
  location: varchar("location", { length: 255 }).default(""),
  notes: text("notes").default(""),
});

// ─── Organizations ───────────────────────────────────────────

export const organizations = pgTable("organizations", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description").default(""),
  location: varchar("location", { length: 255 }).default(""),
  subjects: text("subjects").array().default([]),
  isVerified: boolean("is_verified").default(false).notNull(),
  logoUrl: text("logo_url"),
  ownerUserId: uuid("owner_user_id")
    .references(() => users.id, { onDelete: "set null" }),
  paymentStatus: paymentStatusEnum("payment_status").default("unpaid").notNull(),
  chapaTxRef: text("chapa_tx_ref"),
  paidAt: timestamp("paid_at"),
  refundStatus: refundStatusEnum("refund_status").default("none").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ─── Documents ───────────────────────────────────────────────

export const documents = pgTable("documents", {
  id: uuid("id").primaryKey().defaultRandom(),
  tutorId: uuid("tutor_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  type: documentTypeEnum("type").notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  fileName: varchar("file_name", { length: 255 }).notNull(),
  fileKey: text("file_key"), // R2/Supabase Storage key
  status: documentStatusEnum("status").default("pending").notNull(),
  submittedAt: timestamp("submitted_at").defaultNow().notNull(),
  reviewedAt: timestamp("reviewed_at"),
  reviewerNote: text("reviewer_note"),
});

// ─── Verification Requests ───────────────────────────────────

export const verificationRequests = pgTable("verification_requests", {
  id: uuid("id").primaryKey().defaultRandom(),
  tutorId: uuid("tutor_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  status: verificationRequestStatusEnum("status")
    .default("pending")
    .notNull(),
  requestedAt: timestamp("requested_at").defaultNow().notNull(),
  reviewedAt: timestamp("reviewed_at"),
});

// ─── Vacancies ───────────────────────────────────────────────

export const vacancies = pgTable("vacancies", {
  id: uuid("id").primaryKey().defaultRandom(),
  organizationId: uuid("organization_id")
    .references(() => organizations.id, { onDelete: "set null" }),
  parentId: uuid("parent_id")
    .references(() => users.id, { onDelete: "set null" }),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description").default(""),
  subject: varchar("subject", { length: 255 }).notNull(),
  grade: varchar("grade", { length: 100 }).notNull(),
  requiredEducation: varchar("required_education", { length: 255 }).default(""),
  requiredExperience: integer("required_experience").default(0),
  location: varchar("location", { length: 255 }).default(""),
  teachingMode: teachingModeEnum("teaching_mode").default("in-person"),
  salary: varchar("salary", { length: 100 }).default(""),
  availability: varchar("availability", { length: 255 }).default(""),
  deadline: varchar("deadline", { length: 50 }).default(""),
  status: vacancyStatusEnum("status").default("open").notNull(),
  applicantCount: integer("applicant_count").default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ─── Applications ────────────────────────────────────────────

export const applications = pgTable("applications", {
  id: uuid("id").primaryKey().defaultRandom(),
  tutorId: uuid("tutor_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  vacancyId: uuid("vacancy_id")
    .notNull()
    .references(() => vacancies.id, { onDelete: "cascade" }),
  status: applicationStatusEnum("status").default("applied").notNull(),
  appliedAt: timestamp("applied_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// ─── Recruitment Requests (Parent → Agency) ─────────────────

export const recruitmentRequests = pgTable("recruitment_requests", {
  id: uuid("id").primaryKey().defaultRandom(),
  parentId: uuid("parent_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  organizationId: uuid("organization_id")
    .references(() => organizations.id, { onDelete: "set null" }),
  parentName: varchar("parent_name", { length: 255 }).default(""),
  parentEmail: varchar("parent_email", { length: 255 }).default(""),
  parentPhone: varchar("parent_phone", { length: 50 }).default(""),
  subject: varchar("subject", { length: 255 }).notNull(),
  grade: varchar("grade", { length: 100 }).notNull(),
  location: varchar("location", { length: 255 }).default(""),
  notes: text("notes").default(""),
  status: varchar("status", { length: 50 }).default("pending").notNull(), // pending, contacted, accepted, completed
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ─── Organization Members ────────────────────────────────────

export const organizationMembers = pgTable("organization_members", {
  orgId: uuid("org_id")
    .notNull()
    .references(() => organizations.id, { onDelete: "cascade" }),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  role: varchar("role", { length: 50 }).default("recruiter").notNull(),
});
