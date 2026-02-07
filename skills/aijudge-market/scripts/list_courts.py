#!/usr/bin/env python3
"""
List all available sub-courts on AIJudgeMarket

Usage:
    python3 list_courts.py
"""

import argparse
import os
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from aijudge_client import AIJudgeClient


def main():
    parser = argparse.ArgumentParser(description="List all available courts")
    parser.add_argument("--rpc-url", default="https://sepolia.base.org",
                       help="RPC endpoint")
    parser.add_argument("--contract", help="Contract address")
    
    args = parser.parse_args()
    
    contract_address = args.contract or os.environ.get("CONTRACT_ADDRESS")
    
    if not contract_address:
        print("❌ Error: Contract address required")
        sys.exit(1)
    
    try:
        # Use dummy key for read-only
        client = AIJudgeClient(
            private_key="0x" + "00" * 32,
            rpc_url=args.rpc_url,
            contract_address=contract_address
        )
        
        courts = client.get_all_courts()
        
        print("\n" + "=" * 60)
        print("⚖️  Available Sub-Courts")
        print("=" * 60)
        
        for court in courts:
            print(f"\nID: {court['id']}")
            print(f"Name: {court['name']}")
            
            # Description based on court type
            descriptions = {
                "General": "Default court for any dispute type",
                "Finance": "DeFi protocols, trading, price oracles, financial disputes",
                "Sports": "Game outcomes, scores, player statistics",
                "Politics": "Elections, governance votes, policy decisions",
                "Technology": "Software bugs, security incidents, tech disputes",
                "Entertainment": "Awards, media events, entertainment disputes",
                "Crypto": "Blockchain-specific disputes, protocol issues",
                "Science": "Research claims, academic disputes, scientific matters"
            }
            print(f"Description: {descriptions.get(court['name'], 'Specialized court')}")
        
        print("\n" + "=" * 60)
        print("\n💡 Tip: Join specialized courts to get selected for relevant markets")
        print("   Use: python3 join_court.py --court-id <ID>")
        print("=" * 60)
        
    except Exception as e:
        print(f"\n❌ Error: {e}")
        sys.exit(1)


if __name__ == "__main__":
    main()
