export type EmailContent = { subject: string; text: string; html: string };

type AppointmentEmailInput = {
  id: string; label: string; type: string; name: string; company?: string; email: string;
  phone?: string; subject: string; note?: string; contactEmail: string;
};

type ContactEmailInput = {
  id: string; name: string; email: string; subject: string; message: string; contactEmail: string;
};

const colors = {
  ink: "#18181b", paper: "#ffffff", canvas: "#fafafa", surface: "#f7f7f7",
  border: "#e4e4e7", muted: "#71717a", accent: "#05aa74", accentDark: "#038458",
};

export const escapeHtml = (value: string) => value.replace(/[&<>"']/g, (character) => ({
  "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;",
})[character]!);

const multiline = (value: string) => escapeHtml(value).replace(/\r?\n/g, "<br>");
const headerText = (value: string) => value.replace(/[\r\n]+/g, " ").trim();

const detailsCard = (items: Array<[string, string | undefined]>) => `
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="border-collapse:separate;background:${colors.paper};border:1px solid ${colors.border};border-radius:12px;box-shadow:0 1px 2px rgba(0,0,0,.04);">
    <tr><td style="padding:8px 20px;">
      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="border-collapse:collapse;">
        ${items.map(([label, value]) => `<tr>
          <td class="detail-label" style="padding:13px 16px 13px 0;border-bottom:1px dashed ${colors.border};color:${colors.muted};font-size:12px;line-height:19px;vertical-align:top;width:108px;">${escapeHtml(label)}</td>
          <td class="detail-value" style="padding:13px 0;border-bottom:1px dashed ${colors.border};color:${colors.ink};font-size:13px;font-weight:600;line-height:19px;vertical-align:top;word-break:break-word;">${multiline(value || "—")}</td>
        </tr>`).join("")}
      </table>
    </td></tr>
  </table>`;

const messageCard = (label: string, message: string) => `
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin-top:14px;border-collapse:separate;background:${colors.surface};border:1px dashed ${colors.border};border-radius:12px;">
    <tr><td style="padding:18px 20px;">
      <p style="margin:0 0 7px;color:${colors.muted};font-size:11px;font-weight:700;letter-spacing:.08em;line-height:17px;text-transform:uppercase;">${escapeHtml(label)}</p>
      <p style="margin:0;color:${colors.ink};font-size:14px;line-height:23px;word-break:break-word;">${multiline(message || "—")}</p>
    </td></tr>
  </table>`;

const button = (href: string, label: string) => `
  <table role="presentation" cellspacing="0" cellpadding="0" border="0" style="margin-top:22px;border-collapse:separate;">
    <tr><td style="background:${colors.accent};border:1px solid ${colors.accentDark};border-radius:8px;box-shadow:0 1px 2px rgba(0,0,0,.16),0 8px 22px rgba(5,170,116,.16);">
      <a href="${escapeHtml(href)}" style="display:inline-block;padding:11px 18px;color:#ffffff;font-size:13px;font-weight:700;line-height:20px;text-decoration:none;">${escapeHtml(label)} &nbsp;›</a>
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
  <style>
    @media screen and (max-width:480px) {
      .email-pad { padding-left:20px !important; padding-right:20px !important; }
      .email-title { font-size:26px !important; line-height:31px !important; }
      .detail-label { display:block !important; width:auto !important; padding:12px 0 2px !important; border-bottom:0 !important; }
      .detail-value { display:block !important; width:auto !important; padding:0 0 12px !important; }
    }
  </style>
</head>
<body style="margin:0;padding:0;background:${colors.canvas};color:${colors.ink};font-family:Arial,'Helvetica Neue',Helvetica,sans-serif;-webkit-text-size-adjust:100%;">
  <div style="display:none;max-height:0;overflow:hidden;opacity:0;color:transparent;">${escapeHtml(input.preheader)}&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;</div>
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="width:100%;background:${colors.canvas};border-collapse:collapse;">
    <tr><td align="center" style="padding:32px 12px;">
      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="width:100%;max-width:600px;border-collapse:separate;background:${colors.paper};border:1px solid ${colors.border};border-radius:14px;overflow:hidden;box-shadow:0 12px 40px rgba(24,24,27,.06);">
        <tr><td class="email-pad" style="padding:25px 30px;background:${colors.paper};border-bottom:1px dashed ${colors.border};">
          <a href="https://optidigi.nl" style="display:inline-block;text-decoration:none;">
            <img src="https://optidigi.nl/optidigi-logo-email.png" width="116" height="29" alt="Optidigi" style="display:block;width:116px;height:29px;border:0;outline:none;text-decoration:none;">
          </a>
        </td></tr>
        <tr><td class="email-pad" style="padding:36px 30px 18px;">
          <table role="presentation" cellspacing="0" cellpadding="0" border="0" style="margin:0 0 18px;border-collapse:separate;">
            <tr><td style="padding:6px 10px;background:#ecfdf5;border:1px solid #bbf7d0;border-radius:999px;color:#166534;font-size:11px;font-weight:700;line-height:16px;">● &nbsp;${escapeHtml(input.eyebrow)}</td></tr>
          </table>
          <h1 class="email-title" style="margin:0;max-width:500px;color:${colors.ink};font-size:29px;font-weight:700;letter-spacing:-.035em;line-height:35px;">${escapeHtml(input.title)}</h1>
          <p style="margin:14px 0 0;max-width:500px;color:${colors.muted};font-size:15px;line-height:24px;">${escapeHtml(input.intro)}</p>
        </td></tr>
        <tr><td class="email-pad" style="padding:12px 30px 38px;">
          ${input.body}
          ${input.action && input.actionHref ? button(input.actionHref, input.action) : ""}
          <p style="margin:22px 0 0;max-width:500px;color:${colors.muted};font-size:12px;line-height:20px;">${escapeHtml(input.footerNote)}</p>
        </td></tr>
        <tr><td class="email-pad" style="padding:21px 30px;background:${colors.surface};border-top:1px dashed ${colors.border};">
          <p style="margin:0;color:${colors.ink};font-size:12px;font-weight:700;line-height:19px;">Optidigi · Nederland</p>
          <p style="margin:3px 0 0;color:${colors.muted};font-size:11px;line-height:18px;">Software, AI &amp; automatisering die aansluiten op hoe je bedrijf werkt.</p>
          <p style="margin:9px 0 0;color:${colors.muted};font-size:11px;line-height:18px;">Automatisch verzonden via <a href="https://optidigi.nl" style="color:${colors.ink};text-decoration:underline;">optidigi.nl</a></p>
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
