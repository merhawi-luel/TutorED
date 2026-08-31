import { useState, useEffect } from "react";
import { useInView } from "@/hooks/useInView";
import { useAuth } from "@/context/AuthContext";
import { useTheme } from "@/context/ThemeContext";
import type { Vacancy } from "@/types";

export default function VacanciesPreview() {
  const { ref: sectionRef, inView } = useInView();
  const { user } = useAuth();
  const { colors, isDark } = useTheme();
  const [vacancies, setVacancies] = useState<Vacancy[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchVacancies = async () => {
      try {
        const API_BASE = import.meta.env.VITE_API_URL || "/api";
        const res = await fetch(`${API_BASE}/tutor/vacancies`);
        if (!res.ok) throw new Error("Failed to load vacancies");
        const data = await res.json();
        setVacancies(data.slice(0, 6));
      } catch (err) {
        setError("Could not load vacancies");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchVacancies();
  }, []);

  return (
    <section
      ref={sectionRef as React.RefObject<HTMLElement>}
      className="py-16 sm:py-24 px-4 sm:px-6 md:px-12"
      style={{ background: isDark ? "linear-gradient(160deg, #000000 0%, #050F07 50%, #000000 100%)" : `linear-gradient(160deg, ${colors.bgPage} 0%, ${colors.bgCard} 50%, ${colors.bgPage} 100%)` }}
    >
      <div className="max-w-6xl mx-auto">
        <div className={`flex flex-col sm:flex-row sm:items-end justify-between mb-8 sm:mb-10 gap-4 fade-up ${inView ? "in-view" : ""}`}>
          <div>
            <p className="text-xs font-medium uppercase tracking-wider mb-2" style={{ color: colors.accent }}>
              Open Roles
            </p>
            <h2 className="text-5xl md:text-7xl font-light leading-tight" style={{ fontFamily: "Fraunces, serif", color: colors.textPrimary }}>
              Latest vacancies
            </h2>
          </div>
          <a href="/vacancies" className="text-sm font-medium transition-colors" style={{ color: colors.accent }}>
            Browse all →
          </a>
        </div>

        {/* Loading state */}
        {loading && (
          <div className="grid sm:grid-cols-2 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="p-5 rounded-xl animate-pulse"
                style={{ border: `1px solid ${colors.borderColor}`, background: colors.bgCard }}
              >
                <div className="flex items-center gap-3 sm:gap-4">
                  <div className="w-10 h-10 rounded-xl" style={{ background: colors.bgInput }} />
                  <div className="flex-1">
                    <div className="h-4 w-40 rounded mb-2" style={{ background: colors.bgInput }} />
                    <div className="h-3 w-32 rounded" style={{ background: colors.bgInput }} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Error state */}
        {error && !loading && (
          <div className="text-center py-12">
            <p className="text-sm" style={{ color: colors.textMuted }}>{error}</p>
          </div>
        )}

        {/* Vacancies grid */}
        {!loading && !error && vacancies.length === 0 && (
          <div className="text-center py-12">
            <p className="text-sm" style={{ color: colors.textMuted }}>No open vacancies at the moment. Check back soon!</p>
          </div>
        )}

        {!loading && !error && vacancies.length > 0 && (
          <div className="grid sm:grid-cols-2 gap-4">
            {vacancies.map((v, i) => (
              <div
                key={v.id}
                className={`flex flex-col sm:flex-row sm:items-center justify-between p-5 rounded-xl transition-all hover:-translate-y-0.5 hover:shadow-md gap-3 fade-up delay-${(i + 1) * 100} ${inView ? "in-view" : ""}`}
                style={{ border: `1px solid ${colors.borderColor}`, background: colors.bgCard }}
              >
                <div className="flex items-center gap-3 sm:gap-4 flex-1 min-w-0">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm shrink-0"
                    style={{ background: colors.accent, color: "#fff" }}
                  >
                    {(v.organizationName || "O")[0]}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                      <span className="font-medium text-sm truncate" style={{ color: colors.textPrimary }}>{v.title}</span>
                    </div>
                    <div className="text-xs truncate" style={{ color: colors.textMuted }}>
                      {v.organizationName} · {v.location || "Location TBD"}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3 sm:shrink-0 pl-13 sm:pl-0">
                  {v.salary && (
                    <span className="text-sm font-medium" style={{ color: colors.textSecondary }}>{v.salary}</span>
                  )}
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
    </section>
  );
}