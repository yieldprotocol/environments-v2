// SPDX-License-Identifier: BUSL-1.1
pragma solidity 0.8.14;

import "forge-std/src/Test.sol";
import "forge-std/src/console2.sol";
import {Mocks} from "@yield-protocol/vault-v2/contracts/test/utils/Mocks.sol";

import {NotionalJoin} from "../src/NotionalJoinFactory.sol";
import {NotionalJoinFactory} from "../src/NotionalJoinFactory.sol";
import {NotionalMultiOracle} from "@yield-protocol/vault-v2/contracts/other/notional/NotionalMultiOracle.sol";

import {Join} from "@yield-protocol/vault-v2/contracts/Join.sol";
import {FCashMock} from "@yield-protocol/vault-v2/contracts/other/notional/FCashMock.sol";
import {DAIMock} from "@yield-protocol/vault-v2/contracts/mocks/DAIMock.sol";
import {ERC20Mock} from "@yield-protocol/vault-v2/contracts/mocks/ERC20Mock.sol";

import {AccessControl} from "@yield-protocol/utils-v2/contracts/access/AccessControl.sol";
import {Timelock} from "@yield-protocol/utils-v2/contracts/utils/Timelock.sol";

using stdStorage for StdStorage;


abstract contract StateFactoryDeploy is Test {
    using Mocks for *;

    NotionalJoinFactory public njoinfactory;
    //NotionalJoin public njoin; 
    Join public daiJoin; 
    FCashMock public fcash;
    DAIMock public dai;
    AccessControl public cloak;
    Timelock public timelock;

    address user; 
    address deployer;

    // arbitrary values for testing
    uint40 maturity = 1651743369;   // 4/07/2022 23:09:57 GMT
    uint16 currencyId = 2;         
    uint256 fCashId = 4;

    function setUp() public virtual {
        //... Users ...
        user = address(1);
        vm.label(user, "user");

        deployer = 0xb4c79daB8f259C7Aee6E5b2Aa729821864227e84;
        vm.label(deployer, "deployer");

        //... Assets ...
        dai = new DAIMock();
        vm.label(address(dai), "Dai token contract");

        fcash = new FCashMock(ERC20Mock(address(dai)), fCashId);
        vm.label(address(fcash), "fCashMock contract");

        //... Yield Contracts ...        
        daiJoin = new Join(address(dai));
        vm.label(address(dai), "Dai Join");

        cloak = new AccessControl();
        vm.label(address(cloak), "Cloak contract");

        timelock = new Timelock(deployer, deployer);
        vm.label(address(timelock), "Timelock contract");

        njoinfactory = new NotionalJoinFactory(address(cloak), address(timelock));
        vm.label(address(njoinfactory), "Njoin Factory contract");

        vm.startPrank(address(timelock));
        njoinfactory.grantRole(NotionalJoinFactory.deploy.selector, deployer);
        njoinfactory.grantRole(NotionalJoinFactory.getAddress.selector, deployer);
        njoinfactory.grantRole(NotionalJoinFactory.getByteCode.selector, deployer);
        vm.stopPrank();

    }
}


contract StateFactoryDeployTest is StateFactoryDeploy {
    using Mocks for *;


    function testDeploy() public {
        console2.log("Address of njoin deployed should be the same as the pre-determined approach");

        address asset = address(fcash);
        address underlying = address(dai); 
        address underlyingJoin = address(daiJoin); 
        uint256 salt = 1234;

        address njoin = njoinfactory.deploy(asset, underlying, underlyingJoin, maturity, currencyId, salt);
        address njoinGenerated = njoinfactory.getAddress(njoinfactory.getByteCode(asset, underlying, underlyingJoin, maturity, currencyId),salt);

        assertTrue(njoin == njoinGenerated);

    }

    function testDeployDifferingSalt() public {
        console2.log("Address of njoin deployed should change with different salts");

        address asset = address(fcash);
        address underlying = address(dai); 
        address underlyingJoin = address(daiJoin); 
        uint256 salt_1 = 1234;
        uint256 salt_2 = 1235;

        address njoin = njoinfactory.deploy(asset, underlying, underlyingJoin, maturity, currencyId, salt_1);
        address njoinGenerated = njoinfactory.getAddress(njoinfactory.getByteCode(asset, underlying, underlyingJoin, maturity, currencyId),salt_2);

        assertTrue(njoin != njoinGenerated);
    }
} 