import assert from "node:assert/strict";
import test from "node:test";
import { appointmentInput, contactInput } from "../src/lib/server/validation.ts";

test("contact input rejects a honeypot and invalid subject", () => {
  assert.throws(() => contactInput({ name: "Test", email: "test@example.com", subject: "Spam", message: "Een geldig lang bericht." }));
  assert.throws(() => contactInput({ name: "Test", email: "test@example.com", subject: "Overig", message: "Een geldig lang bericht.", website: "bot" }));
});

test("telephone appointments require a phone number", () => {
  assert.throws(() => appointmentInput({
    startAt: "2026-07-13T09:00:00.000Z",
    type: "phone",
    name: "Test Klant",
    email: "test@example.com",
    subject: "Kennismaking",
  }));
});
