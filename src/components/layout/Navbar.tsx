import { useState, useEffect, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { useTheme } from "@/context/ThemeContext";
import { NAV_LINKS } from "@/data/landing";
import { Menu, X, LogOut, Sun, Moon } from "lucide-react";

const ROLE_LABELS: Record<string, { label: string; color: string }> = {
  tutor: { label: "Tutor", color: "#22C55E" },
  agency: { label: "Agency", color: "#60A5FA" },
  admin: { label: "Admin", color: "#C084FC" },
};

export default function Navbar() {
  const { user, logout } = useAuth();
  const { colors, isDark, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  const isLanding = location.pathname === "/";

  const handleSectionLink = useCallback(
    (e: React.MouseEvent<HTMLAnchorElement>, sectionId: string) => {
      if (isLanding) return;
      e.preventDefault();
      navigate(`/#${sectionId}`);
    },
    [isLanding, navigate],
  );

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const dashboardPath = user
    ? user.role === "tutor"
      ? "/tutor"
      : user.role === "agency"
      ? "/agency"
      : user.role === "parent"
      ? "/parent"
      : "/admin"
    : null;

  const handleLogout = () => {
    logout();
    navigate("/");
    setMobileMenuOpen(false);
  };

  // Dynamic colors based on theme
  const navBg = scrolled
    ? isDark
      ? "rgba(0,0,0,0.95)"
      : `${colors.bgCard}`
    : isDark
    ? "rgba(0,0,0,0.6)"
    : `${colors.bgPage}CC`;

  const navBorder = scrolled
    ? `1px solid ${colors.borderColor}`
    : `1px solid ${colors.borderSubtle}`;

  const navShadow = scrolled ? "0 4px 32px rgba(0,0,0,0.15)" : "none";

  return (
    <>
      <nav
        className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-8 md:px-24 transition-all duration-300"
        style={{
          height: scrolled ? "64px" : "76px",
          background: navBg,
          backdropFilter: "blur(16px)",
          borderBottom: navBorder,
          boxShadow: navShadow,
        }}
      >
        {/* Logo */}
        <a href="/" className="flex items-center gap-3 group">
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center font-bold text-sm transition-transform group-hover:scale-105"
            style={{ background: colors.logoGradient, color: isDark ? "#000" : "#fff" }}
          >
            E
          </div>
          <span
            className="font-semibold text-xl tracking-tight"
            style={{ color: colors.textPrimary, letterSpacing: "-0.02em" }}
          >
            EduVerify
          </span>
        </a>

        {/* Desktop Nav Links */}
        <div
          className="hidden md:flex items-center gap-1 px-2 py-1.5 rounded-2xl"
          style={{ background: colors.accentBg, border: `1px solid ${colors.accentBorder}` }}
        >
          {NAV_LINKS.map((link) => {
            const sectionId = link.toLowerCase().replace(/\s+/g, "-");
            return (
              <a
                key={link}
                href={`#${sectionId}`}
                className="px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200"
                style={{ color: colors.textMuted }}
                onClick={(e) => handleSectionLink(e, sectionId)}
                onMouseEnter={(e) => {
                  (e.target as HTMLElement).style.color = colors.textPrimary;
                  (e.target as HTMLElement).style.background = colors.accentBg;
                }}
                onMouseLeave={(e) => {
                  (e.target as HTMLElement).style.color = colors.textMuted;
                  (e.target as HTMLElement).style.background = "transparent";
                }}
              >
                {link}
              </a>
            );
          })}
          <a
            href="/vacancies"
            className="px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200"
            style={{ color: colors.textMuted }}
            onMouseEnter={(e) => {
              (e.target as HTMLElement).style.color = colors.textPrimary;
              (e.target as HTMLElement).style.background = colors.accentBg;
            }}
            onMouseLeave={(e) => {
              (e.target as HTMLElement).style.color = colors.textMuted;
              (e.target as HTMLElement).style.background = "transparent";
            }}
          >
            Vacancies
          </a>
        </div>

        {/* Desktop Auth */}
        <div className="hidden md:flex items-center gap-3">
          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className="p-2 rounded-lg transition-colors"
            style={{ color: colors.textMuted }}
            title={isDark ? "Switch to Light" : "Switch to Dark"}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLElement).style.color = colors.textPrimary;
              (e.currentTarget as HTMLElement).style.background = colors.accentBg;
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLElement).style.color = colors.textMuted;
              (e.currentTarget as HTMLElement).style.background = "transparent";
            }}
          >
            {isDark ? <Sun size={18} /> : <Moon size={18} />}
          </button>

          {user ? (
            <>
              <a
                href={dashboardPath!}
                className="px-4 py-2 rounded-xl text-sm font-medium transition-colors"
                style={{ color: colors.textSecondary }}
              >
                Dashboard
              </a>
              <div
                className="flex items-center gap-2 px-3 py-1.5 rounded-xl"
                style={{ background: colors.accentBg, border: `1px solid ${colors.accentBorder}` }}
              >
                <div
                  className="w-6 h-6 rounded-md flex items-center justify-center text-[10px] font-bold"
                  style={{ background: ROLE_LABELS[user.role]?.color ?? colors.accent, color: isDark ? "#000" : "#fff" }}
                >
                  {user.name[0]}
                </div>
                <span className="text-sm" style={{ color: colors.textSecondary }}>{user.name.split(" ")[0]}</span>
                <span
                  className="px-1.5 py-0.5 rounded text-[9px] font-medium"
                  style={{ background: `${ROLE_LABELS[user.role]?.color}20`, color: ROLE_LABELS[user.role]?.color ?? colors.accent }}
                >
                  {ROLE_LABELS[user.role]?.label}
                </span>
              </div>
              <button
                onClick={handleLogout}
                className="p-2 rounded-lg transition-all"
                style={{ color: colors.textMuted }}
                title="Sign out"
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLElement).style.color = colors.textPrimary;
                  (e.currentTarget as HTMLElement).style.background = colors.accentBg;
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLElement).style.color = colors.textMuted;
                  (e.currentTarget as HTMLElement).style.background = "transparent";
                }}
              >
                <LogOut size={16} />
              </button>
            </>
          ) : (
            <>
              <a
                href="/login"
                className="px-5 py-2.5 rounded-xl text-sm font-medium transition-colors"
                style={{ color: colors.textSecondary }}
                onMouseEnter={(e) => {
                  (e.target as HTMLElement).style.color = colors.textPrimary;
                }}
                onMouseLeave={(e) => {
                  (e.target as HTMLElement).style.color = colors.textSecondary;
                }}
              >
                Sign In
              </a>
              <a
                href="/register"
                className="px-5 py-2.5 rounded-xl text-sm font-semibold transition-all hover:opacity-90 hover:scale-105 active:scale-100"
                style={{
                  background: colors.accent,
                  color: "#fff",
                  boxShadow: `0 0 16px ${colors.accentBg}`,
                }}
              >
                Get Started
              </a>
            </>
          )}
        </div>

        {/* Mobile Toggle */}
        <button
          className="md:hidden p-2 rounded-lg transition-colors"
          style={{ color: colors.textMuted, background: colors.accentBg }}
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
          maxHeight: mobileMenuOpen ? "500px" : "0px",
          background: isDark ? "rgba(5,15,7,0.98)" : `${colors.bgCard}F8`,
          backdropFilter: "blur(16px)",
          borderBottom: mobileMenuOpen ? `1px solid ${colors.borderColor}` : "none",
        }}
      >
        <div className="px-6 py-6 flex flex-col gap-1">
          {NAV_LINKS.map((link) => {
            const sectionId = link.toLowerCase().replace(/\s+/g, "-");
            return (
              <a
                key={link}
                href={`#${sectionId}`}
                className="px-4 py-3 rounded-xl text-base transition-all"
                style={{ color: colors.textSecondary }}
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
            className="px-4 py-3 rounded-xl text-base transition-all"
            style={{ color: colors.textSecondary }}
            onClick={() => setMobileMenuOpen(false)}
          >
            Vacancies
          </a>

          {/* Theme Toggle in Mobile */}
          <button
            onClick={() => { toggleTheme(); setMobileMenuOpen(false); }}
            className="px-4 py-3 rounded-xl text-base transition-all flex items-center gap-3"
            style={{ color: colors.textSecondary }}
          >
            {isDark ? <Sun size={18} /> : <Moon size={18} />}
            {isDark ? "Light Mode" : "Dark Mode"}
          </button>

          <div className="mt-4 pt-4 flex flex-col gap-3" style={{ borderTop: `1px solid ${colors.borderColor}` }}>
            {user ? (
              <>
                <div className="flex items-center gap-2 px-4 py-2 text-sm" style={{ color: colors.textSecondary }}>
                  <div
                    className="w-6 h-6 rounded-md flex items-center justify-center text-[10px] font-bold"
                    style={{ background: ROLE_LABELS[user.role]?.color ?? colors.accent, color: isDark ? "#000" : "#fff" }}
                  >
                    {user.name[0]}
                  </div>
                  <span>{user.name}</span>
                  <span
                    className="px-1.5 py-0.5 rounded text-[9px] font-medium"
                    style={{ background: `${ROLE_LABELS[user.role]?.color}20`, color: ROLE_LABELS[user.role]?.color ?? colors.accent }}
                  >
                    {ROLE_LABELS[user.role]?.label}
                  </span>
                </div>
                <a
                  href={dashboardPath!}
                  className="px-4 py-3 rounded-xl text-base text-center font-medium transition-colors"
                  style={{ background: colors.accentBg, color: colors.accent }}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Go to Dashboard
                </a>
                <button
                  onClick={handleLogout}
                  className="px-4 py-3 rounded-xl text-base text-center transition-colors"
                  style={{ color: colors.textMuted }}
                >
                  Sign Out
                </button>
              </>
            ) : (
              <>
                <a
                  href="/login"
                  className="px-4 py-3 rounded-xl text-base transition-colors text-center"
                  style={{ color: colors.textSecondary }}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Sign In
                </a>
                <a
                  href="/register"
                  className="px-4 py-3 rounded-xl text-base font-semibold text-center"
                  style={{ background: colors.accent, color: "#fff" }}
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