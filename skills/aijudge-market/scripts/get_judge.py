#!/usr/bin/env python3
"""
Get judge information from AIJudgeMarket

Usage:
    python3 get_judge.py
    python3 get_judge.py --address 0x...
"""

import argparse
import os
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from aijudge_client import AIJudgeClient


def main():
    parser = argparse.ArgumentParser(description="Get judge information")
    parser.add_argument("--address", help="Judge address (default: your address)")
    parser.add_argument("--private-key", help="Private key (or set PRIVATE_KEY env var)")
    parser.add_argument("--rpc-url", default="https://sepolia.base.org",
                       help="RPC endpoint")
    parser.add_argument("--contract", help="Contract address")
    
    args = parser.parse_args()
    
    private_key = args.private_key or os.environ.get("PRIVATE_KEY")
    contract_address = args.contract or os.environ.get("CONTRACT_ADDRESS")
    
    if not contract_address:
        print("❌ Error: Contract address required")
        sys.exit(1)
    
    # Use dummy key for read-only if not provided
    if not private_key:
        private_key = "0x" + "00" * 32
    
    court_names = [
        "General", "Finance", "Sports", "Politics",
        "Technology", "Entertainment", "Crypto", "Science"
    ]
    
    try:
        client = AIJudgeClient(
            private_key=private_key,
            rpc_url=args.rpc_url,
            contract_address=contract_address
        )
        
        target_address = args.address or client.address
        
        judge_info = client.get_judge(target_address)
        
        print("\n" + "=" * 60)
        print(f"⚖️  Judge Information")
        print("=" * 60)
        print(f"Address: {judge_info['address']}")
        print(f"Status: {judge_info['status']}")
        print(f"Stake: {judge_info['stake']:.2f} USDC")
        print(f"Reputation Score: {judge_info['reputation_score']}/10000")
        print(f"Successful Resolutions: {judge_info['successful_resolutions']}")
        print(f"Failed Resolutions: {judge_info['failed_resolutions']}")
        
        courts = [court_names[i] for i in judge_info['court_ids']]
        print(f"\nCourts: {', '.join(courts)}")
        print("=" * 60)
        
    except Exception as e:
        print(f"\n❌ Error: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)


if __name__ == "__main__":
    main()
