# Folio

A private, frontend-only resume builder built with React, TypeScript, Vite, Tailwind CSS, and Lucide icons. No account, backend, database, or external API.

## Run locally

```sh
npm install
npm run dev
```

## Validate and build

```sh
npm test
npm run test:e2e
npm run build
npm run preview
```

The production build is in `dist/`. Deploy it to any static host, with a fallback to `index.html` for `/builder` and `/preview`. Vite is only the development/build tool; the deployed application requires no application server.

Browser tests use an installed Google Chrome via Playwright. They cover editing, local persistence, photo upload, template and ATS switching, mobile views, reset confirmation, and browser PDF generation. Screenshots and PDF samples are written to the ignored `test-results/` directory.

## Features

- Landing page, split-screen builder, mobile editor/preview tabs, and full preview.
- Nine editing sections, local photo upload, dynamic entries, and skill tags.
- Four templates, custom accent, font and text size, A4/Letter, ATS mode, section ordering and visibility.
- Automatic localStorage persistence, load saved resume, and confirmed reset.
- Email, phone, URL, date, and required-field feedback; resume completeness suggestions.
- Browser Print / Save as PDF with multipage print styles. Sidebars become a linear flow for reliable multipage printing; preview and printed column layouts intentionally differ.
- No external fonts or services are contacted. Named sans-serif fonts use installed local copies and fall back to Arial/system sans-serif.

## Privacy and limits

Data is stored only in this browser under `folio.resume.v1`. It is not synced. Clearing site data removes it. Photos are read locally with FileReader (JPG/PNG/WebP, 2 MB limit). Storage failures are surfaced without discarding the current in-memory resume. Export a PDF before clearing browser data.

PDF export opens the browser print dialog: choose Save as PDF, match the selected paper size, and disable browser headers and footers. Page breaks depend on content and browser; check the print preview before saving. ATS mode is a formatting option, not an ATS compatibility guarantee or score.

## Source layout

- `src/model.ts`: data model, sample content, persistence validation, completeness and field validation.
- `src/Forms.tsx`: reusable personal, summary, skill, and dynamic entry forms.
- `src/ResumePreview.tsx`: shared content rendering and four template components.
- `src/App.tsx`: routing, landing page, builder, design settings, and export controls.
- `src/styles.css`: application styling, responsive layouts, resume canvas, and print styles.
