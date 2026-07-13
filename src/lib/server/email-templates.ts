export type EmailContent = { subject: string; text: string; html: string };

type AppointmentEmailInput = {
  id: string; label: string; type: string; name: string; company?: string; email: string;
  phone?: string; subject: string; note?: string; contactEmail: string;
};

type ContactEmailInput = {
  id: string; name: string; email: string; subject: string; message: string; contactEmail: string;
};

const colors = {
  ink: "#111318", paper: "#ffffff", canvas: "#f3f5f2", border: "#dfe4df",
  muted: "#66706b", accent: "#00a977",
};

export const escapeHtml = (value: string) => value.replace(/[&<>"']/g, (character) => ({
  "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;",
})[character]!);

const multiline = (value: string) => escapeHtml(value).replace(/\r?\n/g, "<br>");
const headerText = (value: string) => value.replace(/[\r\n]+/g, " ").trim();

const detailsCard = (items: Array<[string, string | undefined]>) => `
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="border-collapse:separate;background:${colors.canvas};border:1px solid ${colors.border};border-radius:14px;">
    <tr><td style="padding:10px 22px;">
      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="border-collapse:collapse;">
        ${items.map(([label, value]) => `<tr>
          <td style="padding:12px 16px 12px 0;border-bottom:1px solid ${colors.border};color:${colors.muted};font-size:13px;line-height:20px;vertical-align:top;width:112px;">${escapeHtml(label)}</td>
          <td style="padding:12px 0;border-bottom:1px solid ${colors.border};color:${colors.ink};font-size:14px;font-weight:600;line-height:20px;vertical-align:top;word-break:break-word;">${multiline(value || "—")}</td>
        </tr>`).join("")}
      </table>
    </td></tr>
  </table>`;

const messageCard = (label: string, message: string) => `
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin-top:18px;border-collapse:separate;background:${colors.paper};border:1px solid ${colors.border};border-radius:14px;">
    <tr><td style="padding:20px 22px;">
      <p style="margin:0 0 8px;color:${colors.muted};font-size:12px;font-weight:700;letter-spacing:.08em;line-height:18px;text-transform:uppercase;">${escapeHtml(label)}</p>
      <p style="margin:0;color:${colors.ink};font-size:15px;line-height:24px;word-break:break-word;">${multiline(message || "—")}</p>
    </td></tr>
  </table>`;

const button = (href: string, label: string) => `
  <table role="presentation" cellspacing="0" cellpadding="0" border="0" style="margin-top:24px;border-collapse:separate;">
    <tr><td style="background:${colors.ink};border-radius:999px;">
      <a href="${escapeHtml(href)}" style="display:inline-block;padding:13px 22px;color:#ffffff;font-size:14px;font-weight:700;line-height:20px;text-decoration:none;">${escapeHtml(label)}</a>
    </td></tr>
  </table>`;

