# Optidigi Build Notes

## Visual Source

- Local theme: `/home/shimmy/Desktop/env/themes/positivus`
- Reference URL: `https://astro.build/themes/details/positivus/`

## Changed Components And Blocks

- `src/components/ui/Navbar.astro`: navigation labels and CTA changed to the four approved Dutch routes and a mailto introduction call CTA.
- `src/components/ui/Footer.astro`: footer links and email updated; demo social links, address, service area, unknown phone, and theme credits removed.
- `src/components/sections/Hero.astro`: Positivus hero retained; copy and CTA changed to shorter Optidigi positioning and made locale-aware.
- `src/components/sections/Services.astro`: Positivus service-card grid retained; demo marketing services replaced with Optidigi service categories and made locale-aware.
- `src/components/ui/ServiceCard.astro`: label changed from "Service Info" and made locale-aware.
- `src/components/sections/Proposal.astro`: Positivus proposal block retained; CTA changed to a modest mail contact flow and made locale-aware.
- `src/components/sections/Cases.astro`: Positivus dark card block retained but repurposed from invented case studies to verifiable operating principles and made locale-aware.
- `src/components/sections/Sponsors.astro`: restored the original Positivus logo row under the hero; demo sponsor logos replaced with public Site in a Box client logos from `siteinabox.nl`.
- `src/components/sections/Process.astro` and `src/components/ui/Accordion.astro`: Positivus process accordion retained; steps changed to the provided Optidigi workflow and made locale-aware.
- `src/components/sections/Team.astro` and `src/components/ui/TeamCard.astro`: restored the original Positivus team-card section for Shamil Agovic and Armin Kozar. LinkedIn links and portraits were made optional because no public profiles or founder portraits were supplied.
- `src/components/sections/Testimonials.astro`, `src/components/ui/SwiperSlider.astro`, and `src/data/clientData.json`: restored the original Positivus testimonial slider and Swiper dependency; demo testimonials replaced with public Site in a Box testimonials from `siteinabox.nl`. The author color uses an existing high-contrast Positivus text utility for accessibility with the Optidigi blue palette.
- `src/data/clientData.json`, `src/i18n.js`, and `src/components/sections/Testimonials.astro`: removed visible Site in a Box wording from testimonial roles and section descriptions while keeping the source-backed quotes.
- `src/components/sections/Contact.astro`, `src/components/ui/Form.astro`, `src/components/ui/ShortForm.astro`: form visuals retained; copy changed to mail contact, no phone number added, and labels/buttons made locale-aware.
- `src/layouts/MainLayout.astro`, `src/layouts/MainHead.astro`, `src/components/seo/Seo.astro`, `src/utils/jsonLD.js`: language, static metadata, manifest/icon links, canonical/OG data, hreflang alternates, and Organization JSON-LD updated for `optidigi.nl`.
- `src/i18n.js`: added shared Dutch and English navigation, page metadata, section copy, form labels, CTA labels, and alternate URL data.

## Changed Pages

- `src/pages/index.astro`: home page composition uses Positivus hero, services, proposal, card/principles, process, and contact sections.
- `src/pages/index.astro`: added the restored Positivus logo row, team section, and testimonial slider to the home composition.
- `src/pages/over-ons.astro`: added requested Dutch route using Positivus Section, SectionTitle, Card, and Process components.
- `src/pages/prijzen.astro`: added requested Dutch route using Positivus Section, SectionTitle, Card, and Proposal components; no invented exact prices.
- `src/pages/contact.astro`: added requested Dutch route using Positivus Section, SectionTitle, Card, and Contact components; telephone, address, and service area omitted.
- `src/pages/en/index.astro`: added English home route using the same Positivus page composition as the Dutch home.
- `src/pages/en/index.astro`: added the same logo row, team section, and testimonial slider to the English home composition.
- `src/pages/en/about.astro`: added English about route using Positivus Section, SectionTitle, Card, and Process components.
- `src/pages/en/pricing.astro`: added English pricing route using Positivus Section, SectionTitle, Card, and Proposal components; no invented exact prices.
- `src/pages/en/contact.astro`: added English contact route using Positivus Section, SectionTitle, Card, and Contact components; telephone, address, and service area omitted.
- `src/pages/404.astro`: translated the inherited 404 page and added usable metadata while preserving the original layout structure.
- Removed demo routes: `src/pages/about.astro`, `src/pages/pricing.astro`, `src/pages/services.astro`, `src/pages/services/seo.astro`, `src/pages/articles/**`.
- Removed demo content: `src/content/**`.
- Removed unused demo-only article files: article/search components, sample pricing data, company/team/social assets, and public blog images.
- Added source-backed social proof assets from `siteinabox.nl`: `src/assets/clients/amblast.png`, `src/assets/clients/quitantie.png`, `src/assets/clients/kbkc.png`, and `src/assets/clients/rasko.png`.

## Static SEO Files

- Added `public/robots.txt`, `public/sitemap.xml`, `public/llms.txt`, `public/humans.txt`, `public/.well-known/security.txt`, `public/manifest.json`, and `public/_headers`.
- Updated `public/sitemap.xml` with Dutch and English URLs plus `hreflang` alternates.
- Updated `public/llms.txt` to mention the Dutch default routes and English `/en/` routes.
- Replaced `public/Logo.svg`, `src/assets/logo-alt.svg`, and `public/favicon.svg` with Optidigi-branded SVGs in the same Positivus asset slots.
- Updated `public/Logo.svg`, `src/assets/logo-alt.svg`, `src/assets/brand.svg`, `public/favicon.svg`, and `public/apple-touch-icon.png` to use a blue star-only Optidigi mark with no favicon background square.

## Constraints

- No unverifiable testimonials, sponsors, client names, metrics, prices, awards, certifications, phone number, CMS, backend, database, or dynamic infrastructure were added.
- Site in a Box client logos and testimonials were added only because they are publicly visible on `siteinabox.nl` and were requested as source-backed content.
- No new component library or design system was introduced.
