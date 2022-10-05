// SPDX-License-Identifier: MIT
pragma solidity ^0.8.11;

interface IEulerMarkets {
    /// @notice Given an underlying, lookup the associated EToken
    /// @param underlying Token address
    /// @return EToken address, or address(0) if not activated
    function underlyingToEToken(address underlying)
        external
        view
        returns (address);
}
