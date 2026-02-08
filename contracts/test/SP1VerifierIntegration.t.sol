// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Test, console} from "forge-std/Test.sol";
import "../src/SP1VerifierIntegration.sol";

/// @dev Mock SP1 verifier that always succeeds (unless configured to fail)
contract MockSP1Verifier is ISP1Verifier {
    bool public shouldRevert;

    function setShouldRevert(bool _shouldRevert) external {
        shouldRevert = _shouldRevert;
    }

    function verifyProof(bytes32, bytes calldata, bytes calldata) external view {
        if (shouldRevert) revert("proof verification failed");
    }
}

contract SP1VerifierIntegrationTest is Test {
    SP1VerifierIntegration public verifier;
    MockSP1Verifier public mockSP1;

    address public admin = address(1);
    address public nonAdmin = address(2);

    bytes32 constant EVIDENCE_VKEY = keccak256("evidence_vkey");
    bytes32 constant AI_ANALYSIS_VKEY = keccak256("ai_analysis_vkey");

    function setUp() public {
        mockSP1 = new MockSP1Verifier();

        vm.prank(admin);
        verifier = new SP1VerifierIntegration(address(mockSP1), EVIDENCE_VKEY, AI_ANALYSIS_VKEY);
    }

    // ================================================================
    // CONSTRUCTOR
    // ================================================================

    function test_ConstructorSetsState() public view {
        assertEq(verifier.sp1Verifier(), address(mockSP1));
        assertEq(verifier.evidenceProgramVKey(), EVIDENCE_VKEY);
        assertEq(verifier.aiAnalysisProgramVKey(), AI_ANALYSIS_VKEY);
        assertEq(verifier.admin(), admin);
    }

    // ================================================================
    // EVIDENCE PROOF VERIFICATION
    // ================================================================

    function test_VerifyEvidenceProof() public {
        // Layout: evidence_hash (32) | commitment (32) | valid_length (1)
        bytes32 evidenceHash = keccak256("my evidence");
        bytes32 commitment = keccak256("my commitment");
        bytes memory publicValues = abi.encodePacked(evidenceHash, commitment, uint8(1));

        vm.prank(admin);
        (bytes32 retHash, bytes32 retCommit, bool retValid) = verifier.verifyEvidenceProof("proof", publicValues);

        assertEq(retHash, evidenceHash);
        assertEq(retCommit, commitment);
        assertTrue(retValid);
    }

    function test_RevertEvidenceProofZeroVKey() public {
        // Deploy verifier with zero evidence vkey
        vm.prank(admin);
        SP1VerifierIntegration v2 = new SP1VerifierIntegration(address(mockSP1), bytes32(0), AI_ANALYSIS_VKEY);

        bytes memory publicValues = new bytes(65);

        vm.expectRevert(SP1VerifierIntegration.InvalidProgramVKey.selector);
        v2.verifyEvidenceProof("proof", publicValues);
    }

    function test_RevertEvidenceProofInvalidLength() public {
        // Layout: evidence_hash (32) | commitment (32) | valid_length (1) = but set to 0 (false)
        bytes32 evidenceHash = keccak256("evidence");
        bytes32 commitment = keccak256("commitment");
        bytes memory publicValues = abi.encodePacked(evidenceHash, commitment, uint8(0));

        vm.expectRevert(SP1VerifierIntegration.InvalidPublicValues.selector);
        verifier.verifyEvidenceProof("proof", publicValues);
    }

    function test_RevertEvidenceProofSP1Failure() public {
        mockSP1.setShouldRevert(true);

        bytes32 evidenceHash = keccak256("evidence");
        bytes32 commitment = keccak256("commitment");
        bytes memory publicValues = abi.encodePacked(evidenceHash, commitment, uint8(1));

        vm.expectRevert("proof verification failed");
        verifier.verifyEvidenceProof("bad_proof", publicValues);
    }

    // ================================================================
    // PARSE EVIDENCE PUBLIC VALUES
    // ================================================================

    function test_ParseEvidencePublicValuesRaw() public view {
        bytes32 evidenceHash = keccak256("evidence");
        bytes32 commitment = keccak256("commitment");
        bytes memory publicValues = abi.encodePacked(evidenceHash, commitment, uint8(1));

        (bytes32 retHash, bytes32 retCommit, bool retValid) = verifier.parseEvidencePublicValues(publicValues);
        assertEq(retHash, evidenceHash);
        assertEq(retCommit, commitment);
        assertTrue(retValid);
    }

    function test_RevertParseEvidenceTooShort() public {
        bytes memory shortValues = new bytes(64); // Need 65

        vm.expectRevert("Invalid public values length");
        verifier.parseEvidencePublicValues(shortValues);
    }

    // ================================================================
    // AI ANALYSIS PROOF VERIFICATION
    // ================================================================

    function test_VerifyAIAnalysisProof() public {
        // Layout: outcome (1) | confidence (2) | evidence_hash (32)
        uint8 outcome = 1; // Yes
        uint16 confidence = 8500; // 85%
        bytes32 evidenceHash = keccak256("analyzed evidence");
        bytes memory publicValues = abi.encodePacked(outcome, confidence, evidenceHash);

        (uint8 retOutcome, uint16 retConfidence, bytes32 retHash) =
            verifier.verifyAIAnalysisProof("proof", publicValues);

        assertEq(retOutcome, 1);
        assertEq(retConfidence, 8500);
        assertEq(retHash, evidenceHash);
    }

    function test_VerifyAIAnalysisProofOutcomeNo() public {
        uint8 outcome = 0; // No
        uint16 confidence = 9500;
        bytes32 evidenceHash = keccak256("evidence");
        bytes memory publicValues = abi.encodePacked(outcome, confidence, evidenceHash);

        (uint8 retOutcome, uint16 retConfidence,) = verifier.verifyAIAnalysisProof("proof", publicValues);
        assertEq(retOutcome, 0);
        assertEq(retConfidence, 9500);
    }

    function test_RevertAIAnalysisZeroVKey() public {
        vm.prank(admin);
        SP1VerifierIntegration v2 = new SP1VerifierIntegration(address(mockSP1), EVIDENCE_VKEY, bytes32(0));

        bytes memory publicValues = new bytes(35);

        vm.expectRevert(SP1VerifierIntegration.InvalidProgramVKey.selector);
        v2.verifyAIAnalysisProof("proof", publicValues);
    }

    function test_RevertAIAnalysisInvalidOutcome() public {
        // outcome > 1 should revert
        uint8 outcome = 2;
        uint16 confidence = 5000;
        bytes32 evidenceHash = keccak256("evidence");
        bytes memory publicValues = abi.encodePacked(outcome, confidence, evidenceHash);

        vm.expectRevert(SP1VerifierIntegration.InvalidPublicValues.selector);
        verifier.verifyAIAnalysisProof("proof", publicValues);
    }

    function test_RevertAIAnalysisInvalidConfidence() public {
        // confidence > 10000 should revert
        uint8 outcome = 1;
        uint16 confidence = 10001;
        bytes32 evidenceHash = keccak256("evidence");
        bytes memory publicValues = abi.encodePacked(outcome, confidence, evidenceHash);

        vm.expectRevert(SP1VerifierIntegration.InvalidPublicValues.selector);
        verifier.verifyAIAnalysisProof("proof", publicValues);
    }

    function test_RevertAIAnalysisSP1Failure() public {
        mockSP1.setShouldRevert(true);

        uint8 outcome = 1;
        uint16 confidence = 5000;
        bytes32 evidenceHash = keccak256("evidence");
        bytes memory publicValues = abi.encodePacked(outcome, confidence, evidenceHash);

        vm.expectRevert("proof verification failed");
        verifier.verifyAIAnalysisProof("bad_proof", publicValues);
    }

    // ================================================================
    // PARSE AI ANALYSIS PUBLIC VALUES
    // ================================================================

    function test_ParseAIAnalysisPublicValues() public view {
        uint8 outcome = 1;
        uint16 confidence = 7500;
        bytes32 evidenceHash = keccak256("evidence");
        bytes memory publicValues = abi.encodePacked(outcome, confidence, evidenceHash);

        (uint8 retOutcome, uint16 retConfidence, bytes32 retHash) =
            verifier.parseAIAnalysisPublicValues(publicValues);

        assertEq(retOutcome, 1);
        assertEq(retConfidence, 7500);
        assertEq(retHash, evidenceHash);
    }

    function test_RevertParseAIAnalysisTooShort() public {
        bytes memory shortValues = new bytes(34); // Need 35

        vm.expectRevert("Invalid public values length");
        verifier.parseAIAnalysisPublicValues(shortValues);
    }

    // ================================================================
    // ADMIN FUNCTIONS
    // ================================================================

    function test_UpdateEvidenceProgramVKey() public {
        bytes32 newVKey = keccak256("new_evidence_vkey");

        vm.prank(admin);
        verifier.updateEvidenceProgramVKey(newVKey);

        assertEq(verifier.evidenceProgramVKey(), newVKey);
    }

    function test_RevertUpdateEvidenceVKeyNonAdmin() public {
        vm.prank(nonAdmin);
        vm.expectRevert(SP1VerifierIntegration.Unauthorized.selector);
        verifier.updateEvidenceProgramVKey(keccak256("new"));
    }

    function test_UpdateAIAnalysisProgramVKey() public {
        bytes32 newVKey = keccak256("new_ai_vkey");

        vm.prank(admin);
        verifier.updateAIAnalysisProgramVKey(newVKey);

        assertEq(verifier.aiAnalysisProgramVKey(), newVKey);
    }

    function test_RevertUpdateAIVKeyNonAdmin() public {
        vm.prank(nonAdmin);
        vm.expectRevert(SP1VerifierIntegration.Unauthorized.selector);
        verifier.updateAIAnalysisProgramVKey(keccak256("new"));
    }

    function test_TransferAdmin() public {
        address newAdmin = address(42);

        vm.prank(admin);
        verifier.transferAdmin(newAdmin);

        assertEq(verifier.admin(), newAdmin);

        // Old admin can no longer call admin functions
        vm.prank(admin);
        vm.expectRevert(SP1VerifierIntegration.Unauthorized.selector);
        verifier.transferAdmin(admin);

        // New admin can
        vm.prank(newAdmin);
        verifier.transferAdmin(admin);
        assertEq(verifier.admin(), admin);
    }

    function test_RevertTransferAdminNonAdmin() public {
        vm.prank(nonAdmin);
        vm.expectRevert(SP1VerifierIntegration.Unauthorized.selector);
        verifier.transferAdmin(nonAdmin);
    }

    // ================================================================
    // VIEW FUNCTIONS
    // ================================================================

    function test_IsEvidenceVerificationEnabled() public view {
        assertTrue(verifier.isEvidenceVerificationEnabled());
    }

    function test_IsEvidenceVerificationDisabledWhenZeroVKey() public {
        vm.prank(admin);
        SP1VerifierIntegration v2 = new SP1VerifierIntegration(address(mockSP1), bytes32(0), AI_ANALYSIS_VKEY);

        assertFalse(v2.isEvidenceVerificationEnabled());
    }

    function test_IsAIAnalysisVerificationEnabled() public view {
        assertTrue(verifier.isAIAnalysisVerificationEnabled());
    }

    function test_IsAIAnalysisVerificationDisabledWhenZeroVKey() public {
        vm.prank(admin);
        SP1VerifierIntegration v2 = new SP1VerifierIntegration(address(mockSP1), EVIDENCE_VKEY, bytes32(0));

        assertFalse(v2.isAIAnalysisVerificationEnabled());
    }

    // ================================================================
    // FUZZ
    // ================================================================

    function testFuzz_ParseEvidencePublicValues(bytes32 evidenceHash, bytes32 commitment, uint8 validByte) public view {
        bytes memory publicValues = abi.encodePacked(evidenceHash, commitment, validByte);

        (bytes32 retHash, bytes32 retCommit, bool retValid) = verifier.parseEvidencePublicValues(publicValues);

        assertEq(retHash, evidenceHash);
        assertEq(retCommit, commitment);
        assertEq(retValid, validByte != 0);
    }

    function testFuzz_ParseAIAnalysisPublicValues(uint8 outcome, uint16 confidence, bytes32 evidenceHash)
        public
        view
    {
        bytes memory publicValues = abi.encodePacked(outcome, confidence, evidenceHash);

        (uint8 retOutcome, uint16 retConfidence, bytes32 retHash) =
            verifier.parseAIAnalysisPublicValues(publicValues);

        assertEq(retOutcome, outcome);
        assertEq(retConfidence, confidence);
        assertEq(retHash, evidenceHash);
    }
}
