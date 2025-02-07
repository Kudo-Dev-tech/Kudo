"use client";

import * as React from "react";

import {
  Drawer,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { Menu } from "lucide-react";
import { NavLink } from "./nav-link";
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuList,
} from "@/components/ui/navigation-menu";
import { cn } from "@/lib/utils";
import { routes } from "@/lib/constants/routes";

export function MobileMenu({ className }: { className?: string }) {
  return (
    <Drawer>
      <DrawerTrigger
        className={cn(
          "border border-input shadow-xs hover:bg-accent hover:text-accent-foreground h-9 px-2 py-2 inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
          className,
        )}
      >
        <Menu />
      </DrawerTrigger>
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle>Navigate To</DrawerTitle>
          <NavigationMenu className="[&_div]:w-full self-stretch !max-w-full !justify-start flex flex-col !items-start !gap-4 !mt-4">
            <NavigationMenuList className="flex flex-col gap-2 w-full">
              <NavigationMenuItem className="!w-full">
                <NavLink href="/" className="w-full !justify-start">
                  Browse
                </NavLink>
              </NavigationMenuItem>
              <NavigationMenuItem className="w-full">
                <NavLink
                  href="/activity"
                  className="w-full !justify-start"
                  disabled
                >
                  Activity
                </NavLink>
              </NavigationMenuItem>
              <NavigationMenuItem className="w-full">
                <NavLink
                  href={routes.docs}
                  target="_blank"
                  className="w-full !justify-start"
                >
                  Docs
                </NavLink>
              </NavigationMenuItem>
            </NavigationMenuList>
          </NavigationMenu>
        </DrawerHeader>

        <DrawerFooter></DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}
