// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

/**
 * @title LiquidityPool
 * @dev Implements a liquidity pool that issues ERC20 LP tokens to providers.
 * This allows LP tokens to be composable (used in other DeFi protocols).
 */
contract LiquidityPool is ERC20, ReentrancyGuard {
    using SafeERC20 for IERC20;

    IERC20 public token0;
    IERC20 public token1;

    uint256 public reserve0;
    uint256 public reserve1;

    // Events
    event Deposit(
        address indexed provider,
        uint256 amount0,
        uint256 amount1,
        uint256 lpTokens
    );
    event Withdraw(
        address indexed provider,
        uint256 amount0,
        uint256 amount1,
        uint256 lpTokens
    );
    event Swap(
        address indexed user,
        uint256 amountIn,
        uint256 amountOut,
        address tokenIn
    );

    constructor(address _token0, address _token1) ERC20("DeFi LP Token", "LP") {
        token0 = IERC20(_token0);
        token1 = IERC20(_token1);
    }

    /**
     * @dev Add liquidity to the pool
     * @param amount0 Amount of token0 to deposit
     * @param amount1 Amount of token1 to deposit
     * @return lpTokens Amount of LP tokens minted to the provider
     */
    function addLiquidity(
        uint256 amount0,
        uint256 amount1,
        uint256 minLPTokens
    ) external nonReentrant returns (uint256 lpTokens) {
        require(amount0 > 0 && amount1 > 0, "Invalid amounts");

        // Calculate LP tokens to mint
        if (totalSupply() == 0) {
            // Initial deposit: lock liquidity to prevent price manipulation
            // Mint sqrt(amount0 * amount1) to avoid huge inflation on first deposit
            lpTokens = sqrt(amount0 * amount1);
            require(lpTokens > 0, "Insufficient liquidity minted");
            require(lpTokens >= minLPTokens, "Slippage limit: insufficient LP minted");
            // Lock the first LP tokens to address(0) or mint to user (Simplified: mint to user)
            _mint(msg.sender, lpTokens);
        } else {
            // Subsequent deposits: proportional to existing supply
            uint256 liquidity0 = (amount0 * totalSupply()) / reserve0;
            uint256 liquidity1 = (amount1 * totalSupply()) / reserve1;
            lpTokens = liquidity0 < liquidity1 ? liquidity0 : liquidity1;

            require(lpTokens > 0, "Insufficient liquidity minted");
            require(lpTokens >= minLPTokens, "Slippage limit: insufficient LP minted");
            _mint(msg.sender, lpTokens);
        }

        // Update reserves
        reserve0 += amount0;
        reserve1 += amount1;

        emit Deposit(msg.sender, amount0, amount1, lpTokens);

        // Transfer tokens from user to this pool
        token0.safeTransferFrom(msg.sender, address(this), amount0);
        token1.safeTransferFrom(msg.sender, address(this), amount1);
    }

    /**
     * @dev Remove liquidity from the pool by burning LP tokens
     * @param lpTokens Amount of LP tokens to burn
     * @return amount0 Amount of token0 returned
     * @return amount1 Amount of token1 returned
     */
    function removeLiquidity(
        uint256 lpTokens,
        uint256 minAmount0,
        uint256 minAmount1
    ) external nonReentrant returns (uint256 amount0, uint256 amount1) {
        require(lpTokens > 0, "Invalid amount");
        require(balanceOf(msg.sender) >= lpTokens, "Insufficient balance");

        // Calculate share of reserves
        amount0 = (lpTokens * reserve0) / totalSupply();
        amount1 = (lpTokens * reserve1) / totalSupply();

        require(amount0 > 0 && amount1 > 0, "Insufficient amounts");
        require(amount0 >= minAmount0 && amount1 >= minAmount1, "Slippage limit: returned amount too low");

        // Burn LP tokens
        _burn(msg.sender, lpTokens);

        // Update reserves
        reserve0 -= amount0;
        reserve1 -= amount1;

        emit Withdraw(msg.sender, amount0, amount1, lpTokens);

        // Transfer assets back to user
        token0.safeTransfer(msg.sender, amount0);
        token1.safeTransfer(msg.sender, amount1);
    }

    /**
     * @dev Swap tokens using constant product formula (x * y = k) with 0.3% fee
     * @param amountIn Amount of input token to swap
     * @param tokenIn Address of the input token
     * @return amountOut Amount of output token received
     */
    function swap(
        uint256 amountIn,
        uint256 minAmountOut,
        address tokenIn
    ) external nonReentrant returns (uint256 amountOut) {
        require(amountIn > 0, "Insufficient input amount");
        require(
            tokenIn == address(token0) || tokenIn == address(token1),
            "Invalid token"
        );
        require(reserve0 > 0 && reserve1 > 0, "Insufficient liquidity");

        bool isToken0 = tokenIn == address(token0);
        (
            uint256 reserveIn,
            uint256 reserveOut
        ) = isToken0
                ? (reserve0, reserve1)
                : (reserve1, reserve0);

        // Calculate output amount using constant product formula with 0.3% fee
        // amountOut = (amountIn * 997 * reserveOut) / (reserveIn * 1000 + amountIn * 997)
        uint256 amountInWithFee = amountIn * 997;
        uint256 numerator = amountInWithFee * reserveOut;
        uint256 denominator = (reserveIn * 1000) + amountInWithFee;

        amountOut = numerator / denominator;

        require(amountOut > 0, "Insufficient output amount");
        require(amountOut >= minAmountOut, "Slippage limit: received less than expected");
        require(amountOut < reserveOut, "Insufficient liquidity");

        // Update reserves (Checks-Effects-Interactions pattern)
        if (isToken0) {
            reserve0 += amountIn;
            reserve1 -= amountOut;
        } else {
            reserve1 += amountIn;
            reserve0 -= amountOut;
        }

        emit Swap(msg.sender, amountIn, amountOut, tokenIn);

        // Transfer tokens securely without local aliases to satisfy static analysis
        if (isToken0) {
            token0.safeTransferFrom(msg.sender, address(this), amountIn);
            token1.safeTransfer(msg.sender, amountOut);
        } else {
            token1.safeTransferFrom(msg.sender, address(this), amountIn);
            token0.safeTransfer(msg.sender, amountOut);
        }
    }

    // Helper for sqrt calculation
    function sqrt(uint256 y) internal pure returns (uint256 z) {
        if (y > 3) {
            z = y;
            uint256 x = y / 2 + 1;
            while (x < z) {
                z = x;
                x = (y / x + x) / 2;
            }
        } else if (y != 0) {
            z = 1;
        } else {
            z = 0;
        }
    }
}
