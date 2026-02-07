#!/usr/bin/env python3
"""
Join a specialized sub-court on AIJudgeMarket

Usage:
    python3 join_court.py --court-id 1  # Join Finance court
"""

import argparse
import os
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from aijudge_client import AIJudgeClient


def main():
    parser = argparse.ArgumentParser(description="Join a specialized sub-court")
    parser.add_argument("--court-id", type=int, required=True,
                       help="Court ID: 1=Finance, 2=Sports, 3=Politics, 4=Tech, 5=Entertainment, 6=Crypto, 7=Science")
    parser.add_argument("--private-key", help="Private key (or set PRIVATE_KEY env var)")
    parser.add_argument("--rpc-url", default="https://sepolia.base.org",
                       help="RPC endpoint")
    parser.add_argument("--contract", help="Contract address")
    parser.add_argument("--wait", action="store_true", help="Wait for confirmation")
    
    args = parser.parse_args()
    
    if args.court_id == 0:
        print("❌ Error: Cannot join General court (all judges are automatically in it)")
        sys.exit(1)
    
    if not 1 <= args.court_id <= 7:
        print("❌ Error: Court ID must be between 1 and 7")
        sys.exit(1)
    
    private_key = args.private_key or os.environ.get("PRIVATE_KEY")
    contract_address = args.contract or os.environ.get("CONTRACT_ADDRESS")
    
    if not private_key or not contract_address:
        print("❌ Error: Private key and contract address required")
        sys.exit(1)
    
    court_names = [
        "General", "Finance", "Sports", "Politics",
        "Technology", "Entertainment", "Crypto", "Science"
    ]
    
    print("⚖️  Joining Sub-Court")
    print("=" * 50)
    print(f"Court: {court_names[args.court_id]} (ID: {args.court_id})")
    print("=" * 50)
    
    try:
        client = AIJudgeClient(
            private_key=private_key,
            rpc_url=args.rpc_url,
            contract_address=contract_address
        )
        
        # Check current courts
        judge_info = client.get_judge()
        print(f"\n📍 Your address: {client.address}")
        print(f"Current courts: {[court_names[i] for i in judge_info['court_ids']]}")
        
        if args.court_id in judge_info['court_ids']:
            print(f"\n✅ You are already in {court_names[args.court_id]} court!")
            sys.exit(0)
        
        print(f"\n📤 Joining {court_names[args.court_id]} court...")
        tx_hash = client.join_court(args.court_id)
        print(f"✅ Transaction submitted: {tx_hash}")
        
        if args.wait:
            print("⏳ Waiting for confirmation...")
            receipt = client.wait_for_transaction(tx_hash)
            print(f"✅ Confirmed in block {receipt['blockNumber']}")
            
            # Verify
            judge_info = client.get_judge()
            print(f"\n📊 Updated courts: {[court_names[i] for i in judge_info['court_ids']]}")
        
    except Exception as e:
        print(f"\n❌ Error: {e}")
        sys.exit(1)


if __name__ == "__main__":
    main()
