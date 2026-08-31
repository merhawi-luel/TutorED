import { supabase } from "./supabase";

const API_BASE = import.meta.env.VITE_API_URL || "/api";

// ─── Helper ────────────────────────────────────────────────────

async function request<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const { data: { session } } = await supabase.auth.getSession();
  const token = session?.access_token;

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers,
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || `Request failed: ${res.status}`);
  }

  return res.json();
}

// ─── Auth ──────────────────────────────────────────────────────

export const authApi = {
  me: () => request<any>("/auth/me"),
};

// ─── Tutor ─────────────────────────────────────────────────────

export const tutorApi = {
  getProfile: () => request<any>("/tutor/profile"),
  updateProfile: (data: Record<string, any>) =>
    request<any>("/tutor/profile", { method: "PUT", body: JSON.stringify(data) }),

  getDocuments: () => request<any[]>("/tutor/documents"),
  createDocument: (data: { type: string; title: string; fileName: string; fileKey?: string }) =>
    request<any>("/tutor/documents", { method: "POST", body: JSON.stringify(data) }),
  deleteDocument: (id: string) =>
    request<any>(`/tutor/documents/${id}`, { method: "DELETE" }),
  downloadDocument: (id: string) =>
    request<{ downloadUrl: string; fileName: string }>(`/tutor/documents/${id}/download`),
  previewDocument: (id: string) =>
    request<{ previewUrl: string; fileName: string; type: string; title: string }>(`/tutor/documents/${id}/preview`),

  getVerification: () => request<any>("/tutor/verification"),
  requestVerification: () =>
    request<any>("/tutor/verify", { method: "POST" }),

  getEducationEntries: () => request<any[]>("/tutor/education-entries"),
  createEducationEntry: (data: { name: string; title: string; description?: string }) =>
    request<any>("/tutor/education-entries", { method: "POST", body: JSON.stringify(data) }),
  deleteEducationEntry: (id: string) =>
    request<any>(`/tutor/education-entries/${id}`, { method: "DELETE" }),

  getVacancies: () => request<any[]>("/tutor/vacancies"),
  applyToVacancy: (vacancyId: string) =>
    request<any>("/tutor/applications", { method: "POST", body: JSON.stringify({ vacancyId }) }),

  getReviews: () => request<any[]>("/tutor/reviews"),
  getReviewStats: () => request<{ averageRating: number; totalReviews: number }>("/tutor/reviews/stats"),
};

// ─── Applications ──────────────────────────────────────────────

export const applicationsApi = {
  list: () => request<any[]>("/tutor/applications"),
  apply: (vacancyId: string) =>
    request<any>("/tutor/applications", { method: "POST", body: JSON.stringify({ vacancyId }) }),
  withdraw: (id: string) =>
    request<any>(`/tutor/applications/${id}/withdraw`, { method: "PUT" }),
};

// ─── Agency ────────────────────────────────────────────────────

export const agencyApi = {
  getOrganization: () => request<any>("/agency/organization"),
  createOrganization: (data: { name: string; description?: string; location?: string; subjects?: string[] }) =>
    request<any>("/agency/organization", { method: "POST", body: JSON.stringify(data) }),
  updateOrganization: (data: Record<string, any>) =>
    request<any>("/agency/organization", { method: "PUT", body: JSON.stringify(data) }),

  getVacancies: () => request<any[]>("/agency/vacancies"),
  createVacancy: (data: Record<string, any>) =>
    request<any>("/agency/vacancies", { method: "POST", body: JSON.stringify(data) }),
  updateVacancy: (id: string, data: Record<string, any>) =>
    request<any>(`/agency/vacancies/${id}`, { method: "PUT", body: JSON.stringify(data) }),
  closeVacancy: (id: string) =>
    request<any>(`/agency/vacancies/${id}/close`, { method: "PUT" }),

  getApplicants: (vacancyId?: string) =>
    request<any[]>(vacancyId ? `/agency/applicants/${vacancyId}` : "/agency/applicants"),
  updateApplicationStatus: (appId: string, status: string) =>
    request<any>(`/agency/applications/${appId}/status`, { method: "PUT", body: JSON.stringify({ status }) }),

  getTutorDocuments: (tutorId: string) =>
    request<any[]>(`/agency/tutors/${tutorId}/documents`),
  previewTutorDocument: (docId: string) =>
    request<{ previewUrl: string; fileName: string; type: string; title: string }>(`/agency/documents/${docId}/preview`),
  downloadTutorDocument: (docId: string) =>
    request<{ downloadUrl: string; fileName: string }>(`/agency/documents/${docId}/download`),

  getRequests: () => request<any[]>("/agency/requests"),
  updateRequestStatus: (requestId: string, status: string) =>
    request<any>(`/agency/requests/${requestId}/status`, { method: "PUT", body: JSON.stringify({ status }) }),
};

