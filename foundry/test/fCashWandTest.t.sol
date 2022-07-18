// SPDX-License-Identifier: BUSL-1.1
pragma solidity 0.8.14;

import "forge-std/src/Test.sol";
import "forge-std/src/console2.sol";
import {Mocks} from "@yield-protocol/vault-v2/contracts/test/utils/Mocks.sol";

import {FCashWand, IWitchCustom, INotionalMultiOracle} from "../src/fCashWand.sol";
import {NotionalJoin} from "../src/NotionalJoin.sol";
import {NotionalJoinFactory} from "../src/NotionalJoinFactory.sol";
import {NotionalMultiOracle} from "@yield-protocol/vault-v2/contracts/other/notional/NotionalMultiOracle.sol";
import {FCashMock} from "@yield-protocol/vault-v2/contracts/other/notional/FCashMock.sol";

import {Join} from "@yield-protocol/vault-v2/contracts/Join.sol";
import {DAIMock} from "@yield-protocol/vault-v2/contracts/mocks/DAIMock.sol";
import {ERC20Mock} from "@yield-protocol/vault-v2/contracts/mocks/ERC20Mock.sol";
import {WETH9Mock} from "@yield-protocol/vault-v2/contracts/mocks/WETH9Mock.sol";

import {Cauldron} from "@yield-protocol/vault-v2/contracts/Cauldron.sol";
import {Ladle} from "@yield-protocol/vault-v2/contracts/Ladle.sol";
import {Witch} from "@yield-protocol/vault-v2/contracts/Witch.sol";
import {Timelock} from "@yield-protocol/utils-v2/contracts/utils/Timelock.sol";
import {AccessControl} from "@yield-protocol/utils-v2/contracts/access/AccessControl.sol";
import {IEmergencyBrake, EmergencyBrake} from "@yield-protocol/utils-v2/contracts/utils/EmergencyBrake.sol";

import "@yield-protocol/vault-interfaces/src/ICauldron.sol";
import '@yield-protocol/vault-interfaces/src/ICauldronGov.sol';
import "@yield-protocol/vault-interfaces/src/IOracle.sol";
import "@yield-protocol/vault-interfaces/src/ILadle.sol";
import '@yield-protocol/vault-interfaces/src/ILadleGov.sol';
import "@yield-protocol/utils-v2/contracts/interfaces/IWETH9.sol";
import '@yield-protocol/utils-v2/contracts/token/IERC20Metadata.sol';

import {IFYToken} from '@yield-protocol/vault-interfaces/src/IFYToken.sol';
import {FYToken} from "@yield-protocol/vault-v2/contracts/FYToken.sol";
import {IJoin} from "@yield-protocol/vault-interfaces/src/IJoin.sol";

import {OracleMock} from "@yield-protocol/vault-v2/contracts/mocks/oracles/OracleMock.sol";

using stdStorage for StdStorage;

interface IFCashWandCustom {
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
    
    struct NotionalSource {
        bytes6 notionalId;
        bytes6 underlyingId;
        address underlying;
    }

    struct SeriesIlk {
        bytes6 series;
        bytes6[] ilkIds;
    }
}


