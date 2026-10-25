# Aula Studio

A bilingual, responsive academic management dashboard built with **React, TypeScript, Vite, and CSS Modules**.

Aula Studio demonstrates how an educational institution could organize students, courses, academic groups, enrollment, attendance, assessment results, tuition records, announcements, and administrative reports through one role-aware application. Its purpose is to showcase application architecture, state management, UI composition, and practical academic workflows.

> **Portfolio demonstration.** Aula Studio is an independent fictional product concept, not an official product or commissioned system for any academy. Do not enter real student or financial data. Authentication, authorization, and persistence are simulated in the browser and are not appropriate for production use.

## Features

- **Three role experiences:** Student, tutor/teacher, and administrator; each has a dedicated navigation structure and permitted actions.
- **Academic administration:** Student records, course catalog, subjects, groups, tutors, and enrollment management.
- **Teaching tools:** Class sessions, attendance records, assessments, and grades.
- **Financial demonstration:** Tuition charges, recorded payments, outstanding balances, and CSV reporting. No actual payments are processed.
- **Bilingual interface:** Spanish by default; English is available through the ESP/EN language menu with Spain and England flag icons.
- **Light and dark themes:** Semantic CSS custom properties keep background, text, borders, and controls consistent across themes.
- **Temporary persistence:** `sessionStorage` preserves changes during a tab's session and on refresh; the administrator can also reset the demonstration.
- **Deployment-ready routing:** Vercel configuration handles SPA deep links.

## Demo accounts

The login screen displays all three accounts with their role and credentials. Visitors can also use the one-click role previews.

| Role | Email | Password |
| --- | --- | --- |
| Student | `alumno@demo.academia` | `Demo2026!` |
| Tutor / teacher | `tutor@demo.academia` | `Demo2026!` |
| Administrator | `admin@demo.academia` | `Demo2026!` |

Permissions follow the principle of increasing scope:

| Capability | Student | Tutor | Administrator |
| --- | :---: | :---: | :---: |
| View personal academic records | Yes | — | Yes |
| Review assigned teaching groups | — | Yes | Yes |
| Register attendance and grades | — | Assigned groups | Yes |
| Manage courses, students, and user accounts | — | — | Yes |
| Record tuition charges and payments | — | — | Yes |

Role checks are implemented in client-side code. They are for demonstration only and can be bypassed by a knowledgeable user.

## Technology

| Concern | Technology |
| --- | --- |
| User interface | React 19 + TypeScript |
| Build tooling | Vite 6 |
| Routing | React Router 7 |
| Styles | CSS Modules + semantic theme variables |
| Icons | Lucide React + SVG flags |
| State | React Context + custom hooks |
| Demo persistence | `sessionStorage` |
| Deployment | Static Vite build (Vercel-compatible) |

There are no external authentication services, Firebase project, database credentials, or API keys.

## Development

Requires **Node.js 20+** and npm.

```bash
npm install
npm run dev
```

Open the local URL shown by Vite. To check the project and build the distributable site:

```bash
npm run typecheck
npm run build
npm run preview
```

The generated static application is located in `dist/`.

## Project structure

```text
src/
├── App.tsx                         # Routes and role-aware guards
├── Main.tsx                        # Providers and React root
├── Types.ts                        # Typed domain models
├── components/
│   ├── Common/
│   │   ├── Common.tsx              # Reusable UI primitives
│   │   └── Common.module.css
│   ├── DisplayControls/
│   │   ├── DisplayControls.tsx     # Language and theme settings
│   │   └── DisplayControls.module.css
│   └── Shell/
│       ├── Shell.tsx               # Layout and navigation
│       └── Shell.module.css
├── context/
│   └── DemoContext.tsx             # Demo authentication and state mutations
├── data/
│   └── Seed.ts                     # Connected fictional records
├── i18n/
│   ├── Preferences.tsx             # Locale and appearance state
│   └── Translations.ts            # Spanish-to-English string catalog
├── lib/
│   ├── Permissions.ts              # Record scoping and permissions
│   └── Utils.ts                    # Date, money and ID helpers
├── pages/
│   ├── Login/                      # Login.tsx + Login.module.css
│   ├── Dashboard/                  # Dashboard.tsx + Dashboard.module.css
│   ├── Students/                   # Students.tsx
│   ├── Courses/                    # Courses.tsx + Courses.module.css
│   ├── Enrollments/               # Enrollments.tsx
│   ├── Attendance/                # Attendance.tsx
│   ├── Evaluations/               # Evaluations.tsx + Evaluations.module.css
│   ├── Finance/                   # Finance.tsx
│   ├── Announcements/             # Announcements.tsx + Announcements.module.css
│   ├── Reports/                   # Reports.tsx
│   ├── Users/                     # Users.tsx
│   └── Profile/                   # Profile.tsx
└── styles/
    ├── Global.css                  # Shared layouts and reset
    ├── PageShared.module.css      # Reusable page styles
    └── Themes.css                  # Light/dark semantic tokens

public/
├── favicon.svg
└── flags/
    ├── Spain.svg
    └── England.svg
```

Each page and shared component has its own PascalCase directory. CSS Modules are colocated with components when their styles are local. Reusable academic page styles are intentionally extracted into one shared stylesheet to avoid copying rules across modules.

## Design decisions

**Local demo data.** `Seed.ts` creates a connected fictional academic dataset, allowing visitors to perform cross-module actions without a backend. Updates are isolated to their own tab; separate visitors cannot see one another's changes. Browsers may restore a tab's session after a crash or a tab restoration.

**Role-aware workflows.** The same academic records are presented differently depending on the current account. Administrators can work with the broadest set of modules, tutors operate on assigned groups, and students review their own information.

**Internationalization.** Spanish source strings are translated through a centralized English catalog. Dates and currency formats follow the selected locale. Content entered by demo visitors remains as originally typed.

**Styling.** Components use CSS Modules to limit selector collisions, with a 4-space indentation convention, readable declaration blocks, and semantic tokens for both themes.

## Deploying to Vercel

1. Push the full project to GitHub.
2. Create a new Vercel project connected to that repository.
3. Use **Vite**, build command **`npm run build`**, and output directory **`dist`**.
4. Deploy. `vercel.json` redirects deep links to the SPA entry point.

No environment variables are required. See [DEPLOY.md](./DEPLOY.md) for more information.

## Production considerations

This repository is not a production-ready student information system. A real deployment handling personal or academic information requires server-side identity verification, authorization enforced at the data layer, a managed database, backup and recovery, audit controls, and appropriate privacy compliance. Never use the sample passwords for a live application.

## License and authorship

This project is presented as a personal portfolio example. No license is granted for commercial redistribution unless specified separately.
