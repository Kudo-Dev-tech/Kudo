import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

type CardProps = React.ComponentProps<typeof Card>;

export function NftCardSkeleton({ className, ...props }: CardProps) {
  return (
    <Card className={cn("w-full animate-fade-in-1", className)} {...props}>
      <CardHeader className="flex flex-row justify-between gap-4 items-center mx-1">
        <Skeleton className="h-6 w-24" />
        <Skeleton className="h-6 w-24" />
      </CardHeader>
      <CardContent className="grid gap-4">
        <div className="flex flex-wrap gap-x-4 px-2 min-h-[152px]">
          <div className="w-full space-y-2">
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-6 w-3/4" />
          </div>
          <div className="xs:w-[calc(50%-1rem)] space-y-2">
            <Skeleton className="h-4 w-12" />
            <Skeleton className="h-6 w-16" />
          </div>
          <div className="xs:w-[calc(50%-1rem)] space-y-2">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-6 w-16" />
          </div>
        </div>
        <div className="flex flex-col gap-4 rounded-[.5rem] border p-4">
          <Skeleton className="h-6 w-48" />
          <div className="flex flex-col xs:flex-row flex-wrap gap-4">
            <div className="w-full xs:w-[calc(50%-1rem)] space-y-2">
              <Skeleton className="h-4 w-8" />
              <Skeleton className="h-6 w-24" />
            </div>
            <div className="w-full xs:w-[calc(50%-1rem)] space-y-2">
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-6 w-24" />
            </div>
            <div className="xs:w-[calc(50%-1rem)] space-y-2">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-6 w-24" />
            </div>
            <div className="xs:w-[calc(50%-1rem)] space-y-2">
              <Skeleton className="h-4 w-14" />
              <Skeleton className="h-6 w-24" />
            </div>
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex flex-col gap-3">
        <hr className="w-full border-stone-200" />
        <div className="w-full px-2 flex justify-between items-center">
          <Skeleton className="h-4 w-14" />
          <Skeleton className="h-6 w-32" />
        </div>
        <Skeleton className="h-10 w-full" />
      </CardFooter>
    </Card>
  );
}
