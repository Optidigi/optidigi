# Optidigi website

The public Optidigi marketing website, built with Astro, React and Tailwind CSS.

## Routes

- `/` — homepage
- `/contact` — contact form and appointment entry point

The pre-green homepage is retained in `src/archive/home-before-green.astro`. Files in `src/archive` are not exposed as routes.

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
| `npm run preview` | Preview the production build locally |

Run `npm run build` after structural or component changes; it validates both Astro routes and client-side React bundles.

## Container image

The production image is a multi-stage build: Node builds the static Astro site and an unprivileged Nginx container serves the result on port `8080`.

Pushes to `main` publish `ghcr.io/optidigi/optidigi:latest` plus a commit-specific tag through GitHub Actions. The production Traefik stack routes `optidigi.nl` and `www.optidigi.nl` to this container.
