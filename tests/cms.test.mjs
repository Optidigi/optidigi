import assert from "node:assert/strict";
import test from "node:test";

import { fetchHomepageContent, previewGrantUsable } from "../src/lib/server/cms.ts";

const origin = "https://cms.example.test";
const grant = (exp) => Buffer.from(JSON.stringify({ tenant: 1, user: 2, locale: "nl", exp })).toString("base64url") + ".signature";

// A fake CMS: answers Payload's REST list format and records each request.
function cms(answers, status = 200) {
  const requests = [];
  const fetcher = async (url, init) => {
    requests.push({ url: new URL(url), headers: new Headers(init.headers) });
    const collection = new URL(url).pathname.split("/").pop();
    return Response.json(status === 200 ? { docs: answers[collection] ? [answers[collection]] : [] } : { errors: [] }, { status });
  };
  return { fetcher, requests };
}

const published = {
  "site-settings": { name: "Optidigi", seo: { title: "Titel", description: "Omschrijving" } },
  pages: { heading: "Kop", description: "Tekst" },
};

test("published homepage copy comes from Payload's REST API in one language", async () => {
  const { fetcher, requests } = cms(published);
  const content = await fetchHomepageContent(origin, undefined, "en", fetcher);
  assert.deepEqual(content, {
    siteSettings: { name: "Optidigi", title: "Titel", description: "Omschrijving" },
    homepage: { heading: "Kop", description: "Tekst" },
  });
  const [settings, page] = requests.map(({ url }) => url);
  assert.equal(settings.pathname, "/api/site-settings");
  assert.equal(settings.searchParams.get("where[tenant.slug][equals]"), "optidigi");
  assert.equal(page.pathname, "/api/pages");
  assert.equal(page.searchParams.get("where[slug][equals]"), "home");
  for (const url of [settings, page]) {
    assert.equal(url.searchParams.get("locale"), "en");
    assert.equal(url.searchParams.get("fallback-locale"), "none");
    assert.equal(url.searchParams.get("draft"), null);
  }
  assert.equal(requests[0].headers.get("authorization"), null);
});

test("a preview reads drafts with the grant", async () => {
  const { fetcher, requests } = cms(published);
  const token = grant(Date.now() + 60_000);
  assert.ok(await fetchHomepageContent(origin, token, "nl", fetcher));
  for (const { url, headers } of requests) {
    assert.equal(url.searchParams.get("draft"), "true");
    assert.equal(headers.get("authorization"), `Bearer ${token}`);
  }
});

test("an expired or malformed preview link is refused without asking the CMS", async () => {
  const { fetcher, requests } = cms(published);
  assert.equal(await fetchHomepageContent(origin, grant(Date.now() - 1), "nl", fetcher), undefined);
  assert.equal(await fetchHomepageContent(origin, "not-a-grant", "nl", fetcher), undefined);
  assert.equal(requests.length, 0);
  assert.equal(previewGrantUsable(grant(Date.now() + 60_000)), true);
  assert.equal(previewGrantUsable("a.b.c"), false);
});

test("the site falls back to its own copy when the CMS fails or lacks fields", async () => {
  assert.equal(await fetchHomepageContent(origin, undefined, "nl", cms(published, 500).fetcher), undefined);
  const down = async () => { throw new TypeError("fetch failed"); };
  assert.equal(await fetchHomepageContent(origin, undefined, "nl", down), undefined);
  const content = await fetchHomepageContent(origin, undefined, "nl", cms({ pages: { heading: "x".repeat(201) } }).fetcher);
  assert.deepEqual(content, {
    siteSettings: { name: undefined, title: undefined, description: undefined },
    homepage: { heading: undefined, description: undefined },
  });
});
