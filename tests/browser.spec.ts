import { test, expect } from "@playwright/test";
import { demo, STORAGE_KEY } from "../src/model";
import { readFileSync } from "node:fs";

test("landing, editing, persistence, templates, visibility, export, and reset", async ({
  page,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.goto("/");
  await expect(
    page.getByRole("heading", { name: /Your next chapter/ }),
  ).toBeVisible();
  await page.screenshot({
    path: "test-results/landing-desktop.png",
    fullPage: true,
  });
  await page
    .getByRole("button", { name: "Create my resume", exact: true })
    .click();
  await page.getByLabel("Full name").fill("Jordan Ellis");
  await page.getByLabel("Professional title").fill("Software Engineer");
  await page.getByLabel("Email address").fill("invalid");
  await expect(
    page.getByText("Enter a valid email, like you@example.com."),
  ).toBeVisible();
  await page.getByLabel("Email address").fill("jordan@example.com");
  await expect(page.locator(".resume-identity h2")).toHaveText("Jordan Ellis");
  await expect(
    page.getByRole("status").filter({ hasText: "Saved locally" }),
  ).toBeVisible();
  await page.reload();
  await expect(page.getByLabel("Full name")).toHaveValue("Jordan Ellis");
  await page
    .getByRole("button", { name: "Work experience", exact: true })
    .click();
  await page
    .getByRole("button", { name: "Add experience", exact: true })
    .click();
  await page.getByLabel("Job title").fill("Frontend Engineer");
  await page.getByLabel("Company", { exact: true }).fill("Acme");
  await page.getByLabel("Start date").fill("2023-02");
  await page.getByLabel("End date").fill("2022-01");
  await expect(
    page.getByText("End date must be after the start date."),
  ).toBeVisible();
  await page.getByLabel("I currently work here").check();
  await expect(page.locator(".resume-sheet")).toContainText("Present");
  await page.getByRole("button", { name: "Skills", exact: true }).click();
  const skill = page.getByPlaceholder("e.g. Project management");
  for (const name of ["React", "TypeScript", "Accessibility"]) {
    await skill.fill(name);
    await skill.press("Enter");
  }
  await expect(page.locator(".resume-skills")).toContainText("Accessibility");
  await page.getByRole("switch", { name: "Show Skills", exact: true }).click();
  await expect(page.locator(".resume-skills")).toHaveCount(0);
  await page.getByRole("switch", { name: "Show Skills", exact: true }).click();
  await page.getByRole("button", { name: "Templates", exact: true }).click();
  await page.getByRole("button", { name: /The Creative/ }).click();
  await expect(page.locator(".resume-sheet")).toHaveClass(/template-creative/);
  await expect(page.locator(".resume-sheet")).toContainText("Jordan Ellis");
  await page.getByRole("switch", { name: "Enable ATS-friendly mode" }).click();
  await expect(page.locator(".resume-sheet")).toHaveClass(/template-minimal/);
  await page.getByRole("button", { name: "Export PDF", exact: true }).click();
  await page.evaluate(() => {
    window.print = () => {
      (window as any).__printed = true;
    };
  });
  await page.getByRole("button", { name: "Continue to PDF / Print" }).click();
  await expect(page).toHaveURL(/\/preview$/);
  await expect
    .poll(() => page.evaluate(() => (window as any).__printed))
    .toBe(true);
  await page.getByRole("button", { name: "Resume menu" }).click();
  await page.getByRole("button", { name: "Reset resume", exact: true }).click();
  await page.getByRole("button", { name: "Keep my resume" }).click();
  await expect(page.locator(".resume-sheet")).toContainText("Jordan Ellis");
  await page.getByRole("button", { name: "Resume menu" }).click();
  await page.getByRole("button", { name: "Reset resume", exact: true }).click();
  await page.getByRole("button", { name: "Clear & start fresh" }).click();
  await expect(page.getByLabel("Full name")).toHaveValue("");
  expect(errors).toEqual([]);
});

test("populated desktop builder, mobile layout, photo, and multipage PDF", async ({
  page,
}) => {
  await page.addInitScript(
    ({ key, data }) => localStorage.setItem(key, JSON.stringify(data)),
    { key: STORAGE_KEY, data: demo },
  );
  await page.goto("/builder");
  const sheet = page.locator(".resume-sheet");
  const preview = page.locator(".live-preview-scroll");
  expect((await sheet.boundingBox())!.width).toBeLessThan(
    (await preview.boundingBox())!.width,
  );
  await page.screenshot({
    path: "test-results/builder-desktop.png",
    fullPage: true,
  });
  await page
    .locator("input[type=file]")
    .setInputFiles({
      name: "photo.png",
      mimeType: "image/png",
      buffer: Buffer.from(
        "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAusB9Wl6Y2kAAAAASUVORK5CYII=",
        "base64",
      ),
    });
  await expect(page.locator(".resume-photo")).toBeVisible();
  await page.getByRole("button", { name: "Remove profile photo" }).click();
  await expect(page.locator(".resume-photo")).toHaveCount(0);
  await page.setViewportSize({ width: 390, height: 844 });
  await expect(page.locator(".editor-panel")).toBeVisible();
  await expect(page.locator(".live-preview-panel")).toBeHidden();
  await page
    .getByRole("button", { name: "Preview", exact: true })
    .filter({ visible: true })
    .click();
  await expect(page.locator(".live-preview-panel")).toBeVisible();
  await expect(page.locator(".editor-panel")).toBeHidden();
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth,
    ),
  ).toBe(true);
  await page.screenshot({
    path: "test-results/builder-mobile.png",
    fullPage: true,
  });
  await page.getByRole("button", { name: "Full preview" }).click();
  await expect(page.locator(".final-resume-wrap")).toBeVisible();
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth,
    ),
  ).toBe(true);
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.emulateMedia({ media: "print" });
  await expect(page.locator(".app-header")).toBeHidden();
  await page.pdf({
    path: "test-results/resume.pdf",
    preferCSSPageSize: true,
    printBackground: true,
  });
  expect(
    readFileSync("test-results/resume.pdf")
      .toString("latin1")
      .match(/\/Type \/Page\b/g)?.length,
  ).toBe(1);
  await page.emulateMedia({ media: "screen" });
  await page.evaluate(
    ({ key, data }) => {
      data.experience = Array.from({ length: 14 }, (_, i) => ({
        ...data.experience[0],
        id: `e${i}`,
        title: `Engineer ${i}`,
      }));
      localStorage.setItem(key, JSON.stringify(data));
    },
    { key: STORAGE_KEY, data: demo },
  );
  // Remove the initial storage fixture before loading the deliberately long resume.
  await page.getByRole("button", { name: "Resume menu" }).click();
  await page.getByRole("button", { name: "Load saved resume" }).click();
  await expect(page.locator(".resume-sheet")).toContainText("Engineer 13");
  await page.pdf({
    path: "test-results/multipage-resume.pdf",
    preferCSSPageSize: true,
    printBackground: true,
  });
  expect(
    readFileSync("test-results/multipage-resume.pdf")
      .toString("latin1")
      .match(/\/Type \/Page\b/g)!.length,
  ).toBeGreaterThan(1);
});

