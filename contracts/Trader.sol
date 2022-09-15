// SPDX-License-Identifier: BUSL-1.1
pragma solidity >=0.8.15;
import "erc3156/contracts/interfaces/IERC3156FlashBorrower.sol";
import "erc3156/contracts/interfaces/IERC3156FlashLender.sol";
import "@yield-protocol/yieldspace-tv/src/interfaces/IMaturingToken.sol";
import "@yield-protocol/vault-v2/contracts/interfaces/IFYToken.sol";
import "@yield-protocol/yieldspace-tv/src/interfaces/IPool.sol";
import "@yield-protocol/utils-v2/contracts/token/MinimalTransferHelper.sol";


contract Trader is IERC3156FlashBorrower {
    using MinimalTransferHelper for IERC20;

    /**
     * @dev Execute a flash loan and with it, mint fyToken and sell them to a pool
     * @param pool Pool to trade with
     * @param loan Amount that will be flash borrowed, converted into fyToken, and sold to the pool
     * @param lender ERC3156 flash lender
     * @param remainder Receiver of any funds remaining in this contract after the roll
     */
    function sellFYToken(IPool pool, uint256 loan, IERC3156FlashLender lender, address remainder) external {
        IERC20 base = pool.base();

        // Enter the loan
        lender.flashLoan(IERC3156FlashBorrower(address(this)), address(base), loan, abi.encode(pool));

        // Whatever is left after repaying the loan, we return it
        base.safeTransfer(remainder, base.balanceOf(address(this)));
    }

    /**
     * @dev Receive a flash loan and use it mint fyToken and sell it to a pool.
     * Extra funds to cover loan fees and market losses should be present in this contract before this call
     * @param token The loan currency.
     * @param amount The amount of tokens lent.
     * @return The keccak256 hash of "ERC3156FlashBorrower.onFlashLoan"
     */
    function onFlashLoan(
        address,
        address token,
        uint256 amount,
        uint256,
        bytes memory data
    ) external returns (bytes32) {
        IPool pool = abi.decode(data, (IPool));
        IFYToken fyToken = IFYToken(address(pool.fyToken()));
        IERC20 base = pool.base();
        require(address(base) == token, "Mismatched pool");

        // Get join from fyToken
        IJoin join = fyToken.join();

        // Approve the lender to take any funds
        IERC20(token).approve(msg.sender, type(uint256).max);

        // We mint fyToken at 1:1
        base.safeTransfer(address(join), amount);
        fyToken.mintWithUnderlying(address(pool), amount);

        // We sell the fyToken to repay the flash loan
        pool.sellFYToken(address(this), 0);

        return keccak256("ERC3156FlashBorrower.onFlashLoan");
    }
}
