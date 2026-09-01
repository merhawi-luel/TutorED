import { useTheme } from "@/context/ThemeContext";
import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { useData } from "@/context/DataContext";
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
  X,
  Loader2,
  CheckCircle2,
} from "lucide-react";

interface ReviewableTutor {
  applicationId: string;
  tutorId: string;
  tutorName: string;
  vacancyTitle: string;
  status: string;
}

export default function ParentOverview() {
  const { user } = useAuth();
  const { ref, inView } = useInView();
  const { submitReview, reviews } = useData();
  const [stats, setStats] = useState({ agencies: 0, vacancies: 0, requests: 0 });
  const [reviewableTutors, setReviewableTutors] = useState<ReviewableTutor[]>([]);
  const [reviewModal, setReviewModal] = useState<{
    isOpen: boolean;
    applicationId: string;
    tutorName: string;
  }>({ isOpen: false, applicationId: "", tutorName: "" });
  const [reviewRating, setReviewRating] = useState(0);
  const [reviewDescription, setReviewDescription] = useState("");
  const [reviewSubmitting, setReviewSubmitting] = useState(false);

  const hasReviewed = (applicationId: string) => {
    return reviews.some(r => r.applicationId === applicationId);
  };

  const handleSubmitReview = async () => {
    if (reviewRating === 0) return;
    setReviewSubmitting(true);
    try {
      await submitReview({
        applicationId: reviewModal.applicationId,
        rating: reviewRating,
        description: reviewDescription,
      });
      setReviewModal({ isOpen: false, applicationId: "", tutorName: "" });
      setReviewRating(0);
      setReviewDescription("");
      // Refresh the list
      fetchReviewableTutors();
    } catch (err) {
      console.error("Failed to submit review:", err);
    } finally {
      setReviewSubmitting(false);
    }
  };

  const fetchReviewableTutors = async () => {
    try {
      const data = await parentApi.getApplicants();
      const accepted = data
        .filter((a: any) => a.status === "accepted" || a.status === "completed")
        .map((a: any) => ({
          applicationId: a.id,
          tutorId: a.tutorId || a.tutor_id,
          tutorName: a.tutorName || a.tutor_name || "Unknown",
          vacancyTitle: a.vacancyTitle || a.vacancy_title || "Unknown",
          status: a.status,
        }));
      setReviewableTutors(accepted);
    } catch (err) {
      console.error("Failed to fetch tutors:", err);
    }
  };

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
    fetchReviewableTutors();
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

      {/* Leave Review Section */}
      <div className={`fade-up delay-600 ${inView ? "in-view" : ""}`}>
        <div
          className="rounded-2xl overflow-hidden"
          style={{ background: "var(--bg-card)", border: "1px solid var(--border-color)" }}
        >
          <div className="px-6 py-4" style={{ borderBottom: "1px solid var(--border-color)" }}>
            <div className="flex items-center gap-2">
              <Star size={18} style={{ color: "var(--accent)" }} />
              <h2 className="text-lg font-semibold text-[var(--text-primary)]">Leave a Review</h2>
            </div>
            <p className="text-xs text-[var(--text-secondary)] mt-1">
              Rate your experience with tutors you've accepted or worked with.
            </p>
          </div>

          <div className="px-6 py-5">
            {reviewableTutors.length === 0 ? (
              <div className="text-center py-8">
                <Star size={28} className="mx-auto mb-3 text-[var(--text-faint)]" />
                <p className="text-sm text-[var(--text-secondary)]">
                  No tutors to review yet. Accept a tutor from your applicants to leave a review.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {reviewableTutors.map((tutor) => {
                  const reviewed = hasReviewed(tutor.applicationId);
                  return (
                    <div
                      key={tutor.applicationId}
                      className="flex items-center justify-between rounded-xl px-4 py-3"
                      style={{ background: "var(--bg-input)", border: "1px solid var(--border-color)" }}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className="w-10 h-10 rounded-xl flex items-center justify-center text-black font-bold text-xs shrink-0"
                          style={{ background: "var(--accent)" }}
                        >
                          {tutor.tutorName.split(" ").map((n: string) => n[0]).join("")}
                        </div>
                        <div>
                          <div className="text-sm font-medium text-[var(--text-primary)]">{tutor.tutorName}</div>
                          <div className="text-xs text-[var(--text-muted)]">{tutor.vacancyTitle}</div>
                        </div>
                      </div>
                      <div>
                        {reviewed ? (
                          <span
                            className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-medium"
                            style={{ background: "var(--accent-bg)", color: "var(--accent)" }}
                          >
                            <CheckCircle2 size={13} /> Reviewed
                          </span>
                        ) : (
                          <button
                            onClick={() => setReviewModal({ isOpen: true, applicationId: tutor.applicationId, tutorName: tutor.tutorName })}
                            className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-medium transition-all"
                            style={{
                              background: "var(--accent)",
                              color: "#FFFFFF",
                              border: "1px solid var(--accent)",
                            }}
                          >
                            <Star size={13} /> Leave Review
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Review Modal */}
      {reviewModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60" onClick={() => setReviewModal({ isOpen: false, applicationId: "", tutorName: "" })} />
          <div
            className="relative w-full max-w-md rounded-2xl p-6"
            style={{ background: "var(--bg-card)", border: "1px solid var(--border-color)" }}
          >
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-lg font-semibold" style={{ color: "var(--text-primary)" }}>
                Review {reviewModal.tutorName}
              </h3>
              <button
                onClick={() => setReviewModal({ isOpen: false, applicationId: "", tutorName: "" })}
                className="p-1.5 rounded-lg hover:bg-black/5"
              >
                <X size={18} style={{ color: "var(--text-muted)" }} />
              </button>
            </div>

            {/* Star Rating */}
            <div className="mb-4">
              <label className="text-sm font-medium mb-2 block" style={{ color: "var(--text-secondary)" }}>
                Rating *
              </label>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    onClick={() => setReviewRating(star)}
                    className="p-1 transition-all hover:scale-110"
                  >
                    <Star
                      size={28}
                      style={{ color: star <= reviewRating ? "var(--accent)" : "var(--text-faint)" }}
                      fill={star <= reviewRating ? "var(--accent)" : "none"}
                    />
                  </button>
                ))}
              </div>
            </div>

            {/* Description */}
            <div className="mb-5">
              <label className="text-sm font-medium mb-2 block" style={{ color: "var(--text-secondary)" }}>
                Your Review
              </label>
              <textarea
                value={reviewDescription}
                onChange={(e) => setReviewDescription(e.target.value)}
                placeholder="Share your experience with this tutor..."
                rows={4}
                className="w-full px-4 py-3 rounded-xl text-sm resize-none outline-none"
                style={{
                  background: "var(--bg-input)",
                  border: "1px solid var(--border-color)",
                  color: "var(--text-primary)",
                }}
              />
            </div>

            {/* Actions */}
            <div className="flex gap-2 justify-end">
              <button
                onClick={() => setReviewModal({ isOpen: false, applicationId: "", tutorName: "" })}
                className="px-4 py-2 rounded-xl text-sm font-medium"
                style={{
                  background: "var(--bg-input)",
                  border: "1px solid var(--border-color)",
                  color: "var(--text-secondary)",
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleSubmitReview}
                disabled={reviewRating === 0 || reviewSubmitting}
                className="flex items-center gap-2 px-5 py-2 rounded-xl text-sm font-semibold transition-all"
                style={{
                  background: reviewRating === 0 ? "var(--text-faint)" : "var(--accent)",
                  color: "#FFFFFF",
                  border: "none",
                  opacity: reviewSubmitting ? 0.7 : 1,
                  cursor: reviewRating === 0 ? "not-allowed" : "pointer",
                }}
              >
                {reviewSubmitting ? "Submitting..." : "Submit Review"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
