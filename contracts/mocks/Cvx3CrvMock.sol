// SPDX-License-Identifier: BUSL-1.1
pragma solidity 0.8.6;
import '@yield-protocol/utils-v2/contracts/token/ERC20Permit.sol';

contract Cvx3CrvMock is ERC20Permit {
    constructor() ERC20Permit('Curve.fi DAI/USDC/USDT Convex Deposit Mock', 'Cvx3Crv Mock', 18) {}

    /// @dev Give tokens to whoever asks for them.
    function mint(address to, uint256 amount) public virtual {
        _mint(to, amount);
    }
}
