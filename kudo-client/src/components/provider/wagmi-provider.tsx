"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { WagmiProvider, createConfig } from "@privy-io/wagmi";
import { http } from "wagmi";
import { arbitrum, baseSepolia, Chain } from "viem/chains";

const config = createConfig({
  chains: [baseSepolia, arbitrum],
  transports: {
    [baseSepolia.id]: http(),
    [arbitrum.id]: http(),
  },
});

const createCustomConfig = (chain: Chain) =>
  createConfig({
    chains: [chain],
    transports: {
      [chain.id]: http(),
    },
    ssr: true,
  });

export const getConfig = (chainId: number | undefined) => {
  switch (chainId) {
    case baseSepolia.id:
      return createCustomConfig(baseSepolia);
    case arbitrum.id:
      return createCustomConfig(arbitrum);
    default:
      return createCustomConfig(baseSepolia);
  }
};

const queryClient = new QueryClient();

export default function WagmiProviderWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <QueryClientProvider client={queryClient}>
      <WagmiProvider config={config}>{children}</WagmiProvider>
    </QueryClientProvider>
  );
}
