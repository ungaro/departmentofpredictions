// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title ISP1Verifier
 * @notice Interface for SP1 verifier contract
 */
interface ISP1Verifier {
    function verifyProof(bytes32 programVKey, bytes calldata publicValues, bytes calldata proof) external view;
}

/**
 * @title SP1VerifierIntegration
 * @notice Integration contract for verifying SP1 ZK proofs in AIJudgeMarket
 * @dev This contract wraps SP1 verifier and provides AIJudge-market-specific validation
 */
contract SP1VerifierIntegration {
    /// @notice SP1 verifier contract address
    address public immutable sp1Verifier;

    /// @notice Program verification key for evidence proofs
    bytes32 public evidenceProgramVKey;

    /// @notice Program verification key for AI analysis proofs
    bytes32 public aiAnalysisProgramVKey;

    /// @notice Admin who can update verification keys
    address public admin;

    // ============================================================
    // EVENTS
    // ============================================================

    event EvidenceProofVerified(bytes32 indexed evidenceHash, bytes32 indexed commitment, bool validLength);

    event AIAnalysisProofVerified(uint8 indexed outcome, uint16 confidence, bytes32 indexed evidenceHash);

    event ProgramVKeyUpdated(string programType, bytes32 oldVKey, bytes32 newVKey);

    // ============================================================
    // ERRORS
    // ============================================================

    error InvalidProof();
    error InvalidPublicValues();
    error InvalidProgramVKey();
    error Unauthorized();

    // ============================================================
    // CONSTRUCTOR
    // ============================================================

    constructor(address _sp1Verifier, bytes32 _evidenceProgramVKey, bytes32 _aiAnalysisProgramVKey) {
        sp1Verifier = _sp1Verifier;
        evidenceProgramVKey = _evidenceProgramVKey;
        aiAnalysisProgramVKey = _aiAnalysisProgramVKey;
        admin = msg.sender;
    }

    // ============================================================
    // MODIFIERS
    // ============================================================

    modifier onlyAdmin() {
        if (msg.sender != admin) revert Unauthorized();
        _;
    }

    // ============================================================
    // EVIDENCE PROOF VERIFICATION
    // ============================================================

    /**
     * @notice Verify a ZK proof that the prover knows evidence content
     * @param proof The SP1 proof bytes
     * @param publicValues The public values committed by the prover
     * @return evidenceHash The hash of the evidence
     * @return commitment The commitment hash for commit-reveal
     * @return validLength Whether evidence length is valid
     */
    function verifyEvidenceProof(bytes calldata proof, bytes calldata publicValues)
        external
        returns (bytes32 evidenceHash, bytes32 commitment, bool validLength)
    {
        if (evidenceProgramVKey == bytes32(0)) revert InvalidProgramVKey();

        // Verify the proof using SP1 verifier
        ISP1Verifier(sp1Verifier).verifyProof(evidenceProgramVKey, publicValues, proof);

        // Parse public values
        // Layout: evidence_hash (32 bytes) | commitment (32 bytes) | valid_length (1 byte)
        (evidenceHash, commitment, validLength) = parseEvidencePublicValues(publicValues);

        if (!validLength) revert InvalidPublicValues();

        emit EvidenceProofVerified(evidenceHash, commitment, validLength);

        return (evidenceHash, commitment, validLength);
    }

    /**
     * @notice Parse public values from evidence proof
     * @param publicValues The raw public values bytes
     */
    function parseEvidencePublicValues(bytes calldata publicValues)
        public
        pure
        returns (bytes32 evidenceHash, bytes32 commitment, bool validLength)
    {
        require(publicValues.length >= 65, "Invalid public values length");

        evidenceHash = bytes32(publicValues[0:32]);
        commitment = bytes32(publicValues[32:64]);
        validLength = publicValues[64] != 0;
    }

    // ============================================================
    // AI ANALYSIS PROOF VERIFICATION
    // ============================================================

    /**
     * @notice Verify a ZK proof of AI analysis
     * @param proof The SP1 proof bytes
     * @param publicValues The public values committed by the prover
     * @return outcome AI decision (0=No, 1=Yes)
     * @return confidence Confidence score (0-10000 basis points)
     * @return evidenceHash Hash of evidence analyzed
     */
    function verifyAIAnalysisProof(bytes calldata proof, bytes calldata publicValues)
        external
        returns (uint8 outcome, uint16 confidence, bytes32 evidenceHash)
    {
        if (aiAnalysisProgramVKey == bytes32(0)) revert InvalidProgramVKey();

        // Verify the proof
        ISP1Verifier(sp1Verifier).verifyProof(aiAnalysisProgramVKey, publicValues, proof);

        // Parse public values
        // Layout: outcome (1 byte) | confidence (2 bytes) | evidence_hash (32 bytes) | reasoning_hash (32 bytes)
        (outcome, confidence, evidenceHash) = parseAIAnalysisPublicValues(publicValues);

        if (outcome > 1) revert InvalidPublicValues();
        if (confidence > 10000) revert InvalidPublicValues();

        emit AIAnalysisProofVerified(outcome, confidence, evidenceHash);

        return (outcome, confidence, evidenceHash);
    }

    /**
     * @notice Parse public values from AI analysis proof
     */
    function parseAIAnalysisPublicValues(bytes calldata publicValues)
        public
        pure
        returns (uint8 outcome, uint16 confidence, bytes32 evidenceHash)
    {
        require(publicValues.length >= 35, "Invalid public values length");

        outcome = uint8(publicValues[0]);
        confidence = uint16(bytes2(publicValues[1:3]));
        evidenceHash = bytes32(publicValues[3:35]);
    }

    // ============================================================
    // ADMIN FUNCTIONS
    // ============================================================

    /**
     * @notice Update the evidence program verification key
     * @param _newVKey The new verification key
     */
    function updateEvidenceProgramVKey(bytes32 _newVKey) external onlyAdmin {
        bytes32 oldVKey = evidenceProgramVKey;
        evidenceProgramVKey = _newVKey;
        emit ProgramVKeyUpdated("evidence", oldVKey, _newVKey);
    }

    /**
     * @notice Update the AI analysis program verification key
     * @param _newVKey The new verification key
     */
    function updateAIAnalysisProgramVKey(bytes32 _newVKey) external onlyAdmin {
        bytes32 oldVKey = aiAnalysisProgramVKey;
        aiAnalysisProgramVKey = _newVKey;
        emit ProgramVKeyUpdated("ai_analysis", oldVKey, _newVKey);
    }

    /**
     * @notice Transfer admin rights
     * @param _newAdmin The new admin address
     */
    function transferAdmin(address _newAdmin) external onlyAdmin {
        admin = _newAdmin;
    }

    // ============================================================
    // VIEW FUNCTIONS
    // ============================================================

    /**
     * @notice Check if evidence proof verification is enabled
     */
    function isEvidenceVerificationEnabled() external view returns (bool) {
        return evidenceProgramVKey != bytes32(0);
    }

    /**
     * @notice Check if AI analysis proof verification is enabled
     */
    function isAIAnalysisVerificationEnabled() external view returns (bool) {
        return aiAnalysisProgramVKey != bytes32(0);
    }
}
