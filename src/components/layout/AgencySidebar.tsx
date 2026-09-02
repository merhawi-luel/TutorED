import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { useTheme } from "@/context/ThemeContext";
import {
  LayoutDashboard,
  Briefcase,
  Send,
  Building2,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Inbox,
  Sun,
  Moon,
  ShieldCheck,
  FileText,
} from "lucide-react";

export type AgencyTab =
  | "overview"
  | "vacancies"
  | "my-posts"
  | "applicants"
  | "requests"
  | "verification"
  | "organization"
  | "settings";

interface SidebarProps {
  activeTab: AgencyTab;
  onTabChange: (tab: AgencyTab) => void;
  orgName: string;
}

const NAV_ITEMS: { tab: AgencyTab; label: string; icon: typeof LayoutDashboard }[] = [
  { tab: "overview", label: "Overview", icon: LayoutDashboard },
  { tab: "vacancies", label: "Create Vacancy", icon: Briefcase },
  { tab: "my-posts", label: "My Posts", icon: FileText },
  { tab: "applicants", label: "Applicants", icon: Send },
  { tab: "requests", label: "Recruit Requests", icon: Inbox },
  { tab: "verification", label: "Verify Organization", icon: ShieldCheck },
  { tab: "organization", label: "Organization", icon: Building2 },
];

export default function AgencySidebar({ activeTab, onTabChange, orgName }: SidebarProps) {
  const [collapsed, setCollapsed] = useState(false);
  const { logout } = useAuth();
  const { isDark, toggleTheme, colors } = useTheme();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <aside
      className="h-screen sticky top-0 flex flex-col transition-all duration-300 shrink-0"
      style={{
        width: collapsed ? "72px" : "260px",
        background: colors.bgSidebar,
        borderRight: `1px solid ${colors.borderSubtle}`,
      }}
    >
      {/* Logo */}
      <div className="flex items-center gap-3 px-5 h-16 shrink-0" style={{ borderBottom: `1px solid ${colors.borderSubtle}` }}>
        <div
          className="w-8 h-8 rounded-lg flex items-center justify-center text-white font-bold text-xs shrink-0"
          style={{ background: colors.logoGradient }}
        >
          E
        </div>
        {!collapsed && <span className="font-semibold text-sm tracking-tight" style={{ color: colors.textPrimary }}>EduVerify</span>}
        {!collapsed && (
          <span
            className="ml-auto px-2 py-0.5 rounded text-[10px] font-medium truncate max-w-[70px]"
            style={{ background: colors.badgeInfoBg, color: colors.badgeInfoColor }}
          >
            Agency
          </span>
        )}
      </div>

      {/* Org Name */}
      {!collapsed && (
        <div className="px-5 py-3" style={{ borderBottom: `1px solid ${colors.borderSubtle}` }}>
          <div className="text-xs" style={{ color: colors.textMuted }}>Organization</div>
          <div className="text-sm font-medium truncate" style={{ color: colors.textPrimary }}>{orgName}</div>
        </div>
      )}

      {/* Nav */}
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
                background: isActive ? colors.accentBg : "transparent",
                color: isActive ? colors.accent : colors.textMuted,
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
      <div className="px-3 py-4 space-y-1" style={{ borderTop: `1px solid ${colors.borderSubtle}` }}>
        <button
          onClick={toggleTheme}
          className="w-full flex items-center gap-3 rounded-xl text-sm transition-colors"
          style={{
            padding: collapsed ? "10px 0" : "10px 14px",
            justifyContent: collapsed ? "center" : "flex-start",
            color: colors.textMuted,
          }}
          title={collapsed ? (isDark ? "Switch to Light" : "Switch to Dark") : undefined}
        >
          {isDark ? <Sun size={20} strokeWidth={1.5} /> : <Moon size={20} strokeWidth={1.5} />}
          {!collapsed && <span>{isDark ? "Light Mode" : "Dark Mode"}</span>}
        </button>
        <button
          onClick={() => onTabChange("settings")}
          className="w-full flex items-center gap-3 rounded-xl text-sm"
          style={{
            padding: collapsed ? "10px 0" : "10px 14px",
            justifyContent: collapsed ? "center" : "flex-start",
            color: activeTab === "settings" ? colors.accent : colors.textMuted,
            background: activeTab === "settings" ? colors.accentBg : "transparent",
          }}
          title={collapsed ? "Settings" : undefined}
        >
          <Settings size={20} strokeWidth={1.5} />
          {!collapsed && <span>Settings</span>}
        </button>
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 rounded-xl text-sm transition-colors"
          style={{
            padding: collapsed ? "10px 0" : "10px 14px",
            justifyContent: collapsed ? "center" : "flex-start",
            color: colors.textMuted,
          }}
          title={collapsed ? "Sign Out" : undefined}
        >
          <LogOut size={20} strokeWidth={1.5} />
          {!collapsed && <span>Sign Out</span>}
        </button>
      </div>

      {/* Collapse */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="hidden md:flex items-center justify-center h-10 mx-3 mb-3 rounded-lg"
        style={{ background: colors.bgInput, border: `1px solid ${colors.borderSubtle}`, color: colors.textMuted }}
      >
        {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
      </button>
    </aside>
  );
}
