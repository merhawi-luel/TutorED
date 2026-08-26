import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import {
  LayoutDashboard,
  Briefcase,
  Users,
  Send,
  Building2,
  Search,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

export type AgencyTab =
  | "overview"
  | "vacancies"
  | "applicants"
  | "tutors"
  | "organization"
  | "settings";

interface SidebarProps {
  activeTab: AgencyTab;
  onTabChange: (tab: AgencyTab) => void;
  orgName: string;
}

const NAV_ITEMS: { tab: AgencyTab; label: string; icon: typeof LayoutDashboard }[] = [
  { tab: "overview", label: "Overview", icon: LayoutDashboard },
  { tab: "vacancies", label: "Vacancies", icon: Briefcase },
  { tab: "applicants", label: "Applicants", icon: Send },
  { tab: "tutors", label: "Find Tutors", icon: Search },
  { tab: "organization", label: "Organization", icon: Building2 },
];

export default function AgencySidebar({ activeTab, onTabChange, orgName }: SidebarProps) {
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
        {!collapsed && <span className="font-semibold text-white text-sm tracking-tight">EduVerify</span>}
        {!collapsed && (
          <span
            className="ml-auto px-2 py-0.5 rounded text-[10px] font-medium truncate max-w-[70px]"
            style={{ background: "rgba(59,130,246,0.15)", color: "#60A5FA" }}
          >
            Agency
          </span>
        )}
      </div>

      {/* Org Name */}
      {!collapsed && (
        <div className="px-5 py-3" style={{ borderBottom: "1px solid #1F1F1F" }}>
          <div className="text-xs text-gray-500">Organization</div>
          <div className="text-sm font-medium text-white truncate">{orgName}</div>
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
          className="w-full flex items-center gap-3 rounded-xl text-sm"
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
          className="w-full flex items-center gap-3 rounded-xl text-sm hover:text-white"
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

      {/* Collapse */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="hidden md:flex items-center justify-center h-10 mx-3 mb-3 rounded-lg"
        style={{ background: "#111111", border: "1px solid #1F1F1F", color: "#6B7280" }}
      >
        {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
      </button>
    </aside>
  );
}
