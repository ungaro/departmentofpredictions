import { baseSepolia, sepolia } from "wagmi/chains";
import { defineChain } from "viem";

// ARC Testnet (custom chain, not in viem defaults)
export const arcTestnet = defineChain({
  id: 5042002,
  name: "ARC Testnet",
  nativeCurrency: { name: "ETH", symbol: "ETH", decimals: 18 },
  rpcUrls: {
    default: { http: ["https://rpc.testnet.arc.network"] },
  },
  blockExplorers: {
    default: { name: "ARC Explorer", url: "https://testnet.arcscan.app" },
  },
  testnet: true,
});

// Supported chains
export const SUPPORTED_CHAINS = [sepolia, arcTestnet, baseSepolia] as const;

// Default chain
export const CHAIN = sepolia;

// Same address on all chains (deployed via CreateX CREATE3)
export const AIJUDGE_ADDRESS =
  "0xF7b9e8C9675d0Dbdb280A117fDf5E39fc6fb9E04" as `0x${string}`;

export const AIJUDGE_ABI = [
  {
    type: "function",
    name: "getMarketCount",
    inputs: [],
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "getActiveJudgesCount",
    inputs: [],
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "getCourtJudgesCount",
    inputs: [{ name: "courtId", type: "uint256" }],
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "getMarket",
    inputs: [{ name: "marketId", type: "uint256" }],
    outputs: [
      {
        name: "",
        type: "tuple",
        components: [
          { name: "id", type: "uint256" },
          { name: "question", type: "string" },
          { name: "description", type: "string" },
          { name: "court", type: "uint256" },
          { name: "outcomeCount", type: "uint256" },
          { name: "status", type: "uint8" },
          { name: "outcome", type: "uint8" },
          { name: "createdAt", type: "uint256" },
          { name: "resolvedAt", type: "uint256" },
          { name: "challengeEnd", type: "uint256" },
        ],
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "getJudge",
    inputs: [{ name: "judge", type: "address" }],
    outputs: [
      {
        name: "",
        type: "tuple",
        components: [
          { name: "addr", type: "address" },
          { name: "stake", type: "uint256" },
          { name: "reputation", type: "uint256" },
          { name: "isActive", type: "bool" },
          { name: "isSuspended", type: "bool" },
          { name: "failCount", type: "uint256" },
          { name: "successCount", type: "uint256" },
          { name: "agentId", type: "uint256" },
        ],
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "getConfig",
    inputs: [],
    outputs: [
      {
        name: "",
        type: "tuple",
        components: [
          { name: "minStake", type: "uint256" },
          { name: "slashPercent", type: "uint256" },
          { name: "challengeBond", type: "uint256" },
          { name: "challengeWindow", type: "uint256" },
          { name: "revealWindow", type: "uint256" },
          { name: "minJudgesPerMarket", type: "uint256" },
        ],
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "getSelectedJudges",
    inputs: [{ name: "marketId", type: "uint256" }],
    outputs: [{ name: "", type: "address[]" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "isERC8004Enabled",
    inputs: [],
    outputs: [{ name: "", type: "bool" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "getERC8004Registries",
    inputs: [],
    outputs: [
      {
        name: "",
        type: "tuple",
        components: [
          { name: "identity", type: "address" },
          { name: "reputation", type: "address" },
          { name: "validation", type: "address" },
        ],
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "getAgentId",
    inputs: [{ name: "judge", type: "address" }],
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "getJudgeByAgentId",
    inputs: [{ name: "agentId", type: "uint256" }],
    outputs: [{ name: "", type: "address" }],
    stateMutability: "view",
  },
] as const;
