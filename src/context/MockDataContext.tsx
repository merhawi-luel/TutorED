import { createContext, useContext, useState, useMemo, type ReactNode } from "react";
import { useAuth } from "@/context/AuthContext";
import type {
  User,
  TutorProfile,
  Document,
  Vacancy,
  Application,
  VerificationRequest,
  Organization,
  DocumentStatus,
  VerificationRequestStatus,
  VacancyStatus,
  ApplicationStatus,
} from "@/types";

// ─── Mock Tutor Profiles ───────────────────────────────────────

const MOCK_TUTOR_PROFILES: TutorProfile[] = [
  { userId: "u1", headline: "Mathematics Tutor", bio: "Passionate mathematics tutor with 4 years of experience helping students from Grade 9 to Grade 12 succeed.", subjects: ["Mathematics", "Physics"], grades: ["Grade 9", "Grade 10", "Grade 11", "Grade 12"], experience: 4, education: "BSc Mathematics", location: "Addis Ababa", teachingMode: "hybrid", availability: "Monday - Saturday", rating: 4.9, applicationCount: 12, verificationLevel: "partial" },
  { userId: "u2", headline: "English Language Instructor", bio: "Certified English instructor with TESOL qualification. 6 years teaching IELTS and general English.", subjects: ["English"], grades: ["Grade 11", "Grade 12"], experience: 6, education: "BA English, TESOL Certified", location: "Addis Ababa", teachingMode: "online", availability: "Flexible", rating: 4.7, applicationCount: 8, verificationLevel: "verified" },
  { userId: "u3", headline: "Physics & Science Tutor", bio: "Physics graduate with a love for making complex concepts accessible. 2 years tutoring experience.", subjects: ["Physics", "Science"], grades: ["Grade 10", "Grade 11", "Grade 12"], experience: 2, education: "BSc Physics", location: "Addis Ababa", teachingMode: "in-person", availability: "Weekends", rating: 4.5, applicationCount: 5, verificationLevel: "partial" },
  { userId: "u4", headline: "Primary School Teacher", bio: "Creative and patient educator specializing in primary education. 3 years of classroom experience.", subjects: ["Science", "Mathematics"], grades: ["Grade 5", "Grade 6", "Grade 7", "Grade 8"], experience: 3, education: "Diploma in Education", location: "Addis Ababa", teachingMode: "in-person", availability: "Monday - Friday", rating: 4.8, applicationCount: 6, verificationLevel: "verified" },
  { userId: "u5", headline: "Computer Science Tutor", bio: "Software developer and coding tutor. Teaching kids and teens the fundamentals of programming.", subjects: ["Computer Science"], grades: ["Grade 5", "Grade 6", "Grade 7", "Grade 8", "Grade 9"], experience: 2, education: "BSc Computer Science", location: "Addis Ababa", teachingMode: "in-person", availability: "Saturdays", rating: 4.6, applicationCount: 3, verificationLevel: "unverified" },
];

// ─── Mock Documents ────────────────────────────────────────────

