// SPDX-License-Identifier: BUSL-1.1
pragma solidity ^0.8.14;

import "@yield-protocol/utils-v2/contracts/cast/CastU128I128.sol";
import "@yield-protocol/utils-v2/contracts/cast/CastI128U128.sol";
import "@yield-protocol/utils-v2/contracts/cast/CastU256U128.sol";
import "@yield-protocol/utils-v2/contracts/cast/CastU256I256.sol";
import "@yield-protocol/utils-v2/contracts/token/TransferHelper.sol";
import "./interfaces/IEulerMarkets.sol";
import "./interfaces/IEulerEToken.sol";
import "./YieldLeverBase.sol";

/// @title A simple euler lever designed to work for one euler token & its underlying at a time
/// @author iamsahu
/// @notice Working:
///         - Get flash loan of USDC/DAI/WETH
///         - Deposit to get eulerToken
///         - Deposit & borrow against it
///         - Sell the fyToken to get USDC/DAI/WETH
///         - Close the flash loan
contract YieldEulerLever is YieldLeverBase {
    using TransferHelper for IERC20;
    using CastU128I128 for uint128;
    using CastI128U128 for int128;
    using CastU256U128 for uint256;
    using CastU256I256 for uint256;

    /// @notice euler market
    IEulerMarkets public constant eulerMarkets =
        IEulerMarkets(0x3520d5a913427E6F0D6A83E07ccD4A4da316e4d3);
    /// @notice Euler protocol address
    address constant euler = 0x27182842E098f60e3D576794A5bFFb0777E025d3;
    /// @notice Asset underlying the Euler Token
    address immutable baseToken;
    /// @notice Join of the underlying asset
    FlashJoin immutable baseJoin;
    /// @notice Euler token used as collateral
    IEulerEToken immutable eToken;
    /// @notice ilkId of the eToken collateral
    bytes6 immutable ilkId;
    /// @notice Join of the ilk
    address immutable ilkJoin;

    constructor(
        bytes6 ilkId_,
        bytes6 baseId_,
        Giver giver_ // TODO: Go the hardcode way once giver is deployed
    ) YieldLeverBase(giver_) {
        baseToken = cauldron.assets(baseId_);
        baseJoin = FlashJoin(address(ladle.joins(baseId_)));
        // Approve the main euler contract to pull your tokens:
        IERC20(baseToken).approve(euler, type(uint256).max);
        // Approve join for pulling baseToken from lever. Required to repay flash loan
        IERC20(baseToken).approve(address(baseJoin), type(uint256).max);

        ilkId = ilkId_;
        eToken = IEulerEToken(eulerMarkets.underlyingToEToken(baseToken));
        ilkJoin = address(ladle.joins(ilkId));
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
    /// @param seriesId The series to create the vault for.
    /// @param ink The amount of own eToken to supply as collateral.
    /// @param borrow The amount of additional liquidity to borrow.
    /// @param minCollateral The minimum amount of collateral to end up with in
    ///     the vault. If this requirement is not satisfied, the transaction
    ///     will revert.
    // +-------+                                            +-------+                                                  +-------+ +-------------+ +-------+ +-------+
    // | User  |                                            | Lever |                                                  | Join  | | eulerMarket | | Ladle | | Pool  |
    // +-------+                                            +-------+                                                  +-------+ +-------------+ +-------+ +-------+
    //     |                                                    |                                                          |            |            |         |
    //     | invest x amount & borrow y amount                  |                                                          |            |            |         |
    //     |--------------------------------------------------->|                                                          |            |            |         |
    //     |                                                    |                                                          |            |            |         |
    //     | transfer x amount of eToken from user to lever     |                                                          |            |            |         |
    //     |--------------------------------------------------->|                                                          |            |            |         |
    //     |                                                    |                                                          |            |            |         |
    //     |                                                    | Build a vault                                            |            |            |         |
    //     |                                                    |----------------------------------------------------------------------------------->|         |
    //     |                                                    |                                                          |            |            |         |
    //     |                                                    | borrow y amount using flashLoan from underlying join     |            |            |         |
    //     |                                                    |--------------------------------------------------------->|            |            |         |
    //     |                                                    |                                                          |            |            |         |
    //     |                                                    | Deposit y token                                          |            |            |         |
    //     |                                                    |---------------------------------------------------------------------->|            |         |
    //     |                                                    |                                                          |            |            |         |
    //     |                                                    |                                                       Transfer eToken |            |         |
    //     |                                                    |<----------------------------------------------------------------------|            |         |
    //     |                                                    |                                                          |            |            |         |
    //     |                                                    | pour x+y to borrow y fyToken                             |            |            |         |
    //     |                                                    |----------------------------------------------------------------------------------->|         |
    //     |                                                    |                                                          |            |            |         |
    //     |                                                    | sell y to get underlying to payback the flashloan        |            |            |         |
    //     |                                                    |--------------------------------------------------------------------------------------------->|
    //     |                                                    |                                                          |            |            |         |
    //     |                Transfer the vault back to the user |                                                          |            |            |         |
    //     |<---------------------------------------------------|                                                          |            |            |         |
    //     |                                                    |                                                          |            |            |         |
    function invest(
        bytes6 seriesId,
        uint256 ink,
        uint256 borrow,
        uint256 minCollateral
    ) external returns (bytes12 vaultId) {
        // Transfer the tokens from user based on the ilk
        IERC20(address(eToken)).safeTransferFrom(
            msg.sender,
            address(this),
            ink
        );

        // Build vault
        (vaultId, ) = ladle.build(seriesId, ilkId, 0);

        // Encode data of
        // OperationType    1 byte      [0:1]
        // seriesId         6 bytes     [1:7]
        // vaultId          12 bytes    [7:19]
        // ink       32 bytes    [19:51]
        // minCollateral    32 bytes    [51:83]
        bytes memory data = bytes.concat(
            bytes1(uint8(uint256(Operation.BORROW))),
            seriesId,
            vaultId,
            bytes32(ink),
            bytes32(minCollateral)
        );

        bool success = baseJoin.flashLoan(
            this, // Loan Receiver
            baseToken, // Loan Token
            borrow, // Loan Amount
            data
        );

        if (!success) revert FlashLoanFailure();
        giver.give(vaultId, msg.sender);
    }

    /// @notice Called by a flash lender, which will be the join of the asset underlying the eToken
    ///     The primary purpose is to check conditions
    ///     and route to the correct internal function.
    ///
    ///     This function reverts if not called through a flashloan initiated
    ///     by this contract.
    /// @dev We are not checking the originator of the call to this function as the lever doesn't keep any vaults between transactions.
    ///      If someone would call onFlashLoan with malicious data, there would be no vault that they could do anything to anyway.
    /// @param borrowAmount The amount of fyTokens received.
    /// @param fee The fee that is subtracted in addition to the borrowed
    ///     amount when repaying.
    /// @param data The data we encoded for the functions. Here, we only check
    ///     the first byte for the router.
    function onFlashLoan(
        address,
        address,
        uint256 borrowAmount,
        uint256 fee,
        bytes calldata data
    ) external override returns (bytes32) {
        Operation status = Operation(uint256(uint8(data[0])));
        bytes6 seriesId = bytes6(data[1:7]);
        bytes12 vaultId = bytes12(data[7:19]);

        // Decode the operation to execute and then call that function.
        if (status == Operation.BORROW) {
            uint256 baseAmount = uint256(bytes32(data[19:51]));
            uint256 minCollateral = uint256(bytes32(data[51:83]));
            borrow(
                vaultId,
                ladle.pools(seriesId),
                borrowAmount,
                fee,
                baseAmount,
                minCollateral
            );
        } else if (status == Operation.REPAY) {
            uint256 ink = uint256(bytes32(data[19:51]));
            uint256 art = uint256(bytes32(data[51:83]));
            repay(
                vaultId,
                ladle.pools(seriesId),
                uint256(borrowAmount + fee),
                ink,
                art
            );
        } else if (status == Operation.CLOSE) {
            uint256 ink = uint256(bytes32(data[19:51]));
            uint256 art = uint256(bytes32(data[51:83]));

            close(vaultId, ink, art);
        }

        return FLASH_LOAN_RETURN;
    }

    /// @notice This function is called from within the flash loan. The high
    ///     level functionality is as follows:
    ///         - We have supplied and borrowed underlying asset.
    ///         - We deposit it to euler and put the etoken received in the vault.
    ///         - Against it, we borrow enough fyToken to sell & repay the flash loan.
    /// @param poolAddress The pool (and thereby series) to borrow from.
    /// @param vaultId The vault id to put collateral into and borrow from.
    /// @param borrow The amount of underlying asset borrowed in the flash loan.
    /// @param fee The fee that will be issued by the flash loan.
    /// @param ink The amount of own collateral to supply.
    /// @param minCollateral The final amount of collateral to end up with, or
    ///     the function will revert. Used to prevent slippage.
    function borrow(
        bytes12 vaultId,
        address poolAddress,
        uint256 borrow,
        uint256 fee,
        uint256 ink,
        uint256 minCollateral
    ) internal {
        // Deposit to get Euler token in return which would be used to payback flashloan
        eToken.deposit(0, borrow - fee);

        uint256 eBalance = IERC20(address(eToken)).balanceOf(address(this));

        IERC20(address(eToken)).transfer(ilkJoin, eBalance);

        _pourAndSell(vaultId, poolAddress, eBalance, borrow);
    }

    /// @dev Additional function to get over stack too deep
    /// @param vaultId VaultId
    /// @param poolAddress Address of the pool to trade on
    /// @param ink Amount of collateral
    /// @param borrow Amount being borrowed
    function _pourAndSell(
        bytes12 vaultId,
        address poolAddress,
        uint256 ink,
        uint256 borrow
    ) internal {
        IPool pool = IPool(poolAddress);
        uint128 fyBorrow = pool.buyBasePreview(borrow.u128());
        ladle.pour(vaultId, address(pool), ink.u128().i128(), fyBorrow.i128());
        pool.buyBase(address(this), borrow.u128(), fyBorrow);
    }

    /// @notice divest a position.
    ///
    ///     If pre maturity, borrow liquidity tokens to repay `art` debt and
    ///     take `ink` collateral.
    ///
    ///     If post maturity, borrow USDC/DAI/ETH to pay off the debt directly.
    ///
    ///     This function will take the vault from the user, using `Giver`, so make
    ///     sure you have given it permission to do that.
    /// @param seriesId The seriesId corresponding to the vault.
    /// @param vaultId The vault to use.
    /// @param ink The amount of collateral to recover.
    /// @param art The debt to repay.
    /// @dev It is more gas efficient to let the user supply the `seriesId`,
    ///     but it should match the pool.
    function divest(
        bytes6 seriesId,
        bytes12 vaultId,
        uint256 ink,
        uint256 art
    ) external {
        // Test that the caller is the owner of the vault.
        // This is important as we will take the vault from the user.
        require(cauldron.vaults(vaultId).owner == msg.sender);

        // Give the vault to the contract
        giver.seize(vaultId, address(this));

        // Check if we're pre or post maturity.
        if (uint32(block.timestamp) < cauldron.series(seriesId).maturity) {
            IFYToken fyToken = IPool(ladle.pools(seriesId)).fyToken();
            // Close:
            // Series is not past maturity.
            // Borrow to repay debt, move directly to the pool.
            bytes memory data = bytes.concat(
                bytes1(bytes1(uint8(uint256(Operation.REPAY)))), // [0:1]
                seriesId, // [1:7]
                vaultId, // [7:19]
                bytes32(ink), // [19:51]
                bytes32(art) // [51:83]
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
            // Series is past maturity.
            // Borrow to repay debt, move directly to the pool.
            bytes memory data = bytes.concat(
                bytes1(bytes1(uint8(uint256(Operation.CLOSE)))), // [0:1]
                seriesId, // [1:7]
                vaultId, // [7:19]
                bytes32(ink), // [19:51]
                bytes32(art) // [51:83]
            );

            bool success = baseJoin.flashLoan(
                this, // Loan Receiver
                baseToken, // Loan Token
                art, // Loan Amount
                data
            );

            if (!success) revert FlashLoanFailure();
            uint256 balance = IERC20(baseToken).balanceOf(address(this));

            if (balance > 0)
                IERC20(baseToken).safeTransfer(msg.sender, balance);
        }

        // Give the vault back to the sender, just in case there is anything left
        giver.give(vaultId, msg.sender);
    }

    /// @param vaultId The vault to repay.
    /// @param poolAddress The address of the pool.
    /// @param borrowPlusFee The amount of fyToken that we have borrowed,
    ///     plus the fee. This should be our final balance.
    /// @param ink The amount of collateral to retake.
    /// @param art The debt to repay.
    ///     slippage.
    function repay(
        bytes12 vaultId,
        address poolAddress,
        uint256 borrowPlusFee, // Amount of FYToken received
        uint256 ink,
        uint256 art
    ) internal {
        // Repay the vault, get collateral back.
        ladle.pour(
            vaultId,
            address(this),
            -ink.u128().i128(),
            -art.u128().i128()
        );

        eToken.withdraw(0, type(uint256).max);

        IPool pool = IPool(poolAddress);
        // buyFyToken
        uint128 tokensTransferred = pool.buyFYTokenPreview(
            borrowPlusFee.u128()
        );

        IERC20(baseToken).safeTransfer(poolAddress, tokensTransferred);

        pool.buyFYToken(address(this), borrowPlusFee.u128(), tokensTransferred);
    }

    /// @notice Close a vault after maturity.
    /// @param vaultId The ID of the vault to close.
    /// @param ink The collateral to take from the vault.
    /// @param art The debt to repay. This is denominated in fyTokens, even
    ///     though the payment is done in terms of underlying.
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

        eToken.withdraw(0, type(uint256).max);
    }
}
