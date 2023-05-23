// SPDX-License-Identifier: BUSL-1.1
pragma solidity >=0.8.15;

import 'erc3156/contracts/interfaces/IERC3156FlashBorrower.sol';
import 'erc3156/contracts/interfaces/IERC3156FlashLender.sol';
import '@yield-protocol/strategy-v2/src/Strategy.sol';
import '@yield-protocol/utils-v2/src/access/AccessControl.sol';
import '@yield-protocol/vault-v2/src/interfaces/ILadle.sol';
import '@yield-protocol/utils-v2/src/token/IERC20.sol';
import "@yield-protocol/utils-v2/src/token/TransferHelper.sol";

error FlashLoanFailure();

contract StrategyRescue is IERC3156FlashBorrower, AccessControl {
    using TransferHelper for IERC20;
    using TransferHelper for Strategy;
    /// @notice By IERC3156, the flash loan should return this constant.
    bytes32 public constant FLASH_LOAN_RETURN = keccak256('ERC3156FlashBorrower.onFlashLoan');

    ILadle public immutable ladle;

    constructor(ILadle ladle_) {
        ladle = ladle_;
    }

    function startRescue(bytes6 underlyingId, Strategy strategy) external auth {
        IERC20 base = strategy.base();
        IJoin join = ladle.joins(underlyingId);

        strategy.safeTransferFrom(msg.sender, address(strategy), strategy.balanceOf(msg.sender));

        bytes memory data = bytes.concat(
            bytes20(address(strategy)), // 20 bytes
            bytes20(address(base)), // 20 bytes
            underlyingId //6 bytes
        );

        bool success = IERC3156FlashLender(address(join)).flashLoan(
            this, // Loan Receiver
            address(base), // Loan Token
            strategy.fyTokenCached() + 1, // Loan Amount
            data
        );

        if (!success) revert FlashLoanFailure();

        // Send the excess to the timelock
        uint256 baseBalance = base.balanceOf(address(this));
        if (baseBalance > 0) {
            base.transfer(msg.sender, baseBalance);
        }
    }

    function onFlashLoan(
        address initiator,
        address token, // The token, not checked as we check the lender address.
        uint256 amount,
        uint256 fee,
        bytes calldata data
    ) external returns (bytes32) {
        // Decode data
        address strategy = address(bytes20(data[0:20]));
        address base = address(bytes20(data[20:40]));
        bytes6 underlyingId = bytes6(data[40:46]);
        
        // Verify that the lender is a trusted contract, and that the flash loan was initiated by this contract
        if (initiator != address(this) || msg.sender != address(ladle.joins(underlyingId))) revert FlashLoanFailure();

        // Now that we trust the lender, we approve the flash loan repayment
        IERC20(token).approve(msg.sender, amount + fee);

        // Buy fyToken
        // Transfer the base tokens to the pool
        IERC20(base).transfer(strategy, amount);
        // Sell base to buy fyToken
        (uint256 soldFyToken, uint256 returnedBase) = IStrategy(strategy).buyFYToken(address(this), address(this));

        // Burn the strategy tokens to get base
        uint256 baseObtained = IStrategy(strategy).burnDivested(address(this));

        return FLASH_LOAN_RETURN;
    }
}
