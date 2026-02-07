//! SP1 ZK Program for AIJudgeMarket Evidence Verification
//! 
//! This program proves that the prover knows the content of evidence
//! without revealing the actual content on-chain.
//! 
//! Inputs (private):
//!   - evidence_content: The actual evidence text/data
//!   - salt: Random salt for commitment
//! 
//! Outputs (public):
//!   - evidence_hash: Poseidon/hash of evidence content
//!   - commitment: Hash of (evidence_hash + salt)

#![no_main]

use sha2::{Digest, Sha256};

sp1_zkvm::entrypoint!(main);

/// Main entrypoint for the ZK program
/// 
/// Reads private inputs (evidence content and salt)
/// Computes public outputs (hashes)
/// Commits public outputs to the blockchain
pub fn main() {
    // Read private inputs from the prover
    let evidence_content: String = sp1_zkvm::io::read();
    let salt: String = sp1_zkvm::io::read();
    
    // Compute evidence hash (public output)
    let evidence_hash = compute_evidence_hash(&evidence_content);
    
    // Compute commitment (public output)
    // This allows the judge to commit to evidence without revealing it
    let commitment = compute_commitment(&evidence_hash, &salt);
    
    // Commit public values to the blockchain
    // These can be verified without knowing the actual evidence content
    sp1_zkvm::io::commit(&evidence_hash);
    sp1_zkvm::io::commit(&commitment);
    
    // Also commit a boolean indicating the evidence length is reasonable
    // This prevents spam with extremely large evidence
    let valid_length = evidence_content.len() <= 10000; // Max 10KB
    sp1_zkvm::io::commit(&valid_length);
}

/// Compute SHA-256 hash of evidence content
/// 
/// This is deterministic and can be verified off-chain
fn compute_evidence_hash(content: &str) -> [u8; 32] {
    let mut hasher = Sha256::new();
    hasher.update(content.as_bytes());
    hasher.finalize().into()
}

/// Compute commitment: Hash of (evidence_hash + salt)
/// 
/// Used in commit-reveal scheme:
/// 1. Judge commits to evidence_hash + salt
/// 2. Later reveals evidence_hash (and optionally salt)
/// 3. Anyone can verify the commitment matches
fn compute_commitment(evidence_hash: &[u8; 32], salt: &str) -> [u8; 32] {
    let mut hasher = Sha256::new();
    hasher.update(evidence_hash);
    hasher.update(salt.as_bytes());
    hasher.finalize().into()
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_evidence_hash_deterministic() {
        let content = "Evidence: ETH price was $3500 at 12:00 UTC";
        let hash1 = compute_evidence_hash(content);
        let hash2 = compute_evidence_hash(content);
        assert_eq!(hash1, hash2);
    }

    #[test]
    fn test_commitment_unique_per_salt() {
        let evidence_hash = compute_evidence_hash("test evidence");
        let commitment1 = compute_commitment(&evidence_hash, "salt1");
        let commitment2 = compute_commitment(&evidence_hash, "salt2");
        assert_ne!(commitment1, commitment2);
    }

    #[test]
    fn test_commitment_verification() {
        let content = "Test evidence content";
        let salt = "my_secret_salt_123";
        
        let evidence_hash = compute_evidence_hash(content);
        let commitment = compute_commitment(&evidence_hash, salt);
        
        // Verify we can recompute the same commitment
        let recomputed = compute_commitment(&evidence_hash, salt);
        assert_eq!(commitment, recomputed);
    }
}