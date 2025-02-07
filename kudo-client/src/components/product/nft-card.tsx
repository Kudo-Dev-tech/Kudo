import { ExternalLink } from "lucide-react";

import { cn, getBlockExplorerLink, shortenAddress } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { Badge } from "../ui/badge";
import { LabelText } from "@/components/label-text";
import { CategoryBadge } from "./badges/category-badge";
import { StatusBadge } from "./badges/status-badge";
import { VerifiedBadge } from "./badges/verified-badge";
import { HolderBadge } from "./badges/holder-badge";
import AbilityBadge from "./badges/ability-badge";

type CardProps = React.ComponentProps<typeof Card>;

import { CovenantDetails } from "@/lib/types/cnft";
import Link from "next/link";
import { formatUnits } from "ethers";
import { Status, Category } from "@/lib/types/cnft";
import { usePurchaseNft } from "@/hooks/use-purchase-nft";
import { useCovenantInfo } from "@/hooks/use-covenant-info";
import { useState } from "react";

export function NftCard({
  className,
  covenantDetails,
  ...props
}: CardProps & { covenantDetails: CovenantDetails }) {
  const chainId = parseInt(process.env.NEXT_PUBLIC_CHAIN_ID as string);
  const cnftAddress = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS as string;
  const [nonce, setNonce] = useState(0);
  const { handlePurchase, isLoading } = usePurchaseNft(() => {
    setNonce(nonce + 1);
  });

  const { covenantInfo, isLoading: isCovenantLoading } = useCovenantInfo({
    contractAddress: cnftAddress as `0x${string}`,
    chainId,
    nftId: covenantDetails.nftId.toString(),
    nonce,
  });

  const displayData = {
    owner: isCovenantLoading
      ? covenantDetails.owner
      : covenantInfo?.owner || covenantDetails.owner,
    nftType: isCovenantLoading
      ? covenantDetails.nftType
      : covenantInfo?.nftType || covenantDetails.nftType,
    status: isCovenantLoading
      ? covenantDetails.status
      : covenantInfo?.status || covenantDetails.status,
    agentWallet: isCovenantLoading
      ? covenantDetails.agentWallet
      : covenantInfo?.agentWallet || covenantDetails.agentWallet,
    parentGoalId: isCovenantLoading
      ? covenantDetails.parentGoalId
      : covenantInfo?.parentGoalId || covenantDetails.parentGoalId,
    price: isCovenantLoading
      ? covenantDetails.price
      : covenantInfo?.price || covenantDetails.price,
    openseaLink: isCovenantLoading
      ? covenantDetails.openseaLink
      : covenantInfo?.openseaLink || covenantDetails.openseaLink,
  };

  const onPurchaseClick = async () => {
    try {
      await handlePurchase(
        covenantDetails.nftId,
        covenantDetails.price,
        covenantDetails.asset,
        cnftAddress,
      );
    } catch (error) {
      console.error("Purchase failed:", error);
    }
  };

  return (
    <Card
      id={`nft-${covenantDetails.nftId}`}
      className={cn(
        "w-full target:animate-target-fade target:border-orange-200",
        className,
      )}
      {...props}
    >
      <CardHeader className="flex flex-row justify-between gap-4 items-center mx-1">
        <div className="flex gap-2 items-center">
          <CategoryBadge category={covenantDetails.nftType} />
          <span className="text-stone-600 text-l4 font-mono">
            #{covenantDetails.nftId}
          </span>
        </div>
        <StatusBadge status={covenantDetails.status} />
      </CardHeader>
      <CardContent className="grid gap-4">
        <div className="flex flex-wrap gap-x-4 px-2 min-h-[152px] gap-y-4 h-full">
          <LabelText
            label="Covenant"
            text={covenantDetails.goal}
            textClassName="text-l2"
            className="w-full h-fit gap-1"
          />
          <LabelText label="Ask" className="xs:w-[calc(50%-1rem)]">
            <Badge className="w-fit h-fit" href={covenantDetails.ask.href}>
              {covenantDetails.ask.label}
            </Badge>
          </LabelText>
          <LabelText label="Settlement" className="xs:w-[calc(50%-1rem)]">
            <Badge
              className="w-fit h-fit"
              href={covenantDetails.settlement.href}
            >
              {covenantDetails.settlement.label}
            </Badge>
          </LabelText>
        </div>
        <div className="flex flex-col gap-4 rounded-[.5rem] border p-4 bg-white">
          <LabelText
            label={`${covenantDetails.agentName}`}
            labelClassName="text-l1 font-mono text-stone-800 font-semibold"
            variant="horizontal"
            className="w-full"
          />
          <div className="flex flex-col xs:flex-row flex-wrap gap-4">
            <LabelText
              label="ID"
              variant="vertical"
              className="w-full xs:w-[calc(50%-1rem)]"
              text={`${shortenAddress(covenantDetails.agentId.toString(), "id")}`}
              textClassName="font-mono text-l3 font-semibold text-stone-800"
            />
            <LabelText
              label="Address"
              variant="vertical"
              className="w-full xs:w-[calc(50%-1rem)]"
              text={shortenAddress(covenantDetails.agentWallet)}
              textHref={getBlockExplorerLink(
                chainId,
                covenantDetails.agentWallet,
              )}
              textClassName="font-mono text-l3 font-semibold"
            />
            <LabelText label="Willingness" className="xs:w-[calc(50%-1rem)]">
              <VerifiedBadge
                className="w-fit h-fit"
                agentAddress="0x1234567890"
                networkAddress="0x1234567890"
              />
            </LabelText>
            <LabelText label="Ability" className="xs:w-[calc(50%-1rem)]">
              <AbilityBadge
                ability={formatUnits(covenantDetails.abilityScore, 18)}
              />
            </LabelText>
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex flex-col gap-3">
        <hr className="w-full border-stone-200" />
        <LabelText label="Holder" variant="horizontal" className="w-full px-2">
          <HolderBadge
            owner={displayData.owner}
            nftType={displayData.nftType}
            status={displayData.status}
            agentWallet={displayData.agentWallet}
            parentGoalId={displayData.parentGoalId}
          />
        </LabelText>
        {displayData.status !== Status.Minted ? (
          <Link
            href={displayData.openseaLink}
            target="_blank"
            className="w-full"
          >
            <Button
              variant="outline"
              className="!shadow-xs w-full text-l3 bg-white rounded-lg"
            >
              Trade on OpenSea <ExternalLink />
            </Button>
          </Link>
        ) : (
          displayData.nftType === Category.Loan && (
            <Button
              variant="default"
              className="w-full text-l3 rounded-lg"
              isLoading={isLoading}
              onClick={onPurchaseClick}
              disabled={isLoading}
            >
              Buy for {formatUnits(displayData.price, 6)} USDC
            </Button>
            // TODO: get asset info from contract
          )
        )}
      </CardFooter>
    </Card>
  );
}
