"use client";

import type { LucideIcon } from "lucide-react";
import * as React from "react";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTopLinkClass,
  navigationMenuMegaLinkClass,
} from "@/components/ui/navigation-menu";
import {
  getNavigation,
  type NavMegaItem,
} from "@/config/site";
import type { Locale } from "@/i18n";
import { cn } from "@/lib/utils";

const mobileAccordionItemClass =
  "last:border-b-0 before:border-border group relative rounded-none border-b-0 border-none px-0 py-0 shadow-none ring-0 before:pointer-events-none before:absolute before:inset-x-4 before:bottom-0 before:border-b data-[state=open]:bg-transparent data-[state=open]:shadow-none data-[state=open]:ring-0";

const mobileAccordionTriggerClass =
  "!rounded-none !border-transparent !py-3 !px-4 !text-lg !font-normal hover:!no-underline data-[state=open]:bg-foreground/5 flex items-center justify-between";

const mobilePlainLinkClass =
  "text-foreground group relative block border-0 border-b px-4 py-4 text-lg no-underline";

function closeMobileNav() {
  document.dispatchEvent(new CustomEvent("nav-close"));
}

function resetDesktopNavShell() {
  const header = document.querySelector<HTMLElement>("[data-nav]");
  const bar = document.querySelector<HTMLElement>("[data-nav] > div");
  const menu = document.querySelector<HTMLElement>('[data-slot="navigation-menu"]');

  header?.removeAttribute("data-menu-open");
  bar?.style.removeProperty("--nav-viewport-height");
  bar?.style.removeProperty("height");
  menu?.style.removeProperty("--nav-viewport-height");
}

function useNavViewportHeight(isOpen: boolean) {
  React.useLayoutEffect(() => {
    const header = document.querySelector<HTMLElement>("[data-nav]");

    if (!isOpen) {
      resetDesktopNavShell();
      return;
    }

    header?.setAttribute("data-menu-open", "true");

    const sync = () => {
      const viewport = document.querySelector<HTMLElement>(
        '[data-slot="navigation-menu-viewport"]',
      );
      const bar = document.querySelector<HTMLElement>("[data-nav] > div");
      const menu = document.querySelector<HTMLElement>('[data-slot="navigation-menu"]');
      if (!bar) return;

      const measuredHeight =
        viewport &&
        (getComputedStyle(viewport).getPropertyValue(
          "--radix-navigation-menu-viewport-height",
        ) ||
          `${viewport.offsetHeight}px`);
      const height = measuredHeight || "0px";
      const isDesktop = window.matchMedia("(min-width: 1024px)").matches;

      bar.style.setProperty("--nav-viewport-height", height);
      menu?.style.setProperty("--nav-viewport-height", height);

      if (isOpen && isDesktop && measuredHeight) {
        bar.style.height = `calc(${height} + 3.4rem)`;
      } else {
        bar.style.removeProperty("height");
      }
    };

    let resizeObserver: ResizeObserver | undefined;
    let mutationObserver: MutationObserver | undefined;
    let frame = 0;

    const attach = () => {
      const viewport = document.querySelector<HTMLElement>(
        '[data-slot="navigation-menu-viewport"]',
      );
      const menu = document.querySelector<HTMLElement>('[data-slot="navigation-menu"]');
      if (!viewport || !menu) {
        window.requestAnimationFrame(attach);
        return;
      }

      sync();
      resizeObserver = new ResizeObserver(sync);
      resizeObserver.observe(viewport);

      mutationObserver = new MutationObserver(() => {
        cancelAnimationFrame(frame);
        frame = window.requestAnimationFrame(sync);
      });
      mutationObserver.observe(viewport, {
        attributes: true,
        attributeFilter: ["data-state", "style"],
      });
      mutationObserver.observe(menu, {
        attributes: true,
        subtree: true,
        attributeFilter: ["data-state", "style"],
      });

      menu.querySelectorAll('[data-slot="navigation-menu-trigger"]').forEach((trigger) => {
        trigger.addEventListener("pointerenter", sync);
        trigger.addEventListener("focus", sync);
      });
    };

    attach();

    return () => {
      cancelAnimationFrame(frame);
      resizeObserver?.disconnect();
      mutationObserver?.disconnect();
      resetDesktopNavShell();
    };
  }, [isOpen]);
}

function NavIconTile({
  icon: Icon,
  iconFill,
}: {
  icon: LucideIcon;
  iconFill: string;
}) {
  return (
    <div className="bg-illustration ring-foreground/10 before:bg-radial before:to-foreground/3 *:drop-shadow-black/6.5 relative flex size-9 items-center justify-center rounded-lg border border-transparent shadow-sm ring-1 *:drop-shadow before:absolute before:inset-0 before:rounded-lg">
      <Icon className={cn("stroke-foreground size-4", iconFill)} aria-hidden="true" />
    </div>
  );
}

