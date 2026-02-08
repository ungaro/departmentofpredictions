import {
  createPublicClient,
  createWalletClient,
  http,
  keccak256,
  encodePacked,
  toHex,
  type Address,
  type Hex,
  type Account,
  type PublicClient,
  type WalletClient,
  type Transport,
  type Chain,
} from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { baseSepolia } from "viem/chains";
import { AIJudgeABI } from "./abi.js";
import { ERC20ABI } from "./usdc-abi.js";

// ============================================================
// Types
// ============================================================

export interface JudgeConfig {
  privateKey: Hex;
  contractAddress: Address;
  usdcAddress: Address;
  rpcUrl: string;
  llmApiKey: string;
  llmProvider: "claude" | "openai";
  chain?: Chain;
}

interface MarketData {
  question: string;
  resolutionTime: bigint;
  creator: Address;
  status: number;
  outcome: number;
  requiredJudges: bigint;
  courtId: bigint;
}

interface JudgeData {
  stake: bigint;
  status: number;
  reputationScore: bigint;
  failedResolutions: bigint;
  successfulResolutions: bigint;
}

interface LLMJudgment {
  outcome: "yes" | "no";
  confidence: number;
  rationale: string;
}

// ============================================================
// AI Judge Agent
// ============================================================

export class AIJudge {
  private publicClient: PublicClient<Transport, Chain>;
  private walletClient: WalletClient<Transport, Chain, Account>;
  private account: ReturnType<typeof privateKeyToAccount>;
  private config: JudgeConfig;

  // In-memory store for salts (in production, persist to KV or DB)
  private salts: Map<string, Hex> = new Map();

  constructor(config: JudgeConfig) {
    this.config = config;
    this.account = privateKeyToAccount(config.privateKey);

    const chain = config.chain ?? baseSepolia;

    this.publicClient = createPublicClient({
      chain,
      transport: http(config.rpcUrl),
    }) as PublicClient<Transport, Chain>;

    this.walletClient = createWalletClient({
      account: this.account,
      chain,
      transport: http(config.rpcUrl),
    }) as WalletClient<Transport, Chain, Account>;
  }

  get address(): Address {
    return this.account.address;
  }

  // ============================================================
  // Read Operations
  // ============================================================

  async getJudgeInfo(): Promise<JudgeData> {
    const result = await this.publicClient.readContract({
      address: this.config.contractAddress,
      abi: AIJudgeABI,
      functionName: "getJudge",
      args: [this.address],
    });
    return result as unknown as JudgeData;
  }

  async getMarket(marketId: bigint): Promise<MarketData> {
    const result = await this.publicClient.readContract({
      address: this.config.contractAddress,
      abi: AIJudgeABI,
      functionName: "getMarket",
      args: [marketId],
    });
    return result as unknown as MarketData;
  }

  async getMarketCount(): Promise<bigint> {
    return (await this.publicClient.readContract({
      address: this.config.contractAddress,
      abi: AIJudgeABI,
      functionName: "getMarketCount",
    })) as bigint;
  }

  async getSelectedJudges(marketId: bigint): Promise<Address[]> {
    return (await this.publicClient.readContract({
      address: this.config.contractAddress,
      abi: AIJudgeABI,
      functionName: "getSelectedJudges",
      args: [marketId],
    })) as Address[];
  }

  async isSelectedForMarket(marketId: bigint): Promise<boolean> {
    const judges = await this.getSelectedJudges(marketId);
    return judges.some(
      (j) => j.toLowerCase() === this.address.toLowerCase()
    );
  }

  async getUSDCBalance(): Promise<bigint> {
    return (await this.publicClient.readContract({
      address: this.config.usdcAddress,
      abi: ERC20ABI,
      functionName: "balanceOf",
      args: [this.address],
    })) as bigint;
  }

  // ============================================================
  // Write Operations
  // ============================================================

