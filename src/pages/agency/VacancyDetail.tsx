import { useTheme } from "@/context/ThemeContext";
import { supabase } from "@/lib/supabase";
import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  MapPin,
  Briefcase,
  Users,
  Clock,
  DollarSign,
  User,
  Pencil,
  Save,
  X,
  CheckCircle,
  Loader2,
  GraduationCap,
  Star,
  Mail,
  Phone,
  Calendar,
  FileText,
  Download,
  Eye,
} from "lucide-react";
import { ALL_SUBJECTS, ALL_GRADES } from "@/data/constants";
import type { ApplicationStatus, TeachingMode } from "@/types";

const API_BASE = import.meta.env.VITE_API_URL || "/api";

// ─── Status Config (matches AgencyApplicants.tsx) ─────────────
const STATUS_CONFIG: Record<string, { color: string; label: string; bg: string }> = {
  applied: { color: "var(--text-secondary)", label: "Applied", bg: "var(--bg-input)" },
  under_review: { color: "var(--badge-info-color)", label: "Under Review", bg: "var(--badge-info-bg)" },
  shortlisted: { color: "var(--accent)", label: "Shortlisted", bg: "var(--accent-bg)" },
  interview: { color: "var(--badge-purple-color)", label: "Interview", bg: "var(--badge-purple-bg)" },
  accepted: { color: "var(--accent)", label: "Accepted", bg: "var(--accent-bg)" },
  completed: { color: "var(--accent)", label: "Completed", bg: "var(--accent-bg)" },
  rejected: { color: "var(--danger-color)", label: "Rejected", bg: "var(--danger-bg)" },
  withdrawn: { color: "var(--text-muted)", label: "Withdrawn", bg: "var(--bg-input)" },
};

const ACTIONS: { status: ApplicationStatus; label: string; color: string }[] = [
  { status: "shortlisted", label: "Shortlist", color: "var(--accent)" },
  { status: "interview", label: "Interview", color: "var(--badge-purple-color)" },
  { status: "accepted", label: "Accept", color: "var(--accent)" },
  { status: "rejected", label: "Reject", color: "var(--danger-color)" },
];

interface TutorProfileData {
  userId: string;
  headline: string;
  bio: string;
  subjects: string[];
  grades: string[];
  experience: number;
  education: string;
  location: string;
  teachingMode: string;
  availability: string;
  rating: number;
  applicationCount: number;
  verificationLevel: string;
}

interface EducationEntry {
  id: string;
  tutorId: string;
  name: string;
  title: string;
  description: string;
  status: string;
  submittedAt: string;
  reviewedAt?: string;
  reviewerNote?: string;
}

interface TutorDocument {
  id: string;
  tutorId: string;
  type: string;
  title: string;
  fileName: string;
  fileKey?: string;
  status: string;
  submittedAt: string;
  reviewedAt?: string;
  reviewerNote?: string;
}

interface Applicant {
  id: string;
  userId: string;
  name: string;
  email: string;
  phone: string;
  subject: string;
  experience: number;
  education: string;
  status: string;
  appliedAt: string;
  profileImage?: string;
  tutorProfile?: TutorProfileData;
  educationEntries?: EducationEntry[];
}

interface VacancyDetail {
  id: string;
  title: string;
  description: string;
  subjects: string[];
  grades: string[];
  requiredEducation: string;
  requiredExperience: number;
  location: string;
  teachingMode: string;
  salary: string;
  availability: string;
  deadline: string;
  status: string;
  applicantCount: number;
  createdAt: string;
}

