/**
 * Fixed lists used across the site and the admin dashboard.
 * Add a new program category, resource category or status here and it
 * appears everywhere (menus, filters, forms, admin selects).
 */

export const SITE = {
  name: "MindsNova Hub",
  tagline: "Empowering Minds. Shaping the Future.",
  description:
    "MindsNova Hub is a registered social enterprise in Accra, Ghana, equipping young people, particularly girls and young women, with job-ready digital skills, career guidance and mentorship.",
  philosophy:
    "Empowering people with the knowledge, confidence and opportunities to learn, create, innovate and make a meaningful impact.",
  locale: "en_GH",
  /** Legal details from the Certificate of Registration (Registrar of Companies, Ghana). */
  legal: {
    registeredName: "MindsNova Hub",
    registrationNo: "BN220550926",
    structure: "registered business name (sole proprietorship) under the Registration of Business Names Act, 1962 (Act 151)",
    proprietor: "Emelia Awin",
    registeredOn: "14 September 2026",
  },
};

export type IconName =
  | "Sparkles"
  | "Briefcase"
  | "Users"
  | "DoorOpen"
  | "Monitor"
  | "Building2";

export type ProgramCategory = {
  slug: string;
  title: string;
  short: string;
  description: string;
  icon: IconName;
  topics: string[];
};

/**
 * The six program areas. They are deliberately broad and beginner-friendly:
 * each is a theme that sessions, talks and mentoring can be built around,
 * so any experienced professional can be invited to speak or teach.
 */
export const PROGRAM_CATEGORIES: ProgramCategory[] = [
  {
    slug: "ai-talks",
    title: "AI Talks",
    short: "Friendly, practical talks on what AI is and how to use everyday AI tools safely at school and work.",
    description:
      "AI is changing how people learn and work. In AI Talks, invited speakers explain artificial intelligence in plain language and show how everyday tools can help young people study, write, plan and work smarter, safely and honestly.",
    icon: "Sparkles",
    topics: [
      "What AI is, in plain language",
      "Everyday AI tools for study and work",
      "Using AI safely, honestly and responsibly",
      "How AI is changing jobs and careers",
    ],
  },
  {
    slug: "career-readiness",
    title: "Career Readiness",
    short: "Get ready for the world of work: CVs, job search, interviews and a professional online presence.",
    description:
      "Career Readiness helps young people prepare to look for work. Sessions cover writing a CV, searching for genuine opportunities, preparing for interviews and presenting yourself professionally, online and in person.",
    icon: "Briefcase",
    topics: [
      "Writing a CV and cover letter",
      "Finding genuine jobs and internships",
      "Interview preparation",
      "Building a professional online presence",
    ],
  },
  {
    slug: "mentorship",
    title: "Mentorship Program",
    short: "Connect with experienced professionals who guide, encourage and share honest advice.",
    description:
      "Our Mentorship Program connects young people with experienced professionals and role models from many fields. Mentors share their journeys, answer questions and help mentees set goals and build confidence.",
    icon: "Users",
    topics: [
      "One-to-one and group mentoring",
      "Goal setting and personal development",
      "Learning from role models, especially women",
      "Building confidence and networks",
    ],
  },
  {
    slug: "entry-level-jobs",
    title: "Entry-Level Job Preparation",
    short: "Understand the job market and what it takes to land and succeed in a first role.",
    description:
      "Professionals from different industries explain what entry-level roles look like, which skills employers want and how to get a foot in the door, through national service, internships and first jobs.",
    icon: "DoorOpen",
    topics: [
      "Understanding the job market",
      "Skills employers look for",
      "Internships, national service and first jobs",
      "Succeeding in your first role",
    ],
  },
  {
    slug: "computer-literacy",
    title: "Computer Literacy",
    short: "Build everyday confidence with computers, the internet, email and common office tools.",
    description:
      "Computer Literacy gives young people the basic digital confidence every workplace expects, from using a computer and the internet to email, documents, spreadsheets and staying safe online.",
    icon: "Monitor",
    topics: [
      "Using a computer and the internet",
      "Email and online communication",
      "Documents, spreadsheets and presentations",
      "Staying safe online",
    ],
  },
  {
    slug: "workplace-skills",
    title: "Workplace and Corporate Skills",
    short: "Learn how corporate settings work: professionalism, communication and teamwork.",
    description:
      "Workplace and Corporate Skills prepares young people for professional environments. Speakers share what is expected at work, how to communicate well, how to work in teams and how to grow once you are inside an organisation.",
    icon: "Building2",
    topics: [
      "Professionalism and workplace etiquette",
      "Communication and teamwork",
      "Time management and responsibility",
      "Growing your career inside an organisation",
    ],
  },
];

