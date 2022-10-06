// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

import "forge-std/Test.sol";
import "forge-std/console.sol";
import "@yield-protocol/vault-v2/contracts/interfaces/ICauldron.sol";
import "@yield-protocol/vault-v2/contracts/interfaces/ILadle.sol";
import "@yield-protocol/vault-v2/contracts/test/utils/TestConstants.sol";
import "@yield-protocol/utils-v2/contracts/token/IERC20.sol";
import "@yield-protocol/utils-v2/contracts/token/IERC2612.sol";
import "@yield-protocol/yieldspace-tv/src/interfaces/IPool.sol";

contract TestHarness is Test, TestConstants {
    ICauldron public cauldron = ICauldron(0xc88191F8cb8e6D4a668B047c1C8503432c3Ca867);
    ILadle public ladle = ILadle(0x6cB18fF2A33e981D1e38A663Ca056c0a5265066A);
    IPool public pool = IPool(0x6BaC09a67Ed1e1f42c29563847F77c28ec3a04FC);      // FYDAI2209 LP
    IERC20 public fyDAI = IERC20(0xFCb9B8C5160Cf2999f9879D8230dCed469E72eeb);   // FYDAI2209
    IERC20 public dai = IERC20();

    address public join = 0x41567f6A109f5bdE283Eb5501F21e3A0bEcbB779;           // UNI Join
    bytes6 public ilkId = 0x313000000000;                                       // UNI Ilk ID
    bytes6 public seriesId = 0x303130380000;                                    // DAI Dec 22 series
    bytes12 public vaultId;

    function setUp() public {
        vm.createSelectFork('mainnet');
        (vaultId, ) = ladle.build(seriesId, ilkId, 0);

        deal(address(dai), address(this), WAD * 2);
        deal(address(fyDAI), address(this), WAD * 2);
    }

    function testBorrowAnyAssetWithAnyCollateral() public {
        console.log("can borrow any asset with any collateral");
        DataTypes.Vault memory vault = cauldron.vaults(vaultId);
        dai.approve(address(ladle), WAD * 2);
        dai.transfer(join, WAD * 2);
        ladle.pour(vaultId, vault.owner, 1e18 * 2, 1e18);
    }

    function testPoolAnyAmountWithBorrowAndPool() public {
        console.log("can pool any amount with borrow and pool");
        uint256 baseBalanceBefore = pool.getBaseBalance();
        uint256 fyTokenBalanceBefore = pool.getFYTokenBalance();

        // give approval and send base and fytoken to pool
        dai.approve(address(pool), WAD * 2);
        dai.transfer(address(pool), WAD * 2);
        fyDAI.approve(address(pool), WAD * 2);
        fyDAI.transfer(address(pool), WAD * 2);
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
            dai.balanceOf(address(this)) + baseAmount, 
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
