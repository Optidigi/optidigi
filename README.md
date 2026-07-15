# Optidigi website

The public Optidigi marketing website, built with Astro, React and Tailwind CSS.

## Routes

- `/` — homepage
- `/en/` — English homepage
- `/contact` — contact form and appointment entry point
- `/en/contact` — English contact page
- `/privacy` — privacy statement
- `/en/privacy` — English privacy statement
- `/juridisch` — legal document index
- `/juridisch/algemene-voorwaarden` — Dutch general terms and conditions
- `/en/legal` — English legal document index
- `/en/legal/general-terms` — English index page for the Dutch terms
- `/agenda` — private appointment and availability management
- `/api/*` — contact, availability, booking and management endpoints

## Component structure

- `src/components/HomePage.astro` — homepage composition and hero copy
- `src/components/SiteHeader.astro` — fixed header and appointment dialog host
- `src/components/HeaderNavigation.tsx` — desktop and mobile navigation menus
- `src/components/HeroServicesPreview.astro` — three interactive hero service examples
- `src/components/AiAutomationShowcase.astro` — AI and automation showcase section
- `src/components/ServicesGrid.astro` — main services grid
- `src/components/ProcessSteps.astro` — three-step delivery process
- `src/components/FaqSection.tsx` — frequently asked questions
- `src/components/SiteFooter.astro` — shared footer
- `src/components/AppointmentDialog.astro` — appointment dialog shell
- `src/components/AppointmentScheduler.tsx` — appointment flow and confirmation state
- `src/components/ContactShowcase.astro` — rotating contact-page visuals
- `src/components/hero` — hero preview internals
- `src/components/process` — process-step illustrations
- `src/components/effects` — reusable visual effects
- `src/components/ui` — reusable interface primitives

## Commands

| Command | Purpose |
| --- | --- |
| `npm install` | Install dependencies |
| `npm run dev` | Start the local site at `localhost:4321` |
| `npm run build` | Create the production build in `dist` |
| `npm run check` | Run Astro and TypeScript diagnostics |
| `npm test` | Run booking and validation tests |
| `npm run verify` | Run checks, tests and a production build |
| `npm start` | Run the built Node server |
| `npm run preview` | Preview the production build locally |

Run `npm run build` after structural or component changes; it validates both Astro routes and client-side React bundles.

## Container image

The production image is a multi-stage Node 24 build. Most public pages are prerendered; the Dutch root route is rendered on demand so the server can respect a visitor's explicit or browser-preferred language. The standalone Astro Node server also handles the form, booking and private management endpoints on port `8080`.

Pushes to `main` publish `ghcr.io/optidigi/optidigi:latest` plus a commit-specific tag through GitHub Actions. The production Traefik stack routes `optidigi.nl` and `www.optidigi.nl` to this container.

Production mounts a persistent volume at `/data` for SQLite. `scripts/backup-bookings.mjs` creates consistent database backups in `/data/backups` and retains 30 days. The public forms queue Cloudflare Email Service messages in SQLite so temporary mail failures can be retried through `/api/internal/email-outbox`.

Copy `.env.example` to the private deployment environment and set the Cloudflare account/token, admin credentials and outbox cron secret. Never commit the production `.env`.
