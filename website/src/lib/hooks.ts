"use client";

import { useReadContract } from "wagmi";
import { AIJUDGE_ADDRESS, AIJUDGE_ABI, CHAIN } from "@/lib/contracts";

export function useMarketCount() {
  return useReadContract({
    address: AIJUDGE_ADDRESS,
    abi: AIJUDGE_ABI,
    functionName: "getMarketCount",
    chainId: CHAIN.id,
  });
}

export function useActiveJudgesCount() {
  return useReadContract({
    address: AIJUDGE_ADDRESS,
    abi: AIJUDGE_ABI,
    functionName: "getActiveJudgesCount",
    chainId: CHAIN.id,
  });
}

export function useCourtJudgesCount(courtId: bigint) {
  return useReadContract({
    address: AIJUDGE_ADDRESS,
    abi: AIJUDGE_ABI,
    functionName: "getCourtJudgesCount",
    chainId: CHAIN.id,
    args: [courtId],
  });
}

export function useMarket(marketId: bigint) {
  return useReadContract({
    address: AIJUDGE_ADDRESS,
    abi: AIJUDGE_ABI,
    functionName: "getMarket",
    chainId: CHAIN.id,
    args: [marketId],
  });
}

export function useJudge(address: `0x${string}`) {
  return useReadContract({
    address: AIJUDGE_ADDRESS,
    abi: AIJUDGE_ABI,
    functionName: "getJudge",
    chainId: CHAIN.id,
    args: [address],
  });
}

export function useConfig() {
  return useReadContract({
    address: AIJUDGE_ADDRESS,
    abi: AIJUDGE_ABI,
    functionName: "getConfig",
    chainId: CHAIN.id,
  });
}

export function useSelectedJudges(marketId: bigint) {
  return useReadContract({
    address: AIJUDGE_ADDRESS,
    abi: AIJUDGE_ABI,
    functionName: "getSelectedJudges",
    chainId: CHAIN.id,
    args: [marketId],
  });
}
