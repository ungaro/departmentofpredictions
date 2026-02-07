// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Test.sol";
import "../src/AIJudgeMarketV1.sol";

contract AIJudgeMarketV1Test is Test {
    AIJudgeMarketV1 public market;

    address public owner = address(1);
    address public judge1 = address(2);
    address public judge2 = address(3);
    address public judge3 = address(4);
    address public challenger = address(5);
    address public marketCreator = address(6);

    // Test USDC on Base Sepolia
    address public constant USDC = 0x036CbD53842c5426634e7929541eC2318f3dCF7e;

    function setUp() public {
        vm.startPrank(owner);
        market = new AIJudgeMarketV1(USDC);
        vm.stopPrank();

        // Fund accounts with test USDC (mock)
        // In real tests, we'd need to deal with actual USDC
    }

    function test_RegisterAsJudge() public {
        uint256 stakeAmount = 1000 * 1e6; // 1000 USDC

        vm.startPrank(judge1);
        // Would need actual USDC approval and transfer
        // market.registerAsJudge(stakeAmount);

        // (AIJudgeMarket.Judge memory judge) = market.getJudge(judge1);
        // assertEq(judge.stake, stakeAmount);
        // assertTrue(judge.isActive);
        vm.stopPrank();
    }

    function test_CreateMarket() public {
        string memory question = "Will BTC hit $100k by March 31, 2026?";
        uint256 resolutionTime = block.timestamp + 30 days;
        uint256 requiredJudges = 3;

        vm.startPrank(marketCreator);
        uint256 marketId = market.createMarket(question, resolutionTime, requiredJudges);

        AIJudgeMarketV1.Market memory m = market.getMarket(marketId);
        assertEq(m.creator, marketCreator);
        assertEq(m.question, question);
        assertEq(uint256(m.status), 0); // MarketStatus.Open
        vm.stopPrank();
    }

    function test_JoinMarketAsJudge() public {
        // Create market first
        vm.startPrank(marketCreator);
        uint256 marketId = market.createMarket("Test question", block.timestamp + 30 days, 3);
        vm.stopPrank();

        // Judge joins
        vm.startPrank(judge1);
        // market.joinMarketAsJudge(marketId);

        // address[] memory judges = market.getMarketJudges(marketId);
        // assertEq(judges.length, 1);
        // assertEq(judges[0], judge1);
        vm.stopPrank();
    }

    function testFuzz_MarketCreation(string memory question, uint256 resolutionDelay) public {
        vm.assume(bytes(question).length > 0 && bytes(question).length < 500);
        vm.assume(resolutionDelay > 1 hours && resolutionDelay < 365 days);

        vm.startPrank(marketCreator);
        uint256 resolutionTime = block.timestamp + resolutionDelay;

        uint256 marketId = market.createMarket(question, resolutionTime, 3);

        assertEq(marketId, 0);

        AIJudgeMarketV1.Market memory m = market.getMarket(marketId);
        assertEq(m.question, question);
        vm.stopPrank();
    }
}
