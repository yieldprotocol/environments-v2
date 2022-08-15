// SPDX-License-Identifier: GPL-3.0-or-later
pragma solidity ^0.8.0;

// import "@openzeppelin/contracts/token/ERC20/presets/ERC20PresetMinterPauser.sol";
import "@yield-protocol/utils-v2/contracts/token/ERC20.sol";

contract WBTCMock is ERC20 {

    constructor () ERC20("Wrapped BTC", "WBTC", 8) {}

    // function decimals() public pure override returns (uint8) {
    //     return 8;
    // }

}