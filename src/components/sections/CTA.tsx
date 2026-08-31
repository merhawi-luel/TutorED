import { useTheme } from "@/context/ThemeContext";
import Button from "@/components/shared/Button";
import { useInView } from "@/hooks/useInView";

export default function CTA() {
  const { ref: sectionRef, inView } = useInView();
  const { colors, isDark } = useTheme();

  return (
    <section
      ref={sectionRef as React.RefObject<HTMLElement>}
      className="py-16 sm:py-24 px-4 sm:px-6 md:px-12 text-center"
      style={{ background: isDark ? "linear-gradient(160deg, #000000 0%, #050F07 100%)" : `linear-gradient(160deg, ${colors.bgPage} 0%, ${colors.bgCard} 100%)` }}
    >
      <div className="max-w-3xl mx-auto">
        <h2
          className={`text-3xl sm:text-4xl md:text-6xl font-light mb-6 fade-up ${inView ? "in-view" : ""}`}
          style={{ fontFamily: "Fraunces, serif", color: colors.textPrimary }}
        >
          Trust the educator.
          <br />
          <em className="not-italic" style={{ color: colors.accent }}>
            Simplify the recruitment.
          </em>
        </h2>
        <p className={`text-sm leading-relaxed mb-10 fade-up delay-100 ${inView ? "in-view" : ""}`} style={{ color: colors.textSecondary }}>
          Join verified tutors and growing agencies already building the future of education recruitment.
        </p>
        <div className={`flex flex-col sm:flex-row justify-center gap-4 fade-up delay-200 ${inView ? "in-view" : ""}`}>
          <Button variant="primary" size="hero" href="/register">
            Join as a Tutor
          </Button>
          <Button variant="secondary" size="hero" href="/register">
            Register Your Agency
          </Button>
        </div>
      </div>
    </section>
  );
}