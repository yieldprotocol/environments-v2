// SPDX-License-Identifier: BUSL-1.1
pragma solidity >=0.8.15;
import "@yield-protocol/vault-v2/src/interfaces/DataTypes.sol";
import "@yield-protocol/vault-v2/src/interfaces/IFYToken.sol";
import "@yield-protocol/utils-v2/src/utils/Math.sol";
import "@yield-protocol/utils-v2/src/utils/Cast.sol";
import "./RegistryInterfaces.sol";

interface INotionalJoin {
    function accrual() external view returns (uint256);
}

/// @dev This contract checks the solvency of the Yield Protocol by comparing the
/// aggregated ETH value of fyToken in circulation against the aggregated ETH value
/// of all assets in the Joins
contract Solvency {
    using Cast for uint256;
    using Math for uint256;

    bytes6 constant public ETH = 0x303000000000;
    address constant public FCASH = 0x1344A36A1B56144C3Bc62E7757377D288fDE0369;

    ISeriesRegistry immutable public series;
    IOracleRegistry immutable public oracles;
    IJoinRegistry immutable public joins;

    constructor(ISeriesRegistry series_, IOracleRegistry oracles_, IJoinRegistry joins_) {
        series = series_;
        oracles = oracles_;
        joins = joins_;
    }

    /// @dev Returns the the aggregated ETH value of all assets in the Joins minus
    /// the aggregated ETH value of all fyToken in circulation
    function delta(bytes6[] calldata assetIds, bytes6[] calldata seriesIds) public view returns (int256 result) {
        result = available(assetIds).i256() - redeemable(seriesIds).i256();
    }

    /// @dev Returns the the aggregated ETH value of all assets in the Joins divided
    /// by the aggregated ETH value of all fyToken in circulation, with 6 decimals
    function ratio(bytes6[] calldata assetIds, bytes6[] calldata seriesIds) public view returns (int256 result) {
        result = (available(assetIds).i256() * 1e6) / redeemable(seriesIds).i256();
    }

    /// @dev Returns the the aggregated ETH value of all fyToken in circulation
    function redeemable(bytes6[] calldata seriesIds) public view returns(uint256 aggregated) {
        for (uint256 s; s < seriesIds.length; s++) {
            DataTypes.Series memory series_ = series.series(seriesIds[s]);
            bytes6 baseId = series_.baseId;
            IFYToken fyToken = series_.fyToken;
            IOracle oracle = oracles.spotOracles(baseId, ETH).oracle;
            (uint256 seriesRedeemable,) = oracle.peek(baseId, ETH, fyToken.totalSupply());
            aggregated += seriesRedeemable;
        }
    }

    /// @dev Returns the the aggregated ETH value of all assets in the Joins
    function available(bytes6[] calldata assetIds) public view returns(uint256 aggregated) {
        for (uint256 a; a < assetIds.length; a++) {
            bytes6 assetId = assetIds[a];
            IJoin join = joins.joins(assetId);
            IOracle oracle = oracles.spotOracles(assetId, ETH).oracle;
            uint256 storedBalance = join.storedBalance();
            if (join.asset() == FCASH) {
                uint256 accrual = INotionalJoin(address(join)).accrual();
                // If we are dealing with a mature NotionalJoin, we convert the storedBalance to an fCash amount (at the time of maturity) dividing by the accrual
                if (accrual != 0) storedBalance = storedBalance.wdiv(accrual);
            }

            (uint256 joinAvailable,) = oracle.peek(assetId, ETH, storedBalance);
            aggregated += joinAvailable;
        }
    }
}
