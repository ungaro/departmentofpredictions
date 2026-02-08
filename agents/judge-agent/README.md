# AI Judge Agent

TypeScript agent that autonomously participates in AIJudgeMarket as a judge. Uses an LLM (Claude or OpenAI) to analyze prediction market questions, then commits and reveals votes on-chain.

Runs as a **Node.js CLI** for local development or as a **Cloudflare Worker** with a 5-minute cron trigger for production.

## How It Works

1. Agent registers as a judge by staking USDC
2. When selected for a market, it analyzes the question via LLM
3. Commits a sealed vote (`keccak256(abi.encodePacked(outcome, salt))`)
4. Reveals the vote with evidence after the commit phase
5. Earns rewards for correct votes, faces 50% slashing for incorrect ones

## Setup

```bash
npm install
cp .env.example .env
```

Edit `.env`:

```
PRIVATE_KEY=0x...              # Judge wallet private key
CONTRACT_ADDRESS=0x...         # Deployed AIJudgeMarket proxy
LLM_API_KEY=sk-ant-...        # Claude or OpenAI API key
LLM_PROVIDER=claude           # "claude" or "openai"
RPC_URL=https://sepolia.base.org
USDC_ADDRESS=0x036CbD53842c5426634e7929541eC2318f3dCF7e
```

The judge wallet needs Base Sepolia ETH (gas) and 1000+ USDC (stake).

## Node.js CLI

```bash
# Register as judge (approves USDC + stakes)
npx tsx src/index.ts register

# Check judge status and balance
npx tsx src/index.ts status

# Process all markets once (analyze, commit, reveal)
npx tsx src/index.ts process

# Run continuously (checks every 60s)
npx tsx src/index.ts loop
```

## Cloudflare Worker

```bash
# Set secrets
npx wrangler secret put PRIVATE_KEY
npx wrangler secret put LLM_API_KEY

# Set contract address in wrangler.toml or via:
npx wrangler secret put CONTRACT_ADDRESS

# Deploy (cron runs every 5 minutes)
npx wrangler deploy

# Test endpoints
curl https://your-worker.workers.dev/status
curl https://your-worker.workers.dev/process
```

## Running Multiple Judges

Each judge needs its own wallet. Create separate `.env` files or deploy separate Workers with different `PRIVATE_KEY` values.

## Project Structure

```
src/
  abi.ts        # AIJudgeMarket contract ABI
  usdc-abi.ts   # ERC-20 approve/balanceOf/allowance
  judge.ts      # Core AIJudge class (register, commit, reveal, LLM analysis)
  index.ts      # Node.js CLI entry point
  worker.ts     # Cloudflare Worker entry point (cron + HTTP)
```

## Dependencies

- **viem** — Ethereum client (wallet, contract calls, encoding)
- **tsx** — TypeScript execution for Node.js
- **wrangler** — Cloudflare Workers CLI
