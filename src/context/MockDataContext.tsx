import { createContext, useContext, useState, type ReactNode } from "react";
import type {
  User,
  TutorProfile,
  Document,
  Vacancy,
  Application,
  VerificationRequest,
} from "@/types";

// ─── Mock Data ─────────────────────────────────────────────────

const MOCK_USER: User = {
  id: "u1",
  name: "Merhawi Luel",
  email: "merhawi@example.com",
  role: "tutor",
  createdAt: "2026-06-15",
};

const MOCK_TUTOR_PROFILE: TutorProfile = {
  userId: "u1",
  headline: "Mathematics Tutor",
  bio: "Passionate mathematics tutor with 4 years of experience helping students from Grade 9 to Grade 12 succeed. Specializing in algebra, calculus, and exam preparation.",
  subjects: ["Mathematics", "Physics"],
  grades: ["Grade 9", "Grade 10", "Grade 11", "Grade 12"],
  experience: 4,
  education: "BSc Mathematics",
  location: "Addis Ababa",
  teachingMode: "hybrid",
  availability: "Monday - Saturday",
  rating: 4.9,
  applicationCount: 12,
  verificationLevel: "partial",
};

const MOCK_DOCUMENTS: Document[] = [
  {
    id: "d1",
    tutorId: "u1",
    type: "government_id",
    title: "Government ID",
    fileName: "national_id_scan.pdf",
    status: "verified",
    submittedAt: "2026-06-20",
    reviewedAt: "2026-06-22",
  },
  {
    id: "d2",
    tutorId: "u1",
    type: "degree_certificate",
    title: "Degree Certificate",
    fileName: "bsc_mathematics_degree.pdf",
    status: "verified",
    submittedAt: "2026-06-20",
    reviewedAt: "2026-06-23",
  },
  {
    id: "d3",
    tutorId: "u1",
    type: "transcript",
    title: "Academic Transcript",
    fileName: "transcript_bsc_math.pdf",
    status: "pending",
    submittedAt: "2026-08-10",
  },
  {
    id: "d4",
    tutorId: "u1",
    type: "teaching_certificate",
    title: "Teaching Certificate",
    fileName: "teaching_cert.pdf",
    status: "under_review",
    submittedAt: "2026-08-12",
  },
];

const MOCK_VERIFICATION_REQUEST: VerificationRequest = {
  id: "vr1",
  tutorId: "u1",
  status: "under_review",
  requestedAt: "2026-08-10",
  documents: MOCK_DOCUMENTS,
};

const MOCK_VACANCIES: Vacancy[] = [
  {
    id: "v1",
    organizationId: "org1",
    organizationName: "Bright Futures Academy",
    title: "Grade 12 Mathematics Tutor",
    description: "Looking for an experienced mathematics tutor to prepare Grade 12 students for their final examinations. Must have strong knowledge of calculus and statistics.",
    subject: "Mathematics",
    grade: "Grade 12",
    requiredEducation: "Bachelor's degree in Mathematics or related field",
    requiredExperience: 2,
    location: "Addis Ababa",
    teachingMode: "in-person",
    salary: "$400–$600/mo",
    availability: "Weekends",
    deadline: "2026-09-15",
    status: "open",
    applicantCount: 8,
    createdAt: "2026-08-01",
  },
  {
    id: "v2",
    organizationId: "org2",
    organizationName: "EduPath Institute",
    title: "Physics Tutor — Grades 10 & 11",
    description: "Join our team of dedicated educators. We need a physics tutor comfortable with both theoretical and practical concepts.",
    subject: "Physics",
    grade: "Grade 10-11",
    requiredEducation: "BSc in Physics or Engineering",
    requiredExperience: 1,
    location: "Addis Ababa",
    teachingMode: "hybrid",
    salary: "$350–$500/mo",
    availability: "Weekday evenings",
    deadline: "2026-09-20",
    status: "open",
    applicantCount: 5,
    createdAt: "2026-08-05",
  },
  {
    id: "v3",
    organizationId: "org3",
    organizationName: "Sunrise Learning Centre",
    title: "Primary Science Teacher",
    description: "Engaging science tutor needed for primary school students. Must be patient and creative with teaching methods.",
    subject: "Science",
    grade: "Grade 5-8",
    requiredEducation: "Diploma or Degree in Education",
    requiredExperience: 1,
    location: "Addis Ababa",
    teachingMode: "in-person",
    salary: "$250–$400/mo",
    availability: "Monday-Friday",
    deadline: "2026-09-10",
    status: "open",
    applicantCount: 12,
    createdAt: "2026-07-28",
  },
  {
    id: "v4",
    organizationId: "org4",
    organizationName: "TechKids Education",
    title: "Coding & Robotics Tutor",
    description: "Teach children aged 8-14 the fundamentals of coding and robotics. Experience with Scratch, Python, or Arduino preferred.",
    subject: "Computer Science",
    grade: "Grade 5-9",
    requiredEducation: "Background in Computer Science or related field",
    requiredExperience: 2,
    location: "Addis Ababa",
    teachingMode: "in-person",
    salary: "$500–$700/mo",
    availability: "Saturdays",
    deadline: "2026-09-25",
    status: "open",
    applicantCount: 3,
    createdAt: "2026-08-10",
  },
  {
    id: "v5",
    organizationId: "org2",
    organizationName: "EduPath Institute",
    title: "English Language Instructor",
    description: "Looking for a certified English language instructor for IELTS preparation and general English courses.",
    subject: "English",
    grade: "Grade 11-12",
    requiredEducation: "BA in English or TESOL certification",
    requiredExperience: 3,
    location: "Addis Ababa",
    teachingMode: "online",
    salary: "$450–$650/mo",
    availability: "Flexible",
    deadline: "2026-09-30",
    status: "open",
    applicantCount: 7,
    createdAt: "2026-08-12",
  },
  {
    id: "v6",
    organizationId: "org1",
    organizationName: "Bright Futures Academy",
    title: "Mathematics Tutor — Grades 9 & 10",
    description: "Patient tutor needed for foundational mathematics. Help students build confidence in algebra and geometry.",
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
    createdAt: "2026-07-20",
  },
];

