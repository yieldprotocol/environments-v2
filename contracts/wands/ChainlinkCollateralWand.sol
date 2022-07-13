// SPDX-License-Identifier: BUSL-1.1
pragma solidity 0.8.14;

import './CollateralWandBase.sol';

interface IChainlinkMultiOracle {
    function setSource(
        bytes6 baseId,
        IERC20Metadata base,
        bytes6 quoteId,
        IERC20Metadata quote,
        address source
    ) external;
}

/// @dev A wand to add new chainlink based collateral.
/// @author @iamsahu
contract ChainlinkCollateralWand is AccessControl, CollateralWandBase {
    IChainlinkMultiOracle public chainlinkMultiOracle;

    struct ChainlinkSource {
        bytes6 baseId;
        address base;
        bytes6 quoteId;
        address quote;
        address source;
    }

    constructor(
        ICauldronGov cauldron_,
        ILadleGov ladle_,
        IWitchCustom witch_,
        IEmergencyBrake cloak_,
        IChainlinkMultiOracle chainlinkMultiOracle_
    ) CollateralWandBase(cauldron_, ladle_, witch_, cloak_, address(chainlinkMultiOracle_)) {
        chainlinkMultiOracle = chainlinkMultiOracle_;
    }

    /// @notice Function to add a chainlink collateral
    /// @param assetId assetId of the collateral being added
    /// @param assetAddress address of the collateral
    /// @param joinAddress address of the join for the asset
    /// @param deployer address of the deployer
    /// @param chainlinkSources address of the chainlink sources
    /// @param auctionLimits auction limits for the asset
    /// @param debtLimits debt limits for the asset
    /// @param seriesIlks seriesIlk data to which the asset is to be added
    function addChainlinkCollateral(
        bytes6 assetId,
        address assetAddress,
        address joinAddress,
        address deployer,
        ChainlinkSource[] calldata chainlinkSources,
        AuctionLimit[] calldata auctionLimits,
        DebtLimit[] calldata debtLimits,
        SeriesIlk[] calldata seriesIlks
    ) external auth {
        _orchestrateJoin(joinAddress, deployer);
        _addAsset(assetId, assetAddress, joinAddress);
        for (uint256 index = 0; index < chainlinkSources.length; index++) {
            ChainlinkSource memory chainlinksource = chainlinkSources[index];
            _updateChainLinkSource(
                chainlinksource.baseId,
                chainlinksource.base,
                chainlinksource.quoteId,
                chainlinksource.quote,
                chainlinksource.source
            );
        }

        _makeIlk(joinAddress, auctionLimits, debtLimits);

        _addIlksToSeries(seriesIlks);
    }

    /// @notice Function to update ChainlinkSource for the supplied baseId/quoteId
    /// @param baseId baseId
    /// @param base address of the base asset
    /// @param quoteId quoteId
    /// @param quote address of the quote asset
    /// @param source address of the oracle for baseId/quoteId
    function _updateChainLinkSource(
        bytes6 baseId,
        address base,
        bytes6 quoteId,
        address quote,
        address source
    ) internal {
        // set sources for chainlink
        chainlinkMultiOracle.setSource(baseId, IERC20Metadata(base), quoteId, IERC20Metadata(quote), source);
    }
}
