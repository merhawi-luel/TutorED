import { useTheme } from "@/context/ThemeContext";
import { STATS } from "@/data/landing";
import Button from "@/components/shared/Button";
import Badge from "@/components/shared/Badge";

interface HeroProps {
  onNavigate?: (view: string) => void;
}

export default function Hero(_props: HeroProps) {
  const { colors, isDark } = useTheme();

  return (
    <section
      className="relative min-h-screen flex flex-col items-center justify-center text-center px-6 pt-32 pb-8 overflow-hidden"
      style={{ background: isDark ? "linear-gradient(160deg, var(--bg-page) 0%, var(--bg-card) 50%, var(--bg-page) 100%)" : `linear-gradient(160deg, ${colors.bgPage} 0%, ${colors.bgCard} 50%, ${colors.bgPage} 100%)` }}
    >
      {/* Glow blobs */}
      <div
        className="absolute top-1/4 left-1/4 w-48 h-48 md:w-72 md:h-72 rounded-full opacity-20 blur-3xl pointer-events-none"
        style={{ background: colors.accent }}
      />
      <div
        className="absolute bottom-1/4 right-1/4 w-40 h-40 md:w-64 md:h-64 rounded-full opacity-10 blur-3xl pointer-events-none"
        style={{ background: colors.accent }}
      />

      <div className="relative z-10 max-w-5xl mx-auto w-full">
        {/* Badge */}
        <Badge variant="info" className="mb-6 text-sm px-5 py-2">
          <span className="w-2 h-2 rounded-full animate-pulse" style={{ background: colors.accent }} />
          Trusted Verification Infrastructure for Education
        </Badge>

        {/* Headline */}
        <h1
          className="text-6xl md:text-8xl font-light leading-tight mb-6"
          style={{ fontFamily: "Fraunces, serif", letterSpacing: "-0.02em", color: colors.textPrimary }}
        >
          Verify once.
          <br />
          <em className="not-italic" style={{ color: colors.accent }}>
            Apply anywhere.
          </em>
        </h1>

        {/* Subtitle */}
        <p className="text-lg md:text-xl leading-relaxed max-w-2xl mx-auto mb-10" style={{ color: colors.textSecondary }}>
          The recruitment infrastructure for the education sector. Verified tutors build a single
          professional identity. Agencies recruit faster with credential trust built in.
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-14">
          <Button
            variant="primary"
            size="hero"
            href="/register"
            className="sm:w-auto w-full"
          >
            I'm a Tutor — Get Verified
          </Button>
          <Button
            variant="secondary"
            size="hero"
            href="/register"
            className="sm:w-auto w-full"
          >
            I'm an Agency — Start Recruiting
          </Button>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {STATS.map((s) => (
            <div key={s.label} className="text-center">
              <div className="text-3xl md:text-4xl font-bold mb-1" style={{ color: colors.textPrimary }}>{s.value}</div>
              <div className="text-sm uppercase tracking-widest" style={{ color: colors.textMuted }}>{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2">
        <div className="w-px h-10 opacity-30" style={{ background: `linear-gradient(to bottom, ${colors.textPrimary}, transparent)` }} />
      </div>
    </section>
  );
}