import { useState } from "react";
import { useMockData } from "@/context/MockDataContext";
import { useInView } from "@/hooks/useInView";
import {
  Search,
  MapPin,
  Clock,
  DollarSign,
  Users,
  Briefcase,
  CheckCircle2,
  Clock as ClockIcon,
  Send,
} from "lucide-react";
import type { TeachingMode } from "@/types";

const FILTER_SUBJECTS = ["All", "Mathematics", "Physics", "Science", "English", "Computer Science"];
const FILTER_MODES: { value: string; label: string }[] = [
  { value: "all", label: "All Modes" },
  { value: "in-person", label: "In-person" },
  { value: "online", label: "Online" },
  { value: "hybrid", label: "Hybrid" },
];

export default function TutorVacancies() {
  const { vacancies, applications, applyToVacancy } = useMockData();
  const { ref, inView } = useInView();

  const [search, setSearch] = useState("");
  const [subjectFilter, setSubjectFilter] = useState("All");
  const [modeFilter, setModeFilter] = useState("all");

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

  return (
    <div ref={ref as React.RefObject<HTMLDivElement>} className="space-y-8">
      {/* Header */}
      <div className={`fade-up ${inView ? "in-view" : ""}`}>
        <h1 className="text-2xl font-semibold text-white">Vacancies</h1>
        <p className="text-sm text-gray-400 mt-1">
          Browse open positions from verified agencies.
        </p>
      </div>

      {/* Search & Filters */}
      <div
        className={`rounded-2xl p-5 space-y-4 fade-up delay-100 ${inView ? "in-view" : ""}`}
        style={{ background: "#111111", border: "1px solid #1F1F1F" }}
      >
        {/* Search */}
        <div className="relative">
          <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by title, subject, organization, or location..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl text-sm text-white focus:outline-none"
            style={{ background: "#0D0D0D", border: "1px solid #1F1F1F" }}
          />
        </div>

        {/* Filter Row */}
        <div className="flex flex-wrap gap-3">
          {/* Subject Pills */}
          <div className="flex gap-1.5 flex-wrap">
            {FILTER_SUBJECTS.map((s) => (
              <button
                key={s}
                onClick={() => setSubjectFilter(s)}
                className="px-3 py-1.5 rounded-lg text-xs font-medium transition-all"
                style={{
                  background: subjectFilter === s ? "rgba(34,197,94,0.15)" : "rgba(255,255,255,0.04)",
                  border: `1px solid ${subjectFilter === s ? "rgba(34,197,94,0.3)" : "rgba(255,255,255,0.08)"}`,
                  color: subjectFilter === s ? "#22C55E" : "#9CA3AF",
                }}
              >
                {s}
              </button>
            ))}
          </div>

          {/* Mode Select */}
          <select
            value={modeFilter}
            onChange={(e) => setModeFilter(e.target.value)}
            className="px-3 py-1.5 rounded-lg text-xs font-medium text-gray-400 focus:outline-none"
            style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}
          >
            {FILTER_MODES.map((m) => (
              <option key={m.value} value={m.value}>
                {m.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Results Count */}
      <div className="text-xs text-gray-500">
        {filtered.length} {filtered.length === 1 ? "vacancy" : "vacancies"} found
      </div>

      {/* Vacancy List */}
      <div className="space-y-3">
        {filtered.length === 0 ? (
          <div
            className="rounded-xl p-12 text-center"
            style={{ background: "#111111", border: "1px solid #1F1F1F" }}
          >
            <Briefcase size={32} className="mx-auto mb-3 text-gray-600" />
            <p className="text-sm text-gray-400">No vacancies match your filters.</p>
          </div>
        ) : (
          filtered.map((vacancy, i) => {
            const isApplied = appliedIds.has(vacancy.id);
            return (
              <div
                key={vacancy.id}
                className={`rounded-2xl p-5 md:p-6 transition-all hover:-translate-y-0.5 fade-up delay-${Math.min((i + 1) * 100, 500)} ${inView ? "in-view" : ""}`}
                style={{ background: "#111111", border: "1px solid #1F1F1F" }}
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
                        <h3 className="text-sm font-semibold text-white">{vacancy.title}</h3>
                        <div className="text-xs text-gray-500">{vacancy.organizationName}</div>
                      </div>
                    </div>

                    <p className="text-xs text-gray-400 leading-relaxed mb-3 line-clamp-2">
                      {vacancy.description}
                    </p>

                    <div className="flex flex-wrap gap-x-4 gap-y-2 text-xs text-gray-500">
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

                    {/* Requirements */}
                    <div className="mt-3 flex flex-wrap gap-2">
                      <span
                        className="px-2 py-0.5 rounded text-xs"
                        style={{ background: "rgba(255,255,255,0.04)", color: "#9CA3AF" }}
                      >
                        {vacancy.requiredEducation}
                      </span>
                      <span
                        className="px-2 py-0.5 rounded text-xs"
                        style={{ background: "rgba(255,255,255,0.04)", color: "#9CA3AF" }}
                      >
                        {vacancy.requiredExperience}+ years exp
                      </span>
                      <span
                        className="px-2 py-0.5 rounded text-xs"
                        style={{ background: "rgba(255,255,255,0.04)", color: "#9CA3AF" }}
                      >
                        {vacancy.availability}
                      </span>
                    </div>
                  </div>

                  {/* Apply Button */}
                  <div className="shrink-0 lg:text-right">
                    <div className="text-xs text-gray-600 mb-2">
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
                        onClick={() => applyToVacancy(vacancy.id)}
                        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-medium transition-all hover:opacity-90"
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
    </div>
  );
}
