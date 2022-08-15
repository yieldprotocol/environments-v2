// SPDX-License-Identifier: BUSL-1.1
pragma solidity >=0.8.13;

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
    bytes6 public constant WETHID = 0x303000000000;
    IERC20Metadata public constant WETH = IERC20Metadata(0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2);

    IChainlinkMultiOracle public chainlinkMultiOracle;

    struct ChainlinkSource {
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
    /// @param joinAddress address of the join for the asset
    /// @param deployer address of the deployer
    /// @param chainlinkSource address of the chainlink sources
    /// @param auctionLimit auction limit for the asset
    /// @param debtLimits debt limits for the asset
    /// @param seriesIlks seriesIlk data to which the asset is to be added
    function addChainlinkCollateral(
        bytes6 assetId,
        address joinAddress,
        address deployer,
        ChainlinkSource calldata chainlinkSource,
        AuctionLimit calldata auctionLimit,
        DebtLimit[] calldata debtLimits,
        SeriesIlk[] calldata seriesIlks
    ) external auth {
        _orchestrateJoin(joinAddress, deployer);
        _addAsset(assetId, joinAddress);
        _updateChainLinkSource(chainlinkSource.quoteId, chainlinkSource.quote, chainlinkSource.source);
        _makeIlk(joinAddress, auctionLimit, debtLimits);
        _addIlksToSeries(seriesIlks);
    }

    /// @notice Function to update ChainlinkSource for the supplied baseId/quoteId
    /// @param quoteId quoteId
    /// @param quote address of the quote asset
    /// @param source address of the oracle for baseId/quoteId
    function _updateChainLinkSource(
        bytes6 quoteId,
        address quote,
        address source
    ) internal {
        // set sources for chainlink
        chainlinkMultiOracle.setSource(WETHID, WETH, quoteId, IERC20Metadata(quote), source);
    }
}
