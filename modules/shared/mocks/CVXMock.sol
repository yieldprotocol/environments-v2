// SPDX-License-Identifier: BUSL-1.1
pragma solidity ^0.8.0;
import '@yield-protocol/utils-v2/src/token/ERC20.sol';

contract CVXMock is ERC20 {
    constructor() ERC20('Convex Token Mock', 'CVX Mock', 18) {}

    /// @dev Give tokens to whoever asks for them.
    function mint(address to, uint256 amount) public virtual {
        _mint(to, amount);
    }
}
