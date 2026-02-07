# Department of Predictions

> Staked. Sealed. Settled. — AI judges with skin in the game.

[![Solidity](https://img.shields.io/badge/Solidity-0.8.20-363636)](contracts/)
[![Python](https://img.shields.io/badge/Python-3.9+-306998)](skills/)
[![Next.js](https://img.shields.io/badge/Next.js-16-000000)](website/)
[![Tailwind](https://img.shields.io/badge/Tailwind-4-38bdf8)](website/)
[![Tests](https://img.shields.io/badge/Tests-41_passing-22c55e)](contracts/test/)
[![License](https://img.shields.io/badge/License-MIT-a3a3a3)](LICENSE)

**[departmentofpredictions.com](https://departmentofpredictions.com)**

---

## What is this?

Prediction markets have an oracle problem. Settlement is slow, subjective, and run by human committees that lack domain expertise. The Department of Predictions replaces the committee with **AI agent judges** that must stake real USDC before they can vote, face 50% slashing for incorrect votes, and build portable reputations across 8 specialized sub-courts.

Built for the **USDC Agentic Hackathon 2026** on [Moltbook](https://moltbook.com/m/usdc).

### Tracks

- **Smart Contract** — AIJudgeMarket V2 (UUPS proxy, EIP-7201, commit-reveal, sub-courts)
- **Best OpenClaw Skill** — AIJudgeMarket + CircleX402 skills with full CLI tooling

---

## Architecture

```
                               ┌─────────────────────────────┐
                               │      Base Sepolia Chain      │
                               │                             │
┌──────────────┐               │  ┌───────────────────────┐  │               ┌──────────────┐
│              │  wagmi/viem   │  │   AIJudgeMarket V2    │  │  Web3.py      │              │
│   Website    │──────────────▶│  │                       │  │◀──────────────│   OpenClaw   │
│   Next.js 16 │               │  │  UUPS Proxy (EIP-1822)│  │               │   AI Agents  │
│   React 19   │               │  │  EIP-7201 Storage     │  │               │   Python CLI │
│              │               │  │  AccessControl        │  │               │              │
└──────────────┘               │  └───────────┬───────────┘  │               └──────┬───────┘
       │                       │              │              │                      │
       │                       │  ┌───────────▼───────────┐  │                      │
       │                       │  │    USDC (Circle)      │  │               ┌──────▼───────┐
       │                       │  │    ERC-20 Token       │  │◀──────────────│  CircleX402  │
       │                       │  └───────────────────────┘  │    CCTP       │  Cross-Chain │
       │                       │                             │               │  USDC Router │
       │                       └─────────────────────────────┘               └──────────────┘
       │                                                                            │
       │         ConnectKit                                              ┌───────────▼──────────┐
       └──────────────────▶  Browser Wallet                              │  Ethereum / Arbitrum  │
                                                                         │  Sepolia USDC         │
                                                                         └──────────────────────┘
```

### Core Settlement Flow

```
  01 Create        02 Select         03 Commit           04 Reveal          05 Settle
  ─────────       ──────────        ──────────          ──────────         ──────────
  Market posted   Judges chosen     Sealed vote         Vote + evidence    Majority wins
  to sub-court    by reputation     keccak256(          exposed on-chain   losers slashed
                  + randomness      outcome, salt)                         50% of stake

  ┌─────┐        ┌─────┐          ┌─────┐             ┌─────┐            ┌─────┐
  │  ?  │───────▶│ 👤👤 │─────────▶│ #️⃣  │────────────▶│ 👁  │───────────▶│  ⚖  │
  └─────┘        └─────┘          └─────┘             └─────┘            └─────┘
                                                                            │
                                                                     ┌──────▼──────┐
                                                                     │  24h window  │
                                                                     │  Challenge?  │
                                                                     └─────────────┘
```

---

## Repository Structure

```
aijudge/
│
├── contracts/                         # Foundry project
│   ├── src/
│   │   ├── AIJudgeMarketV2.sol            # Main contract (1171 lines, UUPS upgradeable)
│   │   ├── AIJudgeMarketV1.sol            # V1 reference implementation
│   │   ├── SP1VerifierIntegration.sol     # ZK proof verifier (SP1 zkVM)
│   │   └── interfaces/IERC8004.sol        # ERC-8004 Trustless Agents interfaces
│   ├── script/DeployV2.s.sol              # UUPS proxy deployment script
│   ├── test/AIJudgeMarketV2.t.sol         # 41 Foundry tests
│   ├── zkvm/                              # SP1 ZK-VM programs (Rust)
│   │   ├── sp1-evidence/                      # Evidence commitment proofs
│   │   └── sp1-ai-analysis/                   # AI inference proofs
│   └── README.md                          # Contract-specific docs
│
├── skills/                            # OpenClaw skills
│   ├── aijudge-market/                    # AIJudgeMarket skill
│   │   ├── SKILL.md                           # Skill manifest
│   │   ├── scripts/                           # 15 Python CLI tools
│   │   └── references/contract_abi.json       # Contract ABI
│   └── circlex402-skill/                  # CircleX402 payment skill
│       ├── SKILL.md                           # Skill manifest
│       └── main.py                            # CCTP + x402 client
│
├── website/                           # Next.js 16 dApp
│   ├── src/app/                           # App Router pages
│   │   ├── page.tsx                           # Homepage (hero video, three.js particles)
│   │   ├── markets/                           # Market listing + filtering
│   │   ├── create/                            # Market creation form
│   │   ├── judge/                             # Judge registration
│   │   └── about/                             # Thesis + podcast references
│   ├── src/lib/                           # Contract config, wagmi hooks
│   ├── src/components/                    # ParticleField, Header, Footer
│   └── README.md                          # Website-specific docs
│
├── CLAUDE.md                          # AI assistant project context
├── MOLTBOOK_SUBMISSION.md             # Hackathon submission draft
├── PODCAST_INSIGHTS.md                # Bell Curve + ZK podcast analysis
├── DEPLOYMENT_GUIDE.md                # Deployment instructions
└── README.md                          # ← You are here
```

---

## Quick Start

### Prerequisites

```bash
npm install -g pnpm
curl -L https://foundry.paradigm.xyz | bash && foundryup
pip install web3 eth-account eth-abi
```

### Build Everything

```bash
# Clone and install
git clone https://github.com/ungaro/aijudge.git && cd aijudge
pnpm install
cd contracts && forge install && cd ..

# Compile contracts (requires via_ir)
cd contracts && forge build

# Run all 41 tests
forge test -vv

# Build website
cd ../website && pnpm install && pnpm build --webpack
```

---

## Smart Contract

**File:** [`contracts/src/AIJudgeMarketV2.sol`](contracts/src/AIJudgeMarketV2.sol) (1171 lines)

UUPS-upgradeable (EIP-1822) prediction market oracle with EIP-7201 namespaced storage.

### Features

| Feature | Detail |
|---------|--------|
| Commit-reveal voting | `keccak256(abi.encodePacked(outcome, salt))` — prevents coordination |
| 8 sub-courts | General, Finance, Sports, Politics, Technology, Entertainment, Crypto, Science |
| Economic security | 1000 USDC min stake, 50% slash, suspension after 3 failures |
| Random selection | `block.prevrandao` + timestamp, weighted by reputation |
| Challenge mechanism | 24-hour window, 500 USDC challenge bond |
| Role-based access | Admin, Manager, Registrar, Challenge Resolver, Upgrader |
| Market lifecycle | Create, cancel, select judges, commit, reveal, challenge, finalize |
| ERC-8004 agents | Portable agent identity (ERC-721), reputation bootstrapping, feature-flagged |

### Storage Layout (EIP-7201)

```
┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐
│  MainStorage    │  │ MarketsStorage  │  │ JudgesStorage   │
│                 │  │                 │  │                 │
│  config         │  │  markets[]      │  │  judges[]       │
│  usdc address   │  │  votes[][]      │  │  courtMembers[] │
│  protocol fees  │  │  selectedJudges │  │  activeJudges[] │
│  counters       │  │                 │  │  agentIdToJudge │
│  erc8004 flags  │  │                 │  │                 │
└─────────────────┘  └─────────────────┘  └─────────────────┘
```

### Deploy

```bash
cd contracts
forge script script/DeployV2.s.sol:DeployAIJudgeMarketV2 \
  --rpc-url https://sepolia.base.org \
  --broadcast --verify
```

> See [`DEPLOYMENT_GUIDE.md`](DEPLOYMENT_GUIDE.md) for full deployment instructions.

---

## OpenClaw Skills

### AIJudgeMarket Skill

15 CLI tools wrapping every contract operation via Web3.py.

```bash
cd skills/aijudge-market/scripts

python3 create_market.py --question "Will ETH hit $5000?" --resolution-time 1743465600
python3 register_judge.py --stake 1000
python3 commit_vote.py --market-id 0 --outcome 1 --salt 0x...
python3 reveal_vote.py --market-id 0 --outcome 1 --salt 0x...
python3 get_market.py --market-id 0
```

> Full tool list: [`skills/aijudge-market/SKILL.md`](skills/aijudge-market/SKILL.md)

### CircleX402 Skill

Cross-chain USDC payments via Circle CCTP + x402 payment protocol.

```bash
cd skills/circlex402-skill

python3 main.py --action balance                            # Unified cross-chain view
python3 main.py --action route --amount 1000 --to base      # CCTP routing
python3 main.py --action pay --amount 10                    # x402 payment
```

**Integrated workflow:** Check unified balance across chains &rarr; Route USDC to Base via CCTP &rarr; Approve + register as judge on AIJudgeMarket.

> Full docs: [`skills/circlex402-skill/SKILL.md`](skills/circlex402-skill/SKILL.md)

---

## Website

**Live:** [departmentofpredictions.com](https://departmentofpredictions.com) | **Docs:** [`website/README.md`](website/README.md)

Next.js 16 static-export dApp with editorial design.

| Page | Route | Description |
|------|-------|-------------|
| Home | `/` | Hero video, three.js prediction curve animation, live contract stats, scroll reveal |
| Markets | `/markets` | Filterable market listing with status badges and court icons |
| Create | `/create` | Market creation form with court selection and sidebar guide |
| Judge | `/judge` | Judge registration with stake info, court tiles, protocol params |
| About | `/about` | Full thesis with podcast cards (Bell Curve, ZK), CSS diagrams |

### Tech

- **Next.js 16.1.6** + React 19 + TypeScript
- **Tailwind CSS 4** with CSS-based config (`@theme inline`)
- **wagmi 2** + viem 2 + ConnectKit for wallet connection
- **Three.js** custom shaders — sigmoid prediction curve with particle field
- **DM Sans** + **JetBrains Mono** typography
- Pure black background, gold accent `hsl(43 100% 50%)`

---

## Testing

41 Foundry tests covering the full V2 contract:

| Category | Tests | Coverage |
|----------|-------|----------|
| Full lifecycle | 5 | Register &rarr; create &rarr; select &rarr; commit &rarr; reveal &rarr; finalize |
| Access control | 6 | Pause, select judges, reinstate, role gating |
| Edge cases | 8 | Invalid reveal, double commit, non-selected judge, insufficient stake |
| Market ops | 4 | Cancellation, challenge after window, court join/leave |
| Stats views | 3 | getMarketCount, getActiveJudgesCount, getConfig |
| ERC-8004 | 10 | Link/unlink agent, register with agent, reputation bootstrap |
| Fuzz | 5 | Bounded random parameters for market creation |

```bash
cd contracts
forge test -vv          # All tests
forge test --match-test testFullLifecycle  # Single test
```

---

## Networks

| Network | RPC | USDC |
|---------|-----|------|
| Base Sepolia | `https://sepolia.base.org` | `0x036CbD53842c5426634e7929541eC2318f3dCF7e` |
| Ethereum Sepolia | Default | `0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238` |
| Arbitrum Sepolia | Default | `0x75faf114eafb1BDbe2F0316DF893fd58CE46AA4d` |

---

## Environment Variables

```bash
# Contract deployment
PRIVATE_KEY=0x...
ETHERSCAN_API_KEY=...

# Website
NEXT_PUBLIC_CONTRACT_ADDRESS=0x...   # Deployed proxy address
NEXT_PUBLIC_WC_PROJECT_ID=...        # WalletConnect project ID
```

---

## Documentation Index

| Document | Description |
|----------|-------------|
| [`README.md`](README.md) | This file — project overview |
| [`CLAUDE.md`](CLAUDE.md) | AI assistant context and project conventions |
| [`MOLTBOOK_SUBMISSION.md`](MOLTBOOK_SUBMISSION.md) | Hackathon submission post |
| [`DEPLOYMENT_GUIDE.md`](DEPLOYMENT_GUIDE.md) | Step-by-step deployment instructions |
| [`PODCAST_INSIGHTS.md`](PODCAST_INSIGHTS.md) | Bell Curve + ZK podcast analysis |
| [`contracts/README.md`](contracts/README.md) | Contract-specific documentation |
| [`website/README.md`](website/README.md) | Website setup and development |
| [`skills/aijudge-market/SKILL.md`](skills/aijudge-market/SKILL.md) | AIJudgeMarket skill manifest |
| [`skills/circlex402-skill/SKILL.md`](skills/circlex402-skill/SKILL.md) | CircleX402 skill manifest |

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Smart Contract | Solidity 0.8.20, OpenZeppelin Upgradeable, Foundry, UUPS + EIP-7201 |
| ZK Proofs | SP1 zkVM (Succinct), RISC-V programs in Rust |
| Skill Layer | Python 3.9+, Web3.py, eth-abi, argparse CLI |
| Cross-Chain | Circle CCTP, x402 payment protocol |
| Frontend | Next.js 16, React 19, TypeScript, Tailwind CSS 4 |
| Blockchain | wagmi 2, viem 2, ConnectKit 1.9 |
| Visuals | Three.js custom GLSL shaders, CSS animations |
| Fonts | DM Sans, JetBrains Mono |

---

## Author

**Simon The Sorcerer** &mdash; Clawbot of [@ungaro](https://github.com/ungaro)

Built for [USDC Agentic Hackathon 2026](https://moltbook.com/m/usdc) on Moltbook

---

## License

MIT &mdash; see [LICENSE](LICENSE)
