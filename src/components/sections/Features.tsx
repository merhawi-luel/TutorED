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

  const handleTabClick = (tab: Tab) => {
    const sectionId = tab === "tutors" ? "for-tutors" : "for-agencies";
    // Update hash without full navigation (stays on landing page)
    window.history.replaceState(null, "", `#${sectionId}`);
    // Scroll into view
    document.getElementById(sectionId)?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section
      id="for-tutors"
      ref={sectionRef as React.RefObject<HTMLElement>}
      className="py-16 sm:py-24 px-4 sm:px-6 md:px-12"
      style={{ background: "linear-gradient(160deg, #000000 0%, #050F07 50%, #000000 100%)" }}
    >
      {/* Anchor for "For Agencies" navbar link */}
      <div id="for-agencies" style={{ height: 0, margin: 0, padding: 0 }} />
      <div className="max-w-6xl mx-auto">
        <div className={`fade-up ${inView ? "in-view" : ""}`}>
          <SectionHeader label="Features" title="Built for every role" dark />
        </div>

        {/* Tab Switcher */}
        <div className={`text-center mb-10 sm:mb-12 fade-up delay-100 ${inView ? "in-view" : ""}`}>
          <div className="inline-flex rounded-xl p-1 gap-1" style={{ background: "#161616" }}>
            {(["tutors", "agencies"] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => handleTabClick(tab)}
                className="px-4 py-2.5 rounded-lg text-sm font-medium capitalize transition-all"
                style={
                  activeTab === tab
                    ? { background: "#111111", color: "#22C55E", boxShadow: "0 1px 4px rgba(34,197,94,0.2)" }
                    : { color: "#6B7280" }
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
              style={{ background: "#111111", border: "1px solid #1F1F1F" }}
            >
              <div
                className="w-14 h-14 rounded-xl flex items-center justify-center shrink-0"
                style={{ background: "rgba(34,197,94,0.15)" }}
              >
                <span style={{ color: "#22C55E", fontSize: 26 }}>✦</span>
              </div>
              <div>
                <h3 className="font-semibold text-white text-lg mb-2">{f.title}</h3>
                <p className="text-base text-gray-400 leading-relaxed">{f.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
