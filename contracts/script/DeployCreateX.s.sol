// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Script.sol";
import "@openzeppelin/contracts/proxy/ERC1967/ERC1967Proxy.sol";
import "../src/AIJudgeMarket.sol";
import "../src/SP1VerifierIntegration.sol";
import "../src/interfaces/ICreateX.sol";

// ============================================================================
// CreateX CREATE3 Deterministic Cross-Chain Deployment
// ============================================================================
// Deploys AIJudgeMarket with the SAME proxy address on every chain using
// CreateX's CREATE3 factory (0xba5Ed099633D3B313e4D5F7bdc1305d3c28ba5Ed).
//
// How it works:
//   - Implementation is deployed normally via `new` (address doesn't matter for UUPS)
//   - Proxy is deployed via CREATE3 with a deterministic salt
//   - Salt format: deployer_address (20 bytes) + 0x00 (1 byte, cross-chain flag) + suffix (11 bytes)
//   - The 0x00 byte tells CreateX NOT to mix in chainId, giving the same address everywhere
//
// To get a new address, change SALT_SUFFIX below.
// ============================================================================

/// @notice Shared constants and helpers for CreateX deployment
abstract contract CreateXBase is Script {
    ICreateX constant CREATEX = ICreateX(0xba5Ed099633D3B313e4D5F7bdc1305d3c28ba5Ed);

    // Change this suffix to deploy to a fresh address
    bytes11 constant SALT_SUFFIX = bytes11(keccak256("aijudge-v1"));

    // USDC addresses per chain
    address constant USDC_BASE_SEPOLIA = 0x036CbD53842c5426634e7929541eC2318f3dCF7e;
    address constant USDC_ETH_SEPOLIA = 0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238;
    address constant USDC_ARC_TESTNET = 0x2Ed9F0618e1E40A400DdB2D96C7a2834A3A1f964;

    /// @notice Build the CREATE3 salt: deployer (20) + 0x00 (1) + suffix (11) = 32 bytes
    function _buildSalt(address deployer) internal pure returns (bytes32) {
        return bytes32(abi.encodePacked(deployer, bytes1(0x00), SALT_SUFFIX));
    }

    /// @notice Replicate CreateX's _guard transformation for our salt format
    /// @dev For salt with deployer in first 20 bytes and 0x00 in byte 21:
    ///      guardedSalt = keccak256(abi.encode(msg.sender, salt))
    ///      This excludes chainId, giving the same address on every chain.
    function _guardedSalt(address deployer, bytes32 salt) internal pure returns (bytes32) {
        return keccak256(abi.encode(deployer, salt));
    }

    /// @notice Auto-select USDC address based on block.chainid
    function _getUSDC() internal view returns (address) {
        if (block.chainid == 84532) return USDC_BASE_SEPOLIA;
        if (block.chainid == 11155111) return USDC_ETH_SEPOLIA;
        if (block.chainid == 5042002) return USDC_ARC_TESTNET;
        revert(string.concat("Unsupported chain ID: ", vm.toString(block.chainid)));
    }

    /// @notice Human-readable chain name for logs
    function _chainName() internal view returns (string memory) {
        if (block.chainid == 84532) return "Base Sepolia";
        if (block.chainid == 11155111) return "Ethereum Sepolia";
        if (block.chainid == 5042002) return "ARC Testnet";
        return vm.toString(block.chainid);
    }
}

// ============================================================================
// DeployCreate3 — Main deployment script
// ============================================================================

/**
 * @title DeployCreate3
 * @notice Deploys AIJudgeMarket implementation (normal) + proxy (via CreateX CREATE3)
 * @dev Usage: forge script script/DeployCreateX.s.sol:DeployCreate3 --rpc-url <RPC> --broadcast --verify -vvvv
 */
