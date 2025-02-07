import { cn } from "@/lib/utils";
import { ArrowUpRight } from "lucide-react";
import React from "react";

type LabelTextProps = {
  variant?: "vertical" | "horizontal";
  className?: string;
  label: string;
  labelClassName?: string;
  text?: string;
  textHref?: string;
  textClassName?: string;
  children?: React.ReactNode;
};

export function LabelText({
  label,
  labelClassName,
  text,
  children,
  className,
  variant = "vertical",
  textHref,
  textClassName,
}: LabelTextProps) {
  const isTextHrefExternal =
    textHref?.includes("http") || textHref?.includes("https");
  return (
    <div
      className={cn(
        "flex",
        variant === "vertical"
          ? "flex-col gap-2"
          : "flex-row gap-3 justify-between items-center",
        className,
      )}
    >
      <p className={cn("text-l3 text-stone-500", labelClassName)}>{label}</p>
      {text &&
        (textHref ? (
          <a
            href={textHref}
            className={cn(
              "inline-flex items-center gap-0.5 text-l3 text-blue-600 hover:text-blue-700 transition-all duration-300",
              textClassName,
            )}
            target={isTextHrefExternal ? "_blank" : undefined}
          >
            {text} {isTextHrefExternal && <ArrowUpRight className="size-3" />}
          </a>
        ) : (
          <p
            className={cn("text-l3 text-stone-950 font-medium", textClassName)}
          >
            {text}
          </p>
        ))}
      {children}
    </div>
  );
}