export const categoryBySlug = (slug: string) => PROGRAM_CATEGORIES.find((c) => c.slug === slug);

/* ---------------- Application statuses ---------------- */

export const PROGRAM_APPLICATION_STATUS = {
  interest: { label: "Registering interest", cta: "Register interest", open: true },
  open: { label: "Applications open", cta: "Apply now", open: true },
  closed: { label: "Applications closed", cta: "Applications closed", open: false },
  in_progress: { label: "In progress", cta: "Register for next intake", open: true },
  completed: { label: "Completed", cta: "Register for next intake", open: true },
} as const;
export type ProgramApplicationStatus = keyof typeof PROGRAM_APPLICATION_STATUS;

export const APPLICATION_STATUSES = {
  pending: "Pending",
  under_review: "Under review",
  accepted: "Accepted",
  rejected: "Not selected",
  waitlisted: "Waitlisted",
} as const;
export type ApplicationStatus = keyof typeof APPLICATION_STATUSES;

/* ---------------- Form options ---------------- */

export const AGE_RANGES = [
  { value: "under-13", label: "12 or younger", minor: true },
  { value: "13-15", label: "13 to 15", minor: true },
  { value: "16-17", label: "16 to 17", minor: true },
  { value: "18-24", label: "18 to 24", minor: false },
  { value: "25-34", label: "25 to 34", minor: false },
  { value: "35-plus", label: "35 or older", minor: false },
] as const;

export const EDUCATION_LEVELS = [
  "Junior High School (JHS)",
  "Senior High School (SHS)",
  "Technical or vocational",
  "Diploma or HND",
  "Undergraduate degree",
  "Postgraduate degree",
  "Other",
];

export const OCCUPATIONS = [
  "JHS student",
  "SHS student",
  "University or tertiary student",
  "Recent graduate",
  "National service",
  "Employed",
  "Self-employed or entrepreneur",
  "Looking for work",
  "Other",
];

export const EXPERIENCE_LEVELS = [
  "None, I am completely new to technology",
  "Beginner, I use computers and phones confidently",
  "Some experience, I have taken a course or built something small",
  "Intermediate, I have built projects on my own",
  "Advanced, I work or study in technology",
];

export const GHANA_REGIONS = [
  "Greater Accra",
  "Ashanti",
  "Central",
  "Eastern",
  "Western",
  "Western North",
  "Volta",
  "Oti",
  "Northern",
  "Savannah",
  "North East",
  "Upper East",
  "Upper West",
  "Bono",
  "Bono East",
  "Ahafo",
];

export const MENTOR_INTERESTS = [
  "One-to-one mentoring",
  "Group mentoring sessions",
  "Career talks",
  "Skills workshops (Excel, Word, AI tools)",
  "Mock interviews",
  "CV and interview preparation",
  "Entrepreneurship coaching",
];

export const MENTOR_EXPERIENCE = ["1 to 2 years", "3 to 5 years", "6 to 10 years", "More than 10 years"];

export const MENTOR_AVAILABILITY = [
  "1 to 2 hours per month",
  "3 to 5 hours per month",
  "More than 5 hours per month",
  "Occasional events only",
];

