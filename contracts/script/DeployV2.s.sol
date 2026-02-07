// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Script.sol";
import "@openzeppelin/contracts/proxy/ERC1967/ERC1967Proxy.sol";
import "../src/AIJudgeMarketV2.sol";
import "../src/SP1VerifierIntegration.sol";

/**
 * @title DeployAIJudgeMarketV2
 * @notice Deploys AIJudgeMarketV2 with UUPS proxy pattern
 * @dev This deploys the implementation contract first, then the proxy
 */
contract DeployAIJudgeMarketV2 is Script {
    // Base Sepolia USDC
    address constant USDC_BASE_SEPOLIA = 0x036CbD53842c5426634e7929541eC2318f3dCF7e;

    // ARC Testnet USDC
    address constant USDC_ARC_TESTNET = 0x2Ed9F0618e1E40A400DdB2D96C7a2834A3A1f964;

    function run() external {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        address deployer = vm.addr(deployerPrivateKey);

        // Select network
        string memory network = vm.envOr("NETWORK", string("base-sepolia"));
        address usdcAddress;

        if (keccak256(bytes(network)) == keccak256(bytes("base-sepolia"))) {
            usdcAddress = USDC_BASE_SEPOLIA;
            console.log("Deploying to Base Sepolia...");
        } else if (keccak256(bytes(network)) == keccak256(bytes("arc-testnet"))) {
            usdcAddress = vm.envOr("USDC_ADDRESS", USDC_ARC_TESTNET);
            console.log("Deploying to ARC Testnet...");
        } else {
            revert("Unknown network");
        }

        console.log("Deployer:", deployer);
        console.log("USDC:", usdcAddress);

        vm.startBroadcast(deployerPrivateKey);

        // 1. Deploy implementation contract
        AIJudgeMarket implementation = new AIJudgeMarket();
        console.log("Implementation deployed:", address(implementation));

        // 2. Deploy proxy contract
        // The proxy delegates all calls to the implementation
        bytes memory initData = abi.encodeWithSelector(AIJudgeMarket.initialize.selector, usdcAddress, deployer);

        ERC1967Proxy proxy = new ERC1967Proxy(address(implementation), initData);
        console.log("Proxy deployed:", address(proxy));

        // 3. Verify initialization
        AIJudgeMarket market = AIJudgeMarket(address(proxy));
        require(market.hasRole(market.DEFAULT_ADMIN_ROLE(), deployer), "Admin role not set");
        console.log("Initialization verified");

        vm.stopBroadcast();

        console.log("\n=== Deployment Summary ===");
        console.log("Implementation:", address(implementation));
        console.log("Proxy (USE THIS ADDRESS):", address(proxy));
        console.log("Admin:", deployer);
        console.log("USDC:", usdcAddress);
        console.log("Network:", network);
        console.log("\nIMPORTANT: Interact with the PROXY address, not the implementation!");
    }
}

/**
 * @title DeploySP1Verifier
 * @notice Deploys SP1 verifier integration contract
 */
contract DeploySP1Verifier is Script {
    // SP1 Verifier contract addresses (Succinct's official deployments)
    // https://docs.succinct.xyz/onchain-verification/contract-addresses
    address constant SP1_VERIFIER_BASE_SEPOLIA = 0x0000000000000000000000000000000000000000; // Update with real address
    address constant SP1_VERIFIER_ARC_TESTNET = 0x0000000000000000000000000000000000000000; // Update with real address

    function run() external {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        address deployer = vm.addr(deployerPrivateKey);

        string memory network = vm.envOr("NETWORK", string("base-sepolia"));
        address sp1Verifier;

        if (keccak256(bytes(network)) == keccak256(bytes("base-sepolia"))) {
            sp1Verifier = SP1_VERIFIER_BASE_SEPOLIA;
        } else {
            sp1Verifier = SP1_VERIFIER_ARC_TESTNET;
        }

        // TODO: Generate actual program VKeys from SP1 build
        bytes32 evidenceVKey = vm.envOr("EVIDENCE_VKEY", bytes32(0));
        bytes32 aiAnalysisVKey = vm.envOr("AI_ANALYSIS_VKEY", bytes32(0));

        console.log("Deploying SP1VerifierIntegration...");
        console.log("SP1 Verifier:", sp1Verifier);

        vm.startBroadcast(deployerPrivateKey);

        SP1VerifierIntegration verifier = new SP1VerifierIntegration(sp1Verifier, evidenceVKey, aiAnalysisVKey);

        console.log("SP1VerifierIntegration deployed:", address(verifier));

        vm.stopBroadcast();
    }
}

/**
 * @title UpgradeAIJudgeMarket
 * @notice Upgrades the implementation contract (UUPS pattern)
 * @dev Only callable by address with UPGRADER_ROLE
 */
contract UpgradeAIJudgeMarket is Script {
    function run() external {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        address proxyAddress = vm.envAddress("PROXY_ADDRESS");

        console.log("Upgrading proxy at:", proxyAddress);

        vm.startBroadcast(deployerPrivateKey);

        // Deploy new implementation
        AIJudgeMarket newImplementation = new AIJudgeMarket();
        console.log("New implementation:", address(newImplementation));

        // Upgrade proxy to new implementation
        AIJudgeMarket proxy = AIJudgeMarket(proxyAddress);
        proxy.upgradeToAndCall(address(newImplementation), "");

        console.log("Upgrade complete!");

        vm.stopBroadcast();
    }
}
