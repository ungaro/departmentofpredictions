#!/usr/bin/env python3
"""
Example usage of AIJudgeMarket skill

This demonstrates the complete workflow:
1. Create a market
2. Register as judge
3. Join a court
4. Commit vote
5. Reveal vote
"""

import os
import sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from aijudge_client import AIJudgeClient


def main():
    # Configuration - replace with your values
    PRIVATE_KEY = os.environ.get("PRIVATE_KEY", "0xYOUR_PRIVATE_KEY")
    RPC_URL = os.environ.get("RPC_URL", "https://sepolia.base.org")
    CONTRACT_ADDRESS = os.environ.get("CONTRACT_ADDRESS", "0xYOUR_CONTRACT")
    
    if "YOUR" in PRIVATE_KEY or "YOUR" in CONTRACT_ADDRESS:
        print("⚠️  Please set your PRIVATE_KEY and CONTRACT_ADDRESS environment variables")
        print("   export PRIVATE_KEY=0x...")
        print("   export CONTRACT_ADDRESS=0x...")
        return
    
    print("🎯 AIJudgeMarket Example Workflow")
    print("=" * 60)
    
    # Initialize client
    client = AIJudgeClient(
        private_key=PRIVATE_KEY,
        rpc_url=RPC_URL,
        contract_address=CONTRACT_ADDRESS
    )
    
    print(f"Connected as: {client.address}")
    
    # Example 1: List available courts
    print("\n📋 Available Courts:")
    courts = client.get_all_courts()
    for court in courts:
        print(f"   {court['id']}: {court['name']}")
    
    # Example 2: Get your judge status
    print("\n⚖️  Your Judge Status:")
    try:
        judge_info = client.get_judge()
        print(f"   Status: {judge_info['status']}")
        print(f"   Stake: {judge_info['stake']} USDC")
        print(f"   Reputation: {judge_info['reputation_score']}")
        print(f"   Courts: {judge_info['court_ids']}")
    except Exception as e:
        print(f"   Not registered as judge: {e}")
    
    # Example 3: Get market info
    print("\n📊 Market #0 Info:")
    try:
        market = client.get_market(0)
        print(f"   Question: {market['question'][:50]}...")
        print(f"   Status: {market['status']}")
        print(f"   Court: {market.get('court_id', 0)}")
    except Exception as e:
        print(f"   Market not found: {e}")
    
    # Example 4: Compute commit hash
    print("\n🔐 Computing Commit Hash:")
    outcome = 1  # YES
    salt = "example_salt_12345"
    commit_hash = client.compute_commit_hash(outcome, salt)
    print(f"   Outcome: {'YES' if outcome == 1 else 'NO'}")
    print(f"   Salt: {salt}")
    print(f"   Commit Hash: {commit_hash}")
    
    print("\n" + "=" * 60)
    print("✅ Example completed!")
    print("\nNext steps:")
    print("  1. Run: python3 create_market.py --question \"...\" --resolution-time ...")
    print("  2. Run: python3 register_judge.py --stake 1000 --approve")
    print("  3. Run: python3 join_court.py --court-id 1")
    print("  4. Run: python3 commit_vote.py --market-id 0 --outcome yes --salt ...")
    print("  5. Run: python3 reveal_vote.py --market-id 0 --outcome yes --salt ...")


if __name__ == "__main__":
    main()
