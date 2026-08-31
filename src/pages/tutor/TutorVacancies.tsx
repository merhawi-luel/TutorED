import { useState } from "react";
import { useData } from "@/context/DataContext";
import { useTheme } from "@/context/ThemeContext";
import { useInView } from "@/hooks/useInView";
import ApplyConsentModal from "@/components/shared/ApplyConsentModal";
import {
  Search,
  MapPin,
  Clock,
  DollarSign,
  Users,
  Briefcase,
  CheckCircle2,
  Send,
} from "lucide-react";

const FILTER_SUBJECTS = ["All", "Mathematics", "Physics", "Science", "English", "Computer Science"];
const FILTER_MODES: { value: string; label: string }[] = [
  { value: "all", label: "All Modes" },
  { value: "in-person", label: "In-person" },
  { value: "online", label: "Online" },
  { value: "hybrid", label: "Hybrid" },
];

export default function TutorVacancies() {
  const { vacancies, applications, applyToVacancy } = useData();
  const { isDark } = useTheme();
  const { ref, inView } = useInView();

  const [search, setSearch] = useState("");
  const [subjectFilter, setSubjectFilter] = useState("All");
  const [modeFilter, setModeFilter] = useState("all");
  const [consentModal, setConsentModal] = useState<{
    isOpen: boolean;
    vacancyId: string;
    agencyName: string;
    vacancyTitle: string;
  }>({ isOpen: false, vacancyId: "", agencyName: "", vacancyTitle: "" });

  const filtered = vacancies.filter((v) => {
    if (v.status !== "open") return false;
    if (subjectFilter !== "All" && v.subject !== subjectFilter) return false;
    if (modeFilter !== "all" && v.teachingMode !== modeFilter) return false;
    if (search) {
      const q = search.toLowerCase();
      return (
        v.title.toLowerCase().includes(q) ||
        v.organizationName.toLowerCase().includes(q) ||
        v.subject.toLowerCase().includes(q) ||
        v.location.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const appliedIds = new Set(applications.map((a) => a.vacancyId));

  const cardBg = isDark ? "#111111" : "#FFFFFF";
  const cardBorder = isDark ? "#1F1F1F" : "#E2E8F0";
  const inputBg = isDark ? "#0D0D0D" : "#F1F5F9";
  const inputBorder = isDark ? "#1F1F1F" : "#E2E8F0";
  const textPrimary = isDark ? "#FFFFFF" : "#0F172A";
  const textSecondary = isDark ? "#9CA3AF" : "#475569";
  const textMuted = isDark ? "#6B7280" : "#94A3B8";
  const textFaint = isDark ? "#4B5563" : "#CBD5E1";
  const pillBg = isDark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.04)";
  const pillBorder = isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.08)";

  return (
    <div ref={ref as React.RefObject<HTMLDivElement>} className="space-y-8">
      {/* Header */}
      <div className={`fade-up ${inView ? "in-view" : ""}`}>
        <h1 className="text-2xl font-semibold" style={{ color: textPrimary }}>Vacancies</h1>
        <p className="text-sm mt-1" style={{ color: textSecondary }}>
          Browse open positions from verified agencies.
        </p>
      </div>

      {/* Search & Filters */}
      <div
        className={`rounded-2xl p-5 space-y-4 fade-up delay-100 ${inView ? "in-view" : ""}`}
        style={{ background: cardBg, border: `1px solid ${cardBorder}` }}
      >
        <div className="relative">
          <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2" style={{ color: textMuted }} />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by title, subject, organization, or location..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl text-sm focus:outline-none"
            style={{ background: inputBg, border: `1px solid ${inputBorder}`, color: textPrimary }}
          />
        </div>

        <div className="flex flex-wrap gap-3">
          <div className="flex gap-1.5 flex-wrap">
            {FILTER_SUBJECTS.map((s) => (
              <button
                key={s}
                onClick={() => setSubjectFilter(s)}
                className="px-3 py-1.5 rounded-lg text-xs font-medium transition-all"
                style={{
                  background: subjectFilter === s ? "rgba(34,197,94,0.15)" : pillBg,
                  border: `1px solid ${subjectFilter === s ? "rgba(34,197,94,0.3)" : pillBorder}`,
                  color: subjectFilter === s ? "#22C55E" : textSecondary,
                }}
              >
                {s}
              </button>
            ))}
          </div>

          <select
            value={modeFilter}
            onChange={(e) => setModeFilter(e.target.value)}
            className="px-3 py-1.5 rounded-lg text-xs font-medium focus:outline-none"
            style={{ background: pillBg, border: `1px solid ${pillBorder}`, color: textSecondary }}
          >
            {FILTER_MODES.map((m) => (
              <option key={m.value} value={m.value}>{m.label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Results Count */}
      <div className="text-xs" style={{ color: textMuted }}>
        {filtered.length} {filtered.length === 1 ? "vacancy" : "vacancies"} found
      </div>

      {/* Vacancy List */}
      <div className="space-y-3">
        {filtered.length === 0 ? (
          <div
            className="rounded-xl p-12 text-center"
            style={{ background: cardBg, border: `1px solid ${cardBorder}` }}
          >
            <Briefcase size={32} className="mx-auto mb-3" style={{ color: textFaint }} />
            <p className="text-sm" style={{ color: textSecondary }}>No vacancies match your filters.</p>
          </div>
        ) : (
          filtered.map((vacancy, i) => {
            const isApplied = appliedIds.has(vacancy.id);
            return (
              <div
                key={vacancy.id}
                className={`rounded-2xl p-5 md:p-6 transition-all hover:-translate-y-1 fade-up delay-${Math.min((i + 1) * 100, 500)} ${inView ? "in-view" : ""}`}
                style={{ background: cardBg, border: `1px solid ${cardBorder}`, boxShadow: "var(--shadow-card)" }}
              >
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-2">
                      <div
                        className="w-9 h-9 rounded-lg flex items-center justify-center text-black font-bold text-xs shrink-0"
                        style={{ background: "linear-gradient(135deg, #22C55E, #16A34A)" }}
                      >
                        {vacancy.organizationName[0]}
                      </div>
                      <div>
                        <h3 className="text-sm font-semibold" style={{ color: textPrimary }}>{vacancy.title}</h3>
                        <div className="text-xs" style={{ color: textMuted }}>{vacancy.organizationName}</div>
                      </div>
                    </div>

                    <p className="text-xs leading-relaxed mb-3 line-clamp-2" style={{ color: textSecondary }}>
                      {vacancy.description}
                    </p>

                    <div className="flex flex-wrap gap-x-4 gap-y-2 text-xs" style={{ color: textMuted }}>
                      <span className="flex items-center gap-1.5">
                        <Briefcase size={12} /> {vacancy.subject} · {vacancy.grade}
                      </span>
                      <span className="flex items-center gap-1.5">
                        <MapPin size={12} /> {vacancy.location}
                      </span>
                      <span className="flex items-center gap-1.5">
                        <Clock size={12} /> {vacancy.teachingMode}
                      </span>
                      <span className="flex items-center gap-1.5">
                        <DollarSign size={12} /> {vacancy.salary}
                      </span>
                      <span className="flex items-center gap-1.5">
                        <Users size={12} /> {vacancy.applicantCount} applicants
                      </span>
                    </div>

                    <div className="mt-3 flex flex-wrap gap-2">
                      <span
                        className="px-2 py-0.5 rounded text-xs"
                        style={{ background: pillBg, color: textSecondary }}
                      >
                        {vacancy.requiredEducation}
                      </span>
                      <span
                        className="px-2 py-0.5 rounded text-xs"
                        style={{ background: pillBg, color: textSecondary }}
                      >
                        {vacancy.requiredExperience}+ years exp
                      </span>
                      <span
                        className="px-2 py-0.5 rounded text-xs"
                        style={{ background: pillBg, color: textSecondary }}
                      >
                        {vacancy.availability}
                      </span>
                    </div>
                  </div>

                  <div className="shrink-0 lg:text-right">
                    <div className="text-xs mb-2" style={{ color: textFaint }}>
                      Deadline: {vacancy.deadline}
                    </div>
                    {isApplied ? (
                      <span
                        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-medium"
                        style={{ background: "rgba(34,197,94,0.12)", color: "#22C55E" }}
                      >
                        <CheckCircle2 size={13} /> Applied
                      </span>
                    ) : (
                      <button
                        onClick={() => setConsentModal({
                          isOpen: true,
                          vacancyId: vacancy.id,
                          agencyName: vacancy.organizationName,
                          vacancyTitle: vacancy.title,
                        })}
                        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-semibold transition-all hover:opacity-90"
                        style={{ background: "#22C55E", color: "black" }}
                      >
                        <Send size={13} /> Apply Now
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      <ApplyConsentModal
        isOpen={consentModal.isOpen}
        onClose={() => setConsentModal({ ...consentModal, isOpen: false })}
        onConfirm={() => {
          applyToVacancy(consentModal.vacancyId);
          setConsentModal({ ...consentModal, isOpen: false });
        }}
        agencyName={consentModal.agencyName}
        vacancyTitle={consentModal.vacancyTitle}
      />
    </div>
  );
}
