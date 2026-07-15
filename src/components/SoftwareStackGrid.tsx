"use client";

import microsoftOfficeLogo from "@/assets/brand-logos/microsoft-office.svg?url";
import googleWorkspaceLogo from "@/assets/brand-logos/google-workspace.svg?url";
import microsoftDefenderLogo from "@/assets/brand-logos/microsoft-defender.svg?url";
import openaiLogo from "@/assets/brand-logos/openai.svg?url";
import claudeLogo from "@/assets/brand-logos/claude-ai-icon.svg?url";
import microsoftCopilotLogo from "@/assets/brand-logos/microsoft-copilot.svg?url";
import { Magnetic } from "@/components/ui/magnetic";
import { cn } from "@/lib/utils";
import type { Locale } from "@/i18n";

type IntegrationBrand =
  | "microsoft-365"
  | "google-workspace"
  | "microsoft-defender"
  | "chatgpt"
  | "claude"
  | "microsoft-copilot";

type GridCell =
  | { kind: "empty"; desktopOnly?: boolean }
  | { kind: "brand"; brand: IntegrationBrand; padded?: boolean };

const logoByBrand: Record<IntegrationBrand, string> = {
  "microsoft-365": microsoftOfficeLogo,
  "google-workspace": googleWorkspaceLogo,
  "microsoft-defender": microsoftDefenderLogo,
  chatgpt: openaiLogo,
  claude: claudeLogo,
  "microsoft-copilot": microsoftCopilotLogo,
};

const rowOne: GridCell[] = [
  { kind: "empty", desktopOnly: true },
  { kind: "brand", brand: "microsoft-365", padded: true },
  { kind: "empty", desktopOnly: true },
  { kind: "brand", brand: "google-workspace", padded: true },
  { kind: "empty", desktopOnly: true },
  { kind: "brand", brand: "microsoft-defender", padded: true },
];

const rowTwo: GridCell[] = [
  { kind: "brand", brand: "chatgpt" },
  { kind: "empty", desktopOnly: true },
  { kind: "brand", brand: "claude" },
  { kind: "empty", desktopOnly: true },
  { kind: "brand", brand: "microsoft-copilot" },
  { kind: "empty", desktopOnly: true },
];

const emptySlotClassName =
  "rounded-(--radius) bg-card/50 border-foreground/15 aspect-square border border-dashed backdrop-blur-3xl";

const filledTileClassName =
  "rounded-(--radius) bg-illustration ring-border-illustration shadow-black/6.5 z-10 flex items-center justify-center shadow-md ring-1";

function IntegrationLogo({
  brand,
  className,
}: {
  brand: IntegrationBrand;
  className?: string;
}) {
  return (
    <img
      src={logoByBrand[brand]}
      alt=""
      aria-hidden="true"
      draggable={false}
      className={cn(
        "size-6 shrink-0 select-none",
        brand === "chatgpt" && "dark:brightness-0 dark:invert",
        className,
      )}
    />
  );
}

function EmptySlot({ desktopOnly = false }: { desktopOnly?: boolean }) {
  return (
    <div
      aria-hidden="true"
      className={cn(emptySlotClassName, desktopOnly && "hidden @md:block")}
    />
  );
}

function BrandTile({
  brand,
  padded = false,
}: {
  brand: IntegrationBrand;
  padded?: boolean;
}) {
  return (
    <div className="relative aspect-square">
      <div
        aria-hidden="true"
        className={cn("absolute inset-0", emptySlotClassName)}
      />
      <div className="absolute inset-0">
        <Magnetic className={cn(filledTileClassName, padded && "p-[13%]")}>
          <IntegrationLogo brand={brand} />
        </Magnetic>
      </div>
    </div>
  );
}

function GridRow({ cells, className }: { cells: GridCell[]; className?: string }) {
  return (
    <div className={cn("@md:grid-cols-6 relative grid grid-cols-3 gap-4", className)}>
      {cells.map((cell, index) => {
        if (cell.kind === "empty") {
          return <EmptySlot key={`empty-${index}`} desktopOnly={cell.desktopOnly} />;
        }

        return (
          <BrandTile
            key={cell.brand}
            brand={cell.brand}
            padded={cell.padded}
          />
        );
      })}
    </div>
  );
}

export function SoftwareStackGrid({ locale: _locale = "nl" }: { locale?: Locale }) {
  return (
    <>
      <GridRow cells={rowOne} />
      <GridRow cells={rowTwo} className="mt-4" />
    </>
  );
}

export default SoftwareStackGrid;