const MOCK_ALL_DOCUMENTS: Document[] = [
  { id: "d1", tutorId: "u1", type: "government_id", title: "Government ID", fileName: "national_id_scan.pdf", status: "verified", submittedAt: "2026-06-20", reviewedAt: "2026-06-22" },
  { id: "d2", tutorId: "u1", type: "degree_certificate", title: "Degree Certificate", fileName: "bsc_mathematics_degree.pdf", status: "verified", submittedAt: "2026-06-20", reviewedAt: "2026-06-23" },
  { id: "d3", tutorId: "u1", type: "transcript", title: "Academic Transcript", fileName: "transcript_bsc_math.pdf", status: "pending", submittedAt: "2026-08-10" },
  { id: "d4", tutorId: "u1", type: "teaching_certificate", title: "Teaching Certificate", fileName: "teaching_cert.pdf", status: "under_review", submittedAt: "2026-08-12" },
  { id: "d5", tutorId: "u2", type: "government_id", title: "Passport", fileName: "hana_passport.pdf", status: "verified", submittedAt: "2026-07-05", reviewedAt: "2026-07-06" },
  { id: "d6", tutorId: "u2", type: "degree_certificate", title: "BA English", fileName: "hana_ba_english.pdf", status: "verified", submittedAt: "2026-07-05", reviewedAt: "2026-07-07" },
  { id: "d7", tutorId: "u2", type: "teaching_certificate", title: "TESOL Certificate", fileName: "hana_tesol.pdf", status: "verified", submittedAt: "2026-07-05", reviewedAt: "2026-07-08" },
  { id: "d8", tutorId: "u3", type: "government_id", title: "National ID", fileName: "daniel_id.pdf", status: "verified", submittedAt: "2026-07-12", reviewedAt: "2026-07-14" },
  { id: "d9", tutorId: "u3", type: "degree_certificate", title: "BSc Physics", fileName: "daniel_degree.pdf", status: "pending", submittedAt: "2026-08-15" },
  { id: "d10", tutorId: "u3", type: "transcript", title: "Academic Transcript", fileName: "daniel_transcript.pdf", status: "rejected", submittedAt: "2026-08-15", reviewedAt: "2026-08-18", reviewerNote: "Document is blurry and unreadable. Please resubmit a clearer scan." },
  { id: "d11", tutorId: "u4", type: "government_id", title: "ID Card", fileName: "sara_id.pdf", status: "verified", submittedAt: "2026-07-25", reviewedAt: "2026-07-26" },
  { id: "d12", tutorId: "u4", type: "degree_certificate", title: "Diploma in Education", fileName: "sara_diploma.pdf", status: "verified", submittedAt: "2026-07-25", reviewedAt: "2026-07-27" },
  { id: "d13", tutorId: "u4", type: "teaching_certificate", title: "Teaching License", fileName: "sara_license.pdf", status: "verified", submittedAt: "2026-07-25", reviewedAt: "2026-07-28" },
  { id: "d14", tutorId: "u5", type: "government_id", title: "ID Card", fileName: "yonas_id.pdf", status: "pending", submittedAt: "2026-08-14" },
];

// ─── Mock Verification Requests ────────────────────────────────

const MOCK_VERIFICATION_REQUESTS: VerificationRequest[] = [
  { id: "vr1", tutorId: "u1", status: "under_review", requestedAt: "2026-08-10", documents: MOCK_ALL_DOCUMENTS.filter((d) => d.tutorId === "u1") },
  { id: "vr2", tutorId: "u2", status: "approved", requestedAt: "2026-07-05", reviewedAt: "2026-07-08", documents: MOCK_ALL_DOCUMENTS.filter((d) => d.tutorId === "u2") },
  { id: "vr3", tutorId: "u3", status: "under_review", requestedAt: "2026-08-15", documents: MOCK_ALL_DOCUMENTS.filter((d) => d.tutorId === "u3") },
  { id: "vr4", tutorId: "u4", status: "approved", requestedAt: "2026-07-25", reviewedAt: "2026-07-28", documents: MOCK_ALL_DOCUMENTS.filter((d) => d.tutorId === "u4") },
  { id: "vr5", tutorId: "u5", status: "pending", requestedAt: "2026-08-14", documents: MOCK_ALL_DOCUMENTS.filter((d) => d.tutorId === "u5") },
];

// ─── Mock Organizations ────────────────────────────────────────

const MOCK_ORGANIZATIONS: Organization[] = [
  { id: "org1", name: "Bright Futures Academy", description: "Premier tutoring academy for Grades 5-12. We connect students with verified, experienced tutors across mathematics, science, and languages.", location: "Addis Ababa", subjects: ["Mathematics", "Physics", "English"], isVerified: true },
  { id: "org2", name: "EduPath Institute", description: "Comprehensive education services and exam preparation.", location: "Addis Ababa", subjects: ["Physics", "English", "Chemistry"], isVerified: true },
  { id: "org3", name: "Sunrise Learning Centre", description: "Student-centered learning for primary and secondary students.", location: "Addis Ababa", subjects: ["Science", "Mathematics"], isVerified: false },
  { id: "org4", name: "TechKids Education", description: "Teaching coding and robotics to the next generation.", location: "Addis Ababa", subjects: ["Computer Science"], isVerified: true },
];

// ─── Org map for agency users ──────────────────────────────────

const AGENCY_ORG_MAP: Record<string, string> = {
  u7: "org1",
};

// ─── Mock Vacancies ────────────────────────────────────────────

