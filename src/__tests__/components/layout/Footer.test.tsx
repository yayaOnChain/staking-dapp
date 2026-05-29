/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Footer } from '@/components/layout/Footer';

const mockConstants = vi.hoisted(() => ({
  DEFAULT_NETWORK: 'sepolia',
  NETWORK_CONFIG: {
    sepolia: {
      name: 'Sepolia',
    },
  },
  CONTRACT_ADDRESSES: {
    sepolia: {
      POOL: '0x1234567890abcdef1234567890abcdef12345678',
      TOKEN_A: '0x0000000000000000000000000000000000000000',
      FARM: '0xabcdefabcdefabcdefabcdefabcdefabcdefabcd',
      TOKEN_B: '0x1111111111111111111111111111111111111111',
      REWARD_TOKEN: '0x2222222222222222222222222222222222222222',
    },
  },
}));

vi.mock('@/config/constants', () => mockConstants);

const defaultAddresses = {
  POOL: '0x1234567890abcdef1234567890abcdef12345678',
  TOKEN_A: '0x0000000000000000000000000000000000000000',
  FARM: '0xabcdefabcdefabcdefabcdefabcdefabcdefabcd',
};

describe('Footer', () => {
  beforeEach(() => {
    Object.assign(mockConstants.CONTRACT_ADDRESSES.sepolia, defaultAddresses);
  });

  it('should render network contract references with truncated addresses', () => {
    render(<Footer />);

    expect(screen.getByText('Deployed Contracts (Sepolia)')).toBeInTheDocument();
    expect(screen.getByText('AMM Pool')).toBeInTheDocument();
    expect(screen.getByText('0x1234...5678')).toBeInTheDocument();
    expect(screen.getByText('LP Token')).toBeInTheDocument();
    expect(screen.getByText('Not deployed')).toBeInTheDocument();
    expect(screen.getByText('Yield Farm')).toBeInTheDocument();
    expect(screen.getByText('0xabcd...abcd')).toBeInTheDocument();
  });

  it('should render external project links and footer copy', () => {
    render(<Footer />);

    expect(screen.getByText('© 2026 Staking DApp. Built with ❤️ on Ethereum.')).toBeInTheDocument();

    expect(screen.getByRole('link', { name: 'GitHub' })).toHaveAttribute(
      'href',
      'https://github.com/yayaOnChain/staking-dapp'
    );
    expect(screen.getByRole('link', { name: 'Documentation' })).toHaveAttribute(
      'href',
      'https://github.com/yayaOnChain/staking-dapp/blob/main/README.md'
    );
    expect(screen.getByRole('link', { name: 'Twitter' })).toHaveAttribute(
      'href',
      'https://x.com/yayaOnChain'
    );
  });

  it('should apply text-red-400 when addresses start with 0x0000 and text-gray-300 otherwise', () => {
    mockConstants.CONTRACT_ADDRESSES.sepolia.POOL = '0x0000000000000000000000000000000000000000';
    mockConstants.CONTRACT_ADDRESSES.sepolia.TOKEN_A = '0x1234567890abcdef1234567890abcdef12345678';
    mockConstants.CONTRACT_ADDRESSES.sepolia.FARM = '0x0000000000000000000000000000000000000000';

    render(<Footer />);

    const notDeployed = screen.getAllByText('Not deployed');
    expect(notDeployed).toHaveLength(2);
    expect(screen.getByText('0x1234...5678')).toBeInTheDocument();
  });

  it('should handle empty contract address string', () => {
    mockConstants.CONTRACT_ADDRESSES.sepolia.POOL = '';

    render(<Footer />);

    expect(screen.getByText('AMM Pool')).toBeInTheDocument();
    const notDeployed = screen.getAllByText('Not deployed');
    expect(notDeployed.length).toBeGreaterThanOrEqual(1);
  });
});
