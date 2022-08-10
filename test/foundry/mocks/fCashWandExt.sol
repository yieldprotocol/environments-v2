// SPDX-License-Identifier: BUSL-1.1
pragma solidity >=0.8.13;

import "contracts/wands/fCashWand.sol";

/// @dev fCash Wand to accept Notional.finance ERC1155 tokens as collateral.
/// @author @calnix
contract FCashWandExt is FCashWand {

    constructor(
        ICauldronGov cauldron_,
        ILadleGov ladle_,
        IWitchCustom witch_,
        IEmergencyBrake cloak_,
        INotionalMultiOracle notionalMultiOracle_
    ) FCashWand(cauldron_, ladle_, witch_, cloak_, notionalMultiOracle_) {}

    // ... FOR TESTING ...
    function addfCashCollateralOld(
        bytes6 assetId,
        address joinAddress,
        NotionalSource calldata notionalSource,
        AuctionLimit calldata auctionLimits,
        DebtLimit[] calldata debtLimits,
        SeriesIlk[] calldata seriesIlks
    ) external {
        // asset is recognized in ecosystem
        _addAsset(assetId, joinAddress);

        _updateNotionalSource(notionalSource.notionalId, notionalSource.underlyingId, notionalSource.underlying);

        // define risk/collateral attributes
        _makeIlk(joinAddress, auctionLimits, debtLimits);

        // assign series
        _addIlksToSeries(seriesIlks);
    }

}
