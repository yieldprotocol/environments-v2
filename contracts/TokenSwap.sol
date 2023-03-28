// SPDX-License-Identifier: BUSL-1.1
pragma solidity >=0.8.15;
import "@yield-protocol/utils-v2/src/token/TransferHelper.sol";
import "@yield-protocol/utils-v2/src/access/AccessControl.sol";


library Cast {
    function u96(uint256 x) internal pure returns (uint96 y) {
        require((y = uint96(x)) == x, "Cast: value doesn't fit in 96 bits");
    }
}

/// @dev TokenSwap is a contract that can be used swap tokens at a fixed rate, with
/// the aim of completely replacing the supply of a token by the funds supplied to
/// this contract. It is meant to be used as a token upgrade, when other mechanisms fail.
contract TokenSwap is AccessControl() {
    using Cast for uint256;
    using TransferHelper for IERC20;

    event Registered(IERC20 indexed tokenIn, IERC20 indexed tokenOut, uint256 tokenInBalance, uint256 tokenOutBalance, uint96 ratio);
    event Unregistered(IERC20 indexed tokenIn, IERC20 indexed tokenOut, uint256 tokenInBalance, uint256 tokenOutBalance);
    event Swapped(IERC20 indexed tokenIn, IERC20 indexed tokenOut, uint256 tokenInBalance, uint256 tokenOutBalance);
    event Extracted(IERC20 indexed tokenIn, uint256 tokenInBalance);
    event Recovered(IERC20 indexed token, uint256 recovered);

    struct TokenIn {
        IERC20 reverse;
        uint96 ratio;
        uint256 balance;
    }

    struct TokenOut {
        IERC20 reverse;
        uint256 balance;     
    }

    mapping (IERC20 => TokenIn) public tokensIn;
    mapping (IERC20 => TokenOut) public tokensOut;

    /// @dev Register a token to be replaced, and the token to replace it with.
    /// The ratio is calculated as the funds of the replacement token divided by the supply of the token to be replaced.
    /// The tokens used as a replacement must have been sent to the contract before this call.
    /// @param tokenIn_ The token to be replaced
    /// @param tokenOut_ The token to replace it with
    function register(IERC20 tokenIn_, IERC20 tokenOut_) external auth {
        require(address(tokenIn_) != address(tokenOut_), "TokenSwap: Cannot replace a tokenIn with itself");
        require(address(tokensIn[tokenIn_].reverse) == address(0), "TokenSwap: TokenIn already registered");
        require(address(tokensOut[tokenOut_].reverse) == address(0), "TokenSwap: TokenOut already registered");

        uint96 ratio = (tokenOut_.balanceOf(address(this)) * 1e18 / tokenIn_.totalSupply()).u96();
        uint256 tokenInBalance = tokenIn_.balanceOf(address(this));
        uint256 tokenOutBalance = tokenOut_.balanceOf(address(this));
        tokensIn[tokenIn_] = TokenIn(
            tokenOut_, 
            ratio,
            tokenInBalance
        );
        tokensOut[tokenOut_] = TokenOut(
            tokenIn_,
            tokenOutBalance
        );

        emit Registered(tokenIn_, tokenOut_, tokenInBalance, tokenOutBalance, ratio);
    }

    /// @dev Unregister a token to be replaced, and the token to replace it with. Send all related tokens to a given address.
    /// @param tokenIn_ The token to be replaced
    /// @param to The address to send all tokens to
    function unregister(IERC20 tokenIn_, address to) external auth {
        TokenIn memory tokenIn = tokensIn[tokenIn_];
        require(address(tokenIn.reverse) != address(0), "TokenSwap: TokenIn not registered");
        IERC20 tokenOut_ = tokenIn.reverse;

        delete tokensIn[tokenIn_];
        delete tokensOut[tokenOut_];

        // We send all related funds to the given address to make sure it's a clean sweep, not just the tracked balances.
        uint256 tokenInBalance = tokenIn_.balanceOf(address(this));
        uint256 tokenOutBalance = tokenOut_.balanceOf(address(this));
        tokenIn_.safeTransfer(to, tokenInBalance);
        tokenOut_.safeTransfer(to, tokenOutBalance);

        emit Unregistered(tokenIn_, tokenOut_, tokenInBalance, tokenOutBalance);
    }

    /// @dev Extract tokens replaced by this contract.
    /// @param tokenIn_ The token to be replaced
    /// @param to The address to send the tokens to
    function extract(IERC20 tokenIn_, address to) external auth {
        TokenIn memory tokenIn = tokensIn[tokenIn_];
        require(address(tokenIn.reverse) != address(0), "TokenSwap: TokenIn not registered");

        tokensIn[tokenIn_].balance = 0;
        tokenIn_.safeTransfer(to, tokenIn.balance);

        emit Extracted(tokenIn_, tokenIn.balance);
    }

    /// @dev Recover tokens deposited to the contract by mistake
    /// Be careful, the address passed on as a token is not verified to be a valid ERC20 token.
    /// @param token The token to be recovered
    /// @param to The address to send the tokens to
    function recover(IERC20 token, address to) external auth {
        require(address(tokensIn[token].reverse) == address(0), "TokenSwap: TokenIn registered");
        require(address(tokensOut[token].reverse) == address(0), "TokenSwap: TokenOut registered");
        uint256 recovered = token.balanceOf(address(this));
        token.safeTransfer(to, token.balanceOf(address(this)));

        emit Recovered(token, recovered);
    }

    /// @dev Swap a token for its replacement, at the registered ratio. The tokens must have been sent to the contract before this call.
    /// @param tokenIn_ The token to be replaced
    function swap(IERC20 tokenIn_, address to) external {
        TokenIn memory tokenIn = tokensIn[tokenIn_];
        require(address(tokenIn.reverse) != address(0), "TokenSwap: TokenIn not registered");
        IERC20 tokenOut_ = tokenIn.reverse;

        uint256 tokenInAmount = tokenIn_.balanceOf(address(this)) - tokenIn.balance;
        uint256 tokenOutAmount = tokenInAmount * tokenIn.ratio / 1e18;
        tokensIn[tokenIn_].balance += tokenInAmount;
        tokensOut[tokenOut_].balance -= tokenOutAmount;
        
        tokenOut_.safeTransfer(to, tokenOutAmount);

        emit Swapped(tokenIn_, tokenOut_, tokenInAmount, tokenOutAmount);
    }
}