const MOCK_VACANCIES: Vacancy[] = [
  { id: "v1", organizationId: "org1", organizationName: "Bright Futures Academy", title: "Grade 12 Mathematics Tutor", description: "Looking for an experienced mathematics tutor for Grade 12 final exam preparation.", subject: "Mathematics", grade: "Grade 12", requiredEducation: "Bachelor's in Mathematics", requiredExperience: 2, location: "Addis Ababa", teachingMode: "in-person", salary: "$400–$600/mo", availability: "Weekends", deadline: "2026-09-15", status: "open", applicantCount: 8, createdAt: "2026-08-01" },
  { id: "v2", organizationId: "org2", organizationName: "EduPath Institute", title: "Physics Tutor — Grades 10 & 11", description: "Physics tutor comfortable with theoretical and practical concepts.", subject: "Physics", grade: "Grade 10-11", requiredEducation: "BSc in Physics", requiredExperience: 1, location: "Addis Ababa", teachingMode: "hybrid", salary: "$350–$500/mo", availability: "Weekday evenings", deadline: "2026-09-20", status: "open", applicantCount: 5, createdAt: "2026-08-05" },
  { id: "v3", organizationId: "org3", organizationName: "Sunrise Learning Centre", title: "Primary Science Teacher", description: "Engaging science tutor for primary school students.", subject: "Science", grade: "Grade 5-8", requiredEducation: "Diploma in Education", requiredExperience: 1, location: "Addis Ababa", teachingMode: "in-person", salary: "$250–$400/mo", availability: "Monday-Friday", deadline: "2026-09-10", status: "open", applicantCount: 12, createdAt: "2026-07-28" },
  { id: "v4", organizationId: "org4", organizationName: "TechKids Education", title: "Coding & Robotics Tutor", description: "Teach coding fundamentals to children aged 8-14.", subject: "Computer Science", grade: "Grade 5-9", requiredEducation: "CS background", requiredExperience: 2, location: "Addis Ababa", teachingMode: "in-person", salary: "$500–$700/mo", availability: "Saturdays", deadline: "2026-09-25", status: "open", applicantCount: 3, createdAt: "2026-08-10" },
  { id: "v5", organizationId: "org2", organizationName: "EduPath Institute", title: "English Language Instructor", description: "IELTS preparation and general English courses.", subject: "English", grade: "Grade 11-12", requiredEducation: "BA in English or TESOL", requiredExperience: 3, location: "Addis Ababa", teachingMode: "online", salary: "$450–$650/mo", availability: "Flexible", deadline: "2026-09-30", status: "open", applicantCount: 7, createdAt: "2026-08-12" },
  { id: "v6", organizationId: "org1", organizationName: "Bright Futures Academy", title: "Mathematics Tutor — Grades 9 & 10", description: "Patient tutor for foundational mathematics.", subject: "Mathematics", grade: "Grade 9-10", requiredEducation: "Bachelor's degree", requiredExperience: 1, location: "Addis Ababa", teachingMode: "in-person", salary: "$300–$450/mo", availability: "Weekday afternoons", deadline: "2026-09-05", status: "open", applicantCount: 15, createdAt: "2026-07-20" },
  { id: "v7", organizationId: "org1", organizationName: "Bright Futures Academy", title: "Physics Tutor — Grade 12", description: "Experienced physics tutor for Grade 12 university entrance exam preparation.", subject: "Physics", grade: "Grade 12", requiredEducation: "BSc Physics", requiredExperience: 3, location: "Addis Ababa", teachingMode: "hybrid", salary: "$450–$650/mo", availability: "Weekends", deadline: "2026-09-10", status: "closed", applicantCount: 11, createdAt: "2026-07-15" },
];

// ─── Mock Applications ─────────────────────────────────────────

