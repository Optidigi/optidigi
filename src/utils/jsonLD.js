import siteData from "../data/siteData.json";

export default function jsonLDGenerator() {
  const graph = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": `${siteData.url}/#organization`,
        "name": siteData.title,
        "legalName": siteData.legalName,
        "url": siteData.url,
        "email": siteData.email,
        "foundingDate": siteData.foundingDate,
        "taxID": siteData.kvk
      },
      {
        "@type": "WebSite",
        "@id": `${siteData.url}/#website`,
        "name": siteData.title,
        "url": siteData.url
      }
    ]
  };

  return `<script type="application/ld+json">${JSON.stringify(graph)}</script>`;
}
