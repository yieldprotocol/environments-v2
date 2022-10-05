// SPDX-License-Identifier: MIT
pragma solidity ^0.8.11;

interface IEulerEToken {
    /// @notice Transfer underlying tokens from sender to the Euler pool, and increase account's eTokens
    /// @param subAccountId 0 for primary, 1-255 for a sub-account
    /// @param amount In underlying units (use max uint256 for full underlying token balance)
    function deposit(uint256 subAccountId, uint256 amount) external;

    /// @notice Address of underlying asset
    function underlyingAsset() external view returns (address);

    function withdraw(uint subAccountId, uint amount) external;
}
