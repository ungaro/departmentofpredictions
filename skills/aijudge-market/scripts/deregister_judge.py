#!/usr/bin/env python3
"""
Deregister as a judge and retrieve your stake

Usage:
    python3 deregister_judge.py
"""

import argparse
import os
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from aijudge_client import AIJudgeClient


def main():
    parser = argparse.ArgumentParser(description="Deregister as a judge and retrieve stake")
    parser.add_argument("--private-key", help="Private key (or set PRIVATE_KEY env var)")
    parser.add_argument("--rpc-url", default="https://sepolia.base.org",
                       help="RPC endpoint")
    parser.add_argument("--contract", help="Contract address")
    parser.add_argument("--wait", action="store_true", help="Wait for confirmation")
    parser.add_argument("--yes", action="store_true", help="Skip confirmation prompt")
    
    args = parser.parse_args()
    
    private_key = args.private_key or os.environ.get("PRIVATE_KEY")
    contract_address = args.contract or os.environ.get("CONTRACT_ADDRESS")
    
    if not private_key or not contract_address:
        print("❌ Error: Private key and contract address required")
        sys.exit(1)
    
    try:
        client = AIJudgeClient(
            private_key=private_key,
            rpc_url=args.rpc_url,
            contract_address=contract_address
        )
        
        # Get current judge info
        judge_info = client.get_judge()
        
        print("⚠️  Deregister as Judge")
        print("=" * 50)
        print(f"Your address: {client.address}")
        print(f"Current stake: {judge_info['stake']:.2f} USDC")
        print(f"Status: {judge_info['status']}")
        print("=" * 50)
        print("\n⚠️  WARNING: This will:")
        print("   - Remove you from active judges")
        print("   - Return your staked USDC")
        print("   - Forfeit any pending rewards")
        print("\n   You cannot have any active commitments!")
        
        if not args.yes:
            response = input("\nAre you sure? (yes/no): ")
            if response.lower() != "yes":
                print("Cancelled.")
                sys.exit(0)
        
        print(f"\n📤 Submitting deregistration...")
        tx_hash = client.deregister_judge()
        print(f"✅ Transaction submitted: {tx_hash}")
        
        if args.wait:
            print("⏳ Waiting for confirmation...")
            receipt = client.wait_for_transaction(tx_hash)
            print(f"✅ Confirmed in block {receipt['blockNumber']}")
            print(f"\n💰 Your {judge_info['stake']:.2f} USDC has been returned!")
        
    except Exception as e:
        print(f"\n❌ Error: {e}")
        if "InvalidStake" in str(e) or "latestCommitment" in str(e):
            print("\n⚠️  You have active commitments!")
            print("   Complete or reveal all pending votes first.")
        sys.exit(1)


if __name__ == "__main__":
    main()
