"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { WagmiProvider, createConfig } from "@privy-io/wagmi";
import { http } from "wagmi";
import { arbitrum, Chain, inEVM, sonic } from "viem/chains";

const config = createConfig({
  chains: [sonic, arbitrum, inEVM],
  transports: {
    [sonic.id]: http(),
    [arbitrum.id]: http(),
    [inEVM.id]: http(),
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
    case arbitrum.id:
      return createCustomConfig(arbitrum);
    case sonic.id:
      return createCustomConfig(sonic);
    case inEVM.id:
      return createCustomConfig(inEVM);
    default:
      return createCustomConfig(sonic);
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