abstract contract StateAddCollateral is Test, IFCashWandCustom {
    using Mocks for *;
    
    FCashWand public fcashwand;

    NotionalMultiOracle public notionalMultiOracle;
    NotionalJoinFactory public njoinfactory;
    FCashMock public fcash;
    address njoin; 

    DAIMock public dai;
    Join public daiJoin; 
    WETH9Mock public weth;

    Cauldron public cauldron;
    Ladle public ladle;
    Witch public witch;
    EmergencyBrake public cloak;
    Timelock public timelock;

    FYToken public fytoken;
    OracleMock public lendingOracleMock;

    address deployer;
    address user;

    uint256 fCashId = 1;

    //... Wand Params...
    bytes6 assetId = bytes6('01');              // Notional fCash: fDAI | notionalId, ilkId 
    bytes6 baseId = bytes6('03');              // base asset: DAI
    bytes6 seriesId = bytes6('05');            // arbitrary seriesId

    function setUp() public virtual {

        user = address(1);
        vm.label(user, "user");

        deployer = 0xb4c79daB8f259C7Aee6E5b2Aa729821864227e84;
        vm.label(deployer, "deployer");

        vm.startPrank(deployer);

        //... Assets ...
        dai = new DAIMock();
        vm.label(address(dai), "dai token");
        
        weth = new WETH9Mock();
        vm.label(address(weth), "weth token");      // for ladle deployment
        
        fcash = new FCashMock(ERC20Mock(address(dai)), fCashId);   // underlying = dai, fCashId = 1;
        vm.label(address(fcash), "fDAI token");
        
        // ... Oracles ...
        // oracle: FYDAI <-> DAi
        lendingOracleMock = new OracleMock();
        vm.label(address(lendingOracleMock), "lendingOracleMock");
        lendingOracleMock.set(1e18);    

        notionalMultiOracle = new NotionalMultiOracle();
        vm.label(address(notionalMultiOracle), "notionalMultiOracle");

        //... Yield Contracts ...        
        daiJoin = new Join(address(dai));
        vm.label(address(daiJoin), "DAI Join");
        
        // fyToken: FYDAI 
        uint256 three_months = block.timestamp + 7776000;           // now + 90 days in seconds
        fytoken = new FYToken(baseId, IOracle(address(lendingOracleMock)), IJoin(address(daiJoin)), three_months, "FYDAI", "FYDAI");

        cauldron = new Cauldron();
        vm.label(address(cauldron), "Cauldron");
        
        ladle = new Ladle(ICauldron(address(cauldron)), IWETH9(address(weth)));
        vm.label(address(ladle), "Ladle");

        witch = new Witch(ICauldron(address(cauldron)), ILadle(address(ladle)));
        vm.label(address(witch), "Witch");

        cloak = new EmergencyBrake(deployer, deployer);
        vm.label(address(cloak), "Cloak");

        timelock = new Timelock(deployer, deployer);
        vm.label(address(timelock), "Timelock");

        fcashwand = new FCashWand(ICauldronGov(address(cauldron)), ILadleGov(address(ladle)), IWitchCustom(address(witch)), IEmergencyBrake(address(cloak)), INotionalMultiOracle(address(notionalMultiOracle)));
        vm.label(address(fcashwand), "FCash Wand");

        njoinfactory = new NotionalJoinFactory(address(cloak), address(timelock));
        vm.label(address(njoinfactory), "Njoin Factory");

        vm.stopPrank();
        
        // ... Deploy NJoin ...
        // Factory permissions
        vm.prank(address(timelock));
        njoinfactory.grantRole(NotionalJoinFactory.deploy.selector, deployer);
        
        // njoin params: fDAI
        address asset = address(fcash);
        address underlying = address(dai); 
        address underlyingJoin = address(daiJoin); 
        uint40 maturity = 1662048000;   // 2022-09-02 00:00:00
        uint16 currencyId = 1;         
        uint256 salt = 1234;
        
        vm.prank(deployer);
        njoin = njoinfactory.deploy(asset, underlying, underlyingJoin, maturity, currencyId, salt);
        vm.label(njoin, "njoin contract");

        //... Wand permissions ...
        vm.startPrank(deployer);
        fcashwand.grantRole(FCashWand.addfCashCollateral.selector, deployer);
        
        // _addAsset
        cauldron.grantRole(Cauldron.addAsset.selector, address(fcashwand));
        ladle.grantRole(Ladle.addJoin.selector, address(fcashwand));
        cloak.grantRole(EmergencyBrake.plan.selector, address(fcashwand));

        // _updateNotionalSource
        notionalMultiOracle.grantRole(NotionalMultiOracle.setSource.selector, address(fcashwand));

        // _makeIlk: _updateAuctionLimit
        witch.grantRole(Witch.setIlk.selector, address(fcashwand));
        // _makeIlk: _updateDebtLimit
        cauldron.grantRole(Cauldron.setSpotOracle.selector, address(fcashwand));
        cauldron.grantRole(Cauldron.setDebtLimits.selector, address(fcashwand));
        
        // _addIlksToSeries
        cauldron.grantRole(Cauldron.addIlks.selector, address(fcashwand));
        
        // ... MISC....
        // setLendingOracle
        cauldron.grantRole(Cauldron.setLendingOracle.selector, deployer);

        // addAsset + Series
        cauldron.grantRole(Cauldron.addAsset.selector, deployer);
        cauldron.grantRole(Cauldron.addSeries.selector, deployer);

        vm.stopPrank();
        
        // 
        vm.startPrank(address(cloak));
        NotionalJoin(njoin).grantRole(bytes4(0x00000000), address(fcashwand));
        vm.stopPrank();

        // ... Instantiate Yield assets, oracles, series ...
        vm.startPrank(deployer);

        // pre-populate base asset to cauldron 
        cauldron.addAsset(baseId, address(dai));
        // register lending oracle (FYUSDC <-> USDC)
        cauldron.setLendingOracle(baseId, IOracle(lendingOracleMock));
        // create series | seriesID, bytes6 baseId, IFYToken fyToken)
        cauldron.addSeries(seriesId, baseId, IFYToken(address(fytoken)));
        vm.stopPrank();

    }
}

