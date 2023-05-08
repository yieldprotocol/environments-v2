// SPDX-License-Identifier: BUSL-1.1
pragma solidity >=0.8.15;
import '@yield-protocol/utils-v2/src/access/AccessControl.sol';
import '@yield-protocol/vault-v2/src/interfaces/ILadle.sol';
import '@yield-protocol/vault-v2/src/interfaces/IFYToken.sol';
import '@yield-protocol/vault-v2/src/FlashJoin.sol';
import '@yield-protocol/yieldspace-tv/src/interfaces/IPool.sol';
import '@yield-protocol/yieldspace-tv/src/interfaces/IMaturingToken.sol';
import 'erc3156/contracts/interfaces/IERC3156FlashBorrower.sol';
import '@yield-protocol/utils-v2/src/token/TransferHelper.sol';
error FlashLoanFailure();

contract EulerHackRestoration is AccessControl, IERC3156FlashBorrower {
    using TransferHelper for IERC20;
    using TransferHelper for IFYToken;
    using Cast for uint;

    /// @notice By IERC3156, the flash loan should return this constant.
    bytes32 public constant FLASH_LOAN_RETURN = keccak256('ERC3156FlashBorrower.onFlashLoan');

    ILadle ladle;

    constructor(ILadle _ladle) {
        ladle = _ladle;
    }

    function restore(bytes6 seriesId, address receiver, uint amount) external auth {
        IPool pool = IPool(ladle.pools(seriesId));
        IFYToken fyToken = IFYToken(address(pool.fyToken()));
        FlashJoin join = FlashJoin(address(ladle.joins(fyToken.underlyingId())));
        bytes memory data = bytes.concat(
            abi.encode(address(pool)),
            abi.encode(address(fyToken)),
            abi.encode(address(join)),
            abi.encode(receiver)
        );

        join.flashLoan(this, join.asset(), amount, data);
    }

    function onFlashLoan(
        address initiator,
        address token,
        uint256 amount,
        uint256 fee,
        bytes calldata data
    ) external returns (bytes32) {
        (address pool, address fyToken, address join, address receiver) = abi.decode(
            data,
            (address, address, address, address)
        );

        if (initiator != address(this) || msg.sender != join) revert FlashLoanFailure();
        // Now that we trust the lender, we approve the flash loan repayment
        IERC20(token).safeApprove(msg.sender, amount + fee);

        // Transfer the tokens to the pool, mint fyTokens, and buyBase
        IERC20(token).safeTransfer(pool, amount);
        IPool(pool).mint(receiver, address(this), 0, type(uint256).max);
        uint128 fyTokenAmount = IPool(pool).buyBasePreview(amount.u128());
        IFYToken(fyToken).mint(pool, fyTokenAmount);
        IPool(pool).buyBase(address(this), amount.u128(), fyTokenAmount);

        return FLASH_LOAN_RETURN;
    }
}
