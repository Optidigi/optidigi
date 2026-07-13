"use client";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

type FaqItem = {
  question: string;
  answer: string | string[];
};

const faqItems: FaqItem[] = [
  {
    question: "We weten nog niet precies wat we nodig hebben. Kunnen jullie meedenken?",
    answer:
      "Ja. We brengen eerst in kaart waar werk vastloopt, onnodig veel tijd kost of beter kan. Daarna bekijken we welke combinatie van software, AI, automatisering of maatwerk het beste bij jullie situatie past.",
  },
  {
    question: "Werken jullie met onze bestaande software en systemen?",
    answer:
      "Ja. We kijken eerst wat al goed werkt en hoe bestaande software beter kan worden ingericht of gekoppeld. Alleen wanneer de huidige systemen echt tekortschieten, adviseren we een andere oplossing of maatwerk.",
  },
  {
    question: "Is maatwerk altijd nodig?",
    answer:
      "Nee. Wanneer bestaande software goed aansluit, is configureren, implementeren of koppelen vaak slimmer dan iets volledig nieuws bouwen. Maatwerk zetten we in wanneer standaardoplossingen belangrijke processen niet goed ondersteunen.",
  },
  {
    question: "Kunnen we ook met één proces of oplossing beginnen?",
    answer:
      "Ja. We kunnen starten met één duidelijk proces, een koppeling, automatisering of afgebakende toepassing. Zo blijft het traject overzichtelijk en kun je eerst ervaren wat de oplossing oplevert voordat we verder uitbreiden.",
  },
  {
    question: "Hoe lang duurt een gemiddeld project?",
    answer: [
      "Standaardautomatiseringen en het implementeren of koppelen van nieuwe of bestaande software duren vaak één tot vier weken. Daarin nemen we ook de inrichting, tests, uitleg en eventuele onboarding of training mee.",
      "Grotere maatwerkoplossingen, teamomgevingen, websites, portalen en dashboards duren meestal enkele weken tot enkele maanden. We werken waar mogelijk gefaseerd en stemmen de uitvoering af op jullie dagelijkse bedrijfsvoering, zodat het werk zo min mogelijk wordt verstoord.",
    ],
  },
  {
    question: "Is een vrijblijvende demo mogelijk?",
    answer: [
      "Ja, in veel gevallen kunnen we vooraf een vrijblijvende demo of een eenvoudig voorbeeld laten zien. Wat mogelijk is, hangt af van de oplossing en de complexiteit van het vraagstuk.",
      "Bij complex maatwerk bepalen we eerst welk onderdeel binnen een korte demo representatief kan worden getoond. Uitgebreide prototypes of speciaal ontwikkelde demonstraties stemmen we apart af.",
    ],
  },
  {
    question: "Wat gebeurt er na de oplevering?",
    answer:
      "Na de oplevering helpen we met de ingebruikname, uitleg en waar nodig onboarding of training. Daarna kunnen we ondersteunen met beheer, verbeteringen en verdere doorontwikkeling, afgestemd op de oplossing en jullie behoefte.",
  },
  {
    question: "Wat houdt de digitale kansenscan in?",
    answer: [
      "De digitale kansenscan is een vrijblijvende sessie van 15 tot 30 minuten waarin we jullie huidige werkwijze, systemen en belangrijkste knelpunten bespreken. Het doel is om de behoefte beter te begrijpen en een logisch startpunt te bepalen.",
      "Bij een complexer of breder vraagstuk kan het gesprek worden voortgezet in een vervolgsessie of via aanvullende correspondentie. Zo krijgen we voldoende context om gericht met jullie mee te denken.",
    ],
  },
];

function FaqAnswer({ answer }: { answer: string | string[] }) {
  const paragraphs = Array.isArray(answer) ? answer : [answer];

  return (
    <div className="space-y-3 pb-4 pt-0">
      {paragraphs.map((paragraph) => (
        <p key={paragraph} className="text-muted-foreground text-base">
          {paragraph}
        </p>
      ))}
    </div>
  );
}

function ContactPrompt({ className }: { className?: string }) {
  return (
    <p className={className}>
      Staat je vraag er niet bij?{" "}
      <a className="text-primary font-medium hover:underline" href="/contact">
        Neem contact met ons op
      </a>
    </p>
  );
}

export default function FaqSection() {
  return (
    <section id="faq" className="bg-background py-16 md:py-24">
      <div className="mx-auto max-w-5xl px-6">
        <div className="relative py-1">
          <div aria-hidden="true" className="mask-y-from-80% border-foreground/10 pointer-events-none absolute -inset-x-1 -inset-y-56 z-10 border-x border-dashed" />
          <div aria-hidden="true" className="border-foreground/10 pointer-events-none absolute left-1/2 top-0 z-10 w-screen -translate-x-1/2 border-t border-dashed" />
          <div aria-hidden="true" className="border-foreground/10 pointer-events-none absolute bottom-0 left-1/2 z-10 w-screen -translate-x-1/2 border-t border-dashed" />
        <div className="grid max-md:gap-8 md:grid-cols-5 md:divide-x md:divide-dashed md:divide-foreground/10">
          <div className="max-w-lg max-md:px-6 pt-6 md:col-span-2 md:p-10 lg:p-12">
            <h2 className="text-foreground text-4xl font-semibold">FAQ</h2>
            <p className="text-muted-foreground mt-4 text-balance text-lg">
              Antwoorden op veelgestelde vragen
            </p>
            <ContactPrompt className="text-muted-foreground mt-6 max-md:hidden" />
          </div>

          <div className="md:col-span-3 md:px-4 md:pb-4 md:pt-10 lg:pt-12">
            <Accordion className="-space-y-1" collapsible type="single">
              {faqItems.map((item, index) => (
                <AccordionItem key={item.question} value={`faq-${index}`}>
                  <AccordionTrigger>{item.question}</AccordionTrigger>
                  <AccordionContent>
                    <FaqAnswer answer={item.answer} />
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </div>
        </div>

        <ContactPrompt className="text-muted-foreground mt-12 px-6 md:hidden" />
      </div>
    </section>
  );
}
