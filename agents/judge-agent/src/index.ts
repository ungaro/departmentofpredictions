#!/usr/bin/env node
import { AIJudge } from "./judge.js";
import type { Hex, Address } from "viem";

// ============================================================
// Node.js CLI Entry Point
// ============================================================

const COMMANDS = ["register", "status", "process", "commit", "reveal", "loop"] as const;

function env(key: string, fallback?: string): string {
  const val = process.env[key] ?? fallback;
  if (!val) {
    console.error(`Missing env var: ${key}`);
    process.exit(1);
  }
  return val;
}

function createJudge(): AIJudge {
  return new AIJudge({
    privateKey: env("PRIVATE_KEY") as Hex,
    contractAddress: env("CONTRACT_ADDRESS") as Address,
    usdcAddress: env("USDC_ADDRESS", "0x036CbD53842c5426634e7929541eC2318f3dCF7e") as Address,
    rpcUrl: env("RPC_URL", "https://sepolia.base.org"),
    llmApiKey: env("LLM_API_KEY", ""),
    llmProvider: (env("LLM_PROVIDER", "claude") as "claude" | "openai"),
  });
}

async function main() {
  const command = process.argv[2] as (typeof COMMANDS)[number] | undefined;

  if (!command || !COMMANDS.includes(command)) {
    console.log(`
AIJudge Agent — TypeScript CLI

Usage: npx tsx src/index.ts <command>

Commands:
  register   Register as judge (requires USDC)
  status     Show judge status and balance
  process    Check all markets and act on any that need attention
  commit     Commit vote for a specific market
  reveal     Reveal vote for a specific market
  loop       Run continuously, checking every 60 seconds

Environment Variables:
  PRIVATE_KEY         Your wallet private key (0x-prefixed)
  CONTRACT_ADDRESS    AIJudgeMarket proxy address
  LLM_API_KEY         Claude or OpenAI API key
  LLM_PROVIDER        "claude" (default) or "openai"
  RPC_URL             RPC endpoint (default: Base Sepolia)
  USDC_ADDRESS        USDC token address
`);
    return;
  }

  const judge = createJudge();

  switch (command) {
    case "register": {
      const stakeUsdc = parseInt(process.argv[3] ?? "1000", 10);
      const stakeAmount = BigInt(stakeUsdc) * 1000000n; // USDC has 6 decimals
      await judge.registerAsJudge(stakeAmount);
      break;
    }

    case "status": {
      const info = await judge.getJudgeInfo();
      const balance = await judge.getUSDCBalance();
      const marketCount = await judge.getMarketCount();
      const statusNames = ["Inactive", "Active", "Suspended"];
      console.log(`
Address:        ${judge.address}
Status:         ${statusNames[info.status]}
Stake:          ${info.stake / 1000000n} USDC
USDC Balance:   ${balance / 1000000n} USDC
Reputation:     ${info.reputationScore}/10000
Successful:     ${info.successfulResolutions}
Failed:         ${info.failedResolutions}
Total Markets:  ${marketCount}
`);
      break;
    }

    case "process": {
      const logs = await judge.processMarkets();
      logs.forEach((l) => console.log(l));
      break;
    }

    case "commit": {
      const marketId = BigInt(process.argv[3] ?? "0");
      const outcome = (process.argv[4] ?? "yes") as "yes" | "no";
      await judge.commitVote(marketId, outcome);
      break;
    }

    case "reveal": {
      const marketId = BigInt(process.argv[3] ?? "0");
      const outcome = (process.argv[4] ?? "yes") as "yes" | "no";
      const salt = process.argv[5] as Hex | undefined;
      await judge.revealVote(marketId, outcome, salt);
      break;
    }

    case "loop": {
      const interval = parseInt(process.argv[3] ?? "60", 10) * 1000;
      console.log(`[loop] Starting judge loop (every ${interval / 1000}s)...`);
      while (true) {
        try {
          const logs = await judge.processMarkets();
          logs.forEach((l) => console.log(l));
        } catch (e) {
          console.error("[loop] Error:", (e as Error).message);
        }
        await new Promise((r) => setTimeout(r, interval));
      }
    }
  }
}

main().catch((e) => {
  console.error("Fatal error:", e);
  process.exit(1);
});
