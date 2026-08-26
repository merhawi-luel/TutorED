// ─── User & Auth ───────────────────────────────────────────────

export type UserRole = "tutor" | "agency" | "admin";

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatarUrl?: string;
  createdAt: string;
}

// ─── Tutor Profile ─────────────────────────────────────────────

export type VerificationLevel = "unverified" | "partial" | "verified" | "suspended";

export type TeachingMode = "in-person" | "online" | "hybrid";

export interface TutorProfile {
  userId: string;
  headline: string;
  bio: string;
  subjects: string[];
  grades: string[];
  experience: number; // years
  education: string;
  location: string;
  teachingMode: TeachingMode;
  availability: string;
  rating: number;
  applicationCount: number;
  verificationLevel: VerificationLevel;
}

// ─── Documents ─────────────────────────────────────────────────

export type DocumentType =
  | "government_id"
  | "degree_certificate"
  | "diploma"
  | "transcript"
  | "teaching_certificate"
  | "professional_certification"
  | "experience_letter";

export type DocumentStatus = "pending" | "under_review" | "verified" | "rejected" | "expired";

export interface Document {
  id: string;
  tutorId: string;
  type: DocumentType;
  title: string;
  fileName: string;
  status: DocumentStatus;
  submittedAt: string;
  reviewedAt?: string;
  reviewerNote?: string;
}

// ─── Verification ──────────────────────────────────────────────

export type VerificationRequestStatus = "pending" | "under_review" | "approved" | "rejected";

export interface VerificationRequest {
  id: string;
  tutorId: string;
  status: VerificationRequestStatus;
  requestedAt: string;
  reviewedAt?: string;
  documents: Document[];
}

// ─── Organization (Agency) ─────────────────────────────────────

export interface Organization {
  id: string;
  name: string;
  description: string;
  location: string;
  subjects: string[];
  isVerified: boolean;
  logoUrl?: string;
}

// ─── Vacancies ─────────────────────────────────────────────────

export type VacancyStatus = "open" | "closed" | "draft";

export interface Vacancy {
  id: string;
  organizationId: string;
  organizationName: string;
  title: string;
  description: string;
  subject: string;
  grade: string;
  requiredEducation: string;
  requiredExperience: number;
  location: string;
  teachingMode: TeachingMode;
  salary: string;
  availability: string;
  deadline: string;
  status: VacancyStatus;
  applicantCount: number;
  createdAt: string;
}

// ─── Applications ──────────────────────────────────────────────

export type ApplicationStatus =
  | "applied"
  | "under_review"
  | "shortlisted"
  | "interview"
  | "accepted"
  | "rejected"
  | "withdrawn";

export interface Application {
  id: string;
  tutorId: string;
  vacancyId: string;
  vacancyTitle: string;
  organizationName: string;
  status: ApplicationStatus;
  appliedAt: string;
  updatedAt: string;
}
