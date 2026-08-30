import { useState, useEffect, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { NAV_LINKS } from "@/data/landing";
import { Menu, X, LogOut } from "lucide-react";

const ROLE_LABELS: Record<string, { label: string; color: string }> = {
  tutor: { label: "Tutor", color: "#22C55E" },
  agency: { label: "Agency", color: "#60A5FA" },
  admin: { label: "Admin", color: "#C084FC" },
};

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  const isLanding = location.pathname === "/";

  const handleSectionLink = useCallback((
    e: React.MouseEvent<HTMLAnchorElement>,
    sectionId: string,
  ) => {
    if (isLanding) {
      // On landing page: let native anchor do the scroll
      return;
    }
    // On another page: navigate to landing page + hash
    e.preventDefault();
    navigate(`/#${sectionId}`);
  }, [isLanding, navigate]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const dashboardPath = user ? (user.role === "tutor" ? "/tutor" : user.role === "agency" ? "/agency" : "/admin") : null;

  const handleLogout = () => {
    logout();
    navigate("/");
    setMobileMenuOpen(false);
  };

  return (
    <>
      <nav
        className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-8 md:px-24 transition-all duration-300"
        style={{
          height: scrolled ? "64px" : "76px",
          background: scrolled ? "rgba(0,0,0,0.95)" : "rgba(0,0,0,0.6)",
          backdropFilter: "blur(16px)",
          borderBottom: scrolled
            ? "1px solid rgba(34,197,94,0.15)"
            : "1px solid rgba(255,255,255,0.04)",
          boxShadow: scrolled ? "0 4px 32px rgba(0,0,0,0.4)" : "none",
        }}
      >
        {/* Logo */}
        <a href="/" className="flex items-center gap-3 group">
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center text-black font-bold text-sm transition-transform group-hover:scale-105"
            style={{ background: "linear-gradient(135deg, #22C55E, #16A34A)" }}
          >
            E
          </div>
          <span
            className="font-semibold text-xl tracking-tight text-white"
            style={{ letterSpacing: "-0.02em" }}
          >
            EduVerify
          </span>
        </a>

        {/* Desktop Nav Links */}
        <div
          className="hidden md:flex items-center gap-1 px-2 py-1.5 rounded-2xl"
          style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)" }}
        >
          {NAV_LINKS.map((link) => {
            const sectionId = link.toLowerCase().replace(/\s+/g, "-");
            return (
              <a
                key={link}
                href={`#${sectionId}`}
                className="px-4 py-2 rounded-xl text-sm font-medium text-gray-400 hover:text-white hover:bg-white/8 transition-all duration-200"
                onClick={(e) => handleSectionLink(e, sectionId)}
              >
                {link}
              </a>
            );
          })}
          <a
            href="/vacancies"
            className="px-4 py-2 rounded-xl text-sm font-medium text-gray-400 hover:text-white hover:bg-white/8 transition-all duration-200"
          >
            Vacancies
          </a>
        </div>

        {/* Desktop Auth */}
        <div className="hidden md:flex items-center gap-3">
          {user ? (
            <>
              <a
                href={dashboardPath!}
                className="px-4 py-2 rounded-xl text-sm font-medium text-gray-300 hover:text-white transition-colors"
              >
                Dashboard
              </a>
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl" style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)" }}>
                <div
                  className="w-6 h-6 rounded-md flex items-center justify-center text-[10px] font-bold text-black"
                  style={{ background: ROLE_LABELS[user.role]?.color ?? "#22C55E" }}
                >
                  {user.name[0]}
                </div>
                <span className="text-sm text-gray-300">{user.name.split(" ")[0]}</span>
                <span
                  className="px-1.5 py-0.5 rounded text-[9px] font-medium"
                  style={{ background: `${ROLE_LABELS[user.role]?.color}20`, color: ROLE_LABELS[user.role]?.color ?? "#22C55E" }}
                >
                  {ROLE_LABELS[user.role]?.label}
                </span>
              </div>
              <button
                onClick={handleLogout}
                className="p-2 rounded-lg text-gray-500 hover:text-white hover:bg-white/5 transition-all"
                title="Sign out"
              >
                <LogOut size={16} />
              </button>
            </>
          ) : (
            <>
              <a
                href="/login"
                className="px-5 py-2.5 rounded-xl text-sm font-medium text-gray-300 hover:text-white transition-colors"
              >
                Sign In
              </a>
              <a
                href="/register"
                className="px-5 py-2.5 rounded-xl text-sm font-semibold text-black transition-all hover:opacity-90 hover:scale-105 active:scale-100"
                style={{
                  background: "linear-gradient(135deg, #22C55E, #16A34A)",
                  boxShadow: "0 0 16px rgba(34,197,94,0.35)",
                }}
              >
                Get Started
              </a>
            </>
          )}
        </div>

        {/* Mobile Toggle */}
        <button
          className="md:hidden text-gray-300 hover:text-white p-2 rounded-lg transition-colors"
          style={{ background: "rgba(255,255,255,0.05)" }}
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label="Toggle menu"
        >
          {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </nav>

      {/* Mobile Menu */}
      <div
        className="fixed left-0 right-0 z-40 md:hidden overflow-hidden transition-all duration-300 ease-in-out"
        style={{
          top: scrolled ? "64px" : "76px",
          maxHeight: mobileMenuOpen ? "400px" : "0px",
          background: "rgba(5,15,7,0.98)",
          backdropFilter: "blur(16px)",
          borderBottom: mobileMenuOpen ? "1px solid rgba(34,197,94,0.12)" : "none",
        }}
      >
        <div className="px-6 py-6 flex flex-col gap-1">
          {NAV_LINKS.map((link) => {
            const sectionId = link.toLowerCase().replace(/\s+/g, "-");
            return (
              <a
                key={link}
                href={`#${sectionId}`}
                className="px-4 py-3 rounded-xl text-base text-gray-300 hover:text-white hover:bg-white/5 transition-all"
                onClick={(e) => {
                  handleSectionLink(e, sectionId);
                  setMobileMenuOpen(false);
                }}
              >
                {link}
              </a>
            );
          })}
          <a
            href="/vacancies"
            className="px-4 py-3 rounded-xl text-base text-gray-300 hover:text-white hover:bg-white/5 transition-all"
            onClick={() => setMobileMenuOpen(false)}
          >
            Vacancies
          </a>
          <div className="mt-4 pt-4 flex flex-col gap-3" style={{ borderTop: "1px solid rgba(255,255,255,0.07)" }}>
            {user ? (
              <>
                <div className="flex items-center gap-2 px-4 py-2 text-sm text-gray-300">
                  <div
                    className="w-6 h-6 rounded-md flex items-center justify-center text-[10px] font-bold text-black"
                    style={{ background: ROLE_LABELS[user.role]?.color ?? "#22C55E" }}
                  >
                    {user.name[0]}
                  </div>
                  <span>{user.name}</span>
                  <span
                    className="px-1.5 py-0.5 rounded text-[9px] font-medium"
                    style={{ background: `${ROLE_LABELS[user.role]?.color}20`, color: ROLE_LABELS[user.role]?.color ?? "#22C55E" }}
                  >
                    {ROLE_LABELS[user.role]?.label}
                  </span>
                </div>
                <a
                  href={dashboardPath!}
                  className="px-4 py-3 rounded-xl text-base text-center font-medium transition-colors"
                  style={{ background: "rgba(34,197,94,0.12)", color: "#22C55E" }}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Go to Dashboard
                </a>
                <button
                  onClick={handleLogout}
                  className="px-4 py-3 rounded-xl text-base text-gray-400 hover:text-white text-center transition-colors"
                >
                  Sign Out
                </button>
              </>
            ) : (
              <>
                <a
                  href="/login"
                  className="px-4 py-3 rounded-xl text-base text-gray-300 hover:text-white transition-colors text-center"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Sign In
                </a>
                <a
                  href="/register"
                  className="px-4 py-3 rounded-xl text-base font-semibold text-black text-center"
                  style={{ background: "linear-gradient(135deg, #22C55E, #16A34A)" }}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Get Started
                </a>
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
