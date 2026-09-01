import { useTheme } from "@/context/ThemeContext";
import { supabase } from "@/lib/supabase";
import { useState, useEffect } from "react";
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
} from "lucide-react";
import type { TeachingMode } from "@/types";

const API_BASE = import.meta.env.VITE_API_URL || "/api";

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
}

interface VacancyDetail {
  id: string;
  title: string;
  description: string;
  subject: string;
  grade: string;
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

  // Edit mode state
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const [editForm, setEditForm] = useState({
    title: "",
    description: "",
    subject: "",
    grade: "",
    requiredEducation: "",
    requiredExperience: 0,
    location: "",
    teachingMode: "in-person" as TeachingMode,
    salary: "",
    availability: "",
    deadline: "",
  });

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
          // Initialize edit form
          setEditForm({
            title: vacancyData.title || "",
            description: vacancyData.description || "",
            subject: vacancyData.subject || "",
            grade: vacancyData.grade || "",
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
        // token already declared above

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

  const handleSave = async () => {
    if (!vacancyId || !editForm.title || !editForm.subject || !editForm.grade) return;

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
        subject: vacancy.subject,
        grade: vacancy.grade,
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

  const inputStyle = {
    background: colors.bgInput,
    border: `1px solid ${colors.borderColor}`,
    color: colors.textPrimary,
  };

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

  return (
    <div className="space-y-6">
      {/* Toast */}
      {toast && (
        <div
          className="fixed top-6 right-6 z-50 px-5 py-3 rounded-xl flex items-center gap-3 shadow-xl"
          style={{
            background: toast.type === "success" ? "rgba(34,197,94,0.15)" : "rgba(239,68,68,0.15)",
            border: `1px solid ${toast.type === "success" ? "rgba(34,197,94,0.3)" : "rgba(239,68,68,0.3)"}`,
            color: toast.type === "success" ? "rgb(34,197,94)" : "rgb(239,68,68)",
          }}
        >
          <CheckCircle size={18} />
          <span className="text-sm font-medium">{toast.message}</span>
        </div>
      )}

      {/* Back Button */}
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-sm font-medium"
        style={{ color: colors.accent }}
      >
        <ArrowLeft size={16} /> Back to My Posts
      </button>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Vacancy Details - Left Column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Header Card */}
          <div
            className="rounded-2xl p-6 border"
            style={{ backgroundColor: colors.bgCard, borderColor: colors.borderColor }}
          >
            {/* Title & Status & Edit Button */}
            <div className="flex items-start justify-between gap-4 mb-4">
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
                    <h1 className="text-3xl font-bold mb-2" style={{ color: colors.textPrimary }}>
                      {vacancy.title}
                    </h1>
                    <p style={{ color: colors.textSecondary }}>
                      {vacancy.subject} • Grade {vacancy.grade}
                    </p>
                  </>
                )}
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <span
                  className="px-3 py-1 rounded-full text-sm font-medium capitalize whitespace-nowrap"
                  style={{
                    backgroundColor: vacancy.status === "open" ? "rgba(34,197,94,0.1)" : "rgba(107,114,128,0.1)",
                    color: vacancy.status === "open" ? "rgb(34,197,94)" : colors.textMuted,
                  }}
                >
                  {vacancy.status}
                </span>
                {!editing ? (
                  <button
                    onClick={() => setEditing(true)}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all"
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
                      disabled={saving || !editForm.title || !editForm.subject || !editForm.grade}
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

            {/* Key Info Grid */}
            <div
              className="grid grid-cols-2 gap-4 py-4"
              style={{ borderTop: `1px solid ${colors.borderColor}`, borderBottom: `1px solid ${colors.borderColor}` }}
            >
              {/* Subject & Grade (edit mode) */}
              {editing && (
                <>
                  <div>
                    <label className="block text-xs mb-1.5" style={{ color: colors.textMuted }}>Subject *</label>
                    <input
                      value={editForm.subject}
                      onChange={(e) => setEditForm({ ...editForm, subject: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl text-sm focus:outline-none"
                      style={inputStyle}
                    />
                  </div>
                  <div>
                    <label className="block text-xs mb-1.5" style={{ color: colors.textMuted }}>Grade *</label>
                    <input
                      value={editForm.grade}
                      onChange={(e) => setEditForm({ ...editForm, grade: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl text-sm focus:outline-none"
                      style={inputStyle}
                    />
                  </div>
                </>
              )}

              {/* Location */}
              <div>
                <label className="block text-xs mb-1.5" style={{ color: colors.textMuted }}>Location</label>
                {editing ? (
                  <input
                    value={editForm.location}
                    onChange={(e) => setEditForm({ ...editForm, location: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl text-sm focus:outline-none"
                    style={inputStyle}
                  />
                ) : (
                  <div className="flex items-center gap-2" style={{ color: colors.textPrimary }}>
                    <MapPin size={16} />
                    <span className="font-medium">{vacancy.location}</span>
                  </div>
                )}
              </div>

              {/* Teaching Mode */}
              <div>
                <label className="block text-xs mb-1.5" style={{ color: colors.textMuted }}>Teaching Mode</label>
                {editing ? (
                  <select
                    value={editForm.teachingMode}
                    onChange={(e) => setEditForm({ ...editForm, teachingMode: e.target.value as TeachingMode })}
                    className="w-full px-3 py-2 rounded-xl text-sm focus:outline-none"
                    style={inputStyle}
                  >
                    <option value="in-person">In-person</option>
                    <option value="online">Online</option>
                    <option value="hybrid">Hybrid</option>
                  </select>
                ) : (
                  <div className="flex items-center gap-2" style={{ color: colors.textPrimary }}>
                    <Briefcase size={16} />
                    <span className="font-medium capitalize">{vacancy.teachingMode}</span>
                  </div>
                )}
              </div>

              {/* Required Experience */}
              <div>
                <label className="block text-xs mb-1.5" style={{ color: colors.textMuted }}>Experience (years)</label>
                {editing ? (
                  <input
                    type="number"
                    min={0}
                    value={editForm.requiredExperience}
                    onChange={(e) => setEditForm({ ...editForm, requiredExperience: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl text-sm focus:outline-none"
                    style={inputStyle}
                  />
                ) : (
                  <div className="flex items-center gap-2" style={{ color: colors.textPrimary }}>
                    <User size={16} />
                    <span className="font-medium">{vacancy.requiredExperience}+ years</span>
                  </div>
                )}
              </div>

              {/* Deadline */}
              <div>
                <label className="block text-xs mb-1.5" style={{ color: colors.textMuted }}>Deadline</label>
                {editing ? (
                  <input
                    type="date"
                    value={editForm.deadline}
                    onChange={(e) => setEditForm({ ...editForm, deadline: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl text-sm focus:outline-none"
                    style={inputStyle}
                  />
                ) : (
                  <div className="flex items-center gap-2" style={{ color: colors.textPrimary }}>
                    <Clock size={16} />
                    <span className="font-medium">
                      {vacancy.deadline ? new Date(vacancy.deadline).toLocaleDateString() : "No deadline"}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Salary */}
            <div className="mt-4">
              <label className="block text-xs mb-1.5" style={{ color: colors.textMuted }}>Salary</label>
              {editing ? (
                <input
                  value={editForm.salary}
                  onChange={(e) => setEditForm({ ...editForm, salary: e.target.value })}
                  placeholder="e.g. 5,000 ETB/month"
                  className="w-full px-3 py-2 rounded-xl text-sm focus:outline-none"
                  style={inputStyle}
                />
              ) : vacancy.salary ? (
                <div className="flex items-center gap-2 text-lg font-bold" style={{ color: colors.accent }}>
                  <DollarSign size={20} /> {vacancy.salary}
                </div>
              ) : (
                <p className="text-sm" style={{ color: colors.textMuted }}>Not specified</p>
              )}
            </div>

            {/* Required Education */}
            <div className="mt-4">
              <label className="block text-xs mb-1.5" style={{ color: colors.textMuted }}>Required Education</label>
              {editing ? (
                <input
                  value={editForm.requiredEducation}
                  onChange={(e) => setEditForm({ ...editForm, requiredEducation: e.target.value })}
                  placeholder="e.g. Bachelor's degree"
                  className="w-full px-3 py-2 rounded-xl text-sm focus:outline-none"
                  style={inputStyle}
                />
              ) : (
                <p className="text-sm font-medium" style={{ color: colors.textPrimary }}>
                  {vacancy.requiredEducation || "Not specified"}
                </p>
              )}
            </div>

            {/* Availability */}
            <div className="mt-4">
              <label className="block text-xs mb-1.5" style={{ color: colors.textMuted }}>Availability</label>
              {editing ? (
                <input
                  value={editForm.availability}
                  onChange={(e) => setEditForm({ ...editForm, availability: e.target.value })}
                  placeholder="e.g. Weekends, Evenings"
                  className="w-full px-3 py-2 rounded-xl text-sm focus:outline-none"
                  style={inputStyle}
                />
              ) : (
                <p className="text-sm font-medium" style={{ color: colors.textPrimary }}>
                  {vacancy.availability || "Not specified"}
                </p>
              )}
            </div>
          </div>

          {/* Description */}
          <div
            className="rounded-2xl p-6 border"
            style={{ backgroundColor: colors.bgCard, borderColor: colors.borderColor }}
          >
            <h2 className="text-lg font-bold mb-4" style={{ color: colors.textPrimary }}>
              Job Description
            </h2>
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
              <p style={{ color: colors.textSecondary }} className="leading-relaxed">
                {vacancy.description || "No description provided."}
              </p>
            )}
          </div>

          {/* Requirements (read-only summary) */}
          {!editing && (
            <div
              className="rounded-2xl p-6 border"
              style={{ backgroundColor: colors.bgCard, borderColor: colors.borderColor }}
            >
              <h2 className="text-lg font-bold mb-4" style={{ color: colors.textPrimary }}>
                Requirements
              </h2>
              <div className="space-y-2">
                {vacancy.requiredEducation && (
                  <div className="flex gap-3">
                    <span className="text-lg" style={{ color: colors.accent }}>✓</span>
                    <p style={{ color: colors.textSecondary }}>
                      <span style={{ color: colors.textPrimary }} className="font-medium">Education:</span>{" "}
                      {vacancy.requiredEducation}
                    </p>
                  </div>
                )}
                <div className="flex gap-3">
                  <span className="text-lg" style={{ color: colors.accent }}>✓</span>
                  <p style={{ color: colors.textSecondary }}>
                    <span style={{ color: colors.textPrimary }} className="font-medium">Experience:</span>{" "}
                    Minimum {vacancy.requiredExperience} years
                  </p>
                </div>
                {vacancy.availability && (
                  <div className="flex gap-3">
                    <span className="text-lg" style={{ color: colors.accent }}>✓</span>
                    <p style={{ color: colors.textSecondary }}>
                      <span style={{ color: colors.textPrimary }} className="font-medium">Availability:</span>{" "}
                      {vacancy.availability}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Applicants Sidebar - Right Column */}
        <div className="lg:col-span-1">
          <div
            className="rounded-2xl p-6 border sticky top-6"
            style={{ backgroundColor: colors.bgCard, borderColor: colors.borderColor }}
          >
            <div className="flex items-center gap-2 mb-6">
              <Users size={20} style={{ color: colors.accent }} />
              <h3 className="text-lg font-bold" style={{ color: colors.textPrimary }}>
                Applicants
              </h3>
              <span
                className="ml-auto px-2.5 py-0.5 rounded-full text-sm font-bold"
                style={{ backgroundColor: colors.accent, color: colors.bgPage }}
              >
                {applicants.length}
              </span>
            </div>

            {applicants.length === 0 ? (
              <div className="text-center py-8">
                <Users size={32} style={{ color: colors.textMuted }} className="mx-auto mb-3 opacity-50" />
                <p style={{ color: colors.textMuted }} className="text-sm">No applicants yet</p>
              </div>
            ) : (
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {applicants.map((applicant) => (
                  <button
                    key={applicant.id}
                    onClick={() => {
                      setSelectedApplicant(applicant);
                      setShowProfile(true);
                    }}
                    className="w-full text-left p-3 rounded-lg transition-all hover:shadow-sm"
                    style={{
                      backgroundColor: selectedApplicant?.id === applicant.id ? colors.accentBg : colors.bgInput,
                      border: `1px solid ${selectedApplicant?.id === applicant.id ? colors.accent : colors.borderColor}`,
                    }}
                  >
                    <div
                      className="font-medium text-sm"
                      style={{ color: selectedApplicant?.id === applicant.id ? colors.accent : colors.textPrimary }}
                    >
                      {applicant.name}
                    </div>
                    <div
                      className="text-xs mt-1"
                      style={{ color: selectedApplicant?.id === applicant.id ? colors.textSecondary : colors.textMuted }}
                    >
                      {applicant.subject}
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Applicant Profile Modal */}
      {showProfile && selectedApplicant && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
          onClick={() => setShowProfile(false)}
        >
          <div
            className="rounded-2xl p-6 max-w-md w-full max-h-96 overflow-y-auto border"
            style={{ backgroundColor: colors.bgCard, borderColor: colors.borderColor }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold" style={{ color: colors.textPrimary }}>
                Applicant Profile
              </h2>
              <button onClick={() => setShowProfile(false)} style={{ color: colors.textMuted }} className="hover:opacity-75">
                ✕
              </button>
            </div>

            <div className="space-y-4">
              <div
                className="rounded-lg p-4"
                style={{ backgroundColor: colors.bgInput, border: `1px solid ${colors.borderColor}` }}
              >
                <h3 className="text-lg font-bold mb-2" style={{ color: colors.textPrimary }}>
                  {selectedApplicant.name}
                </h3>
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span style={{ color: colors.textMuted }} className="text-xs">Email:</span>
                    <a
                      href={`mailto:${selectedApplicant.email}`}
                      style={{ color: colors.accent }}
                      className="text-sm font-medium hover:underline"
                    >
                      {selectedApplicant.email}
                    </a>
                  </div>
                  <div className="flex items-center gap-2">
                    <span style={{ color: colors.textMuted }} className="text-xs">Phone:</span>
                    <a
                      href={`tel:${selectedApplicant.phone}`}
                      style={{ color: colors.accent }}
                      className="text-sm font-medium hover:underline"
                    >
                      {selectedApplicant.phone}
                    </a>
                  </div>
                </div>
              </div>

              <div
                className="rounded-lg p-4"
                style={{ backgroundColor: colors.bgInput, border: `1px solid ${colors.borderColor}` }}
              >
                <p style={{ color: colors.textMuted }} className="text-xs font-medium mb-2 uppercase">
                  Professional Info
                </p>
                <div className="space-y-2">
                  <div>
                    <span style={{ color: colors.textMuted }} className="text-xs">Subject:</span>
                    <p style={{ color: colors.textPrimary }} className="font-medium">{selectedApplicant.subject}</p>
                  </div>
                  <div>
                    <span style={{ color: colors.textMuted }} className="text-xs">Experience:</span>
                    <p style={{ color: colors.textPrimary }} className="font-medium">
                      {selectedApplicant.experience} years
                    </p>
                  </div>
                  <div>
                    <span style={{ color: colors.textMuted }} className="text-xs">Education:</span>
                    <p style={{ color: colors.textPrimary }} className="font-medium">
                      {selectedApplicant.education}
                    </p>
                  </div>
                </div>
              </div>

              <div
                className="rounded-lg p-4"
                style={{ backgroundColor: colors.bgInput, border: `1px solid ${colors.borderColor}` }}
              >
                <p style={{ color: colors.textMuted }} className="text-xs font-medium mb-2 uppercase">
                  Application
                </p>
                <div className="flex items-center justify-between">
                  <span style={{ color: colors.textMuted }} className="text-xs">Applied:</span>
                  <span style={{ color: colors.textPrimary }} className="text-sm font-medium">
                    {new Date(selectedApplicant.appliedAt).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex items-center justify-between mt-2">
                  <span style={{ color: colors.textMuted }} className="text-xs">Status:</span>
                  <span
                    className="text-xs px-2 py-1 rounded-full font-medium capitalize"
                    style={{ backgroundColor: `${colors.accent}20`, color: colors.accent }}
                  >
                    {selectedApplicant.status}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-4 border-t" style={{ borderColor: colors.borderColor }}>
                <a
                  href={`mailto:${selectedApplicant.email}`}
                  className="py-2 px-3 rounded-lg text-center text-sm font-medium transition-colors"
                  style={{ backgroundColor: colors.accent, color: colors.bgPage }}
                >
                  Send Email
                </a>
                <a
                  href={`tel:${selectedApplicant.phone}`}
                  className="py-2 px-3 rounded-lg text-center text-sm font-medium border transition-colors"
                  style={{ borderColor: colors.accent, color: colors.accent, backgroundColor: "transparent" }}
                >
                  Call
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
