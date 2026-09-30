export type Section =
  | "summary"
  | "experience"
  | "education"
  | "skills"
  | "projects"
  | "certifications"
  | "languages"
  | "references";
export type Template = "modern" | "classic" | "minimal" | "creative";
export type Entry = { id: string; [key: string]: string };
export type Resume = {
  personal: {
    name: string;
    title: string;
    email: string;
    phone: string;
    address: string;
    linkedin: string;
    website: string;
    other: string;
    photo: string;
  };
  summary: string;
  experience: Entry[];
  education: Entry[];
  skills: string[];
  projects: Entry[];
  certifications: Entry[];
  languages: Entry[];
  references: Entry[];
  referenceMode: "request" | "details";
  settings: {
    template: Template;
    accent: string;
    font: string;
    size: string;
    page: "A4" | "Letter";
    ats: boolean;
    showPhoto: boolean;
    visible: Record<Section, boolean>;
    order: Section[];
  };
};
export const sectionNames: Record<Section, string> = {
  summary: "Professional summary",
  experience: "Work experience",
  education: "Education",
  skills: "Skills",
  projects: "Projects",
  certifications: "Certifications",
  languages: "Languages",
  references: "References",
};
export const templates: {
  id: Template;
  name: string;
  detail: string;
  tag: string;
}[] = [
  {
    id: "modern",
    name: "The Modern",
    detail: "A fresh perspective. A lasting impression.",
    tag: "MOST POPULAR",
  },
  {
    id: "classic",
    name: "The Professional",
    detail: "Timeless structure. Quiet confidence.",
    tag: "TIMELESS",
  },
  {
    id: "minimal",
    name: "The Minimal",
    detail: "Less distraction. More of you.",
    tag: "ATS FRIENDLY",
  },
  {
    id: "creative",
    name: "The Creative",
    detail: "A little personality goes a long way.",
    tag: "STAND OUT",
  },
];
export const STORAGE_KEY = "folio.resume.v1";
export const uid = () => crypto.randomUUID();
export function emptyResume(): Resume {
  return {
    personal: {
      name: "",
      title: "",
      email: "",
      phone: "",
      address: "",
      linkedin: "",
      website: "",
      other: "",
      photo: "",
    },
    summary: "",
    experience: [],
    education: [],
    skills: [],
    projects: [],
    certifications: [],
    languages: [],
    references: [],
    referenceMode: "request",
    settings: {
      template: "modern",
      accent: "#285448",
      font: "Inter",
      size: "Medium",
      page: "A4",
      ats: false,
      showPhoto: true,
      visible: {
        summary: true,
        experience: true,
        education: true,
        skills: true,
        projects: true,
        certifications: true,
        languages: true,
        references: false,
      },
      order: [
        "summary",
        "experience",
        "education",
        "projects",
        "skills",
        "certifications",
        "languages",
        "references",
      ],
    },
  };
}
export const demo: Resume = {
  ...emptyResume(),
  personal: {
    name: "Alex Morgan",
    title: "Senior Product Designer",
    email: "alex.morgan@email.com",
    phone: "+1 (415) 555-0123",
    address: "San Francisco, CA",
    linkedin: "linkedin.com/in/alexmorgan",
    website: "alexmorgan.design",
    other: "",
    photo: "",
  },
  summary:
    "Thoughtful product designer with 6+ years of experience turning complex problems into simple, intuitive digital experiences. I bring curiosity, craft, and a people-first mindset to everything I make.",
  experience: [
    {
      id: "e1",
      title: "Senior Product Designer",
      company: "Notion",
      location: "San Francisco, CA",
      start: "2022-03",
      end: "",
      current: "true",
      description:
        "Led end-to-end design for core collaboration features used by millions of people.\nPartnered with product and engineering to increase onboarding activation by 28%.\nBuilt a scalable design system across web and mobile experiences.",
    },
    {
      id: "e2",
      title: "Product Designer",
      company: "Studio North",
      location: "New York, NY",
      start: "2019-06",
      end: "2022-02",
      current: "false",
      description:
        "Designed meaningful digital experiences for early-stage startups.\nCollaborated with cross-functional teams from discovery through launch.",
    },
  ],
  education: [
    {
      id: "ed1",
      institution: "California College of the Arts",
      degree: "BFA",
      field: "Interaction Design",
      start: "2015",
      end: "2019",
      description: "Graduated with distinction",
    },
  ],
  skills: [
    "Product strategy",
    "User research",
    "Interaction design",
    "Figma",
    "Design systems",
    "Prototyping",
  ],
  projects: [
    {
      id: "p1",
      name: "Making space for better habits",
      description:
        "A mindful habit-tracking app focused on small, sustainable changes.",
      technologies: "Research, UX/UI, Prototyping",
      url: "",
      github: "",
    },
  ],
  languages: [
    { id: "l1", name: "English", level: "Native" },
    { id: "l2", name: "Spanish", level: "Fluent" },
  ],
};
export function strength(r: Resume) {
  const checks: [boolean, string][] = [
    [!!r.personal.name.trim(), "Add your full name"],
    [
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(r.personal.email),
      "Add a valid email address",
    ],
    [r.personal.phone.replace(/\D/g, "").length >= 7, "Add your phone number"],
    [!!r.personal.title.trim(), "Add your professional title"],
    [
      r.summary.trim().length >= 40,
      "Add a professional summary (40+ characters)",
    ],
    [r.education.some((e) => !!e.institution?.trim()), "Add your education"],
    [r.experience.some((e) => !!e.title?.trim()), "Add work experience"],
    [r.skills.length >= 3, "Add at least three skills"],
    [r.projects.some((e) => !!e.name?.trim()), "Add a project"],
    [!!r.personal.linkedin.trim(), "Add your LinkedIn profile"],
  ];
  return {
    score: checks.filter(([ok]) => ok).length * 10,
    suggestions: checks.filter(([ok]) => !ok).map(([, s]) => s),
  };
}
export function fieldError(key: string, value: string, record?: Entry): string {
  if (!value) return "";
  if (key === "email" && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value))
    return "Enter a valid email, like you@example.com.";
  if (
    key === "phone" &&
    (!/^[+\d\s().-]+$/.test(value) ||
      value.replace(/\D/g, "").length < 7 ||
      value.replace(/\D/g, "").length > 15)
  )
    return "Enter a phone number with 7–15 digits.";
  if (["website", "linkedin", "url", "github"].includes(key)) {
    try {
      const url = new URL(value.includes("://") ? value : `https://${value}`);
      if (
        !["https:", "http:"].includes(url.protocol) ||
        !url.hostname.includes(".") ||
        /\s/.test(value)
      )
        throw Error();
    } catch {
      return "Enter a valid web address, like example.com.";
    }
  }
  if (key === "end" && record?.start && value < record.start)
    return "End date must be after the start date.";
  if (
    ["start", "end", "year"].includes(key) &&
    value.length !== 7 &&
    !/^\d{4}$/.test(value)
  )
    return "Use a four-digit year.";
  return "";
}
export function safeUrl(value: string) {
  if (!value || fieldError("url", value)) return undefined;
  return value.includes("://") ? value : `https://${value}`;
}
export function moveItem<T>(items: T[], from: number, to: number): T[] {
  if (to < 0 || to >= items.length) return items;
  const result = [...items];
  const [item] = result.splice(from, 1);
  result.splice(to, 0, item);
  return result;
}
export function readSaved(): Resume | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const r = JSON.parse(raw);
    const base = emptyResume();
    if (!r.personal || !r.settings || typeof r.summary !== "string")
      return null;
    for (const key of Object.keys(base.personal))
      if (typeof r.personal[key] !== "string") return null;
    for (const key of [
      "experience",
      "education",
      "projects",
      "certifications",
      "languages",
      "references",
    ])
      if (
        !Array.isArray(r[key]) ||
        r[key].some(
          (e: unknown) =>
            !e ||
            typeof e !== "object" ||
            Object.values(e).some((v) => typeof v !== "string"),
        )
      )
        return null;
    if (
      !Array.isArray(r.skills) ||
      r.skills.some((v: unknown) => typeof v !== "string")
    )
      return null;
    const order = base.settings.order;
    if (
      !Array.isArray(r.settings.order) ||
      r.settings.order.length !== order.length ||
      new Set(r.settings.order).size !== order.length ||
      r.settings.order.some((s: Section) => !order.includes(s))
    )
      return null;
    if (
      !templates.some((t) => t.id === r.settings.template) ||
      !/^#[0-9a-f]{6}$/i.test(r.settings.accent) ||
      !["A4", "Letter"].includes(r.settings.page) ||
      !["Small", "Medium", "Large"].includes(r.settings.size) ||
      !["Inter", "Roboto", "Poppins", "Georgia", "Times New Roman"].includes(
        r.settings.font,
      )
    )
      return null;
    if (
      !r.settings.visible ||
      order.some((s) => typeof r.settings.visible[s] !== "boolean")
    )
      return null;
    return { ...base, ...r, settings: { ...base.settings, ...r.settings } };
  } catch {
    return null;
  }
}
