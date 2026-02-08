// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/// @title ICreateX - Minimal interface for CreateX deterministic deployment factory
/// @notice CreateX is deployed at 0xba5Ed099633D3B313e4D5F7bdc1305d3c28ba5Ed on all chains
/// @dev See https://github.com/pcaversaccio/createx
interface ICreateX {
    /// @notice Deploys a contract using CREATE3 (CREATE + CREATE2 combo for address independence from init code)
    /// @param salt The 32-byte salt; first 20 bytes = deployer address, byte 21 = 0x00 (cross-chain), last 11 bytes = suffix
    /// @param initCode The contract creation code (constructor + args)
    /// @return newContract The address of the deployed contract
    function deployCreate3(bytes32 salt, bytes calldata initCode) external payable returns (address newContract);

    /// @notice Computes the CREATE3 address for a given salt and deployer
    /// @param salt The same 32-byte salt used in deployCreate3
    /// @param deployer The address that will call deployCreate3
    /// @return The predicted address of the contract
    function computeCreate3Address(bytes32 salt, address deployer) external pure returns (address);

    /// @notice Computes the CREATE3 address for msg.sender
    /// @param salt The same 32-byte salt used in deployCreate3
    /// @return The predicted address of the contract
    function computeCreate3Address(bytes32 salt) external view returns (address);
}
