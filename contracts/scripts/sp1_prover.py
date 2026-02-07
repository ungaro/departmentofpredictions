#!/usr/bin/env python3
"""
SP1 ZK Proof Generator for AIJudgeMarket

Generates ZK proofs that can be verified on-chain without revealing
private evidence content.

Usage:
    python3 sp1_prover.py evidence --content "evidence text" --salt "secret_salt"
    python3 sp1_prover.py ai-analysis --evidence "..." --ai-output "..."
"""

import argparse
import json
import hashlib
import subprocess
import os
import sys
from typing import Tuple, Optional
from dataclasses import dataclass
from pathlib import Path

@dataclass
class EvidenceProof:
    """Result of evidence ZK proof generation"""
    evidence_hash: bytes
    commitment: bytes
    valid_length: bool
    proof: bytes
    public_values: bytes

@dataclass
class AIAnalysisProof:
    """Result of AI analysis ZK proof generation"""
    outcome: int
    confidence: int
    evidence_hash: bytes
    reasoning_hash: bytes
    proof: bytes
    public_values: bytes


class SP1Prover:
    """
    Client for generating SP1 ZK proofs for AIJudgeMarket.
    
    This handles:
    1. Running SP1 prover locally or via Succinct's proving service
    2. Generating proof artifacts
    3. Returning proof bytes ready for on-chain verification
    """
    
    def __init__(self, network: str = "local"):
        """
        Initialize SP1 prover client.
        
        Args:
            network: "local" for local proving, "cloud" for Succinct's service
        """
        self.network = network
        self.sp1_dir = Path(__file__).parent.parent / "zkvm"
        
    def generate_evidence_proof(
        self,
        evidence_content: str,
        salt: str
    ) -> EvidenceProof:
        """
        Generate ZK proof that prover knows evidence content.
        
        The proof proves:
        - Prover knows evidence_content (private)
        - Prover knows salt (private)  
        - evidence_hash = hash(evidence_content) (public)
        - commitment = hash(evidence_hash + salt) (public)
        - len(evidence_content) <= 10KB (public)
        
        Args:
            evidence_content: The actual evidence text/data (kept private)
            salt: Random salt for commitment scheme
            
        Returns:
            EvidenceProof containing public values and proof
        """
        # Validate inputs
        if len(evidence_content) > 10000:
            raise ValueError("Evidence content too large (max 10KB)")
        
        if len(salt) < 16:
            raise ValueError("Salt must be at least 16 characters for security")
        
        # Compute public values locally (for verification)
        evidence_hash = self._compute_hash(evidence_content)
        commitment = self._compute_commitment(evidence_hash, salt)
        valid_length = len(evidence_content) <= 10000
        
        # Generate ZK proof using SP1
        proof, public_values = self._run_sp1_prover(
            program="sp1-evidence",
            private_inputs={
                "evidence_content": evidence_content,
                "salt": salt
            },
            expected_public={
                "evidence_hash": evidence_hash.hex(),
                "commitment": commitment.hex(),
                "valid_length": valid_length
            }
        )
        
        return EvidenceProof(
            evidence_hash=evidence_hash,
            commitment=commitment,
            valid_length=valid_length,
            proof=proof,
            public_values=public_values
        )
    
    def generate_ai_analysis_proof(
        self,
        evidence: str,
        ai_model_output: str
    ) -> AIAnalysisProof:
        """
        Generate ZK proof of AI analysis.
        
        The proof proves:
        - AI analyzed evidence (private)
        - AI produced outcome and confidence (public)
        - Reasoning is consistent with outcome (public)
        
        Args:
            evidence: Evidence content analyzed (private)
            ai_model_output: AI's analysis output (private)
            
        Returns:
            AIAnalysisProof containing public decision and proof
        """
        # Parse AI output to extract public values
        outcome, confidence = self._parse_ai_output(ai_model_output)
        evidence_hash = self._compute_hash(evidence)
        reasoning_hash = self._compute_hash(ai_model_output)
        
        # Generate ZK proof
        proof, public_values = self._run_sp1_prover(
            program="sp1-ai-analysis",
            private_inputs={
                "evidence": evidence,
                "ai_model_output": ai_model_output
            },
            expected_public={
                "outcome": outcome,
                "confidence": confidence,
                "evidence_hash": evidence_hash.hex(),
                "reasoning_hash": reasoning_hash.hex()
            }
        )
        
        return AIAnalysisProof(
            outcome=outcome,
            confidence=confidence,
            evidence_hash=evidence_hash,
            reasoning_hash=reasoning_hash,
            proof=proof,
            public_values=public_values
        )
    
    def _compute_hash(self, data: str) -> bytes:
        """Compute SHA-256 hash"""
        return hashlib.sha256(data.encode()).digest()
    
    def _compute_commitment(self, evidence_hash: bytes, salt: str) -> bytes:
        """Compute commitment = hash(evidence_hash + salt)"""
        h = hashlib.sha256()
        h.update(evidence_hash)
        h.update(salt.encode())
        return h.digest()
    
    def _parse_ai_output(self, output: str) -> Tuple[int, int]:
        """
        Parse AI output to extract outcome and confidence.
        
        Returns:
            (outcome: 0 or 1, confidence: 0-10000 in basis points)
        """
        output_upper = output.upper()
        
        # Determine outcome
        if "YES" in output_upper:
            outcome = 1
        elif "NO" in output_upper:
            outcome = 0
        else:
            # Default to parsing first word
            first_word = output.split()[0].upper() if output else "NO"
            outcome = 1 if first_word == "YES" else 0
        
        # Extract confidence
        confidence = 5000  # Default 50%
        if "CONFIDENCE:" in output_upper:
            try:
                idx = output_upper.find("CONFIDENCE:") + len("CONFIDENCE:")
                rest = output[idx:].strip()
                # Look for percentage
                for word in rest.replace(",", " ").split():
                    if "%" in word:
                        pct = float(word.replace("%", ""))
                        confidence = int(pct * 100)  # Convert to basis points
                        break
            except:
                pass
        
        return outcome, min(confidence, 10000)
    
    def _run_sp1_prover(
        self,
        program: str,
        private_inputs: dict,
        expected_public: dict
    ) -> Tuple[bytes, bytes]:
        """
        Run SP1 prover to generate proof.
        
        In a real implementation, this would:
        1. Write inputs to JSON file
        2. Run `cargo prove` in the program directory
        3. Parse output to get proof and public values
        
        For hackathon/demo, we return mock proofs.
        """
        program_dir = self.sp1_dir / program
        
        if not program_dir.exists():
            raise FileNotFoundError(f"SP1 program not found: {program_dir}")
        
        # In production, this would actually run SP1
        # For now, return mock data
        print(f"Running SP1 prover for {program}...")
        print(f"Private inputs: {list(private_inputs.keys())}")
        print(f"Expected public outputs: {expected_public}")
        
        # Mock proof generation
        proof = b"MOCK_PROOF_" + program.encode() + b"_" + os.urandom(32)
        public_values = self._encode_public_values(expected_public)
        
        return proof, public_values
    
    def _encode_public_values(self, values: dict) -> bytes:
        """Encode public values for on-chain verification"""
        # Simple encoding for demo - production would use proper ABI encoding
        return json.dumps(values, sort_keys=True).encode()


