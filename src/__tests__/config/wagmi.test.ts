import { describe, it, expect, vi, beforeEach } from 'vitest';

const getDefaultConfigMock = vi.fn((options: unknown) => ({
  kind: 'wagmi-config',
  options,
}));
const httpMock = vi.fn((url: string) => ({ transportUrl: url }));

vi.mock('@rainbow-me/rainbowkit', () => ({
  getDefaultConfig: (options: unknown) => getDefaultConfigMock(options),
}));

vi.mock('wagmi', () => ({
  http: (url: string) => httpMock(url),
}));

vi.mock('wagmi/chains', () => ({
  hardhat: { id: 31337, name: 'Hardhat' },
  sepolia: { id: 11155111, name: 'Sepolia' },
}));

vi.mock('@/config/constants', () => ({
  APP_NAME: 'Staking DApp',
  WALLET_CONNECT_PROJECT_ID: 'wallet-connect-project-id',
  NETWORK_CONFIG: {
    hardhat: { rpcUrl: 'http://127.0.0.1:8545' },
    sepolia: { rpcUrl: 'https://rpc.sepolia.org' },
  },
}));

describe('wagmi config', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should include hardhat chain in development mode', async () => {
    const { createWagmiConfig } = await import('@/config/wagmi');
    const config = createWagmiConfig(true);

    expect(getDefaultConfigMock).toHaveBeenCalledWith({
      appName: 'Staking DApp',
      projectId: 'wallet-connect-project-id',
      chains: [
        { id: 31337, name: 'Hardhat' },
        { id: 11155111, name: 'Sepolia' },
      ],
      transports: {
        31337: { transportUrl: 'http://127.0.0.1:8545' },
        11155111: { transportUrl: 'https://rpc.sepolia.org' },
      },
    });

    expect(httpMock).toHaveBeenCalledWith('http://127.0.0.1:8545');
    expect(httpMock).toHaveBeenCalledWith('https://rpc.sepolia.org');
    expect(config).toEqual({
      kind: 'wagmi-config',
      options: expect.any(Object),
    });
  });

  it('should exclude hardhat chain in production mode', async () => {
    const { createWagmiConfig } = await import('@/config/wagmi');
    const config = createWagmiConfig(false);

    expect(getDefaultConfigMock).toHaveBeenCalledWith({
      appName: 'Staking DApp',
      projectId: 'wallet-connect-project-id',
      chains: [
        { id: 11155111, name: 'Sepolia' },
      ],
      transports: {
        11155111: { transportUrl: 'https://rpc.sepolia.org' },
      },
    });

    expect(httpMock).not.toHaveBeenCalledWith('http://127.0.0.1:8545');
    expect(httpMock).toHaveBeenCalledWith('https://rpc.sepolia.org');
    expect(config).toEqual({
      kind: 'wagmi-config',
      options: expect.any(Object),
    });
  });
});