export const VOLUNTEER_INTERESTS = [
  "Teaching and facilitation",
  "Event support",
  "Community outreach",
  "Content and social media",
  "Photography and video",
  "Technical support",
  "Administration",
  "Fundraising",
];

export const ORG_TYPES = [
  "School or university",
  "Technology company",
  "Corporate organisation",
  "NGO or development organisation",
  "Government or public institution",
  "Foundation or donor",
  "Individual",
  "Other",
];

export const PARTNER_INTERESTS = [
  "Co-host a program",
  "Provide venue or equipment",
  "Offer internships or jobs",
  "Provide mentors or speakers",
  "Research and curriculum",
  "Outreach to schools",
];

export const SPONSOR_AREAS = [
  "Training programs",
  "Scholarships",
  "Laptops and equipment",
  "Career talks and job fairs",
  "Career talks and events",
  "General support",
];

export const CONTACT_CATEGORIES = [
  "General inquiry",
  "Programs and applications",
  "Mentorship",
  "Volunteering",
  "Partnerships",
  "Sponsorship",
  "Media",
  "Safeguarding concern",
  "Other",
];

export const NEWSLETTER_INTERESTS = [
  "Program announcements",
  "Training opportunities",
  "Events",
  "Job and internship opportunities",
  "Mentorship opportunities",
  "Organisational updates",
];

/* ---------------- Resources, events, projects ---------------- */

export const RESOURCE_CATEGORIES = [
  { slug: "career-guidance", title: "Career Guidance" },
  { slug: "digital-skills", title: "Digital Skills Tutorials" },
  { slug: "microsoft-office", title: "Microsoft Office Tips" },
  { slug: "ai-education", title: "Using AI" },
  { slug: "job-opportunities", title: "Job Opportunities" },
  { slug: "scholarships", title: "Scholarships" },
  { slug: "internships", title: "Internships" },
  { slug: "tech-news", title: "Technology News" },
  { slug: "events", title: "Event Announcements" },
];
export const resourceCategory = (slug: string) => RESOURCE_CATEGORIES.find((c) => c.slug === slug);

export const EVENT_TYPES = {
  training: "Training session",
  bootcamp: "Bootcamp",
  workshop: "Workshop",
  career_talk: "Career talk",
  hackathon: "Hackathon",
  innovation_challenge: "Innovation challenge",
  info_session: "Information session",
  webinar: "Webinar",
  community: "Community event",
  other: "Event",
} as const;
export type EventType = keyof typeof EVENT_TYPES;

export const PROJECT_TYPES = {
  student: "Student project",
  community: "Community technology project",
  ai: "AI innovation",
  hackathon: "Hackathon project",
  startup: "Startup idea",
} as const;

/* ---------------- Admin roles ---------------- */

export const ROLES = {
  super_admin: "Super Administrator",
  content_manager: "Content Manager",
  program_coordinator: "Program Coordinator",
  application_reviewer: "Application Reviewer",
} as const;
export type Role = keyof typeof ROLES;

export type Permission =
  | "dashboard"
  | "analytics"
  | "content"
  | "media"
  | "impact"
  | "posts"
  | "events"
  | "programs"
  | "projects"
  | "applications"
  | "community"
  | "messages"
  | "subscribers"
  | "email_log"
  | "users";

export const ROLE_PERMISSIONS: Record<Role, Permission[]> = {
  super_admin: [
    "dashboard", "analytics", "content", "media", "impact", "posts", "events", "programs",
    "projects", "applications", "community", "messages", "subscribers", "email_log", "users",
  ],
  content_manager: [
    "dashboard", "analytics", "content", "media", "impact", "posts", "events", "projects",
    "messages", "subscribers",
  ],
  program_coordinator: [
    "dashboard", "analytics", "media", "programs", "events", "projects", "applications",
    "community", "messages",
  ],
  application_reviewer: ["dashboard", "applications"],
};

export const can = (role: string, p: Permission) =>
  (ROLE_PERMISSIONS[role as Role] ?? []).includes(p);
