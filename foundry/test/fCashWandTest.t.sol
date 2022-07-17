// SPDX-License-Identifier: BUSL-1.1
pragma solidity 0.8.14;

import "forge-std/src/Test.sol";
import "forge-std/src/console2.sol";
import {Mocks} from "@yield-protocol/vault-v2/contracts/test/utils/Mocks.sol";

import {FCashWand, IWitchCustom, IChainlinkMultiOracle} from "../src/fCashWand.sol";
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
import {ChainlinkMultiOracle} from "@yield-protocol/vault-v2/contracts/oracles/chainlink/ChainlinkMultiOracle.sol";

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


abstract contract StateDeployWand is Test, IFCashWandCustom {
    using Mocks for *;
    
    FCashWand public fcashwand;

    NotionalMultiOracle public notionalMultiOracle;
    NotionalJoinFactory public njoinfactory;
    FCashMock public fcash;
    address njoin; 

    Join public daiJoin; 
    DAIMock public dai;
    Join public wethJoin;
    WETH9Mock public weth;

    Cauldron public cauldron;
    Ladle public ladle;
    Witch public witch;
    EmergencyBrake public cloak;
    Timelock public timelock;

    FYToken public fytoken;
    OracleMock public lendingOracleMock;
    OracleMock public spotOracleMock;
    ChainlinkMultiOracle public chainlinkMultiOracle;

    address deployer;
    address stateDeployWandTest;

    //... Wand Params...
    bytes6 assetId = bytes6('01');              // Notional fCash (fDAI): notionalId, ilkId 
    bytes6 n_underlyingId = bytes6('02');       // underlying asset of fCash: DAI
    
    bytes6 baseId = bytes6('03');              // base asset: baseID
    bytes6 underlyingId = bytes6('04');        // yield's interest-bearing eth: FYETH2209
    bytes6 seriesId = bytes6('05');            //arbitrary: e.g. FYDAI2009

    function setUp() public virtual {

        deployer = 0xb4c79daB8f259C7Aee6E5b2Aa729821864227e84;
        vm.label(deployer, "deployer");

        stateDeployWandTest = 0x62d69f6867A0A084C6d313943dC22023Bc263691;
        vm.label(stateDeployWandTest, "stateDeployWandTest");

        //... Assets ...
        dai = new DAIMock();
        vm.label(address(dai), "dai token");

        weth = new WETH9Mock();
        vm.label(address(weth), "weth token");
        
        fcash = new FCashMock(ERC20Mock(address(dai)), 4);   // uint256 fCashId = 4;
        vm.label(address(fcash), "fCashDAI token");
        
        // ... Oracles ...
        // oracle: fyeth <-> weth  || FYETH2209: i/r bearing ETH: underlying
        lendingOracleMock = new OracleMock();
        vm.label(address(lendingOracleMock), "lendingOracleMock");
        lendingOracleMock.set(1e18);    //set spot price

        // oracle: fDAI ("DAI") <-> weth   || value ilk against base 
        spotOracleMock = new OracleMock();
        vm.label(address(spotOracleMock), "spotOracleMock");
        spotOracleMock.set(1e18);    //set spot price

        //notionalMultiOracle = new NotionalMultiOracle();
        //vm.label(address(notionalMultiOracle), "notionalMultiOracle");
        chainlinkMultiOracle = new ChainlinkMultiOracle();
        vm.label(address(chainlinkMultiOracle), "chainlinkMultiOracle");


        //... Yield Contracts ...        
        daiJoin = new Join(address(dai));
        vm.label(address(daiJoin), "DAI Join");
        
        wethJoin = new Join(address(weth));
        vm.label(address(wethJoin), "WETH Join");
     
        // now + 90 days in seconds = block.timestamp + 7776000
        uint256 three_months = block.timestamp + 7776000;
        fytoken = new FYToken(baseId, IOracle(address(lendingOracleMock)), IJoin(address(wethJoin)), three_months, "FYETH2209", "FYETH2209");

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

        fcashwand = new FCashWand(ICauldronGov(address(cauldron)), ILadleGov(address(ladle)), IWitchCustom(address(witch)), IEmergencyBrake(address(cloak)), IChainlinkMultiOracle(address(chainlinkMultiOracle)));
        vm.label(address(fcashwand), "FCash Wand");

        njoinfactory = new NotionalJoinFactory(address(cloak), address(timelock));
        vm.label(address(njoinfactory), "Njoin Factory");

        // ... Deploy NJoin ...
        // Factory permissions
        vm.startPrank(address(timelock));
        //njoinfactory.grantRole(NotionalJoinFactory.deploy.selector, deployer);
        njoinfactory.grantRole(NotionalJoinFactory.deploy.selector, address(timelock));

        // 0x62d69f6867A0A084C6d313943dC22023Bc263691 -> StateDeployWandTest
        //njoinfactory.grantRole(NotionalJoinFactory.deploy.selector, 0x62d69f6867A0A084C6d313943dC22023Bc263691);
        vm.stopPrank();

        // njoin params 
        address asset = address(fcash);
        address underlying = address(dai); 
        address underlyingJoin = address(daiJoin); 
        uint40 maturity = 1662048000;   // 2022-09-02 00:00:00
        uint16 currencyId = 1;         
        uint256 salt = 1234;
        
        vm.prank(address(timelock));
        njoin = njoinfactory.deploy(asset, underlying, underlyingJoin, maturity, currencyId, salt);
        vm.label(njoin, "njoin contract");

        //... Wand permissions ...
        //vm.startPrank(address(timelock));
        vm.startPrank(stateDeployWandTest);
        fcashwand.grantRole(FCashWand.addfCashCollateral.selector, stateDeployWandTest);
        
        // _addAsset
        cauldron.grantRole(Cauldron.addAsset.selector, address(fcashwand));
        ladle.grantRole(Ladle.addJoin.selector, address(fcashwand));
        cloak.grantRole(EmergencyBrake.plan.selector, address(fcashwand));

        // _updateChainLinkSource
        chainlinkMultiOracle.grantRole(ChainlinkMultiOracle.setSource.selector, address(fcashwand));

        // _makeIlk: _updateAuctionLimit
        witch.grantRole(Witch.setIlk.selector, address(fcashwand));
        // _makeIlk: _updateDebtLimit
        cauldron.grantRole(Cauldron.setSpotOracle.selector, address(fcashwand));
        cauldron.grantRole(Cauldron.setDebtLimits.selector, address(fcashwand));
        
        // _addIlksToSeries
        cauldron.grantRole(Cauldron.addIlks.selector, address(fcashwand));

        //setLendingOracle
        cauldron.grantRole(Cauldron.setLendingOracle.selector, deployer);

        // addAsset + Series
        cauldron.grantRole(Cauldron.addAsset.selector, deployer);
        cauldron.grantRole(Cauldron.addSeries.selector, deployer);

        vm.stopPrank();
        
        // 
        vm.startPrank(address(cloak));
        NotionalJoin(njoin).grantRole(bytes4(0x00000000), address(fcashwand));
        vm.stopPrank();



    }
}

