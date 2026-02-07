#!/usr/bin/env python3
"""
Create a new prediction market on AIJudgeMarket

Usage:
    python3 create_market.py --question "Will ETH hit $5000?" --resolution-time 1743465600 --required-judges 5 --court-id 1
"""

import argparse
import os
import sys
from datetime import datetime

# Add parent directory to path for imports
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from aijudge_client import AIJudgeClient


def main():
    parser = argparse.ArgumentParser(description="Create a prediction market on AIJudgeMarket")
    parser.add_argument("--question", required=True, help="The prediction question (max 500 chars)")
    parser.add_argument("--resolution-time", type=int, required=True, 
                       help="Unix timestamp when market resolves (use 'date +%s' to generate)")
    parser.add_argument("--required-judges", type=int, default=3, 
                       help="Number of judges needed (3-21, default: 3)")
    parser.add_argument("--court-id", type=int, default=0,
                       help="Sub-court category: 0=General, 1=Finance, 2=Sports, 3=Politics, 4=Tech, 5=Entertainment, 6=Crypto, 7=Science (default: 0)")
    parser.add_argument("--private-key", help="Private key (or set PRIVATE_KEY env var)")
    parser.add_argument("--rpc-url", default="https://sepolia.base.org",
                       help="RPC endpoint (default: https://sepolia.base.org)")
    parser.add_argument("--contract", help="Contract address (or set CONTRACT_ADDRESS env var)")
    parser.add_argument("--wait", action="store_true", help="Wait for transaction confirmation")
    
    args = parser.parse_args()
    
    # Validate inputs
    if len(args.question) > 500:
        print("❌ Error: Question too long (max 500 characters)")
        sys.exit(1)
    
    if not 3 <= args.required_judges <= 21:
        print("❌ Error: required-judges must be between 3 and 21")
        sys.exit(1)
    
    if not 0 <= args.court_id <= 7:
        print("❌ Error: court-id must be between 0 and 7")
        sys.exit(1)
    
    current_time = int(datetime.now().timestamp())
    if args.resolution_time <= current_time:
        print(f"❌ Error: resolution-time must be in the future (current time: {current_time})")
        sys.exit(1)
    
    # Get credentials from args or environment
    private_key = args.private_key or os.environ.get("PRIVATE_KEY")
    contract_address = args.contract or os.environ.get("CONTRACT_ADDRESS")
    
    if not private_key:
        print("❌ Error: Private key required. Use --private-key or set PRIVATE_KEY environment variable")
        sys.exit(1)
    
    if not contract_address:
        print("❌ Error: Contract address required. Use --contract or set CONTRACT_ADDRESS environment variable")
        sys.exit(1)
    
    # Court names for display
    court_names = [
        "General", "Finance", "Sports", "Politics", 
        "Technology", "Entertainment", "Crypto", "Science"
    ]
    
    print("🎯 Creating Prediction Market")
    print("=" * 50)
    print(f"Question: {args.question}")
    print(f"Resolves: {datetime.fromtimestamp(args.resolution_time)} UTC")
    print(f"Required Judges: {args.required_judges}")
    print(f"Court: {court_names[args.court_id]} (ID: {args.court_id})")
    print(f"Network: {args.rpc_url}")
    print("=" * 50)
    
    try:
        # Initialize client
        client = AIJudgeClient(
            private_key=private_key,
            rpc_url=args.rpc_url,
            contract_address=contract_address
        )
        
        print(f"\n📤 Sending transaction from {client.address}...")
        
        # Create market
        tx_hash = client.create_market(
            question=args.question,
            resolution_time=args.resolution_time,
            required_judges=args.required_judges,
            court_id=args.court_id
        )
        
        print(f"✅ Transaction submitted: {tx_hash}")
        
        if args.wait:
            print("⏳ Waiting for confirmation...")
            receipt = client.wait_for_transaction(tx_hash)
            print(f"✅ Confirmed in block {receipt['blockNumber']}")
            
            # Get market count to find new market ID
            # Note: This is an approximation - in production you'd parse events
            print("\n📊 Market created successfully!")
            print("Use 'get_market.py --market-id N' to check status")
        else:
            print(f"\n📊 Transaction pending. Check status with:")
            print(f"   cast receipt {tx_hash} --rpc-url {args.rpc_url}")
        
    except Exception as e:
        print(f"\n❌ Error: {e}")
        sys.exit(1)


if __name__ == "__main__":
    main()
