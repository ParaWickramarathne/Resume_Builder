import { useId, useRef, useState } from "react";
import {
  ArrowDown,
  ArrowUp,
  Plus,
  Trash2,
  Upload,
  X,
  Lightbulb,
} from "lucide-react";
import {
  type Resume,
  type Entry,
  type Section,
  fieldError,
  uid,
  moveItem,
} from "./model";
export type Update = (next: Resume | ((r: Resume) => Resume)) => void;
type FieldProps = {
  label: string;
  value: string;
  onChange: (v: string) => void;
  field?: string;
  type?: string;
  placeholder?: string;
  required?: boolean;
  record?: Entry;
  multiline?: boolean;
};
export function Field({
  label,
  value,
  onChange,
  field = "",
  type = "text",
  placeholder,
  required,
  record,
  multiline,
}: FieldProps) {
  const id = useId();
  const [touched, setTouched] = useState(false);
  const error =
    fieldError(field, value, record) ||
    (required && touched && !value.trim() ? "Please fill in this field." : "");
  const props = {
    id,
    value,
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      onChange(e.target.value),
    onBlur: () => setTouched(true),
    placeholder,
    "aria-invalid": !!error,
    "aria-describedby": error ? `${id}-error` : undefined,
    required,
  };
  return (
    <div className={`field ${multiline ? "full" : ""}`}>
      <label htmlFor={id}>
        {label}
        {required && <span className="required"> *</span>}
      </label>
      {multiline ? (
        <textarea {...props} rows={5} />
      ) : (
        <input {...props} type={type} />
      )}{" "}
      {error && (
        <span className="field-error" id={`${id}-error`}>
          {error}
        </span>
      )}
    </div>
  );
}
export function PersonalDetailsForm({
  data,
  update,
}: {
  data: Resume;
  update: Update;
}) {
  const input = useRef<HTMLInputElement>(null);
  const [photoError, setPhotoError] = useState("");
  const set = (key: string, value: string) =>
    update((r) => ({ ...r, personal: { ...r.personal, [key]: value } }));
  function upload(file?: File) {
    if (!file) return;
    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
      setPhotoError("Choose a JPG, PNG, or WebP image.");
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      setPhotoError("Please choose an image smaller than 2 MB.");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      set("photo", String(reader.result));
      setPhotoError("");
    };
    reader.onerror = () =>
      setPhotoError("This image could not be read. Please try another.");
    reader.readAsDataURL(file);
  }
  return (
    <>
      <div className="photo-upload">
        <div className="photo-placeholder">
          {data.personal.photo ? (
            <img src={data.personal.photo} alt="Your profile" />
          ) : (
            <span>
              {data.personal.name
                .split(" ")
                .map((s) => s[0])
                .slice(0, 2)
                .join("") || "You"}
            </span>
          )}
        </div>
        <div>
          <button
            className="button small secondary"
            onClick={() => input.current?.click()}
          >
            <Upload size={14} />
            {data.personal.photo ? "Replace photo" : "Upload photo"}
          </button>
          <p>JPG, PNG or WebP · Up to 2 MB</p>
        </div>
        {data.personal.photo && (
          <button
            className="icon-button"
            aria-label="Remove profile photo"
            onClick={() => set("photo", "")}
          >
            <Trash2 size={17} />
          </button>
        )}
        <input
          hidden
          ref={input}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          onChange={(e) => {
            upload(e.target.files?.[0]);
            e.target.value = "";
          }}
        />
      </div>
      {photoError && (
        <p role="alert" className="field-error">
          {photoError}
        </p>
      )}
      <div className="form-grid">
        {(
          [
            ["name", "Full name", "Alex Morgan", true],
            ["title", "Professional title", "Product Designer", false],
            ["email", "Email address", "you@example.com", true],
            ["phone", "Phone number", "+1 (415) 555-0123", false],
            ["address", "Location", "San Francisco, CA", false],
            ["linkedin", "LinkedIn", "linkedin.com/in/yourname", false],
            ["website", "Portfolio / website", "yourwebsite.com", false],
            ["other", "Other contact details", "Optional", false],
          ] as [keyof Resume["personal"], string, string, boolean][]
        ).map(([key, label, placeholder, required]) => (
          <Field
            key={key}
            field={key}
            label={label}
            value={data.personal[key]}
            onChange={(v) => set(key, v)}
            placeholder={placeholder}
            required={required}
            type={key === "email" ? "email" : key === "phone" ? "tel" : "text"}
          />
        ))}
      </div>
      <div className="form-tip">
        <Lightbulb size={17} />
        <span>
          A professional title helps recruiters understand what you do at a
          glance.
        </span>
      </div>
    </>
  );
}
export function SummaryForm({
  data,
  update,
}: {
  data: Resume;
  update: Update;
}) {
  return (
    <>
      <Field
        label="Tell your story"
        value={data.summary}
        onChange={(summary) => update((r) => ({ ...r, summary }))}
        multiline
        placeholder="What do you bring to the table? Share your experience, strengths, and what you'd like to do next."
      />
      <div className="character-count">
        <span>Aim for 2–4 sentences. Recommended: 600 characters.</span>
        <span className={data.summary.length > 600 ? "field-error" : ""}>
          {data.summary.length} / 600
        </span>
      </div>
      <div className="form-tip">
        <Lightbulb size={17} />
        <span>
          Lead with your experience, add a standout achievement, and make it
          specific to your next role.
        </span>
      </div>
    </>
  );
}
type EntrySection = Exclude<Section, "summary" | "skills">;
type Spec = [string, string, string?];
const schemas: Record<EntrySection, Spec[]> = {
  experience: [
    ["title", "Job title"],
    ["company", "Company"],
    ["location", "Location"],
    ["start", "Start date", "month"],
    ["end", "End date", "month"],
    ["description", "Responsibilities & achievements", "textarea"],
  ],
  education: [
    ["institution", "Institution / university"],
    ["degree", "Degree"],
    ["field", "Field of study"],
    ["start", "Start year"],
    ["end", "End year"],
    ["description", "Description", "textarea"],
  ],
  projects: [
    ["name", "Project name"],
    ["technologies", "Technologies used"],
    ["url", "Project URL"],
    ["github", "GitHub URL"],
    ["description", "Description", "textarea"],
  ],
  certifications: [
    ["name", "Certification name"],
    ["organization", "Issuing organization"],
    ["year", "Year"],
    ["url", "Credential URL"],
  ],
  languages: [
    ["name", "Language"],
    ["level", "Proficiency", "select"],
  ],
  references: [
    ["name", "Reference name"],
    ["position", "Position"],
    ["company", "Company"],
    ["phone", "Phone number"],
    ["email", "Email address"],
  ],
};
const singular: Record<EntrySection, string> = {
  experience: "experience",
  education: "education",
  projects: "project",
  certifications: "certification",
  languages: "language",
  references: "reference",
};
export function EntriesForm({
  section,
  data,
  update,
}: {
  section: EntrySection;
  data: Resume;
  update: Update;
}) {
  const entries = data[section];
  const change = (id: string, key: string, value: string) =>
    update((r) => ({
      ...r,
      [section]: r[section].map((e) =>
        e.id === id ? { ...e, [key]: value } : e,
      ),
    }));
  function add() {
    const entry: Entry = { id: uid() };
    schemas[section].forEach(
      ([key]) => (entry[key] = key === "level" ? "Fluent" : ""),
    );
    update((r) => ({ ...r, [section]: [...r[section], entry] }));
  }
  return (
    <>
      {section === "references" && (
        <div className="reference-options">
          <label>
            <input
              type="radio"
              name="references"
              checked={data.referenceMode === "request"}
              onChange={() =>
                update((r) => ({ ...r, referenceMode: "request" }))
              }
            />{" "}
            Available upon request
          </label>
          <label>
            <input
              type="radio"
              name="references"
              checked={data.referenceMode === "details"}
              onChange={() =>
                update((r) => ({ ...r, referenceMode: "details" }))
              }
            />{" "}
            Add reference details
          </label>
        </div>
      )}
      {(section !== "references" || data.referenceMode === "details") && (
        <>
          {entries.length === 0 && (
            <div className="empty-section">
              <p>Every detail adds to your story.</p>
              <span>Add your first {singular[section]} to get started.</span>
            </div>
          )}
          {entries.map((entry, index) => (
            <div className="entry-card" key={entry.id}>
              <div className="entry-card-header">
                <strong>
                  {entry.title ||
                    entry.institution ||
                    entry.name ||
                    `New ${singular[section]}`}
                </strong>
                <div>
                  <button
                    className="icon-button"
                    disabled={index === 0}
                    aria-label={`Move ${singular[section]} up`}
                    onClick={() =>
                      update((r) => ({
                        ...r,
                        [section]: moveItem(r[section], index, index - 1),
                      }))
                    }
                  >
                    <ArrowUp size={15} />
                  </button>
                  <button
                    className="icon-button"
                    disabled={index === entries.length - 1}
                    aria-label={`Move ${singular[section]} down`}
                    onClick={() =>
                      update((r) => ({
                        ...r,
                        [section]: moveItem(r[section], index, index + 1),
                      }))
                    }
                  >
                    <ArrowDown size={15} />
                  </button>
                  <button
                    className="icon-button danger"
                    aria-label={`Remove ${singular[section]}`}
                    onClick={() =>
                      update((r) => ({
                        ...r,
                        [section]: r[section].filter((e) => e.id !== entry.id),
                      }))
                    }
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
              <div className="form-grid">
                {schemas[section].map(([key, label, type]) =>
                  key === "end" && entry.current === "true" ? null : type ===
                    "select" ? (
                    <label className="field" key={key}>
                      {label}
                      <select
                        value={entry[key]}
                        onChange={(e) => change(entry.id, key, e.target.value)}
                      >
                        {["Native", "Fluent", "Intermediate", "Basic"].map(
                          (l) => (
                            <option key={l}>{l}</option>
                          ),
                        )}
                      </select>
                    </label>
                  ) : (
                    <Field
                      key={key}
                      field={key}
                      label={label}
                      value={entry[key] || ""}
                      onChange={(v) => change(entry.id, key, v)}
                      type={
                        type === "month"
                          ? "month"
                          : key === "email"
                            ? "email"
                            : "text"
                      }
                      multiline={type === "textarea"}
                      record={entry}
                      required={key === schemas[section][0][0]}
                      placeholder={
                        key === "description" && section === "experience"
                          ? "Write each responsibility or achievement on a new line"
                          : undefined
                      }
                    />
                  ),
                )}
                {section === "experience" && (
                  <label className="checkbox-label full">
                    <input
                      type="checkbox"
                      checked={entry.current === "true"}
                      onChange={(e) =>
                        change(entry.id, "current", String(e.target.checked))
                      }
                    />{" "}
                    I currently work here
                  </label>
                )}
              </div>
            </div>
          ))}
          <button className="add-button" onClick={add}>
            <Plus size={17} />
            Add {singular[section]}
          </button>
        </>
      )}
    </>
  );
}
export function SkillsForm({ data, update }: { data: Resume; update: Update }) {
  const [skill, setSkill] = useState("");
  const [message, setMessage] = useState("");
  function add() {
    const value = skill.trim();
    if (!value) return;
    if (data.skills.some((s) => s.toLowerCase() === value.toLowerCase())) {
      setMessage("You have already added this skill.");
      return;
    }
    update((r) => ({ ...r, skills: [...r.skills, value] }));
    setSkill("");
    setMessage("");
  }
  return (
    <>
      <label className="field">
        Your skills
        <div className="skill-input">
          <input
            value={skill}
            placeholder="e.g. Project management"
            onChange={(e) => setSkill(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                add();
              }
            }}
          />
          <button className="button primary" onClick={add}>
            <Plus size={16} />
            Add skill
          </button>
        </div>
      </label>
      {message && (
        <p role="status" className="field-error">
          {message}
        </p>
      )}
      <div className="skill-tags">
        {data.skills.map((s) => (
          <span key={s}>
            {s}
            <button
              aria-label={`Remove ${s}`}
              onClick={() =>
                update((r) => ({
                  ...r,
                  skills: r.skills.filter((v) => v !== s),
                }))
              }
            >
              <X size={13} />
            </button>
          </span>
        ))}
      </div>
      <div className="form-tip">
        <Lightbulb size={17} />
        <span>
          Aim for 6–10 relevant skills. Include a mix of practical expertise and
          strengths that make you a great teammate.
        </span>
      </div>
    </>
  );
}
export const EducationForm = (p: { data: Resume; update: Update }) => (
  <EntriesForm section="education" {...p} />
);
export const ExperienceForm = (p: { data: Resume; update: Update }) => (
  <EntriesForm section="experience" {...p} />
);
export const ProjectsForm = (p: { data: Resume; update: Update }) => (
  <EntriesForm section="projects" {...p} />
);
export const CertificationsForm = (p: { data: Resume; update: Update }) => (
  <EntriesForm section="certifications" {...p} />
);
export const LanguagesForm = (p: { data: Resume; update: Update }) => (
  <EntriesForm section="languages" {...p} />
);
export const ReferencesForm = (p: { data: Resume; update: Update }) => (
  <EntriesForm section="references" {...p} />
);
