import assert from "node:assert/strict";
import test from "node:test";

import {
  localeFromAcceptLanguage,
  localeFromCookie,
  preferredLocale,
} from "../src/i18n/server.ts";

test("browser language detection respects quality and supported locales", () => {
  assert.equal(localeFromAcceptLanguage("de-DE,de;q=0.9,en-GB;q=0.8,nl;q=0.7"), "en");
  assert.equal(localeFromAcceptLanguage("en;q=0.5,nl-NL;q=0.9"), "nl");
  assert.equal(localeFromAcceptLanguage("fr-FR,fr;q=0.9"), undefined);
});

test("an explicit language cookie takes precedence over browser language", () => {
  assert.equal(localeFromCookie("session=abc; optidigi-locale=nl"), "nl");
  const request = new Request("https://optidigi.nl/", {
    headers: {
      "accept-language": "en-US,en;q=0.9",
      cookie: "optidigi-locale=nl",
    },
  });
  assert.equal(preferredLocale(request), "nl");
});
