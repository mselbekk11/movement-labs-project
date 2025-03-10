// context file for appkit
// This wraps the whole application to provide wallet connectivity
// This is the main file that connects the app to the wallet

'use client';

import { wagmiAdapter, projectId } from '@/../config';
import { createAppKit } from '@reown/appkit/react';
import { mainnet } from '@reown/appkit/networks';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React, { type ReactNode } from 'react';
import { cookieToInitialState, WagmiProvider, type Config } from 'wagmi';

// Set up queryClient
const queryClient = new QueryClient();

if (!projectId) {
  throw new Error('Project ID is not defined');
}

// This is the metadata for the appkit modal that will be displayed within wallets.
const metadata = {
  name: 'Movement Labs',
  description: 'Movement Labs Wallet Registration',
  url: 'http://localhost:3000',
  icons: [
    'https://9gkyc4ano8.ufs.sh/f/bQmZVzMJri47eNBv4b6vj7OIPFERVM3fCUYZsk6uceb4N5Ar',
  ],
};

// This is the modal that will appear when you click connect wallet. The featured wallet IDs are Metamask (EVM) and OKX (Movement Labs).
export const modal = createAppKit({
  adapters: [wagmiAdapter],
  projectId,
  networks: [mainnet],
  defaultNetwork: mainnet,
  metadata: metadata,
  enableWalletConnect: false,
  features: {
    analytics: true,
    email: false,
    socials: false,
  },
  themeMode: 'dark',
  allWallets: 'HIDE',
  featuredWalletIds: [
    'c57ca95b47569778a828d19178114f4db188b89b763c899ba0be274e97267d96', // MetaMask
    '971e689d0a5be527bac79629b4ee9b925e82208e5168b733496a09c0faed0709', // OKX
  ],
});

function ContextProvider({
  children,
  cookies,
}: {
  children: ReactNode;
  cookies: string | null;
}) {
  const initialState = cookieToInitialState(
    wagmiAdapter.wagmiConfig as Config,
    cookies
  );

  return (
    <WagmiProvider
      config={wagmiAdapter.wagmiConfig as Config}
      initialState={initialState}
    >
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </WagmiProvider>
  );
}

export default ContextProvider;
