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
  bgPage: "#1A1410",
  bgCard: "#252017",
  bgCardHover: "#2E2820",
  bgInput: "#1F1A14",
  bgSidebar: "#201B14",
  borderColor: "#3D3428",
  borderSubtle: "#332C22",
  textPrimary: "#F4EFE6",
  textSecondary: "#C4B5A5",
  textMuted: "#8E7E6E",
  textFaint: "#5E5044",
  accent: "#C08040",
  accentHover: "#D4944E",
  accentBg: "rgba(192,128,64,0.12)",
  accentBorder: "rgba(192,128,64,0.3)",
  dangerColor: "#E07060",
  dangerBg: "rgba(200,80,60,0.1)",
  dangerBorder: "rgba(200,80,60,0.2)",
  badgePendingBg: "rgba(200,150,50,0.12)",
  badgePendingColor: "#D4A830",
  badgeRejectedBg: "rgba(200,80,60,0.12)",
  badgeRejectedColor: "#E07060",
  badgeInfoBg: "rgba(80,130,200,0.12)",
  badgeInfoColor: "#60A0E0",
  badgePurpleBg: "rgba(160,100,200,0.12)",
  badgePurpleColor: "#C080E0",
  logoGradient: "linear-gradient(135deg, #C08040, #D4944E)",
  /* Legacy aliases */
  primary: "#C08040",
  primaryLight: "rgba(192,128,64,0.12)",
  primaryText: "#F4EFE6",
  secondaryText: "#C4B5A5",
  border: "#3D3428",
  background: "#1A1410",
  card: "#252017",
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
