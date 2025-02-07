import {
  arbitrum as arbitrumChain,
  // baseSepolia as baseSepoliaChain,
} from "viem/chains";

export const networks = {
  arbitrum: {
    ...arbitrumChain,
    iconUrl: "/images/chains/arbitrum.svg",
  },
  // baseSepolia: {
  //   ...baseSepoliaChain,
  //   iconUrl: "/images/chains/base-sepolia.svg",
  // },
};
