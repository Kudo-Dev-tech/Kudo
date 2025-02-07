import { Badge } from "@/components/ui/badge";
import { Status } from "@/lib/types/cnft";
import { cn } from "@/lib/utils";
import { Clock, CircleCheck, Zap } from "lucide-react";

interface StatusBadgeProps {
  status: Status;
  className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  let badgeClass = "";
  let icon: React.ReactNode;
  if (status === Status.Minted) {
    badgeClass = "bg-cyan-50 text-cyan-500 border-cyan-500";
    icon = <Zap className="size-3 fill-cyan-500 text-cyan-50" />;
  } else if (status === Status.Ongoing) {
    badgeClass = "bg-orange-50 text-orange-500 border-orange-500";
    icon = <Clock className="size-3 fill-orange-500 text-orange-50" />;
  } else if (status === Status.Completed) {
    badgeClass = "bg-green-50 text-green-500 border-green-500";
    icon = <CircleCheck className="size-3 fill-green-500 text-green-50" />;
  }

  return (
    <Badge
      variant="outline"
      className={cn(badgeClass, "capitalize border-[.25px] pl-1", className)}
    >
      {icon}
      {status}
    </Badge>
  );
}
