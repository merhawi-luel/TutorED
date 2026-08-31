import { useState, useEffect } from "react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { useAuth } from "@/context/AuthContext";
import { useTheme } from "@/context/ThemeContext";
import type { Vacancy } from "@/types";

const TEACHING_MODES = ["All", "In-person", "Online", "Hybrid"];

export default function VacanciesBrowse() {
  const { user } = useAuth();
  const { colors, isDark } = useTheme();
  const [vacancies, setVacancies] = useState<Vacancy[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [search, setSearch] = useState("");
  const [subjectFilter, setSubjectFilter] = useState("All");
  const [modeFilter, setModeFilter] = useState("All");

  useEffect(() => {
    const fetchVacancies = async () => {
      try {
        const API_BASE = import.meta.env.VITE_API_URL || "/api";
        const res = await fetch(`${API_BASE}/tutor/vacancies`);
        if (!res.ok) throw new Error("Failed to load vacancies");
        const data = await res.json();
        setVacancies(data);
      } catch (err) {
        setError("Could not load vacancies. Please try again later.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchVacancies();
  }, []);

  const subjects = ["All", ...Array.from(new Set(vacancies.map((v) => v.subject).filter(Boolean)))];

  const filtered = vacancies.filter((v) => {
    const matchesSearch =
      search === "" ||
      v.title.toLowerCase().includes(search.toLowerCase()) ||
      (v.organizationName || "").toLowerCase().includes(search.toLowerCase()) ||
      v.subject.toLowerCase().includes(search.toLowerCase()) ||
      v.location.toLowerCase().includes(search.toLowerCase());
    const matchesSubject = subjectFilter === "All" || v.subject === subjectFilter;
    const matchesMode =
      modeFilter === "All" || v.teachingMode === modeFilter.toLowerCase().replace("-", "-");
    return matchesSearch && matchesSubject && matchesMode;
  });

  const selectStyle: React.CSSProperties = {
    background: colors.bgInput,
    border: `1px solid ${colors.borderColor}`,
    color: colors.textSecondary,
  };

  const cardStyle: React.CSSProperties = {
    background: colors.bgCard,
    border: `1px solid ${colors.borderColor}`,
  };

  return (
    <div className="min-h-screen" style={{ fontFamily: "Outfit, sans-serif", background: colors.bgPage }}>
      <Navbar />

      <div className="pt-24 pb-16 px-4 sm:px-6 md:px-12">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="mb-10">
            <p
              className="text-xs font-medium uppercase tracking-wider mb-2"
              style={{ color: colors.accent }}
            >
              Open Opportunities
            </p>
            <h1
              className="text-4xl sm:text-5xl md:text-6xl font-light leading-tight"
              style={{ fontFamily: "Fraunces, serif", color: colors.textPrimary }}
            >
              Browse Vacancies
            </h1>
            <p className="mt-3 text-sm sm:text-base max-w-xl" style={{ color: colors.textSecondary }}>
              Find tutoring opportunities from verified agencies. Log in or sign up to apply.
            </p>
          </div>

          {/* Filters */}
          <div
            className="flex flex-col sm:flex-row gap-3 mb-8 p-4 rounded-2xl"
            style={cardStyle}
          >
            <div className="flex-1 relative">
              <svg
                className="absolute left-3 top-1/2 -translate-y-1/2"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke={colors.textMuted}
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="11" cy="11" r="8" />
                <path d="m21 21-4.3-4.3" />
              </svg>
              <input
                type="text"
                placeholder="Search by title, subject, agency, or location..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl text-sm outline-none"
                style={{
                  background: colors.bgInput,
                  border: `1px solid ${colors.borderColor}`,
                  color: colors.textPrimary,
                }}
              />
            </div>

            <select
              value={subjectFilter}
              onChange={(e) => setSubjectFilter(e.target.value)}
              className="px-4 py-2.5 rounded-xl text-sm outline-none cursor-pointer"
              style={selectStyle}
            >
              {subjects.map((s) => (
                <option key={s} value={s}>{s === "All" ? "All Subjects" : s}</option>
              ))}
            </select>

            <select
              value={modeFilter}
              onChange={(e) => setModeFilter(e.target.value)}
              className="px-4 py-2.5 rounded-xl text-sm outline-none cursor-pointer"
              style={selectStyle}
            >
              {TEACHING_MODES.map((m) => (
                <option key={m} value={m}>{m === "All" ? "All Modes" : m}</option>
              ))}
            </select>
          </div>

          {/* Results count */}
          {!loading && (
            <p className="text-xs mb-4" style={{ color: colors.textMuted }}>
              {filtered.length} {filtered.length === 1 ? "vacancy" : "vacancies"} found
            </p>
          )}

          {/* Loading skeleton */}
          {loading && (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="p-5 rounded-xl animate-pulse" style={cardStyle}>
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-xl" style={{ background: colors.bgInput }} />
                    <div className="flex-1">
                      <div className="h-4 w-36 rounded mb-2" style={{ background: colors.bgInput }} />
                      <div className="h-3 w-28 rounded" style={{ background: colors.bgInput }} />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="h-3 w-full rounded" style={{ background: colors.bgInput }} />
                    <div className="h-3 w-3/4 rounded" style={{ background: colors.bgInput }} />
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Error */}
          {error && !loading && (
            <div className="text-center py-20">
              <p className="text-sm" style={{ color: colors.textMuted }}>{error}</p>
            </div>
          )}

          {/* Empty */}
          {!loading && !error && filtered.length === 0 && (
            <div className="text-center py-20">
              <p className="text-sm" style={{ color: colors.textMuted }}>
                No vacancies match your filters. Try adjusting your search.
              </p>
            </div>
          )}

          {/* Vacancies grid */}
          {!loading && !error && filtered.length > 0 && (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filtered.map((v) => (
                <div
                  key={v.id}
                  className="flex flex-col p-5 rounded-xl transition-all hover:-translate-y-0.5 hover:shadow-md"
                  style={cardStyle}
                >
                  <div className="flex items-start gap-3 mb-4">
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm shrink-0"
                      style={{ background: colors.accent, color: "#fff" }}
                    >
                      {(v.organizationName || "O")[0]}
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="font-medium text-sm leading-snug" style={{ color: colors.textPrimary }}>{v.title}</h3>
                      <p className="text-xs mt-0.5" style={{ color: colors.textMuted }}>{v.organizationName}</p>
                    </div>
                  </div>

                  <div className="flex-1 space-y-2 mb-4">
                    <div className="flex items-center gap-2 text-xs" style={{ color: colors.textSecondary }}>
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
                        <circle cx="12" cy="10" r="3" />
                      </svg>
                      <span>{v.location || "Location TBD"}</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs" style={{ color: colors.textSecondary }}>
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20" />
                      </svg>
                      <span>{v.subject} · Grade {v.grade}</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs" style={{ color: colors.textSecondary }}>
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <rect width="18" height="18" x="3" y="4" rx="2" ry="2" />
                        <path d="M16 2v4" />
                        <path d="M8 2v4" />
                        <path d="M3 10h18" />
                      </svg>
                      <span>{v.teachingMode || "In-person"}</span>
                    </div>
                    {v.requiredEducation && (
                      <div className="flex items-center gap-2 text-xs" style={{ color: colors.textSecondary }}>
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
                          <path d="M6 12v5c3 3 9 3 12 0v-5" />
                        </svg>
                        <span>{v.requiredEducation}</span>
                      </div>
                    )}
                  </div>

                  <div
                    className="flex items-center justify-between pt-3"
                    style={{ borderTop: `1px solid ${colors.borderColor}` }}
                  >
                    <div>
                      {v.salary && (
                        <span className="text-sm font-medium" style={{ color: colors.textPrimary }}>{v.salary}</span>
                      )}
                      {v.deadline && (
                        <span className="text-xs ml-2" style={{ color: colors.textMuted }}>Due {v.deadline}</span>
                      )}
                    </div>
                    {user?.role === "tutor" ? (
                      <a
                        href="/tutor"
                        className="px-4 py-1.5 rounded-lg text-xs font-semibold transition-all hover:brightness-110"
                        style={{ background: colors.accent, color: "#fff" }}
                      >
                        Apply
                      </a>
                    ) : (
                      <a
                        href="/login"
                        className="px-4 py-1.5 rounded-lg text-xs font-semibold transition-all hover:brightness-110"
                        style={{ background: colors.accentBg, color: colors.accent, border: `1px solid ${colors.accentBorder}` }}
                      >
                        Log in to Apply
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <Footer />
    </div>
  );
}