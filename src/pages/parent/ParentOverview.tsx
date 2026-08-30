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
    { label: "Agencies", value: String(stats.agencies), sub: "Verified partners", icon: Building2, color: "#3B82F6" },
    { label: "Open Vacancies", value: String(stats.vacancies), sub: "Available positions", icon: Briefcase, color: "#22C55E" },
    { label: "My Requests", value: String(stats.requests), sub: "Recruitment requests", icon: FileText, color: "#F59E0B" },
    { label: "Tutors", value: "—", sub: "Available tutors", icon: Users, color: "#A855F7" },
  ];

  return (
    <div ref={ref as React.RefObject<HTMLDivElement>} className="space-y-8">
      {/* Welcome */}
      <div className={`fade-up ${inView ? "in-view" : ""}`}>
        <h1 className="text-2xl font-semibold text-white">
          Welcome, {user?.name?.split(" ")[0] || "Parent"} 
        </h1>
        <p className="text-sm text-gray-400 mt-1">
          Find the perfect tutor for your child or let an agency handle the recruitment.
        </p>
      </div>

      {/* Quick Actions */}
      <div className={`grid grid-cols-1 sm:grid-cols-2 gap-4 fade-up delay-100 ${inView ? "in-view" : ""}`}>
        <div
          className="rounded-xl p-6 cursor-pointer transition-all hover:-translate-y-0.5"
          style={{ background: "rgba(34,197,94,0.08)", border: "1px solid rgba(34,197,94,0.2)" }}
        >
          <div className="flex items-center gap-3 mb-3">
            <Search size={20} style={{ color: "#22C55E" }} />
            <span className="text-sm font-medium text-white">Self-Recruitment</span>
          </div>
          <p className="text-xs text-gray-400">
            Browse tutor profiles and vacancies yourself. Contact tutors directly and manage the hiring process.
          </p>
        </div>
        <div
          className="rounded-xl p-6 cursor-pointer transition-all hover:-translate-y-0.5"
          style={{ background: "rgba(59,130,246,0.08)", border: "1px solid rgba(59,130,246,0.2)" }}
        >
          <div className="flex items-center gap-3 mb-3">
            <Building2 size={20} style={{ color: "#3B82F6" }} />
            <span className="text-sm font-medium text-white">Agency-Assisted</span>
          </div>
          <p className="text-xs text-gray-400">
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
              style={{ background: "#111111", border: "1px solid #1F1F1F" }}
            >
              <div className="flex items-center justify-between mb-3">
                <div
                  className="w-9 h-9 rounded-lg flex items-center justify-center"
                  style={{ background: `${card.color}18` }}
                >
                  <Icon size={18} style={{ color: card.color }} />
                </div>
                <ArrowUpRight size={14} className="text-gray-600" />
              </div>
              <div className="text-2xl font-bold text-white">{card.value}</div>
              <div className="text-xs text-gray-500 mt-0.5">{card.sub}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
