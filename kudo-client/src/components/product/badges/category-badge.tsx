import { Badge } from "@/components/ui/badge";
import { Category } from "@/lib/types/cnft";
import { cn } from "@/lib/utils";

interface CategoryBadgeProps {
  category: Category;
  className?: string;
}

export function CategoryBadge({ category, className }: CategoryBadgeProps) {
  let badgeClass = "";
  if (category === Category.InfluenceA || category === Category.InfluenceB) {
    badgeClass = "bg-purple-100 text-purple-500";
  } else if (category === Category.Loan) {
    badgeClass = "bg-sky-100 text-sky-500";
  }

  return (
    <Badge
      variant="default"
      className={cn(badgeClass, "capitalize", className)}
    >
      {category === Category.Loan ? "Loan" : "Pact"}
    </Badge>
  );
}