def main():
    parser = argparse.ArgumentParser(description="SP1 ZK Proof Generator for AIJudgeMarket")
    subparsers = parser.add_subparsers(dest="command", help="Command to run")
    
    # Evidence proof command
    evidence_parser = subparsers.add_parser("evidence", help="Generate evidence proof")
    evidence_parser.add_argument("--content", required=True, help="Evidence content (private)")
    evidence_parser.add_argument("--salt", required=True, help="Random salt (private)")
    evidence_parser.add_argument("--output", help="Output file for proof")
    
    # AI analysis proof command
    ai_parser = subparsers.add_parser("ai-analysis", help="Generate AI analysis proof")
    ai_parser.add_argument("--evidence", required=True, help="Evidence analyzed (private)")
    ai_parser.add_argument("--ai-output", required=True, help="AI model output (private)")
    ai_parser.add_argument("--output", help="Output file for proof")
    
    # Network option
    parser.add_argument("--network", default="local", choices=["local", "cloud"],
                       help="Proving network to use")
    
    args = parser.parse_args()
    
    if not args.command:
        parser.print_help()
        return
    
    prover = SP1Prover(network=args.network)
    
    if args.command == "evidence":
        print("Generating evidence proof...")
        print(f"Evidence length: {len(args.content)} chars")
        
        proof = prover.generate_evidence_proof(args.content, args.salt)
        
        print(f"\n✅ Proof generated!")
        print(f"Evidence hash: 0x{proof.evidence_hash.hex()}")
        print(f"Commitment: 0x{proof.commitment.hex()}")
        print(f"Valid length: {proof.valid_length}")
        
        if args.output:
            with open(args.output, 'wb') as f:
                f.write(proof.proof)
            print(f"Proof saved to: {args.output}")
    
    elif args.command == "ai-analysis":
        print("Generating AI analysis proof...")
        
        proof = prover.generate_ai_analysis_proof(args.evidence, args.ai_output)
        
        print(f"\n✅ Proof generated!")
        print(f"Outcome: {'YES' if proof.outcome == 1 else 'NO'}")
        print(f"Confidence: {proof.confidence / 100:.1f}%")
        print(f"Evidence hash: 0x{proof.evidence_hash.hex()}")
        
        if args.output:
            with open(args.output, 'wb') as f:
                f.write(proof.proof)
            print(f"Proof saved to: {args.output}")


if __name__ == "__main__":
    main()