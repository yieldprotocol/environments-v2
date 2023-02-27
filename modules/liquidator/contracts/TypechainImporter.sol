// SPDX-License-Identifier: GPL-3.0-or-later
pragma solidity ^0.8.1;

import "@yield-protocol/vault-v2/src/Cauldron.sol";
import "@yield-protocol/vault-v2/src/Join.sol";
import "@yield-protocol/vault-v2/src/oracles/compound/CompoundMultiOracle.sol";
import "@yield-protocol/vault-v2/src/oracles/chainlink/ChainlinkMultiOracle.sol";
import "@yield-protocol/vault-v2/src/FYToken.sol";
import "@yield-protocol/vault-v2/src/Witch.sol";
import "@yield-protocol/utils-v2/src/interfaces/IWETH9.sol";