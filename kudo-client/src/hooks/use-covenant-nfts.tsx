import { useQuery } from "@tanstack/react-query";
import { cnftAbi } from "@/lib/abi/cnft";
import { useMemo } from "react";
import { getConfig } from "@/components/provider/wagmi-provider";
import { multicall, readContract } from "@wagmi/core";
import {
  Category,
  CovenantDetails,
  CovenantDetailsContract,
  SimplifiedCovenantContract,
  Status,
} from "@/lib/types/cnft";
import { getNftMarketplaceLink, isSameAddress } from "@/lib/utils";
import { usePrivy } from "@privy-io/react-auth";
import { erc20Abi } from "viem";

interface UseCovenantNftsParams {
  contractAddress?: `0x${string}`;
  chainId?: number;
  filterBelow?: number;
  filters: {
    status: Set<string>;
    category: Set<string>;
    showOnlyMine: boolean;
  };
}

interface UseCovenantNftsResponse {
  covenantNfts: CovenantDetails[];
  isFetching: boolean;
  isFetched: boolean;
  isError: boolean;
}

export const useCovenantNfts = (
  params: UseCovenantNftsParams,
): UseCovenantNftsResponse => {
  const { user } = usePrivy();
  const userAddress = user?.wallet?.address;

  const queryKey = useMemo(
    () => [
      "covenants",
      params.contractAddress,
      params.chainId,
      params.filterBelow,
    ],
    [params.contractAddress, params.chainId, params.filterBelow],
  );

  const queryFn = useMemo(() => {
    return async () => {
      if (!params.contractAddress || params.chainId === undefined) {
        return [];
      }

      const config = getConfig(params.chainId);

      const contract = {
        address: params.contractAddress,
        abi: cnftAbi,
        chainId: params.chainId,
      };

      try {
        const result = (await readContract(config, {
          ...contract,
          functionName: "getCovenantsDetails",
        })) as CovenantDetailsContract[];

        const covenantNfts = (await Promise.all(
          result.map(async (covenant) => {
            const assetContract = {
              address: covenant.settlementAsset as `0x${string}`,
              abi: erc20Abi,
              chainId: params.chainId,
            };

            const assetResult = await multicall(config, {
              contracts: [
                {
                  ...assetContract,
                  functionName: "decimals",
                },
                {
                  ...assetContract,
                  functionName: "symbol",
                },
              ],
            });

            const asset = {
              address: covenant.settlementAsset,
              decimals: assetResult[0].result as number,
              symbol: assetResult[1].result as string,
            };

            const subgoalAgents = await Promise.all(
              covenant.subgoalsId.map(async (subgoalId) => {
                const subgoalData = (await readContract(config, {
                  ...contract,
                  functionName: "getCovenant",
                  args: [subgoalId],
                })) as SimplifiedCovenantContract;

                return subgoalData.agentId;
              }),
            );

            const isSelfParent = covenant.parentGoalId === covenant.nftId;

            let parentGoalAgent = "0x";
            if (covenant.parentGoalId !== covenant.nftId) {
              const parentData = (await readContract(config, {
                ...contract,
                functionName: "getCovenant",
                args: [covenant.parentGoalId],
              })) as SimplifiedCovenantContract;
              parentGoalAgent = parentData.agentId;
            }

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
                isSameAddress(covenant.agentWallet, covenant.owner)) ||
              (nftType !== Category.Loan &&
                isSelfParent &&
                covenant.subgoalsId.length === 0)
            ) {
              status = Status.Minted;
            }

            const ask = {
              label: "None",
              href: undefined,
            } as { label: string; href?: string };

            if (nftType === Category.Loan) {
              ask.label = "Purchase";
            } else if (nftType === Category.PactA && status === Status.Minted) {
              ask.label = "Mint cNFT";
            } else if (nftType === Category.PactA && status !== Status.Minted) {
              ask.label = `cNFT #${covenant.subgoalsId[0]}`;
              ask.href = `#nft-${covenant.subgoalsId[0]}`;
            }

            const settlement = {
              label: "Pending",
              href: undefined,
            } as { label: string; href?: string };

            if (nftType === Category.Loan && status === Status.Completed) {
              settlement.label = "Settled";
            } else if (
              nftType !== Category.Loan &&
              status === Status.Completed
            ) {
              settlement.label = "Settled";
            }

            const nftMarketplaceLink = getNftMarketplaceLink(
              params.chainId || 0,
              params.contractAddress || "",
              covenant.nftId.toString(),
            );

            return {
              ...covenant,
              nftType,
              status,
              asset,
              ask,
              subgoalsAgents: subgoalAgents,
              parentGoalAgent,
              settlement,
              nftMarketplaceLink,
            };
          }),
        )) as CovenantDetails[];

        return covenantNfts;
      } catch (error) {
        console.error("Error reading contract:", error);
        return [];
      }
    };
  }, [params.contractAddress, params.chainId]);

  const { data, isFetching, isFetched, isError } = useQuery({
    queryKey,
    queryFn,
    enabled: params.chainId !== undefined,
  });

  const filteredNfts = useMemo(() => {
    if (!data) return [];

    return data
      .filter((nft) => {
        if (params.filterBelow && nft.nftId < params.filterBelow) {
          return false;
        }

        const statusMap = {
          [Status.Ongoing]: "ongoing",
          [Status.Completed]: "completed",
          [Status.Minted]: "minted",
        };
        const nftStatus = statusMap[nft.status];
        const statusMatch = params.filters.status.has(nftStatus);
        if (!statusMatch) return false;

        let category = "Pact";
        if (nft.nftType === Category.Loan) {
          category = "Loan";
        }
        const categoryMatch = params.filters.category.has(category);
        if (!categoryMatch) return false;

        if (params.filters.showOnlyMine && userAddress) {
          if (!isSameAddress(nft.owner, userAddress)) {
            return false;
          }
        }

        return true;
      })
      .sort((a, b) => Number(b.nftId) - Number(a.nftId));
  }, [data, params.filters, userAddress, params.filterBelow]);

  return {
    covenantNfts: filteredNfts,
    isFetching,
    isFetched,
    isError,
  };
};
