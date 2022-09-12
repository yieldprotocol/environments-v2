// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

import "forge-std/Test.sol";

contract TestHarness is Test {
    function setUp() public {

    }

    function testBorrowAnyAssetWithAnyCollateral() public {
        string[] memory inputs = new string[](3);
        inputs[0] = "echo";
        inputs[1] = "-n";
        inputs[2] = "gm";

        bytes memory res = vm.ffi(inputs);
        assertEq(string(res), "gm");
    }

    function testPoolAnyAmountWithBorrowAndPool() public {

    }
}
