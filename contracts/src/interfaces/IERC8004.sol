// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/// @title IIdentityRegistry - ERC-8004 Identity Registry Interface
/// @notice Censorship-resistant portable agent identifiers (ERC-721 based)
interface IIdentityRegistry {
    function register(string calldata tokenURI_) external returns (uint256 agentId);
    function ownerOf(uint256 agentId) external view returns (address);
    function agentExists(uint256 agentId) external view returns (bool);
    function totalAgents() external view returns (uint256);
    function setMetadata(uint256 agentId, string calldata key, bytes calldata value) external;
    function getMetadata(uint256 agentId, string calldata key) external view returns (bytes memory);
}

/// @title IReputationRegistry - ERC-8004 Reputation Registry Interface
/// @notice On-chain feedback signals with off-chain aggregation
interface IReputationRegistry {
    function giveFeedback(
        uint256 agentId,
        uint8 score,
        bytes32 tag1,
        bytes32 tag2,
        string calldata fileuri,
        bytes32 filehash,
        bytes memory feedbackAuth
    ) external;

    function getSummary(uint256 agentId, address[] calldata clientAddresses, bytes32 tag1, bytes32 tag2)
        external
        view
        returns (uint64 count, uint8 averageScore);

    function getIdentityRegistry() external view returns (address);
}

/// @title IValidationRegistry - ERC-8004 Validation Registry Interface
/// @notice Generic hooks for independent validator checks
interface IValidationRegistry {
    function validationRequest(
        address validatorAddress,
        uint256 agentId,
        string calldata requestUri,
        bytes32 requestHash
    ) external;

    function validationResponse(
        bytes32 requestHash,
        uint8 response,
        string calldata responseUri,
        bytes32 responseHash,
        bytes32 tag
    ) external;

    function getValidationStatus(bytes32 requestHash)
        external
        view
        returns (address validatorAddress, uint256 agentId, uint8 response, bytes32 tag, uint256 lastUpdate);

    function getIdentityRegistry() external view returns (address);
}
