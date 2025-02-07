import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Info, ShieldCheck } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { tooltipContent } from "@/lib/constants/tooltip";

interface VerifiedBadgeProps {
  className?: string;
  agentAddress: string;
  networkAddress: string;
}

export function VerifiedBadge({
  className,
  // agentAddress,
  // networkAddress,
}: VerifiedBadgeProps) {
  // const isMatched = isSameAddress(agentAddress, networkAddress);
  return (
    <TooltipProvider delayDuration={100}>
      <Tooltip>
        <TooltipTrigger asChild>
          <Badge
            variant="outline"
            className={cn(
              "capitalize gap-0.5 pl-1 hover:cursor-pointer",
              className,
            )}
          >
            <ShieldCheck className="fill-emerald-500 text-emerald-50 size-4" />
            Verified
            <Info className="fill-stone-600 text-stone-50 size-3" />
          </Badge>
        </TooltipTrigger>
        <TooltipContent
          className="flex w-fit flex-col gap-2 p-4 bg-white border border-stone-200 rounded-md text-stone-900 shadow"
          side="bottom"
        >
          <div className="text-l4">{tooltipContent.willingness}</div>

          {/* <div className="text-l3 font-semibold">TEE Attestation</div>
          <div className="flex items-start justify-between gap-4 h-full">
            <div className="space-y-1">
              <div className="text-l4">
                From Agent:{" "}
                <span className="font-mono">
                  {shortenAddress(agentAddress)}
                </span>
              </div>
              <div className="text-l4">
                From Phala Network:{" "}
                <span className="font-mono">
                  {shortenAddress(networkAddress)}
                </span>
              </div>
            </div>
            {isMatched && (
              <div className="flex gap-1.5 text-l4 h-full items-center">
                <svg
                  width="9"
                  height="32"
                  viewBox="0 0 9 32"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  className="text-stone-400"
                >
                  <path
                    d="M1 1H4V31H1"
                    stroke="currentColor"
                    strokeWidth="1.25"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M8 16.625C8.34518 16.625 8.625 16.3452 8.625 16C8.625 15.6548 8.34518 15.375 8 15.375V16.625ZM4 16.625H8V15.375H4V16.625Z"
                    fill="currentColor"
                  />
                </svg>

                <span className="text-l4 !leading-none text-stone-400">
                  Matched
                </span>
              </div>
            )}
          </div> */}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
