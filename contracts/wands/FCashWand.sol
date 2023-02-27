// SPDX-License-Identifier: BUSL-1.1
pragma solidity >=0.8.13;
import './CollateralWandBase.sol';
import '@yield-protocol/vault-v2/src/interfaces/DataTypes.sol';
import '@yield-protocol/vault-v2/src/other/notional/NotionalJoin.sol';

interface INotionalMultiOracle{
    function setSource(
        bytes6 notionalId,
        bytes6 underlyingId,
        IERC20Metadata underlying
    ) external;
}

interface IJoinCustom{
    /// @dev ERC1155 asset managed by this notional join
    function asset() external view returns (address);

    /// @dev underlying asset of this notional join
    function underlying() external view returns (address);

    /// @dev join of the underlying asset 
    function underlyingJoin() external view returns (address);

    /// @dev maturity date for fCash
    function maturity() external view returns (uint40);

    /// @dev otional currency id for the underlying
    function currencyId() external view returns (uint16);
}

interface ICauldronCustom{

    function lendingOracles(bytes6) external view returns (IOracle);

    function spotOracles(bytes6, bytes6) external view returns (DataTypes.SpotOracle memory);

    function debt(bytes6, bytes6) external view returns (DataTypes.Debt memory);
}

struct Ilk {
    uint32 duration;      // Time that auctions take to go to minimal price and stay there.
    uint64 initialOffer;  // Proportion of collateral that is sold at auction start (1e18 = 100%)
}

struct Limits {
    uint96 line;                                                    // Maximum concurrent auctioned collateral
    uint24 dust;                                                    // Minimum collateral that must be left when buying, unless buying all
    uint8 dec;                                                      // Multiplying factor (10**dec) for line and dust
    uint128 sum;                                                    // Current concurrent auctioned collateral
}

interface IWitch{

    function ilks(bytes6) external view returns (Ilk memory);
    
    function limits(bytes6) external view returns (Limits memory);
}

interface INotionalJoinFactory{

    function deploy(bytes6 oldAssetId, bytes6 newAssetId, address newAssetAddress, uint256 salt) external returns (NotionalJoin);
}

