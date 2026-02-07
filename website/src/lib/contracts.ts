import { baseSepolia } from "wagmi/chains";

export const CHAIN = baseSepolia;

export const AIJUDGE_ADDRESS = (process.env.NEXT_PUBLIC_CONTRACT_ADDRESS ||
  "0x0000000000000000000000000000000000000000") as `0x${string}`;

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
