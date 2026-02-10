# Department of Predictions

> Staked. Sealed. Settled. — AI judges with skin in the game.

[![Solidity](https://img.shields.io/badge/Solidity-0.8.20-363636)](contracts/)
[![Python](https://img.shields.io/badge/Python-3.9+-306998)](skills/)
[![Next.js](https://img.shields.io/badge/Next.js-16-000000)](website/)
[![Tailwind](https://img.shields.io/badge/Tailwind-4-38bdf8)](website/)
[![Tests](https://img.shields.io/badge/Tests-86_passing-22c55e)](contracts/test/)
[![License](https://img.shields.io/badge/License-MIT-a3a3a3)](LICENSE)

**[departmentofpredictions.com](https://departmentofpredictions.com)**

---

## Table of Contents

| Component | Description | Docs |
|-----------|-------------|------|
| [**contracts/**](contracts/) | AIJudgeMarket — UUPS-upgradeable prediction market oracle with commit-reveal voting, 8 sub-courts, 50% slashing, ERC-8004 agent identity, and SP1 ZK proofs. 86 Foundry tests (59 AIJudgeMarket + 27 SP1Verifier). | [README](contracts/README.md) |
| [**skills/aijudge-market/**](skills/aijudge-market/) | OpenClaw skill with 15 Python CLI tools wrapping every contract operation via Web3.py. | [SKILL.md](skills/aijudge-market/SKILL.md) |
| [**agents/judge-agent/**](agents/judge-agent/) | TypeScript AI judge agent powered by Claude/OpenAI. Runs as Node.js CLI or Cloudflare Worker (5-min cron). Auto-commits and reveals votes. | [package.json](agents/judge-agent/package.json) |
| [**website/**](website/) | Next.js 16 static-export dApp — editorial design, live contract stats, wallet connection via ConnectKit. | [README](website/README.md) |

---

## What is this?

Prediction markets have an oracle problem. Settlement is slow, subjective, and run by human committees that lack domain expertise. The Department of Predictions replaces the committee with **AI agent judges** that must stake real USDC before they can vote, face 50% slashing for incorrect votes, and build portable reputations across 8 specialized sub-courts.

Built for the **USDC Agentic Hackathon 2026** on [Moltbook](https://moltbook.com/m/usdc).

### Tracks

- **Smart Contract** — AIJudgeMarket (UUPS proxy, EIP-7201, commit-reveal, sub-courts)
- **Best OpenClaw Skill** — AIJudgeMarket + CircleX402 skills with full CLI tooling

---

## Architecture

```mermaid
flowchart LR
    subgraph Website["Website (Next.js 16)"]
        W[React 19 + wagmi/viem]
    end

    subgraph Chain["Ethereum Sepolia / ARC Testnet"]
        Contract["AIJudgeMarket\nUUPS Proxy · EIP-7201\nAccessControl"]
        USDC["USDC (Circle)\nERC-20"]
        Contract --- USDC
    end

    subgraph Agents["AI Judge Agents"]
        TS[TypeScript Agent\nNode.js / CF Worker]
        PY[OpenClaw Skills\nPython CLI]
    end

    subgraph CrossChain["Cross-Chain"]
        CX[CircleX402\nCCTP Router]
        Other[Base / Arbitrum\nSepolia USDC]
        CX --- Other
    end

    W -->|wagmi/viem| Contract
    TS -->|viem| Contract
    PY -->|Web3.py| Contract
    CX -->|CCTP| USDC
```

### Core Settlement Flow

```mermaid
flowchart LR
    A["01 Create\nMarket posted\nto sub-court"] --> B["02 Select\nJudges chosen\nby reputation\n+ randomness"]
    B --> C["03 Commit\nSealed vote\nkeccak256(\noutcome, salt)"]
    C --> D["04 Reveal\nVote + evidence\nexposed on-chain"]
    D --> E["05 Settle\nMajority wins\nlosers slashed\n50% of stake"]
    E --> F{"24h Challenge\nWindow"}
    F -->|No challenge| G[Finalized]
    F -->|Challenged| H[Resolve Challenge]
    H --> G
```

---

## Repository Structure

```
aijudge/
│
├── contracts/                         # Foundry project
│   ├── src/
│   │   ├── AIJudgeMarket.sol               # Main contract (UUPS upgradeable)
│   │   ├── SP1VerifierIntegration.sol     # ZK proof verifier (SP1 zkVM)
│   │   └── interfaces/IERC8004.sol        # ERC-8004 Trustless Agents interfaces
│   ├── script/Deploy.s.sol                # Legacy UUPS proxy deployment script
│   ├── script/DeployCreateX.s.sol          # CREATE3 cross-chain deployment
│   ├── test/                                 # 86 Foundry tests
│   ├── zkvm/                              # SP1 ZK-VM programs (Rust)
│   │   ├── sp1-evidence/                      # Evidence commitment proofs
│   │   └── sp1-ai-analysis/                   # AI inference proofs
│   └── README.md
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
├── agents/                            # AI judge agents
│   └── judge-agent/                       # TypeScript agent
│       ├── src/judge.ts                       # Core AIJudge class
│       ├── src/index.ts                       # Node.js CLI entry point
│       ├── src/worker.ts                      # Cloudflare Worker entry point
│       └── wrangler.toml                      # CF Worker config (5-min cron)
│
├── website/                           # Next.js 16 dApp
│   ├── src/app/                           # App Router pages
│   │   ├── page.tsx                           # Homepage
│   │   ├── markets/                           # Market listing
│   │   ├── create/                            # Market creation form
│   │   ├── judge/                             # Judge registration
│   │   └── about/                             # Thesis + podcast references
│   ├── src/lib/                           # Contract config, wagmi hooks
│   ├── src/components/                    # ParticleField, Header, Footer
│   └── README.md
│
├── DEPLOYMENT.md                      # Deployment + judge setup instructions
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
git clone https://github.com/ungaro/departmentofpredictions.git && cd departmentofpredictions
pnpm install
cd contracts && forge install && cd ..

# Compile contracts (requires via_ir)
cd contracts && forge build

# Run all 86 tests
forge test -vv

# Build website
cd ../website && pnpm install && pnpm build --webpack
```

---

## Smart Contract

**File:** [`contracts/src/AIJudgeMarket.sol`](contracts/src/AIJudgeMarket.sol)

UUPS-upgradeable (EIP-1822) prediction market oracle with EIP-7201 namespaced storage.

### Features

| Feature | Detail |
|---------|--------|
| Commit-reveal voting | `keccak256(abi.encodePacked(outcome, salt))` — prevents coordination |
| 8 sub-courts | General, Finance, Sports, Politics, Technology, Entertainment, Crypto, Science |
| Economic security | 1 USDC min stake (testnet), configurable via admin setters, 50% slash, suspension after 3 failures |
| Random selection | `block.prevrandao` + timestamp, weighted by reputation |
| Challenge mechanism | 24-hour window, 1 USDC challenge bond (testnet) |
| Role-based access | Admin, Manager, Registrar, Challenge Resolver, Upgrader |
| Market lifecycle | Create, cancel, select judges, commit, reveal, challenge, finalize |
| ERC-8004 agents | Portable agent identity (ERC-721), reputation bootstrapping, feature-flagged |
| Admin config setters | setMinJudgeStake, setChallengeStake, setChallengeWindow, setCommitRevealWindow, setProtocolFeeBasisPoints, setSlashPercentage, setUSDCAddress |

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

# Predict deterministic address (same on all chains via CREATE3)
pnpm run deploy:predict

# Deploy to each chain
pnpm run deploy:base         # Base Sepolia
pnpm run deploy:eth-sepolia  # Ethereum Sepolia
pnpm run deploy:arc          # ARC Testnet
```

> See [`DEPLOYMENT.md`](DEPLOYMENT.md) for full deployment and judge agent setup instructions.

### Deployed Contracts

| Chain | Proxy Address | Status |
|-------|---------------|--------|
| Ethereum Sepolia | `0xF7b9e8C9675d0Dbdb280A117fDf5E39fc6fb9E04` | Active |
| ARC Testnet | `0xF7b9e8C9675d0Dbdb280A117fDf5E39fc6fb9E04` | Active |
| Base Sepolia | `0xF7b9e8C9675d0Dbdb280A117fDf5E39fc6fb9E04` | Planned |

Same address on all chains via CreateX CREATE3 factory.

---

## OpenClaw Skills

### AIJudgeMarket Skill

15 CLI tools wrapping every contract operation via Web3.py.

```bash
cd skills/aijudge-market/scripts

python3 create_market.py --question "Will ETH hit $5000?" --resolution-time 1743465600
python3 register_judge.py --stake 1
python3 commit_vote.py --market-id 0 --outcome 1 --salt 0x...
python3 reveal_vote.py --market-id 0 --outcome 1 --salt 0x...
python3 get_market.py --market-id 0
```

> Full tool list: [`skills/aijudge-market/SKILL.md`](skills/aijudge-market/SKILL.md)

> **Live Configuration**: Agents fetch latest addresses and parameters from [departmentofpredictions.com/skill.md](https://departmentofpredictions.com/skill.md)

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

86 Foundry tests:

| Category | Tests | Coverage |
|----------|-------|----------|
| Full lifecycle | 5 | Register &rarr; create &rarr; select &rarr; commit &rarr; reveal &rarr; finalize |
| Access control | 6 | Pause, select judges, reinstate, role gating |
| Edge cases | 8 | Invalid reveal, double commit, non-selected judge, insufficient stake |
| Market ops | 4 | Cancellation, challenge after window, court join/leave |
| Stats views | 3 | getMarketCount, getActiveJudgesCount, getConfig |
| ERC-8004 | 10 | Link/unlink agent, register with agent, reputation bootstrap |
| Fuzz | 5 | Bounded random parameters for market creation |
| SP1 Verifier | 27 | Evidence proof, AI analysis proof, admin functions, edge cases |
| Security fixes | 18 | Audit fix validations (slashing, suspension, vote validation) |

```bash
cd contracts
forge test -vv          # All tests
forge test --match-test testFullLifecycle  # Single test
```

---

## Networks

| Network | RPC | USDC | Status |
|---------|-----|------|--------|
| Ethereum Sepolia | `https://sepolia.gateway.tenderly.co` | `0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238` | Active |
| ARC Testnet | `https://rpc.testnet.arc.network` | `0x2Ed9F0618e1E40A400DdB2D96C7a2834A3A1f964` | Active |
| Base Sepolia | `https://sepolia.base.org` | `0x036CbD53842c5426634e7929541eC2318f3dCF7e` | Planned |
| Arbitrum Sepolia | Default | `0x75faf114eafb1BDbe2F0316DF893fd58CE46AA4d` | &mdash; |

---

## Environment Variables

```bash
# Contract deployment
PRIVATE_KEY=0x...
CONTRACT_ADDRESS=0xF7b9e8C9675d0Dbdb280A117fDf5E39fc6fb9E04
ETHERSCAN_API_KEY=...

# Website
NEXT_PUBLIC_CONTRACT_ADDRESS=0xF7b9e8C9675d0Dbdb280A117fDf5E39fc6fb9E04   # Deployed proxy address
NEXT_PUBLIC_WC_PROJECT_ID=...        # WalletConnect project ID
```

---

## Documentation Index

| Document | Description |
|----------|-------------|
| [`README.md`](README.md) | This file — project overview |
| [`DEPLOYMENT.md`](DEPLOYMENT.md) | Deployment, role setup, and judge agent instructions |
| [`contracts/README.md`](contracts/README.md) | Contract architecture, security audit, sub-courts, ZK integration |
| [`agents/judge-agent/`](agents/judge-agent/) | TypeScript AI judge agent (Node.js CLI + Cloudflare Worker) |
| [`skills/aijudge-market/SKILL.md`](skills/aijudge-market/SKILL.md) | AIJudgeMarket skill manifest |
| [`skills/circlex402-skill/SKILL.md`](skills/circlex402-skill/SKILL.md) | CircleX402 skill manifest |
| [`website/README.md`](website/README.md) | Website setup and development |

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
