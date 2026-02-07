#!/usr/bin/env python3
"""
Register as a judge on AIJudgeMarket

Usage:
    python3 register_judge.py --stake 1000
    python3 register_judge.py --stake 1000 --approve  # Approve and register in one step
"""

import argparse
import os
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from aijudge_client import AIJudgeClient


def main():
    parser = argparse.ArgumentParser(description="Register as a judge on AIJudgeMarket")
    parser.add_argument("--stake", type=int, required=True, 
                       help="Amount of USDC to stake (minimum 1000)")
    parser.add_argument("--approve", action="store_true",
                       help="Also approve USDC spending (saves a transaction)")
    parser.add_argument("--private-key", help="Private key (or set PRIVATE_KEY env var)")
    parser.add_argument("--rpc-url", default="https://sepolia.base.org",
                       help="RPC endpoint (default: https://sepolia.base.org)")
    parser.add_argument("--contract", help="Contract address (or set CONTRACT_ADDRESS env var)")
    parser.add_argument("--wait", action="store_true", help="Wait for transaction confirmation")
    
    args = parser.parse_args()
    
    if args.stake < 1000:
        print("❌ Error: Minimum stake is 1000 USDC")
        sys.exit(1)
    
    private_key = args.private_key or os.environ.get("PRIVATE_KEY")
    contract_address = args.contract or os.environ.get("CONTRACT_ADDRESS")
    
    if not private_key:
        print("❌ Error: Private key required")
        sys.exit(1)
    
    if not contract_address:
        print("❌ Error: Contract address required")
        sys.exit(1)
    
    print("⚖️  Registering as Judge")
    print("=" * 50)
    print(f"Stake: {args.stake} USDC")
    print(f"Network: {args.rpc_url}")
    print("=" * 50)
    
    try:
        client = AIJudgeClient(
            private_key=private_key,
            rpc_url=args.rpc_url,
            contract_address=contract_address
        )
        
        print(f"\n📍 Your address: {client.address}")
        
        # Check USDC balance
        balance = client.usdc.functions.balanceOf(client.address).call()
        balance_usdc = balance / 10**6
        print(f"💰 USDC Balance: {balance_usdc} USDC")
        
        if balance < args.stake * 10**6:
            print(f"❌ Error: Insufficient USDC balance. Need {args.stake}, have {balance_usdc}")
            sys.exit(1)
        
        # Approve if requested
        if args.approve:
            print(f"\n📤 Approving {args.stake} USDC...")
            approve_tx = client.approve_usdc(args.stake * 10**6)
            print(f"✅ Approval tx: {approve_tx}")
            
            if args.wait:
                print("⏳ Waiting for approval...")
                client.wait_for_transaction(approve_tx)
                print("✅ Approved!")
        
        # Register
        print(f"\n📤 Registering with {args.stake} USDC stake...")
        tx_hash = client.register_judge(args.stake)
        print(f"✅ Registration tx: {tx_hash}")
        
        if args.wait:
            print("⏳ Waiting for confirmation...")
            receipt = client.wait_for_transaction(tx_hash)
            print(f"✅ Confirmed in block {receipt['blockNumber']}")
            
            # Get judge info
            judge_info = client.get_judge()
            print("\n📊 Registration successful!")
            print(f"   Status: {judge_info['status']}")
            print(f"   Stake: {judge_info['stake']} USDC")
            print(f"   Reputation: {judge_info['reputation_score']}")
            print(f"   Courts: {judge_info['court_ids']}")
        else:
            print(f"\n📊 Check status with: python3 get_judge.py")
        
    except Exception as e:
        print(f"\n❌ Error: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)


if __name__ == "__main__":
    main()
