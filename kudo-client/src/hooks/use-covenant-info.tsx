import { useQuery } from "@tanstack/react-query";
import { cnftAbi } from "@/lib/abi/cnft";
import { getConfig } from "@/components/provider/wagmi-provider";
import { readContract } from "@wagmi/core";
import { Category, SimplifiedCovenantContract, Status } from "@/lib/types/cnft";
import { getNftMarketplaceLink, isSameAddress } from "@/lib/utils";

interface UseCovenantInfoParams {
  contractAddress?: `0x${string}`;
  chainId?: number;
  nftId?: string;
  nonce?: number;
}

interface CovenantInfo {
  owner: string | undefined;
  nftType: Category;
  status: Status;
  agentWallet: string;
  parentGoalId: bigint;
  nftMarketplaceLink?: string;
  price: bigint;
}

export const useCovenantInfo = (
  params: UseCovenantInfoParams,
): {
  covenantInfo?: CovenantInfo;
  isLoading: boolean;
  isError: boolean;
} => {
  const queryKey = [
    "covenant-info",
    params.contractAddress,
    params.chainId,
    params.nftId,
    params.nonce,
  ];

  const queryFn = async () => {
    if (!params.contractAddress || !params.chainId || !params.nftId) {
      return undefined;
    }

    if (!params.nonce) {
      params.nonce = 0;
    }

    const config = getConfig(params.chainId);
    const contract = {
      address: params.contractAddress,
      abi: cnftAbi,
      chainId: params.chainId,
    };

    try {
      const covenant = (await readContract(config, {
        ...contract,
        functionName: "getCovenant",
        args: [BigInt(params.nftId)],
      })) as SimplifiedCovenantContract;

      let owner;
      try {
        owner = (await readContract(config, {
          ...contract,
          functionName: "ownerOf",
          args: [BigInt(params.nftId)],
        })) as string;
      } catch (error) {
        console.error("Error reading ownerOf contract:", error);
        owner = undefined;
      }

      const isSelfParent = covenant.parentGoalId === BigInt(params.nftId);

      let nftType;
      if (covenant.nftType === 1) {
        nftType = Category.Loan;
      } else if (covenant.nftType === 0 && isSelfParent) {
        nftType = Category.PactA;
      } else if (covenant.nftType === 0 && !isSelfParent) {
        nftType = Category.PactB;
      }

      let status = Status.Ongoing;

      if (covenant.status === 1) {
        status = Status.Completed;
      } else if (
        (nftType === Category.Loan &&
          isSameAddress(covenant.agentWallet, owner || "")) ||
        (nftType !== Category.Loan &&
          isSelfParent &&
          covenant.subgoalsId.length === 0)
      ) {
        status = Status.Minted;
      }
      const nftMarketplaceLink = getNftMarketplaceLink(
        params.chainId,
        params.contractAddress,
        params.nftId,
      );

      return {
        owner,
        nftType: nftType as Category,
        status,
        agentWallet: covenant.agentWallet,
        parentGoalId: covenant.parentGoalId,
        nftMarketplaceLink,
        price: covenant.price,
      };
    } catch (error) {
      console.error("Error reading contract:", error);
      throw error;
    }
  };

  const { data, isLoading, isError } = useQuery({
    queryKey,
    queryFn,
  });

  return {
    covenantInfo: data,
    isLoading,
    isError,
  };
};
