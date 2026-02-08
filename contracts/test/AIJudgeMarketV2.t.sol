// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Test, console} from "forge-std/Test.sol";
import {ERC1967Proxy} from "@openzeppelin/contracts/proxy/ERC1967/ERC1967Proxy.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "../src/AIJudgeMarketV2.sol";

/// @dev Minimal mock ERC20 for testing (USDC-like, 6 decimals)
contract MockERC20 is IERC20 {
    string public name = "Mock USDC";
    string public symbol = "USDC";
    uint8 public decimals = 6;
    uint256 public totalSupply;
    mapping(address => uint256) public balanceOf;
    mapping(address => mapping(address => uint256)) public allowance;

    function mint(address to, uint256 amount) external {
        balanceOf[to] += amount;
        totalSupply += amount;
    }

    function approve(address spender, uint256 amount) external returns (bool) {
        allowance[msg.sender][spender] = amount;
        emit Approval(msg.sender, spender, amount);
        return true;
    }

    function transfer(address to, uint256 amount) external returns (bool) {
        require(balanceOf[msg.sender] >= amount, "insufficient balance");
        balanceOf[msg.sender] -= amount;
        balanceOf[to] += amount;
        emit Transfer(msg.sender, to, amount);
        return true;
    }

    function transferFrom(address from, address to, uint256 amount) external returns (bool) {
        require(balanceOf[from] >= amount, "insufficient balance");
        require(allowance[from][msg.sender] >= amount, "insufficient allowance");
        allowance[from][msg.sender] -= amount;
        balanceOf[from] -= amount;
        balanceOf[to] += amount;
        emit Transfer(from, to, amount);
        return true;
    }
}

