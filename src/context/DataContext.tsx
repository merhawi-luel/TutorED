import { createContext, useContext, useState, useEffect, useCallback, useMemo, type ReactNode } from "react";
import { useAuth } from "@/context/AuthContext";
import {
  tutorApi,
  applicationsApi,
  agencyApi,
  adminApi,
  parentApi,
} from "@/lib/api";
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

// ─── Context ───────────────────────────────────────────────────

interface DataState {
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
  removeDocument: (docId: string) => void;
  refetchDocuments: () => Promise<void>;
  applyToVacancy: (vacancyId: string) => void;
  requestVerification: () => void;

  // Agency actions
  createVacancy: (vacancy: Omit<Vacancy, "id" | "organizationId" | "organizationName" | "status" | "applicantCount" | "createdAt">) => void;
  updateVacancy: (vacancyId: string, updates: Partial<Vacancy>) => void;
  closeVacancy: (vacancyId: string) => void;
  updateApplicationStatus: (applicationId: string, status: ApplicationStatus) => void;
  updateOrganization: (updates: Partial<Organization>) => void;
  refetchAgencyData: () => Promise<void>;

  // Admin actions
  approveDocument: (documentId: string) => void;
  rejectDocument: (documentId: string, note: string) => void;
  approveVerification: (requestId: string) => void;
  rejectVerification: (requestId: string, reason: string) => void;

  // Loading states
  loading: boolean;
}

const DataContext = createContext<DataState | null>(null);

const GUEST_USER: User = { id: "", name: "Guest", email: "", role: "tutor", createdAt: "" };

// ─── Helpers ───────────────────────────────────────────────────

function mapDoc(raw: any): Document {
  return {
    id: raw.id,
    tutorId: raw.tutorId || raw.tutor_id,
    type: raw.type,
    title: raw.title,
    fileName: raw.fileName || raw.file_name,
    fileKey: raw.fileKey || raw.file_key || undefined,
    status: raw.status,
    submittedAt: raw.submittedAt || raw.submitted_at,
    reviewedAt: raw.reviewedAt || raw.reviewed_at || undefined,
    reviewerNote: raw.reviewerNote || raw.reviewer_note || undefined,
  };
}

function mapVacancy(raw: any): Vacancy {
  return {
    id: raw.id,
    organizationId: raw.organizationId || raw.organization_id,
    organizationName: raw.organizationName || raw.organization_name || "Unknown",
    title: raw.title,
    description: raw.description || "",
    subject: raw.subject,
    grade: raw.grade,
    requiredEducation: raw.requiredEducation || raw.required_education || "",
    requiredExperience: raw.requiredExperience || raw.required_experience || 0,
    location: raw.location || "",
    teachingMode: raw.teachingMode || raw.teaching_mode || "in-person",
    salary: raw.salary || "",
    availability: raw.availability || "",
    deadline: raw.deadline || "",
    status: raw.status,
    applicantCount: raw.applicantCount || raw.applicant_count || 0,
    createdAt: raw.createdAt || raw.created_at || "",
  };
}

function mapApplication(raw: any): Application {
  return {
    id: raw.id,
    tutorId: raw.tutorId || raw.tutor_id,
    vacancyId: raw.vacancyId || raw.vacancy_id,
    vacancyTitle: raw.vacancyTitle || raw.vacancy_title || "Unknown",
    organizationName: raw.organizationName || raw.organization_name || "Unknown",
    status: raw.status,
    appliedAt: raw.appliedAt || raw.applied_at || "",
    updatedAt: raw.updatedAt || raw.updated_at || "",
  };
}

function mapProfile(raw: any): TutorProfile {
  return {
    userId: raw.userId || raw.user_id,
    headline: raw.headline || "",
    bio: raw.bio || "",
    subjects: raw.subjects || [],
    grades: raw.grades || [],
    experience: raw.experience || 0,
    education: raw.education || "",
    location: raw.location || "",
    teachingMode: raw.teachingMode || raw.teaching_mode || "in-person",
    availability: raw.availability || "",
    rating: parseFloat(raw.rating) || 0,
    applicationCount: raw.applicationCount || raw.application_count || 0,
    verificationLevel: raw.verificationLevel || raw.verification_level || "unverified",
  };
}

