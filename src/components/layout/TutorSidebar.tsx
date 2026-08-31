import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { useTheme } from "@/context/ThemeContext";
import {
  LayoutDashboard,
  User,
  ShieldCheck,
  Briefcase,
  Send,
  GraduationCap,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Sun,
  Moon,
} from "lucide-react";

export type TutorTab =
  | "overview"
  | "profile"
  | "docs-verification"
  | "education"
  | "vacancies"
  | "applications"
  | "settings";

interface SidebarProps {
  activeTab: TutorTab;
  onTabChange: (tab: TutorTab) => void;
}

const NAV_ITEMS: { tab: TutorTab; label: string; icon: typeof LayoutDashboard }[] = [
  { tab: "overview", label: "Overview", icon: LayoutDashboard },
  { tab: "profile", label: "My Profile", icon: User },
  { tab: "docs-verification", label: "Docs & Verification", icon: ShieldCheck },
  { tab: "education", label: "Education", icon: GraduationCap },
  { tab: "vacancies", label: "Vacancies", icon: Briefcase },
  { tab: "applications", label: "Applications", icon: Send },
];

export default function Sidebar({ activeTab, onTabChange }: SidebarProps) {
  const [collapsed, setCollapsed] = useState(false);
  const { logout } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const sidebarBg = isDark ? "#0A0A0A" : "#FFFFFF";
  const sidebarBorder = isDark ? "#1F1F1F" : "#E2E8F0";
  const activeBg = isDark ? "rgba(34,197,94,0.12)" : "rgba(22,163,74,0.08)";
  const inactiveColor = isDark ? "#6B7280" : "#94A3B8";
  const hoverBg = isDark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.03)";
  const toggleBg = isDark ? "#111111" : "#F1F5F9";
  const toggleBorder = isDark ? "#1F1F1F" : "#E2E8F0";

  return (
    <aside
      className="h-screen sticky top-0 flex flex-col transition-all duration-300 shrink-0"
      style={{
        width: collapsed ? "72px" : "260px",
        background: sidebarBg,
        borderRight: `1px solid ${sidebarBorder}`,
      }}
    >
      {/* Logo */}
      <div className="flex items-center gap-3 px-5 h-16 shrink-0" style={{ borderBottom: `1px solid ${sidebarBorder}` }}>
        <div
          className="w-8 h-8 rounded-lg flex items-center justify-center text-black font-bold text-xs shrink-0"
          style={{ background: "linear-gradient(135deg, #22C55E, #16A34A)" }}
        >
          E
        </div>
        {!collapsed && (
          <span className="font-semibold text-sm tracking-tight" style={{ color: isDark ? "#FFFFFF" : "#0F172A" }}>
            EduVerify
          </span>
        )}
      </div>

      {/* Nav Items */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.tab;
          return (
            <button
              key={item.tab}
              onClick={() => onTabChange(item.tab)}
              className="w-full flex items-center gap-3 rounded-xl transition-all text-sm font-medium"
              style={{
                padding: collapsed ? "10px 0" : "10px 14px",
                justifyContent: collapsed ? "center" : "flex-start",
                background: isActive ? activeBg : "transparent",
                color: isActive ? "#22C55E" : inactiveColor,
              }}
              onMouseEnter={(e) => {
                if (!isActive) e.currentTarget.style.background = hoverBg;
              }}
              onMouseLeave={(e) => {
                if (!isActive) e.currentTarget.style.background = "transparent";
              }}
              title={collapsed ? item.label : undefined}
            >
              <Icon size={20} strokeWidth={1.5} />
              {!collapsed && <span>{item.label}</span>}
            </button>
          );
        })}
      </nav>

      {/* Bottom */}
      <div className="px-3 py-4 space-y-1" style={{ borderTop: `1px solid ${sidebarBorder}` }}>
        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          className="w-full flex items-center gap-3 rounded-xl text-sm transition-colors"
          style={{
            padding: collapsed ? "10px 0" : "10px 14px",
            justifyContent: collapsed ? "center" : "flex-start",
            color: inactiveColor,
          }}
          onMouseEnter={(e) => (e.currentTarget.style.background = hoverBg)}
          onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
          title={collapsed ? (isDark ? "Switch to Light" : "Switch to Dark") : undefined}
        >
          {isDark ? <Sun size={20} strokeWidth={1.5} /> : <Moon size={20} strokeWidth={1.5} />}
          {!collapsed && <span>{isDark ? "Light Mode" : "Dark Mode"}</span>}
        </button>

        <button
          onClick={() => onTabChange("settings")}
          className="w-full flex items-center gap-3 rounded-xl text-sm transition-colors"
          style={{
            padding: collapsed ? "10px 0" : "10px 14px",
            justifyContent: collapsed ? "center" : "flex-start",
            color: activeTab === "settings" ? "#22C55E" : inactiveColor,
            background: activeTab === "settings" ? activeBg : "transparent",
          }}
          onMouseEnter={(e) => {
            if (activeTab !== "settings") e.currentTarget.style.background = hoverBg;
          }}
          onMouseLeave={(e) => {
            if (activeTab !== "settings") e.currentTarget.style.background = "transparent";
          }}
          title={collapsed ? "Settings" : undefined}
        >
          <Settings size={20} strokeWidth={1.5} />
          {!collapsed && <span>Settings</span>}
        </button>

        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 rounded-xl text-sm transition-colors hover:text-white"
          style={{
            padding: collapsed ? "10px 0" : "10px 14px",
            justifyContent: collapsed ? "center" : "flex-start",
            color: inactiveColor,
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = isDark ? "rgba(239,68,68,0.08)" : "rgba(239,68,68,0.06)";
            e.currentTarget.style.color = "#EF4444";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "transparent";
            e.currentTarget.style.color = inactiveColor;
          }}
          title={collapsed ? "Sign Out" : undefined}
        >
          <LogOut size={20} strokeWidth={1.5} />
          {!collapsed && <span>Sign Out</span>}
        </button>
      </div>

      {/* Collapse Toggle */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="hidden md:flex items-center justify-center h-10 mx-3 mb-3 rounded-lg transition-colors"
        style={{ background: toggleBg, border: `1px solid ${toggleBorder}`, color: inactiveColor }}
      >
        {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
      </button>
    </aside>
  );
}
