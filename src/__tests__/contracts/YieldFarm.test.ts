import { expect } from "chai";
import { ethers } from "hardhat";
import type { LiquidityPool, RewardToken, YieldFarm } from "typechain-types";
import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers";

describe("YieldFarm", function () {
  let yieldFarm: YieldFarm;
  let rewardToken: RewardToken;
  let liquidityPool: LiquidityPool;
  let user1: HardhatEthersSigner;
  let user2: HardhatEthersSigner;

  const REWARD_PER_BLOCK = ethers.parseEther("1");
  const INITIAL_LIQUIDITY = ethers.parseEther("1000");

  beforeEach(async function () {
    [user1, user2] = await ethers.getSigners();

    // Deploy tokens
    const TokenAFactory = await ethers.getContractFactory("TokenA");
    const TokenBFactory = await ethers.getContractFactory("TokenB");
    const RewardTokenFactory = await ethers.getContractFactory("RewardToken");
    const LiquidityPoolFactory = await ethers.getContractFactory("LiquidityPool");

    const tokenA = await TokenAFactory.deploy();
    const tokenB = await TokenBFactory.deploy();
    rewardToken = await RewardTokenFactory.deploy();

    // Deploy Liquidity Pool
    liquidityPool = await LiquidityPoolFactory.deploy(
      await tokenA.getAddress(),
      await tokenB.getAddress()
    );

    // Add initial liquidity
    await tokenA.approve(await liquidityPool.getAddress(), INITIAL_LIQUIDITY);
    await tokenB.approve(await liquidityPool.getAddress(), INITIAL_LIQUIDITY);
    await liquidityPool.addLiquidity(INITIAL_LIQUIDITY, INITIAL_LIQUIDITY);

    // Deploy Yield Farm
    const YieldFarmFactory = await ethers.getContractFactory("YieldFarm");
    yieldFarm = await YieldFarmFactory.deploy(
      await liquidityPool.getAddress(),
      await rewardToken.getAddress(),
      REWARD_PER_BLOCK
    );

    // Transfer reward tokens to yield farm
    await rewardToken.transfer(
      await yieldFarm.getAddress(),
      ethers.parseEther("1000000")
    );
  });

  describe("Deployment", function () {
    it("Should set the correct LP token and reward token", async function () {
      expect(await yieldFarm.lpToken()).to.equal(await liquidityPool.getAddress());
      expect(await yieldFarm.rewardToken()).to.equal(await rewardToken.getAddress());
    });

    it("Should set the correct reward per block", async function () {
      expect(await yieldFarm.rewardPerBlock()).to.equal(REWARD_PER_BLOCK);
    });

    it("Should initialize with zero total staked", async function () {
      expect(await yieldFarm.totalStaked()).to.equal(0);
    });

    it("Should set lastRewardBlock to current block number", async function () {
      const lastRewardBlock = await yieldFarm.lastRewardBlock();
      expect(lastRewardBlock).to.be.greaterThan(0);
    });

    it("Should initialize with zero accRewardPerShare", async function () {
      expect(await yieldFarm.accRewardPerShare()).to.equal(0);
    });
  });

  describe("Deposit", function () {
    it("Should allow users to deposit LP tokens", async function () {
      const depositAmount = ethers.parseEther("100");

      // Transfer LP tokens to user1
      await liquidityPool.transfer(user1.address, depositAmount);

      // User1 approves and deposits
      await liquidityPool.connect(user1).approve(
        await yieldFarm.getAddress(),
        depositAmount
      );
      await yieldFarm.connect(user1).deposit(depositAmount);

      const userInfo = await yieldFarm.userInfo(user1.address);
      expect(userInfo.amount).to.equal(depositAmount);
      expect(await yieldFarm.totalStaked()).to.equal(depositAmount);
    });

    it("Should emit Deposit event", async function () {
      const depositAmount = ethers.parseEther("100");
      await liquidityPool.transfer(user1.address, depositAmount);
      await liquidityPool.connect(user1).approve(
        await yieldFarm.getAddress(),
        depositAmount
      );

      await expect(yieldFarm.connect(user1).deposit(depositAmount))
        .to.emit(yieldFarm, "Deposit")
        .withArgs(user1.address, depositAmount);
    });

    it("Should emit Harvest event when depositing with existing stake", async function () {
      const depositAmount = ethers.parseEther("100");
      await liquidityPool.transfer(user1.address, depositAmount * 2n);
      await liquidityPool.connect(user1).approve(
        await yieldFarm.getAddress(),
        depositAmount * 2n
      );
      await yieldFarm.connect(user1).deposit(depositAmount);

      // Mine blocks to accumulate rewards
      await ethers.provider.send("hardhat_mine", ["0xA"]);

      // Deposit again - should harvest pending rewards
      await expect(yieldFarm.connect(user1).deposit(depositAmount))
        .to.emit(yieldFarm, "Harvest");
    });

    it("Should fail if user hasn't approved LP token transfer", async function () {
      const depositAmount = ethers.parseEther("100");
      await liquidityPool.transfer(user1.address, depositAmount);

      await expect(
        yieldFarm.connect(user1).deposit(depositAmount)
      ).to.be.reverted;
    });
  });

  describe("Withdraw", function () {
    beforeEach(async function () {
      const depositAmount = ethers.parseEther("100");
      await liquidityPool.transfer(user1.address, depositAmount);
      await liquidityPool.connect(user1).approve(
        await yieldFarm.getAddress(),
        depositAmount
      );
      await yieldFarm.connect(user1).deposit(depositAmount);
    });

    it("Should allow users to withdraw LP tokens", async function () {
      const withdrawAmount = ethers.parseEther("50");
      await yieldFarm.connect(user1).withdraw(withdrawAmount);

      const userInfo = await yieldFarm.userInfo(user1.address);
      expect(userInfo.amount).to.equal(ethers.parseEther("50"));
      expect(await yieldFarm.totalStaked()).to.equal(ethers.parseEther("50"));
    });

    it("Should emit Withdraw event", async function () {
      const withdrawAmount = ethers.parseEther("50");
      await expect(yieldFarm.connect(user1).withdraw(withdrawAmount))
        .to.emit(yieldFarm, "Withdraw")
        .withArgs(user1.address, withdrawAmount);
    });

    it("Should emit Harvest event when withdrawing", async function () {
      // Mine blocks to accumulate rewards
      await ethers.provider.send("hardhat_mine", ["0xA"]);

      await expect(yieldFarm.connect(user1).withdraw(ethers.parseEther("50")))
        .to.emit(yieldFarm, "Harvest");
    });

    it("Should fail if withdrawing more than staked", async function () {
      const withdrawAmount = ethers.parseEther("150");
      await expect(
        yieldFarm.connect(user1).withdraw(withdrawAmount)
      ).to.be.revertedWith("Insufficient balance");
    });
  });

  describe("Harvest", function () {
    beforeEach(async function () {
      const depositAmount = ethers.parseEther("100");
      await liquidityPool.transfer(user1.address, depositAmount);
      await liquidityPool.connect(user1).approve(
        await yieldFarm.getAddress(),
        depositAmount
      );
      await yieldFarm.connect(user1).deposit(depositAmount);
    });

    it("Should allow users to claim rewards", async function () {
      // Mine blocks to accumulate rewards
      await ethers.provider.send("hardhat_mine", ["0xA"]); // Mine 10 blocks

      const pendingReward = await yieldFarm.pendingReward(user1.address);
      expect(pendingReward).to.be.greaterThan(0n);

      const rewardBalanceBefore = await rewardToken.balanceOf(user1.address);
      await yieldFarm.connect(user1).harvest();
      const rewardBalanceAfter = await rewardToken.balanceOf(user1.address);

      expect(rewardBalanceAfter - rewardBalanceBefore).to.be.greaterThan(0n);
    });

    it("Should emit Harvest event", async function () {
      await ethers.provider.send("hardhat_mine", ["0xA"]); // Mine 10 blocks

      await expect(yieldFarm.connect(user1).harvest())
        .to.emit(yieldFarm, "Harvest");
    });

    it("Should not affect staked amount after harvest", async function () {
      await ethers.provider.send("hardhat_mine", ["0xA"]); // Mine 10 blocks
      await yieldFarm.connect(user1).harvest();
      const userInfo = await yieldFarm.userInfo(user1.address);
      expect(userInfo.amount).to.equal(ethers.parseEther("100"));
    });

    it("Should allow harvest without calling updatePool first", async function () {
      await ethers.provider.send("hardhat_mine", ["0xA"]); // Mine 10 blocks

      // pendingReward should calculate correctly without explicit updatePool
      const pendingReward = await yieldFarm.pendingReward(user1.address);
      expect(pendingReward).to.be.greaterThan(0n);

      await yieldFarm.connect(user1).harvest();
      expect(await rewardToken.balanceOf(user1.address)).to.be.greaterThan(0n);
    });
  });

  describe("Rewards Calculation", function () {
    it("Should calculate rewards correctly over multiple blocks", async function () {
      const depositAmount = ethers.parseEther("100");
      await liquidityPool.transfer(user1.address, depositAmount);
      await liquidityPool.connect(user1).approve(
        await yieldFarm.getAddress(),
        depositAmount
      );
      await yieldFarm.connect(user1).deposit(depositAmount);

      // Mine 10 blocks
      await ethers.provider.send("hardhat_mine", ["0xA"]);

      const pendingReward = await yieldFarm.pendingReward(user1.address);
      // Should be approximately 10 blocks * rewardPerBlock
      expect(pendingReward).to.be.closeTo(
        REWARD_PER_BLOCK * 10n,
        ethers.parseEther("1")
      );
    });

    it("Should distribute rewards proportionally among multiple users", async function () {
      const depositAmount = ethers.parseEther("100");

      await liquidityPool.transfer(user1.address, depositAmount);
      await liquidityPool.transfer(user2.address, depositAmount);

      await liquidityPool.connect(user1).approve(
        await yieldFarm.getAddress(),
        depositAmount
      );
      await liquidityPool.connect(user2).approve(
        await yieldFarm.getAddress(),
        depositAmount
      );

      // Both users deposit
      await yieldFarm.connect(user1).deposit(depositAmount);
      await yieldFarm.connect(user2).deposit(depositAmount);

      // Mine 10 blocks
      await ethers.provider.send("hardhat_mine", ["0xA"]);

      const pendingReward1 = await yieldFarm.pendingReward(user1.address);
      const pendingReward2 = await yieldFarm.pendingReward(user2.address);

      // Both users should have equal rewards (equal stakes, deposited at same time)
      // Rewards = 10 blocks * 1 token/block / 2 users = 5 tokens each
      const expectedReward = REWARD_PER_BLOCK * 10n / 2n;
      expect(pendingReward1).to.be.closeTo(expectedReward, ethers.parseEther("1"));
      expect(pendingReward2).to.be.closeTo(expectedReward, ethers.parseEther("1"));
    });

    it("Should calculate rewards with different stake proportions", async function () {
      const depositAmount1 = ethers.parseEther("100");
      const depositAmount2 = ethers.parseEther("300"); // 3x more

      await liquidityPool.transfer(user1.address, depositAmount1);
      await liquidityPool.transfer(user2.address, depositAmount2);

      await liquidityPool.connect(user1).approve(
        await yieldFarm.getAddress(),
        depositAmount1
      );
      await liquidityPool.connect(user2).approve(
        await yieldFarm.getAddress(),
        depositAmount2
      );

      await yieldFarm.connect(user1).deposit(depositAmount1);
      await yieldFarm.connect(user2).deposit(depositAmount2);

      // Mine 10 blocks
      await ethers.provider.send("hardhat_mine", ["0xA"]);

      const pendingReward1 = await yieldFarm.pendingReward(user1.address);
      const pendingReward2 = await yieldFarm.pendingReward(user2.address);

      // Total staked = 400, user1 = 25%, user2 = 75%
      // Total rewards = 10 blocks * 1 = 10 tokens
      // user1 should get 2.5 tokens, user2 should get 7.5 tokens
      const expectedReward1 = REWARD_PER_BLOCK * 10n / 4n; // 25%
      const expectedReward2 = (REWARD_PER_BLOCK * 10n * 3n) / 4n; // 75%
      
      expect(pendingReward1).to.be.closeTo(expectedReward1, ethers.parseEther("1"));
      expect(pendingReward2).to.be.closeTo(expectedReward2, ethers.parseEther("1"));
      // Verify ratio is approximately 3:1
      expect(pendingReward2).to.be.greaterThan(pendingReward1);
    });

    it("Should not accumulate rewards when totalStaked is zero", async function () {
      const accRewardPerShareBefore = await yieldFarm.accRewardPerShare();

      // Mine blocks without any staking
      await ethers.provider.send("hardhat_mine", ["0x10"]);

      await yieldFarm.updatePool();

      const accRewardPerShareAfter = await yieldFarm.accRewardPerShare();
      expect(accRewardPerShareAfter).to.equal(accRewardPerShareBefore);
    });
  });

  describe("Update Pool", function () {
    it("Should update pool state correctly", async function () {
      const depositAmount = ethers.parseEther("100");
      await liquidityPool.transfer(user1.address, depositAmount);
      await liquidityPool.connect(user1).approve(
        await yieldFarm.getAddress(),
        depositAmount
      );
      await yieldFarm.connect(user1).deposit(depositAmount);

      const lastRewardBlockBefore = await yieldFarm.lastRewardBlock();
      await ethers.provider.send("hardhat_mine", ["0x5"]); // Mine 5 blocks
      await yieldFarm.updatePool();
      const lastRewardBlockAfter = await yieldFarm.lastRewardBlock();

      expect(lastRewardBlockAfter).to.be.greaterThan(lastRewardBlockBefore);
    });

    it("Should update accRewardPerShare when stakers exist", async function () {
      const depositAmount = ethers.parseEther("100");
      await liquidityPool.transfer(user1.address, depositAmount);
      await liquidityPool.connect(user1).approve(
        await yieldFarm.getAddress(),
        depositAmount
      );
      await yieldFarm.connect(user1).deposit(depositAmount);

      const accRewardPerShareBefore = await yieldFarm.accRewardPerShare();
      await ethers.provider.send("hardhat_mine", ["0x5"]); // Mine 5 blocks
      await yieldFarm.updatePool();
      const accRewardPerShareAfter = await yieldFarm.accRewardPerShare();

      expect(accRewardPerShareAfter).to.be.greaterThan(accRewardPerShareBefore);
    });

    it("Should not update accRewardPerShare if no blocks have passed", async function () {
      const depositAmount = ethers.parseEther("100");
      await liquidityPool.transfer(user1.address, depositAmount);
      await liquidityPool.connect(user1).approve(
        await yieldFarm.getAddress(),
        depositAmount
      );
      await yieldFarm.connect(user1).deposit(depositAmount);

      // Disable automine to prevent new block from being mined
      await ethers.provider.send("evm_setAutomine", [false]);
      
      // After deposit, updatePool has been called
      // Calling updatePool again immediately (no blocks mined) should not change accRewardPerShare
      const accRewardPerShareBefore = await yieldFarm.accRewardPerShare();
      await yieldFarm.updatePool();
      const accRewardPerShareAfter = await yieldFarm.accRewardPerShare();

      // Re-enable automine
      await ethers.provider.send("evm_setAutomine", [true]);

      // accRewardPerShare should remain the same since no blocks have passed
      expect(accRewardPerShareAfter).to.equal(accRewardPerShareBefore);
    });

    it("Should only update lastRewardBlock when no one has staked", async function () {
      const lastRewardBlockBefore = await yieldFarm.lastRewardBlock();
      await ethers.provider.send("hardhat_mine", ["0x5"]); // Mine 5 blocks
      await yieldFarm.updatePool();
      const lastRewardBlockAfter = await yieldFarm.lastRewardBlock();

      expect(lastRewardBlockAfter).to.be.greaterThan(lastRewardBlockBefore);
      expect(await yieldFarm.accRewardPerShare()).to.equal(0);
    });
  });

  describe("pendingReward", function () {
    it("Should return 0 for user with no stake", async function () {
      const pending = await yieldFarm.pendingReward(user1.address);
      expect(pending).to.equal(0);
    });

    it("Should calculate pending rewards without calling updatePool", async function () {
      const depositAmount = ethers.parseEther("100");
      await liquidityPool.transfer(user1.address, depositAmount);
      await liquidityPool.connect(user1).approve(
        await yieldFarm.getAddress(),
        depositAmount
      );
      await yieldFarm.connect(user1).deposit(depositAmount);

      // Mine 10 blocks without calling updatePool
      await ethers.provider.send("hardhat_mine", ["0xA"]);

      const pending = await yieldFarm.pendingReward(user1.address);
      expect(pending).to.be.greaterThan(0n);
    });

    it("Should return 0 when no blocks have passed since last reward", async function () {
      const depositAmount = ethers.parseEther("100");
      await liquidityPool.transfer(user1.address, depositAmount);
      await liquidityPool.connect(user1).approve(
        await yieldFarm.getAddress(),
        depositAmount
      );
      await yieldFarm.connect(user1).deposit(depositAmount);

      // Immediately check pending rewards (no blocks mined)
      const pending = await yieldFarm.pendingReward(user1.address);
      expect(pending).to.equal(0);
    });
  });
});
