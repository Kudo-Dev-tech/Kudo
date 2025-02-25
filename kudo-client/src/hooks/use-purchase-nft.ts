import { useState } from "react";
import {
  useAccount,
  useWriteContract,
  useWaitForTransactionReceipt,
} from "wagmi";
import { erc20Abi } from "viem";
import { cnftAbi } from "@/lib/abi/cnft";
import { useToast } from "@/hooks/use-toast";
import { useWallets } from "@privy-io/react-auth";
import { useQueryClient } from "@tanstack/react-query";
import { getChainIdFromCAIP2 } from "@/lib/utils";
import { getContractChainId } from "@/constants/contracts";
import { getNetworkByChainId } from "@/lib/networks";

export function usePurchaseNft(onPurchaseSuccess: () => void) {
  const { wallets } = useWallets();
  const contractChainId = getContractChainId(
    getChainIdFromCAIP2(wallets[0].chainId),
  );
  const [isLoading, setIsLoading] = useState(false);
  const { address } = useAccount();
  const queryClient = useQueryClient();
  const isInWrongNetwork =
    getChainIdFromCAIP2(wallets[0].chainId) !== contractChainId;

  const { writeContractAsync: approve } = useWriteContract();
  const { writeContractAsync: purchase } = useWriteContract();
  const { toast } = useToast();

  const [approveHash, setApproveHash] = useState<`0x${string}` | undefined>();
  const [purchaseHash, setPurchaseHash] = useState<`0x${string}` | undefined>();

  const { isLoading: isApproveConfirming, error: approveError } =
    useWaitForTransactionReceipt({
      hash: approveHash,
    });

  if (approveError) {
    console.error(approveError);
  }

  const { isLoading: isPurchaseConfirming } = useWaitForTransactionReceipt({
    hash: purchaseHash,
  });

  const handlePurchase = async (
    nftId: bigint,
    price: bigint,
    tokenAddress: string,
    cnftAddress: string,
  ) => {
    if (!address) {
      toast({
        variant: "destructive",
        title: "Wallet not connected",
        description: "Please connect your wallet to make a purchase",
      });
      return;
    }

    if (isInWrongNetwork) {
      toast({
        title: "Wrong Network",
        description: `Please switch to the ${getNetworkByChainId(contractChainId)?.name} network to make a purchase`,
        variant: "destructive",
      });
      return;
    }

    try {
      setIsLoading(true);

      const approveTx = await approve({
        address: tokenAddress as `0x${string}`,
        abi: erc20Abi,
        functionName: "approve",
        args: [cnftAddress as `0x${string}`, price],
      });

      setApproveHash(approveTx);
      toast({
        title: "Approving USDC...",
        description: "Please wait while we process your approval",
      });

      await new Promise((resolve) => setTimeout(resolve, 1000));

      toast({
        title: "Approval Successful",
        description: "USDC approval confirmed",
      });

      const purchaseTx = await purchase({
        address: cnftAddress as `0x${string}`,
        abi: cnftAbi,
        functionName: "purchase",
        args: [nftId],
      });

      setPurchaseHash(purchaseTx);
      toast({
        title: "Purchasing NFT...",
        description: "Please wait while we process your purchase",
      });

      toast({
        title: "Success!",
        description: "Successfully purchased NFT",
      });

      onPurchaseSuccess();

      await queryClient.invalidateQueries({
        queryKey: ["covenant-info"],
      });
    } catch (err) {
      console.error("Purchase error:", err);
      let errorMessage = "Failed to purchase NFT. Please try again.";

      if (err instanceof Error) {
        if (err.message.includes("rejected")) {
          errorMessage = "User rejected the transaction. Please try again.";
        } else if (err.message.includes("insufficient")) {
          errorMessage = "Insufficient balance to complete the purchase.";
        } else if (err.message.includes("USDC approval")) {
          errorMessage = err.message;
        } else if (err.message.includes("NFT purchase")) {
          errorMessage = err.message;
        }
      }

      toast({
        variant: "destructive",
        title: "Error",
        description: errorMessage,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return {
    handlePurchase,
    isLoading: isLoading || isApproveConfirming || isPurchaseConfirming,
  };
}
