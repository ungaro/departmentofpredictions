#!/usr/bin/env python3
"""
Get market details from AIJudgeMarket

Usage:
    python3 get_market.py --market-id 0
    python3 get_market.py --market-id 0 --watch  # Poll for updates
"""

import argparse
import os
import sys
import time
from datetime import datetime

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from aijudge_client import AIJudgeClient


def format_market_info(market: dict, court_names: list) -> str:
    """Format market info for display"""
    lines = []
    lines.append("\n" + "=" * 60)
    lines.append(f"📊 Market #{market.get('market_id', 'N/A')}")
    lines.append("=" * 60)
    lines.append(f"Question: {market['question']}")
    lines.append(f"Creator: {market['creator']}")
    lines.append(f"Status: {market['status']}")
    
    if market['outcome'] != 0:
        outcome_str = "YES" if market['outcome'] == 1 else "NO"
        lines.append(f"Outcome: {outcome_str}")
    
    lines.append(f"\nResolution Time: {datetime.fromtimestamp(market['resolution_time'])} UTC")
    lines.append(f"Required Judges: {market['required_judges']}")
    
    court_id = market.get('court_id', 0)
    lines.append(f"Court: {court_names[court_id]} (ID: {court_id})")
    
    if market.get('challenge_deadline', 0) > 0:
        lines.append(f"\nChallenge Deadline: {datetime.fromtimestamp(market['challenge_deadline'])} UTC")
    
    lines.append(f"Reward Pool: {market.get('judge_reward_pool', 0) / 10**6:.2f} USDC")
    lines.append("=" * 60)
    
    return "\n".join(lines)


def main():
    parser = argparse.ArgumentParser(description="Get market details")
    parser.add_argument("--market-id", type=int, required=True, help="Market ID")
    parser.add_argument("--private-key", help="Private key (optional for read-only)")
    parser.add_argument("--rpc-url", default="https://sepolia.base.org",
                       help="RPC endpoint")
    parser.add_argument("--contract", help="Contract address")
    parser.add_argument("--watch", action="store_true",
                       help="Poll for updates every 10 seconds")
    parser.add_argument("--selected-judges", action="store_true",
                       help="Also show selected judges")
    
    args = parser.parse_args()
    
    private_key = args.private_key or os.environ.get("PRIVATE_KEY")
    contract_address = args.contract or os.environ.get("CONTRACT_ADDRESS")
    
    if not contract_address:
        print("❌ Error: Contract address required")
        sys.exit(1)
    
    # Use dummy key for read-only if not provided
    if not private_key:
        private_key = "0x" + "00" * 32  # Dummy key for view functions
    
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
        
        if args.watch:
            print(f"👀 Watching market {args.market_id} for updates...")
            print("Press Ctrl+C to stop\n")
            
            last_status = None
            while True:
                market = client.get_market(args.market_id)
                market['market_id'] = args.market_id
                
                if market['status'] != last_status:
                    print(format_market_info(market, court_names))
                    last_status = market['status']
                    
                    if args.selected_judges:
                        judges = client.get_selected_judges(args.market_id)
                        print(f"\n⚖️  Selected Judges ({len(judges)}):")
                        for j in judges:
                            print(f"   {j}")
                
                time.sleep(10)
        else:
            market = client.get_market(args.market_id)
            market['market_id'] = args.market_id
            print(format_market_info(market, court_names))
            
            if args.selected_judges:
                judges = client.get_selected_judges(args.market_id)
                print(f"\n⚖️  Selected Judges ({len(judges)}):")
                for j in judges:
                    print(f"   {j}")
                
    except KeyboardInterrupt:
        print("\n\n👋 Stopped watching")
    except Exception as e:
        print(f"\n❌ Error: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)


if __name__ == "__main__":
    main()
