// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {Initializable} from "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import {UUPSUpgradeable} from "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
import {AccessControlUpgradeable} from "@openzeppelin/contracts-upgradeable/access/AccessControlUpgradeable.sol";
import {ReentrancyGuardUpgradeable} from "@openzeppelin/contracts-upgradeable/utils/ReentrancyGuardUpgradeable.sol";
import {PausableUpgradeable} from "@openzeppelin/contracts-upgradeable/utils/PausableUpgradeable.sol";
import {IIdentityRegistry, IReputationRegistry, IValidationRegistry} from "./interfaces/IERC8004.sol";

/**
 * @title AIJudgeMarket
 * @notice Staked AI judges for prediction market settlement with commit-reveal voting
 * @dev UUPS upgradeable with EIP-7201 namespaced storage, random judge selection, and economic security
 */
contract AIJudgeMarket is
    Initializable,
    UUPSUpgradeable,
    AccessControlUpgradeable,
    ReentrancyGuardUpgradeable,
    PausableUpgradeable
{
    // ============================================================
    // ROLES
    // ============================================================
    bytes32 public constant UPGRADER_ROLE = keccak256("UPGRADER_ROLE");
    bytes32 public constant MANAGER_ROLE = keccak256("MANAGER_ROLE");
    bytes32 public constant JUDGE_REGISTRAR_ROLE = keccak256("JUDGE_REGISTRAR_ROLE");
    bytes32 public constant CHALLENGE_RESOLVER_ROLE = keccak256("CHALLENGE_RESOLVER_ROLE");

    // ============================================================
    // EIP-7201: NAMESPACED STORAGE LAYOUT
    // ============================================================
    bytes32 private constant MAIN_STORAGE_LOCATION = 0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcd00;
    bytes32 private constant MARKETS_STORAGE_LOCATION =
        0xfedcba0987654321fedcba0987654321fedcba0987654321fedcba0987654300;
    bytes32 private constant JUDGES_STORAGE_LOCATION =
        0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567800;

    // ============================================================
    // STRUCTS
    // ============================================================

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
    enum JudgeStatus {
        Inactive,
        Active,
        Suspended
    }

    // Sub-court categories for specialized judging
    enum CourtCategory {
        General, // 0: Default, any dispute
        Finance, // 1: DeFi, trading, price oracles
        Sports, // 2: Sports outcomes, scores
        Politics, // 3: Elections, governance
        Technology, // 4: Software, security incidents
        Entertainment, // 5: Media, awards, events
        Crypto, // 6: Blockchain-specific disputes
        Science // 7: Academic, research claims
    }

    struct Judge {
        uint256 stake;
        uint256 successfulResolutions;
        uint256 failedResolutions;
        JudgeStatus status;
        uint256 registrationTime;
        uint256 reputationScore;
        bytes32 latestCommitment;
        uint256 commitmentBlock;
        uint256[] courtIds; // Sub-courts this judge is qualified for
        uint256 agentId; // ERC-8004 agent NFT ID (0 = not linked)
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
        bytes32 evidenceHash;
        uint256 resolutionTimestamp;
        uint256 challengeDeadline;
        uint256 creationTime;
        Outcome proposedOutcome;
        address proposer;
        uint256 proposalTime;
        uint256 courtId; // Sub-court category for this market
    }

    struct Vote {
        address judge;
        Outcome outcome;
        uint256 timestamp;
        bytes32 evidenceHash;
        bytes32 rationaleHash;
        bool revealed;
    }

    struct Challenge {
        address challenger;
        Outcome claimedOutcome;
        uint256 stake;
        uint256 timestamp;
        bool resolved;
        bool challengerWon;
    }

    struct Commitment {
        bytes32 commitHash;
        uint256 blockNumber;
        bool revealed;
    }

    // ============================================================
    // STORAGE STRUCTS (EIP-7201)
    // ============================================================

    struct MainStorage {
        IERC20 usdc;
        uint256 marketCount;
        uint256 totalProtocolFees;
        uint256 minJudgeStake;
        uint256 challengeStake;
        uint256 challengeWindow;
        uint256 protocolFeeBasisPoints;
        uint256 slashPercentage;
        uint256 maxFailedResolutions;
        uint256 commitRevealWindow;
        uint256 minorityBonusBasisPoints; // Bonus % for correct minority votes
        uint256 reputationWeightMultiplier; // Multiplier for reputation in selection
        // ERC-8004 Trustless Agents integration
        IIdentityRegistry identityRegistry;
        IReputationRegistry reputationRegistry;
        IValidationRegistry validationRegistry;
        bool erc8004Enabled;
    }

    struct MarketsStorage {
        mapping(uint256 => Market) markets;
        mapping(uint256 => address[]) marketJudges;
        mapping(uint256 => mapping(address => Vote)) votes;
        mapping(uint256 => Challenge) challenges;
        mapping(uint256 => mapping(address => Commitment)) commitments;
        mapping(address => uint256[]) creatorMarkets;
        mapping(uint256 => address[]) selectedJudges;
    }

    struct JudgesStorage {
        mapping(address => Judge) judges;
        mapping(address => uint256[]) judgeMarkets;
        address[] activeJudgesList;
        mapping(uint256 => address) agentIdToJudge; // ERC-8004 agentId -> judge address
    }

    // ============================================================
    // EVENTS
    // ============================================================

    event JudgeRegistered(address indexed judge, uint256 stake, uint256 reputationScore);
    event JudgeDeregistered(address indexed judge, uint256 stakeReturned);
    event JudgeActivated(address indexed judge);
    event JudgeDeactivated(address indexed judge);
    event MarketCreated(uint256 indexed marketId, string question, address creator, uint256 requiredJudges);
    event JudgeSelected(uint256 indexed marketId, address indexed judge, uint256 selectionTime);
    event VoteCommitted(uint256 indexed marketId, address indexed judge, bytes32 commitHash);
    event VoteRevealed(uint256 indexed marketId, address indexed judge, Outcome outcome);
    event MarketResolved(uint256 indexed marketId, Outcome outcome, bytes32 evidenceHash);
    event ChallengeRaised(uint256 indexed marketId, address indexed challenger, Outcome claimedOutcome);
    event ChallengeResolved(uint256 indexed marketId, bool challengerWon, uint256 slashAmount);
    event RewardsDistributed(uint256 indexed marketId, uint256 totalRewards, uint256 judgeCount);
    event ProtocolFeesWithdrawn(address indexed to, uint256 amount);
    event ConfigUpdated(string param, uint256 oldValue, uint256 newValue);
    event SlashApplied(address indexed judge, uint256 amount, string reason);
    event CourtJoined(address indexed judge, uint256 indexed courtId);
    event CourtLeft(address indexed judge, uint256 indexed courtId);
    event JudgeSuspended(address indexed judge);
    event MarketCreatedWithCourt(
        uint256 indexed marketId, string question, address creator, uint256 requiredJudges, uint256 courtId
    );

    // ============================================================
    // ERRORS
    // ============================================================

    error InvalidStake();
    error AlreadyRegistered();
    error NotRegistered();
    error MarketNotFound();
    error InvalidResolutionTime();
    error MarketNotOpen();
    error AlreadyJoined();
    error NotMarketJudge();
    error InvalidOutcome();
    error NoMajority();
    error AlreadyResolved();
    error ChallengeWindowClosed();
    error ChallengeWindowOpen();
    error AlreadyChallenged();
    error InsufficientBalance();
    error TransferFailed();
    error Unauthorized();
    error InvalidConfig();
    error InvalidEvidence();
    error CommitAlreadyMade();
    error CommitNotFound();
    error RevealWindowClosed();
    error InvalidReveal();
    error NotInCommitPhase();
    error NotInRevealPhase();
    error JudgeAlreadyVoted();
    error SelectionAlreadyMade();
    error InvalidCourt();
    error NotQualifiedForCourt();
    error AlreadyInCourt();
    error CourtRequired();
    error HasActiveMarkets();
    error InvalidVoteOutcome();

    // ============================================================
    // STORAGE ACCESSORS
    // ============================================================

    function _getMainStorage() private pure returns (MainStorage storage $) {
        assembly {
            $.slot := MAIN_STORAGE_LOCATION
        }
    }

    function _getMarketsStorage() private pure returns (MarketsStorage storage $) {
        assembly {
            $.slot := MARKETS_STORAGE_LOCATION
        }
    }

    function _getJudgesStorage() private pure returns (JudgesStorage storage $) {
        assembly {
            $.slot := JUDGES_STORAGE_LOCATION
        }
    }

    // ============================================================
    // INITIALIZER
    // ============================================================

    function initialize(address _usdc, address _admin) public initializer {
        if (_usdc == address(0) || _admin == address(0)) revert InvalidConfig();

        __UUPSUpgradeable_init();
        __AccessControl_init();
        __ReentrancyGuard_init();
        __Pausable_init();

        MainStorage storage main = _getMainStorage();
        main.usdc = IERC20(_usdc);
        main.minJudgeStake = 1000 * 1e6;
        main.challengeStake = 1000 * 1e6;
        main.challengeWindow = 24 hours;
        main.protocolFeeBasisPoints = 100;
        main.slashPercentage = 5000;
        main.maxFailedResolutions = 3;
        main.commitRevealWindow = 12 hours;
        main.minorityBonusBasisPoints = 2500; // 25% bonus for correct minority votes
        main.reputationWeightMultiplier = 100; // 1x base weight

        _grantRole(DEFAULT_ADMIN_ROLE, _admin);
        _grantRole(UPGRADER_ROLE, _admin);
        _grantRole(MANAGER_ROLE, _admin);
        _grantRole(JUDGE_REGISTRAR_ROLE, _admin);
        _grantRole(CHALLENGE_RESOLVER_ROLE, _admin);
    }

    // ============================================================
    // UPGRADE AUTHORIZATION
    // ============================================================

    function _authorizeUpgrade(address newImplementation) internal override onlyRole(UPGRADER_ROLE) {}

    // ============================================================
    // EMERGENCY PAUSE
    // ============================================================

    function pause() external onlyRole(DEFAULT_ADMIN_ROLE) {
        _pause();
    }

    function unpause() external onlyRole(DEFAULT_ADMIN_ROLE) {
        _unpause();
    }

    // ============================================================
    // PROTOCOL FEE WITHDRAWAL
    // ============================================================

    function withdrawProtocolFees(address to, uint256 amount) external onlyRole(DEFAULT_ADMIN_ROLE) nonReentrant {
        MainStorage storage main = _getMainStorage();
        if (to == address(0)) revert InvalidConfig();
        if (amount > main.totalProtocolFees) revert InsufficientBalance();
        if (amount == 0) revert InvalidConfig();

        main.totalProtocolFees -= amount;

        if (!main.usdc.transfer(to, amount)) revert TransferFailed();

        emit ProtocolFeesWithdrawn(to, amount);
    }

    // ============================================================
    // ADMIN CONFIGURATION
    // ============================================================

    event USDCAddressUpdated(address indexed oldAddress, address indexed newAddress);

    function setUSDCAddress(address _usdc) external onlyRole(DEFAULT_ADMIN_ROLE) {
        if (_usdc == address(0)) revert InvalidConfig();
        MainStorage storage main = _getMainStorage();
        address oldAddress = address(main.usdc);
        main.usdc = IERC20(_usdc);
        emit USDCAddressUpdated(oldAddress, _usdc);
    }

    function setMinJudgeStake(uint256 _amount) external onlyRole(DEFAULT_ADMIN_ROLE) {
        MainStorage storage main = _getMainStorage();
        uint256 old = main.minJudgeStake;
        main.minJudgeStake = _amount;
        emit ConfigUpdated("minJudgeStake", old, _amount);
    }

    function setChallengeStake(uint256 _amount) external onlyRole(DEFAULT_ADMIN_ROLE) {
        MainStorage storage main = _getMainStorage();
        uint256 old = main.challengeStake;
        main.challengeStake = _amount;
        emit ConfigUpdated("challengeStake", old, _amount);
    }

    function setChallengeWindow(uint256 _window) external onlyRole(DEFAULT_ADMIN_ROLE) {
        MainStorage storage main = _getMainStorage();
        uint256 old = main.challengeWindow;
        main.challengeWindow = _window;
        emit ConfigUpdated("challengeWindow", old, _window);
    }

    function setCommitRevealWindow(uint256 _window) external onlyRole(DEFAULT_ADMIN_ROLE) {
        MainStorage storage main = _getMainStorage();
        uint256 old = main.commitRevealWindow;
        main.commitRevealWindow = _window;
        emit ConfigUpdated("commitRevealWindow", old, _window);
    }

    function setProtocolFeeBasisPoints(uint256 _bps) external onlyRole(DEFAULT_ADMIN_ROLE) {
        if (_bps > 10000) revert InvalidConfig();
        MainStorage storage main = _getMainStorage();
        uint256 old = main.protocolFeeBasisPoints;
        main.protocolFeeBasisPoints = _bps;
        emit ConfigUpdated("protocolFeeBasisPoints", old, _bps);
    }

    function setSlashPercentage(uint256 _pct) external onlyRole(DEFAULT_ADMIN_ROLE) {
        if (_pct > 10000) revert InvalidConfig();
        MainStorage storage main = _getMainStorage();
        uint256 old = main.slashPercentage;
        main.slashPercentage = _pct;
        emit ConfigUpdated("slashPercentage", old, _pct);
    }

    // ============================================================
    // JUDGE MANAGEMENT
    // ============================================================

    function registerAsJudge(uint256 stakeAmount) external nonReentrant whenNotPaused {
        MainStorage storage main = _getMainStorage();
        JudgesStorage storage judges = _getJudgesStorage();

        if (stakeAmount < main.minJudgeStake) revert InvalidStake();
        if (judges.judges[msg.sender].status != JudgeStatus.Inactive) revert AlreadyRegistered();

        if (!main.usdc.transferFrom(msg.sender, address(this), stakeAmount)) revert TransferFailed();

        uint256[] memory initialCourts = new uint256[](1);
        initialCourts[0] = uint256(CourtCategory.General);

        judges.judges[msg.sender] = Judge({
            stake: stakeAmount,
            successfulResolutions: 0,
            failedResolutions: 0,
            status: JudgeStatus.Active,
            registrationTime: block.timestamp,
            reputationScore: 5000,
            latestCommitment: bytes32(0),
            commitmentBlock: 0,
            courtIds: initialCourts,
            agentId: 0
        });

        judges.activeJudgesList.push(msg.sender);

        emit JudgeRegistered(msg.sender, stakeAmount, 5000);
    }

    /**
     * @notice Judge opts into a specialized sub-court
     * @param courtId The court category to join
     */
    function joinCourt(uint256 courtId) external whenNotPaused {
        JudgesStorage storage judges = _getJudgesStorage();
        Judge storage judge = judges.judges[msg.sender];

        if (judge.status != JudgeStatus.Active) revert NotRegistered();
        if (courtId > uint256(CourtCategory.Science)) revert InvalidCourt();

        // Check if already in this court
        for (uint256 i = 0; i < judge.courtIds.length; i++) {
            if (judge.courtIds[i] == courtId) revert AlreadyInCourt();
        }

        judge.courtIds.push(courtId);

        emit CourtJoined(msg.sender, courtId);
    }

    /**
     * @notice Judge leaves a specialized sub-court (keeps General)
     * @param courtId The court category to leave
     */
    function leaveCourt(uint256 courtId) external whenNotPaused {
        JudgesStorage storage judges = _getJudgesStorage();
        Judge storage judge = judges.judges[msg.sender];

        if (judge.status != JudgeStatus.Active) revert NotRegistered();
        if (courtId == uint256(CourtCategory.General)) revert InvalidCourt(); // Can't leave General

        bool found = false;
        for (uint256 i = 0; i < judge.courtIds.length; i++) {
            if (judge.courtIds[i] == courtId) {
                judge.courtIds[i] = judge.courtIds[judge.courtIds.length - 1];
                judge.courtIds.pop();
                found = true;
                break;
            }
        }

        if (!found) revert NotQualifiedForCourt();

        emit CourtLeft(msg.sender, courtId);
    }

    function deregisterAsJudge() external nonReentrant whenNotPaused {
        JudgesStorage storage judges = _getJudgesStorage();
        MarketsStorage storage markets = _getMarketsStorage();
        MainStorage storage main = _getMainStorage();

        Judge storage judge = judges.judges[msg.sender];
        if (judge.status != JudgeStatus.Active) revert NotRegistered();
        if (judge.latestCommitment != bytes32(0)) revert InvalidStake();

        // Prevent deregistration while assigned to unresolved markets
        uint256[] storage assignedMarkets = judges.judgeMarkets[msg.sender];
        for (uint256 i = 0; i < assignedMarkets.length; i++) {
            if (markets.markets[assignedMarkets[i]].status != MarketStatus.Resolved) {
                revert HasActiveMarkets();
            }
        }

        uint256 stakeToReturn = judge.stake;
        delete judges.judges[msg.sender];

        _removeFromActiveList(msg.sender);

        if (!main.usdc.transfer(msg.sender, stakeToReturn)) revert TransferFailed();

        emit JudgeDeregistered(msg.sender, stakeToReturn);
    }

    function _removeFromActiveList(address judge) internal {
        JudgesStorage storage judges = _getJudgesStorage();
        address[] storage list = judges.activeJudgesList;
        for (uint256 i = 0; i < list.length; i++) {
            if (list[i] == judge) {
                list[i] = list[list.length - 1];
                list.pop();
                break;
            }
        }
    }

    // ============================================================
    // MARKET CREATION & JUDGE SELECTION
    // ============================================================

    function createMarket(string calldata question, uint256 resolutionTime, uint256 requiredJudges, uint256 courtId)
        external
        whenNotPaused
        returns (uint256 marketId)
    {
        MainStorage storage main = _getMainStorage();
        MarketsStorage storage markets = _getMarketsStorage();

        if (bytes(question).length == 0 || bytes(question).length > 500) revert InvalidConfig();
        if (resolutionTime <= block.timestamp) revert InvalidResolutionTime();
        if (requiredJudges < 3 || requiredJudges > 21 || requiredJudges % 2 == 0) revert InvalidConfig();
        if (courtId > uint256(CourtCategory.Science)) revert InvalidCourt();

        marketId = main.marketCount++;

        markets.markets[marketId] = Market({
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
            challengeDeadline: 0,
            creationTime: block.timestamp,
            proposedOutcome: Outcome.None,
            proposer: address(0),
            proposalTime: 0,
            courtId: courtId
        });

        markets.creatorMarkets[msg.sender].push(marketId);

        emit MarketCreatedWithCourt(marketId, question, msg.sender, requiredJudges, courtId);
    }

    /**
     * @notice Check if a judge is qualified for a specific court
     * @param judge The judge address to check
     * @param courtId The court ID to check against
     * @return qualified True if judge is in the court (or General court)
     */
    function _isJudgeQualifiedForCourt(address judge, uint256 courtId) internal view returns (bool) {
        JudgesStorage storage judges = _getJudgesStorage();
        uint256[] storage judgeCourts = judges.judges[judge].courtIds;

        // General court (0) is always acceptable
        if (courtId == uint256(CourtCategory.General)) return true;

        for (uint256 i = 0; i < judgeCourts.length; i++) {
            if (judgeCourts[i] == courtId) {
                return true;
            }
        }
        return false;
    }

    function selectJudgesForMarket(uint256 marketId) external onlyRole(MANAGER_ROLE) whenNotPaused {
        MarketsStorage storage markets = _getMarketsStorage();
        JudgesStorage storage judges = _getJudgesStorage();
        MainStorage storage main = _getMainStorage();
        Market storage market = markets.markets[marketId];

        if (market.status != MarketStatus.Open) revert MarketNotOpen();
        if (markets.selectedJudges[marketId].length > 0) revert SelectionAlreadyMade();

        address[] storage activeList = judges.activeJudgesList;
        uint256 activeCount = activeList.length;

        if (activeCount < market.requiredJudges) revert InvalidConfig();

        // Build list of qualified judges for this court
        address[] memory qualifiedJudges = new address[](activeCount);
        uint256[] memory qualifiedWeights = new uint256[](activeCount);
        uint256 qualifiedCount = 0;
        uint256 totalReputationWeight = 0;

        for (uint256 i = 0; i < activeCount; i++) {
            address judgeAddr = activeList[i];

            // Verify judge is still active (defense-in-depth)
            if (judges.judges[judgeAddr].status != JudgeStatus.Active) continue;

            // Check if judge is qualified for this market's court
            if (_isJudgeQualifiedForCourt(judgeAddr, market.courtId)) {
                uint256 reputation = judges.judges[judgeAddr].reputationScore;
                // Weight = reputation * multiplier (default 100 = 1x)
                uint256 weight = reputation * main.reputationWeightMultiplier / 100;

                qualifiedJudges[qualifiedCount] = judgeAddr;
                qualifiedWeights[qualifiedCount] = weight;
                totalReputationWeight += weight;
                qualifiedCount++;
            }
        }

        if (qualifiedCount < market.requiredJudges) revert InvalidConfig();

        uint256 seed = uint256(keccak256(abi.encodePacked(block.timestamp, block.prevrandao, marketId, msg.sender)));

        uint256 selectedCount = 0;
        uint256 attempts = 0;
        uint256 maxAttempts = market.requiredJudges * 5; // More attempts with court filtering

        while (selectedCount < market.requiredJudges && attempts < maxAttempts) {
            attempts++;

            // Weighted random selection from qualified judges
            uint256 randomWeight = uint256(keccak256(abi.encodePacked(seed, attempts))) % totalReputationWeight;
            uint256 cumulativeWeight = 0;
            address selectedJudge;
            uint256 selectedIndex;

            for (uint256 i = 0; i < qualifiedCount; i++) {
                cumulativeWeight += qualifiedWeights[i];
                if (randomWeight < cumulativeWeight) {
                    selectedJudge = qualifiedJudges[i];
                    selectedIndex = i;
                    break;
                }
            }

            // Check if already selected
            bool alreadySelected = false;
            for (uint256 j = 0; j < markets.selectedJudges[marketId].length; j++) {
                if (markets.selectedJudges[marketId][j] == selectedJudge) {
                    alreadySelected = true;
                    break;
                }
            }

            if (!alreadySelected && selectedJudge != address(0)) {
                markets.selectedJudges[marketId].push(selectedJudge);
                markets.marketJudges[marketId].push(selectedJudge);
                judges.judgeMarkets[selectedJudge].push(marketId);
                emit JudgeSelected(marketId, selectedJudge, block.timestamp);
                selectedCount++;

                // Remove selected judge's weight from total to normalize remaining
                totalReputationWeight -= qualifiedWeights[selectedIndex];
                qualifiedWeights[selectedIndex] = 0;
            }
        }
    }

    // ============================================================
    // COMMIT-REVEAL VOTING
    // ============================================================

    function commitVote(uint256 marketId, bytes32 commitHash) external whenNotPaused {
        MarketsStorage storage markets = _getMarketsStorage();
        JudgesStorage storage judges = _getJudgesStorage();
        MainStorage storage main = _getMainStorage();

        Market storage market = markets.markets[marketId];
        if (market.status != MarketStatus.Open && market.status != MarketStatus.Resolving) {
            revert MarketNotOpen();
        }
        if (block.timestamp > market.resolutionTime + main.commitRevealWindow) revert RevealWindowClosed();

        bool isSelected = false;
        for (uint256 i = 0; i < markets.selectedJudges[marketId].length; i++) {
            if (markets.selectedJudges[marketId][i] == msg.sender) {
                isSelected = true;
                break;
            }
        }
        if (!isSelected) revert NotMarketJudge();

        if (markets.commitments[marketId][msg.sender].commitHash != bytes32(0)) revert CommitAlreadyMade();

        markets.commitments[marketId][msg.sender] =
            Commitment({commitHash: commitHash, blockNumber: block.number, revealed: false});

        judges.judges[msg.sender].latestCommitment = commitHash;
        judges.judges[msg.sender].commitmentBlock = block.number;

        emit VoteCommitted(marketId, msg.sender, commitHash);

        if (market.status == MarketStatus.Open) {
            market.status = MarketStatus.Resolving;
        }
    }

    function revealVote(uint256 marketId, Outcome outcome, bytes32 salt, bytes32 evidenceHash, bytes32 rationaleHash)
        external
        whenNotPaused
    {
        MarketsStorage storage markets = _getMarketsStorage();
        JudgesStorage storage judges = _getJudgesStorage();
        MainStorage storage main = _getMainStorage();

        Market storage market = markets.markets[marketId];
        Commitment storage commitment = markets.commitments[marketId][msg.sender];

        if (market.status != MarketStatus.Resolving) revert NotInRevealPhase();
        if (commitment.commitHash == bytes32(0)) revert CommitNotFound();
        if (commitment.revealed) revert JudgeAlreadyVoted();
        if (block.timestamp > market.resolutionTime + main.commitRevealWindow * 2) revert RevealWindowClosed();
        if (outcome == Outcome.None) revert InvalidVoteOutcome();

        bytes32 computedHash = keccak256(abi.encodePacked(outcome, salt));
        if (computedHash != commitment.commitHash) revert InvalidReveal();

        commitment.revealed = true;

        markets.votes[marketId][msg.sender] = Vote({
            judge: msg.sender,
            outcome: outcome,
            timestamp: block.timestamp,
            evidenceHash: evidenceHash,
            rationaleHash: rationaleHash,
            revealed: true
        });

        judges.judges[msg.sender].latestCommitment = bytes32(0);
        judges.judges[msg.sender].commitmentBlock = 0;

        emit VoteRevealed(marketId, msg.sender, outcome);

        _checkAndResolveMarket(marketId);
    }

    function _checkAndResolveMarket(uint256 marketId) internal {
        MarketsStorage storage markets = _getMarketsStorage();
        Market storage market = markets.markets[marketId];

        uint256 yesVotes = 0;
        uint256 noVotes = 0;
        uint256 revealedCount = 0;

        for (uint256 i = 0; i < markets.selectedJudges[marketId].length; i++) {
            address judgeAddr = markets.selectedJudges[marketId][i];
            Vote memory vote = markets.votes[marketId][judgeAddr];

            if (vote.revealed) {
                revealedCount++;
                if (vote.outcome == Outcome.Yes) yesVotes++;
                else if (vote.outcome == Outcome.No) noVotes++;
            }
        }

        if (revealedCount < market.requiredJudges) return;

        if (yesVotes > noVotes && yesVotes > market.requiredJudges / 2) {
            market.outcome = Outcome.Yes;
        } else if (noVotes > yesVotes && noVotes > market.requiredJudges / 2) {
            market.outcome = Outcome.No;
        } else {
            return;
        }

        market.status = MarketStatus.Resolving;
        market.resolutionTimestamp = block.timestamp;
        market.challengeDeadline = block.timestamp + _getMainStorage().challengeWindow;

        emit MarketResolved(marketId, market.outcome, market.evidenceHash);
    }

    // ============================================================
    // CHALLENGE MECHANISM
    // ============================================================

    function challengeResolution(uint256 marketId, Outcome claimedOutcome) external nonReentrant whenNotPaused {
        MarketsStorage storage markets = _getMarketsStorage();
        MainStorage storage main = _getMainStorage();
        Market storage market = markets.markets[marketId];

        if (market.status != MarketStatus.Resolving) revert NotInRevealPhase();
        if (block.timestamp > market.challengeDeadline) revert ChallengeWindowClosed();
        if (claimedOutcome == Outcome.None) revert InvalidVoteOutcome();
        if (claimedOutcome == market.outcome) revert InvalidOutcome();
        if (markets.challenges[marketId].challenger != address(0)) revert AlreadyChallenged();

        if (!main.usdc.transferFrom(msg.sender, address(this), main.challengeStake)) revert TransferFailed();

        markets.challenges[marketId] = Challenge({
            challenger: msg.sender,
            claimedOutcome: claimedOutcome,
            stake: main.challengeStake,
            timestamp: block.timestamp,
            resolved: false,
            challengerWon: false
        });

        market.status = MarketStatus.Challenged;

        emit ChallengeRaised(marketId, msg.sender, claimedOutcome);
    }

    function resolveChallenge(uint256 marketId, bool challengerWon) external onlyRole(CHALLENGE_RESOLVER_ROLE) {
        MarketsStorage storage markets = _getMarketsStorage();
        Market storage market = markets.markets[marketId];
        Challenge storage challenge = markets.challenges[marketId];
        MainStorage storage main = _getMainStorage();

        if (market.status != MarketStatus.Challenged) revert NotInRevealPhase();
        if (challenge.resolved) revert AlreadyChallenged();

        challenge.resolved = true;
        challenge.challengerWon = challengerWon;

        if (challengerWon) {
            market.outcome = challenge.claimedOutcome;
            if (!main.usdc.transfer(challenge.challenger, challenge.stake)) revert TransferFailed();
            _slashIncorrectJudges(marketId);
        } else {
            main.totalProtocolFees += challenge.stake;
        }

        market.status = MarketStatus.Resolved;

        _distributeRewards(marketId);

        emit ChallengeResolved(marketId, challengerWon, challengerWon ? challenge.stake : 0);
    }

    function finalizeResolution(uint256 marketId) external whenNotPaused {
        MarketsStorage storage markets = _getMarketsStorage();
        Market storage market = markets.markets[marketId];

        if (market.status != MarketStatus.Resolving) revert NotInRevealPhase();
        if (block.timestamp <= market.challengeDeadline) revert ChallengeWindowOpen();
        if (markets.challenges[marketId].challenger != address(0)) revert AlreadyChallenged();

        market.status = MarketStatus.Resolved;

        _distributeRewards(marketId);
    }

    // ============================================================
    // SLASHING & REWARDS
    // ============================================================

    function _slashIncorrectJudges(uint256 marketId) internal {
        MarketsStorage storage markets = _getMarketsStorage();
        JudgesStorage storage judges = _getJudgesStorage();
        MainStorage storage main = _getMainStorage();
        Market storage market = markets.markets[marketId];

        uint256 totalSlash = 0;

        for (uint256 i = 0; i < markets.selectedJudges[marketId].length; i++) {
            address judgeAddr = markets.selectedJudges[marketId][i];
            Vote memory vote = markets.votes[marketId][judgeAddr];

            if (vote.outcome != market.outcome && vote.revealed) {
                Judge storage judge = judges.judges[judgeAddr];
                uint256 slashAmount = (judge.stake * main.slashPercentage) / 10000;
                judge.stake -= slashAmount;
                totalSlash += slashAmount;
                judge.failedResolutions++;

                if (judge.failedResolutions >= main.maxFailedResolutions) {
                    judge.status = JudgeStatus.Suspended;
                    _removeFromActiveList(judgeAddr);
                    emit JudgeSuspended(judgeAddr);
                }

                emit SlashApplied(judgeAddr, slashAmount, "Incorrect vote");
            }
        }

        if (totalSlash > 0) {
            uint256 protocolFee = (totalSlash * main.protocolFeeBasisPoints) / 10000;
            main.totalProtocolFees += protocolFee;
            market.judgeRewardPool += totalSlash - protocolFee;
        }
    }

    function _distributeRewards(uint256 marketId) internal {
        MarketsStorage storage markets = _getMarketsStorage();
        JudgesStorage storage judges = _getJudgesStorage();
        MainStorage storage main = _getMainStorage();
        Market storage market = markets.markets[marketId];

        uint256 yesVotes = 0;
        uint256 noVotes = 0;
        uint256 correctCount = 0;
        uint256 minorityCorrectCount = 0;

        // First pass: count votes and identify majority/minority
        for (uint256 i = 0; i < markets.selectedJudges[marketId].length; i++) {
            address judgeAddr = markets.selectedJudges[marketId][i];
            Vote memory vote = markets.votes[marketId][judgeAddr];

            if (vote.revealed) {
                if (vote.outcome == Outcome.Yes) yesVotes++;
                else if (vote.outcome == Outcome.No) noVotes++;

                if (vote.outcome == market.outcome) {
                    correctCount++;
                }
            }
        }

        // Determine minority outcome (the losing side)
        Outcome minorityOutcome = (yesVotes > noVotes) ? Outcome.No : Outcome.Yes;

        // Calculate per-judge USDC reward from slashing pool
        uint256 rewardPerJudge = 0;
        if (market.judgeRewardPool > 0 && correctCount > 0) {
            rewardPerJudge = market.judgeRewardPool / correctCount;
        }

        uint256 distributed = 0;

        // Second pass: distribute rewards, reputation, and USDC
        for (uint256 i = 0; i < markets.selectedJudges[marketId].length; i++) {
            address judgeAddr = markets.selectedJudges[marketId][i];
            Vote memory vote = markets.votes[marketId][judgeAddr];

            if (vote.outcome == market.outcome && vote.revealed) {
                judges.judges[judgeAddr].successfulResolutions++;

                // Transfer USDC reward from slashing pool
                if (rewardPerJudge > 0) {
                    if (!main.usdc.transfer(judgeAddr, rewardPerJudge)) revert TransferFailed();
                    distributed += rewardPerJudge;
                }

                // Bonus for correct minority voters (voted against the majority trend)
                if (market.outcome == minorityOutcome) {
                    minorityCorrectCount++;
                    // Increase reputation score for correct minority votes
                    uint256 reputationBoost = main.minorityBonusBasisPoints / 100;
                    judges.judges[judgeAddr].reputationScore += reputationBoost;
                    if (judges.judges[judgeAddr].reputationScore > 10000) {
                        judges.judges[judgeAddr].reputationScore = 10000;
                    }
                }
            }
        }

        // Route any dust from integer division to protocol fees
        if (market.judgeRewardPool > distributed) {
            main.totalProtocolFees += market.judgeRewardPool - distributed;
        }
        market.judgeRewardPool = 0;

        emit RewardsDistributed(marketId, distributed, correctCount);
    }

    // ============================================================
    // VIEW FUNCTIONS
    // ============================================================

    function getMarket(uint256 marketId) external view returns (Market memory) {
        return _getMarketsStorage().markets[marketId];
    }

    function getJudge(address judgeAddr) external view returns (Judge memory) {
        return _getJudgesStorage().judges[judgeAddr];
    }

    function getSelectedJudges(uint256 marketId) external view returns (address[] memory) {
        return _getMarketsStorage().selectedJudges[marketId];
    }

    function getVote(uint256 marketId, address judge) external view returns (Vote memory) {
        return _getMarketsStorage().votes[marketId][judge];
    }

    function getChallenge(uint256 marketId) external view returns (Challenge memory) {
        return _getMarketsStorage().challenges[marketId];
    }

    // ============================================================
    // COURT VIEW FUNCTIONS
    // ============================================================

    /**
     * @notice Get all courts a judge is qualified for
     * @param judgeAddr The judge address
     * @return courtIds Array of court IDs the judge belongs to
     */
    function getJudgeCourts(address judgeAddr) external view returns (uint256[] memory) {
        return _getJudgesStorage().judges[judgeAddr].courtIds;
    }

    /**
     * @notice Check if a judge is qualified for a specific court
     * @param judgeAddr The judge address
     * @param courtId The court ID to check
     * @return qualified True if judge qualifies for this court
     */
    function isJudgeQualifiedForCourt(address judgeAddr, uint256 courtId) external view returns (bool) {
        return _isJudgeQualifiedForCourt(judgeAddr, courtId);
    }

    // Court names (off-chain reference — not stored on-chain to save bytecode):
    // 0 = General, 1 = Finance, 2 = Sports, 3 = Politics,
    // 4 = Technology, 5 = Entertainment, 6 = Crypto, 7 = Science

    // ============================================================
    // JUDGE REINSTATEMENT
    // ============================================================

    event JudgeReinstated(address indexed judge);
    error NotSuspended();

    function reinstateSuspendedJudge(address judgeAddr) external onlyRole(JUDGE_REGISTRAR_ROLE) {
        JudgesStorage storage judges = _getJudgesStorage();
        Judge storage judge = judges.judges[judgeAddr];

        if (judge.status != JudgeStatus.Suspended) revert NotSuspended();

        judge.status = JudgeStatus.Active;
        judge.failedResolutions = 0;
        judges.activeJudgesList.push(judgeAddr);

        emit JudgeReinstated(judgeAddr);
    }

    // ============================================================
    // MARKET CANCELLATION
    // ============================================================

    event MarketCancelled(uint256 indexed marketId);
    error MarketAlreadyResolved();

    function cancelMarket(uint256 marketId) external onlyRole(MANAGER_ROLE) {
        MarketsStorage storage markets = _getMarketsStorage();
        JudgesStorage storage judges = _getJudgesStorage();
        Market storage market = markets.markets[marketId];

        if (market.status == MarketStatus.Resolved) revert MarketAlreadyResolved();
        if (market.creator == address(0)) revert MarketNotFound();

        // Clear judge commitments so they aren't locked
        for (uint256 i = 0; i < markets.selectedJudges[marketId].length; i++) {
            address judgeAddr = markets.selectedJudges[marketId][i];
            if (markets.commitments[marketId][judgeAddr].commitHash != bytes32(0)
                && !markets.commitments[marketId][judgeAddr].revealed)
            {
                judges.judges[judgeAddr].latestCommitment = bytes32(0);
                judges.judges[judgeAddr].commitmentBlock = 0;
            }
        }

        market.outcome = Outcome.None;
        market.status = MarketStatus.Resolved;

        emit MarketCancelled(marketId);
    }

    // ============================================================
    // STATS VIEW FUNCTIONS
    // ============================================================

    function getMarketCount() external view returns (uint256) {
        return _getMainStorage().marketCount;
    }

    function getActiveJudgesCount() external view returns (uint256) {
        return _getJudgesStorage().activeJudgesList.length;
    }

    function getCourtJudgesCount(uint256 courtId) external view returns (uint256) {
        JudgesStorage storage judges = _getJudgesStorage();
        address[] storage activeList = judges.activeJudgesList;
        uint256 count = 0;
        for (uint256 i = 0; i < activeList.length; i++) {
            if (_isJudgeQualifiedForCourt(activeList[i], courtId)) {
                count++;
            }
        }
        return count;
    }

    function getConfig()
        external
        view
        returns (
            uint256 minJudgeStake,
            uint256 challengeStake,
            uint256 challengeWindow,
            uint256 protocolFeeBasisPoints,
            uint256 slashPercentage,
            uint256 commitRevealWindow
        )
    {
        MainStorage storage main = _getMainStorage();
        return (
            main.minJudgeStake,
            main.challengeStake,
            main.challengeWindow,
            main.protocolFeeBasisPoints,
            main.slashPercentage,
            main.commitRevealWindow
        );
    }

    // ============================================================
    // ERC-8004 TRUSTLESS AGENTS INTEGRATION
    // ============================================================

    event ERC8004RegistriesSet(address identityRegistry, address reputationRegistry, address validationRegistry);
    event ERC8004Toggled(bool enabled);
    event AgentLinked(address indexed judge, uint256 indexed agentId);
    event AgentUnlinked(address indexed judge, uint256 indexed agentId);
    event ResolutionFeedbackPosted(uint256 indexed marketId, uint256 indexed agentId, uint8 score);

    error ERC8004NotEnabled();
    error AgentAlreadyLinked();
    error AgentNotLinked();
    error NotAgentOwner();
    error AgentLinkedToOtherJudge();

    /// @notice Set ERC-8004 registry addresses (admin only)
    function setERC8004Registries(address _identityRegistry, address _reputationRegistry, address _validationRegistry)
        external
        onlyRole(DEFAULT_ADMIN_ROLE)
    {
        MainStorage storage main = _getMainStorage();
        main.identityRegistry = IIdentityRegistry(_identityRegistry);
        main.reputationRegistry = IReputationRegistry(_reputationRegistry);
        main.validationRegistry = IValidationRegistry(_validationRegistry);
        emit ERC8004RegistriesSet(_identityRegistry, _reputationRegistry, _validationRegistry);
    }

    /// @notice Enable or disable ERC-8004 integration (admin only)
    function setERC8004Enabled(bool enabled) external onlyRole(DEFAULT_ADMIN_ROLE) {
        _getMainStorage().erc8004Enabled = enabled;
        emit ERC8004Toggled(enabled);
    }

    /// @notice Link an ERC-8004 agent NFT to a registered judge
    /// @param agentId The ERC-8004 agent NFT token ID
    function linkAgentId(uint256 agentId) external whenNotPaused {
        MainStorage storage main = _getMainStorage();
        JudgesStorage storage judges = _getJudgesStorage();

        if (!main.erc8004Enabled) revert ERC8004NotEnabled();
        if (judges.judges[msg.sender].status != JudgeStatus.Active) revert NotRegistered();
        if (judges.judges[msg.sender].agentId != 0) revert AgentAlreadyLinked();
        if (main.identityRegistry.ownerOf(agentId) != msg.sender) revert NotAgentOwner();
        if (judges.agentIdToJudge[agentId] != address(0)) revert AgentLinkedToOtherJudge();

        judges.judges[msg.sender].agentId = agentId;
        judges.agentIdToJudge[agentId] = msg.sender;

        emit AgentLinked(msg.sender, agentId);
    }

    /// @notice Unlink an ERC-8004 agent NFT from a judge
    function unlinkAgentId() external whenNotPaused {
        JudgesStorage storage judges = _getJudgesStorage();

        uint256 agentId = judges.judges[msg.sender].agentId;
        if (agentId == 0) revert AgentNotLinked();

        judges.judges[msg.sender].agentId = 0;
        delete judges.agentIdToJudge[agentId];

        emit AgentUnlinked(msg.sender, agentId);
    }

    /// @notice Register as judge with an ERC-8004 agent identity, bootstrapping reputation
    /// @param stakeAmount USDC amount to stake (must meet minimum)
    /// @param agentId ERC-8004 agent NFT ID to link (0 to skip)
    function registerAsJudgeWithAgent(uint256 stakeAmount, uint256 agentId) external nonReentrant whenNotPaused {
        MainStorage storage main = _getMainStorage();
        JudgesStorage storage judges = _getJudgesStorage();

        if (stakeAmount < main.minJudgeStake) revert InvalidStake();
        if (judges.judges[msg.sender].status != JudgeStatus.Inactive) revert AlreadyRegistered();

        if (!main.usdc.transferFrom(msg.sender, address(this), stakeAmount)) revert TransferFailed();

        uint256[] memory initialCourts = new uint256[](1);
        initialCourts[0] = uint256(CourtCategory.General);

        uint256 linkedAgentId = 0;
        uint256 initialReputation = 5000;

        // Bootstrap reputation from ERC-8004 if agent provided and enabled
        if (agentId > 0 && main.erc8004Enabled) {
            if (main.identityRegistry.ownerOf(agentId) != msg.sender) revert NotAgentOwner();
            if (judges.agentIdToJudge[agentId] != address(0)) revert AgentLinkedToOtherJudge();

            linkedAgentId = agentId;
            judges.agentIdToJudge[agentId] = msg.sender;

            // Read external reputation and map 0-100 scale to 0-10000
            (uint64 feedbackCount, uint8 avgScore) = main.reputationRegistry
                .getSummary(
                    agentId,
                    new address[](0), // all clients
                    bytes32(0), // no tag filter
                    bytes32(0)
                );

            if (feedbackCount > 0) {
                initialReputation = uint256(avgScore) * 100;
            }
        }

        judges.judges[msg.sender] = Judge({
            stake: stakeAmount,
            successfulResolutions: 0,
            failedResolutions: 0,
            status: JudgeStatus.Active,
            registrationTime: block.timestamp,
            reputationScore: initialReputation,
            latestCommitment: bytes32(0),
            commitmentBlock: 0,
            courtIds: initialCourts,
            agentId: linkedAgentId
        });

        judges.activeJudgesList.push(msg.sender);

        emit JudgeRegistered(msg.sender, stakeAmount, initialReputation);
        if (linkedAgentId > 0) {
            emit AgentLinked(msg.sender, linkedAgentId);
        }
    }

    /// @notice Get the ERC-8004 agent ID linked to a judge
    function getAgentId(address judgeAddr) external view returns (uint256) {
        return _getJudgesStorage().judges[judgeAddr].agentId;
    }

    /// @notice Get the judge address linked to an ERC-8004 agent ID
    function getJudgeByAgentId(uint256 agentId) external view returns (address) {
        return _getJudgesStorage().agentIdToJudge[agentId];
    }

    /// @notice Check if ERC-8004 integration is enabled
    function isERC8004Enabled() external view returns (bool) {
        return _getMainStorage().erc8004Enabled;
    }

    /// @notice Get ERC-8004 registry addresses
    function getERC8004Registries() external view returns (address identity, address reputation, address validation) {
        MainStorage storage main = _getMainStorage();
        return (address(main.identityRegistry), address(main.reputationRegistry), address(main.validationRegistry));
    }
}

