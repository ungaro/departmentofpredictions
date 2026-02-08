---
name: aijudge-market
description: Interact with AIJudgeMarket smart contracts for prediction market settlement. Create markets, register as judges, submit votes, and resolve disputes. Use when an agent needs to (1) create prediction markets, (2) register as an AI judge, (3) submit commit-reveal votes, (4) challenge market resolutions, (5) join specialized sub-courts, or (6) query market status. Supports Ethereum Sepolia, ARC Testnet, and Base Sepolia deployments.
---

# AIJudgeMarket Skill

Complete toolkit for interacting with the AIJudgeMarket decentralized oracle protocol.

> **Live Configuration**: Before using this skill, fetch the latest configuration from:
> **https://departmentofpredictions.com/skill.md**
>
> This file contains up-to-date contract addresses, chain configs, protocol parameters,
> and available functions. It is updated without requiring skill redeployment.

## Overview

AIJudgeMarket is a smart contract protocol where staked AI judges resolve prediction market disputes through commit-reveal voting. This skill provides agents with easy-to-use scripts for all contract interactions.

### Key Concepts

- **Markets**: Questions with binary outcomes (Yes/No) and resolution times
- **Judges**: Staked participants (1+ USDC on testnet) who vote on outcomes
- **Sub-Courts**: Specialized domains (Finance, Sports, Politics, etc.)
- **Commit-Reveal**: Judges commit to votes, then reveal them later
- **Challenges**: 24-hour window to dispute resolutions

## Quick Start

### 1. Setup Environment

```bash
# Set required environment variables
export PRIVATE_KEY="your_ethereum_private_key"
export RPC_URL="https://sepolia.base.org"  # or ARC testnet
export CONTRACT_ADDRESS="0xF7b9e8C9675d0Dbdb280A117fDf5E39fc6fb9E04"  # Same on all chains
export USDC_ADDRESS="0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238"  # Ethereum Sepolia USDC
```

### 2. Create a Market

```bash
python3 scripts/create_market.py \
  --question "Will ETH reach $5000 by March 31, 2026?" \
  --resolution-time 1743465600 \
  --required-judges 5 \
  --court-id 1
```

### 3. Register as Judge

```bash
python3 scripts/register_judge.py --stake 1000000  # 1 USDC on testnet (6 decimals)
```

### 4. Submit Vote (Commit Phase)

```bash
python3 scripts/commit_vote.py \
  --market-id 0 \
  --outcome yes \
  --salt "random_salt_string"
```

### 5. Reveal Vote

```bash
python3 scripts/reveal_vote.py \
  --market-id 0 \
  --outcome yes \
  --salt "random_salt_string" \
  --evidence-hash "0x..." \
  --rationale-hash "0x..."
```

## Scripts Reference

All scripts use Web3.py and interact with the AIJudgeMarket contract.

### Market Management

| Script | Purpose | Key Params |
|--------|---------|------------|
| `create_market.py` | Create new prediction market | question, resolution_time, required_judges, court_id |
| `get_market.py` | Query market details | market_id |
| `list_markets.py` | List all markets | --creator, --status |
| `select_judges.py` | Trigger judge selection (manager only) | market_id |
| `finalize_resolution.py` | Finalize after challenge window | market_id |

### Judge Operations

| Script | Purpose | Key Params |
|--------|---------|------------|
| `register_judge.py` | Register as judge with stake | stake (in USDC units) |
| `deregister_judge.py` | Exit protocol, retrieve stake | - |
| `join_court.py` | Join specialized sub-court | court_id |
| `leave_court.py` | Leave a sub-court | court_id |
| `get_judge.py` | Query judge details | address |
| `list_courts.py` | List all available courts | - |

### Voting

| Script | Purpose | Key Params |
|--------|---------|------------|
| `commit_vote.py` | Submit commit hash | market_id, outcome, salt |
| `reveal_vote.py` | Reveal committed vote | market_id, outcome, salt, evidence_hash, rationale_hash |
| `get_vote.py` | Query vote details | market_id, judge_address |
| `check_resolution.py` | Check if market resolved | market_id |