  async approveUSDC(amount: bigint): Promise<Hex> {
    const hash = await this.walletClient.writeContract({
      address: this.config.usdcAddress,
      abi: ERC20ABI,
      functionName: "approve",
      args: [this.config.contractAddress, amount],
    });
    await this.publicClient.waitForTransactionReceipt({ hash });
    return hash;
  }

  async registerAsJudge(stakeAmount: bigint): Promise<Hex> {
    // Check if already registered
    const judge = await this.getJudgeInfo();
    if (judge.status === 1) {
      console.log("[judge] Already registered, skipping");
      return "0x" as Hex;
    }

    // Approve USDC first
    console.log(`[judge] Approving ${stakeAmount / 1000000n} USDC...`);
    await this.approveUSDC(stakeAmount);

    // Register
    console.log(`[judge] Registering with ${stakeAmount / 1000000n} USDC stake...`);
    const hash = await this.walletClient.writeContract({
      address: this.config.contractAddress,
      abi: AIJudgeABI,
      functionName: "registerAsJudge",
      args: [stakeAmount],
    });
    await this.publicClient.waitForTransactionReceipt({ hash });
    console.log(`[judge] Registered! tx: ${hash}`);
    return hash;
  }

  async joinCourt(courtId: bigint): Promise<Hex> {
    const hash = await this.walletClient.writeContract({
      address: this.config.contractAddress,
      abi: AIJudgeABI,
      functionName: "joinCourt",
      args: [courtId],
    });
    await this.publicClient.waitForTransactionReceipt({ hash });
    console.log(`[judge] Joined court ${courtId}, tx: ${hash}`);
    return hash;
  }

  async commitVote(marketId: bigint, outcome: "yes" | "no"): Promise<Hex> {
    // Generate random salt
    const saltBytes = new Uint8Array(32);
    crypto.getRandomValues(saltBytes);
    const salt = toHex(saltBytes) as Hex;

    // Compute commit hash: keccak256(abi.encodePacked(outcome_uint8, salt_bytes32))
    const outcomeValue = outcome === "yes" ? 1 : 2;
    const commitHash = keccak256(
      encodePacked(["uint8", "bytes32"], [outcomeValue, salt])
    );

    // Store salt for reveal
    this.salts.set(`${marketId}`, salt);

    console.log(`[judge] Committing vote for market ${marketId}: ${outcome}`);
    const hash = await this.walletClient.writeContract({
      address: this.config.contractAddress,
      abi: AIJudgeABI,
      functionName: "commitVote",
      args: [marketId, commitHash],
    });
    await this.publicClient.waitForTransactionReceipt({ hash });
    console.log(`[judge] Vote committed! tx: ${hash}`);
    console.log(`[judge] Salt (save this!): ${salt}`);
    return hash;
  }

  async revealVote(
    marketId: bigint,
    outcome: "yes" | "no",
    salt?: Hex
  ): Promise<Hex> {
    const storedSalt = salt ?? this.salts.get(`${marketId}`);
    if (!storedSalt) throw new Error(`No salt found for market ${marketId}`);

    const outcomeValue = outcome === "yes" ? 1 : 2;
    const evidenceHash = "0x0000000000000000000000000000000000000000000000000000000000000000" as Hex;
    const rationaleHash = "0x0000000000000000000000000000000000000000000000000000000000000000" as Hex;

    console.log(`[judge] Revealing vote for market ${marketId}: ${outcome}`);
    const hash = await this.walletClient.writeContract({
      address: this.config.contractAddress,
      abi: AIJudgeABI,
      functionName: "revealVote",
      args: [marketId, outcomeValue, storedSalt, evidenceHash, rationaleHash],
    });
    await this.publicClient.waitForTransactionReceipt({ hash });
    console.log(`[judge] Vote revealed! tx: ${hash}`);

    // Clean up salt
    this.salts.delete(`${marketId}`);
    return hash;
  }

  // ============================================================
  // LLM Analysis
  // ============================================================

