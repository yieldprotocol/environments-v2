// SPDX-License-Identifier: BUSL-1.1
pragma solidity 0.8.14;
import '@yield-protocol/environments-v2/contracts/wands/CollateralWandBase.sol';

interface INotionalMultiOracle {
    function setSource(
        bytes6 notionalId,
        bytes6 underlyingId,
        IERC20Metadata underlying
    ) external;
}

/// @dev fCash Wand to accept Notional.finance ERC1155 tokens as collateral.
/// @author @calnix
contract FCashWand is AccessControl, CollateralWandBase {
    INotionalMultiOracle public notionalMultiOracle;

    struct NotionalSource {
        bytes6 notionalId;
        bytes6 underlyingId;
        address underlying;
    }

    constructor(
        ICauldronGov cauldron_,
        ILadleGov ladle_,
        IWitchCustom witch_,
        IEmergencyBrake cloak_,
        INotionalMultiOracle notionalMultiOracle_
    ) CollateralWandBase(cauldron_, ladle_, witch_, cloak_, address(notionalMultiOracle_)) {
        notionalMultiOracle = notionalMultiOracle_;
    }

    /// @notice Function to add fCash as collateral
    /// @param assetId assetId of the collateral being added
    /// @param joinAddress address of the join for the asset
    /// @param notionalSource struct containing pricefeed details
    /// @param auctionLimits auction limits for the asset
    /// @param debtLimits debt limits for the asset
    /// @param seriesIlks seriesIlk data to which the asset is to be added
    function addfCashCollateral(
        bytes6 assetId,
        address joinAddress,
        NotionalSource calldata notionalSource,
        AuctionLimit calldata auctionLimits,
        DebtLimit[] calldata debtLimits,
        SeriesIlk[] calldata seriesIlks
    ) external auth {
        // asset is recognized in ecosystem
        _addAsset(assetId, joinAddress);

        _updateNotionalSource(notionalSource.notionalId, notionalSource.underlyingId, notionalSource.underlying);

        // define risk/collateral attributes
        _makeIlk(joinAddress, auctionLimits, debtLimits);

        // assign series
        _addIlksToSeries(seriesIlks);
    }

    /// @notice Function to update NotionalSource for the supplied notionalId/underlyingId
    /// @param notionalId Notional asset id (e.g. fDai2209)
    /// @param underlyingId Corresponding underlying id (e.g. Dai)
    /// @param underlying Address of the underlying asset
    function _updateNotionalSource(
        bytes6 notionalId,
        bytes6 underlyingId,
        address underlying
    ) internal {
        // set sources for notional
        notionalMultiOracle.setSource(notionalId, underlyingId, IERC20Metadata(underlying));
    }
}
