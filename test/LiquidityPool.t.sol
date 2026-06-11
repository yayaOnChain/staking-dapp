// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Test.sol";
import "../src/contracts/LiquidityPool.sol";
import "../src/contracts/tokens/TokenA.sol";
import "../src/contracts/tokens/TokenB.sol";

contract LiquidityPoolTest is Test {
    // Event declarations matching the contracts (for vm.expectEmit)
    event Deposit(address indexed provider, uint256 amount0, uint256 amount1, uint256 lpTokens);
    event Withdraw(address indexed provider, uint256 amount0, uint256 amount1, uint256 lpTokens);
    event Swap(address indexed user, uint256 amountIn, uint256 amountOut, address tokenIn);

    LiquidityPool public liquidityPool;
    TokenA public tokenA;
    TokenB public tokenB;

    address public owner;
    address public user1;
    address public user2;

    uint256 constant INITIAL_AMOUNT_A = 1000 ether;
    uint256 constant INITIAL_AMOUNT_B = 1000 ether;

    function setUp() public {
        owner = address(this);
        user1 = makeAddr("user1");
        user2 = makeAddr("user2");

        tokenA = new TokenA();
        tokenB = new TokenB();

        liquidityPool = new LiquidityPool(address(tokenA), address(tokenB));
    }

    function _addInitialLiquidity() internal {
        tokenA.approve(address(liquidityPool), INITIAL_AMOUNT_A);
        tokenB.approve(address(liquidityPool), INITIAL_AMOUNT_B);
        liquidityPool.addLiquidity(INITIAL_AMOUNT_A, INITIAL_AMOUNT_B, 0);
    }

    // ============ Deployment ============

    function test_SetCorrectTokenAddresses() public {
        assertEq(address(liquidityPool.token0()), address(tokenA));
        assertEq(address(liquidityPool.token1()), address(tokenB));
    }

    function test_InitializeWithZeroReserves() public {
        assertEq(liquidityPool.reserve0(), 0);
        assertEq(liquidityPool.reserve1(), 0);
    }

    function test_CorrectNameAndSymbol() public {
        assertEq(liquidityPool.name(), "DeFi LP Token");
        assertEq(liquidityPool.symbol(), "LP");
    }

    // ============ Add Liquidity ============

    function test_AddLiquidityInitialDeposit() public {
        tokenA.approve(address(liquidityPool), INITIAL_AMOUNT_A);
        tokenB.approve(address(liquidityPool), INITIAL_AMOUNT_B);
        liquidityPool.addLiquidity(INITIAL_AMOUNT_A, INITIAL_AMOUNT_B, 0);

        assertGt(liquidityPool.balanceOf(owner), 0);
        assertEq(liquidityPool.reserve0(), INITIAL_AMOUNT_A);
        assertEq(liquidityPool.reserve1(), INITIAL_AMOUNT_B);
    }

    function test_AddLiquidityEmitsDepositEvent() public {
        tokenA.approve(address(liquidityPool), INITIAL_AMOUNT_A);
        tokenB.approve(address(liquidityPool), INITIAL_AMOUNT_B);

        vm.expectEmit(true, false, false, false);
        emit Deposit(owner, 0, 0, 0);
        liquidityPool.addLiquidity(INITIAL_AMOUNT_A, INITIAL_AMOUNT_B, 0);
    }

    function test_AddLiquiditySubsequentDeposit() public {
        _addInitialLiquidity();

        uint256 secondAmountA = 500 ether;
        uint256 secondAmountB = 500 ether;
        tokenA.approve(address(liquidityPool), secondAmountA);
        tokenB.approve(address(liquidityPool), secondAmountB);
        liquidityPool.addLiquidity(secondAmountA, secondAmountB, 0);

        assertEq(liquidityPool.reserve0(), INITIAL_AMOUNT_A + secondAmountA);
        assertEq(liquidityPool.reserve1(), INITIAL_AMOUNT_B + secondAmountB);
    }

    function test_AddLiquidityFailsWithZero() public {
        tokenA.approve(address(liquidityPool), 0);
        tokenB.approve(address(liquidityPool), 0);

        vm.expectRevert("Invalid amounts");
        liquidityPool.addLiquidity(0, 0, 0);
    }

    function test_AddLiquidityFailsWithoutApproval() public {
        vm.expectRevert();
        liquidityPool.addLiquidity(INITIAL_AMOUNT_A, INITIAL_AMOUNT_B, 0);
    }

    function test_ProportionalLpMinting() public {
        _addInitialLiquidity();

        tokenA.transfer(user1, 500 ether);
        tokenB.transfer(user1, 500 ether);

        vm.startPrank(user1);
        tokenA.approve(address(liquidityPool), 500 ether);
        tokenB.approve(address(liquidityPool), 500 ether);
        liquidityPool.addLiquidity(500 ether, 500 ether, 0);
        vm.stopPrank();

        assertGt(liquidityPool.balanceOf(user1), 0);
    }

    // ============ Remove Liquidity ============

    function test_RemoveLiquidity() public {
        _addInitialLiquidity();

        uint256 lpTokensToRemove = liquidityPool.balanceOf(owner);

        uint256 tokenABefore = tokenA.balanceOf(owner);
        uint256 tokenBBefore = tokenB.balanceOf(owner);

        liquidityPool.removeLiquidity(lpTokensToRemove, 0, 0);

        uint256 tokenAAfter = tokenA.balanceOf(owner);
        uint256 tokenBAfter = tokenB.balanceOf(owner);

        assertApproxEqAbs(tokenAAfter - tokenABefore, INITIAL_AMOUNT_A, 1000);
        assertApproxEqAbs(tokenBAfter - tokenBBefore, INITIAL_AMOUNT_B, 1000);
    }

    function test_RemoveLiquidityEmitsWithdrawEvent() public {
        _addInitialLiquidity();

        uint256 lpTokensToRemove = liquidityPool.balanceOf(owner);

        vm.expectEmit(true, false, false, false);
        emit Withdraw(owner, 0, 0, lpTokensToRemove);
        liquidityPool.removeLiquidity(lpTokensToRemove, 0, 0);
    }

    function test_RemoveLiquidityUpdatesReserves() public {
        _addInitialLiquidity();

        uint256 lpTokensToRemove = liquidityPool.balanceOf(owner);
        liquidityPool.removeLiquidity(lpTokensToRemove, 0, 0);

        assertApproxEqAbs(liquidityPool.reserve0(), 0, 1000);
        assertApproxEqAbs(liquidityPool.reserve1(), 0, 1000);
    }

    function test_RemoveLiquidityFailsExceedingBalance() public {
        _addInitialLiquidity();

        uint256 lpTokensToRemove = liquidityPool.balanceOf(owner);
        uint256 excessAmount = 1 ether;

        vm.expectRevert("Insufficient balance");
        liquidityPool.removeLiquidity(lpTokensToRemove + excessAmount, 0, 0);
    }

    function test_RemoveLiquidityFailsWithZero() public {
        vm.expectRevert("Invalid amount");
        liquidityPool.removeLiquidity(0, 0, 0);
    }

    function test_DustAmountDoesNotRevert() public {
        _addInitialLiquidity();

        tokenA.approve(address(liquidityPool), INITIAL_AMOUNT_A);
        tokenB.approve(address(liquidityPool), INITIAL_AMOUNT_B);
        liquidityPool.addLiquidity(INITIAL_AMOUNT_A, INITIAL_AMOUNT_B, 0);

        liquidityPool.removeLiquidity(1, 0, 0);
    }

    // ============ Swap ============

    function test_SwapTokenAForTokenB() public {
        _addInitialLiquidity();
        tokenA.transfer(user1, 500 ether);

        uint256 swapAmount = 100 ether;
        vm.startPrank(user1);
        tokenA.approve(address(liquidityPool), swapAmount);

        uint256 tokenBBefore = tokenB.balanceOf(user1);
        liquidityPool.swap(swapAmount, 0, address(tokenA));
        uint256 tokenBAfter = tokenB.balanceOf(user1);
        vm.stopPrank();

        assertGt(tokenBAfter - tokenBBefore, 0);
    }

    function test_SwapTokenBForTokenA() public {
        _addInitialLiquidity();
        tokenB.transfer(user1, 500 ether);

        uint256 swapAmount = 100 ether;
        vm.startPrank(user1);
        tokenB.approve(address(liquidityPool), swapAmount);

        uint256 tokenABefore = tokenA.balanceOf(user1);
        liquidityPool.swap(swapAmount, 0, address(tokenB));
        uint256 tokenAAfter = tokenA.balanceOf(user1);
        vm.stopPrank();

        assertGt(tokenAAfter - tokenABefore, 0);
    }

    function test_SwapEmitsSwapEvent() public {
        _addInitialLiquidity();
        tokenA.transfer(user1, 500 ether);

        uint256 swapAmount = 100 ether;
        vm.startPrank(user1);
        tokenA.approve(address(liquidityPool), swapAmount);

        vm.expectEmit(true, false, false, false);
        emit Swap(user1, swapAmount, 0, address(tokenA));
        liquidityPool.swap(swapAmount, 0, address(tokenA));
        vm.stopPrank();
    }

    function test_SwapUpdatesReserves() public {
        _addInitialLiquidity();
        tokenA.transfer(user1, 500 ether);

        uint256 swapAmount = 100 ether;
        uint256 reserve0Before = liquidityPool.reserve0();
        uint256 reserve1Before = liquidityPool.reserve1();

        vm.startPrank(user1);
        tokenA.approve(address(liquidityPool), swapAmount);
        liquidityPool.swap(swapAmount, 0, address(tokenA));
        vm.stopPrank();

        assertGt(liquidityPool.reserve0(), reserve0Before);
        assertLt(liquidityPool.reserve1(), reserve1Before);
    }

    function test_SwapConstantProductFormula() public {
        _addInitialLiquidity();
        tokenA.transfer(user1, 500 ether);

        uint256 swapAmount = 100 ether;
        vm.startPrank(user1);
        tokenA.approve(address(liquidityPool), swapAmount);

        uint256 amountInWithFee = swapAmount * 997;
        uint256 reserveIn = liquidityPool.reserve0();
        uint256 reserveOut = liquidityPool.reserve1();
        uint256 numerator = amountInWithFee * reserveOut;
        uint256 denominator = reserveIn * 1000 + amountInWithFee;
        uint256 expectedOutput = numerator / denominator;

        liquidityPool.swap(swapAmount, 0, address(tokenA));
        vm.stopPrank();

        uint256 newReserveOut = liquidityPool.reserve1();
        uint256 actualOutput = reserveOut - newReserveOut;

        assertApproxEqAbs(actualOutput, expectedOutput, 1);
    }

    function test_SwapFailsWithZeroAmount() public {
        vm.expectRevert("Insufficient input amount");
        liquidityPool.swap(0, 0, address(tokenA));
    }

    function test_SwapFailsWithInvalidToken() public {
        _addInitialLiquidity();
        tokenA.transfer(user1, 500 ether);

        vm.startPrank(user1);
        tokenA.approve(address(liquidityPool), 100 ether);
        vm.expectRevert("Invalid token");
        liquidityPool.swap(100 ether, 0, user2);
        vm.stopPrank();
    }

    function test_SwapFailsWithoutApproval() public {
        _addInitialLiquidity();
        tokenA.transfer(user1, 500 ether);

        vm.prank(user1);
        vm.expectRevert();
        liquidityPool.swap(100 ether, 0, address(tokenA));
    }

    function test_SwapFailsWithInsufficientLiquidity() public {
        _addInitialLiquidity();

        uint256 lpTokensToRemove = liquidityPool.balanceOf(owner);
        liquidityPool.removeLiquidity(lpTokensToRemove, 0, 0);

        vm.prank(user1);
        tokenA.approve(address(liquidityPool), 100 ether);
        vm.expectRevert("Insufficient liquidity");
        liquidityPool.swap(100 ether, 0, address(tokenA));
    }

    // ============ Multiple Users ============

    function test_MultipleUsersAddRemoveLiquidity() public {
        _addInitialLiquidity();

        tokenA.transfer(user1, 500 ether);
        tokenB.transfer(user1, 500 ether);
        tokenA.transfer(user2, 300 ether);
        tokenB.transfer(user2, 300 ether);

        vm.startPrank(user1);
        tokenA.approve(address(liquidityPool), 500 ether);
        tokenB.approve(address(liquidityPool), 500 ether);
        liquidityPool.addLiquidity(500 ether, 500 ether, 0);
        vm.stopPrank();

        vm.startPrank(user2);
        tokenA.approve(address(liquidityPool), 300 ether);
        tokenB.approve(address(liquidityPool), 300 ether);
        liquidityPool.addLiquidity(300 ether, 300 ether, 0);
        vm.stopPrank();

        assertGt(liquidityPool.totalSupply(), INITIAL_AMOUNT_A);

        uint256 user1LPBalance = liquidityPool.balanceOf(user1);
        vm.prank(user1);
        liquidityPool.removeLiquidity(user1LPBalance, 0, 0);

        assertApproxEqAbs(tokenA.balanceOf(user1), 500 ether, 0.1 ether);
    }
}
