import { describe, expect, it, vi, afterEach } from "vitest";
import {
  demo,
  emptyResume,
  fieldError,
  moveItem,
  readSaved,
  safeUrl,
  strength,
} from "./model";

afterEach(() => vi.unstubAllGlobals());
describe("resume data and completeness", () => {
  it("creates independent empty resumes without sample personal information", () => {
    const a = emptyResume();
    const b = emptyResume();
    a.skills.push("Research");
    expect(b.skills).toEqual([]);
    expect(strength(b).score).toBe(0);
    expect(b.personal.name).toBe("");
  });
  it("gives actionable suggestions and a complete sample score", () => {
    expect(strength(emptyResume()).suggestions).toContain(
      "Add at least three skills",
    );
    expect(strength(demo).score).toBe(100);
  });
  it("moves entries without changing or losing their data", () => {
    const original = ["one", "two", "three"];
    expect(moveItem(original, 2, 0)).toEqual(["three", "one", "two"]);
    expect(original).toEqual(["one", "two", "three"]);
    expect(moveItem(original, 0, -1)).toEqual(original);
  });
});
describe("field validation and safe links", () => {
  it("validates emails, phone numbers, and web addresses", () => {
    expect(fieldError("email", "person@")).not.toBe("");
    expect(fieldError("email", "person@example.com")).toBe("");
    expect(fieldError("phone", "123")).not.toBe("");
    expect(fieldError("phone", "+1 (415) 555-0123")).toBe("");
    expect(fieldError("url", "bad url")).not.toBe("");
    expect(fieldError("url", "example.com/work")).toBe("");
  });
  it("rejects end dates before start dates", () => {
    expect(
      fieldError("end", "2020-01", { id: "1", start: "2021-01" }),
    ).not.toBe("");
    expect(fieldError("end", "2022-01", { id: "1", start: "2021-01" })).toBe(
      "",
    );
    expect(fieldError("end", "2020", { id: "1", start: "2021" })).not.toBe("");
  });
  it("does not allow executable links", () => {
    expect(safeUrl("javascript://example.com/alert(1)")).toBeUndefined();
    expect(safeUrl("https://example.com")).toBe("https://example.com");
    expect(safeUrl("example.com")).toBe("https://example.com");
  });
});
describe("stored resume recovery", () => {
  const storage = (value: string | null) =>
    vi.stubGlobal("localStorage", { getItem: () => value });
  it("loads a valid saved resume", () => {
    storage(JSON.stringify(demo));
    expect(readSaved()).toEqual(demo);
  });
  it("ignores malformed JSON and incompatible saved data", () => {
    storage("{broken");
    expect(readSaved()).toBeNull();
    storage(JSON.stringify({ ...demo, skills: [42] }));
    expect(readSaved()).toBeNull();
    storage(
      JSON.stringify({
        ...demo,
        settings: { ...demo.settings, order: ["summary", "summary"] },
      }),
    );
    expect(readSaved()).toBeNull();
  });
  it("handles browsers that block storage", () => {
    vi.stubGlobal("localStorage", {
      getItem: () => {
        throw Error("Blocked");
      },
    });
    expect(readSaved()).toBeNull();
  });
});
