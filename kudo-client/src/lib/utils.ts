import { clsx, type ClassValue } from "clsx";
import { extendTailwindMerge } from "tailwind-merge";
import { arbitrum, baseSepolia, inEVM, sonic } from "viem/chains";

const twMerge = extendTailwindMerge({
  extend: {
    classGroups: {
      "font-size": ["text-l1", "text-l2", "text-l3", "text-l4"],
    },
    conflictingClassGroups: {
      "font-size": ["font-weight", "tracking"],
    },
  },
});

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function shortenAddress(
  addr: string,
  version: "short" | "long" | "id" | "extra-short" = "short",
): string {
  if (!addr) return addr;
  if (addr.length <= (version === "short" ? 6 : 10)) return addr;

  if (version === "id") {
    return `#${addr.slice(0, 4)}...${addr.slice(-4)}`;
  } else if (version === "short") {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  } else if (version === "long") {
    return `${addr.slice(0, 10)}...${addr.slice(-8)}`;
  } else if (version === "extra-short") {
    return `${addr.slice(0, 2)}...${addr.slice(-4)}`;
  } else {
    return addr;
  }
}

export const isSameAddress = (
  addressOne: string,
  addressTwo: string,
): boolean => {
  return addressOne.toLowerCase() === addressTwo.toLowerCase();
};

const blockExplorerLinkMap: { [key: number]: string } = {
  [arbitrum.id]: "https://arbiscan.io/address",
  [baseSepolia.id]: "https://sepolia.basescan.org/address",
  [sonic.id]: "https://sonicscan.org/address",
  [inEVM.id]: "https://inevm.calderaexplorer.xyz/address",
};

export const getBlockExplorerLink = (chainId: number, address: string) => {
  const baseUrl = blockExplorerLinkMap[chainId];
  return `${baseUrl}/${address}`;
};

const nftMarketplaceLinkMap: { [key: number]: string | undefined } = {
  [arbitrum.id]: "https://opensea.io/assets/arbitrum",
  [baseSepolia.id]: "https://testnets.opensea.io/assets/base-sepolia",
  [sonic.id]: undefined,
  [inEVM.id]: undefined,
};

export const getNftMarketplaceLink = (
  chainId: number,
  address: string,
  nftId: string,
) => {
  const baseUrl = nftMarketplaceLinkMap[chainId];
  if (!baseUrl) return undefined;
  return `${baseUrl}/${address}/${nftId}`;
};

export function getChainIdFromCAIP2(version: string): number {
  const match = version.match(/^eip155:(\d+)$/);
  return match ? parseInt(match[1], 10) : 0;
}