test("customization, references, and section ordering preserve content", async ({
  page,
}) => {
  await page.goto("/builder");
  await page.getByLabel("Full name").fill("Sam Taylor");
  await page.getByRole("button", { name: "Customize design" }).click();
  await page.getByLabel("Font family").selectOption("Georgia");
  await page.getByLabel("Font size").selectOption("Large");
  await page.getByLabel("Page size", { exact: true }).selectOption("Letter");
  await page
    .getByRole("button", { name: "Use #6a5078 accent", exact: true })
    .click();
  await page
    .getByRole("button", { name: "Move Education up", exact: true })
    .click();
  await page
    .getByRole("switch", { name: "Show References", exact: true })
    .click();
  await page.getByRole("button", { name: "Close dialog" }).click();
  await expect(page.locator(".resume-sheet")).toHaveClass(/page-Letter/);
  await expect(page.locator(".resume-sheet")).toContainText(
    "References available upon request.",
  );
  await expect(page.locator(".section-nav").nth(2)).toContainText("Education");
  await page.getByRole("button", { name: "References", exact: true }).click();
  await page.getByLabel("Add reference details").check();
  await page
    .getByRole("button", { name: "Add reference", exact: true })
    .click();
  await page.getByLabel("Reference name").fill("Maya Lee");
  await page.getByLabel("Position", { exact: true }).fill("Engineering Lead");
  await expect(page.locator(".resume-sheet")).toContainText("Maya Lee");
  await expect(
    page.getByRole("status").filter({ hasText: "Saved locally" }),
  ).toBeVisible();
  await page.reload();
  await expect(page.locator(".resume-sheet")).toContainText("Maya Lee");
  await expect(page.locator(".resume-sheet")).toHaveClass(/page-Letter/);
  await page.getByRole("button", { name: "Customize design" }).click();
  await expect(page.getByLabel("Font family")).toHaveValue("Georgia");
  await expect(page.getByLabel("Font size")).toHaveValue("Large");
});

test("mobile landing fits and corrupt storage does not crash", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.addInitScript(
    (key) => localStorage.setItem(key, "{broken"),
    STORAGE_KEY,
  );
  await page.goto("/");
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth,
    ),
  ).toBe(true);
  expect(
    await page
      .locator(".hero h1")
      .evaluate((el) => el.scrollWidth <= el.clientWidth),
  ).toBe(true);
  expect((await page.locator(".hero-copy").boundingBox())!.width).toBeLessThan(
    390,
  );
  await page.screenshot({
    path: "test-results/landing-mobile.png",
    fullPage: true,
  });
  await page
    .getByRole("button", { name: "Create my resume", exact: true })
    .click();
  await expect(page.getByLabel("Full name")).toHaveValue("");
});
