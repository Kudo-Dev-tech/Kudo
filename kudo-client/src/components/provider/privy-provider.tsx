"use client";

import { PrivyProvider } from "@privy-io/react-auth";
import { arbitrum } from "viem/chains";

export default function Providers({ children }: { children: React.ReactNode }) {
  const appId = process.env.NEXT_PUBLIC_PRIVY_APP_ID || "";
  return (
    <PrivyProvider
      appId={appId}
      config={{
        appearance: {
          accentColor: "#383838",
          theme: "#FFFFFF",
          showWalletLoginFirst: false,
          logo: "https://yezdnbgildkzwcgyzmjo.supabase.co/storage/v1/object/public/KUDO/kudo-logo.png?t=2025-01-23T16%3A58%3A28.012Z",
          walletChainType: "ethereum-only",
        },
        defaultChain: arbitrum,
        supportedChains: [arbitrum],
        loginMethods: ["wallet"],
        fundingMethodConfig: {
          moonpay: {
            useSandbox: true,
          },
        },
        embeddedWallets: {
          createOnLogin: "users-without-wallets",
          requireUserPasswordOnCreate: false,
          showWalletUIs: true,
        },
        mfa: {
          noPromptOnMfaRequired: false,
        },
      }}
    >
      {children}
    </PrivyProvider>
  );
}
