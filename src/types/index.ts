import type { Address } from "viem";

/**
 * Network configurations
 */
export type Network = "sepolia" | "mainnet";

/**
 * Contract addresses configuration
 */
export interface ContractAddresses {
  POOL: Address;
  FARM: Address;
  TOKEN_A: Address;
  TOKEN_B: Address;
  REWARD_TOKEN: Address;
}

/**
 * Token information
 */
export interface TokenInfo {
  address: Address;
  symbol: string;
  name: string;
  decimals: number;
}

/**
 * Pool statistics
 */
export interface PoolStats {
  reserve0: bigint;
  reserve1: bigint;
  totalSupply: bigint;
}

/**
 * User token balance and allowance
 */
export interface TokenBalance {
  balance: bigint;
  allowance: bigint;
}

/**
 * Liquidity position
 */
export interface LiquidityPosition {
  amount0: bigint;
  amount1: bigint;
  lpTokens: bigint;
}

/**
 * Farm user info
 */
export interface FarmUserInfo {
  stakedAmount: bigint;
  rewardDebt: bigint;
  pendingRewards: bigint;
}

/**
 * Transaction status
 */
export type TransactionStatus = "idle" | "pending" | "confirming" | "success" | "error";

/**
 * Swap mode
 */
export type SwapMode = "token0" | "token1";

/**
 * Liquidity mode
 */
export type LiquidityMode = "add" | "remove";