function layout(input: {
  preheader: string; eyebrow: string; title: string; intro: string; body: string;
  action?: string; actionHref?: string; footerNote: string;
}) {
  return `<!doctype html>
<html lang="nl">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <meta name="color-scheme" content="light only">
  <title>${escapeHtml(input.title)}</title>
</head>
<body style="margin:0;padding:0;background:${colors.canvas};color:${colors.ink};font-family:Arial,Helvetica,sans-serif;-webkit-text-size-adjust:100%;">
  <div style="display:none;max-height:0;overflow:hidden;opacity:0;color:transparent;">${escapeHtml(input.preheader)}&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;</div>
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="width:100%;background:${colors.canvas};border-collapse:collapse;">
    <tr><td align="center" style="padding:28px 14px;">
      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="width:100%;max-width:600px;border-collapse:separate;background:${colors.paper};border:1px solid ${colors.border};border-radius:20px;overflow:hidden;">
        <tr><td style="padding:25px 30px;background:${colors.ink};border-bottom:4px solid ${colors.accent};">
          <a href="https://optidigi.nl" style="color:#ffffff;font-size:23px;font-weight:800;letter-spacing:-.05em;line-height:26px;text-decoration:none;">opti<span style="color:${colors.accent};">digi</span></a>
        </td></tr>
        <tr><td style="padding:38px 30px 18px;">
          <p style="margin:0 0 10px;color:${colors.accent};font-size:12px;font-weight:800;letter-spacing:.1em;line-height:18px;text-transform:uppercase;">${escapeHtml(input.eyebrow)}</p>
          <h1 style="margin:0;color:${colors.ink};font-size:30px;font-weight:800;letter-spacing:-.035em;line-height:36px;">${escapeHtml(input.title)}</h1>
          <p style="margin:16px 0 0;color:${colors.muted};font-size:16px;line-height:25px;">${escapeHtml(input.intro)}</p>
        </td></tr>
        <tr><td style="padding:12px 30px 40px;">
          ${input.body}
          ${input.action && input.actionHref ? button(input.actionHref, input.action) : ""}
          <p style="margin:24px 0 0;color:${colors.muted};font-size:13px;line-height:21px;">${escapeHtml(input.footerNote)}</p>
        </td></tr>
        <tr><td style="padding:22px 30px;background:${colors.canvas};border-top:1px solid ${colors.border};">
          <p style="margin:0;color:${colors.ink};font-size:13px;font-weight:700;line-height:20px;">Optidigi <span style="color:${colors.accent};">—</span> Software, AI &amp; automatisering</p>
          <p style="margin:4px 0 0;color:${colors.muted};font-size:12px;line-height:19px;">Automatisch verzonden via <a href="https://optidigi.nl" style="color:${colors.muted};text-decoration:underline;">optidigi.nl</a></p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

export function appointmentEmails(input: AppointmentEmailInput): { admin: EmailContent; customer: EmailContent } {
  const adminText = `Nieuwe afspraak\n\nMoment: ${input.label}\nType: ${input.type}\nNaam: ${input.name}\nBedrijf: ${input.company || "—"}\nE-mail: ${input.email}\nTelefoon: ${input.phone || "—"}\nOnderwerp: ${input.subject}\nOpmerking: ${input.note || "—"}\nReferentie: ${input.id}\n\nBeantwoord deze e-mail om ${input.name} direct te bereiken.`;
  const customerText = `Hoi ${input.name},\n\nJe afspraak met Optidigi is bevestigd.\n\nMoment: ${input.label}\nType: ${input.type}\nOnderwerp: ${input.subject}\nReferentie: ${input.id}\n\nWil je het moment wijzigen of annuleren? Antwoord dan op deze e-mail.\n\nOptidigi`;
  return {
    admin: {
      subject: `[Afspraak] ${input.label} — ${headerText(input.name)}`,
      text: adminText,
      html: layout({
        preheader: `${input.name} heeft een ${input.type.toLowerCase()} gepland voor ${input.label}.`,
        eyebrow: "Nieuwe afspraak", title: `${input.name} heeft een gesprek gepland`,
        intro: "De afspraak staat direct in de Optidigi-agenda. Hieronder vind je alle gegevens.",
        body: `${detailsCard([["Moment", input.label], ["Type", input.type], ["Naam", input.name], ["Bedrijf", input.company], ["E-mail", input.email], ["Telefoon", input.phone], ["Onderwerp", input.subject], ["Referentie", input.id]])}${messageCard("Opmerking", input.note || "Geen opmerking toegevoegd.")}`,
        action: `Beantwoord ${input.name}`, actionHref: `mailto:${input.email}`,
        footerNote: "Deze afspraak is automatisch bevestigd. Beheer beschikbaarheid en afspraken via de Optidigi-agenda.",
      }),
    },
    customer: {
      subject: `Je afspraak met Optidigi is bevestigd — ${input.label}`,
      text: customerText,
      html: layout({
        preheader: `Je afspraak met Optidigi staat gepland voor ${input.label}.`,
        eyebrow: "Afspraak bevestigd", title: "We spreken je binnenkort",
        intro: `Hoi ${input.name}, je afspraak staat gepland. We kijken uit naar ons gesprek.`,
        body: detailsCard([["Moment", input.label], ["Type", input.type], ["Onderwerp", input.subject], ["Referentie", input.id]]),
        action: "Afspraak wijzigen", actionHref: `mailto:${input.contactEmail}?subject=${encodeURIComponent(`Wijziging afspraak ${input.id}`)}`,
        footerNote: "Wil je het moment wijzigen of annuleren? Antwoord op deze e-mail; dan helpen we je meteen.",
      }),
    },
  };
}

export function contactEmails(input: ContactEmailInput): { admin: EmailContent; customer: EmailContent } {
  const adminText = `Nieuw contactbericht\n\nNaam: ${input.name}\nE-mail: ${input.email}\nOnderwerp: ${input.subject}\nReferentie: ${input.id}\n\nBericht:\n${input.message}\n\nBeantwoord deze e-mail om ${input.name} direct te bereiken.`;
  const customerText = `Hoi ${input.name},\n\nBedankt voor je bericht aan Optidigi. We reageren doorgaans binnen één werkdag.\n\nOnderwerp: ${input.subject}\nJouw bericht:\n${input.message}\n\nReferentie: ${input.id}\n\nOptidigi`;
  return {
    admin: {
      subject: `[Website] ${headerText(input.subject)} — ${headerText(input.name)}`,
      text: adminText,
      html: layout({
        preheader: `${input.name} stuurde een nieuw bericht via optidigi.nl.`, eyebrow: "Nieuw websitebericht",
        title: `${input.name} wil kennismaken`, intro: "Een nieuw contactverzoek is binnengekomen via de website.",
        body: `${detailsCard([["Naam", input.name], ["E-mail", input.email], ["Onderwerp", input.subject], ["Referentie", input.id]])}${messageCard("Bericht", input.message)}`,
        action: `Beantwoord ${input.name}`, actionHref: `mailto:${input.email}?subject=${encodeURIComponent(`Re: ${input.subject}`)}`,
        footerNote: "Door deze e-mail te beantwoorden, reageer je rechtstreeks naar de afzender.",
      }),
    },
    customer: {
      subject: "We hebben je bericht ontvangen", text: customerText,
      html: layout({
        preheader: "We hebben je bericht ontvangen en reageren doorgaans binnen één werkdag.",
        eyebrow: "Bericht ontvangen", title: "Bedankt voor je bericht",
        intro: `Hoi ${input.name}, je bericht is goed bij ons aangekomen. We reageren doorgaans binnen één werkdag.`,
        body: `${detailsCard([["Onderwerp", input.subject], ["Referentie", input.id]])}${messageCard("Jouw bericht", input.message)}`,
        action: "Nog iets toevoegen?", actionHref: `mailto:${input.contactEmail}?subject=${encodeURIComponent(`Aanvulling ${input.id}`)}`,
        footerNote: "Je hoeft niets te doen. Wil je nog iets toevoegen? Antwoord dan gewoon op deze e-mail.",
      }),
    },
  };
}