const MOCK_APPLICATIONS: Application[] = [
  { id: "a1", tutorId: "u1", vacancyId: "v1", vacancyTitle: "Grade 12 Mathematics Tutor", organizationName: "Bright Futures Academy", status: "shortlisted", appliedAt: "2026-08-02", updatedAt: "2026-08-05" },
  { id: "a3", tutorId: "u1", vacancyId: "v6", vacancyTitle: "Mathematics Tutor — Grades 9 & 10", organizationName: "Bright Futures Academy", status: "applied", appliedAt: "2026-08-14", updatedAt: "2026-08-14" },
  { id: "a8", tutorId: "u2", vacancyId: "v1", vacancyTitle: "Grade 12 Mathematics Tutor", organizationName: "Bright Futures Academy", status: "applied", appliedAt: "2026-08-03", updatedAt: "2026-08-03" },
  { id: "a9", tutorId: "u3", vacancyId: "v1", vacancyTitle: "Grade 12 Mathematics Tutor", organizationName: "Bright Futures Academy", status: "under_review", appliedAt: "2026-08-04", updatedAt: "2026-08-06" },
  { id: "a10", tutorId: "u4", vacancyId: "v6", vacancyTitle: "Mathematics Tutor — Grades 9 & 10", organizationName: "Bright Futures Academy", status: "shortlisted", appliedAt: "2026-07-30", updatedAt: "2026-08-02" },
  { id: "a11", tutorId: "u3", vacancyId: "v7", vacancyTitle: "Physics Tutor — Grade 12", organizationName: "Bright Futures Academy", status: "accepted", appliedAt: "2026-07-16", updatedAt: "2026-07-28" },
  { id: "a12", tutorId: "u1", vacancyId: "v7", vacancyTitle: "Physics Tutor — Grade 12", organizationName: "Bright Futures Academy", status: "rejected", appliedAt: "2026-07-17", updatedAt: "2026-07-25" },
  { id: "a2", tutorId: "u1", vacancyId: "v2", vacancyTitle: "Physics Tutor — Grades 10 & 11", organizationName: "EduPath Institute", status: "under_review", appliedAt: "2026-08-06", updatedAt: "2026-08-06" },
  { id: "a4", tutorId: "u2", vacancyId: "v5", vacancyTitle: "English Language Instructor", organizationName: "EduPath Institute", status: "shortlisted", appliedAt: "2026-08-03", updatedAt: "2026-08-07" },
  { id: "a5", tutorId: "u3", vacancyId: "v2", vacancyTitle: "Physics Tutor — Grades 10 & 11", organizationName: "EduPath Institute", status: "applied", appliedAt: "2026-08-16", updatedAt: "2026-08-16" },
  { id: "a6", tutorId: "u4", vacancyId: "v3", vacancyTitle: "Primary Science Teacher", organizationName: "Sunrise Learning Centre", status: "accepted", appliedAt: "2026-07-30", updatedAt: "2026-08-10" },
  { id: "a7", tutorId: "u5", vacancyId: "v4", vacancyTitle: "Coding & Robotics Tutor", organizationName: "TechKids Education", status: "applied", appliedAt: "2026-08-14", updatedAt: "2026-08-14" },
];

// ─── Helpers ───────────────────────────────────────────────────

function getUserName(userId: string, users: User[]): string {
  return users.find((u) => u.id === userId)?.name ?? "Unknown";
}

function getUserEmail(userId: string, users: User[]): string {
  return users.find((u) => u.id === userId)?.email ?? "";
}

// ─── Context ───────────────────────────────────────────────────

interface MockDataState {
  // Current user (from auth)
  user: User;
  tutorProfile: TutorProfile | null;
  documents: Document[];
  verificationRequest: VerificationRequest | null;
  vacancies: Vacancy[];
  applications: Application[];

  // Admin data
  allUsers: User[];
  allTutorProfiles: TutorProfile[];
  allDocuments: Document[];
  allVerificationRequests: VerificationRequest[];
  allOrganizations: Organization[];
  getUserName: (userId: string) => string;
  getUserEmail: (userId: string) => string;

  // Agency data
  agencyUser: User;
  agencyOrganization: Organization;
  getAgencyVacancies: () => Vacancy[];
  getVacancyApplicants: (vacancyId: string) => (Application & { tutorName: string; tutorProfile: TutorProfile | null })[];

  // Tutor actions
  updateProfile: (profile: Partial<TutorProfile>) => void;
  addDocument: (doc: Omit<Document, "id" | "status" | "submittedAt">) => void;
  applyToVacancy: (vacancyId: string) => void;
  requestVerification: () => void;

  // Agency actions
  createVacancy: (vacancy: Omit<Vacancy, "id" | "organizationId" | "organizationName" | "status" | "applicantCount" | "createdAt">) => void;
  updateVacancy: (vacancyId: string, updates: Partial<Vacancy>) => void;
  closeVacancy: (vacancyId: string) => void;
  updateApplicationStatus: (applicationId: string, status: ApplicationStatus) => void;
  updateOrganization: (updates: Partial<Organization>) => void;