// ─── Admin ─────────────────────────────────────────────────────

export const adminApi = {
  getVerifications: () => request<any[]>("/admin/verifications"),
  approveVerification: (id: string) =>
    request<any>(`/admin/verifications/${id}/approve`, { method: "PUT" }),
  rejectVerification: (id: string) =>
    request<any>(`/admin/verifications/${id}/reject`, { method: "PUT" }),

  approveDocument: (id: string) =>
    request<any>(`/admin/documents/${id}/approve`, { method: "PUT" }),
  rejectDocument: (id: string, note?: string) =>
    request<any>(`/admin/documents/${id}/reject`, { method: "PUT", body: JSON.stringify({ note }) }),
  downloadDocument: (id: string) =>
    request<{ downloadUrl: string; fileName: string }>(`/admin/documents/${id}/download`),
  previewDocument: (id: string) =>
    request<{ previewUrl: string; fileName: string; type: string; title: string; tutorName: string; tutorEmail: string }>(`/admin/documents/${id}/preview`),

  getEducationEntries: () => request<any[]>("/admin/education-entries"),
  approveEducationEntry: (id: string) =>
    request<any>(`/admin/education-entries/${id}/approve`, { method: "PUT" }),
  rejectEducationEntry: (id: string, note?: string) =>
    request<any>(`/admin/education-entries/${id}/reject`, { method: "PUT", body: JSON.stringify({ note }) }),

  getTutors: () => request<any[]>("/admin/tutors"),
  getAgencies: () => request<any[]>("/admin/agencies"),
  getAdmins: () => request<any[]>("/admin/admins"),
  createAdmin: (data: { name: string; email: string; password: string }) =>
    request<any>("/admin/create-admin", { method: "POST", body: JSON.stringify(data) }),
};

// ─── Parent ────────────────────────────────────────────────────

export const parentApi = {
  getProfile: () => request<any>("/parent/profile"),
  updateProfile: (data: Record<string, any>) =>
    request<any>("/parent/profile", { method: "PUT", body: JSON.stringify(data) }),

  getVacancies: () => request<any[]>("/parent/vacancies"),
  createVacancy: (data: Record<string, any>) =>
    request<any>("/parent/vacancies", { method: "POST", body: JSON.stringify(data) }),
  getMyVacancies: () => request<any[]>("/parent/vacancies/mine"),
  closeVacancy: (id: string) =>
    request<any>(`/parent/vacancies/${id}/close`, { method: "PUT" }),
  getAgencies: () => request<any[]>("/parent/agencies"),
  getSubjects: () => request<string[]>("/parent/subjects"),
  contactAgency: (data: { organizationId?: string; subject: string; grade: string; location?: string; notes?: string; parentName?: string; parentEmail?: string; parentPhone?: string }) =>
    request<any>("/parent/contact-agency", { method: "POST", body: JSON.stringify(data) }),
  getRequests: () => request<any[]>("/parent/requests"),

  // Applicants
  getApplicants: () => request<any[]>("/parent/applicants"),
  getTutorDocuments: (tutorId: string) =>
    request<any[]>(`/parent/tutors/${tutorId}/documents`),
  previewTutorDocument: (docId: string) =>
    request<{ previewUrl: string; fileName: string; type: string; title: string }>(`/parent/documents/${docId}/preview`),
  downloadTutorDocument: (docId: string) =>
    request<{ downloadUrl: string; fileName: string }>(`/parent/documents/${docId}/download`),

  // Reviews
  submitReview: (data: { applicationId: string; rating: number; description?: string }) =>
    request<any>("/parent/reviews", { method: "POST", body: JSON.stringify(data) }),
};

// ─── Upload ────────────────────────────────────────────────────

export const uploadApi = {
  presign: (fileName: string, contentType: string) =>
    request<{ signedUrl: string; fileKey: string; path: string }>("/upload/presign", {
      method: "POST",
      body: JSON.stringify({ fileName, contentType }),
    }),
  confirm: (fileKey: string) =>
    request<{ downloadUrl: string }>("/upload/confirm", {
      method: "POST",
      body: JSON.stringify({ fileKey }),
    }),
};
