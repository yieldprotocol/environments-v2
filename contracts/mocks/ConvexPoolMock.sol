// SPDX-License-Identifier: MIT
pragma solidity 0.8.6;

import '@yield-protocol/utils-v2/contracts/token/ERC20.sol';
import '@yield-protocol/vault-interfaces/DataTypes.sol';
import '@yield-protocol/utils-v2/contracts/token/TransferHelper.sol';

contract ConvexPoolMock {
    using TransferHelper for IERC20;
    IERC20 rewardToken;
    IERC20 stakingToken;
    uint256 _totalSupply;
    mapping(address => uint256) _balances;

    constructor(IERC20 _rewardToken, IERC20 _stakingToken) {
        rewardToken = _rewardToken;
        stakingToken = _stakingToken;
    }

    function getReward(address _account, bool _claimExtras) public returns (bool) {
        rewardToken.transfer(_account, 100); //Fixed reward transfer
        return true;
    }

    function stake(uint256 _amount) public returns (bool) {
        require(_amount > 0, 'RewardPool : Cannot stake 0');

        _totalSupply = _totalSupply + _amount;
        _balances[msg.sender] = _balances[msg.sender] + _amount;

        stakingToken.safeTransferFrom(msg.sender, address(this), _amount);
        return true;
    }

    function withdraw(uint256 amount, bool claim) public returns (bool) {
        require(amount > 0, 'RewardPool : Cannot withdraw 0');

        _totalSupply = _totalSupply - amount;
        _balances[msg.sender] = _balances[msg.sender] - amount;

        stakingToken.safeTransfer(msg.sender, amount);

        return true;
    }
}