contract StateAddCollateralTest is StateAddCollateral {
    using Mocks for *;

    function testFCashWand() public {
        console2.log("fcashwand.addfCashCollateral()");

        FCashWand.NotionalSource[] memory notionalSource = new FCashWand.NotionalSource[](1);
        notionalSource[0] = FCashWand.NotionalSource({notionalId: assetId, underlyingId: baseId, underlying: address(dai)});

        FCashWand.AuctionLimit[] memory auctionLimits = new FCashWand.AuctionLimit[](1);
        auctionLimits[0] = FCashWand.AuctionLimit({
            ilkId: assetId,                 // fCash   
            duration: 3600,               
            initialOffer: 0.5e18,           // initialOffer <= 1e18, "InitialOffer above 100%"
            line: 1000000,                  //  maximum collateral that can be auctioned at the same time
            dust: 5000,                     //  minimum collateral that must be left when buying, unless buying all | uint24
            dec: 18                            
        });

        FCashWand.DebtLimit[] memory debtLimits = new FCashWand.DebtLimit[](1);
        debtLimits[0] = FCashWand.DebtLimit ({
            baseId: baseId,                     // USDC
            ilkId: assetId,                     // fCash
            ratio: 1000000,                     // With 6 decimals. 1000000 == 100%
            line: 10000000,                     // maximum debt for an underlying and ilk pair  | uint96
            dust: 0,                            // minimum debt for an underlying and ilk pair  | uint24
            dec: 18                             // decimals: Multiplying factor (10**dec) for line and dust | uint8             
        });

        FCashWand.SeriesIlk[] memory seriesIlks = new FCashWand.SeriesIlk[](1);

        bytes6[] memory ilkId = new bytes6[](1);
        ilkId[0] = assetId;
        seriesIlks[0] = FCashWand.SeriesIlk ({series: seriesId, ilkIds: ilkId});

        vm.prank(deployer);
        fcashwand.addfCashCollateral(assetId, address(fcash), njoin, notionalSource, auctionLimits, debtLimits, seriesIlks);
        
        // cauldron: ilk check
        assertTrue(cauldron.ilks(seriesId, assetId) == true);

    }
}


