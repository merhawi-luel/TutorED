import { useTheme } from "@/context/ThemeContext";
import { useState, useEffect, useCallback } from "react";
import { useData } from "@/context/DataContext";
import { parentApi } from "@/lib/api";
import { useInView } from "@/hooks/useInView";
import {
  Star,
  X,
  Loader2,
  CheckCircle2,
  User,
  Briefcase,
} from "lucide-react";

interface ReviewableTutor {
  applicationId: string;
  tutorId: string;
  tutorName: string;
  vacancyTitle: string;
  status: string;
}

export default function ParentReviews() {
  const { ref, inView } = useInView();
  const { submitReview, reviews } = useData();
  const [reviewableTutors, setReviewableTutors] = useState<ReviewableTutor[]>([]);
  const [loading, setLoading] = useState(true);
  const [reviewModal, setReviewModal] = useState<{
    isOpen: boolean;
    applicationId: string;
    tutorName: string;
  }>({ isOpen: false, applicationId: "", tutorName: "" });
  const [reviewRating, setReviewRating] = useState(0);
  const [reviewDescription, setReviewDescription] = useState("");
  const [reviewSubmitting, setReviewSubmitting] = useState(false);

  const hasReviewed = (applicationId: string) => {
    return reviews.some((r) => r.applicationId === applicationId);
  };

  const fetchReviewableTutors = useCallback(async () => {
    setLoading(true);
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
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchReviewableTutors();
  }, [fetchReviewableTutors]);

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
      fetchReviewableTutors();
    } catch (err) {
      console.error("Failed to submit review:", err);
    } finally {
      setReviewSubmitting(false);
    }
  };

  const handleCloseModal = () => {
    setReviewModal({ isOpen: false, applicationId: "", tutorName: "" });
    setReviewRating(0);
    setReviewDescription("");
  };

  return (
    <div ref={ref as React.RefObject<HTMLDivElement>} className="space-y-8">
      {/* Header */}
      <div className={`fade-up ${inView ? "in-view" : ""}`}>
        <h1 className="text-2xl font-semibold text-[var(--text-primary)]">Leave a Review</h1>
        <p className="text-sm text-[var(--text-secondary)] mt-1">
          Rate your experience with tutors you've accepted or worked with.
        </p>
      </div>

      {/* Loading */}
      {loading && (
        <div className="flex items-center justify-center py-12">
          <Loader2 size={24} className="animate-spin text-[var(--text-muted)]" />
          <span className="ml-3 text-sm text-[var(--text-muted)]">Loading tutors...</span>
        </div>
      )}

      {/* Empty state */}
      {!loading && reviewableTutors.length === 0 && (
        <div
          className={`rounded-2xl p-12 text-center fade-up delay-100 ${inView ? "in-view" : ""}`}
          style={{ background: "var(--bg-card)", border: "1px solid var(--border-color)" }}
        >
          <Star size={40} className="mx-auto mb-4 text-[var(--text-faint)]" />
          <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-2">No Tutors to Review</h3>
          <p className="text-sm text-[var(--text-secondary)] max-w-sm mx-auto">
            You haven't accepted or completed any tutor applications yet. Accept a tutor from your applicants first, then come back to leave a review.
          </p>
        </div>
      )}

      {/* Tutor List */}
      {!loading && reviewableTutors.length > 0 && (
        <div className="space-y-3">
          {reviewableTutors.map((tutor, i) => {
            const reviewed = hasReviewed(tutor.applicationId);
            return (
              <div
                key={tutor.applicationId}
                className={`rounded-2xl overflow-hidden fade-up delay-${Math.min((i + 1) * 100, 400)} ${inView ? "in-view" : ""}`}
                style={{ background: "var(--bg-card)", border: "1px solid var(--border-color)" }}
              >
                <div className="flex items-center justify-between px-6 py-5">
                  <div className="flex items-center gap-4">
                    <div
                      className="w-12 h-12 rounded-xl flex items-center justify-center text-black font-bold text-sm shrink-0"
                      style={{ background: "var(--accent)" }}
                    >
                      {tutor.tutorName.split(" ").map((n: string) => n[0]).join("")}
                    </div>
                    <div>
                      <div className="text-sm font-semibold text-[var(--text-primary)]">
                        {tutor.tutorName}
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        <div className="flex items-center gap-1 text-xs text-[var(--text-muted)]">
                          <Briefcase size={12} />
                          {tutor.vacancyTitle}
                        </div>
                        <span
                          className="px-2 py-0.5 rounded text-[10px] font-medium capitalize"
                          style={{
                            background: tutor.status === "completed" ? "var(--accent-bg)" : "rgba(245,158,11,0.12)",
                            color: tutor.status === "completed" ? "var(--accent)" : "var(--badge-pending-color)",
                          }}
                        >
                          {tutor.status}
                        </span>
                      </div>
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
                        onClick={() =>
                          setReviewModal({
                            isOpen: true,
                            applicationId: tutor.applicationId,
                            tutorName: tutor.tutorName,
                          })
                        }
                        className="flex items-center gap-1.5 px-5 py-2.5 rounded-lg text-xs font-semibold transition-all hover:opacity-90"
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
              </div>
            );
          })}
        </div>
      )}

      {/* Review Modal */}
      {reviewModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={handleCloseModal}
          />
          <div
            className="relative w-full max-w-md rounded-2xl p-6"
            style={{ background: "var(--bg-card)", border: "1px solid var(--border-color)" }}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-lg font-semibold" style={{ color: "var(--text-primary)" }}>
                Review {reviewModal.tutorName}
              </h3>
              <button
                onClick={handleCloseModal}
                className="p-1.5 rounded-lg hover:bg-white/5 transition-colors"
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
                      size={32}
                      style={{ color: star <= reviewRating ? "var(--accent)" : "var(--text-faint)" }}
                      fill={star <= reviewRating ? "var(--accent)" : "none"}
                    />
                  </button>
                ))}
              </div>
              {reviewRating > 0 && (
                <p className="text-xs text-[var(--text-muted)] mt-1">
                  {reviewRating === 1 && "Poor"}
                  {reviewRating === 2 && "Below Average"}
                  {reviewRating === 3 && "Average"}
                  {reviewRating === 4 && "Good"}
                  {reviewRating === 5 && "Excellent"}
                </p>
              )}
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
                className="w-full px-4 py-3 rounded-xl text-sm resize-none outline-none transition-colors focus:ring-1 focus:ring-[var(--accent)]"
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
                onClick={handleCloseModal}
                className="px-4 py-2 rounded-xl text-sm font-medium transition-colors"
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
                {reviewSubmitting ? (
                  <>
                    <Loader2 size={14} className="animate-spin" /> Submitting...
                  </>
                ) : (
                  "Submit Review"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
