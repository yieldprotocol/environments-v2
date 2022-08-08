// SPDX-License-Identifier: BUSL-1.1
pragma solidity 0.8.14;

import 'forge-std/src/Test.sol';
import 'forge-std/src/console2.sol';

import '../src/fCashWand.sol';
import {NotionalJoin} from '../src/NotionalJoin.sol';
import {NotionalJoinFactory} from '../src/NotionalJoinFactory.sol';
import {NotionalMultiOracle} from '@yield-protocol/vault-v2/contracts/other/notional/NotionalMultiOracle.sol';
import {FCashMock} from '@yield-protocol/vault-v2/contracts/other/notional/FCashMock.sol';

import {Join} from '@yield-protocol/vault-v2/contracts/Join.sol';
import {DAIMock} from '@yield-protocol/vault-v2/contracts/mocks/DAIMock.sol';
import {ERC20Mock} from '@yield-protocol/vault-v2/contracts/mocks/ERC20Mock.sol';
import {WETH9Mock} from '@yield-protocol/vault-v2/contracts/mocks/WETH9Mock.sol';

import {Cauldron} from '@yield-protocol/vault-v2/contracts/Cauldron.sol';
import {Ladle} from '@yield-protocol/vault-v2/contracts/Ladle.sol';
import {Witch} from '@yield-protocol/vault-v2/contracts/Witch.sol';
import {Timelock} from '@yield-protocol/utils-v2/contracts/utils/Timelock.sol';
import {AccessControl} from '@yield-protocol/utils-v2/contracts/access/AccessControl.sol';
import {IEmergencyBrake, EmergencyBrake} from '@yield-protocol/utils-v2/contracts/utils/EmergencyBrake.sol';

import {IFYToken} from '@yield-protocol/vault-interfaces/src/IFYToken.sol';
import {FYToken} from '@yield-protocol/vault-v2/contracts/FYToken.sol';
import {IJoin} from '@yield-protocol/vault-interfaces/src/IJoin.sol';
import {OracleMock} from '@yield-protocol/vault-v2/contracts/mocks/oracles/OracleMock.sol';

import '@yield-protocol/vault-interfaces/src/ICauldron.sol';
import '@yield-protocol/vault-interfaces/src/ICauldronGov.sol';
import '@yield-protocol/vault-interfaces/src/IOracle.sol';
import '@yield-protocol/vault-interfaces/src/ILadle.sol';
import '@yield-protocol/vault-interfaces/src/ILadleGov.sol';
import '@yield-protocol/utils-v2/contracts/interfaces/IWETH9.sol';
import {FCashWandExt} from 'test/fCashWandExt.sol';

