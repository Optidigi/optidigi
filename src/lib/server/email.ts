import { randomUUID } from "node:crypto";
import { database } from "./database";
import { mailConfig } from "./config";
import { InputError } from "./validation";

type Message = {
  relatedType: "appointment" | "contact";
  relatedId: string;
  to: string;
  replyTo?: string;
  subject: string;
  text: string;
  html: string;
};

export function requireMailConfiguration() {
  const config = mailConfig();
  if (!config.accountId || !config.apiToken) {
    throw new InputError("Deze functie is tijdelijk niet beschikbaar. Mail ons via hey@optidigi.nl.", 503, "service_unavailable");
  }
}

export function enqueueEmail(message: Message) {
  const id = randomUUID();
  const now = new Date().toISOString();
  database().prepare(`
    INSERT INTO email_outbox
      (id, related_type, related_id, recipient, reply_to, subject, text_body, html_body, next_attempt_at, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(id, message.relatedType, message.relatedId, message.to, message.replyTo || null, message.subject, message.text, message.html, now, now, now);
  return id;
}

type OutboxRow = {
  id: string;
  recipient: string;
  reply_to: string | null;
  subject: string;
  text_body: string;
  html_body: string;
  attempts: number;
};

async function deliver(row: OutboxRow) {
  const config = mailConfig();
  if (!config.accountId || !config.apiToken) throw new Error("Cloudflare email credentials are not configured");
  const response = await fetch(`https://api.cloudflare.com/client/v4/accounts/${encodeURIComponent(config.accountId)}/email/sending/send`, {
    method: "POST",
    headers: { Authorization: `Bearer ${config.apiToken}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      to: row.recipient,
      from: { address: config.fromAddress, name: config.fromName },
      ...(row.reply_to ? { reply_to: row.reply_to } : {}),
      subject: row.subject,
      text: row.text_body,
      html: row.html_body,
    }),
    signal: AbortSignal.timeout(10_000),
  });
  const result = (await response.json().catch(() => null)) as { success?: boolean; errors?: { message?: string }[] } | null;
  if (!response.ok || !result?.success) throw new Error(result?.errors?.[0]?.message || `Cloudflare Email returned ${response.status}`);
}

export async function flushEmailOutbox(limit = 10) {
  const db = database();
  const now = new Date().toISOString();
  // A process interrupted after claiming a row may leave it in `sending`; reclaim it after 15 minutes.
  db.prepare(`UPDATE email_outbox SET status = 'pending' WHERE status = 'sending' AND updated_at < ?`)
    .run(new Date(Date.now() - 15 * 60_000).toISOString());
  const rows = db.prepare(`
    SELECT id, recipient, reply_to, subject, text_body, html_body, attempts
    FROM email_outbox
    WHERE status IN ('pending', 'failed') AND next_attempt_at <= ? AND attempts < 8
    ORDER BY created_at ASC LIMIT ?
  `).all(now, limit) as OutboxRow[];

  let sent = 0;
  for (const row of rows) {
    const claimed = db.prepare(`UPDATE email_outbox SET status = 'sending', updated_at = ? WHERE id = ? AND status IN ('pending', 'failed')`).run(now, row.id);
    if (!claimed.changes) continue;
    try {
      await deliver(row);
      const completed = new Date().toISOString();
      db.prepare(`UPDATE email_outbox SET status = 'sent', attempts = attempts + 1, sent_at = ?, updated_at = ?, last_error = NULL WHERE id = ?`)
        .run(completed, completed, row.id);
      sent += 1;
    } catch (error) {
      const attempts = row.attempts + 1;
      const delay = Math.min(24 * 60 * 60_000, 60_000 * 2 ** Math.min(attempts - 1, 10));
      const message = error instanceof Error ? error.message.slice(0, 500) : "Unknown delivery error";
      db.prepare(`UPDATE email_outbox SET status = 'failed', attempts = ?, next_attempt_at = ?, last_error = ?, updated_at = ? WHERE id = ?`)
        .run(attempts, new Date(Date.now() + delay).toISOString(), message, new Date().toISOString(), row.id);
      console.error(`Email outbox delivery failed (${row.id}): ${message}`);
    }
  }
  return { processed: rows.length, sent };
}