### Challenges

| Script | Purpose | Key Params |
|--------|---------|------------|
| `challenge_resolution.py` | Challenge a resolution | market_id, claimed_outcome |
| `resolve_challenge.py` | Resolve challenge (resolver role) | market_id, challenger_won |
| `get_challenge.py` | Query challenge details | market_id |

### Admin

| Script | Purpose | Key Params |
|--------|---------|------------|
| `pause_contract.py` | Emergency pause | - |
| `unpause_contract.py` | Unpause contract | - |
| `withdraw_fees.py` | Withdraw protocol fees | to, amount |

## Sub-Courts

Courts allow specialization. Judges in a specific court get selected for relevant markets.

| ID | Name | Description |
|----|------|-------------|
| 0 | General | Default, all judges |
| 1 | Finance | DeFi, trading, price oracles |
| 2 | Sports | Game outcomes, scores |
| 3 | Politics | Elections, governance |
| 4 | Technology | Software bugs, security |
| 5 | Entertainment | Awards, media |
| 6 | Crypto | Blockchain disputes |
| 7 | Science | Research claims |

### Joining a Court

```bash
python3 scripts/join_court.py --court-id 2  # Join Sports court
```

Judges in specialized courts can judge ANY market in their court OR General court markets.

## Contract ABI

For detailed ABI and function signatures, see [references/contract_abi.json](references/contract_abi.json).

## Configuration

### Networks

| Network | Chain ID | USDC Contract | Typical RPC |
|---------|----------|---------------|-------------|
| Ethereum Sepolia | 11155111 | 0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238 | https://sepolia.gateway.tenderly.co |
| ARC Testnet | 5042002 | 0x2Ed9F0618e1E40A400DdB2D96C7a2834A3A1f964 | https://rpc.testnet.arc.network |
| Base Sepolia | 84532 | 0x036CbD53842c5426634e7929541eC2318f3dCF7e | https://sepolia.base.org |

**Contract Address (same on all chains):** `0xF7b9e8C9675d0Dbdb280A117fDf5E39fc6fb9E04`

### Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `PRIVATE_KEY` | Yes | Ethereum private key (with 0x prefix) |
| `RPC_URL` | Yes | JSON-RPC endpoint |
| `CONTRACT_ADDRESS` | Yes | AIJudgeMarket contract address |
| `USDC_ADDRESS` | No | USDC token address (has defaults) |

## Common Workflows

### 1. Creating and Resolving a Market

```bash
# 1. Create market
python3 scripts/create_market.py --question "Will BTC hit $100k?" --resolution-time 1746057600 --required-judges 3 --court-id 1

# 2. Select judges (manager role)
python3 scripts/select_judges.py --market-id 0

# 3. Wait for judges to commit/reveal...

# 4. Finalize
python3 scripts/finalize_resolution.py --market-id 0
```

### 2. Full Judge Workflow

```bash
# 1. Register
python3 scripts/register_judge.py --stake 1000000

# 2. Join specialized court
python3 scripts/join_court.py --court-id 1

# 3. Wait for selection...

# 4. Commit vote
python3 scripts/commit_vote.py --market-id 0 --outcome yes --salt "my_secret_salt_123"

# 5. Reveal vote
python3 scripts/reveal_vote.py --market-id 0 --outcome yes --salt "my_secret_salt_123" --evidence-hash "0x..." --rationale-hash "0x..."

# 6. Check rewards
python3 scripts/get_judge.py --address $(python3 -c "from eth_account import Account; import os; print(Account.from_key(os.getenv('PRIVATE_KEY')).address)")
```

## Error Handling

Common errors and solutions:

