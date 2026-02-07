#!/bin/bash
# Deploy AIJudgeMarket to both Base Sepolia and ARC Testnet

set -e

echo "================================"
echo "AIJudgeMarket Deployment Script"
echo "================================"
echo ""

# Check for PRIVATE_KEY
if [ -z "$PRIVATE_KEY" ]; then
    echo "Error: PRIVATE_KEY environment variable not set"
    echo "Set it with: export PRIVATE_KEY=0x..."
    exit 1
fi

# Deploy to Base Sepolia
echo "1. Deploying to Base Sepolia..."
echo "   Network: Base Sepolia (Chain ID: 84532)"
echo "   USDC: 0x036CbD53842c5426634e7929541eC2318f3dCF7e"
echo ""

export NETWORK=base-sepolia
forge script script/Deploy.s.sol \
    --rpc-url https://sepolia.base.org \
    --broadcast \
    --verify \
    --etherscan-api-key ${ETHERSCAN_API_KEY:-""}

BASE_SEPOLIA_ADDRESS=$(cat broadcast/Deploy.s.sol/84532/run-latest.json | grep -o '"contractAddress": "[^"]*"' | head -1 | cut -d'"' -f4)
echo ""
echo "✓ Base Sepolia deployed at: $BASE_SEPOLIA_ADDRESS"
echo "   Explorer: https://sepolia.basescan.org/address/$BASE_SEPOLIA_ADDRESS"
echo ""

# Deploy to ARC Testnet
echo "2. Deploying to ARC Testnet..."
echo "   Network: ARC Testnet (Chain ID: 5042002)"
echo "   USDC: 0x2eD9f0618E1e40a400DDb2D96C7A2834A3A1F964"
echo "   RPC: https://rpc.testnet.arc.network"
echo ""

export NETWORK=arc-testnet
export USDC_ADDRESS=0x2eD9f0618E1e40a400DDb2D96C7A2834A3A1F964
forge script script/Deploy.s.sol \
    --rpc-url https://rpc.testnet.arc.network \
    --broadcast

ARC_TESTNET_ADDRESS=$(cat broadcast/Deploy.s.sol/5042002/run-latest.json | grep -o '"contractAddress": "[^"]*"' | head -1 | cut -d'"' -f4)
echo ""
echo "✓ ARC Testnet deployed at: $ARC_TESTNET_ADDRESS"
echo "   Explorer: https://explorer.testnet.arc.network/address/$ARC_TESTNET_ADDRESS (if available)"
echo ""

# Summary
echo "================================"
echo "Deployment Complete!"
echo "================================"
echo ""
echo "Base Sepolia:"
echo "  Contract: $BASE_SEPOLIA_ADDRESS"
echo "  USDC: 0x036CbD53842c5426634e7929541eC2318f3dCF7e"
echo "  Explorer: https://sepolia.basescan.org/address/$BASE_SEPOLIA_ADDRESS"
echo ""
echo "ARC Testnet:"
echo "  Contract: $ARC_TESTNET_ADDRESS"
echo "  USDC: 0x2eD9f0618E1e40a400DDb2D96C7A2834A3A1F964"
echo "  Explorer: https://explorer.testnet.arc.network/address/$ARC_TESTNET_ADDRESS"
echo ""
echo "Next steps:"
echo "1. Update SUBMISSION.md with deployed addresses"
echo "2. Verify contracts on explorers"
echo "3. Push code to GitPad"
echo "4. Submit to Moltbook"
echo ""
