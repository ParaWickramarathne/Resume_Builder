import { useEffect, useRef, useState } from "react";
import type { ReactNode } from "react";
import {
  ArrowRight,
  ArrowLeft,
  ArrowUp,
  ArrowDown,
  Check,
  CheckCheck,
  ChevronDown,
  ChevronRight,
  Download,
  Eye,
  FileText,
  LayoutTemplate,
  ShieldCheck,
  Sparkles,
  SlidersHorizontal,
  UserRound,
  BriefcaseBusiness,
  GraduationCap,
  FolderOpen,
  Award,
  Languages,
  UsersRound,
  AlignLeft,
  Plus,
  X,
  Menu,
  RotateCcw,
  Save,
  LockKeyhole,
  Printer,
  CircleHelp,
  CheckCircle2,
  Layers,
  WandSparkles,
} from "lucide-react";
import {
  demo,
  emptyResume,
  readSaved,
  STORAGE_KEY,
  strength,
  templates,
  sectionNames,
  moveItem,
  type Resume,
  type Section,
  type Template,
} from "./model";
import ResumePreview from "./ResumePreview";
import {
  PersonalDetailsForm,
  SummaryForm,
  SkillsForm,
  EducationForm,
  ExperienceForm,
  ProjectsForm,
  CertificationsForm,
  LanguagesForm,
  ReferencesForm,
  type Update,
} from "./Forms";

