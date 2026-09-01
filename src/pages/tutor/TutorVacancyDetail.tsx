import { useTheme } from "@/context/ThemeContext";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/lib/supabase";
import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import {
  ArrowLeft,
  MapPin,
  Briefcase,
  Clock,
  DollarSign,
  User,
  GraduationCap,
  Building2,
  Send,
  CheckCircle,
  Loader2,
  AlertCircle,
  Calendar,
  BookOpen,
} from "lucide-react";

const API_BASE = import.meta.env.VITE_API_URL || "/api";

interface VacancyData {
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
  organizationName: string;
  organizationLocation: string;
  organizationDescription: string;
  postedBy: string;
}

export default function TutorVacancyDetail() {
  const { vacancyId } = useParams<{ vacancyId: string }>();
  const navigate = useNavigate();
  const { colors } = useTheme();
  const { user } = useAuth();

  const [vacancy, setVacancy] = useState<VacancyData | null>(null);
  const [loading, setLoading] = useState(true);
  const [applying, setApplying] = useState(false);
  const [hasApplied, setHasApplied] = useState(false);
  const [toast, setToast] = useState<{ type: "success" | "error"; message: string } | null>(null);

  useEffect(() => {
    const fetchVacancy = async () => {
      try {
        const res = await fetch(`${API_BASE}/tutor/vacancies/${vacancyId}`);
        if (!res.ok) throw new Error("Vacancy not found");
        const data = await res.json();
        setVacancy(data);
      } catch (err) {
        console.error("Error fetching vacancy:", err);
      } finally {
        setLoading(false);
      }
    };

    if (vacancyId) fetchVacancy();
  }, [vacancyId]);

  // Check if tutor has already applied
  useEffect(() => {
    if (!user || user.role !== "tutor" || !vacancyId) return;

    const checkApplied = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        const token = session?.access_token;
        const res = await fetch(`${API_BASE}/tutor/applications`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const apps = await res.json();
          setHasApplied(apps.some((a: any) => a.vacancyId === vacancyId));
        }
      } catch (err) {
        console.error("Error checking application:", err);
      }
    };

    checkApplied();
  }, [user, vacancyId]);

  const handleApply = async () => {
    if (!user) {
      navigate("/login");
      return;
    }

    setApplying(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;
      const res = await fetch(`${API_BASE}/tutor/applications`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ vacancyId }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to apply");
      }

      setHasApplied(true);
      setToast({ type: "success", message: "Application submitted successfully!" });
      setTimeout(() => setToast(null), 4000);
    } catch (err: any) {
      setToast({ type: "error", message: err.message || "Failed to apply" });
      setTimeout(() => setToast(null), 4000);
    } finally {
      setApplying(false);
    }
  };

  const cardStyle: React.CSSProperties = {
    background: colors.bgCard,
    border: `1px solid ${colors.borderColor}`,
  };

  return (
    <div className="min-h-screen" style={{ fontFamily: "Outfit, sans-serif", background: colors.bgPage }}>
      <Navbar />

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
          {toast.type === "success" ? <CheckCircle size={18} /> : <AlertCircle size={18} />}
          <span className="text-sm font-medium">{toast.message}</span>
        </div>
      )}

      <div className="pt-24 pb-16 px-4 sm:px-6 md:px-12">
        <div className="max-w-4xl mx-auto">
          {/* Back Link */}
          <Link
            to="/vacancies"
            className="inline-flex items-center gap-2 text-sm font-medium mb-8 transition-colors hover:opacity-80"
            style={{ color: colors.accent }}
          >
            <ArrowLeft size={16} /> Back to Vacancies
          </Link>

          {/* Loading */}
          {loading && (
            <div className="flex items-center justify-center py-20">
              <Loader2 size={32} className="animate-spin" style={{ color: colors.accent }} />
            </div>
          )}

          {/* Not Found */}
          {!loading && !vacancy && (
            <div className="text-center py-20" style={cardStyle}>
              <AlertCircle size={48} className="mx-auto mb-4" style={{ color: colors.textMuted }} />
              <h2 className="text-xl font-bold mb-2" style={{ color: colors.textPrimary }}>
                Vacancy Not Found
              </h2>
              <p className="text-sm mb-6" style={{ color: colors.textSecondary }}>
                This vacancy may have been removed or is no longer available.
              </p>
              <Link
                to="/vacancies"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium"
                style={{ background: colors.accent, color: "#fff" }}
              >
                Browse Vacancies
              </Link>
            </div>
          )}

          {/* Vacancy Content */}
          {!loading && vacancy && (
            <div className="space-y-6">
              {/* Header Card */}
              <div className="rounded-2xl p-8" style={cardStyle}>
                {/* Status Badge */}
                <div className="flex items-center justify-between mb-4">
                  <span
                    className="px-3 py-1 rounded-full text-xs font-medium capitalize"
                    style={{
                      background: vacancy.status === "open" ? "rgba(34,197,94,0.1)" : "rgba(107,114,128,0.1)",
                      color: vacancy.status === "open" ? "rgb(34,197,94)" : colors.textMuted,
                    }}
                  >
                    {vacancy.status}
                  </span>
                  {vacancy.deadline && (
                    <span className="flex items-center gap-1.5 text-xs" style={{ color: colors.textMuted }}>
                      <Calendar size={12} />
                      Deadline: {new Date(vacancy.deadline).toLocaleDateString()}
                    </span>
                  )}
                </div>

                {/* Title */}
                <h1
                  className="text-3xl sm:text-4xl font-bold mb-3"
                  style={{ fontFamily: "Fraunces, serif", color: colors.textPrimary }}
                >
                  {vacancy.title}
                </h1>

                {/* Organization */}
                <div className="flex items-center gap-3 mb-6">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm"
                    style={{ background: colors.accent, color: "#fff" }}
                  >
                    {vacancy.organizationName[0]}
                  </div>
                  <div>
                    <p className="text-sm font-medium" style={{ color: colors.textPrimary }}>
                      {vacancy.organizationName}
                    </p>
                    {vacancy.organizationLocation && (
                      <p className="text-xs flex items-center gap-1" style={{ color: colors.textMuted }}>
                        <MapPin size={10} /> {vacancy.organizationLocation}
                      </p>
                    )}
                  </div>
                </div>

                {/* Quick Info Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div
                    className="rounded-xl p-3 text-center"
                    style={{ background: colors.bgInput, border: `1px solid ${colors.borderColor}` }}
                  >
                    <BookOpen size={18} className="mx-auto mb-1.5" style={{ color: colors.accent }} />
                    <p className="text-xs" style={{ color: colors.textMuted }}>Subject</p>
                    <p className="text-sm font-semibold" style={{ color: colors.textPrimary }}>
                      {vacancy.subject}
                    </p>
                  </div>
                  <div
                    className="rounded-xl p-3 text-center"
                    style={{ background: colors.bgInput, border: `1px solid ${colors.borderColor}` }}
                  >
                    <GraduationCap size={18} className="mx-auto mb-1.5" style={{ color: colors.accent }} />
                    <p className="text-xs" style={{ color: colors.textMuted }}>Grade</p>
                    <p className="text-sm font-semibold" style={{ color: colors.textPrimary }}>
                      {vacancy.grade}
                    </p>
                  </div>
                  <div
                    className="rounded-xl p-3 text-center"
                    style={{ background: colors.bgInput, border: `1px solid ${colors.borderColor}` }}
                  >
                    <MapPin size={18} className="mx-auto mb-1.5" style={{ color: colors.accent }} />
                    <p className="text-xs" style={{ color: colors.textMuted }}>Location</p>
                    <p className="text-sm font-semibold" style={{ color: colors.textPrimary }}>
                      {vacancy.location || "TBD"}
                    </p>
                  </div>
                  <div
                    className="rounded-xl p-3 text-center"
                    style={{ background: colors.bgInput, border: `1px solid ${colors.borderColor}` }}
                  >
                    <Briefcase size={18} className="mx-auto mb-1.5" style={{ color: colors.accent }} />
                    <p className="text-xs" style={{ color: colors.textMuted }}>Mode</p>
                    <p className="text-sm font-semibold capitalize" style={{ color: colors.textPrimary }}>
                      {vacancy.teachingMode}
                    </p>
                  </div>
                </div>
              </div>

              {/* Description */}
              <div className="rounded-2xl p-8" style={cardStyle}>
                <h2 className="text-lg font-bold mb-4" style={{ color: colors.textPrimary }}>
                  About This Role
                </h2>
                <p
                  className="text-sm leading-relaxed whitespace-pre-wrap"
                  style={{ color: colors.textSecondary }}
                >
                  {vacancy.description || "No description provided."}
                </p>
              </div>

              {/* Requirements & Details */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {/* Requirements */}
                <div className="rounded-2xl p-8" style={cardStyle}>
                  <h2 className="text-lg font-bold mb-4" style={{ color: colors.textPrimary }}>
                    Requirements
                  </h2>
                  <div className="space-y-3">
                    {vacancy.requiredEducation && (
                      <div className="flex items-start gap-3">
                        <div
                          className="w-6 h-6 rounded-full flex items-center justify-center shrink-0 mt-0.5"
                          style={{ background: `${colors.accent}20` }}
                        >
                          <GraduationCap size={12} style={{ color: colors.accent }} />
                        </div>
                        <div>
                          <p className="text-xs" style={{ color: colors.textMuted }}>Education</p>
                          <p className="text-sm font-medium" style={{ color: colors.textPrimary }}>
                            {vacancy.requiredEducation}
                          </p>
                        </div>
                      </div>
                    )}
                    <div className="flex items-start gap-3">
                      <div
                        className="w-6 h-6 rounded-full flex items-center justify-center shrink-0 mt-0.5"
                        style={{ background: `${colors.accent}20` }}
                      >
                        <User size={12} style={{ color: colors.accent }} />
                      </div>
                      <div>
                        <p className="text-xs" style={{ color: colors.textMuted }}>Experience</p>
                        <p className="text-sm font-medium" style={{ color: colors.textPrimary }}>
                          Minimum {vacancy.requiredExperience} years
                        </p>
                      </div>
                    </div>
                    {vacancy.availability && (
                      <div className="flex items-start gap-3">
                        <div
                          className="w-6 h-6 rounded-full flex items-center justify-center shrink-0 mt-0.5"
                          style={{ background: `${colors.accent}20` }}
                        >
                          <Clock size={12} style={{ color: colors.accent }} />
                        </div>
                        <div>
                          <p className="text-xs" style={{ color: colors.textMuted }}>Availability</p>
                          <p className="text-sm font-medium" style={{ color: colors.textPrimary }}>
                            {vacancy.availability}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Compensation */}
                <div className="rounded-2xl p-8" style={cardStyle}>
                  <h2 className="text-lg font-bold mb-4" style={{ color: colors.textPrimary }}>
                    Compensation
                  </h2>
                  {vacancy.salary ? (
                    <div className="flex items-center gap-3 mb-4">
                      <DollarSign size={24} style={{ color: colors.accent }} />
                      <span className="text-2xl font-bold" style={{ color: colors.accent }}>
                        {vacancy.salary}
                      </span>
                    </div>
                  ) : (
                    <p className="text-sm mb-4" style={{ color: colors.textMuted }}>
                      Salary negotiable
                    </p>
                  )}

                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-xs" style={{ color: colors.textSecondary }}>
                      <Calendar size={12} />
                      Posted: {new Date(vacancy.createdAt).toLocaleDateString()}
                    </div>
                    <div className="flex items-center gap-2 text-xs" style={{ color: colors.textSecondary }}>
                      <User size={12} />
                      {vacancy.applicantCount} applicant{vacancy.applicantCount !== 1 ? "s" : ""}
                    </div>
                  </div>
                </div>
              </div>

              {/* Organization Info */}
              {vacancy.organizationDescription && (
                <div className="rounded-2xl p-8" style={cardStyle}>
                  <div className="flex items-center gap-3 mb-4">
                    <Building2 size={20} style={{ color: colors.accent }} />
                    <h2 className="text-lg font-bold" style={{ color: colors.textPrimary }}>
                      About {vacancy.organizationName}
                    </h2>
                  </div>
                  <p className="text-sm leading-relaxed" style={{ color: colors.textSecondary }}>
                    {vacancy.organizationDescription}
                  </p>
                </div>
              )}

              {/* Apply Section */}
              <div
                className="rounded-2xl p-8 sticky bottom-4"
                style={{
                  ...cardStyle,
                  boxShadow: `0 -4px 20px ${colors.bgPage}`,
                }}
              >
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div>
                    <h3 className="text-lg font-bold" style={{ color: colors.textPrimary }}>
                      Interested in this position?
                    </h3>
                    <p className="text-sm" style={{ color: colors.textSecondary }}>
                      {hasApplied
                        ? "You've already applied to this vacancy."
                        : user?.role === "tutor"
                          ? "Submit your application to get started."
                          : "Log in as a tutor to apply."}
                    </p>
                  </div>

                  {hasApplied ? (
                    <div
                      className="flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-medium"
                      style={{
                        background: "rgba(34,197,94,0.1)",
                        border: "1px solid rgba(34,197,94,0.3)",
                        color: "rgb(34,197,94)",
                      }}
                    >
                      <CheckCircle size={18} /> Applied
                    </div>
                  ) : (
                    <button
                      onClick={handleApply}
                      disabled={applying}
                      className="flex items-center gap-2 px-8 py-3 rounded-xl text-sm font-semibold transition-all disabled:opacity-60"
                      style={{ background: colors.accent, color: "#fff" }}
                    >
                      {applying ? (
                        <Loader2 size={16} className="animate-spin" />
                      ) : (
                        <Send size={16} />
                      )}
                      {applying
                        ? "Submitting..."
                        : user?.role === "tutor"
                          ? "Apply Now"
                          : "Log in to Apply"}
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <Footer />
    </div>
  );
}
