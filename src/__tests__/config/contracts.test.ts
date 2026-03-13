import { describe, it, expect } from 'vitest';
import { CONTRACT_ADDRESSES, getContractAddress } from '../../config/contracts';

describe('contracts config', () => {
  describe('CONTRACT_ADDRESSES re-export', () => {
    it('should export CONTRACT_ADDRESSES', () => {
      expect(CONTRACT_ADDRESSES).toBeDefined();
    });

    it('should have sepolia network', () => {
      expect(CONTRACT_ADDRESSES.sepolia).toBeDefined();
    });

    it('should have mainnet network', () => {
      expect(CONTRACT_ADDRESSES.mainnet).toBeDefined();
    });
  });

  describe('getContractAddress re-export', () => {
    it('should export getContractAddress function', () => {
      expect(getContractAddress).toBeDefined();
      expect(typeof getContractAddress).toBe('function');
    });

    it('should return pool address', () => {
      const address = getContractAddress('POOL');
      expect(address).toBeDefined();
    });

    it('should return farm address', () => {
      const address = getContractAddress('FARM');
      expect(address).toBeDefined();
    });
  });
});