function mapOrganization(raw: any): Organization {
  return {
    id: raw.id,
    name: raw.name,
    description: raw.description || "",
    location: raw.location || "",
    subjects: raw.subjects || [],
    isVerified: raw.isVerified || raw.is_verified || false,
    logoUrl: raw.logoUrl || raw.logo_url || undefined,
  };
}

// ─── Provider ──────────────────────────────────────────────────

export function DataProvider({ children }: { children: ReactNode }) {
  const { user: authUser } = useAuth();
  const user = authUser ?? GUEST_USER;

  // ── State ──
  const [tutorProfile, setTutorProfile] = useState<TutorProfile | null>(null);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [verificationRequest, setVerificationRequest] = useState<VerificationRequest | null>(null);
  const [vacancies, setVacancies] = useState<Vacancy[]>([]);
  const [applications, setApplications] = useState<Application[]>([]);

  // Admin state
  const [allTutorProfiles, setAllTutorProfiles] = useState<TutorProfile[]>([]);
  const [allDocuments, setAllDocuments] = useState<Document[]>([]);
  const [allVerificationRequests, setAllVerificationRequests] = useState<VerificationRequest[]>([]);
  const [allOrganizations, setAllOrganizations] = useState<Organization[]>([]);

  // Agency state
  const [agencyOrganization, setAgencyOrganization] = useState<Organization>({
    id: "", name: "My Organization", description: "", location: "", subjects: [], isVerified: false,
  });
  const [agencyApplicants, setAgencyApplicants] = useState<(Application & { tutorName: string; tutorProfile: TutorProfile | null })[]>([]);

  const [loading, setLoading] = useState(true);

  // ── Fetch data based on role ──
  const fetchTutorData = useCallback(async () => {
    try {
      const [profile, docs, verification, allVacancies, myApps] = await Promise.allSettled([
        tutorApi.getProfile(),
        tutorApi.getDocuments(),
        tutorApi.getVerification(),
        tutorApi.getVacancies(),
        applicationsApi.list(),
      ]);

      if (profile.status === "fulfilled") setTutorProfile(mapProfile(profile.value));
      if (docs.status === "fulfilled") setDocuments(docs.value.map(mapDoc));
      if (verification.status === "fulfilled" && verification.value) {
        setVerificationRequest({
          id: verification.value.id,
          tutorId: verification.value.tutorId || verification.value.tutor_id,
          status: verification.value.status,
          requestedAt: verification.value.requestedAt || verification.value.requested_at,
          reviewedAt: verification.value.reviewedAt || verification.value.reviewed_at || undefined,
          documents: docs.status === "fulfilled" ? docs.value.map(mapDoc) : [],
        });
      }
      if (allVacancies.status === "fulfilled") setVacancies(allVacancies.value.map(mapVacancy));
      if (myApps.status === "fulfilled") setApplications(myApps.value.map(mapApplication));
    } catch (err) {
      console.error("Failed to fetch tutor data:", err);
    }
  }, []);

  const fetchAgencyData = useCallback(async () => {
    try {
      const [org, agencyVacancies, applicantsData] = await Promise.allSettled([
        agencyApi.getOrganization(),
        agencyApi.getVacancies(),
        agencyApi.getApplicants(),
      ]);

      if (org.status === "fulfilled") {
        setAgencyOrganization(mapOrganization(org.value));
        
        if (agencyVacancies.status === "fulfilled") {
          setVacancies(agencyVacancies.value.map(mapVacancy));
        }
        if (applicantsData.status === "fulfilled") {
          const mapped = applicantsData.value.map((a: any) => ({
            ...mapApplication(a),
            tutorName: a.tutorName || a.tutor_name || "Unknown",
            tutorProfile: a.tutorProfile ? mapProfile(a.tutorProfile) : null,
          }));
          setAgencyApplicants(mapped);
        }
      } else {
        // 404 or other error - treat as no organization
        console.log("No organization found or error occurred");
        setAgencyOrganization({
          id: "",
          name: "",
          description: "",
          location: "",
          subjects: [],
          isVerified: false,
        });
        setVacancies([]);
      }
    } catch (err) {
      console.error("Failed to fetch agency data:", err);
      // Fallback to empty state
      setAgencyOrganization({
        id: "",
        name: "",
        description: "",
        location: "",
        subjects: [],
        isVerified: false,
      });
      setVacancies([]);
    }
  }, []);

  const fetchAdminData = useCallback(async () => {
    try {
      const [verifications, tutors, agencies] = await Promise.allSettled([
        adminApi.getVerifications(),
        adminApi.getTutors(),
        adminApi.getAgencies(),
      ]);

      if (verifications.status === "fulfilled") {
        const vrData = verifications.value.map((vr: any) => ({
          id: vr.id,
          tutorId: vr.tutorId || vr.tutor_id,
          status: vr.status,
          requestedAt: vr.requestedAt || vr.requested_at,
          reviewedAt: vr.reviewedAt || vr.reviewed_at || undefined,
          tutorName: vr.tutorName || vr.tutor_name || "Unknown",
          documents: (vr.documents || []).map(mapDoc),
        }));
        setAllVerificationRequests(vrData);
        // Also populate allDocuments from verification data
        const allDocs = vrData.flatMap((vr: any) => vr.documents);
        setAllDocuments(allDocs);
      }

      if (tutors.status === "fulfilled") {
        const tutorProfiles = tutors.value
          .filter((t: any) => t.headline !== undefined)
          .map((t: any) => mapProfile(t));
        // Merge into allUsers via setAllTutorProfiles
        setAllTutorProfiles(tutorProfiles);
      }

      if (agencies.status === "fulfilled") {
        setAllOrganizations(agencies.value.map(mapOrganization));
      }
    } catch (err) {
      console.error("Failed to fetch admin data:", err);
    }
  }, []);

  const fetchParentData = useCallback(async () => {
    try {
      const [vacanciesData, agenciesData] = await Promise.allSettled([
        parentApi.getVacancies(),
        parentApi.getAgencies(),
      ]);

      if (vacanciesData.status === "fulfilled") setVacancies(vacanciesData.value.map(mapVacancy));
      if (agenciesData.status === "fulfilled") setAllOrganizations(agenciesData.value.map(mapOrganization));
    } catch (err) {
      console.error("Failed to fetch parent data:", err);
    }
  }, []);

  // ── Initial fetch ──
  useEffect(() => {
    if (!user || user.id === "") {
      setLoading(false);
      return;
    }

    setLoading(true);

    const fetch = async () => {
      switch (user.role) {
        case "tutor":
          await fetchTutorData();
          break;
        case "agency":
          await fetchAgencyData();
          break;
        case "admin":
          await fetchAdminData();
          break;
        case "parent":
          await fetchParentData();
          break;
      }
      setLoading(false);
    };

    fetch();
  }, [user.id, user.role, fetchTutorData, fetchAgencyData, fetchAdminData, fetchParentData]);

  // ── Helpers ──
  const _getUserName = useCallback(
    (userId: string) => {
      // For admin context, use verification request tutor names
      const vr = allVerificationRequests.find((v) => v.tutorId === userId);
      if ((vr as any)?.tutorName) return (vr as any).tutorName;
      return "Unknown";
    },
    [allVerificationRequests]
  );

  const _getUserEmail = useCallback(
    (_userId: string) => {
      return "";
    },
    []
  );

  // ── Tutor Actions ──
  const updateProfile = useCallback(
    async (updates: Partial<TutorProfile>) => {
      setTutorProfile((prev) => (prev ? { ...prev, ...updates } : prev));
      try {
        const updated = await tutorApi.updateProfile(updates);
        setTutorProfile(mapProfile(updated));
      } catch (err) {
        console.error("Failed to update profile:", err);
      }
    },
    []
  );

  const addDocument = useCallback(
    async (doc: Omit<Document, "id" | "status" | "submittedAt">) => {
      // Optimistic update
      const optimistic: Document = {
        ...doc,
        id: `temp-${Date.now()}`,
        status: "pending",
        submittedAt: new Date().toISOString().split("T")[0],
      };
      setDocuments((prev) => [...prev, optimistic]);

      try {
        const created = await tutorApi.createDocument({
          type: doc.type,
          title: doc.title,
          fileName: doc.fileName,
          fileKey: doc.fileKey,
        });
        // Replace optimistic with real data
        setDocuments((prev) =>
          prev.map((d) => (d.id === optimistic.id ? mapDoc(created) : d))
        );
      } catch (err) {
        console.error("Failed to add document:", err);
        // Remove optimistic on failure
        setDocuments((prev) => prev.filter((d) => d.id !== optimistic.id));
      }
    },
    []
  );

  const applyToVacancy = useCallback(
    async (vacancyId: string) => {
      try {
        const result = await applicationsApi.apply(vacancyId);
        const newApp = mapApplication(result);
        setApplications((prev) => [...prev, newApp]);
      } catch (err) {
        console.error("Failed to apply:", err);
      }
    },
    []
  );

  const removeDocument = useCallback(
    async (docId: string) => {
      setDocuments((prev) => prev.filter((d) => d.id !== docId));
      try {
        await tutorApi.deleteDocument(docId);
      } catch (err) {
        console.error("Failed to delete document:", err);
      }
    },
    []
  );

  const refetchDocuments = useCallback(async () => {
    try {
      const docs = await tutorApi.getDocuments();
      setDocuments(docs.map(mapDoc));
    } catch (err) {
      console.error("Failed to refetch documents:", err);
    }
  }, []);

  const requestVerification = useCallback(async () => {
    const result = await tutorApi.requestVerification();
    // Re-fetch documents to get updated statuses
    const docs = await tutorApi.getDocuments();
    const freshDocs = docs.map(mapDoc);
    setDocuments(freshDocs);
    setVerificationRequest({
      id: result.id,
      tutorId: result.tutorId || result.tutor_id,
      status: result.status,
      requestedAt: result.requestedAt || result.requested_at,
      documents: freshDocs,
    });
  }, []);

  // ── Agency Actions ──
  const getAgencyVacancies = useCallback(() => {
    return vacancies.filter((v) => v.organizationId === agencyOrganization.id);
  }, [vacancies, agencyOrganization.id]);

  const getVacancyApplicants = useCallback(
    (vacancyId: string) => {
      return agencyApplicants.filter((a) => a.vacancyId === vacancyId);
    },
    [agencyApplicants]
  );

  const createVacancy = useCallback(
    async (data: Omit<Vacancy, "id" | "organizationId" | "organizationName" | "status" | "applicantCount" | "createdAt">) => {
      try {
        const created = await agencyApi.createVacancy(data);
        const newVacancy = mapVacancy({ ...created, organizationName: agencyOrganization.name });
        setVacancies((prev) => [newVacancy, ...prev]);
      } catch (err) {
        console.error("Failed to create vacancy:", err);
      }
    },
    [agencyOrganization.name]
  );

  const updateVacancy = useCallback(
    async (vacancyId: string, updates: Partial<Vacancy>) => {
      setVacancies((prev) => prev.map((v) => (v.id === vacancyId ? { ...v, ...updates } : v)));
      try {
        await agencyApi.updateVacancy(vacancyId, updates);
      } catch (err) {
        console.error("Failed to update vacancy:", err);
      }
    },
    []
  );

  const closeVacancy = useCallback(
    async (vacancyId: string) => {
      setVacancies((prev) =>
        prev.map((v) => (v.id === vacancyId ? { ...v, status: "closed" as VacancyStatus } : v))
      );
      try {
        await agencyApi.closeVacancy(vacancyId);
      } catch (err) {
        console.error("Failed to close vacancy:", err);
      }
    },
    []
  );

  const updateApplicationStatus = useCallback(
    async (applicationId: string, status: ApplicationStatus) => {
      setApplications((prev) =>
        prev.map((a) =>
          a.id === applicationId
            ? { ...a, status, updatedAt: new Date().toISOString().split("T")[0] }
            : a
        )
      );
      try {
        await agencyApi.updateApplicationStatus(applicationId, status);
      } catch (err) {
        console.error("Failed to update application status:", err);
      }
    },
    []
  );

  const updateOrganization = useCallback(
    async (updates: Partial<Organization>) => {
      setAgencyOrganization((prev) => ({ ...prev, ...updates }));
      try {
        await agencyApi.updateOrganization(updates);
      } catch (err) {
        console.error("Failed to update organization:", err);
      }
    },
    []
  );

  const refetchAgencyData = useCallback(async () => {
    return fetchAgencyData();
  }, [fetchAgencyData]);

  const refreshApplicants = useCallback(async () => {
    try {
      const data = await agencyApi.getApplicants();
      const mapped = data.map((a: any) => ({
        ...mapApplication(a),
        tutorName: a.tutorName || a.tutor_name || "Unknown",
        tutorProfile: a.tutorProfile ? mapProfile(a.tutorProfile) : null,
      }));
      setAgencyApplicants(mapped);
    } catch (err) {
      console.error("Failed to refresh applicants:", err);
    }
  }, []);

  // ── Admin Actions ──
  const approveDocument = useCallback(
    async (documentId: string) => {
      const today = new Date().toISOString().split("T")[0];
      const update = (d: Document) =>
        d.id === documentId ? { ...d, status: "verified" as DocumentStatus, reviewedAt: today } : d;
      setAllDocuments((prev) => prev.map(update));
      setDocuments((prev) => prev.map(update));
      try {
        await adminApi.approveDocument(documentId);
      } catch (err) {
        console.error("Failed to approve document:", err);
      }
    },
    []
  );

  const rejectDocument = useCallback(
    async (documentId: string, note: string) => {
      const today = new Date().toISOString().split("T")[0];
      const update = (d: Document) =>
        d.id === documentId
          ? { ...d, status: "rejected" as DocumentStatus, reviewedAt: today, reviewerNote: note }
          : d;
      setAllDocuments((prev) => prev.map(update));
      setDocuments((prev) => prev.map(update));
      try {
        await adminApi.rejectDocument(documentId, note);
      } catch (err) {
        console.error("Failed to reject document:", err);
      }
    },
    []
  );

  const approveVerification = useCallback(
    async (requestId: string) => {
      const today = new Date().toISOString().split("T")[0];
      setAllVerificationRequests((prev) =>
        prev.map((vr) =>
          vr.id === requestId
            ? { ...vr, status: "approved" as VerificationRequestStatus, reviewedAt: today }
            : vr
        )
      );
      try {
        await adminApi.approveVerification(requestId);
      } catch (err) {
        console.error("Failed to approve verification:", err);
      }
    },
    []
  );

  const rejectVerification = useCallback(
    async (requestId: string, _reason: string) => {
      const today = new Date().toISOString().split("T")[0];
      setAllVerificationRequests((prev) =>
        prev.map((vr) =>
          vr.id === requestId
            ? { ...vr, status: "rejected" as VerificationRequestStatus, reviewedAt: today }
            : vr
        )
      );
      try {
        await adminApi.rejectVerification(requestId);
      } catch (err) {
        console.error("Failed to reject verification:", err);
      }
    },
    []
  );

  // ── Value ──
  const value = useMemo<DataState>(
    () => ({
      user,
      tutorProfile,
      documents,
      verificationRequest,
      vacancies,
      applications,
      allUsers: [],
      allTutorProfiles,
      allDocuments,
      allVerificationRequests,
      allOrganizations,
      getUserName: _getUserName,
      getUserEmail: _getUserEmail,
      agencyUser: user,
      agencyOrganization,
      getAgencyVacancies,
      getVacancyApplicants,
      updateProfile,
      addDocument,
      removeDocument,
      refetchDocuments,
      applyToVacancy,
      requestVerification,
      createVacancy,
      updateVacancy,
      closeVacancy,
      updateApplicationStatus,
      updateOrganization,
      refetchAgencyData,
      approveDocument,
      rejectDocument,
      approveVerification,
      rejectVerification,
      loading,
    }),
    [
      user,
      tutorProfile,
      documents,
      verificationRequest,
      vacancies,
      applications,
      allTutorProfiles,
      allDocuments,
      allVerificationRequests,
      allOrganizations,
      _getUserName,
      _getUserEmail,
      agencyOrganization,
      getAgencyVacancies,
      getVacancyApplicants,
      updateProfile,
      addDocument,
      removeDocument,
      refetchDocuments,
      applyToVacancy,
      requestVerification,
      createVacancy,
      updateVacancy,
      closeVacancy,
      updateApplicationStatus,
      updateOrganization,
      approveDocument,
      rejectDocument,
      approveVerification,
      rejectVerification,
      refetchAgencyData,
      loading,
    ]
  );

  return (
    <DataContext.Provider value={value}>
      {children}
    </DataContext.Provider>
  );
}

export function useData() {
  const ctx = useContext(DataContext);
  if (!ctx) throw new Error("useData must be used within DataProvider");
  return ctx;
}
