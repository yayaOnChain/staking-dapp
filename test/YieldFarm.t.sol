// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Test.sol";
import "../src/contracts/YieldFarm.sol";
import "../src/contracts/LiquidityPool.sol";
import "../src/contracts/tokens/TokenA.sol";
import "../src/contracts/tokens/TokenB.sol";
import "../src/contracts/tokens/RewardToken.sol";

contract YieldFarmTest is Test {
    event Deposit(address indexed user, uint256 amount);
    event Withdraw(address indexed user, uint256 amount);
    event Harvest(address indexed user, uint256 amount);

    YieldFarm public yieldFarm;
    LiquidityPool public liquidityPool;
    RewardToken public rewardToken;
    TokenA public tokenA;
    TokenB public tokenB;

    address public user1;
    address public user2;

    uint256 constant REWARD_PER_BLOCK = 1 ether;
    uint256 constant INITIAL_LIQUIDITY = 1000 ether;

    function setUp() public {
        user1 = makeAddr("user1");
        user2 = makeAddr("user2");

        tokenA = new TokenA();
        tokenB = new TokenB();
        rewardToken = new RewardToken();

        liquidityPool = new LiquidityPool(address(tokenA), address(tokenB));

        tokenA.approve(address(liquidityPool), INITIAL_LIQUIDITY);
        tokenB.approve(address(liquidityPool), INITIAL_LIQUIDITY);
        liquidityPool.addLiquidity(INITIAL_LIQUIDITY, INITIAL_LIQUIDITY, 0);

        yieldFarm = new YieldFarm(
            address(liquidityPool),
            address(rewardToken),
            REWARD_PER_BLOCK
        );

        rewardToken.transfer(address(yieldFarm), 1_000_000 ether);
    }

    function _depositForUser(address user, uint256 amount) internal {
        liquidityPool.transfer(user, amount);
        vm.startPrank(user);
        liquidityPool.approve(address(yieldFarm), amount);
        yieldFarm.deposit(amount);
        vm.stopPrank();
    }

    function _depositOnly(address user, uint256 amount) internal {
        vm.startPrank(user);
        liquidityPool.approve(address(yieldFarm), amount);
        yieldFarm.deposit(amount);
        vm.stopPrank();
    }

    // ============ Deployment ============

    function test_SetCorrectTokens() public {
        assertEq(address(yieldFarm.lpToken()), address(liquidityPool));
        assertEq(address(yieldFarm.rewardToken()), address(rewardToken));
    }

    function test_SetCorrectRewardPerBlock() public {
        assertEq(yieldFarm.rewardPerBlock(), REWARD_PER_BLOCK);
    }

    function test_InitializeWithZeroTotalStaked() public {
        assertEq(yieldFarm.totalStaked(), 0);
    }

    function test_SetLastRewardBlockToCurrentBlockNumber() public {
        assertGt(yieldFarm.lastRewardBlock(), 0);
    }

    function test_InitializeWithZeroAccRewardPerShare() public {
        assertEq(yieldFarm.accRewardPerShare(), 0);
    }

    // ============ Deposit ============

    function test_DepositLpTokens() public {
        uint256 depositAmount = 100 ether;
        _depositForUser(user1, depositAmount);

        (uint256 amount, ) = yieldFarm.userInfo(user1);
        assertEq(amount, depositAmount);
        assertEq(yieldFarm.totalStaked(), depositAmount);
    }

    function test_DepositEmitsEvent() public {
        uint256 depositAmount = 100 ether;
        liquidityPool.transfer(user1, depositAmount);

        vm.startPrank(user1);
        liquidityPool.approve(address(yieldFarm), depositAmount);

        vm.expectEmit(true, false, false, true);
        emit Deposit(user1, depositAmount);
        yieldFarm.deposit(depositAmount);
        vm.stopPrank();
    }

    function test_DepositEmitsHarvestWhenStakeExists() public {
        uint256 depositAmount = 100 ether;
        _depositForUser(user1, depositAmount);

        vm.roll(block.number + 10);

        liquidityPool.transfer(user1, depositAmount);
        vm.startPrank(user1);
        liquidityPool.approve(address(yieldFarm), depositAmount * 2);

        vm.expectEmit(true, false, false, true);
        emit Harvest(user1, 10 ether);
        yieldFarm.deposit(depositAmount);
        vm.stopPrank();
    }

    function test_DepositFailsWithoutApproval() public {
        uint256 depositAmount = 100 ether;
        liquidityPool.transfer(user1, depositAmount);

        vm.prank(user1);
        vm.expectRevert();
        yieldFarm.deposit(depositAmount);
    }

    // ============ Withdraw ============

    function test_WithdrawLpTokens() public {
        uint256 depositAmount = 100 ether;
        _depositForUser(user1, depositAmount);

        uint256 withdrawAmount = 50 ether;
        vm.prank(user1);
        yieldFarm.withdraw(withdrawAmount);

        (uint256 amount, ) = yieldFarm.userInfo(user1);
        assertEq(amount, 50 ether);
        assertEq(yieldFarm.totalStaked(), 50 ether);
    }

    function test_WithdrawEmitsEvent() public {
        uint256 depositAmount = 100 ether;
        _depositForUser(user1, depositAmount);

        uint256 withdrawAmount = 50 ether;
        vm.prank(user1);
        vm.expectEmit(true, false, false, true);
        emit Withdraw(user1, withdrawAmount);
        yieldFarm.withdraw(withdrawAmount);
    }

    function test_WithdrawEmitsHarvest() public {
        uint256 depositAmount = 100 ether;
        _depositForUser(user1, depositAmount);

        vm.roll(block.number + 10);

        uint256 withdrawAmount = 50 ether;
        vm.prank(user1);
        vm.expectEmit(true, false, false, true);
        emit Harvest(user1, 10 ether);
        yieldFarm.withdraw(withdrawAmount);
    }

    function test_WithdrawFailsWhenExceedingBalance() public {
        uint256 depositAmount = 100 ether;
        _depositForUser(user1, depositAmount);

        vm.prank(user1);
        vm.expectRevert("Insufficient balance");
        yieldFarm.withdraw(150 ether);
    }

    // ============ Harvest ============

    function test_ClaimRewards() public {
        uint256 depositAmount = 100 ether;
        _depositForUser(user1, depositAmount);

        vm.roll(block.number + 10);

        uint256 pendingReward = yieldFarm.pendingReward(user1);
        assertGt(pendingReward, 0);

        uint256 balanceBefore = rewardToken.balanceOf(user1);
        vm.prank(user1);
        yieldFarm.harvest();
        uint256 balanceAfter = rewardToken.balanceOf(user1);

        assertGt(balanceAfter - balanceBefore, 0);
    }

    function test_HarvestEmitsEvent() public {
        uint256 depositAmount = 100 ether;
        _depositForUser(user1, depositAmount);

        vm.roll(block.number + 10);

        vm.prank(user1);
        vm.expectEmit(true, false, false, true);
        emit Harvest(user1, 10 ether);
        yieldFarm.harvest();
    }

    function test_HarvestDoesNotAffectStakedAmount() public {
        uint256 depositAmount = 100 ether;
        _depositForUser(user1, depositAmount);

        vm.roll(block.number + 10);
        vm.prank(user1);
        yieldFarm.harvest();

        (uint256 amount, ) = yieldFarm.userInfo(user1);
        assertEq(amount, depositAmount);
    }

    function test_HarvestWorksWithoutExplicitUpdatePool() public {
        uint256 depositAmount = 100 ether;
        _depositForUser(user1, depositAmount);

        vm.roll(block.number + 10);

        uint256 pendingReward = yieldFarm.pendingReward(user1);
        assertGt(pendingReward, 0);

        vm.prank(user1);
        yieldFarm.harvest();
        assertGt(rewardToken.balanceOf(user1), 0);
    }

    // ============ Rewards Calculation ============

    function test_RewardsOverMultipleBlocks() public {
        uint256 depositAmount = 100 ether;
        _depositForUser(user1, depositAmount);

        vm.roll(block.number + 10);

        uint256 pendingReward = yieldFarm.pendingReward(user1);
        assertApproxEqAbs(pendingReward, 10 ether, 1 ether);
    }

    function test_ProportionalRewardsTwoUsers() public {
        uint256 depositAmount = 100 ether;

        _depositForUser(user1, depositAmount);
        _depositForUser(user2, depositAmount);

        vm.roll(block.number + 10);

        uint256 pendingReward1 = yieldFarm.pendingReward(user1);
        uint256 pendingReward2 = yieldFarm.pendingReward(user2);

        assertApproxEqAbs(pendingReward1, 5 ether, 1 ether);
        assertApproxEqAbs(pendingReward2, 5 ether, 1 ether);
    }

    function test_RewardsWithDifferentStakeProportions() public {
        uint256 depositAmount1 = 100 ether;
        uint256 depositAmount2 = 300 ether;

        _depositForUser(user1, depositAmount1);
        _depositForUser(user2, depositAmount2);

        vm.roll(block.number + 10);

        uint256 pendingReward1 = yieldFarm.pendingReward(user1);
        uint256 pendingReward2 = yieldFarm.pendingReward(user2);

        uint256 expectedReward1 = (REWARD_PER_BLOCK * 10) / 4;
        uint256 expectedReward2 = (REWARD_PER_BLOCK * 10 * 3) / 4;

        assertApproxEqAbs(pendingReward1, expectedReward1, 1 ether);
        assertApproxEqAbs(pendingReward2, expectedReward2, 1 ether);
        assertGt(pendingReward2, pendingReward1);
    }

    function test_NoRewardsWhenNoStakers() public {
        uint256 accRewardPerShareBefore = yieldFarm.accRewardPerShare();

        vm.roll(block.number + 16);
        yieldFarm.updatePool();

        assertEq(yieldFarm.accRewardPerShare(), accRewardPerShareBefore);
    }

    // ============ Update Pool ============

    function test_UpdatePoolStateCorrectly() public {
        uint256 depositAmount = 100 ether;
        _depositForUser(user1, depositAmount);

        uint256 lastRewardBlockBefore = yieldFarm.lastRewardBlock();
        vm.roll(block.number + 5);
        yieldFarm.updatePool();

        assertGt(yieldFarm.lastRewardBlock(), lastRewardBlockBefore);
    }

    function test_UpdateAccRewardPerShareWhenStakersExist() public {
        uint256 depositAmount = 100 ether;
        _depositForUser(user1, depositAmount);

        uint256 accRewardPerShareBefore = yieldFarm.accRewardPerShare();
        vm.roll(block.number + 5);
        yieldFarm.updatePool();

        assertGt(yieldFarm.accRewardPerShare(), accRewardPerShareBefore);
    }

    function test_NoAccRewardUpdateIfNoBlocksPassed() public {
        uint256 depositAmount = 100 ether;
        _depositForUser(user1, depositAmount);

        yieldFarm.updatePool();
        uint256 accRewardPerShare = yieldFarm.accRewardPerShare();

        yieldFarm.updatePool();
        assertEq(yieldFarm.accRewardPerShare(), accRewardPerShare);
    }

    function test_UpdatePoolOnlyUpdatesLastRewardBlockWhenNoStakers() public {
        uint256 lastRewardBlockBefore = yieldFarm.lastRewardBlock();
        vm.roll(block.number + 5);
        yieldFarm.updatePool();

        assertGt(yieldFarm.lastRewardBlock(), lastRewardBlockBefore);
        assertEq(yieldFarm.accRewardPerShare(), 0);
    }

    // ============ pendingReward ============

    function test_PendingRewardZeroForNonStaker() public {
        uint256 pending = yieldFarm.pendingReward(user1);
        assertEq(pending, 0);
    }

    function test_PendingRewardCalculatesWithoutUpdatePool() public {
        uint256 depositAmount = 100 ether;
        _depositForUser(user1, depositAmount);

        vm.roll(block.number + 10);

        uint256 pending = yieldFarm.pendingReward(user1);
        assertGt(pending, 0);
    }

    function test_PendingRewardZeroWhenNoBlocksPassed() public {
        uint256 depositAmount = 100 ether;
        _depositForUser(user1, depositAmount);

        uint256 pending = yieldFarm.pendingReward(user1);
        assertEq(pending, 0);
    }
}
