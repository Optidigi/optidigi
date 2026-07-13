import { mkdirSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { appointmentEmails, contactEmails } from "../src/lib/server/email-templates";

const output = resolve(".tmp/email-previews");
mkdirSync(output, { recursive: true });

const appointment = appointmentEmails({
  id: "OD-2026-0720", label: "maandag 20 juli 2026 om 09:00", type: "Videogesprek",
  name: "Sophie de Vries", company: "Northstar Studio", email: "sophie@example.com",
  phone: "+31 6 12345678", subject: "AI-kansen voor onze workflow",
  note: "We willen vooral kijken naar het automatiseren van onze intake en projectplanning.",
});
const contact = contactEmails({
  id: "OD-2026-0714", name: "Daan Jansen", email: "daan@example.com",
  subject: "Nieuwe maatwerkapplicatie",
  message: "We zoeken een partner voor een klantportaal dat aansluit op onze bestaande systemen. Kunnen we de aanpak en een eerste inschatting bespreken?",
});

const previews = {
  "appointment-customer.html": appointment.customer.html,
  "appointment-admin.html": appointment.admin.html,
  "contact-customer.html": contact.customer.html,
  "contact-admin.html": contact.admin.html,
};

for (const [name, html] of Object.entries(previews)) {
  const localHtml = html.replace("https://optidigi.nl/optidigi-logo-email.png", "/public/optidigi-logo-email.png");
  writeFileSync(resolve(output, name), localHtml, "utf8");
}
console.log(`Email previews written to ${output}`);
