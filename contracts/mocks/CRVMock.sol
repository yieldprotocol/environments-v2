// SPDX-License-Identifier: BUSL-1.1
pragma solidity 0.8.6;
import '@yield-protocol/utils-v2/contracts/token/ERC20Permit.sol';

contract CRVMock is ERC20Permit {
    constructor() ERC20Permit('Curve DAO Token Mock', 'CRV Mock', 18) {}

    /// @dev Give tokens to whoever asks for them.
    function mint(address to, uint256 amount) public virtual {
        _mint(to, amount);
    }
}
