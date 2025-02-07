import { Badge } from "@/components/ui/badge";
import { Category, Status } from "@/lib/types/cnft";
import {
  cn,
  isSameAddress,
  shortenAddress,
  getBlockExplorerLink,
} from "@/lib/utils";
import { ArrowUpRight } from "lucide-react";
import Link from "next/link";
import { usePrivy } from "@privy-io/react-auth";

const BURNED_ADDRESS = "0x0000000000000000000000000000000000000000";

interface HolderBadgeProps {
  owner: string;
  nftType: Category;
  status: Status;
  agentWallet: string;
  parentGoalId?: bigint;
  className?: string;
}

export function HolderBadge({
  owner,
  status,
  agentWallet,
  nftType,
  className,
}: HolderBadgeProps) {
  const { user } = usePrivy();
  const chainId = parseInt(process.env.NEXT_PUBLIC_CHAIN_ID as string);
  const walletAddress = user?.wallet?.address || "";

  let displayText = "";
  const holderExplorerUrl = getBlockExplorerLink(chainId, owner);

  if (owner === BURNED_ADDRESS) {
    displayText = "Burned";
  } else if (isSameAddress(agentWallet, owner) && nftType === Category.Loan) {
    displayText = "Minter";
  } else if (isSameAddress(owner, walletAddress)) {
    displayText = "You";
  } else if (status === Status.Completed) {
    displayText = "Burned";
  } else {
    displayText = shortenAddress(owner);
  }

  return (
    <Link href={holderExplorerUrl} target="_blank">
      <Badge
        variant="outline"
        className={cn("text-blue-600 hover:text-blue-700 group", className)}
      >
        {displayText} <ArrowUpRight className="size-3 -ml-0.5" />
      </Badge>
    </Link>
  );
}
