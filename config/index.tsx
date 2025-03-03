// This is the config file for Appkits wagmi adapter
// appkit is a library for integrating blockchain functionality into your applications using Wagmi 
// Wagmi provides hooks to interact with blockchain networks.
// This file sets up the configuration for integrating blockchain functionality into your application using wagmi 

// AppKit needs this configuration file because:
  // It establishes how your application will interact with Ethereum networks
  // It sets up persistent storage for user wallet connections
  // It enables server-side rendering support for better performance
  // It configures which networks users can connect to
  // It provides necessary authentication through WalletConnect

import { cookieStorage, createStorage } from 'wagmi';
import { WagmiAdapter } from '@reown/appkit-adapter-wagmi';
import { mainnet } from '@reown/appkit/networks';

export const projectId = process.env.NEXT_PUBLIC_PROJECT_ID;

if (!projectId) {
  throw new Error('Project Id is not defined');
}

// The boilerplate code also had arbitrum which I removed
export const networks = [mainnet];

export const wagmiAdapter = new WagmiAdapter({
  storage: createStorage({
    storage: cookieStorage,
  }),
  ssr: true,
  networks,
  projectId,
});

export const config = wagmiAdapter.wagmiConfig;
