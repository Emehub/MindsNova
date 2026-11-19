/**
 * Starting content loaded into an empty database.
 *
 * Programs are the six broad, beginner-friendly program areas, one
 * program each. Dates, durations, formats and
 * fees are deliberately left empty ("to be confirmed") and every track starts in
 * "Registering interest" mode, so the site never claims an intake is open
 * before the team confirms it in the admin dashboard.
 */
import { PROGRAM_CATEGORIES } from "../catalog";
import type { CurriculumModule } from "./schema";

type SeedProgram = {
  category: string;
  slug: string;
  title: string;
  summary: string;
  description: string;
  audience: string;
  eligibility: string;
  outcomes: string[];
  curriculum: CurriculumModule[];
  featured: boolean;
};

const cat = (slug: string) => PROGRAM_CATEGORIES.find((c) => c.slug === slug)!;

const fromTopics = (slug: string) => cat(slug).topics.map((t) => ({ title: t }));

const YOUTH = "SHS students and leavers, tertiary students, graduates and young job seekers";
const OPEN = "Open to all young people. No previous experience needed. Applicants under 18 need parent or guardian consent.";

const program = (
  category: string,
  slug: string,
  outcomes: string[],
  featured = true,
  audience = YOUTH,
): SeedProgram => {
  const c = cat(category);
  return {
    category,
    slug,
    title: c.title,
    summary: c.short,
    description: c.description,
    audience,
    eligibility: OPEN,
    outcomes,
    curriculum: fromTopics(category),
    featured,
  };
};

export const SEED_PROGRAMS: SeedProgram[] = [
  program("ai-talks", "ai-talks", [
    "Understand what AI is and what it can and cannot do",
    "Use everyday AI tools to study and work smarter",
    "Use AI safely, honestly and responsibly",
  ]),
  program("career-readiness", "career-readiness", [
    "A clear, professional CV",
    "Know where to find genuine opportunities",
    "Answer interview questions with confidence",
  ]),
  program("mentorship", "mentorship-program", [
    "A mentor or role model to learn from",
    "Clear personal and career goals",
    "More confidence and a wider network",
  ]),
  program("entry-level-jobs", "entry-level-job-preparation", [
    "Understand the job market and where opportunities are",
    "Know the skills employers look for",
    "A plan for getting and succeeding in a first role",
  ]),
  program("computer-literacy", "computer-literacy", [
    "Use a computer, the internet and email confidently",
    "Create simple documents, spreadsheets and presentations",
    "Stay safe online",
  ], true, "Anyone new to computers, including JHS and SHS students and young adults"),
  program("workplace-skills", "workplace-and-corporate-skills", [
    "Understand what is expected in a professional setting",
    "Communicate and work well in teams",
    "Manage time and responsibilities at work",
  ]),
];

export const SEED_IMPACT = [
  { key: "trained", label: "Young people trained", suffix: "+" },
  { key: "girls", label: "Girls and young women empowered", suffix: "+" },
  { key: "mentors", label: "Mentors engaged", suffix: "" },
  { key: "programs", label: "Programs delivered", suffix: "" },
  { key: "talks", label: "Career talks held", suffix: "" },
];
