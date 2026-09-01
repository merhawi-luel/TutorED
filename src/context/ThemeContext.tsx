import { createContext, useContext, useState, useEffect, type ReactNode } from "react";

type Theme = "light" | "dark";

export interface ThemeColors {
  bgPage: string;
  bgCard: string;
  bgCardHover: string;
  bgInput: string;
  bgSidebar: string;
  borderColor: string;
  borderSubtle: string;
  textPrimary: string;
  textSecondary: string;
  textMuted: string;
  textFaint: string;
  accent: string;
  accentHover: string;
  accentBg: string;
  accentBorder: string;
  dangerColor: string;
  dangerBg: string;
  dangerBorder: string;
  badgePendingBg: string;
  badgePendingColor: string;
  badgeRejectedBg: string;
  badgeRejectedColor: string;
  badgeInfoBg: string;
  badgeInfoColor: string;
  badgePurpleBg: string;
  badgePurpleColor: string;
  logoGradient: string;
  /* Legacy aliases for backward compat */
  primary: string;
  primaryLight: string;
  primaryText: string;
  secondaryText: string;
  border: string;
  background: string;
  card: string;
}

const LIGHT_COLORS: ThemeColors = {
  bgPage: "#F4EFE6",
  bgCard: "#F8F5EF",
  bgCardHover: "#F0EBE1",
  bgInput: "#EEE8DA",
  bgSidebar: "#F8F5EF",
  borderColor: "#D8CDBD",
  borderSubtle: "#E2D9CC",
  textPrimary: "#201D1B",
  textSecondary: "#826D5E",
  textMuted: "#A69585",
  textFaint: "#C4B5A5",
  accent: "#7C3D13",
  accentHover: "#5E2E0E",
  accentBg: "rgba(124,61,19,0.08)",
  accentBorder: "rgba(124,61,19,0.25)",
  dangerColor: "#B03828",
  dangerBg: "rgba(180,60,40,0.08)",
  dangerBorder: "rgba(180,60,40,0.2)",
  badgePendingBg: "rgba(180,130,40,0.1)",
  badgePendingColor: "#A07820",
  badgeRejectedBg: "rgba(180,60,40,0.1)",
  badgeRejectedColor: "#B03828",
  badgeInfoBg: "rgba(60,100,160,0.1)",
  badgeInfoColor: "#3C64A0",
  badgePurpleBg: "rgba(120,60,160,0.1)",
  badgePurpleColor: "#783CA0",
  logoGradient: "linear-gradient(135deg, #7C3D13, #9A5224)",
  /* Legacy aliases */
  primary: "#7C3D13",
  primaryLight: "rgba(124,61,19,0.08)",
  primaryText: "#201D1B",
  secondaryText: "#826D5E",
  border: "#D8CDBD",
  background: "#F4EFE6",
  card: "#F8F5EF",
};

const DARK_COLORS: ThemeColors = {
  bgPage: "#0D0B14",
  bgCard: "#141028",
  bgCardHover: "#1B1638",
  bgInput: "#0F0D1A",
  bgSidebar: "#100D1F",
  borderColor: "#2A1E4A",
  borderSubtle: "#1F1535",
  textPrimary: "#E8E0FF",
  textSecondary: "#B8A8FF",
  textMuted: "#8B7DB8",
  textFaint: "#5E4F8B",
  accent: "#A855F7",
  accentHover: "#D8B4FE",
  accentBg: "rgba(168,85,247,0.15)",
  accentBorder: "rgba(168,85,247,0.35)",
  dangerColor: "#FF6B9D",
  dangerBg: "rgba(255,107,157,0.12)",
  dangerBorder: "rgba(255,107,157,0.25)",
  badgePendingBg: "rgba(34,211,238,0.15)",
  badgePendingColor: "#22D3EE",
  badgeRejectedBg: "rgba(255,107,157,0.15)",
  badgeRejectedColor: "#FF6B9D",
  badgeInfoBg: "rgba(168,85,247,0.15)",
  badgeInfoColor: "#D8B4FE",
  badgePurpleBg: "rgba(168,85,247,0.12)",
  badgePurpleColor: "#E9D5FF",
  logoGradient: "linear-gradient(135deg, #A855F7, #22D3EE)",
  /* Legacy aliases */
  primary: "#A855F7",
  primaryLight: "rgba(168,85,247,0.15)",
  primaryText: "#E8E0FF",
  secondaryText: "#B8A8FF",
  border: "#2A1E4A",
  background: "#0D0B14",
  card: "#141028",
};

interface ThemeContextValue {
  theme: Theme;
  toggleTheme: () => void;
  setTheme: (t: Theme) => void;
  isDark: boolean;
  colors: ThemeColors;
}

const ThemeContext = createContext<ThemeContextValue>({
  theme: "light",
  toggleTheme: () => {},
  setTheme: () => {},
  isDark: false,
  colors: LIGHT_COLORS,
});

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<Theme>(() => {
    const saved = localStorage.getItem("tutor-theme");
    return saved === "dark" ? "dark" : "light";
  });

  useEffect(() => {
    localStorage.setItem("tutor-theme", theme);
    document.documentElement.setAttribute("data-theme", theme);
    if (theme === "dark") {
      document.documentElement.classList.add("dark");
      document.documentElement.classList.remove("light");
    } else {
      document.documentElement.classList.add("light");
      document.documentElement.classList.remove("dark");
    }
  }, [theme]);

  const toggleTheme = () => setTheme((prev) => (prev === "dark" ? "light" : "dark"));
  const colors = theme === "dark" ? DARK_COLORS : LIGHT_COLORS;

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, setTheme, isDark: theme === "dark", colors }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}
