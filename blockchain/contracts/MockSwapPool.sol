// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

/**
 * @title MockSwapPool
 * @notice Minimal constant-product AMM (x*y=k, 0.3% fee) for two ERC20 tokens.
 *         Lets the MantleMandate AI agent execute real on-chain swaps on
 *         Mantle Sepolia Testnet without depending on a mainnet-only DEX
 *         (Merchant Moe / Agni Finance have no Sepolia deployment).
 *
 * Deployed on Mantle Sepolia Testnet (chainId 5003).
 */
contract MockSwapPool {
    using SafeERC20 for IERC20;

    IERC20 public immutable tokenA;
    IERC20 public immutable tokenB;

    uint256 public reserveA;
    uint256 public reserveB;

    uint256 private constant FEE_NUM = 997;
    uint256 private constant FEE_DEN = 1000;

    event LiquidityAdded(uint256 amountA, uint256 amountB);
    event Swap(address indexed sender, address tokenIn, uint256 amountIn, address tokenOut, uint256 amountOut);

    constructor(address tokenA_, address tokenB_) {
        require(tokenA_ != address(0) && tokenB_ != address(0), "MockSwapPool: zero address");
        require(tokenA_ != tokenB_, "MockSwapPool: identical tokens");
        tokenA = IERC20(tokenA_);
        tokenB = IERC20(tokenB_);
    }

    /// @notice Seed initial reserves. Caller must approve both tokens beforehand. Anyone may top up.
    function addLiquidity(uint256 amountA, uint256 amountB) external {
        require(amountA > 0 && amountB > 0, "MockSwapPool: zero amount");
        tokenA.safeTransferFrom(msg.sender, address(this), amountA);
        tokenB.safeTransferFrom(msg.sender, address(this), amountB);
        reserveA += amountA;
        reserveB += amountB;
        emit LiquidityAdded(amountA, amountB);
    }

    /// @notice Quote the output amount for a given input, before fees are applied to reserves.
    function getAmountOut(address tokenIn, uint256 amountIn) public view returns (uint256 amountOut) {
        require(amountIn > 0, "MockSwapPool: zero amount in");
        (uint256 reserveIn, uint256 reserveOut) = _reservesFor(tokenIn);
        require(reserveIn > 0 && reserveOut > 0, "MockSwapPool: no liquidity");

        uint256 amountInWithFee = amountIn * FEE_NUM;
        amountOut = (amountInWithFee * reserveOut) / (reserveIn * FEE_DEN + amountInWithFee);
    }

    /**
     * @notice Swap an exact amount of `tokenIn` (must be tokenA or tokenB) for the other token.
     * @param tokenIn        Address of the input token.
     * @param amountIn       Exact amount of `tokenIn` to swap.
     * @param minAmountOut   Minimum acceptable output (slippage protection).
     * @return amountOut     Actual amount of the other token sent to the caller.
     */
    function swap(address tokenIn, uint256 amountIn, uint256 minAmountOut) external returns (uint256 amountOut) {
        amountOut = getAmountOut(tokenIn, amountIn);
        require(amountOut >= minAmountOut, "MockSwapPool: slippage");

        bool inIsA = tokenIn == address(tokenA);
        IERC20 tokenOut = inIsA ? tokenB : tokenA;

        IERC20(tokenIn).safeTransferFrom(msg.sender, address(this), amountIn);
        tokenOut.safeTransfer(msg.sender, amountOut);

        if (inIsA) {
            reserveA += amountIn;
            reserveB -= amountOut;
        } else {
            reserveB += amountIn;
            reserveA -= amountOut;
        }

        emit Swap(msg.sender, tokenIn, amountIn, address(tokenOut), amountOut);
    }

    function getReserves() external view returns (uint256, uint256) {
        return (reserveA, reserveB);
    }

    function _reservesFor(address tokenIn) private view returns (uint256 reserveIn, uint256 reserveOut) {
        if (tokenIn == address(tokenA)) {
            return (reserveA, reserveB);
        } else if (tokenIn == address(tokenB)) {
            return (reserveB, reserveA);
        } else {
            revert("MockSwapPool: invalid token");
        }
    }
}
