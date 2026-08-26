export const NAV_LINKS = ["For Tutors", "For Agencies", "How it Works", "Pricing"];

export const STATS = [
  { value: "500+", label: "Verified Tutors" },
  { value: "20+", label: "Partner Agencies" },
  { value: "99%", label: "Verification Accuracy" },
  { value: "2 days", label: "Avg. Verification Time" },
];

export const PROBLEMS = [
  {
    role: "Tutors",
    icon: "",
    pain: [
      "No centralized professional identity",
      "Repeatedly submit the same CVs and documents",
      "Scattered vacancy posts across Telegram groups",
      "Contact agencies one by one",
    ],
  },
  {
    role: "Agencies",
    icon: "",
    pain: [
      "Manual, time-consuming recruitment",
      "Re-request and re-check the same documents",
      "No centralized pool of verified educators",
      "No reliable way to trust credentials",
    ],
  },
  {
    role: "Students & Parents",
    icon: "",
    pain: [
      "Hard to verify if a tutor is truly qualified",
      "Difficult to compare experience and reputation",
      "Heavy reliance on informal referrals",
      "No transparent credential trail",
    ],
  },
];

export const HOW_IT_WORKS = [
  {
    step: "01",
    title: "Build Your Profile",
    desc: "Tutors create a rich professional identity — subjects, grades, teaching mode, experience, and availability.",
    icon: "✦",
  },
  {
    step: "02",
    title: "Get Verified",
    desc: "Upload credentials once. Our verification team reviews degree certificates, IDs, and teaching licences.",
    icon: "◈",
  },
  {
    step: "03",
    title: "Apply Anywhere",
    desc: "Your verified badge travels with you. Apply to agency vacancies without re-submitting documents.",
    icon: "⟡",
  },
];

export const FEATURES_TUTOR = [
  { title: "Verified Credential Badge", desc: "Display proof of identity and qualifications on every application." },
  { title: "Single Document Vault", desc: "Upload once, share everywhere. No more hunting for degree scans." },
  { title: "Vacancy Discovery", desc: "Browse structured vacancies filtered by subject, grade, location, and mode." },
  { title: "Application Tracker", desc: "See every application status in one dashboard — shortlisted, interviewed, hired." },
];

export const FEATURES_AGENCY = [
  { title: "Recruitment Dashboard", desc: "Manage vacancies, applicants, and hiring pipelines from a single workspace." },
  { title: "Verified Tutor Profiles", desc: "See credential verification results without accessing private documents." },
  { title: "Smart Search & Filters", desc: "Filter by subject, grade, location, mode, availability, and verification status." },
  { title: "Team Management", desc: "Invite recruiters, assign roles, and collaborate across your organization." },
];

export const VACANCIES_PREVIEW = [
  { title: "Grade 12 Mathematics Tutor", org: "Bright Futures Academy", location: "Lagos · Remote", salary: "₦80k–120k/mo", tag: "Featured" as const },
  { title: "IELTS Preparation Instructor", org: "EduPath Institute", location: "Abuja · In-person", salary: "₦60k–90k/mo", tag: "New" as const },
  { title: "Primary Science Teacher", org: "Sunrise Learning Centre", location: "Port Harcourt · Hybrid", salary: "₦50k–75k/mo", tag: "" as const },
  { title: "Coding & Robotics Tutor", org: "TechKids Nigeria", location: "Lagos · Remote", salary: "₦90k–140k/mo", tag: "Urgent" as const },
];

export const PRICING = [
  {
    name: "Free",
    price: "$0",
    period: "forever",
    desc: "Get started with the basics.",
    features: ["Organization profile", "Up to 3 vacancies", "Basic applicant list", "Verified profile viewing"],
    cta: "Start Free",
    highlight: false,
  },
  {
    name: "Professional",
    price: "$79",
    period: "per month",
    desc: "For agencies actively recruiting.",
    features: [
      "Unlimited vacancies",
      "Full applicant management",
      "Advanced tutor search & filters",
      "Analytics dashboard",
      "Team up to 5 recruiters",
    ],
    cta: "Start Trial",
    highlight: true,
  },
  {
    name: "Enterprise",
    price: "Custom",
    period: "contact us",
    desc: "For large organizations and networks.",
    features: [
      "Custom branding & domain",
      "Unlimited team members",
      "API access",
      "Advanced analytics & reports",
      "Dedicated account support",
      "SLA guarantee",
    ],
    cta: "Contact Sales",
    highlight: false,
  },
];