abstract contract StateAddCollateral is Test {
    using stdStorage for StdStorage;

    FCashWandExt public fcashwand;

    NotionalMultiOracle public notionalMultiOracle;
    NotionalJoinFactory public njoinfactory;
    NotionalJoin public njoin;
    FCashMock public oldFCash;
    FCashMock public newFCash;

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

    //... Wand Params...
    bytes6 assetId = bytes6('01'); // fCash: fDAI | notionalId, ilkId
    bytes6 baseId = bytes6('02'); // base asset: DAI
    bytes6 seriesId = bytes6('03'); // arbitrary seriesId
    bytes6 oldAssetId = bytes6('04'); 
    bytes6 oldSeriesId = bytes6('05'); 
    uint256 salt = 1234;


    function setUp() public virtual {
        user = address(1);
        vm.label(user, 'user');

        deployer = 0xb4c79daB8f259C7Aee6E5b2Aa729821864227e84;
        vm.label(deployer, 'deployer');

        vm.startPrank(deployer);

        //... Assets ...
        dai = new DAIMock();
        vm.label(address(dai), 'dai token');

        weth = new WETH9Mock();
        vm.label(address(weth), 'weth token'); // for ladle deployment

        oldFCash = new FCashMock(ERC20Mock(address(dai)), 1); // underlying = dai, fCashId = 1;
        vm.label(address(oldFCash), 'fDAI old token');

        newFCash = new FCashMock(ERC20Mock(address(dai)), 2); // underlying = dai, fCashId = 2;
        vm.label(address(newFCash), 'fDAI new token');

        // ... Oracles ...
        // oracle: FYDAI <-> DAi
        lendingOracleMock = new OracleMock();
        lendingOracleMock.set(1e18);
        vm.label(address(lendingOracleMock), 'lendingOracleMock');

        notionalMultiOracle = new NotionalMultiOracle();
        vm.label(address(notionalMultiOracle), 'notionalMultiOracle');

        //... Yield Contracts ...
        daiJoin = new Join(address(dai));
        vm.label(address(daiJoin), 'DAI Join');

        // fyToken: FYDAI
        uint256 threeMonths = block.timestamp + 7776000; // now + 90 days in seconds
        fytoken = new FYToken(
            baseId,
            IOracle(address(lendingOracleMock)),
            IJoin(address(daiJoin)),
            threeMonths,
            'FYDAI',
            'FYDAI'
        );

        cauldron = new Cauldron();
        vm.label(address(cauldron), 'Cauldron');

        ladle = new Ladle(ICauldron(address(cauldron)), IWETH9(address(weth)));
        vm.label(address(ladle), 'Ladle');

        witch = new Witch(ICauldron(address(cauldron)), ILadle(address(ladle)));
        vm.label(address(witch), 'Witch');

        cloak = new EmergencyBrake(deployer, deployer);
        vm.label(address(cloak), 'Cloak');

        timelock = new Timelock(deployer, deployer);
        vm.label(address(timelock), 'Timelock');

        fcashwand = new FCashWandExt(
            ICauldronGov(address(cauldron)),
            ILadleGov(address(ladle)),
            IWitchCustom(address(witch)),
            IEmergencyBrake(address(cloak)),
            INotionalMultiOracle(address(notionalMultiOracle))
        );
        vm.label(address(fcashwand), 'FCash Wand');

        njoinfactory = new NotionalJoinFactory(address(cloak), address(timelock), ILadleGov(address(ladle)));
        vm.label(address(njoinfactory), 'Njoin Factory');

        vm.stopPrank();


        //... Granting permissions ...
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

        // setLendingOracle
        cauldron.grantRole(Cauldron.setLendingOracle.selector, deployer);

        // addAsset + Series
        cauldron.grantRole(Cauldron.addAsset.selector, deployer);
        cauldron.grantRole(Cauldron.addSeries.selector, deployer);

        // ... Instantiate Yield assets, oracles, series ...
        // pre-populate base asset to cauldron
        cauldron.addAsset(baseId, address(dai));
        // register lending oracle (FYUSDC <-> USDC)
        cauldron.setLendingOracle(baseId, IOracle(lendingOracleMock));
        // create series
        cauldron.addSeries(seriesId, baseId, IFYToken(address(fytoken)));
        cauldron.addSeries(oldSeriesId, baseId, IFYToken(address(fytoken)));

        vm.stopPrank();

        // ... Deploy NJoin ...
        // Factory permissions
        vm.startPrank(address(timelock));
        njoinfactory.grantRole(NotionalJoinFactory.deploy.selector, deployer);
        njoinfactory.grantRole(NotionalJoinFactory.addFCash.selector, deployer);
        vm.stopPrank();

        setUpReferences();

        // deploy new njoin
        vm.prank(deployer);
        njoin = njoinfactory.deploy(oldAssetId, assetId, address(newFCash), salt);
        vm.label(address(njoin), 'njoin contract');
        // register with Ladle
        

        vm.startPrank(address(cloak));
        NotionalJoin(njoin).grantRole(bytes4(0x00000000), address(fcashwand));
        vm.stopPrank();



    }

    function setUpReferences() public {

        //... NotionalJoinFactory params ...
        address asset = address(oldFCash);
        address underlying = address(dai);
        address underlyingJoin = address(daiJoin);
        uint40 maturity = 1662048000; // 2022-09-02 00:00:00
        uint16 currencyId = 1;
        
        // oldAssetId & oldJoin
        NotionalJoin oldJoin = new NotionalJoin(asset, underlying, underlyingJoin, maturity, currencyId);
        vm.prank(deployer);
        njoinfactory.addFCash(oldAssetId, 1); //oldFCashId = 1

        // _addAsset: AccessControl(joinAddress).grantRoles(sigs, address(ladle))    
        NotionalJoin(oldJoin).grantRole(bytes4(0x00000000), address(fcashwand));

        // Wand params
        FCashWand.NotionalSource memory notionalSource;
        notionalSource = FCashWand.NotionalSource({
            notionalId: oldAssetId,
            underlyingId: baseId,
            underlying: address(dai)
        });

        CollateralWandBase.AuctionLimit memory auctionLimits;
        auctionLimits = CollateralWandBase.AuctionLimit({
            ilkId: oldAssetId,          // fCash
            duration: 3600,
            initialOffer: 0.5e18,  // initialOffer <= 1e18, "InitialOffer above 100%"
            line: 1000000,        // maximum collateral that can be auctioned at the same time
            dust: 5000,          // minimum collateral that must be left when buying, unless buying all | uint24
            dec: 18
        });

        CollateralWandBase.DebtLimit[] memory debtLimits = new CollateralWandBase.DebtLimit[](1);
            debtLimits[0] = CollateralWandBase.DebtLimit({
            baseId: baseId, // DAI
            ilkId: oldAssetId, // fCash
            ratio: 1000000, // With 6 decimals. 1000000 == 100%
            line: 10000000, // maximum debt for an underlying and ilk pair  | uint96
            dust: 0, // minimum debt for an underlying and ilk pair  | uint24
            dec: 18 // decimals: Multiplying factor (10**dec) for line and dust | uint8
        });

        CollateralWandBase.SeriesIlk[] memory seriesIlks = new CollateralWandBase.SeriesIlk[](1);

        bytes6[] memory ilkId = new bytes6[](1);
        ilkId[0] = oldAssetId;
        seriesIlks[0] = CollateralWandBase.SeriesIlk({series: oldSeriesId, ilkIds: ilkId});
        fcashwand.addfCashCollateralOld(oldAssetId, address(oldJoin), notionalSource, auctionLimits, debtLimits, seriesIlks);
        
    }
}

