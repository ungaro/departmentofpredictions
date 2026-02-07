// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Script.sol";
import "../src/AIJudgeMarketV1.sol";

contract DeployAIJudgeMarket is Script {
    // Base Sepolia USDC
    address constant USDC_BASE_SEPOLIA = 0x036CbD53842c5426634e7929541eC2318f3dCF7e;

    // ARC Testnet USDC
    // Note: ARC uses USDC as native gas token. Using standard ARC testnet USDC address.
    address constant USDC_ARC_TESTNET = 0x2Ed9F0618e1E40A400DdB2D96C7a2834A3A1f964; // ARC Testnet USDC

    function run() external {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");

        // Select network based on environment
        string memory network = vm.envOr("NETWORK", string("base-sepolia"));
        address usdcAddress;

        if (keccak256(bytes(network)) == keccak256(bytes("base-sepolia"))) {
            usdcAddress = USDC_BASE_SEPOLIA;
            console.log("Deploying to Base Sepolia...");
        } else if (keccak256(bytes(network)) == keccak256(bytes("arc-testnet"))) {
            // Use provided address or default
            usdcAddress = vm.envOr("USDC_ADDRESS", USDC_ARC_TESTNET);
            require(usdcAddress != address(0), "USDC address not set for ARC");
            console.log("Deploying to ARC Testnet...");
        } else {
            revert("Unknown network");
        }

        console.log("USDC Address:", usdcAddress);

        vm.startBroadcast(deployerPrivateKey);

        AIJudgeMarketV1 market = new AIJudgeMarketV1(usdcAddress);

        console.log("AIJudgeMarket deployed at:", address(market));
        console.log("Owner:", msg.sender);
        console.log("Min Judge Stake: 1000 USDC");
        console.log("Challenge Stake: 1000 USDC");
        console.log("Challenge Window: 24 hours");

        vm.stopBroadcast();
    }
}
