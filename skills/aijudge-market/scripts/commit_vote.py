#!/usr/bin/env python3
"""
Submit a commit hash for voting on AIJudgeMarket

Usage:
    python3 commit_vote.py --market-id 0 --outcome yes --salt "my_secret_salt_123"
"""

import argparse
import os
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from aijudge_client import AIJudgeClient


def main():
    parser = argparse.ArgumentParser(description="Submit commit hash for voting")
    parser.add_argument("--market-id", type=int, required=True, help="Market ID to vote on")
    parser.add_argument("--outcome", choices=["yes", "no", "1", "0"], required=True,
                       help="Your vote outcome (yes/no)")
    parser.add_argument("--salt", required=True, 
                       help="Random salt string (keep secret until reveal!)")
    parser.add_argument("--private-key", help="Private key (or set PRIVATE_KEY env var)")
    parser.add_argument("--rpc-url", default="https://sepolia.base.org",
                       help="RPC endpoint")
    parser.add_argument("--contract", help="Contract address")
    parser.add_argument("--show-hash", action="store_true",
                       help="Show the computed commit hash")
    parser.add_argument("--wait", action="store_true", help="Wait for confirmation")
    
    args = parser.parse_args()
    
    # Convert outcome to integer
    if args.outcome.lower() == "yes":
        outcome = 1
    elif args.outcome.lower() == "no":
        outcome = 0
    else:
        outcome = int(args.outcome)
    
    if len(args.salt) < 8:
        print("⚠️  Warning: Salt should be at least 8 characters for security")
    
    private_key = args.private_key or os.environ.get("PRIVATE_KEY")
    contract_address = args.contract or os.environ.get("CONTRACT_ADDRESS")
    
    if not private_key or not contract_address:
        print("❌ Error: Private key and contract address required")
        sys.exit(1)
    
    print("🗳️  Committing Vote")
    print("=" * 50)
    print(f"Market ID: {args.market_id}")
    print(f"Outcome: {'YES' if outcome == 1 else 'NO'}")
    print(f"Salt: {'*' * len(args.salt)} (keep secret!)")
    print("=" * 50)
    
    try:
        client = AIJudgeClient(
            private_key=private_key,
            rpc_url=args.rpc_url,
            contract_address=contract_address
        )
        
        # Compute and show commit hash
        commit_hash = client.compute_commit_hash(outcome, args.salt)
        if args.show_hash:
            print(f"\n🔐 Commit Hash: {commit_hash}")
        
        # Check if user is selected judge
        selected_judges = client.get_selected_judges(args.market_id)
        if client.address not in selected_judges:
            print(f"\n⚠️  Warning: You are not selected as a judge for this market")
            print(f"   Selected judges: {selected_judges}")
            response = input("   Continue anyway? (y/N): ")
            if response.lower() != 'y':
                sys.exit(0)
        
        print(f"\n📤 Submitting commit...")
        tx_hash = client.commit_vote(args.market_id, outcome, args.salt)
        print(f"✅ Commit submitted: {tx_hash}")
        
        if args.wait:
            print("⏳ Waiting for confirmation...")
            receipt = client.wait_for_transaction(tx_hash)
            print(f"✅ Confirmed in block {receipt['blockNumber']}")
        
        print("\n📋 IMPORTANT: Save these values for reveal phase!")
        print("=" * 50)
        print(f"Market ID: {args.market_id}")
        print(f"Outcome: {'YES' if outcome == 1 else 'NO'}")
        print(f"Salt: {args.salt}")
        print("=" * 50)
        print("\n⚠️  DO NOT LOSE THE SALT! You cannot reveal without it.")
        
    except Exception as e:
        print(f"\n❌ Error: {e}")
        sys.exit(1)


if __name__ == "__main__":
    main()
