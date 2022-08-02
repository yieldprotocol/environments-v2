// SPDX-License-Identifier: BUSL-1.1
pragma solidity 0.8.14;

import 'forge-std/src/Test.sol';
import 'forge-std/src/console2.sol';
import {Mocks} from '@yield-protocol/vault-v2/contracts/test/utils/Mocks.sol';

import {NotionalJoinFactory, NotionalJoin} from '../src/NotionalJoinFactory.sol';
import {NotionalMultiOracle} from '@yield-protocol/vault-v2/contracts/other/notional/NotionalMultiOracle.sol';
import {FCashMock} from '@yield-protocol/vault-v2/contracts/other/notional/FCashMock.sol';

import {Join} from '@yield-protocol/vault-v2/contracts/Join.sol';
import {DAIMock} from '@yield-protocol/vault-v2/contracts/mocks/DAIMock.sol';
import {ERC20Mock} from '@yield-protocol/vault-v2/contracts/mocks/ERC20Mock.sol';

import {AccessControl} from '@yield-protocol/utils-v2/contracts/access/AccessControl.sol';
import {Timelock} from '@yield-protocol/utils-v2/contracts/utils/Timelock.sol';
import {Ladle} from '@yield-protocol/vault-v2/contracts/Ladle.sol';
import '@yield-protocol/vault-interfaces/src/ICauldron.sol';
import '@yield-protocol/utils-v2/contracts/interfaces/IWETH9.sol';
import '@yield-protocol/vault-interfaces/src/ILadleGov.sol';

abstract contract StateZero is Test {
    using stdStorage for StdStorage;

    NotionalJoinFactory public njoinfactory;
    NotionalJoin public oldJoin;
    Join public daiJoin;
    FCashMock public oldFcash;
    FCashMock public newFcash;
    DAIMock public dai;
    AccessControl public cloak;
    Timelock public timelock;
    Ladle public ladle;

    address deployer;

    bytes6 oldAssetId;
    bytes6 newAssetId; 
    bytes6 otherOldAssetId; 

    address underlying; 
    address underlyingJoin;
    uint40 maturity; 
    uint16 currencyId;
    uint256 fCashId;

    event Added(bytes6 indexed assetId, uint256 indexed fCashId);

    function setUp() public virtual {

        // arbitrary fCash values for testing
        oldAssetId = bytes6('01'); 
        newAssetId = bytes6('02'); 
        otherOldAssetId= bytes6('03');
        maturity = 1651743369; // 4/07/2022 23:09:57 GMT
        currencyId = 1;
        fCashId = 4;

        deployer = 0xb4c79daB8f259C7Aee6E5b2Aa729821864227e84;
        vm.label(deployer, 'deployer');

        //... Assets ...
        dai = new DAIMock();
        vm.label(address(dai), 'Dai token contract');

        oldFcash = new FCashMock(ERC20Mock(address(dai)), fCashId);
        vm.label(address(oldFcash), 'old fCashMock contract');

        newFcash = new FCashMock(ERC20Mock(address(dai)), fCashId);
        vm.label(address(newFcash), 'new fCashMock contract');

        //... Yield Contracts ...
        daiJoin = new Join(address(dai));
        vm.label(address(dai), 'Dai Join');

        cloak = new AccessControl();
        vm.label(address(cloak), 'Cloak contract');

        timelock = new Timelock(deployer, deployer);
        vm.label(address(timelock), 'Timelock contract');

        ladle = new Ladle(ICauldron (address(1)), IWETH9 (address(2)));
        vm.label(address(ladle), 'Ladle contract');

        njoinfactory = new NotionalJoinFactory(address(cloak), address(timelock), ILadleGov(address(ladle)));
        vm.label(address(njoinfactory), 'Njoin Factory contract');
        vm.stopPrank();

        vm.startPrank(address(timelock));
        njoinfactory.grantRole(NotionalJoinFactory.deploy.selector, deployer);
        njoinfactory.grantRole(NotionalJoinFactory.getAddress.selector, deployer);
        njoinfactory.grantRole(NotionalJoinFactory.getByteCode.selector, deployer);
        njoinfactory.grantRole(NotionalJoinFactory.addFCash.selector, deployer);
        vm.stopPrank();

        // create njoin for oldAssetId
        vm.startPrank(deployer);

        underlying = address(dai);
        underlyingJoin = address(daiJoin);
        oldJoin = new NotionalJoin(address(oldFcash), underlying, underlyingJoin, maturity, currencyId);

        //register old njoin into ladle | this will be used as reference in setup
        stdstore
            .target(address(ladle))
            .sig("joins(bytes6)")
            .with_key(oldAssetId)
            .checked_write(address(oldJoin));

        // this assetId is not captured in fcashAssets mapping, but registered in ladle
        stdstore
            .target(address(ladle))
            .sig("joins(bytes6)")
            .with_key(otherOldAssetId)
            .checked_write(address(5));         // arbitrary non-zero address set

    }
}

// register oldAssetId via addFCash()
contract StateZeroTest is StateZero {

    function testAddFCash() public {
        vm.expectEmit(true, true, false, false);
        emit Added(oldAssetId, oldJoin.id());
        njoinfactory.addFCash(oldAssetId, oldJoin.id());

        assertTrue(njoinfactory.fcashAssets(oldAssetId) == oldJoin.id());
    }

}   

abstract contract StateDeploy is StateZero {

    function setUp() public override virtual {
        super.setUp();

        // oldAssetId added into factory
        njoinfactory.addFCash(oldAssetId, oldJoin.id());
    }
}


contract StateDeployTest is StateDeploy {
    using Mocks for *;

    function testCannotCreateExisting() public {
        console2.log('Cannot deploy notional that already exists / Re-use existing assetId');

        uint256 salt_1 = 1234;
        uint256 salt_2 = 1235;

        NotionalJoin newJoin_1 = njoinfactory.deploy(oldAssetId, newAssetId, address(newFcash), salt_1);
        vm.expectRevert("Invalid newAssetId");
        NotionalJoin newJoin_2 = njoinfactory.deploy(oldAssetId, newAssetId, address(6), salt_2);
    }

    function testCannotReferenceUnregisteredJoin() public {
        console2.log('New Join should not be registered in Ladle');

        uint256 salt = 1234;

        vm.expectRevert("newAssetId join exists");
        NotionalJoin newJoin = njoinfactory.deploy(oldAssetId, otherOldAssetId, address(newFcash), salt);
    }

    function testDeploy() public {
        console2.log('Address of newJoin deployed should be the same as the pre-determined approach');

        uint256 salt = 1234;

        NotionalJoin newJoin = njoinfactory.deploy(oldAssetId, newAssetId, address(newFcash), salt);

        address newJoinGenerated = njoinfactory.getAddress(
            njoinfactory.getByteCode(address(newFcash), underlying, underlyingJoin, maturity + (86400 * 90), currencyId),
            salt
        );

        assertTrue(address(newJoin) == address(newJoinGenerated));
    }

    function testDeployDifferingSalt() public {
        console2.log('Address of newJoin deployed should change with different salts');

        uint256 salt_1 = 1234;
        uint256 salt_2 = 1235;

        NotionalJoin newJoin = njoinfactory.deploy(oldAssetId, newAssetId, address(newFcash), salt_1);
        address newJoinGenerated = njoinfactory.getAddress(
            njoinfactory.getByteCode(asset, underlying, underlyingJoin, maturity + (86400 * 90), currencyId),
            salt_2
        );

        assertTrue(address(newJoin) != newJoinGenerated);
    }

}
