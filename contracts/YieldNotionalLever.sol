// SPDX-License-Identifier: MIT
pragma solidity ^0.8.14;

import "@yield-protocol/utils-v2/contracts/cast/CastU128I128.sol";
import "@yield-protocol/utils-v2/contracts/cast/CastI128U128.sol";
import "@yield-protocol/utils-v2/contracts/cast/CastU256U128.sol";
import "@yield-protocol/utils-v2/contracts/cast/CastU256I256.sol";
import "./YieldLeverBase.sol";
import "./NotionalTypes.sol";
import "@yield-protocol/vault-v2/contracts/other/notional/ERC1155.sol";

contract YieldNotionalLever is YieldLeverBase, ERC1155TokenReceiver {
    using TransferHelper for IERC20;
    using TransferHelper for IFYToken;
    using CastU128I128 for uint128;
    using CastI128U128 for int128;
    using CastU256U128 for uint256;
    using CastU256I256 for uint256;
    Notional constant notional =
        Notional(0x1344A36A1B56144C3Bc62E7757377D288fDE0369);

    struct IlkInfo {
        FlashJoin join;
        uint40 maturity;
        uint16 currencyId;
    }

    mapping(bytes6 => IlkInfo) public ilkInfo;

    constructor(Giver giver_) YieldLeverBase(giver_) {
        notional.setApprovalForAll(address(ladle), true);
        notional.setApprovalForAll(
            0x0Bfd3B8570A4247157c5468861d37dA55AAb9B4b,
            true
        ); // Approving the Join

        notional.setApprovalForAll(
            0x399bA81A1f1Ed0221c39179C50d4d4Bc85C3F3Ab,
            true
        ); // Approving the join
    }

    // TODO: Make it auth controlled when deploying
    function setIlkInfo(bytes6 ilkId, IlkInfo calldata underlying) external {
        IERC20 token = IERC20(underlying.join.asset());
        token.approve(address(underlying.join), type(uint256).max);
        token.approve(address(notional), type(uint256).max);
        ilkInfo[ilkId] = underlying;
    }

    // TODO: Make it auth controlled when deploying
    function approveJoin(address joinAddress) external {
        notional.setApprovalForAll(joinAddress, true);
    }

    /// @notice Approve maximally for an fyToken.
    /// @param seriesId The id of the pool to approve to.
    function approveFyToken(bytes6 seriesId) external {
        IPool(ladle.pools(seriesId)).fyToken().approve(
            address(ladle),
            type(uint256).max
        );
    }

    /// @notice Invest by creating a levered vault.
    ///
    ///     We invest `USDC` or `DAI`. For this the user should have given approval
    ///     first. We borrow `borrowAmount` extra. We use it to deposit in notional and get fCash, which we use as collateral.
    /// @param baseAmount The amount of own liquidity to supply.
    /// @param borrowAmount The amount of additional liquidity to borrow.
    /// @param seriesId The series to create the vault for.
    function invest(
        bytes6 seriesId,
        bytes6 ilkId,
        uint256 baseAmount,
        uint256 borrowAmount
    ) external returns (bytes12 vaultId) {
        (vaultId, ) = ladle.build(seriesId, ilkId, 0);
        // Since we know the sizes exactly, packing values in this way is more
        // efficient than using `abi.encode`.
        //
        // Encode data of
        // OperationType    1 byte      [0:1]
        // seriesId         6 bytes     [1:7]
        // ilkId            6 bytes     [7:13]
        // vaultId          12 bytes    [13:25]
        // baseAmount       16 bytes    [25:41]
        bytes memory data = bytes.concat(
            bytes1(uint8(uint256(Operation.BORROW))),
            seriesId,
            ilkId,
            vaultId,
            bytes32(baseAmount)
        );

        bool success;
        IlkInfo memory info = ilkInfo[ilkId];
        IERC20 token = IERC20(info.join.asset());
        token.safeTransferFrom(msg.sender, address(this), baseAmount);
        success = info.join.flashLoan(this, address(token), borrowAmount, data);
        if (!success) revert FlashLoanFailure();
        giver.give(vaultId, msg.sender);
        // The leftover assets originated in the join, so just deposit them back
        uint256 balance = token.balanceOf(address(this));
        token.safeTransfer(address(info.join), balance);
    }

    /// @notice Called by a flash lender, which can be `usdcJoin` or
    ///     `daiJoin` or 'fyToken`. The primary purpose is to check conditions
    ///     and route to the correct internal function.
    ///
    ///     This function reverts if not called through a flashloan initiated
    ///     by this contract.
    /// @param initiator The initator of the flash loan, must be `address(this)`.
    /// @param borrowAmount The amount of fyTokens received.
    /// @param fee The fee that is subtracted in addition to the borrowed
    ///     amount when repaying.
    /// @param data The data we encoded for the functions. Here, we only check
    ///     the first byte for the router.
    function onFlashLoan(
        address initiator,
        address, // The token, not checked as we check the lender address.
        uint256 borrowAmount,
        uint256 fee,
        bytes calldata data
    ) external override returns (bytes32) {
        // For security, we need to check two things: 1. that the lender is
        // trusted and 2. that they supplied our address as the initiator.

        Operation status = Operation(uint256(uint8(data[0])));
        bytes6 seriesId = bytes6(data[1:7]);
        // 2. If we trust the lender, we can check that the initiator is correct
        if (initiator != address(this)) revert FlashLoanFailure();

        // Decode the operation to execute and then call that function.
        if (status == Operation.BORROW) {
            bytes6 ilkId = bytes6(data[7:13]);
            // 1. Check the caller
            require(msg.sender == address(ilkInfo[ilkId].join));

            bytes12 vaultId = bytes12(data[13:25]);
            uint256 baseAmount = uint256(bytes32(data[25:57]));
            borrow(vaultId, seriesId, ilkId, borrowAmount, fee, baseAmount);
        } else if (status == Operation.REPAY) {
            // 1. Check the caller
            IFYToken fyToken = IPool(ladle.pools(seriesId)).fyToken();
            require(msg.sender == address(fyToken));

            bytes6 ilkId = bytes6(data[7:13]);
            bytes12 vaultId = bytes12(data[13:25]);
            repay(vaultId, seriesId, ilkId, borrowAmount + fee, data);
        } else if (status == Operation.CLOSE) {
            bytes12 vaultId = bytes12(data[7:19]);
            uint256 ink = uint256(bytes32(data[19:51]));
            uint256 art = uint256(bytes32(data[51:83]));
            bytes6 ilkId = bytes6(data[83:89]);
            // 1. Check the caller
            require(msg.sender == address(ilkInfo[ilkId].join));

            close(vaultId, ink, art);
        }
        return FLASH_LOAN_RETURN;
    }

    /// @notice This function is called from within the flash loan. The high
    ///     level functionality is as follows:
    ///         - We have supplied 'dai' or 'usdc'.
    ///         - We deposit it to get fCash and put it in the vault.
    ///         - Against it, we borrow enough fyDai or fyUSDC to repay the flash loan.
    /// @param vaultId The vault id to put collateral into and borrow from.
    /// @param seriesId The pool (and thereby series) to borrow from.
    /// @param ilkId Id of the Ilk
    /// @param borrowAmount The amount of DAI/USDC borrowed in the flash loan.
    /// @param fee The fee that will be issued by the flash loan.
    /// @param baseAmount The amount of own collateral to supply.
    function borrow(
        bytes12 vaultId,
        bytes6 seriesId,
        bytes6 ilkId,
        uint256 borrowAmount,
        uint256 fee,
        uint256 baseAmount
    ) internal {
        // Reuse variable to denote how much to invest. Done to prevent stack
        // too deep error while being gas efficient.
        baseAmount += (borrowAmount - fee);
        uint88 fCashAmount;
        bytes32 encodedTrade;
        {
            IlkInfo memory ilkIdInfo = ilkInfo[ilkId];
            // Deposit into notional to get the fCash
            (fCashAmount, , encodedTrade) = notional.getfCashLendFromDeposit(
                ilkIdInfo.currencyId,
                baseAmount, // total to invest
                ilkIdInfo.maturity,
                0,
                block.timestamp,
                true
            );

            BalanceActionWithTrades[]
                memory actions = new BalanceActionWithTrades[](1);
            actions[0] = BalanceActionWithTrades({
                actionType: DepositActionType.DepositUnderlying, // Deposit underlying, not cToken
                currencyId: ilkIdInfo.currencyId,
                depositActionAmount: baseAmount, // total to invest
                withdrawAmountInternalPrecision: 0,
                withdrawEntireCashBalance: false, // Return all residual cash to lender
                redeemToUnderlying: false, // Convert cToken to token
                trades: new bytes32[](1)
            });
            actions[0].trades[0] = encodedTrade;
            notional.batchBalanceAndTradeAction(address(this), actions);
        }

        IPool pool = IPool(ladle.pools(seriesId));
        uint128 maxFyOut = pool.buyBasePreview(borrowAmount.u128());
        ladle.pour(
            vaultId,
            address(pool),
            (uint128(fCashAmount)).i128(),
            (maxFyOut).i128()
        );
        pool.buyBase(address(this), borrowAmount.u128(), maxFyOut);
    }

    /// @notice Unwind a position.
    ///
    ///     If pre maturity, borrow liquidity tokens to repay `art` debt and
    ///     take `ink` collateral.
    ///
    ///     If post maturity, borrow USDC/DAI to pay off the debt directly.
    ///
    ///     This function will take the vault from you using `Giver`, so make
    ///     sure you have given it permission to do that.
    /// @param vaultId The vault to use.
    /// @param seriesId The seriesId corresponding to the vault.
    /// @param ilkId Id of the Ilk
    /// @param ink The amount of collateral to recover.
    /// @param art The debt to repay.
    /// @param minOut The minimum amount of token to get out of the contract.
    /// @dev It is more gas efficient to let the user supply the `seriesId`,
    ///     but it should match the pool.
    function divest(
        bytes12 vaultId,
        bytes6 seriesId,
        bytes6 ilkId,
        uint256 ink,
        uint256 art,
        uint256 minOut
    ) external {
        // Test that the caller is the owner of the vault.
        // This is important as we will take the vault from the user.
        require(cauldron.vaults(vaultId).owner == msg.sender);

        // Give the vault to the contract
        giver.seize(vaultId, address(this));

        // Check if we're pre or post maturity.
        if (uint32(block.timestamp) < cauldron.series(seriesId).maturity) {
            IPool pool = IPool(ladle.pools(seriesId));
            IFYToken fyToken = pool.fyToken();
            // Close:
            // Series is not past maturity.
            // Borrow to repay debt, move directly to the pool.
            bytes memory data = bytes.concat(
                bytes1(bytes1(uint8(uint256(Operation.REPAY)))), // [0:1]
                seriesId, // [1:7]
                ilkId, // [7:13]
                vaultId, // [13:25]
                bytes32(ink), // [25:57]
                bytes32(art), // [57:89]
                bytes32(minOut), // [89:121]
                bytes20(msg.sender) // [121:141]
            );
            bool success = IERC3156FlashLender(address(fyToken)).flashLoan(
                this, // Loan Receiver
                address(fyToken), // Loan Token
                art, // Loan Amount: borrow exactly the debt to repay.
                data
            );
            if (!success) revert FlashLoanFailure();

            // We have borrowed exactly enough for the debt and bought back
            // exactly enough for the loan + fee, so there is no balance of
            // FYToken left. Check:
            require(IERC20(address(fyToken)).balanceOf(address(this)) == 0);
        } else {
            // Close:
            // Series is not past maturity.
            // Borrow to repay debt, move directly to the pool.
            bytes memory data = bytes.concat(
                bytes1(bytes1(uint8(uint256(Operation.CLOSE)))), // [0:1]
                seriesId, // [1:7]
                vaultId, // [7:19]
                bytes32(ink), // [19:51]
                bytes32(art), // [51:83]
                ilkId // [83:89]
            );
            bool success;
            IlkInfo memory info = ilkInfo[ilkId];
            IERC20 token = IERC20(info.join.asset());
            success = info.join.flashLoan(
                this, // Loan Receiver
                address(token), // Loan Token
                art, // Loan Amount: borrow exactly the debt to repay.
                data
            );
            if (!success) revert FlashLoanFailure();
            uint256 balance = token.balanceOf(address(this));
            token.safeTransfer(msg.sender, balance);
        }
        // Give the vault back to the sender, just in case there is anything left
        giver.give(vaultId, msg.sender);
    }

    /// @param vaultId The vault to repay.
    /// @param seriesId The seriesId corresponding to the vault.
    /// @param ilkId Id of the Ilk
    /// @param borrowPlusFee The amount of fyDai/fyUsdc that we have borrowed,
    ///     plus the fee. This should be our final balance.
    function repay(
        bytes12 vaultId,
        bytes6 seriesId,
        bytes6 ilkId,
        uint256 borrowPlusFee, // Amount of FYToken received
        bytes calldata data
    ) internal {
        // Repay the vault, get collateral back.
        IlkInfo memory ilkIdInfo = ilkInfo[ilkId];
        {
            uint256 ink = uint256(bytes32(data[25:57]));
            uint256 art = uint256(bytes32(data[57:89]));
            ladle.pour(
                vaultId,
                address(this),
                -ink.u128().i128(),
                -art.u128().i128()
            );
            {
                // Trade fCash to receive USDC/DAI
                BalanceActionWithTrades[]
                    memory actions = new BalanceActionWithTrades[](1);
                actions[0] = BalanceActionWithTrades({
                    actionType: DepositActionType.None,
                    currencyId: ilkIdInfo.currencyId,
                    depositActionAmount: 0,
                    withdrawAmountInternalPrecision: 0,
                    withdrawEntireCashBalance: true,
                    redeemToUnderlying: true,
                    trades: new bytes32[](1)
                });

                (, , , bytes32 encodedTrade) = notional
                    .getPrincipalFromfCashBorrow(
                        ilkIdInfo.currencyId,
                        ink,
                        ilkIdInfo.maturity,
                        0,
                        block.timestamp
                    );

                actions[0].trades[0] = encodedTrade;
                notional.batchBalanceAndTradeAction(address(this), actions);
            }
        }

        // buyFyToken
        IPool pool = IPool(ladle.pools(seriesId));
        uint128 tokenToTran = pool.buyFYTokenPreview(borrowPlusFee.u128());
        IERC20 token = IERC20(ilkIdInfo.join.asset());
        token.safeTransfer(address(pool), tokenToTran);
        pool.buyFYToken(address(this), borrowPlusFee.u128(), tokenToTran);

        uint256 minOut = uint256(bytes32(data[89:121]));
        address borrower = address(bytes20(data[121:141]));
        uint256 balance = token.balanceOf(address(this));
        require(balance >= minOut, "balance is not minout");

        token.safeTransfer(borrower, balance);
    }

    /// @notice Close a vault after maturity.
    /// @param vaultId The ID of the vault to close.
    /// @param ink The collateral to take from the vault.
    /// @param art The debt to repay. This is denominated in fyTokens, even
    ///     though the payment is done in terms of WEth.
    function close(
        bytes12 vaultId,
        uint256 ink,
        uint256 art
    ) internal {
        ladle.close(
            vaultId,
            address(this),
            -ink.u128().i128(),
            -art.u128().i128()
        );
    }

    /// @dev Called by the sender after a transfer to verify it was received. Ensures only `id` tokens are received.
    function onERC1155Received(
        address,
        address,
        uint256, // _id,
        uint256,
        bytes calldata
    ) external pure override returns (bytes4) {
        return ERC1155TokenReceiver.onERC1155Received.selector;
    }

    /// @dev Called by the sender after a batch transfer to verify it was received. Ensures only `id` tokens are received.
    function onERC1155BatchReceived(
        address,
        address,
        uint256[] calldata, // _ids,
        uint256[] calldata,
        bytes calldata
    ) external pure override returns (bytes4) {
        return ERC1155TokenReceiver.onERC1155BatchReceived.selector;
    }
}
