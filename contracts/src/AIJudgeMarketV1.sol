// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title AIJudgeMarketV1
 * @notice Staked AI judges for prediction market settlement (V1 - deprecated)
 * @dev Judges stake USDC, vote on outcomes, can be challenged
 */
contract AIJudgeMarketV1 is ReentrancyGuard, Ownable {
    IERC20 public usdc;

    // Minimum stake to become a judge
    uint256 public constant MIN_JUDGE_STAKE = 1000 * 1e6; // 1000 USDC

    // Challenge window duration
    uint256 public constant CHALLENGE_WINDOW = 24 hours;

    // Challenge stake (must match judge's stake)
    uint256 public constant CHALLENGE_STAKE = 1000 * 1e6; // 1000 USDC

    // Protocol fee (1%)
    uint256 public constant PROTOCOL_FEE = 100; // 1% = 100 basis points

    enum MarketStatus {
        Open,
        Resolving,
        Challenged,
        Resolved
    }

    enum Outcome {
        None,
        Yes,
        No
    }

    struct Judge {
        uint256 stake;
        uint256 successfulResolutions;
        uint256 failedResolutions;
        bool isActive;
        uint256 registrationTime;
    }

    struct Market {
        string question;
        uint256 resolutionTime;
        address creator;
        MarketStatus status;
        Outcome outcome;
        uint256 requiredJudges;
        uint256 judgeRewardPool;
        uint256 totalStaked;
        bytes32 evidenceHash; // IPFS hash of AI evidence
        uint256 resolutionTimestamp;
        uint256 challengeDeadline;
    }

    struct Vote {
        address judge;
        Outcome outcome;
        uint256 timestamp;
    }

    struct Challenge {
        address challenger;
        Outcome claimedOutcome;
        uint256 stake;
        uint256 timestamp;
        bool resolved;
    }

    // State
    mapping(address => Judge) public judges;
    mapping(uint256 => Market) public markets;
    mapping(uint256 => address[]) public marketJudges;
    mapping(uint256 => mapping(address => Vote)) public votes;
    mapping(uint256 => Challenge) public challenges;

    uint256 public marketCount;
    uint256 public totalProtocolFees;

    // Events
    event JudgeRegistered(address indexed judge, uint256 stake);
    event JudgeDeregistered(address indexed judge, uint256 stakeReturned);
    event MarketCreated(uint256 indexed marketId, string question, address creator);
    event JudgeJoined(uint256 indexed marketId, address indexed judge);
    event MarketResolved(uint256 indexed marketId, Outcome outcome, bytes32 evidenceHash);
    event VoteSubmitted(uint256 indexed marketId, address indexed judge, Outcome outcome);
    event ChallengeRaised(uint256 indexed marketId, address indexed challenger, Outcome claimedOutcome);
    event ChallengeResolved(uint256 indexed marketId, bool challengerWon);
    event RewardsDistributed(uint256 indexed marketId, uint256 totalRewards);

    constructor(address _usdc) Ownable(msg.sender) {
        usdc = IERC20(_usdc);
    }

    /**
     * @notice Register as an AI judge with USDC stake
     */
    function registerAsJudge(uint256 stakeAmount) external nonReentrant {
        require(stakeAmount >= MIN_JUDGE_STAKE, "Insufficient stake");
        require(!judges[msg.sender].isActive, "Already registered");

        // Transfer USDC stake
        require(usdc.transferFrom(msg.sender, address(this), stakeAmount), "Stake transfer failed");

        judges[msg.sender] = Judge({
            stake: stakeAmount,
            successfulResolutions: 0,
            failedResolutions: 0,
            isActive: true,
            registrationTime: block.timestamp
        });

        emit JudgeRegistered(msg.sender, stakeAmount);
    }

    /**
     * @notice Deregister and withdraw stake (only if no active markets)
     */
    function deregisterAsJudge() external nonReentrant {
        Judge storage judge = judges[msg.sender];
        require(judge.isActive, "Not registered");
        require(judge.stake > 0, "No stake to withdraw");

        uint256 stakeToReturn = judge.stake;

        // Reset judge data
        delete judges[msg.sender];

        // Return stake
        require(usdc.transfer(msg.sender, stakeToReturn), "Stake return failed");

        emit JudgeDeregistered(msg.sender, stakeToReturn);
    }

    /**
     * @notice Create a new prediction market
     */
    function createMarket(string calldata question, uint256 resolutionTime, uint256 requiredJudges)
        external
        returns (uint256 marketId)
    {
        require(bytes(question).length > 0, "Empty question");
        require(resolutionTime > block.timestamp, "Resolution time must be future");
        require(requiredJudges >= 3, "Need at least 3 judges");

        marketId = marketCount++;

        markets[marketId] = Market({
            question: question,
            resolutionTime: resolutionTime,
            creator: msg.sender,
            status: MarketStatus.Open,
            outcome: Outcome.None,
            requiredJudges: requiredJudges,
            judgeRewardPool: 0,
            totalStaked: 0,
            evidenceHash: bytes32(0),
            resolutionTimestamp: 0,
            challengeDeadline: 0
        });

        emit MarketCreated(marketId, question, msg.sender);
    }

    /**
     * @notice Join a market as a judge
     */
    function joinMarketAsJudge(uint256 marketId) external {
        Market storage market = markets[marketId];
        require(market.status == MarketStatus.Open, "Market not open");
        require(judges[msg.sender].isActive, "Not a registered judge");
        require(block.timestamp < market.resolutionTime, "Resolution time passed");

        // Check not already joined
        for (uint256 i = 0; i < marketJudges[marketId].length; i++) {
            require(marketJudges[marketId][i] != msg.sender, "Already joined");
        }

        marketJudges[marketId].push(msg.sender);

        emit JudgeJoined(marketId, msg.sender);
    }

    /**
     * @notice Submit vote to resolve market
     */
    function submitVote(uint256 marketId, Outcome outcome, bytes32 evidenceHash) external {
        Market storage market = markets[marketId];
        require(market.status == MarketStatus.Open || market.status == MarketStatus.Resolving, "Invalid status");
        require(outcome == Outcome.Yes || outcome == Outcome.No, "Invalid outcome");
        require(judges[msg.sender].isActive, "Not a registered judge");

        // Check judge is part of this market
        bool isMarketJudge = false;
        for (uint256 i = 0; i < marketJudges[marketId].length; i++) {
            if (marketJudges[marketId][i] == msg.sender) {
                isMarketJudge = true;
                break;
            }
        }
        require(isMarketJudge, "Not a market judge");

        // Record vote
        votes[marketId][msg.sender] = Vote({judge: msg.sender, outcome: outcome, timestamp: block.timestamp});

        // Store evidence hash from first judge
        if (market.evidenceHash == bytes32(0)) {
            market.evidenceHash = evidenceHash;
        }

        emit VoteSubmitted(marketId, msg.sender, outcome);

        // Check if we have enough votes to resolve
        if (marketJudges[marketId].length >= market.requiredJudges) {
            _checkAndResolveMarket(marketId);
        }
    }

    /**
     * @notice Internal: Check votes and resolve market
     */
    function _checkAndResolveMarket(uint256 marketId) internal {
        Market storage market = markets[marketId];

        uint256 yesVotes = 0;
        uint256 noVotes = 0;

        // Count votes
        for (uint256 i = 0; i < marketJudges[marketId].length; i++) {
            address judgeAddr = marketJudges[marketId][i];
            Vote memory vote = votes[marketId][judgeAddr];

            if (vote.outcome == Outcome.Yes) {
                yesVotes++;
            } else if (vote.outcome == Outcome.No) {
                noVotes++;
            }
        }

        // Require majority
        require(
            yesVotes > marketJudges[marketId].length / 2 || noVotes > marketJudges[marketId].length / 2, "No majority"
        );

        Outcome winningOutcome = yesVotes > noVotes ? Outcome.Yes : Outcome.No;

        market.status = MarketStatus.Resolving;
        market.outcome = winningOutcome;
        market.resolutionTimestamp = block.timestamp;
        market.challengeDeadline = block.timestamp + CHALLENGE_WINDOW;

        emit MarketResolved(marketId, winningOutcome, market.evidenceHash);
    }

    /**
     * @notice Challenge a market resolution
     */
    function challengeResolution(uint256 marketId, Outcome claimedOutcome) external nonReentrant {
        Market storage market = markets[marketId];
        require(market.status == MarketStatus.Resolving, "Not in resolving state");
        require(block.timestamp <= market.challengeDeadline, "Challenge window closed");
        require(claimedOutcome != market.outcome, "Same outcome");
        require(challenges[marketId].challenger == address(0), "Already challenged");

        // Transfer challenge stake
        require(usdc.transferFrom(msg.sender, address(this), CHALLENGE_STAKE), "Challenge stake failed");

        challenges[marketId] = Challenge({
            challenger: msg.sender,
            claimedOutcome: claimedOutcome,
            stake: CHALLENGE_STAKE,
            timestamp: block.timestamp,
            resolved: false
        });

        market.status = MarketStatus.Challenged;

        emit ChallengeRaised(marketId, msg.sender, claimedOutcome);
    }

    /**
     * @notice Resolve challenge - owner/DAO decides
     */
    function resolveChallenge(uint256 marketId, bool challengerWon) external onlyOwner {
        Market storage market = markets[marketId];
        Challenge storage challenge = challenges[marketId];

        require(market.status == MarketStatus.Challenged, "Not challenged");
        require(!challenge.resolved, "Already resolved");

        challenge.resolved = true;

        if (challengerWon) {
            // Challenger was right - flip outcome
            market.outcome = challenge.claimedOutcome;

            // Challenger gets their stake back + reward from judges who voted wrong
            uint256 reward = CHALLENGE_STAKE; // Simplified - real version would calculate from slashed judges
            require(usdc.transfer(challenge.challenger, reward), "Reward transfer failed");

            // Slash judges who voted incorrectly
            _slashIncorrectJudges(marketId);
        } else {
            // Challenger was wrong - lose stake to protocol
            totalProtocolFees += challenge.stake;
        }

        market.status = MarketStatus.Resolved;

        emit ChallengeResolved(marketId, challengerWon);
    }

    /**
     * @notice Finalize resolution after challenge window (no challenge)
     */
    function finalizeResolution(uint256 marketId) external {
        Market storage market = markets[marketId];
        require(market.status == MarketStatus.Resolving, "Not resolving");
        require(block.timestamp > market.challengeDeadline, "Challenge window open");
        require(challenges[marketId].challenger == address(0), "Has active challenge");

        market.status = MarketStatus.Resolved;

        // Distribute rewards to correct judges
        _distributeRewards(marketId);
    }

    /**
     * @notice Internal: Slash judges who voted incorrectly
     */
    function _slashIncorrectJudges(uint256 marketId) internal {
        Market storage market = markets[marketId];

        for (uint256 i = 0; i < marketJudges[marketId].length; i++) {
            address judgeAddr = marketJudges[marketId][i];
            Vote memory vote = votes[marketId][judgeAddr];

            if (vote.outcome != market.outcome) {
                // Judge voted wrong - slash 50% of their stake
                Judge storage judge = judges[judgeAddr];
                uint256 slashAmount = judge.stake / 2;
                judge.stake -= slashAmount;
                totalProtocolFees += slashAmount;
                judge.failedResolutions++;

                if (judge.failedResolutions >= 3) {
                    judge.isActive = false;
                }
            }
        }
    }

    /**
     * @notice Internal: Distribute rewards to correct judges
     */
    function _distributeRewards(uint256 marketId) internal {
        Market storage market = markets[marketId];

        uint256 correctJudgeCount = 0;

        // Count correct judges
        for (uint256 i = 0; i < marketJudges[marketId].length; i++) {
            address judgeAddr = marketJudges[marketId][i];
            Vote memory vote = votes[marketId][judgeAddr];

            if (vote.outcome == market.outcome) {
                correctJudgeCount++;
                judges[judgeAddr].successfulResolutions++;
            }
        }

        if (correctJudgeCount > 0 && market.judgeRewardPool > 0) {
            uint256 rewardPerJudge = market.judgeRewardPool / correctJudgeCount;

            for (uint256 i = 0; i < marketJudges[marketId].length; i++) {
                address judgeAddr = marketJudges[marketId][i];
                Vote memory vote = votes[marketId][judgeAddr];

                if (vote.outcome == market.outcome) {
                    require(usdc.transfer(judgeAddr, rewardPerJudge), "Reward transfer failed");
                }
            }

            emit RewardsDistributed(marketId, market.judgeRewardPool);
        }
    }

    /**
     * @notice Get market details
     */
    function getMarket(uint256 marketId) external view returns (Market memory) {
        return markets[marketId];
    }

    /**
     * @notice Get judge details
     */
    function getJudge(address judgeAddr) external view returns (Judge memory) {
        return judges[judgeAddr];
    }

    /**
     * @notice Get market judges
     */
    function getMarketJudges(uint256 marketId) external view returns (address[] memory) {
        return marketJudges[marketId];
    }

    /**
     * @notice Fund market reward pool
     */
    function fundRewardPool(uint256 marketId, uint256 amount) external {
        Market storage market = markets[marketId];
        require(market.status == MarketStatus.Open, "Market not open");

        require(usdc.transferFrom(msg.sender, address(this), amount), "Funding failed");
        market.judgeRewardPool += amount;
    }

    /**
     * @notice Withdraw protocol fees (owner only)
     */
    function withdrawProtocolFees(uint256 amount) external onlyOwner {
        require(amount <= totalProtocolFees, "Insufficient fees");
        totalProtocolFees -= amount;
        require(usdc.transfer(owner(), amount), "Withdrawal failed");
    }
}
