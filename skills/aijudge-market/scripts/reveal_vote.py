#!/usr/bin/env python3
"""
Reveal a committed vote on AIJudgeMarket

Usage:
    python3 reveal_vote.py --market-id 0 --outcome yes --salt "my_secret_salt_123"
"""

import argparse
import os
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from aijudge_client import AIJudgeClient


def main():
    parser = argparse.ArgumentParser(description="Reveal committed vote")
    parser.add_argument("--market-id", type=int, required=True, help="Market ID")
    parser.add_argument("--outcome", choices=["yes", "no", "1", "0"], required=True,
                       help="Must match what was committed")
    parser.add_argument("--salt", required=True, help="Must match salt used in commit")
    parser.add_argument("--evidence-hash", default="0x" + "0" * 64,
                       help="IPFS hash of evidence (optional)")
    parser.add_argument("--rationale-hash", default="0x" + "0" * 64,
                       help="IPFS hash of AI rationale (optional)")
    parser.add_argument("--private-key", help="Private key (or set PRIVATE_KEY env var)")
    parser.add_argument("--rpc-url", default="https://sepolia.base.org",
                       help="RPC endpoint")
    parser.add_argument("--contract", help="Contract address")
    parser.add_argument("--wait", action="store_true", help="Wait for confirmation")
    
    args = parser.parse_args()
    
    # Convert outcome to integer
    if args.outcome.lower() == "yes":
        outcome = 1
    elif args.outcome.lower() == "no":
        outcome = 0
    else:
        outcome = int(args.outcome)
    
    private_key = args.private_key or os.environ.get("PRIVATE_KEY")
    contract_address = args.contract or os.environ.get("CONTRACT_ADDRESS")
    
    if not private_key or not contract_address:
        print("❌ Error: Private key and contract address required")
        sys.exit(1)
    
    print("🔓 Revealing Vote")
    print("=" * 50)
    print(f"Market ID: {args.market_id}")
    print(f"Outcome: {'YES' if outcome == 1 else 'NO'}")
    print(f"Evidence: {args.evidence_hash[:20]}...")
    print(f"Rationale: {args.rationale_hash[:20]}...")
    print("=" * 50)
    
    try:
        client = AIJudgeClient(
            private_key=private_key,
            rpc_url=args.rpc_url,
            contract_address=contract_address
        )
        
        # Verify commit hash matches
        commit_hash = client.compute_commit_hash(outcome, args.salt)
        print(f"\n🔐 Expected commit hash: {commit_hash[:30]}...")
        
        # Check current vote status
        vote_info = client.get_vote(args.market_id)
        if vote_info['revealed']:
            print("⚠️  Warning: You have already revealed your vote!")
            sys.exit(0)
        
        if vote_info['outcome'] == 0 and not vote_info['revealed']:
            print("⚠️  Warning: No commit found. Did you commit first?")
            response = input("   Continue anyway? (y/N): ")
            if response.lower() != 'y':
                sys.exit(0)
        
        print(f"\n📤 Submitting reveal...")
        tx_hash = client.reveal_vote(
            market_id=args.market_id,
            outcome=outcome,
            salt=args.salt,
            evidence_hash=args.evidence_hash,
            rationale_hash=args.rationale_hash
        )
        print(f"✅ Reveal submitted: {tx_hash}")
        
        if args.wait:
            print("⏳ Waiting for confirmation...")
            receipt = client.wait_for_transaction(tx_hash)
            print(f"✅ Confirmed in block {receipt['blockNumber']}")
            
            # Check if market resolved
            market_info = client.get_market(args.market_id)
            print(f"\n📊 Market Status: {market_info['status']}")
            if market_info['outcome'] != 0:
                outcome_str = "YES" if market_info['outcome'] == 1 else "NO"
                print(f"   Resolved Outcome: {outcome_str}")
        
    except Exception as e:
        print(f"\n❌ Error: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)


if __name__ == "__main__":
    main()
