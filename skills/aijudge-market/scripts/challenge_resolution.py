#!/usr/bin/env python3
"""
Challenge a market resolution

Usage:
    python3 challenge_resolution.py --market-id 0 --claimed-outcome yes
"""

import argparse
import os
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from aijudge_client import AIJudgeClient


def main():
    parser = argparse.ArgumentParser(description="Challenge a market resolution")
    parser.add_argument("--market-id", type=int, required=True, help="Market ID")
    parser.add_argument("--claimed-outcome", choices=["yes", "no"], required=True,
                       help="What you think the correct outcome is")
    parser.add_argument("--private-key", help="Private key")
    parser.add_argument("--rpc-url", default="https://sepolia.base.org")
    parser.add_argument("--contract", help="Contract address")
    parser.add_argument("--wait", action="store_true")
    
    args = parser.parse_args()
    
    claimed_outcome = 1 if args.claimed_outcome == "yes" else 0
    
    private_key = args.private_key or os.environ.get("PRIVATE_KEY")
    contract_address = args.contract or os.environ.get("CONTRACT_ADDRESS")
    
    if not private_key or not contract_address:
        print("❌ Error: Private key and contract address required")
        sys.exit(1)
    
    print("⚔️  Challenging Resolution")
    print("=" * 50)
    print(f"Market ID: {args.market_id}")
    print(f"Claimed Outcome: {args.claimed_outcome.upper()}")
    print(f"Challenge Stake: 1000 USDC")
    print("=" * 50)
    
    try:
        client = AIJudgeClient(
            private_key=private_key,
            rpc_url=args.rpc_url,
            contract_address=contract_address
        )
        
        # Check market status
        market = client.get_market(args.market_id)
        print(f"\n📊 Market Status: {market['status']}")
        
        if market['status'] != 'Resolving':
            print(f"❌ Market must be in 'Resolving' status to challenge")
            sys.exit(1)
        
        current_outcome = "YES" if market['outcome'] == 1 else "NO" if market['outcome'] == 2 else "NONE"
        print(f"Current Outcome: {current_outcome}")
        
        if market['outcome'] == claimed_outcome:
            print(f"❌ Cannot challenge with same outcome as current resolution!")
            sys.exit(1)
        
        # Check USDC balance
        balance = client.usdc.functions.balanceOf(client.address).call()
        if balance < 1000 * 10**6:
            print(f"❌ Insufficient USDC balance. Need 1000, have {balance / 10**6}")
            sys.exit(1)
        
        print(f"\n📤 Submitting challenge...")
        # Note: challengeResolution function needs to be added to client
        print("⚠️  Note: Challenge functionality requires contract interaction")
        print("   Use cast or custom script for now")
        
    except Exception as e:
        print(f"\n❌ Error: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)


if __name__ == "__main__":
    main()
