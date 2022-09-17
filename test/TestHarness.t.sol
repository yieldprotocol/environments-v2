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

interface ILadleCustom {
    function batch(bytes[] calldata calls) external payable returns(bytes[] memory results);

    function forwardPermit(IERC2612 token, address spender, uint256 amount, uint256 deadline, uint8 v, bytes32 r, bytes32 s) external payable;

    function transfer(IERC20 token, address receiver, uint128 wad) external payable;
    
    function route(address integration, bytes calldata data) external payable;
}

contract TestHarness is Test, TestConstants {
    ICauldron public cauldron = ICauldron(0xc88191F8cb8e6D4a668B047c1C8503432c3Ca867);
    ILadle public ladle = ILadle(0x6cB18fF2A33e981D1e38A663Ca056c0a5265066A);
    IPool public pool = IPool(0x6BaC09a67Ed1e1f42c29563847F77c28ec3a04FC);      // FYDAI2209 LP
    IERC20 public token = IERC20(0xFCb9B8C5160Cf2999f9879D8230dCed469E72eeb);   // FYDAI2209
    IERC20 public dai = IERC20(0x6B175474E89094C44Da98b954EedeAC495271d0F);

    address public join = 0x4fE92119CDf873Cf8826F4E6EcfD4E578E3D44Dc;           // DAI Join
    bytes6 public ilkId = 0x303100000000;                                       // DAI Ilk ID
    bytes6 public seriesId = 0x303130370000;                                    // ETH/DAI Sept 22 series
    bytes12 public vaultId;

    function setUp() public {
        vm.createSelectFork('mainnet');
        (vaultId, ) = ladle.build(seriesId, ilkId, 0);

        deal(address(dai), address(this), WAD * 2);
    }

    function testBorrowAnyAssetWithAnyCollateral() public {
        DataTypes.Vault memory vault = cauldron.vaults(vaultId);
        dai.approve(address(ladle), WAD * 2);
        dai.transfer(join, WAD * 2);
        ladle.pour(vaultId, vault.owner, 1e18 * 2, 1e18);
    }

    function testPoolAnyAmountWithBorrowAndPool() public {

    }
}