  // Admin actions
  approveDocument: (documentId: string) => void;
  rejectDocument: (documentId: string, note: string) => void;
  approveVerification: (requestId: string) => void;
  rejectVerification: (requestId: string, reason: string) => void;
}

const MockDataContext = createContext<MockDataState | null>(null);

const GUEST_USER: User = { id: "", name: "Guest", email: "", role: "tutor", createdAt: "" };

export function MockDataProvider({ children }: { children: ReactNode }) {
  const { user: authUser, allUsers } = useAuth();
  const user = authUser ?? GUEST_USER;

  // ── Derived tutor state based on logged-in user ──
  const tutorProfileBase = useMemo(() => {
    return MOCK_TUTOR_PROFILES.find((p) => p.userId === user.id) ?? null;
  }, [user.id]);

  const [tutorProfileOverrides, setTutorProfileOverrides] = useState<Partial<TutorProfile>>({});
  const tutorProfile = useMemo(() => {
    if (!tutorProfileBase) return null;
    return { ...tutorProfileBase, ...tutorProfileOverrides };
  }, [tutorProfileBase, tutorProfileOverrides]);

  const [documents, setDocuments] = useState<Document[]>(() =>
    MOCK_ALL_DOCUMENTS.filter((d) => d.tutorId === user.id)
  );

  const [verificationRequest, setVerificationRequest] = useState<VerificationRequest | null>(() =>
    MOCK_VERIFICATION_REQUESTS.find((vr) => vr.tutorId === user.id) ?? null
  );

  // ── Shared state ──
  const [vacancies, setVacancies] = useState<Vacancy[]>(MOCK_VACANCIES);
  const [applications, setApplications] = useState<Application[]>(MOCK_APPLICATIONS);

  // ── Admin state ──
  const [allTutorProfiles] = useState<TutorProfile[]>(MOCK_TUTOR_PROFILES);
  const [allDocuments, setAllDocuments] = useState<Document[]>(MOCK_ALL_DOCUMENTS);
  const [allVerificationRequests, setAllVerificationRequests] = useState<VerificationRequest[]>(MOCK_VERIFICATION_REQUESTS);
  const [allOrganizations, setAllOrganizations] = useState<Organization[]>(MOCK_ORGANIZATIONS);

  // ── Agency state ──
  const agencyOrgId = AGENCY_ORG_MAP[user.id] ?? "org1";
  const [agencyOrganization, setAgencyOrganization] = useState<Organization>(
    MOCK_ORGANIZATIONS.find((o) => o.id === agencyOrgId) ?? MOCK_ORGANIZATIONS[0]
  );

  // ── Helper wrappers ──
  const _getUserName = (userId: string) => getUserName(userId, allUsers);
  const _getUserEmail = (userId: string) => getUserEmail(userId, allUsers);

  // ── Tutor Actions ──

  const updateProfile = (updates: Partial<TutorProfile>) => {
    setTutorProfileOverrides((prev) => ({ ...prev, ...updates }));
  };

  const addDocument = (doc: Omit<Document, "id" | "status" | "submittedAt">) => {
    const newDoc: Document = { ...doc, id: `d${Date.now()}`, status: "pending", submittedAt: new Date().toISOString().split("T")[0] };
    setDocuments((prev) => [...prev, newDoc]);
    setAllDocuments((prev) => [...prev, newDoc]);
  };

  const applyToVacancy = (vacancyId: string) => {
    const vacancy = vacancies.find((v) => v.id === vacancyId);
    if (!vacancy || applications.some((a) => a.vacancyId === vacancyId && a.tutorId === user.id)) return;
    const newApp: Application = {
      id: `a${Date.now()}`, tutorId: user.id, vacancyId, vacancyTitle: vacancy.title, organizationName: vacancy.organizationName,
      status: "applied", appliedAt: new Date().toISOString().split("T")[0], updatedAt: new Date().toISOString().split("T")[0],
    };
    setApplications((prev) => [...prev, newApp]);
  };

  const requestVerification = () => {
    setVerificationRequest({ id: `vr${Date.now()}`, tutorId: user.id, status: "pending", requestedAt: new Date().toISOString().split("T")[0], documents });
  };

  // ── Agency Actions ──

  const getAgencyVacancies = () => vacancies.filter((v) => v.organizationId === agencyOrganization.id);

  const getVacancyApplicants = (vacancyId: string) => {
    return applications
      .filter((a) => a.vacancyId === vacancyId)
      .map((a) => ({
        ...a,
        tutorName: _getUserName(a.tutorId),
        tutorProfile: allTutorProfiles.find((p) => p.userId === a.tutorId) ?? null,
      }));
  };

  const createVacancy = (data: Omit<Vacancy, "id" | "organizationId" | "organizationName" | "status" | "applicantCount" | "createdAt">) => {
    const newVacancy: Vacancy = {
      ...data, id: `v${Date.now()}`, organizationId: agencyOrganization.id, organizationName: agencyOrganization.name,
      status: "open", applicantCount: 0, createdAt: new Date().toISOString().split("T")[0],
    };
    setVacancies((prev) => [newVacancy, ...prev]);
  };

  const updateVacancy = (vacancyId: string, updates: Partial<Vacancy>) => {
    setVacancies((prev) => prev.map((v) => (v.id === vacancyId ? { ...v, ...updates } : v)));
  };

  const closeVacancy = (vacancyId: string) => {
    setVacancies((prev) => prev.map((v) => (v.id === vacancyId ? { ...v, status: "closed" as VacancyStatus } : v)));
  };

  const updateApplicationStatus = (applicationId: string, status: ApplicationStatus) => {
    const today = new Date().toISOString().split("T")[0];
    setApplications((prev) => prev.map((a) => (a.id === applicationId ? { ...a, status, updatedAt: today } : a)));
  };

  const updateOrganization = (updates: Partial<Organization>) => {
    setAgencyOrganization((prev) => ({ ...prev, ...updates }));
    setAllOrganizations((prev) => prev.map((o) => (o.id === agencyOrganization.id ? { ...o, ...updates } : o)));
  };

  // ── Admin Actions ──

  const approveDocument = (documentId: string) => {
    const today = new Date().toISOString().split("T")[0];
    const update = (d: Document) => d.id === documentId ? { ...d, status: "verified" as DocumentStatus, reviewedAt: today } : d;
    setAllDocuments((prev) => prev.map(update));
    setDocuments((prev) => prev.map(update));
  };

  const rejectDocument = (documentId: string, note: string) => {
    const today = new Date().toISOString().split("T")[0];
    const update = (d: Document) => d.id === documentId ? { ...d, status: "rejected" as DocumentStatus, reviewedAt: today, reviewerNote: note } : d;
    setAllDocuments((prev) => prev.map(update));
    setDocuments((prev) => prev.map(update));
  };

  const approveVerification = (requestId: string) => {
    const today = new Date().toISOString().split("T")[0];
    setAllVerificationRequests((prev) => prev.map((vr) => vr.id === requestId ? { ...vr, status: "approved" as VerificationRequestStatus, reviewedAt: today } : vr));
  };

  const rejectVerification = (requestId: string, _reason: string) => {
    const today = new Date().toISOString().split("T")[0];
    setAllVerificationRequests((prev) => prev.map((vr) => vr.id === requestId ? { ...vr, status: "rejected" as VerificationRequestStatus, reviewedAt: today } : vr));
  };

  return (
    <MockDataContext.Provider
      value={{
        user, tutorProfile, documents, verificationRequest, vacancies, applications,
        allUsers, allTutorProfiles, allDocuments, allVerificationRequests, allOrganizations,
        getUserName: _getUserName, getUserEmail: _getUserEmail,
        agencyUser: user, agencyOrganization, getAgencyVacancies, getVacancyApplicants,
        updateProfile, addDocument, applyToVacancy, requestVerification,
        createVacancy, updateVacancy, closeVacancy, updateApplicationStatus, updateOrganization,
        approveDocument, rejectDocument, approveVerification, rejectVerification,
      }}
    >
      {children}
    </MockDataContext.Provider>
  );
}

export function useMockData() {
  const ctx = useContext(MockDataContext);
  if (!ctx) throw new Error("useMockData must be used within MockDataProvider");
  return ctx;
}
