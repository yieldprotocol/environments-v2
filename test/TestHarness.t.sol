// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

import "forge-std/Test.sol";
import "forge-std/StdJson.sol";
import "forge-std/console.sol";
import "@yield-protocol/vault-v2/contracts/interfaces/ICauldron.sol";
import "@yield-protocol/vault-v2/contracts/interfaces/ILadle.sol";
import "@yield-protocol/vault-v2/contracts/test/utils/TestConstants.sol";
import "@yield-protocol/utils-v2/contracts/token/IERC20.sol";
import "@yield-protocol/utils-v2/contracts/token/IERC2612.sol";
import "@yield-protocol/yieldspace-tv/src/interfaces/IPool.sol";

contract TestHarness is Test, TestConstants {
    using stdJson for string;

    ICauldron public cauldron = ICauldron(0xc88191F8cb8e6D4a668B047c1C8503432c3Ca867);
    ILadle public ladle = ILadle(0x6cB18fF2A33e981D1e38A663Ca056c0a5265066A);
    IPool public pool;
    IERC20 public fyToken;
    IERC20 public base;
    IERC20 public collateral;

    address public join;
    bytes6 public ilkId;
    bytes6 public seriesId;
    bytes12 public vaultId;

    function setUp() public {
        vm.createSelectFork('mainnet');

        string memory root = vm.projectRoot();
        string memory path = string.concat(root, "/shared/data.json");
        string memory json = vm.readFile(path);
        bytes memory parsed = vm.parseJson(json);
        console.logBytes(parsed);
    }

    function testBorrowAnyAssetWithAnyCollateral() public {
        console.log("can borrow any asset with any collateral");

        (vaultId, ) = ladle.build(seriesId, ilkId, 0);

        deal(address(collateral), address(this), WAD * 2);
        deal(address(fyToken), address(this), WAD * 2);

        DataTypes.Vault memory vault = cauldron.vaults(vaultId);
        collateral.approve(address(ladle), WAD * 2);
        collateral.transfer(join, WAD * 2);
        ladle.pour(vaultId, vault.owner, 1e18 * 2, 1e18);
    }

    function testPoolAnyAmountWithBorrowAndPool() public {
        console.log("can pool any amount with borrow and pool");
        string memory root = vm.projectRoot();
        string memory path = string.concat(root, "/shared/data.json");
        string memory json = vm.readFile(path);
        
        (vaultId, ) = ladle.build(seriesId, ilkId, 0);

        deal(address(base), address(this), WAD * 2);
        deal(address(fyToken), address(this), WAD * 2);

        uint256 baseBalanceBefore = pool.getBaseBalance();
        uint256 fyTokenBalanceBefore = pool.getFYTokenBalance();

        // give approval and send base and fytoken to pool
        base.approve(address(pool), WAD * 2);
        base.transfer(address(pool), WAD * 2);
        fyToken.approve(address(pool), WAD * 2);
        fyToken.transfer(address(pool), WAD * 2);
        // mint lp tokens
        (
            uint256 baseAmount, 
            uint256 fyTokenAmount, 
            uint256 lpTokenAmount
        ) = pool.mint(
            address(this), 
            address(this), 
            0, 
            type(uint256).max
        );

        uint256 baseBalanceAfter = pool.getBaseBalance();
        uint256 fyTokenBalanceAfter = pool.getFYTokenBalance();

        assertEq(
            base.balanceOf(address(this)) + baseAmount, 
            WAD * 2
        );
        assertEq(
            fyTokenAmount, 
            WAD * 2
        );
        assertEq(
            lpTokenAmount,
            1944400271832902846
        );
        assertEq(
            baseBalanceBefore + baseAmount, 
            baseBalanceAfter
        );
        assertEq(
            fyTokenBalanceAfter,
            516221416956699490582032
        );
    }
}
