import { AIJudge } from "./judge.js";
import type { Hex, Address } from "viem";

// ============================================================
// Cloudflare Worker Entry Point
// ============================================================

interface Env {
  PRIVATE_KEY: string;
  CONTRACT_ADDRESS: string;
  USDC_ADDRESS: string;
  RPC_URL: string;
  LLM_API_KEY: string;
  LLM_PROVIDER: string;
}

function createJudge(env: Env): AIJudge {
  return new AIJudge({
    privateKey: env.PRIVATE_KEY as Hex,
    contractAddress: env.CONTRACT_ADDRESS as Address,
    usdcAddress: (env.USDC_ADDRESS || "0x036CbD53842c5426634e7929541eC2318f3dCF7e") as Address,
    rpcUrl: env.RPC_URL || "https://sepolia.base.org",
    llmApiKey: env.LLM_API_KEY,
    llmProvider: (env.LLM_PROVIDER || "claude") as "claude" | "openai",
  });
}

export default {
  // Cron trigger — runs every 5 minutes (configured in wrangler.toml)
  async scheduled(
    _event: ScheduledEvent,
    env: Env,
    ctx: ExecutionContext
  ): Promise<void> {
    const judge = createJudge(env);
    const logs = await judge.processMarkets();
    console.log(logs.join("\n"));
  },

  // HTTP trigger — for manual checks or webhooks
  async fetch(
    request: Request,
    env: Env,
    _ctx: ExecutionContext
  ): Promise<Response> {
    const url = new URL(request.url);
    const judge = createJudge(env);

    if (url.pathname === "/status") {
      const info = await judge.getJudgeInfo();
      const balance = await judge.getUSDCBalance();
      return Response.json({
        address: judge.address,
        status: ["Inactive", "Active", "Suspended"][info.status],
        stake: `${info.stake / 1000000n} USDC`,
        balance: `${balance / 1000000n} USDC`,
        reputation: Number(info.reputationScore),
      });
    }

    if (url.pathname === "/process") {
      const logs = await judge.processMarkets();
      return Response.json({ logs });
    }

    return new Response(
      JSON.stringify({
        name: "AIJudge Agent",
        endpoints: ["/status", "/process"],
      }),
      { headers: { "Content-Type": "application/json" } }
    );
  },
};
