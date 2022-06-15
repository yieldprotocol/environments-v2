// SPDX-License-Identifier: BUSL-1.1
pragma solidity 0.8.14;
import "erc3156/contracts/interfaces/IERC3156FlashBorrower.sol";
import "erc3156/contracts/interfaces/IERC3156FlashLender.sol";
import "@yield-protocol/vault-interfaces/src/IFYToken.sol";
// import "@yield-protocol/vault-interfaces/src/ILadle.sol";
import "@yield-protocol/yieldspace-tv/src/interfaces/IPool.sol";
// import "@yield-protocol/strategy-v2/contracts/IStrategy.sol";
import "@yield-protocol/utils-v2/contracts/token/MinimalTransferHelper.sol";

interface ILadle {
    function joins(bytes6) external view returns (address);
}

interface IStrategy {
    function baseId() external view returns (bytes6);
    function nextPool() external view returns (IPool);
    function startPool(uint256 minRatio, uint256 maxRatio) external;
    function endPool() external;
}

/* @notice This contract solves the problem of Joins being underfunded to support a strategy roll:
 - Take a flash loan from an ERC3156 server
 - Mint fyToken with the loan, funding the Join
 - Divest the strategy
 - Invest the strategy, hopefully at 0%
 - Sell the fyToken in the market, repaying part of the flash loan
 - Repay the rest of the flash loan with own funds.

 Except during a transaction, this contract SHOULD HOLD NO FUNDS
 
 To run:
  1. Send funds to cover losses to this contract.
  2. On an ERC3156 lender, call `flashLoan(address(this), strategy.base(), flashLoanAmount, abi.encode(strategy))`
*/
contract JoinLoanWand is IERC3156FlashBorrower {
    using MinimalTransferHelper for IERC20;

    ILadle public immutable ladle = ILadle(0x6cB18fF2A33e981D1e38A663Ca056c0a5265066A);

    /**
     * @dev Receive a flash loan and use it to fund a join during a strategy roll.
     * Extra funds to cover market losses should be present in this contract before this call
     * Any remainder will be sent back to the initiator.
     * @param initiator The initiator of the loan.
     * @param token The loan currency.
     * @param amount The amount of tokens lent.
     * @param fee The additional amount of tokens to repay.
     * @param data Arbitrary data structure, intended to contain user-defined parameters.
     * @return The keccak256 hash of "ERC3156FlashBorrower.onFlashLoan"
     */
    function onFlashLoan(
        address initiator,
        address token,
        uint256 amount,
        uint256 fee,
        bytes calldata data
    ) external returns (bytes32) {
        // This contract should hold no funds, and therefore require no identification of the initiator or lender.
        IERC20 token_ = IERC20(token);
        (IStrategy strategy) = abi.decode(data, (IStrategy));

        // Get join from strategy and ladle
        address join = ladle.joins(strategy.baseId());
        require (join != address(0), "Join not found");

        // Get pool from strategy
        IPool pool = strategy.nextPool();
        require (pool != IPool(address(0)), "Pool not ready");

        // Get fyToken from pool
        IFYToken fyToken = pool.fyToken();
        require (fyToken != IFYToken(address(0)), "FYToken not ready");

        token_.safeTransfer(join, amount);                  // Fund the join for the fyToken mint
        fyToken.mintWithUnderlying(address(this), amount);  // Sending the FYToken straight into the pool might mess with the roll
        strategy.endPool();                                 // This drains the join
        strategy.startPool(0, type(uint256).max);           // We skip the slippage check, because we run only on fresh pools
        fyToken.transfer(address(pool), amount);            // Send fyToken to pool for unwind. No need of safeTransfer for fyToken.
        pool.sellFYToken(address(this), 0);                 // Recover what we can, we skip the slippage check, because we run only on fresh pools
        uint256 repayment = amount + fee;
        token_.approve(msg.sender, repayment);              // Safe only because we hold no funds
        token_.safeTransfer(initiator, token_.balanceOf(address(this)) - repayment);  // Whatever is left after repaying the loan, we return it

        return keccak256("ERC3156FlashBorrower.onFlashLoan");
    }
}
