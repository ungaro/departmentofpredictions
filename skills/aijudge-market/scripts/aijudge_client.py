#!/usr/bin/env python3
"""
AIJudgeMarket Python Client
Core client library for interacting with AIJudgeMarket smart contracts.
"""

import os
import json
from typing import Optional, Dict, List, Any
from dataclasses import dataclass
from web3 import Web3
from eth_account import Account
from eth_abi import encode

@dataclass
class Market:
    """Market data structure"""
    market_id: int
    question: str
    resolution_time: int
    creator: str
    status: str  # Open, Resolving, Challenged, Resolved
    outcome: int  # 0=None, 1=Yes, 2=No
    required_judges: int
    court_id: int
    challenge_deadline: int

@dataclass
class Judge:
    """Judge data structure"""
    address: str
    stake: int
    successful_resolutions: int
    failed_resolutions: int
    status: str  # Inactive, Active, Suspended
    reputation_score: int
    court_ids: List[int]

class AIJudgeClient:
    """
    Client for interacting with AIJudgeMarket V2
    
    Example:
        client = AIJudgeClient(
            private_key="0x...",
            rpc_url="https://sepolia.base.org",
            contract_address="0x..."
        )
        
        # Create market
        market_id = client.create_market(
            question="Will ETH hit $5000?",
            resolution_time=1743465600,
            required_judges=5,
            court_id=1
        )
    """
    
    # Default USDC addresses
    USDC_ADDRESSES = {
        "base-sepolia": "0x036CbD53842c5426634e7929541eC2318f3dCF7e",
        "arc-testnet": "0x2eD9f0618E1e40a400DDb2D96C7A2834A3A1F964"
    }
    
    def __init__(
        self,
        private_key: str,
        rpc_url: str,
        contract_address: str,
        usdc_address: Optional[str] = None
    ):
        """
        Initialize AIJudgeMarket client
        
        Args:
            private_key: Ethereum private key (with 0x prefix)
            rpc_url: JSON-RPC endpoint
            contract_address: AIJudgeMarket proxy contract address
            usdc_address: Optional USDC address (auto-detected from chain)
        """
        self.w3 = Web3(Web3.HTTPProvider(rpc_url))
        self.account = Account.from_key(private_key)
        self.address = self.account.address
        
        # Load contract ABI
        abi_path = os.path.join(os.path.dirname(__file__), '..', 'references', 'contract_abi.json')
        with open(abi_path, 'r') as f:
            contract_abi = json.load(f)
        
        self.contract = self.w3.eth.contract(
            address=Web3.to_checksum_address(contract_address),
            abi=contract_abi
        )
        
        # USDC contract
        if usdc_address:
            self.usdc_address = Web3.to_checksum_address(usdc_address)
        else:
            # Auto-detect from chain ID
            chain_id = self.w3.eth.chain_id
            if chain_id == 84532:  # Base Sepolia
                self.usdc_address = self.USDC_ADDRESSES["base-sepolia"]
            elif chain_id == 5042002:  # ARC Testnet
                self.usdc_address = self.USDC_ADDRESSES["arc-testnet"]
            else:
                raise ValueError(f"Unknown chain ID: {chain_id}. Please specify USDC address.")
        
        # Minimal ERC20 ABI for USDC
        usdc_abi = [
            {"constant": False, "inputs": [{"name": "_spender", "type": "address"}, {"name": "_value", "type": "uint256"}], "name": "approve", "outputs": [{"name": "", "type": "bool"}], "type": "function"},
            {"constant": True, "inputs": [{"name": "_owner", "type": "address"}], "name": "balanceOf", "outputs": [{"name": "balance", "type": "uint256"}], "type": "function"},
            {"constant": True, "inputs": [], "name": "decimals", "outputs": [{"name": "", "type": "uint8"}], "type": "function"}
        ]
        self.usdc = self.w3.eth.contract(address=self.usdc_address, abi=usdc_abi)
    
    def _send_transaction(self, function, value: int = 0) -> str:
        """Send a transaction and return tx hash"""
        tx = function.build_transaction({
            'from': self.address,
            'nonce': self.w3.eth.get_transaction_count(self.address),
            'gas': 500000,
            'gasPrice': self.w3.eth.gas_price,
            'value': value
        })
        
        signed_tx = self.account.sign_transaction(tx)
        tx_hash = self.w3.eth.send_raw_transaction(signed_tx.rawTransaction)
        return self.w3.to_hex(tx_hash)
    
    def _call(self, function) -> Any:
        """Call a view function"""
        return function.call({'from': self.address})
    
    # ==================== MARKET OPERATIONS ====================
    
    def create_market(
        self,
        question: str,
        resolution_time: int,
        required_judges: int,
        court_id: int = 0
    ) -> str:
        """
        Create a new prediction market
        
        Args:
            question: The prediction question (max 500 chars)
            resolution_time: Unix timestamp when market resolves
            required_judges: Number of judges (3-21)
            court_id: Sub-court category (0-7)
            
        Returns:
            Transaction hash
        """
        func = self.contract.functions.createMarket(
            question,
            resolution_time,
            required_judges,
            court_id
        )
        return self._send_transaction(func)
    
    def get_market(self, market_id: int) -> Dict:
        """Get market details by ID"""
        result = self._call(self.contract.functions.getMarket(market_id))
        return {
            'question': result[0],
            'resolution_time': result[1],
            'creator': result[2],
            'status': ['Open', 'Resolving', 'Challenged', 'Resolved'][result[3]],
            'outcome': result[4],
            'required_judges': result[5],
            'judge_reward_pool': result[6],
            'total_staked': result[7],
            'evidence_hash': result[8],
            'resolution_timestamp': result[9],
            'challenge_deadline': result[10],
            'creation_time': result[11],
            'court_id': result[16] if len(result) > 16 else 0
        }
    
    def select_judges(self, market_id: int) -> str:
        """Trigger judge selection for a market (requires MANAGER_ROLE)"""
        func = self.contract.functions.selectJudgesForMarket(market_id)
        return self._send_transaction(func)
    
    def finalize_resolution(self, market_id: int) -> str:
        """Finalize market resolution after challenge window"""
        func = self.contract.functions.finalizeResolution(market_id)
        return self._send_transaction(func)
    
    # ==================== JUDGE OPERATIONS ====================
    
    def approve_usdc(self, amount: int) -> str:
        """Approve USDC spending for the contract"""
        func = self.usdc.functions.approve(self.contract.address, amount)
        return self._send_transaction(func)
    
    def register_judge(self, stake_usdc: int) -> str:
        """
        Register as a judge with USDC stake
        
        Args:
            stake_usdc: Amount to stake in USDC (will be converted to 6 decimals)
            
        Note: Must approve USDC first with approve_usdc()
        """
        amount = stake_usdc * 10**6  # Convert to 6 decimals
        func = self.contract.functions.registerAsJudge(amount)
        return self._send_transaction(func)
    
    def deregister_judge(self) -> str:
        """Exit protocol and retrieve stake"""
        func = self.contract.functions.deregisterAsJudge()
        return self._send_transaction(func)
    
    def get_judge(self, address: Optional[str] = None) -> Dict:
        """Get judge details"""
        addr = address or self.address
        result = self._call(self.contract.functions.getJudge(addr))
        courts = self._call(self.contract.functions.getJudgeCourts(addr))
        return {
            'address': addr,
            'stake': result[0] / 10**6,  # Convert from 6 decimals
            'successful_resolutions': result[1],
            'failed_resolutions': result[2],
            'status': ['Inactive', 'Active', 'Suspended'][result[3]],
            'reputation_score': result[5],
            'court_ids': list(courts)
        }
    
    def join_court(self, court_id: int) -> str:
        """Join a specialized sub-court"""
        func = self.contract.functions.joinCourt(court_id)
        return self._send_transaction(func)
    
    def leave_court(self, court_id: int) -> str:
        """Leave a sub-court"""
        func = self.contract.functions.leaveCourt(court_id)
        return self._send_transaction(func)
    
    # ==================== VOTING OPERATIONS ====================
    
    def compute_commit_hash(self, outcome: int, salt: str) -> str:
        """
        Compute commit hash for vote (matches contract's abi.encodePacked)

        Args:
            outcome: 1 for Yes, 2 for No (enum Outcome values)
            salt: bytes32 hex string (with or without 0x prefix)

        Returns:
            bytes32 commit hash as hex string
        """
        # Contract uses: keccak256(abi.encodePacked(outcome, salt))
        # outcome is uint8 (enum), salt is bytes32
        salt_bytes = bytes.fromhex(salt.replace('0x', ''))
        packed = bytes([outcome]) + salt_bytes
        return self.w3.keccak(packed).hex()
    
    def commit_vote(self, market_id: int, outcome: int, salt: str) -> str:
        """
        Submit commit hash for vote
        
        Args:
            market_id: Market to vote on
            outcome: 1 for Yes, 0 for No (must match salt when revealing)
            salt: Random salt string (keep secret until reveal)
        """
        commit_hash = self.compute_commit_hash(outcome, salt)
        func = self.contract.functions.commitVote(market_id, commit_hash)
        return self._send_transaction(func)
    
    def reveal_vote(
        self,
        market_id: int,
        outcome: int,
        salt: str,
        evidence_hash: str = "0x" + "0" * 64,
        rationale_hash: str = "0x" + "0" * 64
    ) -> str:
        """
        Reveal committed vote
        
        Args:
            market_id: Market ID
            outcome: Must match what was committed
            salt: Must match what was used in commit
            evidence_hash: Optional IPFS hash of evidence
            rationale_hash: Optional IPFS hash of AI rationale
        """
        # Convert string hashes to bytes32 if needed
        if evidence_hash.startswith('0x'):
            evidence_hash = evidence_hash[2:]
        if rationale_hash.startswith('0x'):
            rationale_hash = rationale_hash[2:]
            
        func = self.contract.functions.revealVote(
            market_id,
            outcome,
            salt.encode(),
            bytes.fromhex(evidence_hash),
            bytes.fromhex(rationale_hash)
        )
        return self._send_transaction(func)
    
    def get_vote(self, market_id: int, judge_address: Optional[str] = None) -> Dict:
        """Get vote details for a judge on a market"""
        addr = judge_address or self.address
        result = self._call(self.contract.functions.getVote(market_id, addr))
        return {
            'judge': result[0],
            'outcome': result[1],
            'timestamp': result[2],
            'evidence_hash': result[3],
            'rationale_hash': result[4],
            'revealed': result[5]
        }
    
    # ==================== CHALLENGE OPERATIONS ====================
    
    def challenge_resolution(self, market_id: int, claimed_outcome: int) -> str:
        """
        Challenge a market resolution
        
        Args:
            market_id: Market to challenge
            claimed_outcome: What you think the correct outcome is
            
        Note: Requires 1000 USDC challenge stake
        """
        func = self.contract.functions.challengeResolution(market_id, claimed_outcome)
        return self._send_transaction(func)
    
    def get_challenge(self, market_id: int) -> Dict:
        """Get challenge details for a market"""
        result = self._call(self.contract.functions.getChallenge(market_id))
        return {
            'challenger': result[0],
            'claimed_outcome': result[1],
            'stake': result[2] / 10**6,
            'timestamp': result[3],
            'resolved': result[4],
            'challenger_won': result[5]
        }
    
    # ==================== UTILITY ====================
    
    def get_selected_judges(self, market_id: int) -> List[str]:
        """Get list of judges selected for a market"""
        return self._call(self.contract.functions.getSelectedJudges(market_id))
    
    # Court ID -> name mapping (off-chain, not stored in contract)
    COURT_NAMES = {
        0: "General", 1: "Finance", 2: "Sports", 3: "Politics",
        4: "Technology", 5: "Entertainment", 6: "Crypto", 7: "Science",
    }

    def get_all_courts(self) -> List[Dict]:
        """Get list of all available courts"""
        return [{'id': i, 'name': n} for i, n in self.COURT_NAMES.items()]
    
    def wait_for_transaction(self, tx_hash: str, timeout: int = 120) -> Dict:
        """Wait for transaction receipt"""
        return self.w3.eth.wait_for_transaction_receipt(tx_hash, timeout=timeout)


if __name__ == "__main__":
    # Example usage
    print("AIJudgeMarket Client Library")
    print("Import with: from aijudge_client import AIJudgeClient")
