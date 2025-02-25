import {
  arbitrum as arbitrumChain,
  inEVM as inEVMChain,
  sonic as sonicChain,
} from "viem/chains";

export const networks = {
  sonic: {
    iconUrl: "/images/chains/sonic.svg",
    ...sonicChain,
  },
  arbitrum: {
    iconUrl: "/images/chains/arbitrum.svg",
    ...arbitrumChain,
  },
  inEVM: {
    iconUrl: "/images/chains/inevm.svg",
    ...inEVMChain,
  },
};

export function getNetworkByChainId(chainId: number) {
  const networkName = Object.keys(networks).find(
    (name) => networks[name as keyof typeof networks].id === chainId,
  );
  return networkName
    ? networks[networkName as keyof typeof networks]
    : undefined;
}