function MegaMenuLink({ item, onNavigate }: { item: NavMegaItem; onNavigate: () => void }) {
  return (
    <NavigationMenuLink asChild className={navigationMenuMegaLinkClass}>
      <a href={item.href} onClick={onNavigate}>
        <NavIconTile icon={item.icon} iconFill={item.iconFill} />
        <div className="space-y-0.5">
          <div className="text-foreground text-sm font-medium">{item.title}</div>
          <p className="text-muted-foreground line-clamp-1 text-xs">{item.description}</p>
        </div>
      </a>
    </NavigationMenuLink>
  );
}

function FeaturedCard({
  title,
  description,
  href,
  onNavigate,
}: {
  title: string;
  description: string;
  href: string;
  onNavigate: () => void;
}) {
  return (
    <div
      className="bg-card inset-ring-foreground/10 inset-ring-1 relative mt-3 grid min-h-40 grid-rows-[1fr_auto] overflow-hidden rounded-xl p-1 shadow-sm transition-[background-color,box-shadow] duration-200 before:pointer-events-none before:absolute before:inset-0 before:bg-[radial-gradient(circle_at_82%_8%,color-mix(in_oklab,var(--primary)_10%,transparent),transparent_42%)] hover:bg-muted/70 hover:shadow-md"
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 bottom-14 px-6"
      >
        <div className="mask-b-from-35% before:bg-background before:ring-foreground/10 after:ring-foreground/5 after:bg-background/75 before:z-1 group relative -mx-4 h-full px-4 pt-6 before:absolute before:inset-x-6 before:bottom-0 before:top-4 before:rounded-t-xl before:border before:border-transparent before:ring-1 after:absolute after:inset-x-9 after:bottom-0 after:top-2 after:rounded-t-xl after:border after:border-transparent after:ring-1">
          <div className="bg-card ring-foreground/10 relative z-10 h-full overflow-hidden rounded-t-xl border border-transparent p-8 text-sm shadow-xl shadow-black/25 ring-1" />
        </div>
      </div>
      <div className="relative z-20 col-start-1 row-start-2 space-y-0.5 self-end p-3">
        <NavigationMenuLink asChild>
          <a
            href={href}
            onClick={onNavigate}
            className="text-foreground hover:text-foreground focus:text-foreground relative p-0 text-sm font-medium before:absolute before:inset-0 hover:bg-transparent focus:bg-transparent"
          >
            {title}
          </a>
        </NavigationMenuLink>
        <p className="text-muted-foreground line-clamp-2 text-xs">{description}</p>
      </div>
    </div>
  );
}

const labels = {
  nl: { services: "Diensten", moreServices: "Meer diensten", startHere: "Start hier", approach: "Aanpak", nextStep: "Volgende stap", main: "Hoofdnavigatie", mobile: "Mobiel menu" },
  en: { services: "Services", moreServices: "More services", startHere: "Start here", approach: "Approach", nextStep: "Next step", main: "Main navigation", mobile: "Mobile menu" },
} as const;

function DienstenPanel({ onNavigate, locale }: { onNavigate: () => void; locale: Locale }) {
  const nav = getNavigation(locale);
  const copy = labels[locale];
  return (
    <div className="min-w-5xl divide-foreground/10 mx-auto grid w-full max-w-5xl grid-cols-4 gap-4 divide-x pl-10">
      <div className="row-span-2 -mr-2 grid grid-rows-subgrid gap-1 pr-2">
        <span className="text-muted-foreground ml-2 text-[11px] font-medium tracking-wide">
          {copy.services}
        </span>
        <ul className="mt-2 space-y-2">
          {nav.dienstenPrimary.map((item) => (
            <li key={item.title}>
              <MegaMenuLink item={item} onNavigate={onNavigate} />
            </li>
          ))}
        </ul>
      </div>

      <div className="col-span-2 row-span-2 grid grid-rows-subgrid gap-1 border-r-0">
        <span className="text-muted-foreground ml-2 text-[11px] font-medium tracking-wide">
          {copy.moreServices}
        </span>
        <ul className="mt-2 grid grid-cols-2 gap-2">
          {nav.dienstenSecondary.map((item) => (
            <li key={item.title}>
              <MegaMenuLink item={item} onNavigate={onNavigate} />
            </li>
          ))}
        </ul>
      </div>

      <div className="row-span-2 grid grid-rows-subgrid gap-1">
        <span className="text-muted-foreground ml-2 text-[11px] font-medium tracking-wide">
          {copy.startHere}
        </span>
        <FeaturedCard {...nav.dienstenFeatured} onNavigate={onNavigate} />
      </div>
    </div>
  );
}