abstract contract StateBorrowOnNewCollateral is StateAddCollateral {

    function setUp() public override virtual {
        super.setUp();

        FCashWand.NotionalSource[] memory notionalSource = new FCashWand.NotionalSource[](1);
        notionalSource[0] = FCashWand.NotionalSource({notionalId: assetId, underlyingId: baseId, underlying: address(dai)});
  
        FCashWand.AuctionLimit[] memory auctionLimits = new FCashWand.AuctionLimit[](1);
        auctionLimits[0] = FCashWand.AuctionLimit({
            ilkId: assetId,                 // fCash   
            duration: 3600,               
            initialOffer: 0.5e18,           // initialOffer <= 1e18, "InitialOffer above 100%"
            line: 1000000,                  //  maximum collateral that can be auctioned at the same time
            dust: 5000,                     //  minimum collateral that must be left when buying, unless buying all | uint24
            dec: 18                            
        });

        FCashWand.DebtLimit[] memory debtLimits = new FCashWand.DebtLimit[](1);
        debtLimits[0] = FCashWand.DebtLimit ({
            baseId: baseId,                     // USDC
            ilkId: assetId,                     // fCash
            ratio: 1000000,                     // With 6 decimals. 1000000 == 100%
            line: 10000000,                     // maximum debt for an underlying and ilk pair  | uint96
            dust: 0,                            // minimum debt for an underlying and ilk pair  | uint24
            dec: 18                             // decimals: Multiplying factor (10**dec) for line and dust | uint8             
        });

        FCashWand.SeriesIlk[] memory seriesIlks = new FCashWand.SeriesIlk[](1);

        bytes6[] memory ilkId = new bytes6[](1);
        ilkId[0] = assetId;
        seriesIlks[0] = FCashWand.SeriesIlk ({series: seriesId, ilkIds: ilkId});

        vm.prank(deployer);
        fcashwand.addfCashCollateral(assetId, address(fcash), njoin, notionalSource, auctionLimits, debtLimits, seriesIlks);
        
        // ... Permissions ...
        vm.startPrank(deployer);

        // build: ladle.build calls cauldron.build
        cauldron.grantRole(Cauldron.build.selector, address(ladle));     
        // ladle.pour calls cauldron.pour
        cauldron.grantRole(Cauldron.pour.selector, address(ladle));     
        
        // Ladle._pour() calls FYToken.mint() & .burn() 
        fytoken.grantRole(FYToken.mint.selector, address(ladle));
        fytoken.grantRole(FYToken.burn.selector, address(ladle));

        vm.stopPrank();   
    }
}

contract StateBorrowOnNewCollateralTest is StateBorrowOnNewCollateral {

    function testBorrow() public {
        console2.log("Borrow USDC with fCash(fDAI) as collateral");
        vm.startPrank(user);    

        // Build vault
        (bytes12 vaultId, DataTypes.Vault memory vault) = ladle.build(seriesId, assetId, 0);
        IJoin collateralJoin = ladle.joins(assetId);     //njoin

        // User: Mint & Post collateral 
        uint40 maturity = 1662048000;   // 2022-09-02 00:00:00
        uint16 currencyId = 1;   
        uint256 id = uint256(
            (bytes32(uint256(currencyId)) << 48) |
            (bytes32(uint256(maturity)) << 8) |
            bytes32(uint256(1))
        );
    
        fcash.mint(user, id, 10e18, bytes('1'));                                            // arbitrary data passed
        fcash.safeTransferFrom(user, address(collateralJoin), id, 5e18, bytes('1'));        // arbitrary data passed

        // Borrow
        int128 ink = 5e18; int128 art = 1e18;   
        ladle.pour(vaultId, user, ink, art);
        
        // assert Borrow 
        assertTrue(fcash.balanceOf(user, id) == 5e18);
        assertTrue(fytoken.balanceOf(user) == 1e18);

        // Repay fyDAI and Withdraw collateral
        fytoken.transfer(address(fytoken), 1e18);
        ladle.pour(vaultId, user, -1 * ink, -1 * art);
        vm.stopPrank();

        // assert Repay & Withdraw 
        assertTrue(fytoken.balanceOf(user) == 0);
        assertTrue(fcash.balanceOf(user, id) == 10e18);

    }
}