// SPDX-License-Identifier: BUSL-1.1
pragma solidity >=0.8.15;

import "@yield-protocol/vault-v2/src/interfaces/ICauldron.sol";
import "@yield-protocol/vault-v2/src/interfaces/DataTypes.sol";
import "@yield-protocol/utils-v2/src/access/AccessControl.sol";
import "@yield-protocol/utils-v2/src/utils/Cast.sol";


/// @title Shifter
/// @notice Shift vaults from one series to another
contract Shifter is AccessControl {
    using Cast for *;

    event Shifted(bytes12 indexed vaultId, bytes6 indexed oldSeriesId, bytes6 indexed newSeriesId);

    ICauldron public immutable cauldron;

    constructor(ICauldron cauldron_) {
        cauldron = cauldron_;
    }

    /// @dev Shift a vault from one series to another
    /// @param vaultId The vault to shift
    /// @param seriesId The new series
    function shift(bytes12 vaultId, bytes6 seriesId) external auth {
        DataTypes.Vault memory vault = cauldron.vaults(vaultId);
        DataTypes.Balances memory balances = cauldron.balances(vaultId);
        cauldron.pour(vaultId, 0, -(balances.art.i128()));
        cauldron.tweak(vaultId, seriesId, vault.ilkId);
        cauldron.pour(vaultId, 0, balances.art.i128());
        emit Shifted(vaultId, vault.seriesId, seriesId);
    }
}
