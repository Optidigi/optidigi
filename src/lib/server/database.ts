import { mkdirSync } from "node:fs";
import { dirname } from "node:path";
import { DatabaseSync } from "node:sqlite";
import { bookingConfig } from "./config";

let instance: DatabaseSync | undefined;

export function database() {
  if (instance) return instance;
  const path = bookingConfig().databasePath;
  if (path !== ":memory:") mkdirSync(dirname(path), { recursive: true });
  instance = new DatabaseSync(path);
  instance.exec(`
    PRAGMA journal_mode = WAL;
    PRAGMA foreign_keys = ON;
    PRAGMA busy_timeout = 5000;

    CREATE TABLE IF NOT EXISTS appointments (
      id TEXT PRIMARY KEY,
      start_at TEXT NOT NULL,
      end_at TEXT NOT NULL,
      timezone TEXT NOT NULL,
      type TEXT NOT NULL CHECK (type IN ('video', 'phone')),
      name TEXT NOT NULL,
      company TEXT,
      email TEXT NOT NULL,
      phone TEXT,
      subject TEXT NOT NULL,
      note TEXT,
      status TEXT NOT NULL DEFAULT 'confirmed' CHECK (status IN ('confirmed', 'cancelled')),
      idempotency_key TEXT UNIQUE,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );
    CREATE UNIQUE INDEX IF NOT EXISTS appointments_active_slot
      ON appointments(start_at) WHERE status = 'confirmed';

    CREATE TABLE IF NOT EXISTS blocked_periods (
      id TEXT PRIMARY KEY,
      start_at TEXT NOT NULL,
      end_at TEXT NOT NULL,
      reason TEXT,
      created_at TEXT NOT NULL
    );
    CREATE INDEX IF NOT EXISTS blocked_periods_range ON blocked_periods(start_at, end_at);

    CREATE TABLE IF NOT EXISTS contacts (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT NOT NULL,
      subject TEXT NOT NULL,
      message TEXT NOT NULL,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS email_outbox (
      id TEXT PRIMARY KEY,
      related_type TEXT NOT NULL CHECK (related_type IN ('appointment', 'contact')),
      related_id TEXT NOT NULL,
      recipient TEXT NOT NULL,
      reply_to TEXT,
      subject TEXT NOT NULL,
      text_body TEXT NOT NULL,
      html_body TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'sending', 'sent', 'failed')),
      attempts INTEGER NOT NULL DEFAULT 0,
      next_attempt_at TEXT NOT NULL,
      sent_at TEXT,
      last_error TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );
    CREATE INDEX IF NOT EXISTS email_outbox_pending ON email_outbox(status, next_attempt_at);
  `);

  const personalDataCutoff = new Date();
  personalDataCutoff.setUTCMonth(personalDataCutoff.getUTCMonth() - 24);
  const sentEmailCutoff = new Date(Date.now() - 30 * 24 * 60 * 60_000).toISOString();
  instance.prepare(`DELETE FROM email_outbox WHERE status = 'sent' AND sent_at < ?`).run(sentEmailCutoff);
  instance.prepare(`DELETE FROM email_outbox WHERE created_at < ?`).run(personalDataCutoff.toISOString());
  instance.prepare(`DELETE FROM contacts WHERE created_at < ?`).run(personalDataCutoff.toISOString());
  instance.prepare(`DELETE FROM appointments WHERE end_at < ?`).run(personalDataCutoff.toISOString());
  return instance;
}

export function resetDatabaseForTests() {
  instance?.close();
  instance = undefined;
}
