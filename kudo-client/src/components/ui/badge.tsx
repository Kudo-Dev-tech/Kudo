import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { ArrowUpRight } from "lucide-react";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex justify-center items-center transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "rounded-full gap-0.5 rounded-full px-2 py-0.5 bg-stone-100 text-stone-500 text-l4",
        outline:
          "rounded-[6px] gap-1 px-2 py-1 border border-stone-200 bg-white text-l4",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {
  href?: string;
}

function Badge({ className, variant, href, ...props }: BadgeProps) {
  const Comp = href ? "a" : "div";
  return (
    <Comp
      className={cn(
        badgeVariants({ variant }),
        className,
        href &&
          "text-blue-600 hover:text-blue-700 transition-colors duration-300 focus:ring-0 focus:ring-offset-0",
      )}
      href={href}
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      {...(props as any)}
    >
      {props.children}
      {href && <ArrowUpRight className="size-3" />}
    </Comp>
  );
}

export { Badge, badgeVariants };
