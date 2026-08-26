import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import {
  LayoutDashboard,
  User,
  Briefcase,
  Building2,
  FileText,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

export type ParentTab =
  | "overview"
  | "profile"
  | "recruitment"
  | "vacancies"
  | "requests"
  | "settings";

interface SidebarProps {
  activeTab: ParentTab;
  onTabChange: (tab: ParentTab) => void;
}

const NAV_ITEMS: { tab: ParentTab; label: string; icon: typeof LayoutDashboard }[] = [
  { tab: "overview", label: "Overview", icon: LayoutDashboard },
  { tab: "profile", label: "My Profile", icon: User },
  { tab: "recruitment", label: "Find a Tutor", icon: Building2 },
  { tab: "vacancies", label: "Browse Vacancies", icon: Briefcase },
  { tab: "requests", label: "My Requests", icon: FileText },
];

export default function ParentSidebar({ activeTab, onTabChange }: SidebarProps) {
  const [collapsed, setCollapsed] = useState(false);
  const { logout } = useAuth();
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
        background: "#0A0A0A",
        borderRight: "1px solid #1F1F1F",
      }}
    >
      {/* Logo */}
      <div className="flex items-center gap-3 px-5 h-16 shrink-0" style={{ borderBottom: "1px solid #1F1F1F" }}>
        <div
          className="w-8 h-8 rounded-lg flex items-center justify-center text-black font-bold text-xs shrink-0"
          style={{ background: "linear-gradient(135deg, #22C55E, #16A34A)" }}
        >
          E
        </div>
        {!collapsed && (
          <span className="font-semibold text-white text-sm tracking-tight">EduVerify</span>
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
                background: isActive ? "rgba(34,197,94,0.12)" : "transparent",
                color: isActive ? "#22C55E" : "#6B7280",
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
      <div className="px-3 py-4 space-y-1" style={{ borderTop: "1px solid #1F1F1F" }}>
        <button
          className="w-full flex items-center gap-3 rounded-xl text-sm transition-colors"
          style={{
            padding: collapsed ? "10px 0" : "10px 14px",
            justifyContent: collapsed ? "center" : "flex-start",
            color: "#6B7280",
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
            color: "#6B7280",
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
        style={{ background: "#111111", border: "1px solid #1F1F1F", color: "#6B7280" }}
      >
        {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
      </button>
    </aside>
  );
}
