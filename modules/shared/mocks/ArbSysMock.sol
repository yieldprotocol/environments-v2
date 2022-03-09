// SPDX-License-Identifier: GPL-3.0-or-later
pragma solidity ^0.8.0;

/**
Mock Arbitrum's ArbSys precompile (deployed at 0x64)

Useful when forking Arbitrum with hardhat: the fork doesn't have Arbitrum-specific precompiles
 */
contract ArbSysMock {
    /**
    * @notice Get Arbitrum block number
    * @return block number as int
     */ 
    function arbBlockNumber() external view returns (uint) {
        return block.number;
    }
}
