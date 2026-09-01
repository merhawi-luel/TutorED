import { useTheme } from "@/context/ThemeContext";
import { useState } from "react";
import { useData } from "@/context/DataContext";
import { useInView } from "@/hooks/useInView";
import { useNavigate } from "react-router-dom";
import { Briefcase, MapPin, Users, Clock, TrendingUp, Eye } from "lucide-react";
import type { AgencyTab } from "@/components/layout/AgencySidebar";

export default function AgencyMyPosts({ onTabChange }: { onTabChange?: (tab: AgencyTab) => void }) {
  const { getAgencyVacancies } = useData();
  const { ref, inView } = useInView();
  const navigate = useNavigate();
  const { colors } = useTheme();

  const [filterStatus, setFilterStatus] = useState<"all" | "open" | "closed">("all");

  const allVacancies = getAgencyVacancies();
  const filteredVacancies =
    filterStatus === "all"
      ? allVacancies
      : allVacancies.filter((v) => v.status === filterStatus);

  const handleViewVacancy = (vacancyId: string) => {
    navigate(`/agency/vacancy/${vacancyId}`);
  };

  return (
    <div ref={ref as React.RefObject<HTMLDivElement>} className="space-y-8">
      {/* Header */}
      <div className={`fade-up ${inView ? "in-view" : ""}`}>
        <h1 className="text-3xl font-bold mb-2" style={{ color: colors.textPrimary }}>
          My Posts
        </h1>
        <p style={{ color: colors.textSecondary }}>
          View and manage all job postings from your organization
        </p>
      </div>

      {/* Stats */}
      {filteredVacancies.length > 0 && (
        <div
          className={`grid grid-cols-1 sm:grid-cols-3 gap-4 fade-up ${
            inView ? "in-view" : ""
          }`}
        >
          <div
            className="rounded-xl p-4 border"
            style={{
              backgroundColor: colors.bgCard,
              borderColor: colors.borderColor,
            }}
          >
            <div style={{ color: colors.textMuted }} className="text-xs font-medium mb-1">
              Total Posts
            </div>
            <div
              className="text-2xl font-bold"
              style={{ color: colors.textPrimary }}
            >
              {allVacancies.length}
            </div>
          </div>

          <div
            className="rounded-xl p-4 border"
            style={{
              backgroundColor: colors.bgCard,
              borderColor: colors.borderColor,
            }}
          >
            <div style={{ color: colors.textMuted }} className="text-xs font-medium mb-1">
              Open Positions
            </div>
            <div
              className="text-2xl font-bold"
              style={{ color: colors.accent }}
            >
              {allVacancies.filter((v) => v.status === "open").length}
            </div>
          </div>

          <div
            className="rounded-xl p-4 border"
            style={{
              backgroundColor: colors.bgCard,
              borderColor: colors.borderColor,
            }}
          >
            <div style={{ color: colors.textMuted }} className="text-xs font-medium mb-1">
              Total Applications
            </div>
            <div
              className="text-2xl font-bold"
              style={{ color: "rgb(34, 197, 94)" }}
            >
              {allVacancies.reduce((sum, v) => sum + v.applicantCount, 0)}
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      {allVacancies.length > 0 && (
        <div className={`flex gap-2 fade-up ${inView ? "in-view" : ""}`}>
          {(["all", "open", "closed"] as const).map((status) => (
            <button
              key={status}
              onClick={() => setFilterStatus(status)}
              className="px-4 py-2 rounded-lg text-sm font-medium transition-all capitalize"
              style={{
                backgroundColor:
                  filterStatus === status ? colors.accent : colors.bgInput,
                color:
                  filterStatus === status ? colors.bgPage : colors.textSecondary,
                border:
                  filterStatus === status
                    ? `1px solid ${colors.accent}`
                    : `1px solid ${colors.borderColor}`,
              }}
            >
              {status === "all" ? "All Posts" : `${status} Posts`}
            </button>
          ))}
        </div>
      )}

      {/* Vacancy List */}
      <div className={`space-y-4 fade-up ${inView ? "in-view" : ""}`}>
        {filteredVacancies.length === 0 ? (
          <div
            className="rounded-xl p-12 text-center border"
            style={{
              backgroundColor: colors.bgCard,
              borderColor: colors.borderColor,
            }}
          >
            <Briefcase
              size={48}
              style={{ color: colors.textMuted, margin: "0 auto" }}
              className="mb-4 opacity-50"
            />
            <h3 style={{ color: colors.textPrimary }} className="text-lg font-semibold mb-2">
              {filterStatus === "all"
                ? "No Posts Yet"
                : `No ${filterStatus} posts`}
            </h3>
            <p style={{ color: colors.textMuted }} className="text-sm mb-4">
              {filterStatus === "all"
                ? "Create your first vacancy by clicking 'Create Vacancy' in the sidebar"
                : `You don't have any ${filterStatus} posts at the moment`}
            </p>
          </div>
        ) : (
          filteredVacancies.map((vacancy) => (
            <div
              key={vacancy.id}
              onClick={() => handleViewVacancy(vacancy.id)}
              className="rounded-xl border p-5 cursor-pointer transition-all hover:shadow-lg"
              style={{
                backgroundColor: colors.bgCard,
                borderColor: colors.borderColor,
                borderWidth: "1px",
              }}
            >
              <div className="flex items-start justify-between gap-4">
                {/* Left Content */}
                <div className="flex-1 min-w-0">
                  {/* Title & Status */}
                  <div className="flex items-center gap-3 mb-2">
                    <h3
                      className="text-lg font-semibold truncate"
                      style={{ color: colors.textPrimary }}
                    >
                      {vacancy.title}
                    </h3>
                    <span
                      className="px-2 py-1 rounded text-xs font-medium flex-shrink-0 capitalize"
                      style={{
                        backgroundColor:
                          vacancy.status === "open"
                            ? "rgba(34, 197, 94, 0.1)"
                            : "rgba(107, 114, 128, 0.1)",
                        color:
                          vacancy.status === "open"
                            ? "rgb(34, 197, 94)"
                            : colors.textMuted,
                      }}
                    >
                      {vacancy.status}
                    </span>
                  </div>

                  {/* Subject & Grade */}
                  <p style={{ color: colors.textMuted }} className="text-sm mb-3">
                    {(vacancy.subjects?.join(', ') || vacancy.subject) + (vacancy.grades?.length ? ' • ' + vacancy.grades.join(', ') : vacancy.grade ? ' • Grade ' + vacancy.grade : '')}
                  </p>

                  {/* Details Row */}
                  <div className="flex flex-wrap gap-4 text-sm">
                    {/* Location */}
                    <div className="flex items-center gap-2">
                      <MapPin size={16} style={{ color: colors.accent }} />
                      <span style={{ color: colors.textSecondary }}>
                        {vacancy.location}
                      </span>
                    </div>

                    {/* Teaching Mode */}
                    <div className="flex items-center gap-2">
                      <Briefcase size={16} style={{ color: colors.accent }} />
                      <span style={{ color: colors.textSecondary }} className="capitalize">
                        {vacancy.teachingMode}
                      </span>
                    </div>

                    {/* Applicants */}
                    <div className="flex items-center gap-2">
                      <Users size={16} style={{ color: colors.accent }} />
                      <span style={{ color: colors.textSecondary }}>
                        {vacancy.applicantCount} applicant
                        {vacancy.applicantCount !== 1 ? "s" : ""}
                      </span>
                    </div>

                    {/* Deadline */}
                    {vacancy.deadline && (
                      <div className="flex items-center gap-2">
                        <Clock size={16} style={{ color: colors.accent }} />
                        <span style={{ color: colors.textSecondary }}>
                          Closes:{" "}
                          {new Date(vacancy.deadline).toLocaleDateString()}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Salary */}
                  {vacancy.salary && (
                    <p style={{ color: colors.accent }} className="text-sm font-medium mt-3">
                      💰 {vacancy.salary}
                    </p>
                  )}
                </div>

                {/* Right - View Button & Applicant Count */}
                <div className="flex flex-col items-end gap-3">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleViewVacancy(vacancy.id);
                    }}
                    className="px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 whitespace-nowrap"
                    style={{
                      backgroundColor: colors.accent,
                      color: colors.bgPage,
                    }}
                  >
                    <Eye size={16} />
                    View Details
                  </button>

                  {/* Applicant Badge */}
                  {vacancy.applicantCount > 0 && (
                    <div
                      className="px-3 py-1 rounded-full text-xs font-medium"
                      style={{
                        backgroundColor: `${colors.accent}20`,
                        color: colors.accent,
                      }}
                    >
                      <TrendingUp size={12} className="inline mr-1" />
                      {vacancy.applicantCount} new
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
