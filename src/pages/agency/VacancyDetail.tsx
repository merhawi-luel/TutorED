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

// ─── Status Config ────────────────────────────────────────────
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

// ─── Interfaces ───────────────────────────────────────────────
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
  tutorId: string;
  userId?: string;
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

// ─── Component ────────────────────────────────────────────────
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

  useEffect(() => {
    if (selectedApplicant && showProfile) {
      const tutorId = selectedApplicant.tutorId || selectedApplicant.userId || selectedApplicant.id;
      fetchTutorDocuments(tutorId);
    }
  }, [selectedApplicant, showProfile, fetchTutorDocuments]);

  // ─── Document Handlers ─────────────────────────────────────
  const handleDownloadDoc = async (docId: string, fileName: string) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;
      const res = await fetch(`${API_BASE}/agency/documents/${docId}/download`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Download failed");
      const { downloadUrl } = await res.json();
      const link = document.createElement("a");
      link.href = downloadUrl;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      console.error("Download error:", err);
    }
  };

  const handlePreviewDoc = async (docId: string) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;
      const res = await fetch(`${API_BASE}/agency/documents/${docId}/preview`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Preview failed");
      const { previewUrl } = await res.json();
      window.open(previewUrl, "_blank");
    } catch (err) {
      console.error("Preview error:", err);
    }
  };

  // ─── Status Change Handler ──────────────────────────────────
  const handleStatusChange = useCallback(async (applicantId: string, newStatus: ApplicationStatus) => {
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

      setSelectedApplicant((prev) =>
        prev && prev.id === applicantId ? { ...prev, status: newStatus } : prev
      );
    } catch (err) {
      console.error("Failed to update status:", err);
      setToast({ type: "error", message: "Failed to update status" });
      setTimeout(() => setToast(null), 3000);
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

  const getTutorDisplayName = (applicant: Applicant) => {
    if (applicant.tutorProfile?.headline) return applicant.tutorProfile.headline;
    return applicant.name || "Unknown";
  };

  // ─── Loading ────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center" style={{ background: colors.bgPage }}>
        <div className="text-center">
          <div className="w-12 h-12 border-3 border-t-transparent rounded-full animate-spin mx-auto mb-3" style={{ borderColor: colors.accent, borderTopColor: "transparent" }} />
          <p className="text-sm" style={{ color: colors.textSecondary }}>Loading vacancy details...</p>
        </div>
      </div>
    );
  }

  if (!vacancy) {
    return (
      <div className="space-y-4 p-6">
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-sm font-medium" style={{ color: colors.accent }}>
          <ArrowLeft size={16} /> Back
        </button>
        <div className="rounded-xl p-12 text-center border" style={{ backgroundColor: colors.bgCard, borderColor: colors.borderColor }}>
          <p style={{ color: colors.textMuted }}>Vacancy not found</p>
        </div>
      </div>
    );
  }

  const statusCfg = STATUS_CONFIG[vacancy.status] ?? STATUS_CONFIG.applied;

  return (
    <div className="min-h-screen p-4 md:p-6 space-y-4" style={{ background: colors.bgPage }}>
      {/* ─── Toast ──────────────────────────────────────────── */}
      {toast && (
        <div
          className="fixed top-5 right-5 z-50 px-4 py-2.5 rounded-xl flex items-center gap-2 shadow-lg text-sm font-medium"
          style={{
            background: toast.type === "success" ? colors.accentBg : colors.dangerBg,
            border: `1px solid ${toast.type === "success" ? colors.accentBorder : colors.dangerBorder}`,
            color: toast.type === "success" ? colors.accent : colors.dangerColor,
          }}
        >
          <CheckCircle size={16} />
          {toast.message}
        </div>
      )}

      {/* ─── Top Bar ────────────────────────────────────────── */}
      <div
        className="rounded-xl px-4 py-3 flex items-center justify-between gap-3 flex-wrap"
        style={{ backgroundColor: colors.bgCard, border: `1px solid ${colors.borderColor}` }}
      >
        <div className="flex items-center gap-3 min-w-0">
          <button onClick={() => navigate(-1)} className="p-1.5 rounded-lg hover:opacity-70" style={{ color: colors.accent }}>
            <ArrowLeft size={18} />
          </button>
          <div className="min-w-0">
            {editing ? (
              <input
                value={editForm.title}
                onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                className="text-lg font-bold w-full px-2 py-1 rounded-lg focus:outline-none"
                style={inputStyle}
                placeholder="Vacancy title"
              />
            ) : (
              <h1 className="text-lg font-bold truncate" style={{ color: colors.textPrimary }}>{vacancy.title}</h1>
            )}
            <div className="flex flex-wrap gap-1.5 mt-1">
              {(vacancy.subjects || []).map((s) => (
                <span key={s} className="px-2 py-0.5 rounded-md text-[11px] font-medium" style={{ background: colors.accentBg, color: colors.accent }}>{s}</span>
              ))}
              {(vacancy.grades || []).map((g) => (
                <span key={g} className="px-2 py-0.5 rounded-md text-[11px] font-medium" style={{ background: colors.badgeInfoBg, color: colors.badgeInfoColor }}>{g}</span>
              ))}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <span
            className="px-3 py-1 rounded-full text-[11px] font-bold capitalize whitespace-nowrap"
            style={{ backgroundColor: statusCfg.bg, color: statusCfg.color, border: `1.5px solid ${statusCfg.color}30` }}
          >
            {statusCfg.label}
          </span>
          {!editing ? (
            <button
              onClick={() => setEditing(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all hover:opacity-80"
              style={{ background: colors.bgInput, border: `1px solid ${colors.borderColor}`, color: colors.textPrimary }}
            >
              <Pencil size={13} /> Edit
            </button>
          ) : (
            <div className="flex items-center gap-1.5">
              <button onClick={handleCancelEdit} className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium" style={{ background: colors.bgInput, border: `1px solid ${colors.borderColor}`, color: colors.textMuted }}>
                <X size={13} /> Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={saving || !editForm.title || editForm.subjects.length === 0 || editForm.grades.length === 0}
                className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium disabled:opacity-50"
                style={{ background: colors.accent, color: colors.bgPage }}
              >
                {saving ? <Loader2 size={13} className="animate-spin" /> : <Save size={13} />}
                {saving ? "Saving..." : "Save"}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* ─── Stat Cards ─────────────────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { icon: <DollarSign size={16} />, label: "Budget", value: vacancy.salary || "—", accent: colors.accent, bg: colors.accentBg },
          { icon: <MapPin size={16} />, label: "Location", value: vacancy.location || "—", accent: colors.textMuted, bg: colors.bgInput },
          { icon: <Briefcase size={16} />, label: "Mode", value: vacancy.teachingMode, accent: colors.badgePurpleColor, bg: colors.badgePurpleBg },
          { icon: <Clock size={16} />, label: "Deadline", value: vacancy.deadline ? new Date(vacancy.deadline).toLocaleDateString() : "—", accent: colors.badgePendingColor, bg: colors.badgePendingBg },
        ].map((card) => (
          <div key={card.label} className="rounded-xl px-3 py-2.5" style={{ background: colors.bgCard, border: `1px solid ${colors.borderColor}` }}>
            <div className="flex items-center gap-2 mb-1">
              <div className="w-6 h-6 rounded-md flex items-center justify-center" style={{ background: card.bg }}>{card.icon}</div>
              <span className="text-[10px] uppercase tracking-wider font-medium" style={{ color: colors.textFaint }}>{card.label}</span>
            </div>
            <p className="text-sm font-semibold truncate" style={{ color: colors.textPrimary }}>{card.value}</p>
          </div>
        ))}
      </div>

      {/* ─── Experience + Education + Availability Row ──────── */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { icon: <User size={14} />, label: "Experience", value: `${vacancy.requiredExperience}+ yrs`, bg: colors.badgeInfoBg, color: colors.badgeInfoColor },
          { icon: <GraduationCap size={14} />, label: "Education", value: vacancy.requiredEducation || "—", bg: colors.accentBg, color: colors.accent },
          { icon: <Calendar size={14} />, label: "Availability", value: vacancy.availability || "—", bg: colors.badgePendingBg, color: colors.badgePendingColor },
        ].map((card) => (
          <div key={card.label} className="rounded-xl px-3 py-2.5" style={{ background: colors.bgCard, border: `1px solid ${colors.borderColor}` }}>
            <div className="flex items-center gap-1.5 mb-1">
              <div className="w-5 h-5 rounded flex items-center justify-center" style={{ background: card.bg }}>{card.icon}</div>
              <span className="text-[10px] uppercase tracking-wider font-medium" style={{ color: colors.textFaint }}>{card.label}</span>
            </div>
            <p className="text-xs font-medium truncate" style={{ color: colors.textPrimary }}>{card.value}</p>
          </div>
        ))}
      </div>

      {/* ─── Edit Mode: Subjects & Grades ───────────────────── */}
      {editing && (
        <div className="rounded-xl p-4 space-y-4" style={{ background: colors.bgCard, border: `1px solid ${colors.borderColor}` }}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] mb-1 font-medium uppercase tracking-wider" style={{ color: colors.textFaint }}>Subjects *</label>
              <div className="flex flex-wrap gap-1 mb-2">
                {editForm.subjects.map((s) => (
                  <span key={s} className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-medium" style={{ background: colors.primaryLight, color: colors.primary }}>
                    {s}
                    <button type="button" onClick={() => setEditForm({ ...editForm, subjects: editForm.subjects.filter((x) => x !== s) })} className="hover:opacity-70"><X size={10} /></button>
                  </span>
                ))}
              </div>
              <div className="max-h-[140px] overflow-y-auto rounded-lg p-2 grid grid-cols-2 gap-1" style={{ background: colors.bgInput, border: `1px solid ${colors.borderColor}` }}>
                {ALL_SUBJECTS.map((s) => {
                  const checked = editForm.subjects.includes(s);
                  return (
                    <button key={s} type="button" onClick={() => setEditForm({ ...editForm, subjects: checked ? editForm.subjects.filter((x) => x !== s) : [...editForm.subjects, s] })} className="flex items-center gap-1.5 px-2 py-1 rounded text-[11px] text-left" style={{ background: checked ? colors.primaryLight : 'transparent', color: checked ? colors.primary : colors.textMuted }}>
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
              <label className="block text-[11px] mb-1 font-medium uppercase tracking-wider" style={{ color: colors.textFaint }}>Grades *</label>
              <div className="flex flex-wrap gap-1 mb-2">
                {editForm.grades.map((g) => (
                  <span key={g} className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-medium" style={{ background: colors.primaryLight, color: colors.primary }}>
                    {g}
                    <button type="button" onClick={() => setEditForm({ ...editForm, grades: editForm.grades.filter((x) => x !== g) })} className="hover:opacity-70"><X size={10} /></button>
                  </span>
                ))}
              </div>
              <div className="max-h-[140px] overflow-y-auto rounded-lg p-2 grid grid-cols-3 gap-1" style={{ background: colors.bgInput, border: `1px solid ${colors.borderColor}` }}>
                {ALL_GRADES.map((g) => {
                  const checked = editForm.grades.includes(g);
                  return (
                    <button key={g} type="button" onClick={() => setEditForm({ ...editForm, grades: checked ? editForm.grades.filter((x) => x !== g) : [...editForm.grades, g] })} className="flex items-center gap-1.5 px-2 py-1 rounded text-[11px] text-left" style={{ background: checked ? colors.primaryLight : 'transparent', color: checked ? colors.primary : colors.textMuted }}>
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
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div>
              <label className="block text-[10px] mb-1 uppercase tracking-wider" style={{ color: colors.textFaint }}>Location</label>
              <input value={editForm.location} onChange={(e) => setEditForm({ ...editForm, location: e.target.value })} className="w-full px-2.5 py-1.5 rounded-lg text-xs focus:outline-none" style={inputStyle} />
            </div>
            <div>
              <label className="block text-[10px] mb-1 uppercase tracking-wider" style={{ color: colors.textFaint }}>Mode</label>
              <select value={editForm.teachingMode} onChange={(e) => setEditForm({ ...editForm, teachingMode: e.target.value as TeachingMode })} className="w-full px-2.5 py-1.5 rounded-lg text-xs focus:outline-none" style={inputStyle}>
                <option value="in-person">In-person</option>
                <option value="online">Online</option>
                <option value="hybrid">Hybrid</option>
              </select>
            </div>
            <div>
              <label className="block text-[10px] mb-1 uppercase tracking-wider" style={{ color: colors.textFaint }}>Salary</label>
              <input value={editForm.salary} onChange={(e) => setEditForm({ ...editForm, salary: e.target.value })} className="w-full px-2.5 py-1.5 rounded-lg text-xs focus:outline-none" style={inputStyle} placeholder="e.g. 5,000 ETB" />
            </div>
            <div>
              <label className="block text-[10px] mb-1 uppercase tracking-wider" style={{ color: colors.textFaint }}>Deadline</label>
              <input type="date" value={editForm.deadline} onChange={(e) => setEditForm({ ...editForm, deadline: e.target.value })} className="w-full px-2.5 py-1.5 rounded-lg text-xs focus:outline-none" style={inputStyle} />
            </div>
            <div>
              <label className="block text-[10px] mb-1 uppercase tracking-wider" style={{ color: colors.textFaint }}>Experience (yrs)</label>
              <input type="number" min={0} value={editForm.requiredExperience} onChange={(e) => setEditForm({ ...editForm, requiredExperience: Number(e.target.value) })} className="w-full px-2.5 py-1.5 rounded-lg text-xs focus:outline-none" style={inputStyle} />
            </div>
            <div>
              <label className="block text-[10px] mb-1 uppercase tracking-wider" style={{ color: colors.textFaint }}>Education</label>
              <input value={editForm.requiredEducation} onChange={(e) => setEditForm({ ...editForm, requiredEducation: e.target.value })} className="w-full px-2.5 py-1.5 rounded-lg text-xs focus:outline-none" style={inputStyle} placeholder="e.g. Bachelor's" />
            </div>
            <div>
              <label className="block text-[10px] mb-1 uppercase tracking-wider" style={{ color: colors.textFaint }}>Availability</label>
              <input value={editForm.availability} onChange={(e) => setEditForm({ ...editForm, availability: e.target.value })} className="w-full px-2.5 py-1.5 rounded-lg text-xs focus:outline-none" style={inputStyle} placeholder="e.g. Weekends" />
            </div>
          </div>
        </div>
      )}

      {/* ─── Two-Column Main Content ────────────────────────── */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        {/* Left Column */}
        <div className="xl:col-span-2 space-y-4">
          {/* Description */}
          <div className="rounded-xl overflow-hidden" style={{ background: colors.bgCard, border: `1px solid ${colors.borderColor}` }}>
            <div className="px-4 py-2.5 flex items-center gap-2" style={{ borderBottom: `1px solid ${colors.borderColor}` }}>
              <FileText size={14} style={{ color: colors.accent }} />
              <h2 className="text-sm font-bold" style={{ color: colors.textPrimary }}>Job Description</h2>
            </div>
            <div className="p-4">
              {editing ? (
                <textarea
                  value={editForm.description}
                  onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                  rows={4}
                  placeholder="Describe the role..."
                  className="w-full px-3 py-2 rounded-lg text-sm focus:outline-none resize-none"
                  style={inputStyle}
                />
              ) : (
                <p className="text-sm leading-relaxed" style={{ color: colors.textSecondary }}>
                  {vacancy.description || "No description provided."}
                </p>
              )}
            </div>
          </div>

          {/* Requirements */}
          {!editing && (
            <div className="rounded-xl overflow-hidden" style={{ background: colors.bgCard, border: `1px solid ${colors.borderColor}` }}>
              <div className="px-4 py-2.5 flex items-center gap-2" style={{ borderBottom: `1px solid ${colors.borderColor}` }}>
                <CheckCircle size={14} style={{ color: colors.badgeInfoColor }} />
                <h2 className="text-sm font-bold" style={{ color: colors.textPrimary }}>Requirements</h2>
              </div>
              <div className="p-4 grid grid-cols-1 sm:grid-cols-3 gap-3">
                {vacancy.requiredEducation && (
                  <div className="flex items-center gap-2.5">
                    <div className="w-6 h-6 rounded-md flex items-center justify-center shrink-0" style={{ background: colors.accentBg }}>
                      <GraduationCap size={12} style={{ color: colors.accent }} />
                    </div>
                    <div>
                      <span className="text-[10px] uppercase tracking-wider" style={{ color: colors.textFaint }}>Education</span>
                      <p className="text-xs font-medium" style={{ color: colors.textPrimary }}>{vacancy.requiredEducation}</p>
                    </div>
                  </div>
                )}
                <div className="flex items-center gap-2.5">
                  <div className="w-6 h-6 rounded-md flex items-center justify-center shrink-0" style={{ background: colors.badgePurpleBg }}>
                    <Briefcase size={12} style={{ color: colors.badgePurpleColor }} />
                  </div>
                  <div>
                    <span className="text-[10px] uppercase tracking-wider" style={{ color: colors.textFaint }}>Experience</span>
                    <p className="text-xs font-medium" style={{ color: colors.textPrimary }}>Min {vacancy.requiredExperience} yrs</p>
                  </div>
                </div>
                {vacancy.availability && (
                  <div className="flex items-center gap-2.5">
                    <div className="w-6 h-6 rounded-md flex items-center justify-center shrink-0" style={{ background: colors.badgePendingBg }}>
                      <Clock size={12} style={{ color: colors.badgePendingColor }} />
                    </div>
                    <div>
                      <span className="text-[10px] uppercase tracking-wider" style={{ color: colors.textFaint }}>Availability</span>
                      <p className="text-xs font-medium" style={{ color: colors.textPrimary }}>{vacancy.availability}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Applicants */}
        <div className="xl:col-span-1">
          <div
            className="xl:sticky xl:top-4 rounded-xl overflow-hidden flex flex-col"
            style={{ background: colors.bgCard, border: `1px solid ${colors.borderColor}`, maxHeight: "calc(100vh - 170px)" }}
          >
            {/* Sidebar Header */}
            <div className="px-4 py-3 flex items-center gap-2 shrink-0" style={{ borderBottom: `1px solid ${colors.borderColor}` }}>
              <Users size={14} style={{ color: colors.accent }} />
              <h3 className="text-sm font-bold" style={{ color: colors.textPrimary }}>Applicants</h3>
              <span className="ml-auto px-2 py-0.5 rounded-full text-[11px] font-bold" style={{ backgroundColor: colors.accent, color: colors.bgPage }}>
                {applicants.length}
              </span>
            </div>

            {/* Applicant List */}
            {applicants.length === 0 ? (
              <div className="text-center py-10 px-4">
                <Users size={28} style={{ color: colors.textFaint }} className="mx-auto mb-2" />
                <p className="text-xs font-medium" style={{ color: colors.textMuted }}>No applicants yet</p>
              </div>
            ) : (
              <div className="flex-1 overflow-y-auto">
                {applicants.map((applicant) => {
                  const appStatusCfg = STATUS_CONFIG[applicant.status] ?? STATUS_CONFIG.applied;
                  const isSelected = selectedApplicant?.id === applicant.id;
                  return (
                    <button
                      key={applicant.id}
                      onClick={() => { setSelectedApplicant(applicant); setShowProfile(true); }}
                      className="w-full text-left px-4 py-3 transition-all border-b last:border-b-0"
                      style={{ background: isSelected ? colors.accentBg : "transparent", borderColor: colors.borderSubtle }}
                    >
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg flex items-center justify-center text-[11px] font-bold shrink-0" style={{ background: colors.accent, color: colors.bgPage }}>
                          {(applicant.name || "U").split(" ").map((n: string) => n[0]).join("")}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1.5">
                            <span className="text-xs font-semibold truncate" style={{ color: isSelected ? colors.accent : colors.textPrimary }}>
                              {applicant.name || "Unknown"}
                            </span>
                          </div>
                          <div className="flex items-center gap-1.5 mt-0.5">
                            <span className="text-[10px] truncate" style={{ color: colors.textMuted }}>{applicant.subject}</span>
                            <span style={{ color: colors.textFaint }}>·</span>
                            <span className="text-[10px]" style={{ color: colors.textMuted }}>{applicant.experience}y</span>
                          </div>
                        </div>
                        <span
                          className="px-1.5 py-0.5 rounded text-[9px] font-bold capitalize shrink-0"
                          style={{ background: `${appStatusCfg.color}18`, color: appStatusCfg.color }}
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
            className="rounded-2xl w-full max-w-lg max-h-[92vh] overflow-y-auto border"
            style={{ backgroundColor: colors.bgCard, borderColor: colors.borderColor }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div
              className="px-5 py-3 flex items-center justify-between sticky top-0 z-10"
              style={{ backgroundColor: colors.bgCard, borderBottom: `1px solid ${colors.borderColor}` }}
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center text-xs font-bold" style={{ background: colors.accent, color: colors.bgPage }}>
                  {(selectedApplicant.name || "U").split(" ").map((n: string) => n[0]).join("")}
                </div>
                <div>
                  <h2 className="text-sm font-bold" style={{ color: colors.textPrimary }}>{getTutorDisplayName(selectedApplicant)}</h2>
                  <span className="text-[10px] px-1.5 py-0.5 rounded-full font-medium capitalize" style={{ background: `${STATUS_CONFIG[selectedApplicant.status]?.color ?? colors.textMuted}18`, color: STATUS_CONFIG[selectedApplicant.status]?.color ?? colors.textMuted }}>
                    {STATUS_CONFIG[selectedApplicant.status]?.label ?? selectedApplicant.status}
                  </span>
                </div>
              </div>
              <button onClick={() => { setShowProfile(false); setSelectedApplicant(null); }} className="p-1.5 rounded-lg hover:opacity-75" style={{ color: colors.textMuted }}>
                <X size={16} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-5 space-y-4">
              {/* Contact */}
              <div className="rounded-xl p-3 space-y-2" style={{ background: colors.bgInput, border: `1px solid ${colors.borderColor}` }}>
                <div className="flex items-center gap-2.5">
                  <Mail size={13} style={{ color: colors.textMuted }} />
                  <a href={`mailto:${selectedApplicant.email}`} className="text-xs font-medium hover:underline" style={{ color: colors.accent }}>{selectedApplicant.email}</a>
                </div>
                {selectedApplicant.phone && (
                  <div className="flex items-center gap-2.5">
                    <Phone size={13} style={{ color: colors.textMuted }} />
                    <a href={`tel:${selectedApplicant.phone}`} className="text-xs font-medium hover:underline" style={{ color: colors.accent }}>{selectedApplicant.phone}</a>
                  </div>
                )}
                {selectedApplicant.tutorProfile?.location && (
                  <div className="flex items-center gap-2.5">
                    <MapPin size={13} style={{ color: colors.textMuted }} />
                    <span className="text-xs font-medium" style={{ color: colors.textPrimary }}>{selectedApplicant.tutorProfile.location}</span>
                  </div>
                )}
              </div>

              {/* Professional Info */}
              <div className="rounded-xl p-3 space-y-2" style={{ background: colors.bgInput, border: `1px solid ${colors.borderColor}` }}>
                {[
                  { icon: <Briefcase size={12} />, label: "Subjects", value: selectedApplicant.tutorProfile?.subjects?.join(", ") || selectedApplicant.subject || "—" },
                  { icon: <Star size={12} />, label: "Experience", value: `${selectedApplicant.tutorProfile?.experience ?? selectedApplicant.experience} years` },
                  { icon: <GraduationCap size={12} />, label: "Education", value: selectedApplicant.tutorProfile?.education || selectedApplicant.education || "—" },
                  { icon: <Calendar size={12} />, label: "Applied", value: new Date(selectedApplicant.appliedAt).toLocaleDateString() },
                ].map((item) => (
                  <div key={item.label} className="flex items-center gap-2.5">
                    <div className="w-5 h-5 rounded flex items-center justify-center shrink-0" style={{ background: colors.accentBg }}>{item.icon}</div>
                    <div>
                      <span className="text-[9px] uppercase tracking-wider" style={{ color: colors.textFaint }}>{item.label}</span>
                      <p className="text-xs font-medium" style={{ color: colors.textPrimary }}>{item.value}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Verified Education Entries */}
              {selectedApplicant.educationEntries && selectedApplicant.educationEntries.filter((e) => e.status === "approved").length > 0 && (
                <div>
                  <div className="text-[10px] uppercase tracking-wider mb-1.5 font-medium" style={{ color: colors.textFaint }}>Verified Education</div>
                  <div className="space-y-1.5">
                    {selectedApplicant.educationEntries
                      .filter((e) => e.status === "approved")
                      .map((entry) => (
                        <div key={entry.id} className="rounded-lg p-2.5 flex items-start gap-2" style={{ background: colors.bgInput, border: `1px solid ${colors.borderColor}` }}>
                          <CheckCircle size={12} className="mt-0.5 shrink-0" style={{ color: colors.accent }} />
                          <div>
                            <p className="text-xs font-medium" style={{ color: colors.textPrimary }}>{entry.title}</p>
                            {entry.description && <p className="text-[10px] mt-0.5" style={{ color: colors.textMuted }}>{entry.description}</p>}
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              )}

              {/* Documents */}
              <div>
                <div className="text-[10px] uppercase tracking-wider mb-1.5 font-medium" style={{ color: colors.textFaint }}>Documents</div>
                {loadingDocs ? (
                  <div className="flex items-center gap-2 py-2">
                    <Loader2 size={12} className="animate-spin" style={{ color: colors.textMuted }} />
                    <span className="text-[11px]" style={{ color: colors.textMuted }}>Loading...</span>
                  </div>
                ) : tutorDocuments.length === 0 ? (
                  <p className="text-[11px]" style={{ color: colors.textMuted }}>No documents uploaded</p>
                ) : (
                  <div className="space-y-1.5">
                    {tutorDocuments.map((doc) => (
                      <div key={doc.id} className="rounded-lg p-2.5 flex items-center justify-between gap-2" style={{ background: colors.bgInput, border: `1px solid ${colors.borderColor}` }}>
                        <div className="flex items-center gap-2 min-w-0">
                          <FileText size={12} className="shrink-0" style={{ color: colors.textMuted }} />
                          <div className="min-w-0">
                            <p className="text-xs font-medium truncate" style={{ color: colors.textPrimary }}>{doc.title}</p>
                            <p className="text-[9px]" style={{ color: colors.textFaint }}>{doc.fileName}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-1 shrink-0">
                          <span className="px-1.5 py-0.5 rounded text-[9px] font-bold capitalize" style={{ background: doc.status === "verified" ? `${colors.accent}18` : `${colors.textMuted}18`, color: doc.status === "verified" ? colors.accent : colors.textMuted }}>
                            {doc.status}
                          </span>
                          <button onClick={() => handlePreviewDoc(doc.id)} className="p-1 rounded hover:opacity-75" title="Preview"><Eye size={12} style={{ color: colors.textMuted }} /></button>
                          <button onClick={() => handleDownloadDoc(doc.id, doc.fileName)} className="p-1 rounded hover:opacity-75" title="Download"><Download size={12} style={{ color: colors.textMuted }} /></button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Status Actions */}
              <div>
                <div className="text-[10px] uppercase tracking-wider mb-1.5 font-medium" style={{ color: colors.textFaint }}>Change Status</div>
                <div className="flex flex-wrap gap-1.5">
                  {ACTIONS.map((action) => {
                    const isActive = selectedApplicant.status === action.status;
                    return (
                      <button
                        key={action.status}
                        onClick={() => handleStatusChange(selectedApplicant.id, action.status)}
                        className="px-3 py-1.5 rounded-lg text-[11px] font-semibold transition-all"
                        style={{ background: isActive ? `${action.color}25` : `${action.color}10`, color: action.color, border: `1.5px solid ${isActive ? action.color : `${action.color}40`}` }}
                      >
                        {action.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Contact Buttons */}
              <div className="flex gap-2 pt-3" style={{ borderTop: `1px solid ${colors.borderColor}` }}>
                <a href={`mailto:${selectedApplicant.email}`} className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-medium" style={{ background: colors.accent, color: colors.bgPage }}>
                  <Mail size={12} /> Email
                </a>
                {selectedApplicant.phone && (
                  <a href={`tel:${selectedApplicant.phone}`} className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-medium border" style={{ borderColor: colors.accent, color: colors.accent }}>
                    <Phone size={12} /> Call
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
