"use client";

import { WagmiProvider, createConfig, http } from "wagmi";
import { sepolia, baseSepolia } from "wagmi/chains";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ConnectKitProvider, getDefaultConfig } from "connectkit";
import { ReactNode } from "react";
import { arcTestnet } from "@/lib/contracts";

const config = createConfig(
  getDefaultConfig({
    chains: [sepolia, arcTestnet, baseSepolia],
    transports: {
      [sepolia.id]: http("https://sepolia.gateway.tenderly.co"),
      [arcTestnet.id]: http("https://rpc.testnet.arc.network"),
      [baseSepolia.id]: http("https://sepolia.base.org"),
    },
    walletConnectProjectId: process.env.NEXT_PUBLIC_WC_PROJECT_ID || "",
    appName: "Department of Predictions",
    appDescription:
      "Decentralized AI Oracle for Prediction Market Settlement",
    appUrl: "https://departmentofpredictions.com",
    appIcon: "https://departmentofpredictions.com/logo.png",
  })
);

const queryClient = new QueryClient();

export function Web3Provider({ children }: { children: ReactNode }) {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <ConnectKitProvider mode="dark">{children}</ConnectKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
