import { useData } from "@/context/DataContext";
import { useTheme } from "@/context/ThemeContext";
import { useInView } from "@/hooks/useInView";
import {
  Star,
  MessageSquare,
  TrendingUp,
  Users,
} from "lucide-react";

export default function TutorReviews() {
  const { reviews } = useData();
  const { colors } = useTheme();
  const { ref, inView } = useInView();

  const totalReviews = reviews.length;
  const avgRating =
    totalReviews > 0
      ? (reviews.reduce((sum, r) => sum + r.rating, 0) / totalReviews).toFixed(1)
      : "0.0";

  // Rating breakdown (5 → 1)
  const breakdown = [5, 4, 3, 2, 1].map((star) => ({
    star,
    count: reviews.filter((r) => r.rating === star).length,
    pct:
      totalReviews > 0
        ? Math.round((reviews.filter((r) => r.rating === star).length / totalReviews) * 100)
        : 0,
  }));

  return (
    <div ref={ref as React.RefObject<HTMLDivElement>} className="space-y-8">
      {/* Header */}
      <div className={`fade-up ${inView ? "in-view" : ""}`}>
        <h1 className="text-2xl font-semibold" style={{ color: colors.textPrimary }}>
          Reviews
        </h1>
        <p className="text-sm mt-1" style={{ color: colors.textSecondary }}>
          See what parents are saying about your tutoring.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Average Rating */}
        <div
          className={`rounded-2xl p-6 fade-up delay-100 ${inView ? "in-view" : ""}`}
          style={{ background: colors.bgCard, border: `1px solid ${colors.borderColor}` }}
        >
          <div className="flex items-center gap-3 mb-4">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{ background: colors.accentBg }}
            >
              <Star size={20} style={{ color: colors.accent }} fill={colors.accent} />
            </div>
            <span className="text-xs font-medium uppercase tracking-wider" style={{ color: colors.textMuted }}>
              Average Rating
            </span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-bold" style={{ color: colors.textPrimary }}>
              {avgRating}
            </span>
            <span className="text-sm" style={{ color: colors.textMuted }}>/ 5</span>
          </div>
          <div className="flex items-center gap-1 mt-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star
                key={i}
                size={16}
                style={{
                  color: i < Math.round(Number(avgRating)) ? colors.accent : colors.textFaint,
                }}
                fill={i < Math.round(Number(avgRating)) ? colors.accent : "none"}
              />
            ))}
          </div>
        </div>

        {/* Total Reviews */}
        <div
          className={`rounded-2xl p-6 fade-up delay-200 ${inView ? "in-view" : ""}`}
          style={{ background: colors.bgCard, border: `1px solid ${colors.borderColor}` }}
        >
          <div className="flex items-center gap-3 mb-4">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{ background: "rgba(59,130,246,0.12)" }}
            >
              <MessageSquare size={20} style={{ color: "var(--badge-info-color)" }} />
            </div>
            <span className="text-xs font-medium uppercase tracking-wider" style={{ color: colors.textMuted }}>
              Total Reviews
            </span>
          </div>
          <div className="text-4xl font-bold" style={{ color: colors.textPrimary }}>
            {totalReviews}
          </div>
          <div className="text-xs mt-2" style={{ color: colors.textMuted }}>
            {totalReviews === 1 ? "review received" : "reviews received"}
          </div>
        </div>

        {/* 5-Star Count */}
        <div
          className={`rounded-2xl p-6 fade-up delay-300 ${inView ? "in-view" : ""}`}
          style={{ background: colors.bgCard, border: `1px solid ${colors.borderColor}` }}
        >
          <div className="flex items-center gap-3 mb-4">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{ background: "rgba(168,85,247,0.12)" }}
            >
              <TrendingUp size={20} style={{ color: "var(--badge-purple-color)" }} />
            </div>
            <span className="text-xs font-medium uppercase tracking-wider" style={{ color: colors.textMuted }}>
              5-Star Reviews
            </span>
          </div>
          <div className="text-4xl font-bold" style={{ color: colors.textPrimary }}>
            {reviews.filter((r) => r.rating === 5).length}
          </div>
          <div className="text-xs mt-2" style={{ color: colors.textMuted }}>
            {totalReviews > 0
              ? `${Math.round((reviews.filter((r) => r.rating === 5).length / totalReviews) * 100)}% of all reviews`
              : "No reviews yet"}
          </div>
        </div>
      </div>

      {/* Rating Breakdown */}
      {totalReviews > 0 && (
        <div
          className={`rounded-2xl p-6 fade-up delay-400 ${inView ? "in-view" : ""}`}
          style={{ background: colors.bgCard, border: `1px solid ${colors.borderColor}` }}
        >
          <h2 className="text-sm font-medium mb-4" style={{ color: colors.textSecondary }}>
            Rating Breakdown
          </h2>
          <div className="space-y-3">
            {breakdown.map((row) => (
              <div key={row.star} className="flex items-center gap-3">
                <div className="flex items-center gap-1 w-12 shrink-0">
                  <span className="text-sm font-medium" style={{ color: colors.textPrimary }}>
                    {row.star}
                  </span>
                  <Star size={12} style={{ color: colors.accent }} fill={colors.accent} />
                </div>
                <div
                  className="flex-1 h-2.5 rounded-full overflow-hidden"
                  style={{ background: colors.bgInput }}
                >
                  <div
                    className="h-full rounded-full transition-all"
                    style={{
                      width: `${row.pct}%`,
                      background: colors.accent,
                      minWidth: row.count > 0 ? "8px" : "0",
                    }}
                  />
                </div>
                <span className="text-xs w-16 text-right shrink-0" style={{ color: colors.textMuted }}>
                  {row.count} {row.count === 1 ? "review" : "reviews"}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* All Reviews */}
      <div className={`fade-up delay-500 ${inView ? "in-view" : ""}`}>
        <h2 className="text-sm font-medium mb-4" style={{ color: colors.textSecondary }}>
          All Reviews
        </h2>
        {totalReviews === 0 ? (
          <div
            className="rounded-2xl p-12 text-center"
            style={{ background: colors.bgCard, border: `1px solid ${colors.borderColor}` }}
          >
            <Star size={40} className="mx-auto mb-4" style={{ color: colors.textFaint }} />
            <h3 className="text-lg font-semibold mb-2" style={{ color: colors.textPrimary }}>
              No Reviews Yet
            </h3>
            <p className="text-sm max-w-sm mx-auto" style={{ color: colors.textSecondary }}>
              Once parents accept your application and leave a review, they'll appear here.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {reviews.map((review, i) => (
              <div
                key={review.id}
                className={`rounded-2xl px-6 py-5 fade-up delay-${Math.min((i + 1) * 100, 400)} ${inView ? "in-view" : ""}`}
                style={{ background: colors.bgCard, border: `1px solid ${colors.borderColor}` }}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-xs"
                      style={{ background: colors.accentBg, color: colors.accent }}
                    >
                      {(review.parentName || "P")[0].toUpperCase()}
                    </div>
                    <div>
                      <div className="text-sm font-medium" style={{ color: colors.textPrimary }}>
                        {review.parentName || "Parent"}
                      </div>
                      <div className="text-xs" style={{ color: colors.textMuted }}>
                        {new Date(review.createdAt).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        })}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        size={14}
                        style={{
                          color: i < review.rating ? colors.accent : colors.textFaint,
                        }}
                        fill={i < review.rating ? colors.accent : "none"}
                      />
                    ))}
                  </div>
                </div>
                {review.description && (
                  <p className="text-sm leading-relaxed" style={{ color: colors.textSecondary }}>
                    {review.description}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
