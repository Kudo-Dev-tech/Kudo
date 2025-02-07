import React from "react";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { tooltipContent } from "@/lib/constants/tooltip";
import { Info } from "lucide-react";

interface AbilityBadgeProps {
  ability: string;
}

const AbilityBadge: React.FC<AbilityBadgeProps> = ({ ability }) => {
  const formattedAbility = parseFloat(ability).toFixed(2);

  return (
    <TooltipProvider delayDuration={100}>
      <Tooltip>
        <TooltipTrigger asChild>
          <Badge
            variant="outline"
            className="capitalize gap-0.5 hover:cursor-pointer w-fit h-fit"
          >
            {formattedAbility}
            <Info className="fill-stone-600 text-stone-50 size-3" />
          </Badge>
        </TooltipTrigger>
        <TooltipContent
          className="flex w-fit flex-col gap-2 p-4 bg-white border border-stone-200 rounded-md text-stone-900 shadow"
          side="bottom"
        >
          {/* <div className="text-l3 font-semibold">Ability Score</div> */}
          <div className="text-l4">{tooltipContent.ability}</div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export default AbilityBadge;
