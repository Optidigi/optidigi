import assert from "node:assert/strict";
import test from "node:test";

const { appointmentEmails, contactEmails } = await import("../src/lib/server/email-templates.ts");

const appointment = appointmentEmails({
  id: "afspraak-123", label: "maandag 20 juli 2026 om 09:00", type: "Videogesprek",
  name: "Ada <script>alert(1)</script>\r\nBcc: bad@example.com", company: "Voorbeeld & Co", email: "ada@example.com",
  phone: "+31 6 12345678", subject: "AI & automatisering", note: "Eerste regel\nTweede regel",
  contactEmail: "hey@optidigi.nl",
});

const contact = contactEmails({
  id: "contact-123", name: "Grace Hopper", email: "grace@example.com", subject: "Nieuwe website",
  message: "Kunnen jullie <strong>helpen</strong>?\nGraag snel.", contactEmail: "hey@optidigi.nl",
});

test("all transactional emails use the branded, compatible shell and a plain-text alternative", () => {
  for (const email of [appointment.admin, appointment.customer, contact.admin, contact.customer]) {
    assert.match(email.html, /^<!doctype html>/);
    assert.match(email.html, /role="presentation"/);
    assert.match(email.html, /optidigi\.nl/);
    assert.match(email.html, /Software, AI &amp; automatisering/);
    assert.ok(email.text.length > 100);
    assert.ok(email.subject.length > 5);
  }
});

test("customer content and admin reply actions are clear", () => {
  assert.match(appointment.customer.html, /Afspraak bevestigd/);
  assert.match(appointment.customer.html, /Afspraak wijzigen/);
  assert.match(appointment.admin.html, /mailto:ada@example\.com/);
  assert.doesNotMatch(appointment.admin.subject, /[\r\n]/);
  assert.match(contact.customer.html, /binnen één werkdag/);
  assert.match(contact.admin.html, /Beantwoord Grace Hopper/);
});

test("user-provided content is escaped while line breaks remain readable", () => {
  assert.doesNotMatch(appointment.admin.html, /<script>/);
  assert.match(appointment.admin.html, /&lt;script&gt;alert\(1\)&lt;\/script&gt;/);
  assert.match(appointment.admin.html, /Eerste regel<br>Tweede regel/);
  assert.doesNotMatch(contact.customer.html, /<strong>helpen<\/strong>/);
  assert.match(contact.customer.html, /&lt;strong&gt;helpen&lt;\/strong&gt;\?<br>Graag snel\./);
});
