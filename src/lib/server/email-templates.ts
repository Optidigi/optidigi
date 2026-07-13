export type EmailContent = { subject: string; text: string; html: string };

type AppointmentEmailInput = {
  id: string; label: string; type: string; name: string; company?: string; email: string;
  phone?: string; subject: string; note?: string;
};

type ContactEmailInput = {
  id: string; name: string; email: string; subject: string; message: string;
};

const colors = {
  ink: "#18181b", paper: "#ffffff", canvas: "#fafafa", surface: "#f7f7f7",
  border: "#e4e4e7", muted: "#71717a",
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

const appointmentConfirmationCard = (label: string, type: string, email: string) => `
  <table role="presentation" cellspacing="0" cellpadding="0" border="0" align="center" style="margin:22px auto 0;border-collapse:separate;background:${colors.surface};border:1px solid ${colors.border};border-radius:8px;">
    <tr><td style="padding:13px 16px;text-align:left;">
      <p style="margin:0;color:${colors.ink};font-size:14px;font-weight:600;line-height:21px;">${escapeHtml(label)}</p>
      <p style="margin:4px 0 0;color:${colors.muted};font-size:12px;line-height:18px;">${escapeHtml(type)} &middot; ${escapeHtml(email)}</p>
    </td></tr>
  </table>`;

function layout(input: {
  preheader: string; eyebrow?: string; title: string; intro: string; body: string;
  footerNote: string; centered?: boolean; successMark?: boolean;
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
<body style="margin:0;padding:0;background:${colors.canvas};color:${colors.ink};font-family:ui-sans-serif,system-ui,-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;-webkit-text-size-adjust:100%;">
  <div style="display:none;max-height:0;overflow:hidden;opacity:0;color:transparent;">${escapeHtml(input.preheader)}&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;</div>
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="width:100%;background:${colors.canvas};border-collapse:collapse;">
    <tr><td align="center" style="padding:32px 12px;">
      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="width:100%;max-width:600px;border-collapse:separate;background:${colors.paper};border:1px solid ${colors.border};border-radius:14px;overflow:hidden;box-shadow:0 12px 40px rgba(24,24,27,.06);">
        <tr><td class="email-pad" style="padding:25px 30px;background:${colors.paper};border-bottom:1px solid ${colors.border};">
          <a href="https://optidigi.nl" style="display:inline-block;text-decoration:none;">
            <img src="https://optidigi.nl/optidigi-logo-email.png" width="116" height="29" alt="Optidigi" style="display:block;width:116px;height:29px;border:0;outline:none;text-decoration:none;">
          </a>
        </td></tr>
        <tr><td class="email-pad" style="padding:36px 30px 18px;text-align:${input.centered ? "center" : "left"};">
          ${input.successMark ? `<table role="presentation" cellspacing="0" cellpadding="0" border="0" align="center" style="margin:0 auto 20px;border-collapse:separate;"><tr><td width="48" height="48" align="center" valign="middle" style="width:48px;height:48px;background:#dcfce7;border:1px solid #bbf7d0;border-radius:999px;color:#166534;font-size:23px;font-weight:700;line-height:48px;">&#10003;</td></tr></table>` : ""}
          ${input.eyebrow ? `<p style="margin:0 0 10px;color:${colors.muted};font-size:11px;font-weight:700;letter-spacing:.12em;line-height:17px;text-transform:uppercase;">${escapeHtml(input.eyebrow)}</p>` : ""}
          <h1 class="email-title" style="margin:${input.centered ? "0 auto" : "0"};max-width:500px;color:${colors.ink};font-size:29px;font-weight:700;letter-spacing:-.035em;line-height:35px;">${escapeHtml(input.title)}</h1>
          <p style="margin:${input.centered ? "14px auto 0" : "14px 0 0"};max-width:500px;color:${colors.muted};font-size:15px;line-height:24px;">${escapeHtml(input.intro)}</p>
        </td></tr>
        <tr><td class="email-pad" style="padding:12px 30px 38px;text-align:${input.centered ? "center" : "left"};">
          ${input.body}
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
        eyebrow: "Nieuwe afspraak", title: `Nieuwe afspraak met ${input.name}`,
        intro: "De afspraak staat in de Optidigi-agenda. Hieronder vind je alle gegevens.",
        body: `${detailsCard([["Moment", input.label], ["Type", input.type], ["Naam", input.name], ["Bedrijf", input.company], ["E-mail", input.email], ["Telefoon", input.phone], ["Onderwerp", input.subject], ["Referentie", input.id]])}${messageCard("Opmerking", input.note || "Geen opmerking toegevoegd.")}`,
        footerNote: "Deze afspraak is automatisch bevestigd. Beheer beschikbaarheid en afspraken via de Optidigi-agenda.",
      }),
    },
    customer: {
      subject: `Je afspraak met Optidigi is bevestigd — ${input.label}`,
      text: customerText,
      html: layout({
        preheader: `Je afspraak met Optidigi staat gepland voor ${input.label}.`,
        title: "Afspraak bevestigd",
        intro: `Bedankt, ${input.name}. Het moment staat vast.`,
        body: appointmentConfirmationCard(input.label, input.type, input.email),
        footerNote: `Onderwerp: ${input.subject} · Referentie: ${input.id}. Wil je het moment wijzigen of annuleren? Antwoord dan op deze e-mail.`,
        centered: true,
        successMark: true,
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
        preheader: `${input.name} stuurde een nieuw bericht via optidigi.nl.`, eyebrow: "Nieuw contactverzoek",
        title: `Nieuw bericht van ${input.name}`, intro: "Dit bericht is verstuurd via het contactformulier op optidigi.nl.",
        body: `${detailsCard([["Naam", input.name], ["E-mail", input.email], ["Onderwerp", input.subject], ["Referentie", input.id]])}${messageCard("Bericht", input.message)}`,
        footerNote: "Door deze e-mail te beantwoorden, reageer je rechtstreeks naar de afzender.",
      }),
    },
    customer: {
      subject: "We hebben je bericht ontvangen", text: customerText,
      html: layout({
        preheader: "We hebben je bericht ontvangen en reageren doorgaans binnen één werkdag.",
        title: "Bedankt. Je bericht is verstuurd.",
        intro: `Hoi ${input.name}, je bericht is goed bij ons aangekomen. We reageren doorgaans binnen één werkdag.`,
        body: `${detailsCard([["Onderwerp", input.subject], ["Referentie", input.id]])}${messageCard("Jouw bericht", input.message)}`,
        footerNote: "Je hoeft niets te doen. Wil je nog iets toevoegen? Antwoord dan gewoon op deze e-mail.",
      }),
    },
  };
}