contract DeployCreate3 is CreateXBase {
    function run() external {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        address deployer = vm.addr(deployerPrivateKey);
        address usdcAddress = _getUSDC();
        bytes32 salt = _buildSalt(deployer);

        console.log("=== CreateX CREATE3 Deployment ===");
        console.log("Chain:", _chainName());
        console.log("Chain ID:", block.chainid);
        console.log("Deployer:", deployer);
        console.log("USDC:", usdcAddress);

        // Predict address before deploying
        // deployCreate3 applies _guard(salt) internally, so we replicate it.
        // Use single-arg computeCreate3Address — it passes address(this) (CreateX) as the
        // CREATE2 deployer, which is correct since CreateX does the CREATE2 internally.
        bytes32 guardedSalt = _guardedSalt(deployer, salt);
        address predicted = CREATEX.computeCreate3Address(guardedSalt);
        console.log("Predicted proxy address:", predicted);

        vm.startBroadcast(deployerPrivateKey);

        // 1. Deploy implementation normally (address is chain-specific, that's fine for UUPS)
        AIJudgeMarket implementation = new AIJudgeMarket();
        console.log("Implementation deployed:", address(implementation));

        // 2. Build proxy init code
        bytes memory initData = abi.encodeWithSelector(AIJudgeMarket.initialize.selector, usdcAddress, deployer);
        bytes memory proxyInitCode = abi.encodePacked(type(ERC1967Proxy).creationCode, abi.encode(address(implementation), initData));

        // 3. Deploy proxy via CreateX CREATE3
        address proxy = CREATEX.deployCreate3(salt, proxyInitCode);
        console.log("Proxy deployed via CREATE3:", proxy);

        // 4. Verify initialization
        AIJudgeMarket market = AIJudgeMarket(proxy);
        require(market.hasRole(market.DEFAULT_ADMIN_ROLE(), deployer), "Admin role not set");
        require(proxy == predicted, "Address mismatch!");
        console.log("Initialization verified");

        vm.stopBroadcast();

        console.log("\n=== Deployment Summary ===");
        console.log("Implementation:", address(implementation));
        console.log("Proxy (USE THIS ADDRESS):", proxy);
        console.log("Admin:", deployer);
        console.log("USDC:", usdcAddress);
        console.log("Chain:", _chainName());
        console.log("Salt suffix: aijudge-v1");
        console.log("\nThis address is the SAME on all supported chains.");
    }
}

// ============================================================================
// PredictCreate3Address — Read-only address prediction
// ============================================================================

/**
 * @title PredictCreate3Address
 * @notice Predicts the proxy address without deploying
 * @dev Usage: forge script script/DeployCreateX.s.sol:PredictCreate3Address --rpc-url <RPC>
 *      Set DEPLOYER_ADDRESS env var or PRIVATE_KEY
 */
contract PredictCreate3Address is CreateXBase {
    function run() external view {
        address deployer;
        try vm.envAddress("DEPLOYER_ADDRESS") returns (address addr) {
            deployer = addr;
        } catch {
            uint256 pk = vm.envUint("PRIVATE_KEY");
            deployer = vm.addr(pk);
        }

        bytes32 salt = _buildSalt(deployer);
        bytes32 guardedSalt = _guardedSalt(deployer, salt);
        address predicted = CREATEX.computeCreate3Address(guardedSalt);

        console.log("=== CREATE3 Address Prediction ===");
        console.log("Deployer:", deployer);
        console.log("Salt suffix: aijudge-v1");
        console.log("Predicted proxy address:", predicted);
        console.log("\nThis address will be the SAME on Base Sepolia, Ethereum Sepolia, and ARC Testnet.");
    }
}

// ============================================================================
// DeploySP1VerifierCreateX — SP1 verifier (regular deploy, not CREATE3)
// ============================================================================

/**
 * @title DeploySP1VerifierCreateX
 * @notice Deploys SP1VerifierIntegration (standard deploy, address doesn't need to match across chains)
 */
contract DeploySP1VerifierCreateX is CreateXBase {
    function run() external {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");

        address sp1Verifier = vm.envOr("SP1_VERIFIER_ADDRESS", address(0));
        bytes32 evidenceVKey = vm.envOr("EVIDENCE_VKEY", bytes32(0));
        bytes32 aiAnalysisVKey = vm.envOr("AI_ANALYSIS_VKEY", bytes32(0));

        console.log("Deploying SP1VerifierIntegration on", _chainName());
        console.log("SP1 Verifier:", sp1Verifier);

        vm.startBroadcast(deployerPrivateKey);

        SP1VerifierIntegration verifier = new SP1VerifierIntegration(sp1Verifier, evidenceVKey, aiAnalysisVKey);
        console.log("SP1VerifierIntegration deployed:", address(verifier));

        vm.stopBroadcast();
    }
}

// ============================================================================
// UpgradeCreate3 — Upgrade implementation on any chain
// ============================================================================

/**
 * @title UpgradeCreate3
 * @notice Upgrades the AIJudgeMarket implementation via UUPS on any chain
 * @dev The proxy address is the same on all chains; only the implementation changes
 *      Usage: PROXY_ADDRESS=0x... forge script script/DeployCreateX.s.sol:UpgradeCreate3 --rpc-url <RPC> --broadcast -vvvv
 */
contract UpgradeCreate3 is CreateXBase {
    function run() external {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        address proxyAddress = vm.envAddress("PROXY_ADDRESS");

        console.log("=== UUPS Upgrade ===");
        console.log("Chain:", _chainName());
        console.log("Proxy:", proxyAddress);

        vm.startBroadcast(deployerPrivateKey);

        // Deploy new implementation
        AIJudgeMarket newImplementation = new AIJudgeMarket();
        console.log("New implementation:", address(newImplementation));

        // Upgrade proxy to new implementation
        AIJudgeMarket proxy = AIJudgeMarket(proxyAddress);
        proxy.upgradeToAndCall(address(newImplementation), "");

        console.log("Upgrade complete on", _chainName());

        vm.stopBroadcast();
    }
}
