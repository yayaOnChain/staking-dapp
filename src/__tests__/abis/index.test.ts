import { describe, it, expect } from 'vitest';
import { LIQUIDITY_POOL_ABI, YIELD_FARM_ABI, ERC20_ABI } from "@/abis/index";

describe('ABIs', () => {
  describe('LIQUIDITY_POOL_ABI', () => {
    it('should be defined', () => {
      expect(LIQUIDITY_POOL_ABI).toBeDefined();
    });

    it('should be an array', () => {
      expect(Array.isArray(LIQUIDITY_POOL_ABI)).toBe(true);
    });

    it('should have swap function', () => {
      const swapFunction = LIQUIDITY_POOL_ABI.find(
        (item) => item.type === 'function' && item.name === 'swap'
      );
      expect(swapFunction).toBeDefined();
    });

    it('should have reserve0 function', () => {
      const reserve0Function = LIQUIDITY_POOL_ABI.find(
        (item) => item.type === 'function' && item.name === 'reserve0'
      );
      expect(reserve0Function).toBeDefined();
    });

    it('should have reserve1 function', () => {
      const reserve1Function = LIQUIDITY_POOL_ABI.find(
        (item) => item.type === 'function' && item.name === 'reserve1'
      );
      expect(reserve1Function).toBeDefined();
    });

    it('should have addLiquidity function', () => {
      const addLiquidityFunction = LIQUIDITY_POOL_ABI.find(
        (item) => item.type === 'function' && item.name === 'addLiquidity'
      );
      expect(addLiquidityFunction).toBeDefined();
    });

    it('should have removeLiquidity function', () => {
      const removeLiquidityFunction = LIQUIDITY_POOL_ABI.find(
        (item) => item.type === 'function' && item.name === 'removeLiquidity'
      );
      expect(removeLiquidityFunction).toBeDefined();
    });

    it('should have totalSupply function', () => {
      const totalSupplyFunction = LIQUIDITY_POOL_ABI.find(
        (item) => item.type === 'function' && item.name === 'totalSupply'
      );
      expect(totalSupplyFunction).toBeDefined();
    });

    it('swap function should have correct inputs', () => {
      const swapFunction = LIQUIDITY_POOL_ABI.find(
        (item) => item.type === 'function' && item.name === 'swap'
      );
      expect(swapFunction?.inputs).toHaveLength(3);
      expect(swapFunction?.inputs[0]?.name).toBe('amountIn');
      expect(swapFunction?.inputs[1]?.name).toBe('minAmountOut');
      expect(swapFunction?.inputs[2]?.name).toBe('tokenIn');
    });

    it('addLiquidity function should have correct inputs', () => {
      const addLiquidityFunction = LIQUIDITY_POOL_ABI.find(
        (item) => item.type === 'function' && item.name === 'addLiquidity'
      );
      expect(addLiquidityFunction?.inputs).toHaveLength(3);
      expect(addLiquidityFunction?.inputs[0]?.name).toBe('amount0');
      expect(addLiquidityFunction?.inputs[1]?.name).toBe('amount1');
      expect(addLiquidityFunction?.inputs[2]?.name).toBe('minLPTokens');
    });
  });

  describe('YIELD_FARM_ABI', () => {
    it('should be defined', () => {
      expect(YIELD_FARM_ABI).toBeDefined();
    });

    it('should be an array', () => {
      expect(Array.isArray(YIELD_FARM_ABI)).toBe(true);
    });

    it('should have deposit function', () => {
      const depositFunction = YIELD_FARM_ABI.find(
        (item) => item.type === 'function' && item.name === 'deposit'
      );
      expect(depositFunction).toBeDefined();
    });

    it('should have withdraw function', () => {
      const withdrawFunction = YIELD_FARM_ABI.find(
        (item) => item.type === 'function' && item.name === 'withdraw'
      );
      expect(withdrawFunction).toBeDefined();
    });

    it('should have pendingReward function', () => {
      const pendingRewardFunction = YIELD_FARM_ABI.find(
        (item) => item.type === 'function' && item.name === 'pendingReward'
      );
      expect(pendingRewardFunction).toBeDefined();
    });

    it('should have userInfo function', () => {
      const userInfoFunction = YIELD_FARM_ABI.find(
        (item) => item.type === 'function' && item.name === 'userInfo'
      );
      expect(userInfoFunction).toBeDefined();
    });

    it('should have totalStaked function', () => {
      const totalStakedFunction = YIELD_FARM_ABI.find(
        (item) => item.type === 'function' && item.name === 'totalStaked'
      );
      expect(totalStakedFunction).toBeDefined();
    });

    it('deposit function should have correct inputs', () => {
      const depositFunction = YIELD_FARM_ABI.find(
        (item) => item.type === 'function' && item.name === 'deposit'
      );
      expect(depositFunction?.inputs).toHaveLength(1);
      expect(depositFunction?.inputs[0]?.name).toBe('amount');
    });

    it('pendingReward function should have correct inputs', () => {
      const pendingRewardFunction = YIELD_FARM_ABI.find(
        (item) => item.type === 'function' && item.name === 'pendingReward'
      );
      expect(pendingRewardFunction?.inputs).toHaveLength(1);
      expect(pendingRewardFunction?.inputs[0]?.name).toBe('_user');
    });
  });

  describe('ERC20_ABI', () => {
    it('should be defined', () => {
      expect(ERC20_ABI).toBeDefined();
    });

    it('should be an array', () => {
      expect(Array.isArray(ERC20_ABI)).toBe(true);
    });

    it('should have approve function', () => {
      const approveFunction = ERC20_ABI.find(
        (item) => item.type === 'function' && item.name === 'approve'
      );
      expect(approveFunction).toBeDefined();
    });

    it('should have balanceOf function', () => {
      const balanceOfFunction = ERC20_ABI.find(
        (item) => item.type === 'function' && item.name === 'balanceOf'
      );
      expect(balanceOfFunction).toBeDefined();
    });

    it('should have allowance function', () => {
      const allowanceFunction = ERC20_ABI.find(
        (item) => item.type === 'function' && item.name === 'allowance'
      );
      expect(allowanceFunction).toBeDefined();
    });

    it('should have symbol function', () => {
      const symbolFunction = ERC20_ABI.find(
        (item) => item.type === 'function' && item.name === 'symbol'
      );
      expect(symbolFunction).toBeDefined();
    });

    it('should have name function', () => {
      const nameFunction = ERC20_ABI.find(
        (item) => item.type === 'function' && item.name === 'name'
      );
      expect(nameFunction).toBeDefined();
    });

    it('should have decimals function', () => {
      const decimalsFunction = ERC20_ABI.find(
        (item) => item.type === 'function' && item.name === 'decimals'
      );
      expect(decimalsFunction).toBeDefined();
    });

    it('approve function should have correct inputs', () => {
      const approveFunction = ERC20_ABI.find(
        (item) => item.type === 'function' && item.name === 'approve'
      );
      expect(approveFunction?.inputs).toHaveLength(2);
      expect(approveFunction?.inputs[0]?.name).toBe('spender');
      expect(approveFunction?.inputs[1]?.name).toBe('amount');
    });

    it('balanceOf function should have correct inputs', () => {
      const balanceOfFunction = ERC20_ABI.find(
        (item) => item.type === 'function' && item.name === 'balanceOf'
      );
      expect(balanceOfFunction?.inputs).toHaveLength(1);
      expect(balanceOfFunction?.inputs[0]?.name).toBe('account');
    });

    it('allowance function should have correct inputs', () => {
      const allowanceFunction = ERC20_ABI.find(
        (item) => item.type === 'function' && item.name === 'allowance'
      );
      expect(allowanceFunction?.inputs).toHaveLength(2);
      expect(allowanceFunction?.inputs[0]?.name).toBe('owner');
      expect(allowanceFunction?.inputs[1]?.name).toBe('spender');
    });
  });

  describe('ABI structure validation', () => {
    it('all ABI items should have type property', () => {
      const allAbis = [...LIQUIDITY_POOL_ABI, ...YIELD_FARM_ABI, ...ERC20_ABI];
      allAbis.forEach((item) => {
        expect(item).toHaveProperty('type');
      });
    });

    it('all function items should have name property', () => {
      const allAbis = [...LIQUIDITY_POOL_ABI, ...YIELD_FARM_ABI, ...ERC20_ABI];
      const functions = allAbis.filter((item) => item.type === 'function');
      functions.forEach((item) => {
        expect(item).toHaveProperty('name');
      });
    });

    it('all function items should have inputs array', () => {
      const allAbis = [...LIQUIDITY_POOL_ABI, ...YIELD_FARM_ABI, ...ERC20_ABI];
      const functions = allAbis.filter((item) => item.type === 'function');
      functions.forEach((item) => {
        expect(item).toHaveProperty('inputs');
        expect(Array.isArray(item.inputs)).toBe(true);
      });
    });

    it('all function items should have stateMutability property', () => {
      const allAbis = [...LIQUIDITY_POOL_ABI, ...YIELD_FARM_ABI, ...ERC20_ABI];
      const functions = allAbis.filter((item) => item.type === 'function');
      functions.forEach((item) => {
        expect(item).toHaveProperty('stateMutability');
      });
    });
  });
});