contract AIJudgeMarketV2Test is Test {
    AIJudgeMarket public market;
    MockERC20 public usdc;
    ERC1967Proxy public proxy;

    address public admin = address(1);
    address public judge1 = address(2);
    address public judge2 = address(3);
    address public judge3 = address(4);
    address public challenger = address(5);
    address public creator = address(6);
    address public judge4 = address(7);
    address public judge5 = address(8);

    uint256 constant STAKE = 1000 * 1e6; // 1000 USDC
    uint256 constant BIG_STAKE = 5000 * 1e6;

    function setUp() public {
        // Deploy mock USDC
        usdc = new MockERC20();

        // Deploy implementation
        AIJudgeMarket impl = new AIJudgeMarket();

        // Deploy proxy
        bytes memory initData = abi.encodeWithSelector(AIJudgeMarket.initialize.selector, address(usdc), admin);
        proxy = new ERC1967Proxy(address(impl), initData);
        market = AIJudgeMarket(address(proxy));

        // Fund test accounts
        usdc.mint(judge1, BIG_STAKE);
        usdc.mint(judge2, BIG_STAKE);
        usdc.mint(judge3, BIG_STAKE);
        usdc.mint(judge4, BIG_STAKE);
        usdc.mint(judge5, BIG_STAKE);
        usdc.mint(challenger, BIG_STAKE);

        // Approve contract
        vm.prank(judge1);
        usdc.approve(address(market), type(uint256).max);
        vm.prank(judge2);
        usdc.approve(address(market), type(uint256).max);
        vm.prank(judge3);
        usdc.approve(address(market), type(uint256).max);
        vm.prank(judge4);
        usdc.approve(address(market), type(uint256).max);
        vm.prank(judge5);
        usdc.approve(address(market), type(uint256).max);
        vm.prank(challenger);
        usdc.approve(address(market), type(uint256).max);
    }

    // ================================================================
    // HELPERS
    // ================================================================

    function _registerJudge(address judge) internal {
        vm.prank(judge);
        market.registerAsJudge(STAKE);
    }

    function _registerThreeJudges() internal {
        _registerJudge(judge1);
        _registerJudge(judge2);
        _registerJudge(judge3);
    }

    function _createMarket() internal returns (uint256) {
        vm.prank(creator);
        return
            market.createMarket(
                "Will BTC hit $100k by March 2026?",
                block.timestamp + 30 days,
                3,
                0 // General court
            );
    }

    function _selectJudges(uint256 marketId) internal {
        vm.prank(admin);
        market.selectJudgesForMarket(marketId);
    }

    function _commitVote(address judge, uint256 marketId, AIJudgeMarket.Outcome outcome, bytes32 salt) internal {
        bytes32 commitHash = keccak256(abi.encodePacked(outcome, salt));
        vm.prank(judge);
        market.commitVote(marketId, commitHash);
    }

    function _revealVote(address judge, uint256 marketId, AIJudgeMarket.Outcome outcome, bytes32 salt) internal {
        vm.prank(judge);
        market.revealVote(marketId, outcome, salt, keccak256("evidence"), keccak256("rationale"));
    }

    // ================================================================
    // TEST: Full lifecycle happy path
    // ================================================================

    function test_FullLifecycleHappyPath() public {
        // 1. Register 3 judges
        _registerThreeJudges();
        assertEq(market.getActiveJudgesCount(), 3);

        // 2. Create market
        uint256 marketId = _createMarket();
        assertEq(market.getMarketCount(), 1);

        // 3. Select judges
        _selectJudges(marketId);
        address[] memory selected = market.getSelectedJudges(marketId);
        assertEq(selected.length, 3);

        // 4. Commit votes (2 Yes, 1 No)
        bytes32 salt1 = keccak256("salt1");
        bytes32 salt2 = keccak256("salt2");
        bytes32 salt3 = keccak256("salt3");

        _commitVote(selected[0], marketId, AIJudgeMarket.Outcome.Yes, salt1);
        _commitVote(selected[1], marketId, AIJudgeMarket.Outcome.Yes, salt2);
        _commitVote(selected[2], marketId, AIJudgeMarket.Outcome.No, salt3);

        // 5. Reveal votes
        _revealVote(selected[0], marketId, AIJudgeMarket.Outcome.Yes, salt1);
        _revealVote(selected[1], marketId, AIJudgeMarket.Outcome.Yes, salt2);
        _revealVote(selected[2], marketId, AIJudgeMarket.Outcome.No, salt3);

        // 6. Check resolution
        AIJudgeMarket.Market memory m = market.getMarket(marketId);
        assertEq(uint256(m.outcome), uint256(AIJudgeMarket.Outcome.Yes));
        assertTrue(m.challengeDeadline > block.timestamp);

        // 7. Finalize after challenge window
        vm.warp(m.challengeDeadline + 1);
        market.finalizeResolution(marketId);

        m = market.getMarket(marketId);
        assertEq(uint256(m.status), uint256(AIJudgeMarket.MarketStatus.Resolved));
    }

    // ================================================================
    // TEST: Judge registration
    // ================================================================

    function test_RegisterAsJudge() public {
        vm.prank(judge1);
        market.registerAsJudge(STAKE);

        AIJudgeMarket.Judge memory j = market.getJudge(judge1);
        assertEq(j.stake, STAKE);
        assertEq(uint256(j.status), uint256(AIJudgeMarket.JudgeStatus.Active));
        assertEq(j.reputationScore, 5000);
        assertEq(market.getActiveJudgesCount(), 1);
    }

    function test_RevertDoubleRegistration() public {
        _registerJudge(judge1);
        vm.prank(judge1);
        vm.expectRevert(AIJudgeMarket.AlreadyRegistered.selector);
        market.registerAsJudge(STAKE);
    }

    function test_RevertInsufficientStake() public {
        vm.prank(judge1);
        vm.expectRevert(AIJudgeMarket.InvalidStake.selector);
        market.registerAsJudge(100 * 1e6); // Only 100 USDC
    }

    function test_DeregisterJudge() public {
        _registerJudge(judge1);
        uint256 balBefore = usdc.balanceOf(judge1);

        vm.prank(judge1);
        market.deregisterAsJudge();

        assertEq(usdc.balanceOf(judge1), balBefore + STAKE);
        assertEq(market.getActiveJudgesCount(), 0);
    }

    // ================================================================
    // TEST: Market creation
    // ================================================================

    function test_CreateMarket() public {
        uint256 marketId = _createMarket();
        assertEq(marketId, 0);

        AIJudgeMarket.Market memory m = market.getMarket(marketId);
        assertEq(m.creator, creator);
        assertEq(uint256(m.status), uint256(AIJudgeMarket.MarketStatus.Open));
        assertEq(m.requiredJudges, 3);
        assertEq(m.courtId, 0);
    }

    function test_RevertEmptyQuestion() public {
        vm.prank(creator);
        vm.expectRevert(AIJudgeMarket.InvalidConfig.selector);
        market.createMarket("", block.timestamp + 1 days, 3, 0);
    }

    function test_RevertPastResolutionTime() public {
        vm.prank(creator);
        vm.expectRevert(AIJudgeMarket.InvalidResolutionTime.selector);
        market.createMarket("test", block.timestamp - 1, 3, 0);
    }

    function test_RevertTooFewJudges() public {
        vm.prank(creator);
        vm.expectRevert(AIJudgeMarket.InvalidConfig.selector);
        market.createMarket("test", block.timestamp + 1 days, 2, 0);
    }

    // ================================================================
    // TEST: Access control
    // ================================================================

    function test_OnlyAdminCanPause() public {
        vm.prank(judge1);
        vm.expectRevert();
        market.pause();

        vm.prank(admin);
        market.pause();
    }

    function test_OnlyManagerCanSelectJudges() public {
        _registerThreeJudges();
        uint256 marketId = _createMarket();

        vm.prank(judge1);
        vm.expectRevert();
        market.selectJudgesForMarket(marketId);
    }

    function test_OnlyRegistrarCanReinstate() public {
        _registerJudge(judge1);

        vm.prank(judge2);
        vm.expectRevert();
        market.reinstateSuspendedJudge(judge1);
    }

    // ================================================================
    // TEST: Commit-reveal edge cases
    // ================================================================

    function test_RevertInvalidReveal() public {
        _registerThreeJudges();
        uint256 marketId = _createMarket();
        _selectJudges(marketId);

        address[] memory selected = market.getSelectedJudges(marketId);
        bytes32 salt = keccak256("salt1");

        // Commit with Yes
        _commitVote(selected[0], marketId, AIJudgeMarket.Outcome.Yes, salt);

        // Try to reveal with No (wrong outcome) — should fail
        vm.prank(selected[0]);
        vm.expectRevert(AIJudgeMarket.InvalidReveal.selector);
        market.revealVote(marketId, AIJudgeMarket.Outcome.No, salt, keccak256("evidence"), keccak256("rationale"));
    }

    function test_RevertDoubleCommit() public {
        _registerThreeJudges();
        uint256 marketId = _createMarket();
        _selectJudges(marketId);

        address[] memory selected = market.getSelectedJudges(marketId);
        bytes32 salt = keccak256("salt1");

        _commitVote(selected[0], marketId, AIJudgeMarket.Outcome.Yes, salt);

        // Double commit should fail
        vm.prank(selected[0]);
        vm.expectRevert(AIJudgeMarket.CommitAlreadyMade.selector);
        market.commitVote(marketId, keccak256(abi.encodePacked(AIJudgeMarket.Outcome.No, salt)));
    }

    function test_RevertNonSelectedJudgeCommit() public {
        _registerThreeJudges();
        _registerJudge(judge4);
        uint256 marketId = _createMarket();
        _selectJudges(marketId);

        // judge4 was not selected (or might be — check)
        address[] memory selected = market.getSelectedJudges(marketId);
        bool isSelected = false;
        for (uint256 i = 0; i < selected.length; i++) {
            if (selected[i] == judge4) isSelected = true;
        }

        if (!isSelected) {
            bytes32 commitHash = keccak256(abi.encodePacked(AIJudgeMarket.Outcome.Yes, bytes32("salt")));
            vm.prank(judge4);
            vm.expectRevert(AIJudgeMarket.NotMarketJudge.selector);
            market.commitVote(marketId, commitHash);
        }
    }

    // ================================================================
    // TEST: Challenge mechanism
    // ================================================================

    function test_ChallengeAfterWindowReverts() public {
        _registerThreeJudges();
        uint256 marketId = _createMarket();
        _selectJudges(marketId);

        address[] memory selected = market.getSelectedJudges(marketId);
        bytes32 salt1 = keccak256("s1");
        bytes32 salt2 = keccak256("s2");
        bytes32 salt3 = keccak256("s3");

        _commitVote(selected[0], marketId, AIJudgeMarket.Outcome.Yes, salt1);
        _commitVote(selected[1], marketId, AIJudgeMarket.Outcome.Yes, salt2);
        _commitVote(selected[2], marketId, AIJudgeMarket.Outcome.No, salt3);

        _revealVote(selected[0], marketId, AIJudgeMarket.Outcome.Yes, salt1);
        _revealVote(selected[1], marketId, AIJudgeMarket.Outcome.Yes, salt2);
        _revealVote(selected[2], marketId, AIJudgeMarket.Outcome.No, salt3);

        AIJudgeMarket.Market memory m = market.getMarket(marketId);

        // Warp past challenge window
        vm.warp(m.challengeDeadline + 1);

        vm.prank(challenger);
        vm.expectRevert(AIJudgeMarket.ChallengeWindowClosed.selector);
        market.challengeResolution(marketId, AIJudgeMarket.Outcome.No);
    }

    // ================================================================
    // TEST: Market cancellation
    // ================================================================

    function test_CancelMarket() public {
        _registerThreeJudges();
        uint256 marketId = _createMarket();

        vm.prank(admin);
        market.cancelMarket(marketId);

        AIJudgeMarket.Market memory m = market.getMarket(marketId);
        assertEq(uint256(m.status), uint256(AIJudgeMarket.MarketStatus.Resolved));
        assertEq(uint256(m.outcome), uint256(AIJudgeMarket.Outcome.None));
    }

    function test_RevertCancelResolvedMarket() public {
        _registerThreeJudges();
        uint256 marketId = _createMarket();

        // Cancel first time
        vm.prank(admin);
        market.cancelMarket(marketId);

        // Try to cancel again
        vm.prank(admin);
        vm.expectRevert(AIJudgeMarket.MarketAlreadyResolved.selector);
        market.cancelMarket(marketId);
    }

    // ================================================================
    // TEST: Judge reinstatement
    // ================================================================

    function test_ReinstateSuspendedJudge() public {
        _registerJudge(judge1);

        // Can't reinstate active judge
        vm.prank(admin);
        vm.expectRevert(AIJudgeMarket.NotSuspended.selector);
        market.reinstateSuspendedJudge(judge1);
    }

    // ================================================================
    // TEST: Court functions
    // ================================================================

    function test_JoinAndLeaveCourt() public {
        _registerJudge(judge1);

        vm.prank(judge1);
        market.joinCourt(uint256(AIJudgeMarket.CourtCategory.Finance));

        uint256[] memory courts = market.getJudgeCourts(judge1);
        assertEq(courts.length, 2); // General + Finance

        assertTrue(market.isJudgeQualifiedForCourt(judge1, uint256(AIJudgeMarket.CourtCategory.Finance)));

        vm.prank(judge1);
        market.leaveCourt(uint256(AIJudgeMarket.CourtCategory.Finance));

        courts = market.getJudgeCourts(judge1);
        assertEq(courts.length, 1); // Back to General only
    }

    function test_RevertLeaveGeneralCourt() public {
        _registerJudge(judge1);

        vm.prank(judge1);
        vm.expectRevert(AIJudgeMarket.InvalidCourt.selector);
        market.leaveCourt(uint256(AIJudgeMarket.CourtCategory.General));
    }

    function test_RevertDoubleJoinCourt() public {
        _registerJudge(judge1);

        vm.prank(judge1);
        market.joinCourt(uint256(AIJudgeMarket.CourtCategory.Crypto));

        vm.prank(judge1);
        vm.expectRevert(AIJudgeMarket.AlreadyInCourt.selector);
        market.joinCourt(uint256(AIJudgeMarket.CourtCategory.Crypto));
    }

    // ================================================================
    // TEST: Stats view functions
    // ================================================================

    function test_StatsViewFunctions() public {
        assertEq(market.getMarketCount(), 0);
        assertEq(market.getActiveJudgesCount(), 0);

        _registerThreeJudges();
        assertEq(market.getActiveJudgesCount(), 3);
        assertEq(market.getCourtJudgesCount(0), 3); // All in General

        _createMarket();
        assertEq(market.getMarketCount(), 1);
    }

    function test_GetConfig() public view {
        (uint256 minStake, uint256 challStake, uint256 challWindow, uint256 fee, uint256 slash, uint256 crWindow) =
            market.getConfig();
        assertEq(minStake, 1000 * 1e6);
        assertEq(challStake, 1000 * 1e6);
        assertEq(challWindow, 24 hours);
        assertEq(fee, 100);
        assertEq(slash, 5000);
        assertEq(crWindow, 12 hours);
    }

    // ================================================================
    // TEST: Fuzz market creation
    // ================================================================

    function testFuzz_MarketCreation(uint256 resolutionDelay, uint256 requiredJudges) public {
        resolutionDelay = bound(resolutionDelay, 1 hours, 365 days);
        requiredJudges = bound(requiredJudges, 3, 21);
        // Contract enforces odd requiredJudges to prevent ties
        if (requiredJudges % 2 == 0) requiredJudges++;

        vm.prank(creator);
        uint256 marketId =
            market.createMarket("Fuzz test question?", block.timestamp + resolutionDelay, requiredJudges, 0);

        AIJudgeMarket.Market memory m = market.getMarket(marketId);
        assertEq(m.requiredJudges, requiredJudges);
        assertEq(uint256(m.status), uint256(AIJudgeMarket.MarketStatus.Open));
    }

    // ================================================================
    // TEST: ERC-8004 integration
    // ================================================================

    function test_ERC8004NotEnabledByDefault() public view {
        assertFalse(market.isERC8004Enabled());
    }

    function test_ERC8004SetRegistries() public {
        address mockId = address(100);
        address mockRep = address(101);
        address mockVal = address(102);

        vm.prank(admin);
        market.setERC8004Registries(mockId, mockRep, mockVal);

        (address id, address rep, address val) = market.getERC8004Registries();
        assertEq(id, mockId);
        assertEq(rep, mockRep);
        assertEq(val, mockVal);
    }

    function test_ERC8004Toggle() public {
        vm.prank(admin);
        market.setERC8004Enabled(true);
        assertTrue(market.isERC8004Enabled());

        vm.prank(admin);
        market.setERC8004Enabled(false);
        assertFalse(market.isERC8004Enabled());
    }

    function test_ERC8004OnlyAdminCanSetRegistries() public {
        vm.prank(judge1);
        vm.expectRevert();
        market.setERC8004Registries(address(100), address(101), address(102));
    }

    function test_ERC8004OnlyAdminCanToggle() public {
        vm.prank(judge1);
        vm.expectRevert();
        market.setERC8004Enabled(true);
    }

    function test_ERC8004LinkAgentRequiresEnabled() public {
        _registerJudge(judge1);

        vm.prank(judge1);
        vm.expectRevert(AIJudgeMarket.ERC8004NotEnabled.selector);
        market.linkAgentId(1);
    }

    function test_ERC8004LinkAndUnlink() public {
        // Deploy mock identity registry
        MockIdentityRegistry mockIdReg = new MockIdentityRegistry();

        // Register an agent owned by judge1
        vm.prank(judge1);
        uint256 agentId = mockIdReg.register("https://example.com/agent1");

        // Set up ERC-8004
        vm.startPrank(admin);
        market.setERC8004Registries(address(mockIdReg), address(0), address(0));
        market.setERC8004Enabled(true);
        vm.stopPrank();

        // Register judge
        _registerJudge(judge1);

        // Link agent
        vm.prank(judge1);
        market.linkAgentId(agentId);

        assertEq(market.getAgentId(judge1), agentId);
        assertEq(market.getJudgeByAgentId(agentId), judge1);

        // Unlink agent
        vm.prank(judge1);
        market.unlinkAgentId();

        assertEq(market.getAgentId(judge1), 0);
        assertEq(market.getJudgeByAgentId(agentId), address(0));
    }

    function test_ERC8004CannotLinkOthersAgent() public {
        MockIdentityRegistry mockIdReg = new MockIdentityRegistry();

        // Register agent owned by judge2
        vm.prank(judge2);
        uint256 agentId = mockIdReg.register("https://example.com/agent2");

        vm.startPrank(admin);
        market.setERC8004Registries(address(mockIdReg), address(0), address(0));
        market.setERC8004Enabled(true);
        vm.stopPrank();

        _registerJudge(judge1);

        // judge1 tries to link judge2's agent
        vm.prank(judge1);
        vm.expectRevert(AIJudgeMarket.NotAgentOwner.selector);
        market.linkAgentId(agentId);
    }

    function test_ERC8004CannotDoubleLinkAgent() public {
        MockIdentityRegistry mockIdReg = new MockIdentityRegistry();

        vm.prank(judge1);
        uint256 agentId1 = mockIdReg.register("https://example.com/agent1");

        vm.startPrank(admin);
        market.setERC8004Registries(address(mockIdReg), address(0), address(0));
        market.setERC8004Enabled(true);
        vm.stopPrank();

        _registerJudge(judge1);

        vm.prank(judge1);
        market.linkAgentId(agentId1);

        // Try to link another agent
        vm.prank(judge1);
        uint256 agentId2 = mockIdReg.register("https://example.com/agent1b");

        vm.prank(judge1);
        vm.expectRevert(AIJudgeMarket.AgentAlreadyLinked.selector);
        market.linkAgentId(agentId2);
    }

    function test_ERC8004RegisterWithAgent() public {
        MockIdentityRegistry mockIdReg = new MockIdentityRegistry();
        MockReputationRegistry mockRepReg = new MockReputationRegistry();

        vm.prank(judge1);
        uint256 agentId = mockIdReg.register("https://example.com/agent1");

        // Set mock reputation (average 80/100)
        mockRepReg.setMockSummary(agentId, 10, 80);

        vm.startPrank(admin);
        market.setERC8004Registries(address(mockIdReg), address(mockRepReg), address(0));
        market.setERC8004Enabled(true);
        vm.stopPrank();

        // Register with agent — reputation should be bootstrapped
        vm.prank(judge1);
        market.registerAsJudgeWithAgent(STAKE, agentId);

        AIJudgeMarket.Judge memory j = market.getJudge(judge1);
        assertEq(j.agentId, agentId);
        assertEq(j.reputationScore, 8000); // 80 * 100 = 8000 on 0-10000 scale
        assertEq(market.getJudgeByAgentId(agentId), judge1);
    }
}

