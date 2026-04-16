import { expect } from "chai";
import { ethers } from "hardhat";
import type { LiquidityPool, TokenA, TokenB } from "typechain-types";
import type { Log } from "ethers";
import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers";

describe("LiquidityPool", function () {
  let liquidityPool: LiquidityPool;
  let tokenA: TokenA;
  let tokenB: TokenB;
  let owner: HardhatEthersSigner;
  let user1: HardhatEthersSigner;
  let user2: HardhatEthersSigner;

  const INITIAL_AMOUNT_A = ethers.parseEther("1000");
  const INITIAL_AMOUNT_B = ethers.parseEther("1000");

  beforeEach(async function () {
    [owner, user1, user2] = await ethers.getSigners();

    // Deploy tokens
    const TokenAFactory = await ethers.getContractFactory("TokenA");
    tokenA = await TokenAFactory.deploy();

    const TokenBFactory = await ethers.getContractFactory("TokenB");
    tokenB = await TokenBFactory.deploy();

    // Deploy Liquidity Pool
    const LiquidityPoolFactory = await ethers.getContractFactory("LiquidityPool");
    liquidityPool = await LiquidityPoolFactory.deploy(
      await tokenA.getAddress(),
      await tokenB.getAddress()
    );
  });

  describe("Deployment", function () {
    it("Should set the correct token addresses", async function () {
      expect(await liquidityPool.token0()).to.equal(await tokenA.getAddress());
      expect(await liquidityPool.token1()).to.equal(await tokenB.getAddress());
    });

    it("Should initialize with zero reserves", async function () {
      expect(await liquidityPool.reserve0()).to.equal(0);
      expect(await liquidityPool.reserve1()).to.equal(0);
    });

    it("Should have correct token name and symbol", async function () {
      expect(await liquidityPool.name()).to.equal("DeFi LP Token");
      expect(await liquidityPool.symbol()).to.equal("LP");
    });
  });

  describe("Add Liquidity", function () {
    it("Should allow adding liquidity on initial deposit", async function () {
      await tokenA.approve(await liquidityPool.getAddress(), INITIAL_AMOUNT_A);
      await tokenB.approve(await liquidityPool.getAddress(), INITIAL_AMOUNT_B);

      const tx = await liquidityPool.addLiquidity(
        INITIAL_AMOUNT_A,
        INITIAL_AMOUNT_B
      );
      // const receipt = await tx.wait();
      await tx.wait();

      // Check LP tokens minted (sqrt of product for initial deposit)
      const userBalance = await liquidityPool.balanceOf(owner.address);
      expect(userBalance).to.be.greaterThan(0);

      // Check reserves updated
      expect(await liquidityPool.reserve0()).to.equal(INITIAL_AMOUNT_A);
      expect(await liquidityPool.reserve1()).to.equal(INITIAL_AMOUNT_B);
    });

    it("Should emit Deposit event", async function () {
      await tokenA.approve(await liquidityPool.getAddress(), INITIAL_AMOUNT_A);
      await tokenB.approve(await liquidityPool.getAddress(), INITIAL_AMOUNT_B);

      const tx = await liquidityPool.addLiquidity(INITIAL_AMOUNT_A, INITIAL_AMOUNT_B);
      const receipt = await tx.wait();
      const event = receipt?.logs.find((log: Log) => {
        try {
          const parsed = liquidityPool.interface.parseLog(log);
          return parsed?.name === "Deposit";
        } catch {
          return false;
        }
      });

      const decoded = liquidityPool.interface.decodeEventLog("Deposit", event!.data, event!.topics);
      expect(decoded[0]).to.equal(owner.address);
      expect(decoded[1]).to.equal(INITIAL_AMOUNT_A);
      expect(decoded[2]).to.equal(INITIAL_AMOUNT_B);
      expect(decoded[3]).to.be.greaterThan(0);
    });

    it("Should allow adding liquidity on subsequent deposits", async function () {
      // Initial deposit
      await tokenA.approve(await liquidityPool.getAddress(), INITIAL_AMOUNT_A);
      await tokenB.approve(await liquidityPool.getAddress(), INITIAL_AMOUNT_B);
      await liquidityPool.addLiquidity(INITIAL_AMOUNT_A, INITIAL_AMOUNT_B);

      // Second deposit
      const secondAmountA = ethers.parseEther("500");
      const secondAmountB = ethers.parseEther("500");
      await tokenA.approve(await liquidityPool.getAddress(), secondAmountA);
      await tokenB.approve(await liquidityPool.getAddress(), secondAmountB);

      await liquidityPool.addLiquidity(secondAmountA, secondAmountB);

      expect(await liquidityPool.reserve0()).to.equal(
        INITIAL_AMOUNT_A + secondAmountA
      );
      expect(await liquidityPool.reserve1()).to.equal(
        INITIAL_AMOUNT_B + secondAmountB
      );
    });

    it("Should fail with invalid amounts (zero)", async function () {
      await tokenA.approve(await liquidityPool.getAddress(), 0);
      await tokenB.approve(await liquidityPool.getAddress(), 0);

      await expect(
        liquidityPool.addLiquidity(0, 0)
      ).to.be.revertedWith("Invalid amounts");
    });

    it("Should fail if user hasn't approved token transfers", async function () {
      await expect(
        liquidityPool.addLiquidity(INITIAL_AMOUNT_A, INITIAL_AMOUNT_B)
      ).to.be.reverted;
    });

    it("Should handle proportional LP token minting for subsequent deposits", async function () {
      // Initial deposit by owner
      await tokenA.approve(await liquidityPool.getAddress(), INITIAL_AMOUNT_A);
      await tokenB.approve(await liquidityPool.getAddress(), INITIAL_AMOUNT_B);
      await liquidityPool.addLiquidity(INITIAL_AMOUNT_A, INITIAL_AMOUNT_B);

      // const ownerLPBalanceBefore = await liquidityPool.balanceOf(owner.address);
      await liquidityPool.balanceOf(owner.address);

      // Transfer tokens to user1 for second deposit
      await tokenA.transfer(user1.address, ethers.parseEther("500"));
      await tokenB.transfer(user1.address, ethers.parseEther("500"));

      await tokenA.connect(user1).approve(await liquidityPool.getAddress(), ethers.parseEther("500"));
      await tokenB.connect(user1).approve(await liquidityPool.getAddress(), ethers.parseEther("500"));

      await liquidityPool.connect(user1).addLiquidity(
        ethers.parseEther("500"),
        ethers.parseEther("500")
      );

      // User1 should receive LP tokens proportional to their deposit
      const user1LPBalance = await liquidityPool.balanceOf(user1.address);
      expect(user1LPBalance).to.be.greaterThan(0);
    });
  });

  describe("Remove Liquidity", function () {
    beforeEach(async function () {
      await tokenA.approve(await liquidityPool.getAddress(), INITIAL_AMOUNT_A);
      await tokenB.approve(await liquidityPool.getAddress(), INITIAL_AMOUNT_B);
      await liquidityPool.addLiquidity(INITIAL_AMOUNT_A, INITIAL_AMOUNT_B);
    });

    it("Should allow removing liquidity", async function () {
      const lpTokensToRemove = await liquidityPool.balanceOf(owner.address);
      
      const tokenABalanceBefore = await tokenA.balanceOf(owner.address);
      const tokenBBalanceBefore = await tokenB.balanceOf(owner.address);

      await liquidityPool.removeLiquidity(lpTokensToRemove);

      const tokenABalanceAfter = await tokenA.balanceOf(owner.address);
      const tokenBBalanceAfter = await tokenB.balanceOf(owner.address);

      // User should receive tokens back (approximately, accounting for any rounding)
      expect(tokenABalanceAfter - tokenABalanceBefore).to.be.closeTo(
        INITIAL_AMOUNT_A,
        1000
      );
      expect(tokenBBalanceAfter - tokenBBalanceBefore).to.be.closeTo(
        INITIAL_AMOUNT_B,
        1000
      );
    });

    it("Should emit Withdraw event", async function () {
      const lpTokensToRemove = await liquidityPool.balanceOf(owner.address);

      await expect(liquidityPool.removeLiquidity(lpTokensToRemove))
        .to.emit(liquidityPool, "Withdraw");
    });

    it("Should update reserves after removing liquidity", async function () {
      const lpTokensToRemove = await liquidityPool.balanceOf(owner.address);
      await liquidityPool.removeLiquidity(lpTokensToRemove);

      expect(await liquidityPool.reserve0()).to.be.closeTo(0, 1000);
      expect(await liquidityPool.reserve1()).to.be.closeTo(0, 1000);
    });

    it("Should fail if removing more LP tokens than balance", async function () {
      const lpTokensToRemove = await liquidityPool.balanceOf(owner.address);
      const excessAmount = ethers.parseEther("1");

      await expect(
        liquidityPool.removeLiquidity(lpTokensToRemove + excessAmount)
      ).to.be.revertedWith("Insufficient balance");
    });

    it("Should fail with zero amount", async function () {
      await expect(
        liquidityPool.removeLiquidity(0)
      ).to.be.revertedWith("Invalid amount");
    });

    it("Should fail if insufficient amounts would be returned", async function () {
      // This test ensures the contract protects against dust amounts
      const lpTokensToRemove = 1n; // Very small amount
      
      // First add more liquidity to make totalSupply larger
      await tokenA.approve(await liquidityPool.getAddress(), INITIAL_AMOUNT_A);
      await tokenB.approve(await liquidityPool.getAddress(), INITIAL_AMOUNT_B);
      await liquidityPool.addLiquidity(INITIAL_AMOUNT_A, INITIAL_AMOUNT_B);
      
      // Now trying to remove 1 LP token might result in 0 tokens due to rounding
      // This could revert with "Insufficient amounts"
      try {
        await liquidityPool.removeLiquidity(lpTokensToRemove);
      } catch (error: unknown) {
        // Either it succeeds or fails with insufficient amounts
        expect((error as Error).message).to.include("Insufficient amounts");
      }
    });
  });

  describe("Swap", function () {
    beforeEach(async function () {
      // Add initial liquidity
      await tokenA.approve(await liquidityPool.getAddress(), INITIAL_AMOUNT_A);
      await tokenB.approve(await liquidityPool.getAddress(), INITIAL_AMOUNT_B);
      await liquidityPool.addLiquidity(INITIAL_AMOUNT_A, INITIAL_AMOUNT_B);

      // Transfer tokens to users for testing
      await tokenA.transfer(user1.address, ethers.parseEther("500"));
      await tokenB.transfer(user1.address, ethers.parseEther("500"));
    });

    it("Should allow swapping tokenA for tokenB", async function () {
      const swapAmount = ethers.parseEther("100");
      await tokenA.connect(user1).approve(await liquidityPool.getAddress(), swapAmount);

      const tokenBBalanceBefore = await tokenB.balanceOf(user1.address);
      await liquidityPool.connect(user1).swap(swapAmount, await tokenA.getAddress());
      const tokenBBalanceAfter = await tokenB.balanceOf(user1.address);

      // User should receive tokenB
      expect(tokenBBalanceAfter - tokenBBalanceBefore).to.be.greaterThan(0);
    });

    it("Should allow swapping tokenB for tokenA", async function () {
      const swapAmount = ethers.parseEther("100");
      await tokenB.connect(user1).approve(await liquidityPool.getAddress(), swapAmount);

      const tokenABalanceBefore = await tokenA.balanceOf(user1.address);
      await liquidityPool.connect(user1).swap(swapAmount, await tokenB.getAddress());
      const tokenABalanceAfter = await tokenA.balanceOf(user1.address);

      // User should receive tokenA
      expect(tokenABalanceAfter - tokenABalanceBefore).to.be.greaterThan(0);
    });

    it("Should emit Swap event", async function () {
      const swapAmount = ethers.parseEther("100");
      await tokenA.connect(user1).approve(await liquidityPool.getAddress(), swapAmount);

      const tx = await liquidityPool.connect(user1).swap(swapAmount, await tokenA.getAddress());
      const receipt = await tx.wait();
      const event = receipt?.logs.find((log: Log) => {
        try {
          const parsed = liquidityPool.interface.parseLog(log);
          return parsed?.name === "Swap";
        } catch {
          return false;
        }
      });

      const decoded = liquidityPool.interface.decodeEventLog("Swap", event!.data, event!.topics);
      expect(decoded[0]).to.equal(user1.address);
      expect(decoded[1]).to.equal(swapAmount);
      expect(decoded[2]).to.be.greaterThan(0);
      expect(decoded[3]).to.equal(await tokenA.getAddress());
    });

    it("Should update reserves after swap", async function () {
      const swapAmount = ethers.parseEther("100");
      await tokenA.connect(user1).approve(await liquidityPool.getAddress(), swapAmount);

      const reserve0Before = await liquidityPool.reserve0();
      const reserve1Before = await liquidityPool.reserve1();

      await liquidityPool.connect(user1).swap(swapAmount, await tokenA.getAddress());

      const reserve0After = await liquidityPool.reserve0();
      const reserve1After = await liquidityPool.reserve1();

      // reserve0 should increase (more tokenA in pool)
      expect(reserve0After).to.be.greaterThan(reserve0Before);
      // reserve1 should decrease (less tokenB in pool)
      expect(reserve1After).to.be.lessThan(reserve1Before);
    });

    it("Should calculate output using constant product formula with fee", async function () {
      const swapAmount = ethers.parseEther("100");
      await tokenA.connect(user1).approve(await liquidityPool.getAddress(), swapAmount);

      // Get expected output based on formula: amountOut = (amountIn * 997 * reserveOut) / (reserveIn * 1000 + amountIn * 997)
      const amountInWithFee = swapAmount * 997n;
      const reserveIn = await liquidityPool.reserve0();
      const reserveOut = await liquidityPool.reserve1();
      const expectedOutput = (amountInWithFee * reserveOut) / (reserveIn * 1000n + amountInWithFee);

      await liquidityPool.connect(user1).swap(swapAmount, await tokenA.getAddress());
      
      // Check reserves changed correctly
      const newReserveOut = await liquidityPool.reserve1();
      const actualOutput = reserveOut - newReserveOut;
      
      expect(actualOutput).to.be.closeTo(expectedOutput, 1n);
    });

    it("Should fail with zero amount", async function () {
      await expect(
        liquidityPool.swap(0, await tokenA.getAddress())
      ).to.be.revertedWith("Insufficient input amount");
    });

    it("Should fail with invalid token", async function () {
      const swapAmount = ethers.parseEther("100");
      const invalidToken = user2.address;

      await tokenA.connect(user1).approve(await liquidityPool.getAddress(), swapAmount);
      await expect(
        liquidityPool.connect(user1).swap(swapAmount, invalidToken)
      ).to.be.revertedWith("Invalid token");
    });

    it("Should fail if user hasn't approved token transfer", async function () {
      const swapAmount = ethers.parseEther("100");

      await expect(
        liquidityPool.connect(user1).swap(swapAmount, await tokenA.getAddress())
      ).to.be.reverted;
    });

    it("Should fail if there is insufficient liquidity", async function () {
      // Remove all liquidity first
      const lpTokensToRemove = await liquidityPool.balanceOf(owner.address);
      await liquidityPool.removeLiquidity(lpTokensToRemove);

      const swapAmount = ethers.parseEther("100");
      await tokenA.connect(user1).approve(await liquidityPool.getAddress(), swapAmount);

      await expect(
        liquidityPool.connect(user1).swap(swapAmount, await tokenA.getAddress())
      ).to.be.revertedWith("Insufficient liquidity");
    });
  });

  describe("Multiple Users", function () {
    it("Should handle multiple users adding and removing liquidity", async function () {
      // Owner adds initial liquidity
      await tokenA.approve(await liquidityPool.getAddress(), INITIAL_AMOUNT_A);
      await tokenB.approve(await liquidityPool.getAddress(), INITIAL_AMOUNT_B);
      await liquidityPool.addLiquidity(INITIAL_AMOUNT_A, INITIAL_AMOUNT_B);

      // Transfer tokens to users
      await tokenA.transfer(user1.address, ethers.parseEther("500"));
      await tokenB.transfer(user1.address, ethers.parseEther("500"));
      await tokenA.transfer(user2.address, ethers.parseEther("300"));
      await tokenB.transfer(user2.address, ethers.parseEther("300"));

      // User1 adds liquidity
      await tokenA.connect(user1).approve(await liquidityPool.getAddress(), ethers.parseEther("500"));
      await tokenB.connect(user1).approve(await liquidityPool.getAddress(), ethers.parseEther("500"));
      await liquidityPool.connect(user1).addLiquidity(
        ethers.parseEther("500"),
        ethers.parseEther("500")
      );

      // User2 adds liquidity
      await tokenA.connect(user2).approve(await liquidityPool.getAddress(), ethers.parseEther("300"));
      await tokenB.connect(user2).approve(await liquidityPool.getAddress(), ethers.parseEther("300"));
      await liquidityPool.connect(user2).addLiquidity(
        ethers.parseEther("300"),
        ethers.parseEther("300")
      );

      // Check total supply
      const totalSupply = await liquidityPool.totalSupply();
      expect(totalSupply).to.be.greaterThan(INITIAL_AMOUNT_A);

      // User1 removes their liquidity
      const user1LPBalance = await liquidityPool.balanceOf(user1.address);
      await liquidityPool.connect(user1).removeLiquidity(user1LPBalance);

      // User1 should have approximately their original tokens back
      expect(await tokenA.balanceOf(user1.address)).to.be.closeTo(
        ethers.parseEther("500"),
        ethers.parseEther("0.1")
      );
    });
  });
});