const MOCK_APPLICATIONS: Application[] = [
  {
    id: "a1",
    tutorId: "u1",
    vacancyId: "v1",
    vacancyTitle: "Grade 12 Mathematics Tutor",
    organizationName: "Bright Futures Academy",
    status: "shortlisted",
    appliedAt: "2026-08-02",
    updatedAt: "2026-08-05",
  },
  {
    id: "a2",
    tutorId: "u1",
    vacancyId: "v2",
    vacancyTitle: "Physics Tutor — Grades 10 & 11",
    organizationName: "EduPath Institute",
    status: "under_review",
    appliedAt: "2026-08-06",
    updatedAt: "2026-08-06",
  },
  {
    id: "a3",
    tutorId: "u1",
    vacancyId: "v6",
    vacancyTitle: "Mathematics Tutor — Grades 9 & 10",
    organizationName: "Bright Futures Academy",
    status: "applied",
    appliedAt: "2026-08-14",
    updatedAt: "2026-08-14",
  },
];

// ─── Context ───────────────────────────────────────────────────

interface MockDataState {
  user: User;
  tutorProfile: TutorProfile | null;
  documents: Document[];
  verificationRequest: VerificationRequest | null;
  vacancies: Vacancy[];
  applications: Application[];
  // Actions
  updateProfile: (profile: Partial<TutorProfile>) => void;
  addDocument: (doc: Omit<Document, "id" | "status" | "submittedAt">) => void;
  applyToVacancy: (vacancyId: string) => void;
  requestVerification: () => void;
}

const MockDataContext = createContext<MockDataState | null>(null);

export function MockDataProvider({ children }: { children: ReactNode }) {
  const [user] = useState<User>(MOCK_USER);
  const [tutorProfile, setTutorProfile] = useState<TutorProfile | null>(MOCK_TUTOR_PROFILE);
  const [documents, setDocuments] = useState<Document[]>(MOCK_DOCUMENTS);
  const [verificationRequest, setVerificationRequest] = useState<VerificationRequest | null>(
    MOCK_VERIFICATION_REQUEST
  );
  const [vacancies] = useState<Vacancy[]>(MOCK_VACANCIES);
  const [applications, setApplications] = useState<Application[]>(MOCK_APPLICATIONS);

  const updateProfile = (updates: Partial<TutorProfile>) => {
    setTutorProfile((prev) => (prev ? { ...prev, ...updates } : null));
  };

  const addDocument = (doc: Omit<Document, "id" | "status" | "submittedAt">) => {
    const newDoc: Document = {
      ...doc,
      id: `d${Date.now()}`,
      status: "pending",
      submittedAt: new Date().toISOString().split("T")[0],
    };
    setDocuments((prev) => [...prev, newDoc]);
  };

  const applyToVacancy = (vacancyId: string) => {
    const vacancy = vacancies.find((v) => v.id === vacancyId);
    if (!vacancy) return;
    const alreadyApplied = applications.some((a) => a.vacancyId === vacancyId);
    if (alreadyApplied) return;

    const newApp: Application = {
      id: `a${Date.now()}`,
      tutorId: user.id,
      vacancyId,
      vacancyTitle: vacancy.title,
      organizationName: vacancy.organizationName,
      status: "applied",
      appliedAt: new Date().toISOString().split("T")[0],
      updatedAt: new Date().toISOString().split("T")[0],
    };
    setApplications((prev) => [...prev, newApp]);
  };

  const requestVerification = () => {
    setVerificationRequest({
      id: `vr${Date.now()}`,
      tutorId: user.id,
      status: "pending",
      requestedAt: new Date().toISOString().split("T")[0],
      documents,
    });
  };

  return (
    <MockDataContext.Provider
      value={{
        user,
        tutorProfile,
        documents,
        verificationRequest,
        vacancies,
        applications,
        updateProfile,
        addDocument,
        applyToVacancy,
        requestVerification,
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
