#!/usr/bin/env python3
"""
Finalize market resolution after challenge window

Usage:
    python3 finalize_resolution.py --market-id 0
"""

import argparse
import os
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from aijudge_client import AIJudgeClient


def main():
    parser = argparse.ArgumentParser(description="Finalize market resolution")
    parser.add_argument("--market-id", type=int, required=True, help="Market ID")
    parser.add_argument("--private-key", help="Private key")
    parser.add_argument("--rpc-url", default="https://sepolia.base.org")
    parser.add_argument("--contract", help="Contract address")
    parser.add_argument("--wait", action="store_true")
    
    args = parser.parse_args()
    
    private_key = args.private_key or os.environ.get("PRIVATE_KEY")
    contract_address = args.contract or os.environ.get("CONTRACT_ADDRESS")
    
    if not private_key or not contract_address:
        print("❌ Error: Private key and contract address required")
        sys.exit(1)
    
    print("🔒 Finalizing Resolution")
    print("=" * 50)
    print(f"Market ID: {args.market_id}")
    print("=" * 50)
    
    try:
        client = AIJudgeClient(
            private_key=private_key,
            rpc_url=args.rpc_url,
            contract_address=contract_address
        )
        
        # Check market status
        market = client.get_market(args.market_id)
        print(f"\n📊 Current Status: {market['status']}")
        
        if market['status'] != 'Resolving':
            print(f"❌ Market must be in 'Resolving' status to finalize")
            print(f"   Current status: {market['status']}")
            sys.exit(1)
        
        import time
        current_time = int(time.time())
        if current_time <= market['challenge_deadline']:
            remaining = market['challenge_deadline'] - current_time
            hours = remaining // 3600
            print(f"⏳ Challenge window still open ({hours} hours remaining)")
            print("   Cannot finalize until challenge window closes")
            sys.exit(1)
        
        print(f"\n📤 Finalizing...")
        tx_hash = client.finalize_resolution(args.market_id)
        print(f"✅ Transaction: {tx_hash}")
        
        if args.wait:
            print("⏳ Waiting for confirmation...")
            receipt = client.wait_for_transaction(tx_hash)
            print(f"✅ Confirmed in block {receipt['blockNumber']}")
            
            market = client.get_market(args.market_id)
            print(f"\n📊 Final Status: {market['status']}")
            if market['outcome'] != 0:
                outcome_str = "YES" if market['outcome'] == 1 else "NO"
                print(f"   Outcome: {outcome_str}")
        
    except Exception as e:
        print(f"\n❌ Error: {e}")
        sys.exit(1)


if __name__ == "__main__":
    main()
