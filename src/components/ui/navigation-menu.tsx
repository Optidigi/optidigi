import * as NavigationMenuPrimitive from "@radix-ui/react-navigation-menu";
import { ChevronDownIcon } from "lucide-react";
import * as React from "react";

import { cn } from "@/lib/utils";

export const navigationMenuTriggerClass =
  "group inline-flex h-8 w-max items-center justify-center rounded-md px-4 py-1 text-sm font-medium text-muted-foreground hover:bg-foreground/5 hover:text-foreground focus:bg-foreground/5 focus:text-foreground disabled:pointer-events-none disabled:opacity-50 data-[state=open]:bg-foreground/5 data-[state=open]:text-foreground data-[state=open]:hover:bg-foreground/5 data-[state=open]:focus:bg-foreground/5 focus-visible:ring-ring/50 outline-none transition-[color,box-shadow] focus-visible:ring-[3px] focus-visible:outline-1";

export const navigationMenuTopLinkClass = cn(
  navigationMenuTriggerClass,
  "data-[active=true]:focus:bg-foreground/5 data-[active=true]:hover:bg-foreground/5 data-[active=true]:bg-foreground/2.5 data-[active=true]:text-foreground [&_svg:not([class*='text-'])]:text-muted-foreground flex-col gap-1 p-2 [&_svg:not([class*='size-'])]:size-4",
);

export const navigationMenuMegaLinkClass =
  "data-[active=true]:focus:bg-foreground/5 data-[active=true]:hover:bg-foreground/5 data-[active=true]:bg-foreground/2.5 data-[active=true]:text-foreground hover:bg-foreground/5 hover:text-foreground focus:bg-foreground/5 focus:text-foreground focus-visible:ring-ring/50 [&_svg:not([class*='text-'])]:text-muted-foreground grid grid-cols-[auto_1fr] gap-2.5 rounded-[11px] p-2 text-sm outline-none transition-all focus-visible:outline-1 focus-visible:ring-[3px] [&_svg:not([class*='size-'])]:size-4";

function NavigationMenu({
  className,
  children,
  ...props
}: React.ComponentProps<typeof NavigationMenuPrimitive.Root>) {
  return (
    <NavigationMenuPrimitive.Root
      data-slot="navigation-menu"
      data-viewport="true"
      className={cn(
        "group/navigation-menu relative flex max-w-max flex-1 items-center justify-center",
        className,
      )}
      {...props}
    >
      {children}
      <NavigationMenuViewport />
    </NavigationMenuPrimitive.Root>
  );
}

function NavigationMenuList({
  className,
  ...props
}: React.ComponentProps<typeof NavigationMenuPrimitive.List>) {
  return (
    <NavigationMenuPrimitive.List
      data-slot="navigation-menu-list"
      className={cn(
        "group flex flex-1 list-none items-center justify-center gap-3",
        className,
      )}
      {...props}
    />
  );
}

function NavigationMenuItem({
  className,
  ...props
}: React.ComponentProps<typeof NavigationMenuPrimitive.Item>) {
  return (
    <NavigationMenuPrimitive.Item
      data-slot="navigation-menu-item"
      className={cn("relative", className)}
      {...props}
    />
  );
}

function NavigationMenuTrigger({
  className,
  children,
  ...props
}: React.ComponentProps<typeof NavigationMenuPrimitive.Trigger>) {
  return (
    <NavigationMenuPrimitive.Trigger
      data-slot="navigation-menu-trigger"
      className={cn(navigationMenuTriggerClass, "group", className)}
      {...props}
    >
      {children}
      <ChevronDownIcon
        strokeWidth={2.5}
        className="relative top-px ml-1.5 size-3 opacity-75 transition duration-300 group-data-[state=open]:translate-y-px"
        aria-hidden="true"
      />
    </NavigationMenuPrimitive.Trigger>
  );
}

function NavigationMenuContent({
  className,
  ...props
}: React.ComponentProps<typeof NavigationMenuPrimitive.Content>) {
  return (
    <NavigationMenuPrimitive.Content
      data-slot="navigation-menu-content"
      className={cn(
        "top-0 left-0 w-full p-2 pr-2.5 md:absolute md:w-auto",
        "data-[motion=from-end]:animate-enter-from-right data-[motion=from-start]:animate-enter-from-left data-[motion=to-end]:animate-exit-to-right data-[motion=to-start]:animate-exit-to-left",
        "**:data-[slot=navigation-menu-link]:focus:ring-0 **:data-[slot=navigation-menu-link]:focus:outline-none",
        "mt-4.5 origin-top pb-14 pt-5 shadow-none ring-0",
        className,
      )}
      {...props}
    />
  );
}

function NavigationMenuLink({
  className,
  ...props
}: React.ComponentProps<typeof NavigationMenuPrimitive.Link>) {
  return (
    <NavigationMenuPrimitive.Link
      data-slot="navigation-menu-link"
      className={cn(className)}
      {...props}
    />
  );
}

function NavigationMenuViewport({
  className,
  ...props
}: React.ComponentProps<typeof NavigationMenuPrimitive.Viewport>) {
  return (
    <div
      data-slot="navigation-menu-viewport-parent"
      className="px-(--viewport-outer-px) fixed inset-x-0 top-12 isolate z-50 mx-auto flex max-w-6xl"
    >
      <NavigationMenuPrimitive.Viewport
        data-slot="navigation-menu-viewport"
        className={cn(
          "bg-popover text-popover-foreground ring-border shadow-black/6.5 relative mt-1.5 w-full origin-top overflow-hidden rounded-xl p-0.5 shadow-xl ring-1 transition-[width,height] duration-200",
          "h-(--radix-navigation-menu-viewport-height) md:w-(--radix-navigation-menu-viewport-width)",
          "data-[state=open]:animate-scale-in data-[state=closed]:animate-scale-out",
          className,
        )}
        {...props}
      />
    </div>
  );
}

export {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  NavigationMenuViewport,
};
