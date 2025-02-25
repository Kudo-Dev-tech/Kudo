import { arbitrum, sonic, inEVM } from "viem/chains";

export const SUPPORTED_CHAINS = {
  ARBITRUM: arbitrum,
  SONIC: sonic,
  INEVM: inEVM,
} as const;

export const CHAIN_CONTRACTS = {
  [arbitrum.id]: {
    covenantNFT: "0xCa00f3F52E52533434d9858759bf15f9916CD29d" as const,
  },
  [sonic.id]: {
    covenantNFT: "0x0061af49A7B8EBA20566088a15dD1E3F591f7d68" as const,
  },
  [inEVM.id]: {
    covenantNFT: "0x0E4Ed410765662D78F99249fe08c060d27242853" as const,
  },
} as const;

export type SupportedChainId = keyof typeof CHAIN_CONTRACTS;
export type ContractName = keyof (typeof CHAIN_CONTRACTS)[SupportedChainId];
export const SUPPORTED_CHAIN_IDS = Object.keys(CHAIN_CONTRACTS).map(Number);

export function getContractAddress(
  chainId: number | undefined,
  contractName: ContractName,
): `0x${string}` {
  const chain = chainId as SupportedChainId;
  if (!(chain in CHAIN_CONTRACTS)) {
    return CHAIN_CONTRACTS[arbitrum.id][contractName];
  }
  return CHAIN_CONTRACTS[chain][contractName];
}

export function getContractChainId(
  chainId: number | undefined,
): SupportedChainId {
  if (!chainId || !(chainId in CHAIN_CONTRACTS)) {
    return arbitrum.id;
  }
  return chainId as SupportedChainId;
}