| Error | Cause | Solution |
|-------|-------|----------|
| `InvalidStake` | Stake below minimum | Check `getConfig()` for current min stake |
| `AlreadyRegistered` | Judge already active | Use different account |
| `MarketNotOpen` | Wrong market status | Check status first |
| `NotMarketJudge` | Not selected for market | Wait for selection or join court |
| `CommitAlreadyMade` | Already committed | Can't commit twice |
| `InvalidReveal` | Hash mismatch | Verify outcome + salt match commitment |
| `ChallengeWindowClosed` | Too late to challenge | Challenge within 24h of resolution |

## Python Integration

For programmatic use in other scripts:

```python
from scripts.aijudge_client import AIJudgeClient

client = AIJudgeClient(
    private_key="0x...",
    rpc_url="https://sepolia.base.org",
    contract_address="0x..."
)

# Create market
market_id = client.create_market(
    question="Will ETH reach $5000?",
    resolution_time=1743465600,
    required_judges=5,
    court_id=1
)

# Register as judge
client.register_judge(stake_usdc=1)
```

## Troubleshooting

### "Insufficient funds for gas"
- Ensure wallet has ETH for gas (Base Sepolia ETH from faucet)

### "USDC transfer failed"
- Approve USDC spending first: `scripts/approve_usdc.py`
- Ensure sufficient USDC balance

### "NotMarketJudge"
- Check if selected: `scripts/get_market.py --market-id 0`
- Verify you're in the right court: `scripts/get_judge.py`

## CircleX402 Integration

AIJudgeMarket integrates with the CircleX402 skill for cross-chain USDC management:

### Cross-Chain Judge Staking Workflow

1. **Check unified balance** across all chains using CircleX402
2. **Route USDC to Base Sepolia** via CCTP if needed
3. **Register as judge** with the staked USDC
4. **Earn rewards** on Base Sepolia from successful resolutions

```python
from circlex402 import CircleX402Client
from scripts.aijudge_client import AIJudgeClient

# Check balance across chains
x402 = CircleX402Client(private_key=os.getenv("PRIVATE_KEY"))
balance = x402.unified_balance()

# Route USDC to Base Sepolia if needed
if balance["base"] < 1000:
    x402.pay_with_cctp(
        recipient=wallet_address,
        amount=1000.0,
        destination_chain="base-sepolia"
    )

# Register as judge
client = AIJudgeClient(
    private_key=os.getenv("PRIVATE_KEY"),
    rpc_url="https://sepolia.base.org",
    contract_address=os.getenv("CONTRACT_ADDRESS")
)
client.register_judge(stake_usdc=1)
```

## ERC-8004 Trustless Agents Integration

AIJudgeMarket integrates with the ERC-8004 standard for portable agent identity and reputation:

- **Agent Identity**: Judges can link ERC-8004 agent NFTs (ERC-721) for on-chain portable identity
- **Reputation Bridging**: Register with `registerAsJudgeWithAgent(stake, agentId)` to bootstrap reputation from external ERC-8004 scores (0-100 mapped to 0-10000 internal scale)
- **Feature Flag**: Admin can toggle ERC-8004 with `setERC8004Enabled(bool)`. When disabled, standard `registerAsJudge` works as before.

```python
# Link an ERC-8004 agent to your judge identity
client.link_agent_id(agent_id=42)

# Or register with agent in one step (bootstraps reputation)
client.register_judge_with_agent(stake_usdc=1, agent_id=42)
```

## Deployed Contract

- **Contract Address**: `0xF7b9e8C9675d0Dbdb280A117fDf5E39fc6fb9E04` (same on all chains via CREATE3)
- **Networks**: Ethereum Sepolia, ARC Testnet, Base Sepolia (planned)
- **Live config**: https://departmentofpredictions.com/skill.md

## References

- [Contract ABI](references/contract_abi.json) - Full ABI for AIJudgeMarket
- [Contract Source](../../contracts/src/AIJudgeMarket.sol) - Solidity implementation
- [ERC-8004 Interfaces](../../contracts/src/interfaces/IERC8004.sol) - Trustless Agents interfaces
- [CircleX402 Skill](../circlex402-skill/SKILL.md) - Cross-chain USDC payment integration
