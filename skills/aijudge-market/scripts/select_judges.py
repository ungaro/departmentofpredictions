#!/usr/bin/env python3
"""
Trigger judge selection for a market (requires MANAGER_ROLE)

Usage:
    python3 select_judges.py --market-id 0
"""

import argparse
import os
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from aijudge_client import AIJudgeClient


def main():
    parser = argparse.ArgumentParser(description="Select judges for a market (manager only)")
    parser.add_argument("--market-id", type=int, required=True, help="Market ID")
    parser.add_argument("--private-key", help="Private key (or set PRIVATE_KEY env var)")
    parser.add_argument("--rpc-url", default="https://sepolia.base.org",
                       help="RPC endpoint")
    parser.add_argument("--contract", help="Contract address")
    parser.add_argument("--wait", action="store_true", help="Wait for confirmation")
    
    args = parser.parse_args()
    
    private_key = args.private_key or os.environ.get("PRIVATE_KEY")
    contract_address = args.contract or os.environ.get("CONTRACT_ADDRESS")
    
    if not private_key or not contract_address:
        print("❌ Error: Private key and contract address required")
        sys.exit(1)
    
    print("⚖️  Selecting Judges")
    print("=" * 50)
    print(f"Market ID: {args.market_id}")
    print("=" * 50)
    print("\n⚠️  Note: This requires MANAGER_ROLE on the contract")
    
    try:
        client = AIJudgeClient(
            private_key=private_key,
            rpc_url=args.rpc_url,
            contract_address=contract_address
        )
        
        print(f"\n📤 Triggering judge selection...")
        tx_hash = client.select_judges(args.market_id)
        print(f"✅ Transaction submitted: {tx_hash}")
        
        if args.wait:
            print("⏳ Waiting for confirmation...")
            receipt = client.wait_for_transaction(tx_hash)
            print(f"✅ Confirmed in block {receipt['blockNumber']}")
            
            # Get selected judges
            judges = client.get_selected_judges(args.market_id)
            print(f"\n📊 Selected {len(judges)} judges:")
            for i, judge in enumerate(judges, 1):
                print(f"   {i}. {judge}")
        
    except Exception as e:
        print(f"\n❌ Error: {e}")
        if "Unauthorized" in str(e) or "MANAGER" in str(e):
            print("\n⚠️  You do not have MANAGER_ROLE!")
            print("   Only contract managers can select judges.")
        sys.exit(1)


if __name__ == "__main__":
    main()
