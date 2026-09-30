import type { CSSProperties } from "react";
import { type Resume, type Section, safeUrl } from "./model";

const date = (value: string) => {
  if (!value) return "";
  if (value.length === 4) return value;
  const [y, m] = value.split("-");
  return `${["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"][Number(m) - 1] || ""} ${y}`;
};
const dates = (start: string, end: string, current?: string) =>
  [date(start), current === "true" ? "Present" : date(end)]
    .filter(Boolean)
    .join(" — ");
function WebLink({ value, label }: { value: string; label?: string }) {
  const href = safeUrl(value);
  return href ? (
    <a href={href} target="_blank" rel="noreferrer">
      {label || value.replace(/^https?:\/\//, "").replace(/\/$/, "")}
    </a>
  ) : (
    <span>{value}</span>
  );
}
const headings: Record<Section, string> = {
  summary: "Profile",
  experience: "Experience",
  education: "Education",
  skills: "Expertise",
  projects: "Selected projects",
  certifications: "Certifications",
  languages: "Languages",
  references: "References",
};
function ResumeSection({ section, data }: { section: Section; data: Resume }) {
  if (!data.settings.visible[section]) return null;
  const content =
    section === "summary" ? (
      data.summary.trim() ? (
        <p>{data.summary}</p>
      ) : null
    ) : section === "skills" ? (
      data.skills.length ? (
        <div className="resume-skills">
          {data.skills.map((s) => (
            <span key={s}>{s}</span>
          ))}
        </div>
      ) : null
    ) : section === "references" && data.referenceMode === "request" ? (
      <p>References available upon request.</p>
    ) : data[section].length ? (
      data[section].map((e) => (
        <div className="resume-entry" key={e.id}>
          {section === "experience" && (
            <>
              <div className="entry-heading">
                <h4>{e.title}</h4>
                <time>{dates(e.start, e.end, e.current)}</time>
              </div>
              <div className="entry-subtitle">
                {[e.company, e.location].filter(Boolean).join(" · ")}
              </div>
              {e.description && (
                <ul>
                  {e.description
                    .split("\n")
                    .filter(Boolean)
                    .map((line, i) => (
                      <li key={i}>{line}</li>
                    ))}
                </ul>
              )}
            </>
          )}
          {section === "education" && (
            <>
              <div className="entry-heading">
                <h4>{e.institution}</h4>
                <time>{dates(e.start, e.end)}</time>
              </div>
              <div className="entry-subtitle">
                {[e.degree, e.field].filter(Boolean).join(" · ")}
              </div>
              {e.description && <p>{e.description}</p>}
            </>
          )}
          {section === "projects" && (
            <>
              <h4>{e.name}</h4>
              <p>{e.description}</p>
              {e.technologies && (
                <div className="entry-subtitle">{e.technologies}</div>
              )}
              <div className="entry-links">
                {e.url && <WebLink value={e.url} label="View project" />}
                {e.github && <WebLink value={e.github} label="GitHub" />}
              </div>
            </>
          )}
          {section === "certifications" && (
            <>
              <div className="entry-heading">
                <h4>{e.name}</h4>
                <time>{e.year}</time>
              </div>
              <p>{e.organization}</p>
              {e.url && <WebLink value={e.url} label="View credential" />}
            </>
          )}
          {section === "languages" && (
            <p>
              <strong>{e.name}</strong>
              {e.level && <span> · {e.level}</span>}
            </p>
          )}
          {section === "references" && (
            <>
              <h4>{e.name}</h4>
              <p>{[e.position, e.company].filter(Boolean).join(", ")}</p>
              <p>{e.email}</p>
              <p>{e.phone}</p>
            </>
          )}
        </div>
      ))
    ) : null;
  if (!content) return null;
  return (
    <section className={`resume-section section-${section}`}>
      <h3>
        {data.settings.ats || data.settings.template === "minimal"
          ? {
              summary: "Professional Summary",
              skills: "Skills",
              projects: "Projects",
              experience: "Work Experience",
            }[section as string] || headings[section]
          : headings[section]}
      </h3>
      {content}
    </section>
  );
}
function Contact({ data }: { data: Resume }) {
  const p = data.personal;
  return (
    <div className="resume-contact">
      {p.email && <span>{p.email}</span>}
      {p.phone && <span>{p.phone}</span>}
      {p.address && <span>{p.address}</span>}
      {p.linkedin && <WebLink value={p.linkedin} />}{" "}
      {p.website && <WebLink value={p.website} />}{" "}
      {p.other && <span>{p.other}</span>}
    </div>
  );
}
function Identity({ data }: { data: Resume }) {
  const show =
    data.settings.showPhoto &&
    !data.settings.ats &&
    data.settings.template !== "minimal";
  return (
    <header className="resume-identity">
      {show && data.personal.photo && (
        <img src={data.personal.photo} alt="Profile" className="resume-photo" />
      )}
      <div>
        <h2>{data.personal.name || "Your name"}</h2>
        <p className="resume-title">
          {data.personal.title || "Your professional title"}
        </p>
      </div>
    </header>
  );
}
function Columns({ data }: { data: Resume }) {
  const side: Section[] = ["skills", "languages", "certifications"];
  return (
    <>
      <Identity data={data} />
      <div className="resume-columns">
        <aside>
          <section className="resume-section">
            <h3>Contact</h3>
            <Contact data={data} />
          </section>
          {data.settings.order
            .filter((s) => side.includes(s))
            .map((s) => (
              <ResumeSection key={s} section={s} data={data} />
            ))}
        </aside>
        <main>
          {data.settings.order
            .filter((s) => !side.includes(s))
            .map((s) => (
              <ResumeSection key={s} section={s} data={data} />
            ))}
        </main>
      </div>
    </>
  );
}
export function ModernTemplate({ data }: { data: Resume }) {
  return <Columns data={data} />;
}
export function CreativeTemplate({ data }: { data: Resume }) {
  return <Columns data={data} />;
}
export function ClassicTemplate({ data }: { data: Resume }) {
  return (
    <>
      <Identity data={data} />
      <Contact data={data} />
      {data.settings.order.map((s) => (
        <ResumeSection key={s} section={s} data={data} />
      ))}
    </>
  );
}
export function MinimalTemplate({ data }: { data: Resume }) {
  return <ClassicTemplate data={data} />;
}
export default function ResumePreview({
  data,
  miniature = false,
}: {
  data: Resume;
  miniature?: boolean;
}) {
  const template = data.settings.ats ? "minimal" : data.settings.template;
  const Component = {
    modern: ModernTemplate,
    classic: ClassicTemplate,
    minimal: MinimalTemplate,
    creative: CreativeTemplate,
  }[template];
  const style = {
    "--resume-accent": data.settings.accent,
    "--resume-font":
      data.settings.ats || template === "minimal"
        ? "Arial, sans-serif"
        : ["Georgia", "Times New Roman"].includes(data.settings.font)
          ? `"${data.settings.font}", serif`
          : `"${data.settings.font}", Arial, sans-serif`,
    "--resume-size":
      data.settings.size === "Small"
        ? "10px"
        : data.settings.size === "Large"
          ? "12px"
          : "11px",
  } as CSSProperties;
  return (
    <article
      inert={miniature ? true : undefined}
      aria-label={miniature ? "Resume template example" : "Resume preview"}
      className={`resume-sheet template-${template} page-${data.settings.page} ${miniature ? "miniature" : ""}`}
      style={style}
    >
      <Component data={data} />
    </article>
  );
}