  async analyzeMarket(question: string): Promise<LLMJudgment> {
    const systemPrompt = `You are an AI judge for a decentralized prediction market. Your job is to evaluate whether a prediction market question has resolved YES or NO based on your knowledge.

Respond with ONLY a JSON object (no markdown, no code blocks):
{"outcome": "yes" or "no", "confidence": 0-100, "rationale": "brief explanation"}`;

    const userPrompt = `Has this prediction market question resolved? Answer based on available evidence:

"${question}"

If the event hasn't happened yet or you're unsure, make your best judgment based on current information.`;

    if (this.config.llmProvider === "claude") {
      return this.callClaude(systemPrompt, userPrompt);
    } else {
      return this.callOpenAI(systemPrompt, userPrompt);
    }
  }

  private async callClaude(
    system: string,
    user: string
  ): Promise<LLMJudgment> {
    const resp = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": this.config.llmApiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-5-20250929",
        max_tokens: 256,
        system,
        messages: [{ role: "user", content: user }],
      }),
    });

    const data = (await resp.json()) as {
      content: Array<{ type: string; text: string }>;
    };
    const text = data.content[0].text;
    return JSON.parse(text) as LLMJudgment;
  }

  private async callOpenAI(
    system: string,
    user: string
  ): Promise<LLMJudgment> {
    const resp = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${this.config.llmApiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: system },
          { role: "user", content: user },
        ],
        max_tokens: 256,
      }),
    });

    const data = (await resp.json()) as {
      choices: Array<{ message: { content: string } }>;
    };
    const text = data.choices[0].message.content;
    return JSON.parse(text) as LLMJudgment;
  }

  // ============================================================
  // Main Loop
  // ============================================================

  /**
   * Check all markets and process any that need action.
   * Call this periodically (e.g., every 5 minutes from CF Worker cron).
   */
  async processMarkets(): Promise<string[]> {
    const logs: string[] = [];
    const marketCount = await this.getMarketCount();
    logs.push(`[judge] ${this.address} checking ${marketCount} markets...`);

    for (let i = 0n; i < marketCount; i++) {
      try {
        const market = await this.getMarket(i);
        const isSelected = await this.isSelectedForMarket(i);

        if (!isSelected) continue;

        // MarketStatus: 0=Open, 1=Resolving, 2=Challenged, 3=Resolved
        if (market.status === 3) continue; // Already resolved

        if (market.status === 0 || market.status === 1) {
          // Check if we need to commit
          const vote = await this.publicClient.readContract({
            address: this.config.contractAddress,
            abi: AIJudgeABI,
            functionName: "getVote",
            args: [i, this.address],
          }) as { revealed: boolean; judge: Address };

          if (vote.judge === "0x0000000000000000000000000000000000000000") {
            // Haven't committed yet — analyze and commit
            logs.push(`[judge] Market ${i}: need to commit vote`);
            const judgment = await this.analyzeMarket(market.question);
            logs.push(
              `[judge] Market ${i}: LLM says ${judgment.outcome} (${judgment.confidence}% confidence)`
            );
            logs.push(`[judge] Rationale: ${judgment.rationale}`);

            await this.commitVote(i, judgment.outcome);
            logs.push(`[judge] Market ${i}: committed ${judgment.outcome}`);

            // Store judgment for reveal
            this.salts.set(`${i}_outcome`, judgment.outcome as unknown as Hex);
          } else if (!vote.revealed && this.salts.has(`${i}`)) {
            // Committed but not revealed — try to reveal
            logs.push(`[judge] Market ${i}: revealing vote...`);
            const outcome = (this.salts.get(`${i}_outcome`) as unknown as string) || "yes";
            await this.revealVote(i, outcome as "yes" | "no");
            logs.push(`[judge] Market ${i}: revealed!`);
          }
        }
      } catch (e) {
        const err = e as Error;
        logs.push(`[judge] Market ${i}: error - ${err.message}`);
      }
    }

    return logs;
  }
}
