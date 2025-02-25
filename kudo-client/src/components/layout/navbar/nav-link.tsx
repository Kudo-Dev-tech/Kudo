"use client";
import { usePathname } from "next/navigation";
import NextLink from "next/link";
import {
  NavigationMenuLink,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu";
import { cn } from "@/lib/utils";

export const NavLink = ({
  href,
  target,
  disabled = false,
  ...props
}: {
  href: string;
  target?: string;
  disabled?: boolean;
} & Omit<React.ComponentPropsWithoutRef<typeof NextLink>, "disabled">) => {
  const pathname = usePathname();
  const isActive = href === pathname;

  return (
    <NavigationMenuLink
      asChild
      active={isActive}
      className={cn(
        navigationMenuTriggerStyle(),
        disabled && "pointer-events-none opacity-50",
        props.className,
      )}
    >
      <NextLink
        href={href}
        className="NavigationMenuLink"
        target={target}
        aria-disabled={disabled}
        {...props}
      />
    </NavigationMenuLink>
  );
};