/// @dev fCash Wand to accept Notional.finance ERC1155 tokens as collateral.
/// @author @calnix
contract FCashWand is AccessControl, CollateralWandBase {
    INotionalMultiOracle public notionalMultiOracle;
    INotionalJoinFactory public notionalJoinFactory;
    address fCashAddress;

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
        INotionalMultiOracle notionalMultiOracle_,
        INotionalJoinFactory notionalJoinFactory_

    ) CollateralWandBase(cauldron_, ladle_, witch_, cloak_, address(notionalMultiOracle_)) {
        notionalMultiOracle = notionalMultiOracle_;
        notionalJoinFactory = notionalJoinFactory_;
        fCashAddress = 0x1344A36A1B56144C3Bc62E7757377D288fDE0369;  // Contract address of fCash tokens
    }

    /// @notice Function to add fCash as collateral
    /// @param assetId Incoming fCash assetId (e.g. fDAISEP22)
    /// @param joinAddress JoinAddress of new assetId
    /// @param oldAssetId Prior matured fCash assetId (for reference: fDAIJUN22)
    /// @param seriesId New series which takes incoming fCash as ilk
    function addfCashCollateral(bytes6 assetId, address joinAddress, bytes6 oldAssetId, bytes6 seriesId) external auth {
        
        // get join of new Asset
        IJoinCustom join = IJoinCustom(joinAddress);

        _joinOrchestration(assetId, join, oldAssetId, seriesId);
    }

    /// @notice Deploys Notional Joins via NotionalJoinFactory and orchestrates necessary permissions
    /// @param assetId Incoming fCash assetId (e.g. fDAISEP22)
    /// @param oldAssetId Prior matured fCash assetId (for reference: fDAIJUN22)
    /// @param seriesId New series which takes incoming fCash as ilk
    /// @param salt Random number of choice for create2
    function deployCollateral(bytes6 assetId, bytes6 oldAssetId, bytes6 seriesId, uint256 salt) external auth returns (address) {
        
        // deploy NJoins | fCashWand is ROOT for deployed joins
        IJoinCustom join = IJoinCustom(address(notionalJoinFactory.deploy(oldAssetId, assetId, fCashAddress, salt)));

        _joinOrchestration(assetId, join, oldAssetId, seriesId);

        // revoke ROOT from fCashWand after orchestration	
        _revokeRoot(address(join));

        return address(join);
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

    /// @notice Orchestrate the join to grant & revoke the correct permissions	
    /// @param joinAddress Address of the join to be orchestrated	
    function _revokeRoot(address joinAddress) internal {	
        AccessControl join = AccessControl(joinAddress);	
       	
        // revoke ROOT from fCashWand	
        join.renounceRole(ROOT, address(this));	
    }

    /// @notice Orchestrate fCash as collateral
    /// @param assetId Incoming fCash assetId (e.g. fDAISEP22)
    /// @param join Join of new assetId
    /// @param oldAssetId Prior matured fCash assetId (for reference: fDAIJUN22)
    /// @param seriesId New series which takes incoming fCash as ilk
    function _joinOrchestration(bytes6 assetId, IJoinCustom join, bytes6 oldAssetId, bytes6 seriesId) internal {

        address underlying = join.underlying(); 

        // old and new assetIds to have same underlying
        IJoinCustom oldJoin = IJoinCustom(address(ladle.joins(oldAssetId)));
        require(underlying == oldJoin.underlying(), "Mismatched assetId");

        // get series data
        DataTypes.Series memory series = cauldron.series(seriesId);
        // ensure fCash underlying and base of series match
        require(underlying == cauldron.assets(series.baseId), "Mismatched series");      

        // asset is recognized in ecosystem
        _addAsset(assetId, address(join));

        // set pricefeeds: NotionalSource
        _updateNotionalSource(assetId, series.baseId, underlying);

        // get auctionLimits
        Ilk memory ilk = IWitch(address(witch)).ilks(oldAssetId);
        Limits memory limits = IWitch(address(witch)).limits(oldAssetId);
        
        CollateralWandBase.AuctionLimit memory auctionLimits;
        auctionLimits = CollateralWandBase.AuctionLimit({
            ilkId: assetId, // fCash
            duration: ilk.duration,
            initialOffer: ilk.initialOffer, 
            line: limits.line, 
            dust: limits.dust,
            dec: limits.dec
        });
        
        // get debtLimits
        DataTypes.SpotOracle memory spotOracle = ICauldronCustom(address(cauldron)).spotOracles(series.baseId, oldAssetId);  
        DataTypes.Debt memory debt = ICauldronCustom(address(cauldron)).debt(series.baseId, oldAssetId);   
    
        CollateralWandBase.DebtLimit[] memory debtLimits = new CollateralWandBase.DebtLimit[](1);
        debtLimits[0] = CollateralWandBase.DebtLimit({
            baseId: series.baseId,  // DAI
            ilkId: assetId, // fCashIOracle oracle, uint32 ratio
            ratio: spotOracle.ratio,
            line: debt.max, 
            dust: debt.min, 
            dec: debt.dec
        });

        _makeIlk(address(join), auctionLimits, debtLimits);
        

        // assign ilk to series
        CollateralWandBase.SeriesIlk[] memory seriesIlks = new CollateralWandBase.SeriesIlk[](1);
        bytes6[] memory ilkId = new bytes6[](1);
        ilkId[0] = assetId;

        seriesIlks[0] = CollateralWandBase.SeriesIlk({series: seriesId, ilkIds: ilkId});

        // commented out since addIlksToSeries needs to be updated to take params from memory not calldata
        _addIlksToSeries(seriesIlks);

    }


}
