export const locales = {
  nl: {
    lang: "nl",
    pathPrefix: "",
    home: "/",
    nav: [
      { href: "/over-ons", label: "Over ons" },
      { href: "/#services", label: "Oplossingen" },
      { href: "/prijzen", label: "Prijzen" },
      { href: "/contact", label: "Contact" },
      { href: "/en", label: "EN" },
    ],
    footerLinks: [
      { name: "Over ons", href: "/over-ons" },
      { name: "Oplossingen", href: "/#services" },
      { name: "Prijzen", href: "/prijzen" },
      { name: "Contact", href: "/contact" },
    ],
    navButton: {
      href: "mailto:info@optidigi.nl?subject=Introductiecall%20Optidigi",
      label: "Plan introductiecall",
    },
    footer: {
      contactTitle: "Contact",
      emailLabel: "E-mail",
      shortFormPlaceholder: "E-mail",
      shortFormButton: "Mail Optidigi",
    },
  },
  en: {
    lang: "en",
    pathPrefix: "/en",
    home: "/en/",
    nav: [
      { href: "/en/about", label: "About" },
      { href: "/en/#services", label: "Solutions" },
      { href: "/en/pricing", label: "Pricing" },
      { href: "/en/contact", label: "Contact" },
      { href: "/", label: "NL" },
    ],
    footerLinks: [
      { name: "About", href: "/en/about" },
      { name: "Solutions", href: "/en/#services" },
      { name: "Pricing", href: "/en/pricing" },
      { name: "Contact", href: "/en/contact" },
    ],
    navButton: {
      href: "mailto:info@optidigi.nl?subject=Introductory%20call%20Optidigi",
      label: "Plan intro call",
    },
    footer: {
      contactTitle: "Contact",
      emailLabel: "Email",
      shortFormPlaceholder: "Email",
      shortFormButton: "Email Optidigi",
    },
  },
};

export const pages = {
  nl: {
    home: {
      title: "Optidigi - Websites, apps en automatisering",
      description:
        "Optidigi bouwt websites, webapplicaties, apps, dashboards, automatisering en maatwerksoftware voor ondernemers en groeiende teams.",
      alternates: { nl: "/", en: "/en/" },
    },
    about: {
      title: "Over Optidigi - Digitale oplossingen",
      description:
        "Optidigi is een bureau voor websites, webapplicaties, automatisering en maatwerksoftware.",
      alternates: { nl: "/over-ons/", en: "/en/about/" },
    },
    pricing: {
      title: "Prijzen - Optidigi",
      description:
        "Optidigi werkt met vaste projectprijzen, begrensde budgetten en maandelijkse serviceafspraken zonder fictieve standaardprijzen.",
      alternates: { nl: "/prijzen/", en: "/en/pricing/" },
    },
    contact: {
      title: "Contact - Optidigi",
      description:
        "Neem contact op met Optidigi V.O.F. voor websites, apps, dashboards, automatisering en maatwerksoftware.",
      alternates: { nl: "/contact/", en: "/en/contact/" },
    },
  },
  en: {
    home: {
      title: "Optidigi - Websites, apps and automation",
      description:
        "Optidigi builds websites, web applications, apps, dashboards, automation and custom software for entrepreneurs and growing teams.",
      alternates: { nl: "/", en: "/en/" },
    },
    about: {
      title: "About Optidigi - Digital solutions",
      description:
        "Optidigi is an agency for websites, web applications, automation and custom software.",
      alternates: { nl: "/over-ons/", en: "/en/about/" },
    },
    pricing: {
      title: "Pricing - Optidigi",
      description:
        "Optidigi works with fixed project prices, capped budgets and monthly service agreements without fictional standard prices.",
      alternates: { nl: "/prijzen/", en: "/en/pricing/" },
    },
    contact: {
      title: "Contact - Optidigi",
      description:
        "Contact Optidigi V.O.F. for websites, apps, dashboards, automation and custom software.",
      alternates: { nl: "/contact/", en: "/en/contact/" },
    },
  },
};

