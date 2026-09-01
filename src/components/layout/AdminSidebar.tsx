import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { useTheme } from "@/context/ThemeContext";
import {
  LayoutDashboard,
  ShieldCheck,
  FileSearch,
  Users,
  Building2,
  Shield,
  GraduationCap,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Sun,
  Moon,
  Receipt,
} from "lucide-react";

export type AdminTab =
  | "overview"
  | "verifications"
  | "documents"
  | "education"
  | "tutors"
  | "agencies"
  | "agency-receipts"
  | "admins"
  | "settings";

interface SidebarProps {
  activeTab: AdminTab;
  onTabChange: (tab: AdminTab) => void;
}

const NAV_ITEMS: { tab: AdminTab; label: string; icon: typeof LayoutDashboard }[] = [
  { tab: "overview", label: "Overview", icon: LayoutDashboard },
  { tab: "verifications", label: "Verification Queue", icon: ShieldCheck },
  { tab: "documents", label: "Documents", icon: FileSearch },
  { tab: "education", label: "Education Review", icon: GraduationCap },
  { tab: "tutors", label: "Tutors", icon: Users },
  { tab: "agencies", label: "Agencies", icon: Building2 },
  { tab: "agency-receipts", label: "Agency Receipts", icon: Receipt },
  { tab: "admins", label: "Admins", icon: Shield },
];

export default function AdminSidebar({ activeTab, onTabChange }: SidebarProps) {
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
            className="ml-auto px-2 py-0.5 rounded text-[10px] font-medium"
            style={{ background: colors.badgePurpleBg, color: colors.badgePurpleColor }}
          >
            Admin
          </span>
        )}
      </div>

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