function AanpakPanel({ onNavigate, locale }: { onNavigate: () => void; locale: Locale }) {
  const nav = getNavigation(locale);
  const copy = labels[locale];
  return (
    <div className="min-w-5xl divide-foreground/10 mx-auto grid w-full max-w-5xl grid-cols-4 gap-4 divide-x pl-10">
      <div className="col-span-2 row-span-2 -mr-4 grid grid-rows-subgrid gap-1 pr-2">
        <span className="text-muted-foreground ml-2 text-[11px] font-medium tracking-wide">
          {copy.approach}
        </span>
        <ul className="mt-2 grid grid-cols-2 gap-2">
          {nav.aanpakItems.map((item) => (
            <li key={item.title}>
              <MegaMenuLink item={item} onNavigate={onNavigate} />
            </li>
          ))}
        </ul>
      </div>

      <div className="col-span-2 row-span-2 grid grid-rows-subgrid gap-1">
        <span className="text-muted-foreground ml-2 text-[11px] font-medium tracking-wide">
          {copy.nextStep}
        </span>
        <FeaturedCard {...nav.aanpakFeatured} onNavigate={onNavigate} />
      </div>
    </div>
  );
}

export function HeaderNavigationDesktop({ locale = "nl" }: { locale?: Locale }) {
  const nav = getNavigation(locale);
  const copy = labels[locale];
  const [value, setValue] = React.useState("");
  useNavViewportHeight(Boolean(value));

  const closeMenu = React.useCallback(() => {
    setValue("");
    resetDesktopNavShell();
  }, []);

  return (
    <NavigationMenu
      aria-label={copy.main}
      value={value}
      onValueChange={setValue}
      className="**:data-[slot=navigation-menu-viewport]:bg-transparent **:data-[slot=navigation-menu-viewport]:rounded-none **:data-[slot=navigation-menu-viewport]:ring-0 **:data-[slot=navigation-menu-viewport]:border-0 **:data-[slot=navigation-menu-viewport]:shadow-none [--viewport-outer-px:2rem] max-lg:hidden"
    >
      <div style={{ position: "relative" }}>
        <NavigationMenuList>
          <NavigationMenuItem>
            <NavigationMenuTrigger>{copy.services}</NavigationMenuTrigger>
            <NavigationMenuContent>
              <DienstenPanel onNavigate={closeMenu} locale={locale} />
            </NavigationMenuContent>
          </NavigationMenuItem>

          <NavigationMenuItem>
            <NavigationMenuTrigger>{copy.approach}</NavigationMenuTrigger>
            <NavigationMenuContent>
              <AanpakPanel onNavigate={closeMenu} locale={locale} />
            </NavigationMenuContent>
          </NavigationMenuItem>

          {nav.plainLinks.map((link) => (
            <NavigationMenuItem key={link.title}>
              <NavigationMenuLink asChild className={navigationMenuTopLinkClass}>
                <a href={link.href} onClick={closeMenu}>{link.title}</a>
              </NavigationMenuLink>
            </NavigationMenuItem>
          ))}
        </NavigationMenuList>
      </div>
    </NavigationMenu>
  );
}

function MobileAccordionLink({ item }: { item: NavMegaItem }) {
  const Icon = item.icon;

  return (
    <a
      href={item.href}
      className="grid grid-cols-[auto_1fr] items-center gap-2.5 px-4 py-2 no-underline"
      onClick={closeMobileNav}
    >
      <div aria-hidden="true" className="flex items-center justify-center *:size-4">
        <Icon className={cn("stroke-foreground size-4", item.iconFill)} />
      </div>
      <div className="text-base">{item.title}</div>
    </a>
  );
}

function MobileAccordionGroup({
  title,
  items,
  value,
}: {
  title: string;
  items: NavMegaItem[];
  value: string;
}) {
  return (
    <AccordionItem value={value} className={mobileAccordionItemClass}>
      <AccordionTrigger className={mobileAccordionTriggerClass}>{title}</AccordionTrigger>
      <AccordionContent className="pb-5 pt-0">
        <ul>
          {items.map((item) => (
            <li key={item.title}>
              <MobileAccordionLink item={item} />
            </li>
          ))}
        </ul>
      </AccordionContent>
    </AccordionItem>
  );
}

export function HeaderNavigationMobile({ locale = "nl" }: { locale?: Locale }) {
  const nav = getNavigation(locale);
  const copy = labels[locale];
  return (
    <nav
      id="mobile-navigation"
      aria-label={copy.mobile}
      className="max-lg:in-data-[state=active]:block mb-6 hidden w-full lg:hidden"
    >
      <Accordion
        type="multiple"
        className="**:hover:no-underline -mx-4 mt-0.5 space-y-0.5"
      >
        <MobileAccordionGroup title={copy.services} items={nav.dienstenPrimary} value="diensten" />
        <MobileAccordionGroup
          title={copy.moreServices}
          items={nav.dienstenSecondary}
          value="meer-diensten"
        />
        <MobileAccordionGroup title={copy.approach} items={nav.aanpakItems} value="aanpak" />
      </Accordion>

      {nav.plainLinks.map((link) => (
        <a
          key={link.title}
          href={link.href}
          className={mobilePlainLinkClass}
          onClick={closeMobileNav}
        >
          {link.title}
        </a>
      ))}
    </nav>
  );
}
