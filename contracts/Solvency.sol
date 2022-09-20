// SPDX-License-Identifier: BUSL-1.1
pragma solidity >=0.8.15;
import "@yield-protocol/vault-v2/contracts/interfaces/DataTypes.sol";
import "@yield-protocol/vault-v2/contracts/interfaces/IFYToken.sol";
import "@yield-protocol/utils-v2/contracts/access/AccessControl.sol";
import "@yield-protocol/utils-v2/contracts/cast/CastU256I256.sol";
import "./RegistryInterfaces.sol";

interface ISolvency {
    function authorize(address grantee) external;
    function addAssetId(bytes6 assetId) external;
    function addAssetIds(bytes6[] calldata assetIds) external;
    function removeAssetId() external;
    function addSeriesId(bytes6 seriesId) external;
    function addSeriesIds(bytes6[] calldata seriesIds) external;
    function removeSeriesId() external;
}

/// @dev This contract checks the solvency of the Yield Protocol by comparing the
/// aggregated ETH value of fyToken in circulation against the aggregated ETH value
/// of all assets in the Joins
contract Solvency is AccessControl {
    using CastU256I256 for uint256;

    bytes6 ETH = 0x303000000000;

    event AssetIdAdded(bytes6 indexed assetId);
    event AssetIdRemoved(bytes6 indexed assetId);
    event SeriesIdAdded(bytes6 indexed seriesId);
    event SeriesIdRemoved(bytes6 indexed seriesId);

    bytes6[] public assetIds;
    bytes6[] public seriesIds;

    ISeriesRegistry immutable public series;
    IOracleRegistry immutable public oracles;
    IJoinRegistry immutable public joins;

    constructor(ISeriesRegistry series_, IOracleRegistry oracles_, IJoinRegistry joins_) {
        series = series_;
        oracles = oracles_;
        joins = joins_;
        authorize(msg.sender);
    }

    /// @dev Give permission to an address to use this contract
    function authorize(address grantee) public auth {
        _grantRole(this.authorize.selector, grantee);
        _grantRole(this.addAssetId.selector, grantee);
        _grantRole(this.addAssetIds.selector, grantee);
        _grantRole(this.removeAssetId.selector, grantee);
        _grantRole(this.addSeriesId.selector, grantee);
        _grantRole(this.addSeriesIds.selector, grantee);
        _grantRole(this.removeSeriesId.selector, grantee);
    }

    function addAssetId(bytes6 assetId) public auth {
        _addAssetId(assetId);
    }

    function addAssetIds(bytes6[] calldata assetIds_) public auth {
        for (uint256 i = 0; i < assetIds_.length; ++i) {
            _addAssetId(assetIds_[i]);
        }
    }

    function _addAssetId(bytes6 assetId) internal {
        require(joins.joins(assetId) != IJoin(address(0)), "Join not found");
        assetIds.push(assetId);
        emit AssetIdAdded(assetId);
    }

    function removeAssetId() public auth {
        bytes6 assetId = assetIds[assetIds.length - 1];
        assetIds.pop();
        emit AssetIdRemoved(assetId);
    }

    function addSeriesId(bytes6 seriesId) public auth {
        _addSeriesId(seriesId);
    }

    function addSeriesIds(bytes6[] calldata seriesIds_) public auth {
        for (uint256 i = 0; i < seriesIds_.length; ++i) {
            _addSeriesId(seriesIds_[i]);
        }
    }

    function _addSeriesId(bytes6 seriesId) internal {
        require(series.series(seriesId).fyToken != IFYToken(address(0)), "Series not found");
        seriesIds.push(seriesId);
        emit SeriesIdAdded(seriesId);
    }

    function removeSeriesId() public auth {
        bytes6 seriesId = seriesIds[seriesIds.length - 1];
        seriesIds.pop();
        emit SeriesIdRemoved(seriesId);
    }

    /// @dev Returns the the aggregated ETH value of all assets in the Joins minus
    /// the aggregated ETH value of all fyToken in circulation
    function delta() public view returns (int256 result) {
        result = available().i256() - redeemable().i256();
    }

    /// @dev Returns the the aggregated ETH value of all assets in the Joins divided
    /// by the aggregated ETH value of all fyToken in circulation, with 6 decimals
    function ratio() public view returns (int256 result) {
        result = (available().i256() * 1e6) / redeemable().i256();
    }

    /// @dev Returns the the aggregated ETH value of all fyToken in circulation
    function redeemable() public view returns(uint256 aggregated) {
        for (uint256 s; s < seriesIds.length; ++s) {
            DataTypes.Series memory series_ = series.series(seriesIds[s]);
            bytes6 baseId = series_.baseId;
            IFYToken fyToken = series_.fyToken;
            IOracle oracle = oracles.spotOracles(baseId, ETH).oracle;
            (uint256 seriesRedeemable,) = oracle.peek(baseId, ETH, fyToken.totalSupply());
            aggregated += seriesRedeemable;
        }
    }

    /// @dev Returns the the aggregated ETH value of all assets in the Joins
    function available() public view returns(uint256 aggregated) {
        for (uint256 a; a < assetIds.length; a++) {
            bytes6 assetId = assetIds[a];
            IJoin join = joins.joins(assetId);
            IOracle oracle = oracles.spotOracles(assetId, ETH).oracle;
            (uint256 joinAvailable,) = oracle.peek(assetId, ETH, join.storedBalance());
            aggregated += joinAvailable;
        }
    }
}
