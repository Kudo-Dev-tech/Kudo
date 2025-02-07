"use client";

import { KudoLogo } from "@/components/kudo-logo";
import NextLink from "next/link";
import { Button } from "@/components/ui/button";
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuList,
} from "@/components/ui/navigation-menu";
import { MobileMenu } from "./mobile-menu";
import { usePrivy } from "@privy-io/react-auth";
import { NavLink } from "./nav-link";
import { AccountWidget } from "./account-widget";
import { NetworkWidget } from "./network-widget";
import { routes } from "@/lib/constants/routes";

export function Navbar() {
  const { ready, authenticated, login } = usePrivy();

  const disableLogin = !ready || (ready && authenticated);

  return (
    <nav className="border-b border-neutral-200 h-18">
      <div className="container container-centered h-18 flex items-center justify-between gap-6 py-4">
        <div className="flex items-center gap-6">
          <NextLink href="/">
            <KudoLogo />
          </NextLink>
          <NavigationMenu className="hidden md:block">
            <NavigationMenuList>
              <NavigationMenuItem>
                <NavLink href="/">Browse</NavLink>
              </NavigationMenuItem>
              <NavigationMenuItem>
                <NavLink href="/activity" disabled>
                  Activity
                </NavLink>
              </NavigationMenuItem>
              <NavigationMenuItem>
                <NavLink href={routes.docs} target="_blank">
                  Docs
                </NavLink>
              </NavigationMenuItem>
            </NavigationMenuList>
          </NavigationMenu>
        </div>
        <div className="flex items-center gap-1">
          <NetworkWidget />
          {authenticated ? (
            <AccountWidget />
          ) : (
            <Button
              disabled={disableLogin}
              onClick={login}
              variant="default"
              className="gap-1"
            >
              Connect
              <span className="hidden xs:inline"> Wallet</span>
            </Button>
          )}
          <MobileMenu className="md:hidden" />
        </div>
      </div>
    </nav>
  );
}