export const sections = {
  nl: {
    hero: {
      title: "Digitale oplossingen <br> die werken.",
      description:
        "We bouwen maatwerk websites, koppelingen en automatiseringen die tijd besparen, handmatig werk verminderen en groei ondersteunen.",
      cta: "Plan introductiecall (15 min)",
      ctaHref: "mailto:info@optidigi.nl?subject=Introductiecall%20Optidigi",
      imageAlt: "Abstracte illustratie bij digitale oplossingen",
    },
    services: {
      title: "Oplossingen",
      description:
        "Praktische digitale oplossingen voor ondernemers en groeiende teams die minder handmatig werk en meer overzicht willen.",
      moreInfo: "Meer info",
      cards: [
        ["Websites", "op maat", "Illustratie voor websites op maat"],
        ["Webapps en", "portalen", "Illustratie voor webapplicaties en portalen"],
        ["Apps en", "dashboards", "Illustratie voor apps en dashboards"],
        ["Koppelingen en", "automatisering", "Illustratie voor koppelingen en automatisering"],
        ["Maatwerk", "software", "Illustratie voor maatwerksoftware"],
        ["Data en", "AI-oplossingen", "Illustratie voor data en AI-oplossingen"],
      ],
    },
    clients: {
      title: "Klanten",
      description:
        "Een kleine selectie van publieke klantfeedback.",
    },
    team: {
      title: "Team",
      description:
        "Optidigi wordt gebouwd door twee co-founders met een praktische technische en data-achtergrond.",
      members: [
        {
          name: "Shamil Agovic",
          role: "Co-founder / software engineer",
          description:
            "Ervaren software engineer. Richt zich op architectuur, webapplicaties, integraties en maatwerksoftware.",
        },
        {
          name: "Armin Kozar",
          role: "Co-founder / data-analist",
          description:
            "Data-analist. Richt zich op dashboards, datastromen, rapportages en praktische inzichten.",
        },
      ],
    },
    testimonials: {
      title: "Ervaringen",
      description:
        "Publieke feedback van klanten.",
    },
    proposal: {
      title: "Maak je digitale basis werkbaar",
      text:
        "Mail ons kort wat je wilt verbeteren. Dan plannen we een introductiecall en bepalen we samen of een maatwerktraject logisch is.",
      cta: "Plan introductiecall",
      href: "mailto:info@optidigi.nl?subject=Introductiecall%20Optidigi",
      imageAlt: "Illustratie bij voorstel en planning",
    },
    cases: {
      title: "Uitgangspunten",
      description:
        "Geen losse visitekaartjes of zware standaardpakketten, maar digitale onderdelen die praktisch samenwerken.",
      moreInfo: "Meer info",
      cards: [
        {
          title:
            "Een website staat niet los van je bedrijf. We kijken daarom ook naar formulieren, opvolging, systemen en de handmatige stappen erachter.",
          link: "/contact",
          linkLabel: "Website en workflow",
        },
        {
          title:
            "Bestaande software blijft waar mogelijk centraal. Optidigi bouwt koppelingen rond de systemen waar je team al mee werkt.",
          link: "/over-ons",
          linkLabel: "Bestaande software",
        },
        {
          title:
            "Bij complexere vragen starten we met een duidelijke blauwdruk, zodat scope, risico's en investering vooraf concreet worden.",
          link: "/prijzen",
          linkLabel: "Blauwdruk en scope",
        },
      ],
    },
    process: {
      title: "Werkwijze",
      description: "Een nuchter traject van kennismaking tot oplevering en beheer.",
      items: [
        ["Kennismaking", "We starten met een korte call om te bepalen of er een match is op budget, urgentie en het type probleem."],
        ["Inventarisatie", "In een verdiepende sessie brengen we de website, processen, systemen en knelpunten in kaart."],
        ["Voorstel en blauwdruk", "Je ontvangt een helder plan. Bij complexe koppelingen kan een betaalde blauwdruk nodig zijn voordat de bouw start."],
        ["Iteratieve bouw", "We bouwen in overzichtelijke stappen en houden de voortgang concreet met korte updates of calls."],
        ["Oplevering", "Na oplevering maken we de oplossing begrijpelijk voor het team en controleren we of de workflow praktisch werkt."],
        ["Beheer", "Als beheer gewenst is, spreken we maandelijkse afspraken af voor hosting, veiligheid, updates of bedrijfskritische ondersteuning."],
      ],
    },
    contactSection: {
      title: "Contact",
      description:
        "Stuur een korte mail over je vraag. Dan bepalen we snel of een introductiecall zinvol is.",
      form: {
        intro: "Kennismaken",
        project: "Project bespreken",
        nameLabel: "Naam*",
        namePlaceholder: "Naam",
        emailLabel: "E-mail*",
        emailPlaceholder: "E-mail",
        messageLabel: "Bericht*",
        messagePlaceholder: "Bericht",
        submit: "Verstuur e-mail",
        projectMessage:
          "We willen graag een project bespreken. Neem contact met ons op.",
        imageAlt: "Decoratieve illustratie",
      },
    },
  },
  en: {
    hero: {
      title: "Digital solutions <br> that work.",
      description:
        "We build custom websites, integrations and automations that save time, reduce manual work and support growth.",
      cta: "Plan intro call (15 min)",
      ctaHref: "mailto:info@optidigi.nl?subject=Introductory%20call%20Optidigi",
      imageAlt: "Abstract illustration for digital solutions",
    },
    services: {
      title: "Solutions",
      description:
        "Practical digital solutions for entrepreneurs and growing teams that want less manual work and better overview.",
      moreInfo: "More info",
      cards: [
        ["Custom", "websites", "Illustration for custom websites"],
        ["Web apps and", "portals", "Illustration for web applications and portals"],
        ["Apps and", "dashboards", "Illustration for apps and dashboards"],
        ["Integrations and", "automation", "Illustration for integrations and automation"],
        ["Custom", "software", "Illustration for custom software"],
        ["Data and", "AI solutions", "Illustration for data and AI solutions"],
      ],
    },
    clients: {
      title: "Clients",
      description:
        "A small selection of public client feedback.",
    },
    team: {
      title: "Team",
      description:
        "Optidigi is built by two co-founders with practical software and data backgrounds.",
      members: [
        {
          name: "Shamil Agovic",
          role: "Co-founder / software engineer",
          description:
            "Experienced software engineer. Focuses on architecture, web applications, integrations and custom software.",
        },
        {
          name: "Armin Kozar",
          role: "Co-founder / data analyst",
          description:
            "Data analyst. Focuses on dashboards, data flows, reporting and practical insights.",
        },
      ],
    },
    testimonials: {
      title: "Testimonials",
      description:
        "Public feedback from clients.",
    },
    proposal: {
      title: "Make your digital foundation workable",
      text:
        "Send a short email about what you want to improve. Then we plan an introductory call and decide whether a custom project makes sense.",
      cta: "Plan intro call",
      href: "mailto:info@optidigi.nl?subject=Introductory%20call%20Optidigi",
      imageAlt: "Illustration for proposal and planning",
    },
    cases: {
      title: "Principles",
      description:
        "No isolated brochure sites or heavy standard packages, but digital parts that work together in practice.",
      moreInfo: "More info",
      cards: [
        {
          title:
            "A website is not separate from your business. We also look at forms, follow-up, systems and the manual steps behind them.",
          link: "/en/contact",
          linkLabel: "Website and workflow",
        },
        {
          title:
            "Existing software remains central where possible. Optidigi builds integrations around the systems your team already uses.",
          link: "/en/about",
          linkLabel: "Existing software",
        },
        {
          title:
            "For more complex questions, we start with a clear blueprint so scope, risk and investment are concrete upfront.",
          link: "/en/pricing",
          linkLabel: "Blueprint and scope",
        },
      ],
    },
    process: {
      title: "Process",
      description: "A practical path from introduction to delivery and support.",
      items: [
        ["Introduction", "We start with a short call to determine whether there is a fit on budget, urgency and type of problem."],
        ["Discovery", "In a deeper session, we map the website, processes, systems and bottlenecks."],
        ["Proposal and blueprint", "You receive a clear plan. For complex integrations, a paid blueprint may be needed before development starts."],
        ["Iterative build", "We build in clear steps and keep progress concrete with short updates or calls."],
        ["Delivery", "After delivery, we make the solution understandable for the team and check whether the workflow works in practice."],
        ["Support", "If support is needed, we agree monthly arrangements for hosting, security, updates or business-critical assistance."],
      ],
    },
    contactSection: {
      title: "Contact",
      description:
        "Send a short email about your question. We will quickly determine whether an introductory call makes sense.",
      form: {
        intro: "Introduction",
        project: "Discuss project",
        nameLabel: "Name*",
        namePlaceholder: "Name",
        emailLabel: "Email*",
        emailPlaceholder: "Email",
        messageLabel: "Message*",
        messagePlaceholder: "Message",
        submit: "Send email",
        projectMessage:
          "We would like to discuss a project. Please contact us.",
        imageAlt: "Decorative illustration",
      },
    },
  },
};

export function absoluteUrl(path) {
  return new URL(path, "https://optidigi.nl").toString();
}
