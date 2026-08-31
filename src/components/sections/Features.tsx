import { useTheme } from "@/context/ThemeContext";
import { FEATURES_TUTOR, FEATURES_AGENCY } from "@/data/landing";
import SectionHeader from "@/components/shared/SectionHeader";
import { useInView } from "@/hooks/useInView";
import { useLocation } from "react-router-dom";

type Tab = "tutors" | "agencies";

function getTabFromHash(hash: string): Tab {
  return hash === "for-agencies" ? "agencies" : "tutors";
}

export default function Features() {
  const location = useLocation();
  const hash = location.hash.replace("#", "");
  const activeTab = getTabFromHash(hash);
  const features = activeTab === "tutors" ? FEATURES_TUTOR : FEATURES_AGENCY;
  const { ref: sectionRef, inView } = useInView();
  const { colors, isDark } = useTheme();

  const handleTabClick = (tab: Tab) => {
    const sectionId = tab === "tutors" ? "for-tutors" : "for-agencies";
    window.history.replaceState(null, "", `#${sectionId}`);
    document.getElementById(sectionId)?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section
      id="for-tutors"
      ref={sectionRef as React.RefObject<HTMLElement>}
      className="py-16 sm:py-24 px-4 sm:px-6 md:px-12"
      style={{ background: isDark ? "linear-gradient(160deg, var(--bg-page) 0%, var(--bg-card) 50%, var(--bg-page) 100%)" : `linear-gradient(160deg, ${colors.bgPage} 0%, ${colors.bgCard} 50%, ${colors.bgPage} 100%)` }}
    >
      {/* Anchor for "For Agencies" navbar link */}
      <div id="for-agencies" style={{ height: 0, margin: 0, padding: 0 }} />
      <div className="max-w-6xl mx-auto">
        <div className={`fade-up ${inView ? "in-view" : ""}`}>
          <SectionHeader label="Features" title="Built for every role" />
        </div>

        {/* Tab Switcher */}
        <div className={`text-center mb-10 sm:mb-12 fade-up delay-100 ${inView ? "in-view" : ""}`}>
          <div className="inline-flex rounded-xl p-1 gap-1" style={{ background: colors.bgInput }}>
            {(["tutors", "agencies"] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => handleTabClick(tab)}
                className="px-4 py-2.5 rounded-lg text-sm font-medium capitalize transition-all"
                style={
                  activeTab === tab
                    ? { background: colors.bgCard, color: colors.accent, boxShadow: `0 1px 4px ${colors.accentBg}` }
                    : { color: colors.textMuted }
                }
              >
                {tab === "tutors" ? "For Tutors" : "For Agencies"}
              </button>
            ))}
          </div>
        </div>

        <div className="grid sm:grid-cols-2 gap-6 sm:gap-8">
          {features.map((f, i) => (
            <div
              key={f.title}
              className={`flex gap-5 p-8 rounded-2xl transition-all hover:-translate-y-0.5 fade-up delay-${(i + 2) * 100} ${inView ? "in-view" : ""}`}
              style={{ background: colors.bgCard, border: `1px solid ${colors.borderColor}` }}
            >
              <div
                className="w-14 h-14 rounded-xl flex items-center justify-center shrink-0"
                style={{ background: colors.accentBg }}
              >
                <span style={{ color: colors.accent, fontSize: 26 }}>✦</span>
              </div>
              <div>
                <h3 className="font-semibold text-lg mb-2" style={{ color: colors.textPrimary }}>{f.title}</h3>
                <p className="text-base leading-relaxed" style={{ color: colors.textSecondary }}>{f.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}