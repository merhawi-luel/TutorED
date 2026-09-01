import { useTheme } from "@/context/ThemeContext";
import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { parentApi } from "@/lib/api";
import { useInView } from "@/hooks/useInView";
import {
  Building2,
  Briefcase,
  FileText,
  ArrowUpRight,
  Users,
  Search,
  Star,
} from "lucide-react";

export default function ParentOverview() {
  const { user } = useAuth();
  const { ref, inView } = useInView();
  const [stats, setStats] = useState({ agencies: 0, vacancies: 0, requests: 0 });

  useEffect(() => {
    Promise.allSettled([
      parentApi.getAgencies(),
      parentApi.getVacancies(),
      parentApi.getRequests(),
    ]).then(([agencies, vacancies, requests]) => {
      setStats({
        agencies: agencies.status === "fulfilled" ? agencies.value.length : 0,
        vacancies: vacancies.status === "fulfilled" ? vacancies.value.length : 0,
        requests: requests.status === "fulfilled" ? requests.value.length : 0,
      });
    });
  }, []);

  const STATS = [
    { label: "Agencies", value: String(stats.agencies), sub: "Verified partners", icon: Building2, color: "var(--badge-info-color)" },
    { label: "Open Vacancies", value: String(stats.vacancies), sub: "Available positions", icon: Briefcase, color: "var(--accent)" },
    { label: "My Requests", value: String(stats.requests), sub: "Recruitment requests", icon: FileText, color: "var(--badge-pending-color)" },
    { label: "Tutors", value: "—", sub: "Available tutors", icon: Users, color: "var(--badge-purple-color)" },
  ];

  return (
    <div ref={ref as React.RefObject<HTMLDivElement>} className="space-y-8">
      {/* Welcome */}
      <div className={`fade-up ${inView ? "in-view" : ""}`}>
        <h1 className="text-2xl font-semibold text-[var(--text-primary)]">
          Welcome, {user?.name?.split(" ")[0] || "Parent"} 
        </h1>
        <p className="text-sm text-[var(--text-secondary)] mt-1">
          Find the perfect tutor for your child or let an agency handle the recruitment.
        </p>
      </div>

      {/* Quick Actions */}
      <div className={`grid grid-cols-1 sm:grid-cols-2 gap-4 fade-up delay-100 ${inView ? "in-view" : ""}`}>
        <div
          className="rounded-xl p-6 cursor-pointer transition-all hover:-translate-y-0.5"
          style={{ background: "var(--accent-bg)", border: "1px solid var(--accent-border)" }}
        >
          <div className="flex items-center gap-3 mb-3">
            <Search size={20} style={{ color: "var(--accent)" }} />
            <span className="text-sm font-medium text-[var(--text-primary)]">Self-Recruitment</span>
          </div>
          <p className="text-xs text-[var(--text-secondary)]">
            Browse tutor profiles and vacancies yourself. Contact tutors directly and manage the hiring process.
          </p>
        </div>
        <div
          className="rounded-xl p-6 cursor-pointer transition-all hover:-translate-y-0.5"
          style={{ background: "rgba(59,130,246,0.08)", border: "1px solid rgba(59,130,246,0.2)" }}
        >
          <div className="flex items-center gap-3 mb-3">
            <Building2 size={20} style={{ color: "var(--badge-info-color)" }} />
            <span className="text-sm font-medium text-[var(--text-primary)]">Agency-Assisted</span>
          </div>
          <p className="text-xs text-[var(--text-secondary)]">
            Let a verified agency handle the recruitment. They'll find the best tutor match for your child.
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {STATS.map((card, i) => {
          const Icon = card.icon;
          return (
            <div
              key={card.label}
              className={`rounded-xl p-5 fade-up delay-${(i + 2) * 100} ${inView ? "in-view" : ""}`}
              style={{ background: "var(--bg-card)", border: "1px solid var(--border-color)" }}
            >
              <div className="flex items-center justify-between mb-3">
                <div
                  className="w-9 h-9 rounded-lg flex items-center justify-center"
                  style={{ background: `${card.color}18` }}
                >
                  <Icon size={18} style={{ color: card.color }} />
                </div>
                <ArrowUpRight size={14} className="text-[var(--text-faint)]" />
              </div>
              <div className="text-2xl font-bold text-[var(--text-primary)]">{card.value}</div>
              <div className="text-xs text-[var(--text-muted)] mt-0.5">{card.sub}</div>
            </div>
          );
        })}
      </div>

      {/* Quick link to Leave Review */}
      <div
        className={`rounded-2xl p-6 fade-up delay-600 ${inView ? "in-view" : ""}`}
        style={{ background: "var(--bg-card)", border: "1px solid var(--border-color)" }}
      >
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center"
            style={{ background: "var(--accent-bg)" }}
          >
            <Star size={20} style={{ color: "var(--accent)" }} />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-[var(--text-primary)]">Leave a Review</h3>
            <p className="text-xs text-[var(--text-secondary)]">
              Rate your experience with tutors you've accepted or worked with.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