/// @dev Mock ERC-8004 Identity Registry for testing
contract MockIdentityRegistry {
    uint256 private _nextId = 1;
    mapping(uint256 => address) private _owners;

    function register(string calldata) external returns (uint256) {
        uint256 agentId = _nextId++;
        _owners[agentId] = msg.sender;
        return agentId;
    }

    function ownerOf(uint256 agentId) external view returns (address) {
        return _owners[agentId];
    }

    function agentExists(uint256 agentId) external view returns (bool) {
        return _owners[agentId] != address(0);
    }

    function totalAgents() external view returns (uint256) {
        return _nextId - 1;
    }

    function setMetadata(uint256, string calldata, bytes calldata) external {}

    function getMetadata(uint256, string calldata) external pure returns (bytes memory) {
        return "";
    }
}

/// @dev Mock ERC-8004 Reputation Registry for testing
contract MockReputationRegistry {
    mapping(uint256 => uint64) private _counts;
    mapping(uint256 => uint8) private _scores;

    function setMockSummary(uint256 agentId, uint64 count, uint8 score) external {
        _counts[agentId] = count;
        _scores[agentId] = score;
    }

    function getSummary(uint256 agentId, address[] calldata, bytes32, bytes32)
        external
        view
        returns (uint64 count, uint8 averageScore)
    {
        return (_counts[agentId], _scores[agentId]);
    }

    function getIdentityRegistry() external pure returns (address) {
        return address(0);
    }

    function giveFeedback(uint256, uint8, bytes32, bytes32, string calldata, bytes32, bytes memory) external {}
}
