// SPDX-License-Identifier: BUSL-1.1
pragma solidity >=0.8.13;

import '@yield-protocol/vault-v2/src/interfaces/ICauldronGov.sol';
import '@yield-protocol/vault-v2/src/interfaces/IOracle.sol';
import '@yield-protocol/vault-v2/src/interfaces/ILadleGov.sol';
import '@yield-protocol/vault-v2/src/interfaces/IJoin.sol';
import '@yield-protocol/utils-v2/src/access/AccessControl.sol';
import '@yield-protocol/utils-v2/src/token/IERC20Metadata.sol';
import {IEmergencyBrake} from '@yield-protocol/utils-v2/src/utils/EmergencyBrake.sol';

interface IWitchCustom {
    //// @dev Function to set the auction limit on the witch
    /// @param ilkId Id of the ilk
    /// @param duration the auction duration to calculate liquidation prices
    /// @param initialOffer the proportion of the collateral that will be sold at auction start
    /// @param line the maximum collateral that can be auctioned at the same time
    /// @param dust the minimum collateral that must be left when buying, unless buying all
    /// @param dec The decimals for maximum and minimum
    function setIlk(
        bytes6 ilkId,
        uint32 duration,
        uint64 initialOffer,
        uint96 line,
        uint24 dust,
        uint8 dec
    ) external;
}

/// @dev Base wand on top of which additional wands could be built
/// @author @iamsahu
contract CollateralWandBase is AccessControl {
    bytes4 public constant JOIN = IJoin.join.selector;
    bytes4 public constant EXIT = IJoin.exit.selector;

    ICauldronGov public cauldron;
    ILadleGov public ladle;
    IEmergencyBrake public cloak;
    IWitchCustom public witch;
    address public oracle;

    struct AuctionLimit {
        bytes6 ilkId;
        uint32 duration;
        uint64 initialOffer;
        uint96 line;
        uint24 dust;
        uint8 dec;
    }

    struct DebtLimit {
        bytes6 baseId;
        bytes6 ilkId;
        uint32 ratio;
        uint96 line;
        uint24 dust;
        uint8 dec;
    }

    struct SeriesIlk {
        bytes6 series;
        bytes6[] ilkIds;
    }

    constructor(
        ICauldronGov cauldron_,
        ILadleGov ladle_,
        IWitchCustom witch_,
        IEmergencyBrake cloak_,
        address oracle_
    ) {
        cauldron = cauldron_;
        ladle = ladle_;
        witch = witch_;
        cloak = cloak_;
        oracle = oracle_;
    }

    /// @notice Orchestrate the join to grant & revoke the correct permissions
    /// @param joinAddress address of the join to be orchestrated
    /// @param deployer address of the deployer
    function _orchestrateJoin(address joinAddress, address deployer) internal {
        AccessControl join = AccessControl(joinAddress);

        // revoke role of deployer
        join.revokeRole(ROOT, deployer);
        // grant ROOT to cloak
        join.grantRole(ROOT, address(cloak));
    }

    /// @notice Function to add asset to the cauldron & join to the ladle
    /// @param assetId Id for the asset being added
    /// @param joinAddress Address of the join for the asset
    function _addAsset(bytes6 assetId, address joinAddress) internal {
        // add asset to cauldron
        cauldron.addAsset(assetId, IJoin(joinAddress).asset());
        // Allow Ladle to join and exit on the asset Join
        bytes4[] memory sigs = new bytes4[](2);
        sigs[0] = JOIN;
        sigs[1] = EXIT;
        AccessControl(joinAddress).grantRoles(sigs, address(ladle));
        // Register the Join in the Ladle
        ladle.addJoin(assetId, joinAddress);

        // cloak plan
        // IEmergencyBrake.Permission[] memory permissions = new IEmergencyBrake.Permission[](1);
        // permissions[0] = IEmergencyBrake.Permission(joinAddress, sigs);
        // cloak.plan(address(ladle), permissions);
    }

    /// @notice Makes the asset into an ilk by setting up auction & debt limits
    /// @param joinAddress address of the join of the ilk
    /// @param auctionLimit auction limit for the ilk
    /// @param debtLimits debt limits for the ilks against bases
    function _makeIlk(
        address joinAddress,
        AuctionLimit memory auctionLimit,
        DebtLimit[] memory debtLimits
    ) internal {
        // Configure auction limit for the ilk on the witch
        _updateAuctionLimit(
            auctionLimit.ilkId,
            auctionLimit.duration,
            auctionLimit.initialOffer,
            auctionLimit.line,
            auctionLimit.dust,
            auctionLimit.dec
        );

        // Allow Witch to exit ilk
        AccessControl join = AccessControl(joinAddress);
        join.grantRole(EXIT, address(witch));
        // Log a plan to undo the orchestration above in emergencies
        bytes4[] memory sigs = new bytes4[](1);
        sigs[0] = EXIT;

        // IEmergencyBrake.Permission[] memory permissions = new IEmergencyBrake.Permission[](1);
        // permissions[0] = IEmergencyBrake.Permission(joinAddress, sigs);
        // cloak.plan(address(witch), permissions);

        DebtLimit memory debtLimit;
        for (uint256 index = 0; index < debtLimits.length; index++) {
            debtLimit = debtLimits[index];
            _updateDebtLimit(
                debtLimit.baseId,
                debtLimit.ilkId,
                debtLimit.ratio,
                debtLimit.line,
                debtLimit.dust,
                debtLimit.dec
            );
        }
    }

    /// @dev Function to set the auction limit on the witch
    /// @param ilkId Id of the ilk
    /// @param duration the auction duration to calculate liquidation prices
    /// @param initialOffer the proportion of the collateral that will be sold at auction start
    /// @param line the maximum collateral that can be auctioned at the same time
    /// @param dust the minimum collateral that must be left when buying, unless buying all
    /// @param dec The decimals for maximum and minimum
    function _updateAuctionLimit(
        bytes6 ilkId,
        uint32 duration,
        uint64 initialOffer,
        uint96 line,
        uint24 dust,
        uint8 dec
    ) internal {
        witch.setIlk(ilkId, duration, initialOffer, line, dust, dec);
    }

    /// @dev Set the maximum and minimum debt for an underlying and ilk pair. Can be reset.
    /// @param baseId asset identifier (bytes6 tag)
    /// @param ilkId asset identifier (bytes6 tag)
    /// @param ratio ratio as a fixed point number with 6 decimals
    /// @param line ceiling, modified by decimals
    /// @param dust vault debt, modified by decimals
    /// @param dec to append to debt ceiling and minimum vault debt.
    function _updateDebtLimit(
        bytes6 baseId,
        bytes6 ilkId,
        uint32 ratio,
        uint96 line,
        uint24 dust,
        uint8 dec
    ) internal {
        cauldron.setSpotOracle(baseId, ilkId, IOracle(oracle), ratio);
        cauldron.setDebtLimits(baseId, ilkId, line, dust, dec);
    }

    /// @notice Ilks to accept for series
    /// @param seriesIlks series & ilks to be added
    function _addIlksToSeries(SeriesIlk[] memory seriesIlks) internal {
        SeriesIlk memory seriesIlk;
        // Add ilks to the series
        for (uint256 index = 0; index < seriesIlks.length; index++) {
            seriesIlk = seriesIlks[index];
            cauldron.addIlks(seriesIlk.series, seriesIlk.ilkIds);
        }
    }
}
