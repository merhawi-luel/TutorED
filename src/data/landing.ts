export const NAV_LINKS = ["For Tutors", "For Agencies", "For Parents", "How it Works", "Pricing"];

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
      "No way to build a reputation over time",
    ],
  },
  {
    role: "Agencies",
    icon: "",
    pain: [
      "Manual, time-consuming recruitment",
      "Re-request and re-check the same documents",
      "No centralized pool of verified educators",
      "No visibility into tutor reviews or track record",
    ],
  },
  {
    role: "Students & Parents",
    icon: "",
    pain: [
      "Hard to verify if a tutor is truly qualified",
      "Difficult to compare experience, reviews, and reputation",
      "Heavy reliance on informal referrals",
      "No way to leave feedback after a tutoring engagement",
    ],
  },
];

export const HOW_IT_WORKS = [
  {
    step: "01",
    title: "Build Your Profile",
    desc: "Tutors create a rich professional identity — subjects, grades, teaching mode, experience, education, and availability.",
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
    title: "Apply & Get Hired",
    desc: "Your verified badge travels with you. Apply to vacancies, get shortlisted, and accepted by agencies or parents.",
    icon: "⟡",
  },
  {
    step: "04",
    title: "Build Reputation",
    desc: "After completing jobs, parents leave reviews and star ratings. Your reputation grows with every successful placement.",
    icon: "★",
  },
];

export const FEATURES_TUTOR = [
  { title: "Verified Credential Badge", desc: "Display proof of identity and qualifications on every application. Your badge travels with you." },
  { title: "Single Document Vault", desc: "Upload once, share everywhere. Government IDs, degrees, certificates — all in one secure vault." },
  { title: "Education & Credentials", desc: "Showcase your degrees, certifications, and teaching credentials. Verified by our team." },
  { title: "Vacancy Discovery", desc: "Browse structured vacancies filtered by subject, grade, location, teaching mode, and salary." },
  { title: "Application Tracker", desc: "See every application status in one dashboard — applied, shortlisted, interviewed, accepted, completed." },
  { title: "Reviews & Reputation", desc: "Receive star ratings and reviews from parents. Build your reputation on the platform over time." },
];

export const FEATURES_PARENT = [
  { title: "Self-Recruitment", desc: "Create your own vacancies, browse tutor profiles, and hire directly without an agency." },
  { title: "Full Applicant View", desc: "See tutor education, verified documents, and reviews from other parents before deciding." },
  { title: "Application Workflows", desc: "Review, shortlist, interview, accept, or reject applicants with clear status management." },
  { title: "Leave Reviews & Ratings", desc: "Rate tutors after completed jobs. Your feedback helps other parents make informed decisions." },
  { title: "Agency-Assisted Hiring", desc: "Contact verified agencies to handle the entire recruitment process for you." },
];

export const FEATURES_AGENCY = [
  { title: "Recruitment Dashboard", desc: "Create vacancies, manage applicants, and track hiring pipelines from a single workspace." },
  { title: "Full Applicant Profiles", desc: "View tutor education, documents, verification status, and parent reviews — all in one place." },
  { title: "Application Management", desc: "Review, shortlist, interview, accept, or reject applicants with clear status workflows." },
  { title: "Smart Search & Filters", desc: "Filter applicants by subject, grade, location, mode, availability, and verification status." },
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
    price: "0 Birr",
    period: "forever",
    desc: "Get started with the basics.",
    features: [
      "Organization profile",
      "Up to 3 vacancies",
      "Basic applicant list",
      "View verified tutor profiles & documents",
      "Parent self-recruitment (unlimited)",
    ],
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
      "View tutor education & reviews",
      "Advanced tutor search & filters",
      "Application status workflows",
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