export default function VacancyDetail() {
  const { vacancyId } = useParams<{ vacancyId: string }>();
  const navigate = useNavigate();
  const { colors } = useTheme();

  const [vacancy, setVacancy] = useState<VacancyDetail | null>(null);
  const [applicants, setApplicants] = useState<Applicant[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedApplicant, setSelectedApplicant] = useState<Applicant | null>(null);
  const [showProfile, setShowProfile] = useState(false);

  // Tutor detail data fetched on demand
  const [tutorDocuments, setTutorDocuments] = useState<TutorDocument[]>([]);
  const [loadingDocs, setLoadingDocs] = useState(false);

  // Edit mode state
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const [editForm, setEditForm] = useState({
    title: "",
    description: "",
    subjects: [] as string[],
    grades: [] as string[],
    requiredEducation: "",
    requiredExperience: 0,
    location: "",
    teachingMode: "in-person" as TeachingMode,
    salary: "",
    availability: "",
    deadline: "",
  });

  // ─── Fetch Data ─────────────────────────────────────────────
  useEffect(() => {
    const fetchVacancyAndApplicants = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        const token = session?.access_token;

        const vacancyResponse = await fetch(`${API_BASE}/agency/vacancies/${vacancyId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (vacancyResponse.ok) {
          const vacancyData = await vacancyResponse.json();
          setVacancy(vacancyData);
          setEditForm({
            title: vacancyData.title || "",
            description: vacancyData.description || "",
            subjects: vacancyData.subjects || (vacancyData.subject ? [vacancyData.subject] : []),
            grades: vacancyData.grades || (vacancyData.grade ? [vacancyData.grade] : []),
            requiredEducation: vacancyData.requiredEducation || "",
            requiredExperience: vacancyData.requiredExperience || 0,
            location: vacancyData.location || "",
            teachingMode: vacancyData.teachingMode || "in-person",
            salary: vacancyData.salary || "",
            availability: vacancyData.availability || "",
            deadline: vacancyData.deadline || "",
          });
        }

        const applicantsResponse = await fetch(`${API_BASE}/agency/applicants/${vacancyId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (applicantsResponse.ok) {
          const applicantsData = await applicantsResponse.json();
          setApplicants(applicantsData);
        }
      } catch (error) {
        console.error("Error fetching vacancy details:", error);
      } finally {
        setLoading(false);
      }
    };

    if (vacancyId) {
      fetchVacancyAndApplicants();
    }
  }, [vacancyId]);

  // ─── Fetch tutor documents when applicant is selected ──────
  const fetchTutorDocuments = useCallback(async (tutorId: string) => {
    setLoadingDocs(true);
    setTutorDocuments([]);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;
      const res = await fetch(`${API_BASE}/agency/tutors/${tutorId}/documents`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const docs = await res.json();
        setTutorDocuments(docs);
      }
    } catch (error) {
      console.error("Error fetching tutor documents:", error);
    } finally {
      setLoadingDocs(false);
    }
  }, []);

  // Fetch documents when an applicant is selected
  useEffect(() => {
    if (selectedApplicant && showProfile) {
      fetchTutorDocuments(selectedApplicant.userId);
    }
  }, [selectedApplicant, showProfile, fetchTutorDocuments]);

  // ─── Status Change Handler ──────────────────────────────────
  const handleStatusChange = useCallback(async (applicantId: string, newStatus: ApplicationStatus) => {
    // Optimistic update
    setApplicants((prev) =>
      prev.map((a) => (a.id === applicantId ? { ...a, status: newStatus } : a))
    );

    try {
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;
      const res = await fetch(`${API_BASE}/agency/applications/${applicantId}/status`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!res.ok) throw new Error("Failed to update status");

      const label = STATUS_CONFIG[newStatus]?.label ?? newStatus;
      setToast({ type: "success", message: `Marked as ${label}` });
      setTimeout(() => setToast(null), 3000);

      // Update selectedApplicant if it's the same one
      setSelectedApplicant((prev) =>
        prev && prev.id === applicantId ? { ...prev, status: newStatus } : prev
      );
    } catch (err) {
      console.error("Failed to update status:", err);
      setToast({ type: "error", message: "Failed to update status" });
      setTimeout(() => setToast(null), 3000);
      // Revert on failure - refetch applicants
      if (vacancyId) {
        const { data: { session } } = await supabase.auth.getSession();
        const token = session?.access_token;
        const applicantsResponse = await fetch(`${API_BASE}/agency/applicants/${vacancyId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (applicantsResponse.ok) {
          const applicantsData = await applicantsResponse.json();
          setApplicants(applicantsData);
        }
      }
    }
  }, [vacancyId]);

  // ─── Edit Handlers ──────────────────────────────────────────
  const handleSave = async () => {
    if (!vacancyId || !editForm.title || editForm.subjects.length === 0 || editForm.grades.length === 0) return;

    setSaving(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;
      const response = await fetch(`${API_BASE}/agency/vacancies/${vacancyId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(editForm),
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || "Failed to update vacancy");
      }

      const updated = await response.json();
      setVacancy((prev) => (prev ? { ...prev, ...updated } : prev));
      setEditing(false);
      setToast({ type: "success", message: "Vacancy updated successfully!" });
      setTimeout(() => setToast(null), 3000);
    } catch (err: any) {
      setToast({ type: "error", message: err.message || "Failed to update vacancy" });
      setTimeout(() => setToast(null), 3000);
    } finally {
      setSaving(false);
    }
  };

  const handleCancelEdit = () => {
    if (vacancy) {
      setEditForm({
        title: vacancy.title,
        description: vacancy.description,
        subjects: vacancy.subjects || [],
        grades: vacancy.grades || [],
        requiredEducation: vacancy.requiredEducation,
        requiredExperience: vacancy.requiredExperience,
        location: vacancy.location,
        teachingMode: vacancy.teachingMode as TeachingMode,
        salary: vacancy.salary,
        availability: vacancy.availability,
        deadline: vacancy.deadline,
      });
    }
    setEditing(false);
  };

  // ─── Modal Escape Key ───────────────────────────────────────
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && showProfile) {
        setShowProfile(false);
        setSelectedApplicant(null);
      }
    };
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [showProfile]);

  const inputStyle = {
    background: colors.bgInput,
    border: `1px solid ${colors.borderColor}`,
    color: colors.textPrimary,
  };

  // ─── Helper: get tutor display name ─────────────────────────
  const getTutorDisplayName = (applicant: Applicant) => {
    if (applicant.tutorProfile?.headline) return applicant.tutorProfile.headline;
    return applicant.name || "Unknown";
  };

  // ─── Loading State ──────────────────────────────────────────
  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center" style={{ background: colors.bgPage }}>
        <div className="text-center">
          <div
            className="w-16 h-16 border-4 border-t-transparent rounded-full animate-spin mx-auto mb-4"
            style={{ borderColor: colors.accent, borderTopColor: "transparent" }}
          />
          <p style={{ color: colors.textSecondary }}>Loading vacancy details...</p>
        </div>
      </div>
    );
  }

  // ─── Not Found State ────────────────────────────────────────
  if (!vacancy) {
    return (
      <div className="space-y-6">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-sm font-medium"
          style={{ color: colors.accent }}
        >
          <ArrowLeft size={16} /> Back
        </button>
        <div
          className="rounded-xl p-12 text-center border"
          style={{ backgroundColor: colors.bgCard, borderColor: colors.borderColor }}
        >
          <p style={{ color: colors.textMuted }}>Vacancy not found</p>
        </div>
      </div>
    );
  }

  const statusCfg = STATUS_CONFIG[vacancy.status] ?? STATUS_CONFIG.applied;

  return (
    <div className="space-y-6">
      {/* ─── Toast ──────────────────────────────────────────── */}
      {toast && (
        <div
          className="fixed top-6 right-6 z-50 px-5 py-3 rounded-xl flex items-center gap-3 shadow-xl"
          style={{
            background: toast.type === "success" ? colors.accentBg : colors.dangerBg,
            border: `1px solid ${toast.type === "success" ? colors.accentBorder : colors.dangerBorder}`,
            color: toast.type === "success" ? colors.accent : colors.dangerColor,
          }}
        >
          <CheckCircle size={18} />
          <span className="text-sm font-medium">{toast.message}</span>
        </div>
      )}

      {/* ─── Back Button ────────────────────────────────────── */}
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-sm font-medium transition-colors hover:opacity-80"
        style={{ color: colors.accent }}
      >
        <ArrowLeft size={16} /> Back to My Posts
      </button>

      {/* ─── Main Content ───────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* ─── Left Column: Vacancy Details ─────────────────── */}
        <div className="lg:col-span-2 space-y-5">
          {/* Header Card */}
          <div
            className="rounded-2xl p-6 border"
            style={{ backgroundColor: colors.bgCard, borderColor: colors.borderColor }}
          >
            {/* Title & Status & Edit Button */}
            <div className="flex items-start justify-between gap-4 mb-5">
              <div className="flex-1 min-w-0">
                {editing ? (
                  <input
                    value={editForm.title}
                    onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                    className="w-full text-3xl font-bold mb-2 px-3 py-2 rounded-xl focus:outline-none"
                    style={inputStyle}
                    placeholder="Vacancy title"
                  />
                ) : (
                  <>
                    <h1 className="text-3xl font-bold mb-3" style={{ color: colors.textPrimary }}>
                      {vacancy.title}
                    </h1>
                    {/* Subjects & Grades Tags */}
                    <div className="flex flex-wrap gap-1.5 mb-1">
                      {(vacancy.subjects || []).map((s) => (
                        <span
                          key={s}
                          className="px-2.5 py-1 rounded-lg text-xs font-medium"
                          style={{ background: colors.accentBg, color: colors.accent }}
                        >
                          {s}
                        </span>
                      ))}
                      {(vacancy.grades || []).map((g) => (
                        <span
                          key={g}
                          className="px-2.5 py-1 rounded-lg text-xs font-medium"
                          style={{ background: colors.badgeInfoBg, color: colors.badgeInfoColor }}
                        >
                          {g}
                        </span>
                      ))}
                    </div>
                  </>
                )}
              </div>
              <div className="flex items-center gap-2 shrink-0">
                {/* Status Badge */}
                <span
                  className="px-3.5 py-1.5 rounded-full text-xs font-bold capitalize whitespace-nowrap"
                  style={{
                    backgroundColor: statusCfg.bg,
                    color: statusCfg.color,
                    border: `1.5px solid ${statusCfg.color}30`,
                  }}
                >
                  {statusCfg.label}
                </span>
                {!editing ? (
                  <button
                    onClick={() => setEditing(true)}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all hover:opacity-80"
                    style={{ background: colors.bgInput, border: `1px solid ${colors.borderColor}`, color: colors.textPrimary }}
                  >
                    <Pencil size={14} /> Edit
                  </button>
                ) : (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleCancelEdit}
                      className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium transition-all"
                      style={{ background: colors.bgInput, border: `1px solid ${colors.borderColor}`, color: colors.textMuted }}
                    >
                      <X size={14} /> Cancel
                    </button>
                    <button
                      onClick={handleSave}
                      disabled={saving || !editForm.title || editForm.subjects.length === 0 || editForm.grades.length === 0}
                      className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium transition-all disabled:opacity-50"
                      style={{ background: colors.accent, color: colors.bgPage }}
                    >
                      {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
                      {saving ? "Saving..." : "Save"}
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Salary & Key Info Row */}
            <div
              className="flex items-center gap-6 py-4 mb-1"
              style={{ borderTop: `1px solid ${colors.borderColor}`, borderBottom: `1px solid ${colors.borderColor}` }}
            >
              {/* Salary Highlight */}
              {vacancy.salary && (
                <div
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl"
                  style={{ background: colors.accentBg, border: `1px solid ${colors.accentBorder}` }}
                >
                  <DollarSign size={18} style={{ color: colors.accent }} />
                  <span className="text-lg font-bold" style={{ color: colors.accent }}>
                    {vacancy.salary}
                  </span>
                </div>
              )}

              {/* Key Info Grid */}
              <div className="flex-1 grid grid-cols-2 sm:grid-cols-4 gap-4">
                {/* Location */}
                <div className="flex items-center gap-2">
                  <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center"
                    style={{ background: colors.bgInput }}
                  >
                    <MapPin size={14} style={{ color: colors.textMuted }} />
                  </div>
                  <div>
                    <div className="text-[10px] uppercase tracking-wider" style={{ color: colors.textFaint }}>Location</div>
                    {editing ? (
                      <input
                        value={editForm.location}
                        onChange={(e) => setEditForm({ ...editForm, location: e.target.value })}
                        className="w-full px-2 py-1 rounded-lg text-xs focus:outline-none"
                        style={inputStyle}
                      />
                    ) : (
                      <div className="text-xs font-medium" style={{ color: colors.textPrimary }}>{vacancy.location}</div>
                    )}
                  </div>
                </div>

                {/* Teaching Mode */}
                <div className="flex items-center gap-2">
                  <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center"
                    style={{ background: colors.badgePurpleBg }}
                  >
                    <Briefcase size={14} style={{ color: colors.badgePurpleColor }} />
                  </div>
                  <div>
                    <div className="text-[10px] uppercase tracking-wider" style={{ color: colors.textFaint }}>Mode</div>
                    {editing ? (
                      <select
                        value={editForm.teachingMode}
                        onChange={(e) => setEditForm({ ...editForm, teachingMode: e.target.value as TeachingMode })}
                        className="w-full px-2 py-1 rounded-lg text-xs focus:outline-none"
                        style={inputStyle}
                      >
                        <option value="in-person">In-person</option>
                        <option value="online">Online</option>
                        <option value="hybrid">Hybrid</option>
                      </select>
                    ) : (
                      <div className="text-xs font-medium capitalize" style={{ color: colors.textPrimary }}>{vacancy.teachingMode}</div>
                    )}
                  </div>
                </div>

                {/* Experience */}
                <div className="flex items-center gap-2">
                  <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center"
                    style={{ background: colors.badgeInfoBg }}
                  >
                    <User size={14} style={{ color: colors.badgeInfoColor }} />
                  </div>
                  <div>
                    <div className="text-[10px] uppercase tracking-wider" style={{ color: colors.textFaint }}>Experience</div>
                    {editing ? (
                      <input
                        type="number"
                        min={0}
                        value={editForm.requiredExperience}
                        onChange={(e) => setEditForm({ ...editForm, requiredExperience: Number(e.target.value) })}
                        className="w-full px-2 py-1 rounded-lg text-xs focus:outline-none"
                        style={inputStyle}
                      />
                    ) : (
                      <div className="text-xs font-medium" style={{ color: colors.textPrimary }}>{vacancy.requiredExperience}+ years</div>
                    )}
                  </div>
                </div>

                {/* Deadline */}
                <div className="flex items-center gap-2">
                  <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center"
                    style={{ background: colors.badgePendingBg }}
                  >
                    <Clock size={14} style={{ color: colors.badgePendingColor }} />
                  </div>
                  <div>
                    <div className="text-[10px] uppercase tracking-wider" style={{ color: colors.textFaint }}>Deadline</div>
                    {editing ? (
                      <input
                        type="date"
                        value={editForm.deadline}
                        onChange={(e) => setEditForm({ ...editForm, deadline: e.target.value })}
                        className="w-full px-2 py-1 rounded-lg text-xs focus:outline-none"
                        style={inputStyle}
                      />
                    ) : (
                      <div className="text-xs font-medium" style={{ color: colors.textPrimary }}>
                        {vacancy.deadline ? new Date(vacancy.deadline).toLocaleDateString() : "No deadline"}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Subject & Grade selectors in edit mode */}
            {editing && (
              <div className="space-y-4 pt-4">
                <div>
                  <label className="block text-xs mb-1.5 font-medium" style={{ color: colors.textMuted }}>Subjects *</label>
                  <div className="flex flex-wrap gap-1.5 mb-2">
                    {editForm.subjects.map((s) => (
                      <span key={s} className="inline-flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium" style={{ background: colors.primaryLight, color: colors.primary }}>
                        {s}
                        <button type="button" onClick={() => setEditForm({ ...editForm, subjects: editForm.subjects.filter((x) => x !== s) })} className="hover:opacity-70"><X size={12} /></button>
                      </span>
                    ))}
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5 p-2 rounded-xl" style={{ background: colors.bgInput, border: `1px solid ${colors.borderColor}` }}>
                    {ALL_SUBJECTS.map((s) => {
                      const checked = editForm.subjects.includes(s);
                      return (
                        <button key={s} type="button" onClick={() => setEditForm({ ...editForm, subjects: checked ? editForm.subjects.filter((x) => x !== s) : [...editForm.subjects, s] })} className="flex items-center gap-1.5 px-2 py-1.5 rounded text-[11px] transition-all text-left" style={{ background: checked ? colors.primaryLight : 'transparent', color: checked ? colors.primary : colors.textMuted }}>
                          <div className="w-3 h-3 rounded flex items-center justify-center shrink-0" style={{ border: `1.5px solid ${checked ? colors.primary : colors.borderColor}`, background: checked ? colors.primary : 'transparent' }}>
                            {checked && <svg width="7" height="7" viewBox="0 0 12 12" fill="none"><path d="M2 6L5 9L10 3" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>}
                          </div>
                          {s}
                        </button>
                      );
                    })}
                  </div>
                </div>
                <div>
                  <label className="block text-xs mb-1.5 font-medium" style={{ color: colors.textMuted }}>Grades *</label>
                  <div className="flex flex-wrap gap-1.5 mb-2">
                    {editForm.grades.map((g) => (
                      <span key={g} className="inline-flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium" style={{ background: colors.primaryLight, color: colors.primary }}>
                        {g}
                        <button type="button" onClick={() => setEditForm({ ...editForm, grades: editForm.grades.filter((x) => x !== g) })} className="hover:opacity-70"><X size={12} /></button>
                      </span>
                    ))}
                  </div>
                  <div className="grid grid-cols-3 sm:grid-cols-4 gap-1.5 p-2 rounded-xl" style={{ background: colors.bgInput, border: `1px solid ${colors.borderColor}` }}>
                    {ALL_GRADES.map((g) => {
                      const checked = editForm.grades.includes(g);
                      return (
                        <button key={g} type="button" onClick={() => setEditForm({ ...editForm, grades: checked ? editForm.grades.filter((x) => x !== g) : [...editForm.grades, g] })} className="flex items-center gap-1.5 px-2 py-1.5 rounded text-[11px] transition-all text-left" style={{ background: checked ? colors.primaryLight : 'transparent', color: checked ? colors.primary : colors.textMuted }}>
                          <div className="w-3 h-3 rounded flex items-center justify-center shrink-0" style={{ border: `1.5px solid ${checked ? colors.primary : colors.borderColor}`, background: checked ? colors.primary : 'transparent' }}>
                            {checked && <svg width="7" height="7" viewBox="0 0 12 12" fill="none"><path d="M2 6L5 9L10 3" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>}
                          </div>
                          {g}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* Required Education & Availability (non-edit) */}
            {!editing && (
              <div className="grid grid-cols-2 gap-4 pt-4">
                <div>
                  <div className="text-[10px] uppercase tracking-wider mb-1" style={{ color: colors.textFaint }}>Required Education</div>
                  <p className="text-sm font-medium" style={{ color: colors.textPrimary }}>
                    {vacancy.requiredEducation || "Not specified"}
                  </p>
                </div>
                <div>
                  <div className="text-[10px] uppercase tracking-wider mb-1" style={{ color: colors.textFaint }}>Availability</div>
                  <p className="text-sm font-medium" style={{ color: colors.textPrimary }}>
                    {vacancy.availability || "Not specified"}
                  </p>
                </div>
              </div>
            )}

            {/* Edit mode: education & availability inputs */}
            {editing && (
              <div className="grid grid-cols-2 gap-4 pt-2">
                <div>
                  <label className="block text-xs mb-1.5 font-medium" style={{ color: colors.textMuted }}>Required Education</label>
                  <input
                    value={editForm.requiredEducation}
                    onChange={(e) => setEditForm({ ...editForm, requiredEducation: e.target.value })}
                    placeholder="e.g. Bachelor's degree"
                    className="w-full px-3 py-2 rounded-xl text-sm focus:outline-none"
                    style={inputStyle}
                  />
                </div>
                <div>
                  <label className="block text-xs mb-1.5 font-medium" style={{ color: colors.textMuted }}>Availability</label>
                  <input
                    value={editForm.availability}
                    onChange={(e) => setEditForm({ ...editForm, availability: e.target.value })}
                    placeholder="e.g. Weekends, Evenings"
                    className="w-full px-3 py-2 rounded-xl text-sm focus:outline-none"
                    style={inputStyle}
                  />
                </div>
              </div>
            )}

            {/* Salary (edit mode) */}
            {editing && (
              <div className="pt-4">
                <label className="block text-xs mb-1.5 font-medium" style={{ color: colors.textMuted }}>Salary</label>
                <input
                  value={editForm.salary}
                  onChange={(e) => setEditForm({ ...editForm, salary: e.target.value })}
                  placeholder="e.g. 5,000 ETB/month"
                  className="w-full px-3 py-2 rounded-xl text-sm focus:outline-none"
                  style={inputStyle}
                />
              </div>
            )}
          </div>

          {/* ─── Description Card ──────────────────────────── */}
          <div
            className="rounded-2xl border overflow-hidden"
            style={{ backgroundColor: colors.bgCard, borderColor: colors.borderColor }}
          >
            <div className="px-6 py-4 flex items-center gap-3" style={{ borderBottom: `1px solid ${colors.borderColor}` }}>
              <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: colors.accentBg }}>
                <FileTextIcon color={colors.accent} />
              </div>
              <h2 className="text-base font-bold" style={{ color: colors.textPrimary }}>Job Description</h2>
            </div>
            <div className="p-6">
              {editing ? (
                <textarea
                  value={editForm.description}
                  onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                  rows={5}
                  placeholder="Describe the role, requirements, and what you're looking for..."
                  className="w-full px-4 py-3 rounded-xl text-sm focus:outline-none resize-none"
                  style={inputStyle}
                />
              ) : (
                <p style={{ color: colors.textSecondary }} className="leading-relaxed text-sm">
                  {vacancy.description || "No description provided."}
                </p>
              )}
            </div>
          </div>

          {/* ─── Requirements Card ─────────────────────────── */}
          {!editing && (
            <div
              className="rounded-2xl border overflow-hidden"
              style={{ backgroundColor: colors.bgCard, borderColor: colors.borderColor }}
            >
              <div className="px-6 py-4 flex items-center gap-3" style={{ borderBottom: `1px solid ${colors.borderColor}` }}>
                <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: colors.badgeInfoBg }}>
                  <CheckCircle size={16} style={{ color: colors.badgeInfoColor }} />
                </div>
                <h2 className="text-base font-bold" style={{ color: colors.textPrimary }}>Requirements</h2>
              </div>
              <div className="p-6 space-y-3">
                {vacancy.requiredEducation && (
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full flex items-center justify-center shrink-0 mt-0.5" style={{ background: colors.accentBg }}>
                      <GraduationCap size={12} style={{ color: colors.accent }} />
                    </div>
                    <div>
                      <span className="text-xs font-medium" style={{ color: colors.textMuted }}>Education</span>
                      <p className="text-sm font-medium" style={{ color: colors.textPrimary }}>{vacancy.requiredEducation}</p>
                    </div>
                  </div>
                )}
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full flex items-center justify-center shrink-0 mt-0.5" style={{ background: colors.badgePurpleBg }}>
                    <Briefcase size={12} style={{ color: colors.badgePurpleColor }} />
                  </div>
                  <div>
                    <span className="text-xs font-medium" style={{ color: colors.textMuted }}>Experience</span>
                    <p className="text-sm font-medium" style={{ color: colors.textPrimary }}>Minimum {vacancy.requiredExperience} years</p>
                  </div>
                </div>
                {vacancy.availability && (
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full flex items-center justify-center shrink-0 mt-0.5" style={{ background: colors.badgePendingBg }}>
                      <Clock size={12} style={{ color: colors.badgePendingColor }} />
                    </div>
                    <div>
                      <span className="text-xs font-medium" style={{ color: colors.textMuted }}>Availability</span>
                      <p className="text-sm font-medium" style={{ color: colors.textPrimary }}>{vacancy.availability}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* ─── Right Column: Applicants Sidebar ───────────── */}
        <div className="lg:col-span-1">
          <div
            className="rounded-2xl border sticky top-6 overflow-hidden"
            style={{ backgroundColor: colors.bgCard, borderColor: colors.borderColor }}
          >
            {/* Sidebar Header */}
            <div
              className="px-5 py-4 flex items-center gap-2"
              style={{ borderBottom: `1px solid ${colors.borderColor}` }}
            >
              <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: colors.accentBg }}>
                <Users size={16} style={{ color: colors.accent }} />
              </div>
              <h3 className="text-base font-bold" style={{ color: colors.textPrimary }}>
                Applicants
              </h3>
              <span
                className="ml-auto px-2.5 py-0.5 rounded-full text-xs font-bold"
                style={{ backgroundColor: colors.accent, color: colors.bgPage }}
              >
                {applicants.length}
              </span>
            </div>

            {/* Applicant List */}
            {applicants.length === 0 ? (
              <div className="text-center py-12 px-6">
                <Users size={32} style={{ color: colors.textFaint }} className="mx-auto mb-3" />
                <p style={{ color: colors.textMuted }} className="text-sm font-medium">No applicants yet</p>
                <p style={{ color: colors.textFaint }} className="text-xs mt-1">Applicants will appear here once they apply.</p>
              </div>
            ) : (
              <div className="max-h-[32rem] overflow-y-auto">
                {applicants.map((applicant) => {
                  const appStatusCfg = STATUS_CONFIG[applicant.status] ?? STATUS_CONFIG.applied;
                  const isSelected = selectedApplicant?.id === applicant.id;
                  return (
                    <button
                      key={applicant.id}
                      onClick={() => {
                        setSelectedApplicant(applicant);
                        setShowProfile(true);
                      }}
                      className="w-full text-left px-5 py-3.5 transition-all border-b last:border-b-0"
                      style={{
                        background: isSelected ? colors.accentBg : "transparent",
                        borderColor: colors.borderSubtle,
                      }}
                    >
                      <div className="flex items-center gap-3">
                        {/* Avatar */}
                        <div
                          className="w-10 h-10 rounded-xl flex items-center justify-center text-xs font-bold shrink-0"
                          style={{ background: colors.accent, color: colors.bgPage }}
                        >
                          {(applicant.name || "U").split(" ").map((n: string) => n[0]).join("")}
                        </div>
                        {/* Info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span
                              className="text-sm font-semibold truncate"
                              style={{ color: isSelected ? colors.accent : colors.textPrimary }}
                            >
                              {applicant.name || "Unknown"}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 mt-1">
                            <span
                              className="text-[11px] truncate"
                              style={{ color: colors.textMuted }}
                            >
                              {applicant.subject}
                            </span>
                            <span style={{ color: colors.textFaint }}>·</span>
                            <span
                              className="text-[11px]"
                              style={{ color: colors.textMuted }}
                            >
                              {applicant.experience}y exp
                            </span>
                          </div>
                        </div>
                        {/* Status Badge */}
                        <span
                          className="px-2 py-0.5 rounded text-[10px] font-bold capitalize shrink-0"
                          style={{
                            background: `${appStatusCfg.color}18`,
                            color: appStatusCfg.color,
                          }}
                        >
                          {appStatusCfg.label}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ─── Applicant Detail Modal ──────────────────────── */}
      {showProfile && selectedApplicant && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50"
          onClick={() => { setShowProfile(false); setSelectedApplicant(null); }}
        >
          <div
            className="rounded-2xl w-full max-w-lg max-h-[85vh] overflow-y-auto border"
            style={{ backgroundColor: colors.bgCard, borderColor: colors.borderColor }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div
              className="px-6 py-4 flex items-center justify-between sticky top-0 z-10"
              style={{ backgroundColor: colors.bgCard, borderBottom: `1px solid ${colors.borderColor}` }}
            >
              <div className="flex items-center gap-3">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold"
                  style={{ background: colors.accent, color: colors.bgPage }}
                >
                  {(selectedApplicant.name || "U").split(" ").map((n: string) => n[0]).join("")}
                </div>
                <div>
                  <h2 className="text-lg font-bold" style={{ color: colors.textPrimary }}>
                    {getTutorDisplayName(selectedApplicant)}
                  </h2>
                  <span
                    className="text-xs px-2 py-0.5 rounded-full font-medium capitalize"
                    style={{
                      background: `${STATUS_CONFIG[selectedApplicant.status]?.color ?? colors.textMuted}18`,
                      color: STATUS_CONFIG[selectedApplicant.status]?.color ?? colors.textMuted,
                    }}
                  >
                    {STATUS_CONFIG[selectedApplicant.status]?.label ?? selectedApplicant.status}
                  </span>
                </div>
              </div>
              <button
                onClick={() => { setShowProfile(false); setSelectedApplicant(null); }}
                className="p-2 rounded-lg transition-colors hover:opacity-75"
                style={{ color: colors.textMuted }}
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-5">
              {/* Contact Info */}
              <div
                className="rounded-xl p-4 space-y-3"
                style={{ background: colors.bgInput, border: `1px solid ${colors.borderColor}` }}
              >
                <div className="flex items-center gap-3">
                  <Mail size={14} style={{ color: colors.textMuted }} />
                  <a
                    href={`mailto:${selectedApplicant.email}`}
                    className="text-sm font-medium hover:underline"
                    style={{ color: colors.accent }}
                  >
                    {selectedApplicant.email}
                  </a>
                </div>
                {/* Location from tutor profile */}
                {selectedApplicant.tutorProfile?.location && (
                  <div className="flex items-center gap-3">
                    <MapPin size={14} style={{ color: colors.textMuted }} />
                    <span className="text-sm font-medium" style={{ color: colors.textPrimary }}>
                      {selectedApplicant.tutorProfile.location}
                    </span>
                  </div>
                )}
                {/* Phone - currently not stored in schema */}
                {selectedApplicant.phone && (
                  <div className="flex items-center gap-3">
                    <Phone size={14} style={{ color: colors.textMuted }} />
                    <a
                      href={`tel:${selectedApplicant.phone}`}
                      className="text-sm font-medium hover:underline"
                      style={{ color: colors.accent }}
                    >
                      {selectedApplicant.phone}
                    </a>
                  </div>
                )}
              </div>

              {/* Professional Info */}
              <div
                className="rounded-xl p-4 space-y-3"
                style={{ background: colors.bgInput, border: `1px solid ${colors.borderColor}` }}
              >
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 rounded flex items-center justify-center" style={{ background: colors.accentBg }}>
                    <Briefcase size={12} style={{ color: colors.accent }} />
                  </div>
                  <div>
                    <div className="text-[10px] uppercase tracking-wider" style={{ color: colors.textFaint }}>Subjects</div>
                    <p className="text-sm font-medium" style={{ color: colors.textPrimary }}>
                      {selectedApplicant.tutorProfile?.subjects?.join(", ") || selectedApplicant.subject || "—"}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 rounded flex items-center justify-center" style={{ background: colors.badgePurpleBg }}>
                    <Star size={12} style={{ color: colors.badgePurpleColor }} />
                  </div>
                  <div>
                    <div className="text-[10px] uppercase tracking-wider" style={{ color: colors.textFaint }}>Experience</div>
                    <p className="text-sm font-medium" style={{ color: colors.textPrimary }}>
                      {selectedApplicant.tutorProfile?.experience ?? selectedApplicant.experience} years
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 rounded flex items-center justify-center" style={{ background: colors.badgeInfoBg }}>
                    <GraduationCap size={12} style={{ color: colors.badgeInfoColor }} />
                  </div>
                  <div>
                    <div className="text-[10px] uppercase tracking-wider" style={{ color: colors.textFaint }}>Education</div>
                    <p className="text-sm font-medium" style={{ color: colors.textPrimary }}>
                      {selectedApplicant.tutorProfile?.education || selectedApplicant.education || "—"}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 rounded flex items-center justify-center" style={{ background: colors.badgePendingBg }}>
                    <Calendar size={12} style={{ color: colors.badgePendingColor }} />
                  </div>
                  <div>
                    <div className="text-[10px] uppercase tracking-wider" style={{ color: colors.textFaint }}>Applied</div>
                    <p className="text-sm font-medium" style={{ color: colors.textPrimary }}>
                      {new Date(selectedApplicant.appliedAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </div>

              {/* Verified Education Entries */}
              {selectedApplicant.educationEntries && selectedApplicant.educationEntries.length > 0 && (
                <div>
                  <div className="text-[10px] uppercase tracking-wider mb-2 font-medium" style={{ color: colors.textFaint }}>
                    Verified Education
                  </div>
                  <div className="space-y-2">
                    {selectedApplicant.educationEntries
                      .filter((e) => e.status === "approved")
                      .map((entry) => (
                        <div
                          key={entry.id}
                          className="rounded-xl p-3 flex items-start gap-3"
                          style={{ background: colors.bgInput, border: `1px solid ${colors.borderColor}` }}
                        >
                          <CheckCircle size={14} className="mt-0.5 shrink-0" style={{ color: colors.accent }} />
                          <div>
                            <p className="text-sm font-medium" style={{ color: colors.textPrimary }}>{entry.title}</p>
                            {entry.description && (
                              <p className="text-xs mt-0.5" style={{ color: colors.textMuted }}>{entry.description}</p>
                            )}
                            <p className="text-[10px] mt-1" style={{ color: colors.textFaint }}>
                              Verified on {entry.reviewedAt ? new Date(entry.reviewedAt).toLocaleDateString() : "—"}
                            </p>
                          </div>
                        </div>
                      ))}
                    {selectedApplicant.educationEntries.filter((e) => e.status === "approved").length === 0 && (
                      <p className="text-xs" style={{ color: colors.textMuted }}>No verified education entries</p>
                    )}
                  </div>
                </div>
              )}

              {/* Documents */}
              <div>
                <div className="text-[10px] uppercase tracking-wider mb-2 font-medium" style={{ color: colors.textFaint }}>
                  Documents
                </div>
                {loadingDocs ? (
                  <div className="flex items-center gap-2 py-3">
                    <Loader2 size={14} className="animate-spin" style={{ color: colors.textMuted }} />
                    <span className="text-xs" style={{ color: colors.textMuted }}>Loading documents...</span>
                  </div>
                ) : tutorDocuments.length === 0 ? (
                  <p className="text-xs" style={{ color: colors.textMuted }}>No documents uploaded</p>
                ) : (
                  <div className="space-y-2">
                    {tutorDocuments.map((doc) => (
                      <div
                        key={doc.id}
                        className="rounded-xl p-3 flex items-center justify-between"
                        style={{ background: colors.bgInput, border: `1px solid ${colors.borderColor}` }}
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <FileText size={14} className="shrink-0" style={{ color: colors.textMuted }} />
                          <div className="min-w-0">
                            <p className="text-sm font-medium truncate" style={{ color: colors.textPrimary }}>{doc.title}</p>
                            <p className="text-[10px]" style={{ color: colors.textFaint }}>{doc.fileName}</p>
                          </div>
                        </div>
                        <span
                          className="px-2 py-0.5 rounded text-[10px] font-bold capitalize shrink-0 ml-2"
                          style={{
                            background: doc.status === "verified" ? `${colors.accent}18` : doc.status === "rejected" ? `${colors.dangerColor}18` : `${colors.textMuted}18`,
                            color: doc.status === "verified" ? colors.accent : doc.status === "rejected" ? colors.dangerColor : colors.textMuted,
                          }}
                        >
                          {doc.status}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Status Action Buttons */}
              <div>
                <div className="text-[10px] uppercase tracking-wider mb-2 font-medium" style={{ color: colors.textFaint }}>
                  Change Status
                </div>
                <div className="flex flex-wrap gap-2">
                  {ACTIONS.map((action) => {
                    const isActive = selectedApplicant.status === action.status;
                    return (
                      <button
                        key={action.status}
                        onClick={() => handleStatusChange(selectedApplicant.id, action.status)}
                        className="px-3.5 py-2 rounded-xl text-xs font-semibold transition-all"
                        style={{
                          background: isActive ? `${action.color}25` : `${action.color}10`,
                          color: action.color,
                          border: `1.5px solid ${isActive ? action.color : `${action.color}40`}`,
                          opacity: isActive ? 1 : 0.85,
                        }}
                      >
                        {action.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Quick Actions */}
              <div
                className="flex gap-3 pt-4"
                style={{ borderTop: `1px solid ${colors.borderColor}` }}
              >
                <a
                  href={`mailto:${selectedApplicant.email}`}
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium transition-colors"
                  style={{ background: colors.accent, color: colors.bgPage }}
                >
                  <Mail size={14} /> Send Email
                </a>
                {selectedApplicant.phone && (
                  <a
                    href={`tel:${selectedApplicant.phone}`}
                    className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium border transition-colors"
                    style={{ borderColor: colors.accent, color: colors.accent, backgroundColor: "transparent" }}
                  >
                    <Phone size={14} /> Call
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Tiny helper component for section icon ─────────────────────
function FileTextIcon({ color }: { color: string }) {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" />
      <line x1="16" y1="13" x2="8" y2="13" />
      <line x1="16" y1="17" x2="8" y2="17" />
      <polyline points="10 9 9 9 8 9" />
    </svg>
  );
}
