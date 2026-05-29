import { describe, it, expect, vi, afterEach } from 'vitest';
// import type { Address } from 'viem';
import {
  APP_NAME,
  WALLET_CONNECT_PROJECT_ID,
  CONTRACT_ADDRESSES,
  NETWORK_CONFIG,
  DEFAULT_NETWORK,
  getContractAddress,
  getExplorerTxUrl,
  getExplorerAddressUrl,
} from '../../config/constants';

const zeroAddress = '0x0000000000000000000000000000000000000000';

describe('constants', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('APP_NAME', () => {
    it('should have the correct app name', () => {
      expect(APP_NAME).toBe('Staking DApp');
    });
  });

  describe('WALLET_CONNECT_PROJECT_ID', () => {
    it('should have value from environment', () => {
      expect(WALLET_CONNECT_PROJECT_ID).toBe(import.meta.env.VITE_WALLET_CONNECT_PROJECT_ID as string);
    });
  });

  describe('CONTRACT_ADDRESSES', () => {
    it('should have sepolia network configuration', () => {
      expect(CONTRACT_ADDRESSES.sepolia).toBeDefined();
    });

    it('should have mainnet network configuration', () => {
      expect(CONTRACT_ADDRESSES.mainnet).toBeDefined();
    });

    it('should have hardhat network configuration', () => {
      expect(CONTRACT_ADDRESSES.hardhat).toBeDefined();
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

    it('should have all required contract addresses for hardhat', () => {
      const hardhat = CONTRACT_ADDRESSES.hardhat;

      expect(hardhat).toHaveProperty('POOL');
      expect(hardhat).toHaveProperty('FARM');
      expect(hardhat).toHaveProperty('TOKEN_A');
      expect(hardhat).toHaveProperty('TOKEN_B');
      expect(hardhat).toHaveProperty('REWARD_TOKEN');
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

      expect(mainnet.POOL).toBe(zeroAddress);
      expect(mainnet.FARM).toBe(zeroAddress);
      expect(mainnet.TOKEN_A).toBe(zeroAddress);
      expect(mainnet.TOKEN_B).toBe(zeroAddress);
      expect(mainnet.REWARD_TOKEN).toBe(zeroAddress);
    });

    it('should have valid address format for hardhat contracts', () => {
      const hardhat = CONTRACT_ADDRESSES.hardhat;

      expect(hardhat.POOL).toMatch(/^0x[a-fA-F0-9]{40}$/);
      expect(hardhat.FARM).toMatch(/^0x[a-fA-F0-9]{40}$/);
      expect(hardhat.TOKEN_A).toMatch(/^0x[a-fA-F0-9]{40}$/);
      expect(hardhat.TOKEN_B).toMatch(/^0x[a-fA-F0-9]{40}$/);
      expect(hardhat.REWARD_TOKEN).toMatch(/^0x[a-fA-F0-9]{40}$/);
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

    it('should have hardhat network name', () => {
      expect(NETWORK_CONFIG.hardhat.name).toBe('Hardhat Local');
    });

    it('should have sepolia explorer URL', () => {
      expect(NETWORK_CONFIG.sepolia.explorerUrl).toBe('https://sepolia.etherscan.io');
    });

    it('should have mainnet explorer URL', () => {
      expect(NETWORK_CONFIG.mainnet.explorerUrl).toBe('https://etherscan.io');
    });

    it('should have hardhat explorer URL', () => {
      expect(NETWORK_CONFIG.hardhat.explorerUrl).toBe('');
    });

    it('should have RPC URLs configured', () => {
      expect(NETWORK_CONFIG.sepolia.rpcUrl).toBeDefined();
      expect(NETWORK_CONFIG.mainnet.rpcUrl).toBeDefined();
    });

    it('should have hardhat RPC URL', () => {
      expect(NETWORK_CONFIG.hardhat.rpcUrl).toBe('http://127.0.0.1:8545');
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

    it('should return address for hardhat network', () => {
      const address = getContractAddress('POOL', 'hardhat');
      expect(address).toBe(CONTRACT_ADDRESSES.hardhat.POOL);
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

    it('should return hardhat explorer URL (empty) for transaction', () => {
      const txHash = '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef';
      const url = getExplorerTxUrl(txHash, 'hardhat');
      expect(url).toBe(`/tx/${txHash}`);
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

    it('should return hardhat explorer URL (empty) for address', () => {
      const address = '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb';
      const url = getExplorerAddressUrl(address, 'hardhat');
      expect(url).toBe(`/address/${address}`);
    });
  });
});

describe('env var fallbacks', () => {
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.resetModules();
  });

  it('should use empty string for WALLET_CONNECT_PROJECT_ID when env var is not set', async () => {
    vi.stubEnv('VITE_WALLET_CONNECT_PROJECT_ID', '');
    vi.resetModules();
    const mod = await import('../../config/constants');
    expect(mod.WALLET_CONNECT_PROJECT_ID).toBe('');
  });

  it('should use default sepolia RPC URL when env var is not set', async () => {
    vi.stubEnv('VITE_SEPOLIA_RPC_URL', '');
    vi.resetModules();
    const mod = await import('../../config/constants');
    expect(mod.NETWORK_CONFIG.sepolia.rpcUrl).toBe('https://rpc.sepolia.org');
  });

  it('should use custom mainnet RPC URL when env var is set', async () => {
    vi.stubEnv('VITE_MAINNET_RPC_URL', 'https://custom-mainnet-rpc.com');
    vi.resetModules();
    const mod = await import('../../config/constants');
    expect(mod.NETWORK_CONFIG.mainnet.rpcUrl).toBe('https://custom-mainnet-rpc.com');
  });
});