contract StateDeployWandTest is StateDeployWand{
    using Mocks for *;

    function testFCashWand() public {
        console2.log("fcashwand.addfCashCollateral()");

        FCashWand.ChainlinkSource[] memory chainlinkSource = new FCashWand.ChainlinkSource[](1);
        chainlinkSource[0] = FCashWand.ChainlinkSource({baseId: baseId, base: address(weth), quoteId: assetId, quote: address(dai), source: address(spotOracleMock)});
  
        FCashWand.AuctionLimit[] memory auctionLimits = new FCashWand.AuctionLimit[](1);
        auctionLimits[0] = FCashWand.AuctionLimit({
            ilkId: assetId,                  // fDAI   
            duration: 10,               
            initialOffer: 0.5e18,           // initialOffer <= 1e18, "InitialOffer above 100%"
            line: type(uint96).max,        //  maximum collateral that can be auctioned at the same time
            dust: type(uint16).max,       //  minimum collateral that must be left when buying, unless buying all | uint24
            dec: 18                            
        });

        FCashWand.DebtLimit[] memory debtLimits = new FCashWand.DebtLimit[](1);
        debtLimits[0] = FCashWand.DebtLimit ({
            baseId: baseId,                     // WETH
            ilkId: assetId,                     // fDAI
            ratio: 1000000,                     // With 6 decimals. 1000000 == 100%
            line: type(uint96).max,             // maximum debt for an underlying and ilk pair  | uint96
            dust: type(uint16).max,             // minimum debt for an underlying and ilk pair  | uint24
            dec: 18                             // decimals: Multiplying factor (10**dec) for line and dust | uint8             
        });

        FCashWand.SeriesIlk[] memory seriesIlks = new FCashWand.SeriesIlk[](1);

        bytes6[] memory ilkId = new bytes6[](1);
        ilkId[0] = assetId;
        seriesIlks[0] = FCashWand.SeriesIlk ({series: seriesId, ilkIds: ilkId});

        vm.startPrank(deployer);
        // pre-populate base asset to cauldron 
        cauldron.addAsset(baseId, address(weth));
        // register lending oracle (FYETH <-> WETH)
        cauldron.setLendingOracle(baseId, IOracle(lendingOracleMock));

        // create series | seriesID, bytes6 baseId, IFYToken fyToken)
        cauldron.addSeries(seriesId, baseId, IFYToken(address(fytoken)));
        vm.stopPrank();

        fcashwand.addfCashCollateral(assetId, address(fcash), njoin, chainlinkSource, auctionLimits, debtLimits, seriesIlks);

        //assert
        assertTrue(cauldron.ilks(seriesId, assetId) == true);


    }
}