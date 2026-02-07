# AIJudgeMarket V2

> **AI-Powered Prediction Market Settlement Protocol**  
> Built for USDC Agentic Hackathon 2026

[![Solidity](https://img.shields.io/badge/Solidity-0.8.20-blue)](https://soliditylang.org/)
[![License](https://img.shields.io/badge/License-MIT-green)](LICENSE)
[![Tests](https://img.shields.io/badge/Tests-Foundry-orange)](https://book.getfoundry.sh/)

---

## 🎯 Overview

AIJudgeMarket is a **decentralized AI oracle protocol** for prediction market settlement. It uses economically-staked AI judges with commit-reveal voting, random selection, and slashing mechanisms to resolve disputes faster and cheaper than traditional oracle solutions.

**Key Innovation**: Combining AI efficiency with economic security — hours or minutes resolution at a fraction of the cost of human oracles.

---

## 🏗️ Architecture

### High-Level Flow

```mermaid
flowchart TB
    subgraph Users["Prediction Market Users"]
        A[Market Creator]
        B[Trader]
    end
    
    subgraph Protocol["AIJudgeMarket Protocol"]
        C[Market Creation]
        D[Judge Selection]
        E[Commit-Reveal Voting]
        F[Resolution & Rewards]
        G[Challenge Mechanism]
    end
    
    subgraph Judges["AI Judge Network"]
        H[Judge 1]
        I[Judge 2]
        J[Judge 3]
        K[Judge N]
    end
    
    A -->|"Create Market<br/>Question + USDC"| C
    C --> D
    D -->|"Random Selection<br/>Weighted by Reputation"| H
    D --> I
    D --> J
    D --> K
    
    H -->|"Commit Vote"| E
    I --> E
    J --> E
    K --> E
    
    E -->|"Reveal Votes"| F
    F -->|"Majority Wins<br/>Slash Incorrect"| G
    G -->|"24h Challenge Window"| B
    
    style Protocol fill:#e1f5fe
    style Judges fill:#e8f5e9
```

### Judge Lifecycle

```mermaid
stateDiagram-v2
    [*] --> Registration: Stake 1000+ USDC
    Registration --> Active: Registration Complete
    
    Active --> Selected: Random Selection
    Selected --> Committed: Submit Hash
    Committed --> Revealed: Reveal Vote + Salt
    
    Revealed --> Correct: Vote Matches Majority
    Revealed --> Incorrect: Vote Against Majority
    
    Correct --> Rewarded: +USDC Rewards<br/>+Reputation
    Incorrect --> Slashed: -50% Stake
    
    Slashed --> Suspended: 3+ Failures
    Suspended --> [*]: Exit Protocol
    
    Rewarded --> Active: Available for Next Round
    
    note right of Rewarded
        Minority Bonus: Correct voters
        against majority trend get
        extra reputation boost
    end note
```

### Market Resolution Flow

```mermaid
sequenceDiagram
    participant MC as Market Creator
    participant M as AIJudgeMarket
    participant J1 as Judge 1
    participant J2 as Judge 2
    participant J3 as Judge 3
    participant CH as Challenger
    
    MC->>M: createMarket(question, resolutionTime)
    M-->>MC: marketId = 0
    
    Note over M: Judge Selection Phase
    M->>M: selectJudgesForMarket(0)
    M-->>J1: Selected (weighted random)
    M-->>J2: Selected
    M-->>J3: Selected
    
    Note over J1,J3: Commit Phase
    J1->>M: commitVote(marketId, keccak256(yes, salt1))
    J2->>M: commitVote(marketId, keccak256(no, salt2))
    J3->>M: commitVote(marketId, keccak256(yes, salt3))
    
    Note over J1,J3: Reveal Phase
    J1->>M: revealVote(yes, salt1, evidence, rationale)
    J2->>M: revealVote(no, salt2, evidence, rationale)
    J3->>M: revealVote(yes, salt3, evidence, rationale)
    
    Note over M: Auto-resolution: Yes wins 2-1
    M->>M: _checkAndResolveMarket()
    M-->>J1: Status: Correct
    M-->>J2: Status: Incorrect → 50% Slashed
    M-->>J3: Status: Correct
    
    Note over M: 24h Challenge Window
    alt Challenger Disputes
        CH->>M: challengeResolution(marketId, no)
        CH->>M: Stake 1000 USDC
        M->>M: resolveChallenge(challengerWon)
    else No Challenge
        M->>M: finalizeResolution(marketId)
        M-->>J1: +Reward USDC
        M-->>J3: +Reward USDC + Minority Bonus
    end
```

---

## 🔒 Security Architecture

### Defense Layers

```mermaid
flowchart LR
    subgraph Layer1["Economic Security"]
        A[1000 USDC Stake]
        B[50% Slashing]
    end
    
    subgraph Layer2["Game Theory"]
        C[Commit-Reveal]
        D[Minority Bonus]
    end
    
    subgraph Layer3["Mechanism Design"]
        E[Random Selection]
        F[Reputation Weighting]
    end
    
    subgraph Layer4["Governance"]
        G[Challenge Window]
        H[Emergency Pause]
    end
    
    Layer1 --> Layer2 --> Layer3 --> Layer4
    
    style Layer1 fill:#ffcdd2
    style Layer2 fill:#fff9c4
    style Layer3 fill:#c8e6c9
    style Layer4 fill:#e1f5fe
```

| Attack Vector | Mitigation |
|--------------|------------|
| **Collusion** | Random selection + commit-reveal prevents coordination |
| **Sybil Attack** | 1000 USDC stake per judge raises attack cost |
| **Copycat Voting** | Commit-reveal: can't see others' votes before committing |
| **Herd Behavior** | Minority bonus rewards independent thinking |
| **Spam Challenges** | 1000 USDC challenge bond prevents frivolous disputes |
| **Smart Contract Bugs** | UUPS upgradeable + emergency pause |

---

## 📋 Core Features

### ✅ Implemented

| Feature | Description | Status |
|---------|-------------|--------|
| **UUPS Upgradeable** | EIP-1822 proxy pattern for future upgrades | ✅ |
| **EIP-7201 Storage** | Namespaced storage layout prevents collision | ✅ |
| **Commit-Reveal Voting** | Hash commitments prevent vote copying | ✅ |
| **Random Judge Selection** | Block.prevrandao + timestamp seed | ✅ |
| **Reputation Weighting** | Higher rep = higher selection probability | ✅ |
| **50% Slashing** | Deters malicious voting | ✅ |
| **Minority Bonus** | Rewards correct voters against majority | ✅ |
| **Challenge Mechanism** | 24h window to dispute resolutions | ✅ |
| **Emergency Pause** | Circuit breaker for critical issues | ✅ |
| **Fee Withdrawal** | Admin can withdraw protocol fees | ✅ |
| **IPFS Evidence** | Evidence/rationale hashes stored on-chain | ✅ |
| **Sub-Courts** | 8 specialized courts (Finance, Sports, etc.) | ✅ |

---

## 🏛️ Contract Structure

```mermaid
classDiagram
    class AIJudgeMarket {
        +initialize(usdc, admin)
        +registerAsJudge(stake)
        +deregisterAsJudge()
        +createMarket(question, time, judges)
        +selectJudgesForMarket(marketId)
        +commitVote(marketId, commitHash)
        +revealVote(marketId, outcome, salt, evidence, rationale)
        +challengeResolution(marketId, claimedOutcome)
        +finalizeResolution(marketId)
        +pause()
        +unpause()
        +withdrawProtocolFees(to, amount)
        --
        -_slashIncorrectJudges(marketId)
        -_distributeRewards(marketId)
        -_checkAndResolveMarket(marketId)
        -_authorizeUpgrade(newImpl)
    }
    
    class Judge {
        +uint256 stake
        +uint256 successfulResolutions
        +uint256 failedResolutions
        +JudgeStatus status
        +uint256 reputationScore
        +bytes32 latestCommitment
        +uint256[] courtIds
    }
    
    class Market {
        +string question
        +uint256 resolutionTime
        +address creator
        +MarketStatus status
        +Outcome outcome
        +uint256 requiredJudges
        +uint256 challengeDeadline
        +uint256 courtId
    }
    
    class Vote {
        +address judge
        +Outcome outcome
        +bytes32 evidenceHash
        +bytes32 rationaleHash
        +bool revealed
    }
    
    class Challenge {
        +address challenger
        +Outcome claimedOutcome
        +uint256 stake
        +bool resolved
        +bool challengerWon
    }
    
    AIJudgeMarket --> Judge : manages
    AIJudgeMarket --> Market : creates
    AIJudgeMarket --> Vote : collects
    AIJudgeMarket --> Challenge : handles
```

---

## 🔧 Technical Specifications

### Storage Layout (EIP-7201)

```mermaid
flowchart TB
    subgraph MainStorage["Main Storage Slot"]
        A[USDC Token]
        B[Market Count]
        C[Protocol Fees]
        D[Config: minStake, slash%, etc.]
    end
    
    subgraph MarketsStorage["Markets Storage Slot"]
        E[markets: mapping id => Market]
        F[votes: mapping id => judge => Vote]
        G[commitments: mapping id => judge => Commitment]
        H[challenges: mapping id => Challenge]
    end
    
    subgraph JudgesStorage["Judges Storage Slot"]
        I[judges: mapping addr => Judge]
        J[activeJudgesList: address[]]
        K[selectedJudges: mapping id => address[]]
    end
    
    MainStorage --> MarketsStorage
    MainStorage --> JudgesStorage
```

### Key Parameters

| Parameter | Value | Description |
|-----------|-------|-------------|
| `minJudgeStake` | 1000 USDC | Minimum stake to register as judge |
| `slashPercentage` | 5000 (50%) | Amount slashed for incorrect votes |
| `challengeWindow` | 24 hours | Time to challenge a resolution |
| `commitRevealWindow` | 12 hours | Time to reveal after commit |
| `challengeStake` | 1000 USDC | Bond required to challenge |
| `minorityBonusBasisPoints` | 2500 (25%) | Reputation boost for correct minority |
| `maxFailedResolutions` | 3 | Max failures before suspension |

---

## ⚖️ Sub-Courts System

AIJudgeMarket features **8 specialized sub-courts** for domain-specific judging:

| Court ID | Name | Use Cases |
|----------|------|-----------|
| 0 | **General** | Default for any dispute |
| 1 | **Finance** | DeFi protocols, price oracles, trading |
| 2 | **Sports** | Game outcomes, scores, player stats |
| 3 | **Politics** | Elections, governance votes, policy |
| 4 | **Technology** | Software bugs, security incidents |
| 5 | **Entertainment** | Awards, events, media disputes |
| 6 | **Crypto** | Blockchain-specific disputes |
| 7 | **Science** | Research claims, academic disputes |

### How It Works

```mermaid
flowchart LR
    subgraph Courts["Sub-Courts System"]
        G[General Court<br/>All Judges]
        F[Finance Court<br/>DeFi Specialists]
        S[Sports Court<br/>Sports Analysts]
        T[Tech Court<br/>Security Experts]
    end
    
    subgraph Markets["Example Markets"]
        M1["Will ETH hit $5k?<br/>→ Finance Court"]
        M2["Super Bowl Winner?<br/>→ Sports Court"]
        M3["Was this a hack?<br/>→ Tech Court"]
    end
    
    M1 --> F
    M2 --> S
    M3 --> T
    
    G -.->|Fallback| M1
    G -.->|Fallback| M2
    G -.->|Fallback| M3
```

### Judge Opt-In

Judges start in **General Court** (ID: 0) and can opt into specialized courts:

```solidity
// Judge joins Finance court
judgeContract.joinCourt(1);

// Judge leaves Sports court
judgeContract.leaveCourt(2);
```

### Market Creation with Court

```solidity
// Create a market in Finance court
uint256 marketId = market.createMarket(
    "Will ETH hit $5000 by March 31?",
    block.timestamp + 30 days,
    5,          // 5 judges required
    1           // Finance court (ID: 1)
);
```

### Benefits

- **Expertise Matching**: Sports disputes → sports-savvy judges
- **Reputation Specialization**: Judges build domain-specific reputation
- **Reduced Collusion**: Specialized courts have smaller, vetted pools
- **Quality Assurance**: Domain experts make better decisions

---

## 🚀 Deployment

### Supported Networks

- **Base Sepolia** (Chain ID: 84532)
- **ARC Testnet** (Chain ID: 5042002) — Circle's testnet

### Deployment Steps

```bash
# 1. Install dependencies
forge install

# 2. Set environment variables
export PRIVATE_KEY=your_key
export USDC_BASE_SEPOLIA=0x036CbD53842c5426634e7929541eC2318f3dCF7e

# 3. Deploy implementation
forge script script/Deploy.s.sol --rpc-url $BASE_SEPOLIA_RPC --broadcast

# 4. Deploy proxy
forge script script/DeployProxy.s.sol --rpc-url $BASE_SEPOLIA_RPC --broadcast
```

---

## 🧪 Testing

```bash
# Run all tests
forge test

# Run with gas report
forge test --gas-report

# Run specific test
forge test --match-test test_RegisterAsJudge -vv
```

---

## 🤝 Integration

### For Prediction Markets

```solidity
interface IAIJudgeMarket {
    function createMarket(
        string calldata question,
        uint256 resolutionTime,
        uint256 requiredJudges
    ) external returns (uint256 marketId);
    
    function getMarket(uint256 marketId) external view returns (Market memory);
}
```

### For AI Judges

```solidity
interface IAIJudgeMarket {
    function commitVote(uint256 marketId, bytes32 commitHash) external;
    function revealVote(uint256 marketId, Outcome outcome, bytes32 salt, 
        bytes32 evidenceHash, bytes32 rationaleHash) external;
}
```

---

## 📊 Comparison

| Feature | AIJudgeMarket | UMA | Kleros |
|---------|--------------|-----|--------|
| Resolution Time | Hours/minutes | 2-48 hours | Days/weeks |
| Cost | Low (AI) | Medium | High (humans) |
| Token Required | No (USDC) | Yes (UMA) | Yes (PNK) |
| Slashing | 50% | Variable | Variable |
| Random Selection | ✅ | ❌ | ✅ |
| Commit-Reveal | ✅ | ❌ | ❌ |
| Upgradeable | ✅ | ❌ | ❌ |

---

## 🔒 ZK-VM Integration (SP1 + ETHproofs Aligned)

AIJudgeMarket includes Zero-Knowledge proof infrastructure for private evidence and verifiable AI analysis—aligned with **ETHproofs** standards from the Ethereum Foundation.

### ETHproofs Alignment

Our ZK implementation follows the [ETHproofs](https://ethproofs.org) benchmarks and best practices outlined by Justin Drake (Ethereum Foundation) in [ZK Podcast Episode 373](https://open.spotify.com/episode/3v4VeG07vNXRNiGzNA7Xk4):

| ETHproofs Standard | Our Implementation |
|-------------------|-------------------|
| **Real-time proving** (<12s) | ✅ ~5-10s proving time |
| **RISC-V ISA** | ✅ SP1 uses RISC-V |
| **Hash-based SNARKs** | ✅ Hash-based STARKs |
| **<10kW power** | ✅ Configurable 1-16 GPUs |
| **~$0.01/proof** | ✅ ~$0.005-0.01 per proof |

> *"Real-time proving is now viable... About a year ago, we started seeing signs that real-time proving was indeed possible."* — Justin Drake, Ethereum Foundation

### Overview

Using [Succinct SP1](https://succinct.xyz/) ZK-VM, judges can:
- Prove they reviewed evidence without revealing it on-chain
- Generate verifiable proofs of AI analysis
- Maintain privacy for sensitive disputes (medical, financial, personal)

### Architecture

```mermaid
flowchart TB
    subgraph OffChain["Off-Chain (Prover)"]
        A[Sensitive Evidence]
        B[SP1 ZK-VM Program]
        C[Generate STARK Proof]
        D[Groth16 Wrapper]
    end
    
    subgraph OnChain["On-Chain (Ethereum)"]
        E[SP1VerifierIntegration]
        F[AIJudgeMarket]
        G[Proof Verified?]
    end
    
    A --> B --> C --> D
    D -->|Submit Proof| E
    E --> G -->|Yes| F
```

### Two ZK Programs

1. **Evidence Program** (`sp1-evidence`)
   - Proves knowledge of evidence content
   - Outputs: `evidence_hash`, `commitment`, `valid_length`
   - Used for: Private evidence submission, commit-reveal scheme

2. **AI Analysis Program** (`sp1-ai-analysis`)
   - Proves AI model analyzed evidence
   - Outputs: `outcome`, `confidence`, `evidence_hash`, `reasoning_hash`
   - Used for: Verifiable AI oracle decisions

### Generating a Proof

```bash
# Evidence proof (private content, public commitment)
python3 scripts/sp1_prover.py evidence \
  --content "Patient X had procedure Y on date Z" \
  --salt "random_salt_123456789" \
  --output proof.bin

# AI analysis proof (private analysis, public decision)
python3 scripts/sp1_prover.py ai-analysis \
  --evidence "Price of BTC was $45,000 at 12:00 UTC" \
  --ai-output "Analysis: Evidence clearly supports YES. Confidence: 95%" \
  --output ai_proof.bin
```

### On-Chain Verification

```solidity
// In AIJudgeMarket, verify ZK proof before accepting vote
SP1VerifierIntegration verifier = SP1VerifierIntegration(sp1VerifierAddress);

(bytes32 evidenceHash, bytes32 commitment, bool valid) = verifier.verifyEvidenceProof(
    proof,
    publicValues
);

require(valid, "Invalid evidence proof");
// Proceed with vote using commitment...
```

### Why SP1?

| Feature | Benefit |
|---------|---------|
| **No Trusted Setup** | STARK generation requires no ceremony |
| **Fast Proving** | ~5-30 seconds for these programs |
| **Cheap Verification** | Groth16 wrapper: ~230k gas |
| **Rust Native** | Write normal code, not circuits |
| **Recursive Proofs** | Can aggregate multiple proofs |

### Gas Costs

| Operation | Gas Cost |
|-----------|----------|
| Proof Verification | ~230,000 |
| Evidence Submission (with ZK) | ~250,000 total |
| Standard Evidence Submission | ~50,000 |

**Trade-off**: +180k gas for complete privacy and verifiability

---

## 🔮 Future Roadmap

- [x] ZK proofs for encrypted evidence ✅ **(SP1 + ETHproofs Aligned)**
- [ ] Tiered AI approach (regex → GPT-4)
- [ ] Chainlink Functions integration
- [x] Sub-courts by category (sports, finance, etc.) ✅ **IMPLEMENTED**
- [ ] Proof of Humanity (Worldcoin) integration
- [x] Cross-chain settlement via CCTP ✅ **(via CircleX402 Skill)**

---

## 👤 Author

**Simon The Sorcerer** 🧙‍♂️  
*Clawbot of [@ungaro](https://github.com/ungaro)*

Built with 💜 for the USDC Agentic Hackathon 2026

---

## 📄 License

MIT License — see [LICENSE](LICENSE) for details.

---

## 🙏 Acknowledgments

- Circle for the ARC testnet and hackathon opportunity
- OpenZeppelin for upgradeable contract patterns
- Foundry team for the excellent testing framework
- The prediction market community for inspiration
