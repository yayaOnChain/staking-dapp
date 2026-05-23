import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import type { Address } from 'viem';
import { 
  CONTRACT_ADDRESSES, 
  NETWORK_CONFIG, 
  DEFAULT_NETWORK, 
  getContractAddress, 
  getExplorerTxUrl, 
  getExplorerAddressUrl 
} from '../../config/constants';

// Mock environment variables
const mockEnv = {
  VITE_POOL_ADDRESS: '0xPoolAddress123456789012345678901234567890' as Address,
  VITE_FARM_ADDRESS: '0xFarmAddress1234567890123456789012345678901' as Address,
  VITE_TOKEN_A_ADDRESS: '0xTokenAAddress12345678901234567890123456789' as Address,
  VITE_TOKEN_B_ADDRESS: '0xTokenBAddress12345678901234567890123456789' as Address,
  VITE_REWARD_TOKEN_ADDRESS: '0xRewardTokenAddress123456789012345678901234567' as Address,
  VITE_SEPOLIA_RPC_URL: 'https://custom-sepolia-rpc.com',
  VITE_MAINNET_RPC_URL: 'https://custom-mainnet-rpc.com',
};

vi.mock('virtual:test-env', () => ({
  env: mockEnv,
}));

describe('constants', () => {
  beforeEach(() => {
    vi.resetModules();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('CONTRACT_ADDRESSES', () => {
    it('should have sepolia network configuration', () => {
      expect(CONTRACT_ADDRESSES.sepolia).toBeDefined();
    });

    it('should have mainnet network configuration', () => {
      expect(CONTRACT_ADDRESSES.mainnet).toBeDefined();
    });

    it('should have all required contract addresses for sepolia', () => {
      const sepolia = CONTRACT_ADDRESSES.sepolia;
      
      expect(sepolia).toHaveProperty('POOL');
      expect(sepolia).toHaveProperty('FARM');
      expect(sepolia).toHaveProperty('TOKEN_A');
      expect(sepolia).toHaveProperty('TOKEN_B');
      expect(sepolia).toHaveProperty('REWARD_TOKEN');
    });

    it('should have all required contract addresses for mainnet', () => {
      const mainnet = CONTRACT_ADDRESSES.mainnet;
      
      expect(mainnet).toHaveProperty('POOL');
      expect(mainnet).toHaveProperty('FARM');
      expect(mainnet).toHaveProperty('TOKEN_A');
      expect(mainnet).toHaveProperty('TOKEN_B');
      expect(mainnet).toHaveProperty('REWARD_TOKEN');
    });

    it('should have valid address format for sepolia contracts', () => {
      const sepolia = CONTRACT_ADDRESSES.sepolia;
      
      expect(sepolia.POOL).toMatch(/^0x[a-fA-F0-9]{40}$/);
      expect(sepolia.FARM).toMatch(/^0x[a-fA-F0-9]{40}$/);
      expect(sepolia.TOKEN_A).toMatch(/^0x[a-fA-F0-9]{40}$/);
      expect(sepolia.TOKEN_B).toMatch(/^0x[a-fA-F0-9]{40}$/);
      expect(sepolia.REWARD_TOKEN).toMatch(/^0x[a-fA-F0-9]{40}$/);
    });

    it('should have zero addresses for mainnet (placeholder)', () => {
      const mainnet = CONTRACT_ADDRESSES.mainnet;
      const zeroAddress = '0x0000000000000000000000000000000000000000';
      
      expect(mainnet.POOL).toBe(zeroAddress);
      expect(mainnet.FARM).toBe(zeroAddress);
      expect(mainnet.TOKEN_A).toBe(zeroAddress);
      expect(mainnet.TOKEN_B).toBe(zeroAddress);
      expect(mainnet.REWARD_TOKEN).toBe(zeroAddress);
    });
  });

  describe('NETWORK_CONFIG', () => {
    it('should have sepolia network configuration', () => {
      expect(NETWORK_CONFIG.sepolia).toBeDefined();
    });

    it('should have mainnet network configuration', () => {
      expect(NETWORK_CONFIG.mainnet).toBeDefined();
    });

    it('should have hardhat network configuration', () => {
      expect(NETWORK_CONFIG.hardhat).toBeDefined();
    });

    it('should have correct sepolia chainId', () => {
      expect(NETWORK_CONFIG.sepolia.chainId).toBe(11155111);
    });

    it('should have correct mainnet chainId', () => {
      expect(NETWORK_CONFIG.mainnet.chainId).toBe(1);
    });

    it('should have correct hardhat chainId', () => {
      expect(NETWORK_CONFIG.hardhat.chainId).toBe(31337);
    });

    it('should have sepolia network name', () => {
      expect(NETWORK_CONFIG.sepolia.name).toBe('Sepolia');
    });

    it('should have mainnet network name', () => {
      expect(NETWORK_CONFIG.mainnet.name).toBe('Ethereum Mainnet');
    });

    it('should have sepolia explorer URL', () => {
      expect(NETWORK_CONFIG.sepolia.explorerUrl).toBe('https://sepolia.etherscan.io');
    });

    it('should have mainnet explorer URL', () => {
      expect(NETWORK_CONFIG.mainnet.explorerUrl).toBe('https://etherscan.io');
    });

    it('should have RPC URLs configured', () => {
      expect(NETWORK_CONFIG.sepolia.rpcUrl).toBeDefined();
      expect(NETWORK_CONFIG.mainnet.rpcUrl).toBeDefined();
    });
  });

  describe('DEFAULT_NETWORK', () => {
    it('should default to sepolia', () => {
      expect(DEFAULT_NETWORK).toBe('sepolia');
    });
  });

  describe('getContractAddress', () => {
    it('should return sepolia pool address by default', () => {
      const address = getContractAddress('POOL');
      expect(address).toBe(CONTRACT_ADDRESSES.sepolia.POOL);
    });

    it('should return address for specified network', () => {
      const address = getContractAddress('POOL', 'mainnet');
      expect(address).toBe(CONTRACT_ADDRESSES.mainnet.POOL);
    });

    it('should return all contract types', () => {
      const pool = getContractAddress('POOL');
      const farm = getContractAddress('FARM');
      const tokenA = getContractAddress('TOKEN_A');
      const tokenB = getContractAddress('TOKEN_B');
      const rewardToken = getContractAddress('REWARD_TOKEN');
      
      expect(pool).toBeDefined();
      expect(farm).toBeDefined();
      expect(tokenA).toBeDefined();
      expect(tokenB).toBeDefined();
      expect(rewardToken).toBeDefined();
    });
  });

  describe('getExplorerTxUrl', () => {
    it('should return sepolia explorer URL for transaction by default', () => {
      const txHash = '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef';
      const url = getExplorerTxUrl(txHash);
      expect(url).toBe(`https://sepolia.etherscan.io/tx/${txHash}`);
    });

    it('should return mainnet explorer URL for transaction', () => {
      const txHash = '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef';
      const url = getExplorerTxUrl(txHash, 'mainnet');
      expect(url).toBe(`https://etherscan.io/tx/${txHash}`);
    });

    it('should handle short transaction hashes', () => {
      const txHash = '0xabc123';
      const url = getExplorerTxUrl(txHash);
      expect(url).toBe(`https://sepolia.etherscan.io/tx/${txHash}`);
    });
  });

  describe('getExplorerAddressUrl', () => {
    it('should return sepolia explorer URL for address by default', () => {
      const address = '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb';
      const url = getExplorerAddressUrl(address);
      expect(url).toBe(`https://sepolia.etherscan.io/address/${address}`);
    });

    it('should return mainnet explorer URL for address', () => {
      const address = '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb';
      const url = getExplorerAddressUrl(address, 'mainnet');
      expect(url).toBe(`https://etherscan.io/address/${address}`);
    });
  });
});