const icons = {
  personal: UserRound,
  summary: AlignLeft,
  experience: BriefcaseBusiness,
  education: GraduationCap,
  skills: Sparkles,
  projects: FolderOpen,
  certifications: Award,
  languages: Languages,
  references: UsersRound,
};
function Brand({ onClick }: { onClick: () => void }) {
  return (
    <button className="brand" onClick={onClick} aria-label="Folio home">
      <span className="brand-mark">
        <FileText size={22} strokeWidth={1.8} />
      </span>
      folio<span className="brand-dot">.</span>
    </button>
  );
}
function Toggle({
  checked,
  onChange,
  label,
}: {
  checked: boolean;
  onChange: () => void;
  label: string;
}) {
  return (
    <button
      type="button"
      className={`toggle ${checked ? "on" : ""}`}
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={onChange}
    >
      <span />
    </button>
  );
}
function Modal({
  title,
  children,
  onClose,
  wide = false,
}: {
  title: string;
  children: ReactNode;
  onClose: () => void;
  wide?: boolean;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const dialog = ref.current;
    dialog?.showModal();
    return () => dialog?.close();
  }, []);
  return (
    <dialog
      ref={ref}
      className={`modal ${wide ? "wide" : ""}`}
      aria-label={title}
      onCancel={onClose}
      onClick={(e) => {
        if (e.target === ref.current) onClose();
      }}
    >
      <div className="modal-heading">
        <div>
          <span className="eyebrow">MAKE IT YOURS</span>
          <h2>{title}</h2>
        </div>
        <button
          className="icon-button"
          aria-label="Close dialog"
          onClick={onClose}
        >
          <X size={21} />
        </button>
      </div>
      {children}
    </dialog>
  );
}
function TemplateSelector({
  data,
  choose,
}: {
  data: Resume;
  choose: (t: Template) => void;
}) {
  return (
    <div className="template-grid">
      {templates.map((t) => (
        <button
          key={t.id}
          className={`template-card ${data.settings.template === t.id ? "selected" : ""}`}
          onClick={() => choose(t.id)}
        >
          <div className={`template-thumbnail thumb-${t.id}`}>
            <div className="template-paper">
              <ResumePreview
                data={{
                  ...demo,
                  settings: {
                    ...demo.settings,
                    template: t.id,
                    accent:
                      t.id === "creative"
                        ? "#9a614d"
                        : t.id === "classic"
                          ? "#475569"
                          : "#285448",
                  },
                }}
                miniature
              />
            </div>
            <span className="template-use">
              Use template <ArrowRight size={14} />
            </span>
          </div>
          <div className="template-caption">
            <div>
              <h3>{t.name}</h3>
              <p>{t.detail}</p>
            </div>
            {data.settings.template === t.id && <CheckCircle2 size={20} />}
          </div>
        </button>
      ))}
    </div>
  );
}
function ResumeStrength({ data }: { data: Resume }) {
  const result = strength(data);
  return (
    <div className="strength-card">
      <div>
        <span>
          <span className="strength-dot" />
          Resume completeness
        </span>
        <strong>{result.score}%</strong>
      </div>
      <div className="progress-track">
        <span style={{ width: `${result.score}%` }} />
      </div>
      <p>
        {result.suggestions[0] || "All the essentials are here. Looking good!"}
      </p>
      <span className="strength-note">
        A completeness guide, not an ATS score.
      </span>
    </div>
  );
}
function CustomizationPanel({
  data,
  update,
}: {
  data: Resume;
  update: Update;
}) {
  const set = (key: string, value: unknown) =>
    update((r) => ({ ...r, settings: { ...r.settings, [key]: value } }));
  return (
    <div className="customization">
      <div className="setting-group">
        <label>Accent color</label>
        <div className="color-options">
          {[
            "#285448",
            "#334b74",
            "#6a5078",
            "#9a614d",
            "#343b43",
            "#9b7630",
          ].map((color) => (
            <button
              key={color}
              aria-label={`Use ${color} accent`}
              className={data.settings.accent === color ? "active" : ""}
              style={{ background: color }}
              onClick={() => set("accent", color)}
            >
              {data.settings.accent === color && <Check size={17} />}
            </button>
          ))}
          <input
            type="color"
            aria-label="Custom accent color"
            value={data.settings.accent}
            onChange={(e) => set("accent", e.target.value)}
          />
        </div>
      </div>
      <div className="form-grid">
        <label className="field">
          Font family
          <select
            aria-label="Font family"
            value={data.settings.font}
            onChange={(e) => set("font", e.target.value)}
            disabled={data.settings.ats}
          >
            {["Inter", "Roboto", "Poppins", "Georgia", "Times New Roman"].map(
              (f) => (
                <option key={f}>{f}</option>
              ),
            )}
          </select>
        </label>
        <label className="field">
          Font size
          <select
            aria-label="Font size"
            value={data.settings.size}
            onChange={(e) => set("size", e.target.value)}
          >
            {["Small", "Medium", "Large"].map((s) => (
              <option key={s}>{s}</option>
            ))}
          </select>
        </label>
        <label className="field">
          Page size
          <select
            aria-label="Page size"
            value={data.settings.page}
            onChange={(e) => set("page", e.target.value)}
          >
            <option>A4</option>
            <option>Letter</option>
          </select>
        </label>
        <div className="setting-row">
          <span>Show profile photo</span>
          <Toggle
            label="Show profile photo"
            checked={data.settings.showPhoto}
            onChange={() => set("showPhoto", !data.settings.showPhoto)}
          />
        </div>
      </div>
      <div className="setting-row ats-setting">
        <div>
          <strong>ATS-friendly mode</strong>
          <p>A simple layout, standard headings, and no photo.</p>
        </div>
        <Toggle
          checked={data.settings.ats}
          label="ATS-friendly mode"
          onChange={() => set("ats", !data.settings.ats)}
        />
      </div>
      {data.settings.ats && (
        <p className="muted small-text">
          ATS mode uses a plain single-column layout and Arial. Turn it off to
          restore your chosen design.
        </p>
      )}
      <div className="setting-group">
        <label>Section order & visibility</label>
        <p className="muted small-text">
          Move sections up or down. Hidden content is always kept. Sidebar
          sections stay in their column.
        </p>
        <div className="section-order">
          {data.settings.order.map((s, i) => (
            <div key={s}>
              <span>{sectionNames[s]}</span>
              <button
                className="icon-button"
                aria-label={`Move ${sectionNames[s]} up`}
                disabled={i === 0}
                onClick={() =>
                  set("order", moveItem(data.settings.order, i, i - 1))
                }
              >
                <ArrowUp size={14} />
              </button>
              <button
                className="icon-button"
                aria-label={`Move ${sectionNames[s]} down`}
                disabled={i === data.settings.order.length - 1}
                onClick={() =>
                  set("order", moveItem(data.settings.order, i, i + 1))
                }
              >
                <ArrowDown size={14} />
              </button>
              <Toggle
                label={`Show ${sectionNames[s]}`}
                checked={data.settings.visible[s]}
                onChange={() =>
                  set("visible", {
                    ...data.settings.visible,
                    [s]: !data.settings.visible[s],
                  })
                }
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
function ExportControls({ onPrint }: { onPrint: () => void }) {
  return (
    <>
      <p className="modal-description">Your next chapter, ready to send.</p>
      <div className="export-option">
        <div className="export-icon">
          <FileText size={28} />
        </div>
        <div>
          <h3>Save your resume as a PDF</h3>
          <p>
            Open the print dialog, choose <strong>Save as PDF</strong> as the
            destination, and save. Use the{" "}
            {document.documentElement.dataset.pageSize || "A4"} paper size and
            turn off browser headers and footers.
          </p>
        </div>
      </div>
      <button className="button primary full-width" onClick={onPrint}>
        <Download size={17} />
        Continue to PDF / Print
      </button>
      <p className="privacy-note">
        <LockKeyhole size={13} />
        Your resume stays in your browser. Always.
      </p>
    </>
  );
}
function Landing({
  navigate,
  start,
  hasSaved,
  choose,
}: {
  navigate: (path: string) => void;
  start: () => void;
  hasSaved: boolean;
  choose: (t: Template) => void;
}) {
  return (
    <div className="landing">
      <header className="landing-nav page-width">
        <Brand onClick={() => navigate("/")} />
        <nav aria-label="Main navigation">
          <a href="#how-it-works">How it works</a>
          <a href="#templates">Templates</a>
          <a href="#why-folio">Why Folio?</a>
        </nav>
        <button className="button primary small" onClick={start}>
          {hasSaved ? "Continue my resume" : "Build my resume"}
          <ArrowRight size={15} />
        </button>
      </header>
      <main>
        <section className="hero page-width">
          <div className="hero-copy">
            <div className="pill">
              <span />
              YOUR EXPERIENCE. BEAUTIFULLY PRESENTED.
            </div>
            <h1>
              Your next chapter
              <br />
              starts with a<br />
              <em>great resume.</em>
            </h1>
            <p className="hero-description">
              You have the experience. We help you tell the story.
              <br className="desktop-break" />
              Create a resume that feels like you — and opens doors.
            </p>
            <button className="button primary hero-cta" onClick={start}>
              {hasSaved ? "Continue my resume" : "Create my resume"}
              <ArrowRight size={18} />
            </button>
            <div className="hero-assurances">
              <span>
                <Check size={14} />
                Free to use
              </span>
              <span>
                <Check size={14} />
                No sign-up
              </span>
              <span>
                <Check size={14} />
                Yours to keep
              </span>
            </div>
            <div className="hero-note">
              <div className="avatar-stack">
                <span>JL</span>
                <span>AK</span>
                <span>SM</span>
                <span>TR</span>
              </div>
              <div>
                <span className="little-stars">★★★★★</span>
                <p>Made for every kind of next step.</p>
              </div>
            </div>
          </div>
          <div className="hero-art">
            <div className="orbit orbit-one" />
            <div className="orbit orbit-two" />
            <span className="art-spark sparkle-one">✳</span>
            <div className="hero-resume">
              <ResumePreview data={demo} miniature />
            </div>
            <div className="floating-card ready-card">
              <span className="floating-icon">
                <CheckCheck size={20} />
              </span>
              <div>
                <strong>A great first impression</strong>
                <span>Before you even say hello.</span>
              </div>
            </div>
            <div className="floating-card privacy-card">
              <ShieldCheck size={19} />
              <span>
                Your story. Your data.
                <br />
                <strong>100% private.</strong>
              </span>
            </div>
            <span className="art-caption">
              A little polish. A world of possibility.
            </span>
            <span className="art-spark sparkle-two">✦</span>
          </div>
        </section>
        <section className="benefit-strip">
          <div className="page-width">
            <span>
              <LayoutTemplate />
              Thoughtfully designed templates
            </span>
            <span>
              <WandSparkles />
              Make it unmistakably you
            </span>
            <span>
              <ShieldCheck />
              Private by design
            </span>
            <span>
              <Download />
              Ready to download
            </span>
          </div>
        </section>
        <section id="templates" className="templates-section page-width">
          <div className="section-intro">
            <div>
              <span className="eyebrow">A STRONG START</span>
              <h2>Good design. Great possibilities.</h2>
              <p>Pick your starting point. Make it your own.</p>
            </div>
            <span className="subtle-label">
              4 templates. Endless next chapters. <ArrowDown size={16} />
            </span>
          </div>
          <div className="landing-template-grid">
            {templates.map((t) => (
              <button
                key={t.id}
                className="landing-template"
                onClick={() => choose(t.id)}
              >
                <div className={`template-thumbnail thumb-${t.id}`}>
                  <span className="template-badge">{t.tag}</span>
                  <div className="template-paper">
                    <ResumePreview
                      data={{
                        ...demo,
                        settings: {
                          ...demo.settings,
                          template: t.id,
                          accent:
                            t.id === "creative"
                              ? "#9a614d"
                              : t.id === "classic"
                                ? "#475569"
                                : "#285448",
                        },
                      }}
                      miniature
                    />
                  </div>
                  <span className="template-use">
                    Use template <ArrowRight size={15} />
                  </span>
                </div>
                <div className="landing-template-caption">
                  <h3>{t.name}</h3>
                  <ArrowRight size={18} />
                </div>
                <p>{t.detail}</p>
              </button>
            ))}
          </div>
        </section>
        <section id="how-it-works" className="how-section page-width">
          <div>
            <span className="eyebrow">LESS FRICTION. MORE FORWARD.</span>
            <h2>
              From a blank page
              <br />
              to your next big thing.
            </h2>
            <p>Three simple steps. One resume that does you justice.</p>
            <button className="text-button" onClick={start}>
              Let's get started <ArrowRight size={17} />
            </button>
          </div>
          <div className="steps">
            {[
              [
                "01",
                "Start with a little you",
                "Add your experience, skills, and the things you’re proud of.",
              ],
              [
                "02",
                "Find your look",
                "Choose a template, pick a color, and watch it come together.",
              ],
              [
                "03",
                "Make your next move",
                "Save a polished PDF and put your best self out there.",
              ],
            ].map(([n, h, p]) => (
              <div className="step" key={n}>
                <span>{n}</span>
                <div>
                  <h3>{h}</h3>
                  <p>{p}</p>
                </div>
              </div>
            ))}
          </div>
        </section>
        <section id="why-folio" className="why-section page-width">
          <div className="why-heading">
            <span className="eyebrow">BUILT AROUND YOU</span>
            <h2>A better resume. A simpler process.</h2>
          </div>
          <div className="feature-grid">
            {[
              [
                Eye,
                "See your story take shape",
                "Every edit appears instantly. No guesswork, no endless back and forth.",
              ],
              [
                ShieldCheck,
                "Your information stays yours",
                "Saved only in your browser. No accounts, no uploads, no data collection.",
              ],
              [
                Layers,
                "A format for every next step",
                "From your first role to a fresh direction, find a design that fits.",
              ],
            ].map(([Icon, h, p]) => {
              const I = Icon as typeof Eye;
              return (
                <div key={String(h)}>
                  <span className="feature-icon">
                    <I size={24} />
                  </span>
                  <h3>{String(h)}</h3>
                  <p>{String(p)}</p>
                </div>
              );
            })}
          </div>
        </section>
        <section className="bottom-cta page-width">
          <div>
            <span className="eyebrow">YOU’VE GOT A STORY TO TELL.</span>
            <h2>Let’s make it a good first impression.</h2>
          </div>
          <button className="button primary" onClick={start}>
            Build my resume
            <ArrowRight size={17} />
          </button>
        </section>
      </main>
      <footer className="page-width">
        <Brand onClick={() => navigate("/")} />
        <p>A thoughtful start to what comes next.</p>
        <span>
          <LockKeyhole size={13} />
          Made to be private. Free to be you.
        </span>
      </footer>
    </div>
  );
}

export default function App() {
  const [data, setData] = useState<Resume>(() => readSaved() || emptyResume());
  const [hasSaved, setHasSaved] = useState(() => !!readSaved());
  const [route, setRoute] = useState(() => window.location.pathname);
  const [active, setActive] = useState<Section | "personal">("personal");
  const [mobileTab, setMobileTab] = useState<"editor" | "preview">("editor");
  const [modal, setModal] = useState<
    "templates" | "customize" | "export" | "reset" | "help" | null
  >(null);
  const [saved, setSaved] = useState("Saved locally");
  const [notice, setNotice] = useState("");
  const [menu, setMenu] = useState(false);
  const changed = useRef(false);
  const update: Update = (next) => {
    changed.current = true;
    setSaved("Saving…");
    setData(next);
  };
  const navigate = (path: string) => {
    window.history.pushState({}, "", path);
    setRoute(path);
    window.scrollTo({ top: 0 });
    setMenu(false);
  };
  useEffect(() => {
    const back = () => setRoute(window.location.pathname);
    window.addEventListener("popstate", back);
    return () => window.removeEventListener("popstate", back);
  }, []);
  useEffect(() => {
    if (!changed.current) return;
    const timer = setTimeout(() => {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
        setSaved("Saved locally");
        setHasSaved(true);
      } catch {
        setSaved("Could not save");
        setNotice(
          "Browser storage is full or unavailable. Your current edits are in memory. Try removing a large photo, or export your resume before leaving.",
        );
      }
    }, 350);
    return () => clearTimeout(timer);
  }, [data]);
  useEffect(() => {
    const flush = () => {
      if (changed.current) {
        try {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
        } catch {
          /* The visible save status handles storage failures. */
        }
      }
    };
    window.addEventListener("pagehide", flush);
    const visibility = () => {
      if (document.visibilityState === "hidden") flush();
    };
    document.addEventListener("visibilitychange", visibility);
    return () => {
      window.removeEventListener("pagehide", flush);
      document.removeEventListener("visibilitychange", visibility);
    };
  }, [data]);
  useEffect(() => {
    document.documentElement.dataset.pageSize = data.settings.page;
    let style = document.getElementById("print-page-size");
    if (!style) {
      style = document.createElement("style");
      style.id = "print-page-size";
      document.head.appendChild(style);
    }
    style.textContent = `@page { size: ${data.settings.page}; margin: 12mm; }`;
  }, [data.settings.page]);
  const choose = (template: Template) => {
    update((r) => ({
      ...r,
      settings: { ...r.settings, template, ats: false },
    }));
    setModal(null);
    navigate("/builder");
  };
  const start = () => navigate("/builder");
  const print = () => {
    setModal(null);
    navigate("/preview");
    setTimeout(() => window.print(), 150);
  };
  const reset = () => {
    update(emptyResume());
    setActive("personal");
    setModal(null);
    navigate("/builder");
    setNotice("A fresh start. Your previous resume has been cleared.");
  };
  const load = () => {
    const stored = readSaved();
    if (stored) {
      setData(stored);
      setSaved("Saved locally");
      setNotice("Your saved resume is loaded.");
    } else setNotice("No saved resume was found in this browser.");
    setMenu(false);
  };
  const formProps = { data, update };
  const ActiveIcon = icons[active];
  const formComponents = {
    personal: PersonalDetailsForm,
    summary: SummaryForm,
    education: EducationForm,
    experience: ExperienceForm,
    skills: SkillsForm,
    projects: ProjectsForm,
    certifications: CertificationsForm,
    languages: LanguagesForm,
    references: ReferencesForm,
  };
  const Form = formComponents[active];
  const sections: (Section | "personal")[] = [
    "personal",
    ...data.settings.order,
  ];
  const sectionIndex = sections.indexOf(active);
  const isBuilder = route === "/builder";
  const isPreview = route === "/preview";
  return (
    <>
      {!isBuilder && !isPreview ? (
        <Landing
          navigate={navigate}
          start={start}
          hasSaved={hasSaved}
          choose={choose}
        />
      ) : (
        <div className={`workspace ${isPreview ? "preview-workspace" : ""}`}>
          <header className="app-header">
            <Brand onClick={() => navigate("/")} />
            <div className="header-divider" />
            <span className="document-name">
              {data.personal.name
                ? `${data.personal.name.split(" ")[0]}'s resume`
                : "Untitled resume"}
              <span>PERSONAL WORKSPACE</span>
            </span>
            <div className="header-actions">
              <span
                className={`saved-status ${saved === "Could not save" ? "save-error" : ""}`}
                role="status"
              >
                <CheckCheck size={15} />
                {saved}
              </span>
              <button
                className="button ghost template-header"
                onClick={() => setModal("templates")}
              >
                <LayoutTemplate size={16} />
                Templates
              </button>
              {isBuilder && (
                <button
                  className="button secondary preview-header"
                  onClick={() => navigate("/preview")}
                >
                  <Eye size={16} />
                  Preview
                </button>
              )}
              <button
                className="button primary"
                onClick={() => setModal("export")}
              >
                <Download size={16} />
                <span>Export PDF</span>
              </button>
              <div className="menu-wrap">
                <button
                  className="icon-button"
                  onClick={() => setMenu(!menu)}
                  aria-label="Resume menu"
                  aria-expanded={menu}
                >
                  <Menu size={21} />
                </button>
                {menu && (
                  <div className="dropdown">
                    <button
                      onClick={() => {
                        setModal("reset");
                        setMenu(false);
                      }}
                    >
                      <Plus size={16} />
                      Start new resume
                    </button>
                    <button onClick={load}>
                      <FolderOpen size={16} />
                      Load saved resume
                    </button>
                    <button
                      onClick={() => {
                        setModal("reset");
                        setMenu(false);
                      }}
                    >
                      <RotateCcw size={16} />
                      Reset resume
                    </button>
                    <button
                      onClick={() => {
                        setModal("help");
                        setMenu(false);
                      }}
                    >
                      <CircleHelp size={16} />
                      Privacy & help
                    </button>
                  </div>
                )}
              </div>
            </div>
          </header>
          {isBuilder ? (
            <>
              <div className="builder-heading">
                <div>
                  <span className="eyebrow">YOUR NEXT CHAPTER</span>
                  <h1>
                    Let’s tell your story<span>.</span>
                  </h1>
                  <p>
                    A little detail here. A great first impression out there.
                  </p>
                </div>
                <button
                  className="button secondary"
                  onClick={() => setModal("customize")}
                >
                  <SlidersHorizontal size={16} />
                  Customize design
                </button>
              </div>
              <div className="mobile-tabs">
                <button
                  className={mobileTab === "editor" ? "active" : ""}
                  onClick={() => setMobileTab("editor")}
                >
                  Editor
                </button>
                <button
                  className={mobileTab === "preview" ? "active" : ""}
                  onClick={() => setMobileTab("preview")}
                >
                  Preview
                </button>
              </div>
              <div className={`builder-grid mobile-${mobileTab}`}>
                <aside className="builder-sidebar">
                  <ResumeStrength data={data} />
                  <span className="sidebar-label">RESUME CONTENT</span>
                  <nav aria-label="Resume sections">
                    {sections.map((s) => {
                      const Icon = icons[s];
                      const label =
                        s === "personal" ? "Personal details" : sectionNames[s];
                      return (
                        <button
                          key={s}
                          className={`section-nav ${active === s ? "active" : ""}`}
                          onClick={() => setActive(s)}
                        >
                          <Icon size={17} />
                          <span>{label}</span>
                          {s !== "personal" && !data.settings.visible[s] ? (
                            <span className="hidden-label">Hidden</span>
                          ) : active === s ? (
                            <ChevronRight size={15} />
                          ) : null}
                        </button>
                      );
                    })}
                  </nav>
                  <div className="sidebar-bottom">
                    <LockKeyhole size={17} />
                    <p>
                      Just you and your browser.
                      <br />
                      <span>Your data stays on this device.</span>
                    </p>
                  </div>
                </aside>
                <section className="editor-panel">
                  <div className="editor-title">
                    <span className="editor-icon">
                      <ActiveIcon size={21} />
                    </span>
                    <div>
                      <span className="step-label">
                        STEP {String(sectionIndex + 1).padStart(2, "0")} OF 09
                      </span>
                      <h2>
                        {active === "personal"
                          ? "Personal details"
                          : sectionNames[active]}
                      </h2>
                    </div>
                    {active !== "personal" && (
                      <Toggle
                        label={`Show ${sectionNames[active]}`}
                        checked={data.settings.visible[active]}
                        onChange={() =>
                          update((r) => ({
                            ...r,
                            settings: {
                              ...r.settings,
                              visible: {
                                ...r.settings.visible,
                                [active]: !r.settings.visible[active],
                              },
                            },
                          }))
                        }
                      />
                    )}
                  </div>
                  <p className="editor-description">
                    {active === "personal"
                      ? "Start with the basics. Make it easy to get in touch."
                      : active === "summary"
                        ? "A few thoughtful lines can make a lasting impression."
                        : `Add the ${sectionNames[active].toLowerCase()} that make your story yours.`}
                  </p>
                  {active !== "personal" && !data.settings.visible[active] && (
                    <div className="inline-notice">
                      This section is hidden from your resume. Your details are
                      kept.
                    </div>
                  )}
                  <Form {...formProps} />
                  <div className="editor-footer">
                    <span>
                      <Save size={13} />
                      Changes save automatically
                    </span>
                    {sectionIndex < sections.length - 1 && (
                      <button
                        className="button primary small"
                        onClick={() => setActive(sections[sectionIndex + 1])}
                      >
                        Next section
                        <ArrowRight size={15} />
                      </button>
                    )}
                  </div>
                </section>
                <section className="live-preview-panel">
                  <div className="preview-toolbar">
                    <span>
                      <span className="live-dot" />
                      LIVE PREVIEW
                    </span>
                    <button onClick={() => setModal("templates")}>
                      {
                        templates.find(
                          (t) =>
                            t.id ===
                            (data.settings.ats
                              ? "minimal"
                              : data.settings.template),
                        )?.name
                      }
                      <ChevronDown size={14} />
                    </button>
                  </div>
                  <div className="live-preview-scroll">
                    <div className="scaled-resume">
                      <ResumePreview data={data} />
                    </div>
                  </div>
                  <div className="preview-bottom">
                    <span>
                      {data.settings.page} ·{" "}
                      {data.settings.ats ? "ATS-friendly" : "Print-ready"}
                    </span>
                    <button onClick={() => navigate("/preview")}>
                      <Eye size={14} />
                      Full preview
                    </button>
                  </div>
                  <div className="ats-bar">
                    <span>
                      <ShieldCheck size={17} />
                      ATS-friendly mode
                    </span>
                    <Toggle
                      label="Enable ATS-friendly mode"
                      checked={data.settings.ats}
                      onChange={() =>
                        update((r) => ({
                          ...r,
                          settings: { ...r.settings, ats: !r.settings.ats },
                        }))
                      }
                    />
                  </div>
                </section>
              </div>
            </>
          ) : (
            <>
              <div className="final-preview-toolbar">
                <button
                  className="text-button"
                  onClick={() => navigate("/builder")}
                >
                  <ArrowLeft size={17} />
                  Back to edit
                </button>
                <div>
                  <h1>Ready for your next chapter.</h1>
                  <p>One last look before you make your move.</p>
                </div>
                <div>
                  <button
                    className="button secondary"
                    onClick={() => setModal("templates")}
                  >
                    <LayoutTemplate size={16} />
                    Change template
                  </button>
                  <button className="button secondary" onClick={print}>
                    <Printer size={16} />
                    Print
                  </button>
                </div>
              </div>
              <div className="final-resume-wrap">
                <ResumePreview data={data} />
              </div>
              <p className="preview-footnote">
                Long resumes flow onto additional pages when printed. Check the
                print dialog for final pagination.
              </p>
            </>
          )}
        </div>
      )}
      {notice && (
        <div className="toast" role="status">
          <span>{notice}</span>
          <button
            aria-label="Dismiss notification"
            onClick={() => setNotice("")}
          >
            <X size={17} />
          </button>
        </div>
      )}
      {modal && (
        <Modal
          title={
            modal === "templates"
              ? "Find your perfect fit."
              : modal === "customize"
                ? "A little more you."
                : modal === "export"
                  ? "Your resume, ready."
                  : modal === "reset"
                    ? "Start a new chapter?"
                    : "Private by design."
          }
          onClose={() => setModal(null)}
          wide={modal === "templates"}
        >
          {modal === "templates" && (
            <>
              <p className="modal-description">
                A new look, the same story. Your details stay right where they
                are.
              </p>
              <TemplateSelector data={data} choose={choose} />
            </>
          )}
          {modal === "customize" && (
            <CustomizationPanel data={data} update={update} />
          )}{" "}
          {modal === "export" && <ExportControls onPrint={print} />}{" "}
          {modal === "reset" && (
            <>
              <p className="modal-description">
                This will clear your current resume and its saved copy in this
                browser. Export a PDF first if you want to keep it. This cannot
                be undone.
              </p>
              <div className="modal-actions">
                <button
                  className="button secondary"
                  onClick={() => setModal(null)}
                >
                  Keep my resume
                </button>
                <button className="button danger-button" onClick={reset}>
                  Clear & start fresh
                </button>
              </div>
            </>
          )}{" "}
          {modal === "help" && (
            <div className="help-content">
              <ShieldCheck size={38} />
              <p>
                Your resume is saved automatically in{" "}
                <strong>this browser on this device</strong>. It isn’t synced
                across devices, and we never send your information to a server.
              </p>
              <p>
                Clearing browser data or using a private browsing window may
                remove your saved resume. Keep a PDF copy of your finished work.
              </p>
              <p>
                To export, select <strong>Export PDF</strong>, then choose{" "}
                <strong>Save as PDF</strong> in your browser’s print dialog.
                Turn off headers and footers for the cleanest result.
              </p>
            </div>
          )}
        </Modal>
      )}
    </>
  );
}