contract StateAddCollateralTest is StateAddCollateral {
    function testFCashWand() public {
        console2.log('fcashwand.addfCashCollateral()');

        vm.prank(deployer);
        fcashwand.addfCashCollateral(assetId, address(njoin), oldAssetId, seriesId);

        // cauldron: ilk check
        assertTrue(cauldron.ilks(seriesId, assetId) == true);
    }
}



abstract contract StateBorrowOnNewCollateral is StateAddCollateral {
    function setUp() public virtual override {
        super.setUp();

        vm.startPrank(deployer);
        fcashwand.addfCashCollateral(assetId, address(njoin), oldAssetId, seriesId);

        // ... Permissions ...

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
        console2.log('Borrow USDC with fCash(fDAI) as collateral');

        vm.startPrank(user);

        // Build vault
        (bytes12 vaultId, DataTypes.Vault memory vault) = ladle.build(seriesId, assetId, 0);
        IJoin collateralJoin = ladle.joins(assetId); //njoin

        // User: Mint & Post collateral
        uint40 maturity = 1662048000 + (86400 * 90); // 2022-09-02 00:00:00
        uint16 currencyId = 1;
        uint256 id = uint256(
            (bytes32(uint256(currencyId)) << 48) | (bytes32(uint256(maturity)) << 8) | bytes32(uint256(1))
        );

        // get collateral
        newFCash.mint(user, id, 10e18, bytes('1')); // arbitrary data passed
        newFCash.safeTransferFrom(user, address(collateralJoin), id, 5e18, bytes('1')); // arbitrary data passed

        // Borrow
        int128 ink = 5e18;
        int128 art = 1e18;
        ladle.pour(vaultId, user, ink, art);

        // assert Borrow
        assertTrue(newFCash.balanceOf(user, id) == 5e18);
        assertTrue(fytoken.balanceOf(user) == 1e18);

        // Repay fyDAI and Withdraw collateral
        fytoken.transfer(address(fytoken), 1e18);
        ladle.pour(vaultId, user, -1 * ink, -1 * art);

        // assert Repay & Withdraw
        assertTrue(fytoken.balanceOf(user) == 0);
        assertTrue(newFCash.balanceOf(user, id) == 10e18);

        vm.stopPrank();
    }
}