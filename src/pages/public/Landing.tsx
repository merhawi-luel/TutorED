import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import Hero from "@/components/sections/Hero";
import Problem from "@/components/sections/Problem";
import HowItWorks from "@/components/sections/HowItWorks";
import Features from "@/components/sections/Features";
import VacanciesPreview from "@/components/sections/VacanciesPreview";
import Pricing from "@/components/sections/Pricing";
import CTA from "@/components/sections/CTA";
import { useTheme } from "@/context/ThemeContext";

export default function Landing() {
  const { colors } = useTheme();
  return (
    <div className="min-h-screen" style={{ fontFamily: "Outfit, sans-serif", background: colors.bgPage }}>
      <Navbar />
      <Hero />
      <Problem />
      <HowItWorks />
      <Features />
      <VacanciesPreview />
      <Pricing />
      <CTA />
      <Footer />
    </div>
  );
}