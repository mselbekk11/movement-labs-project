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

// Set up metadata
const metadata = {
  name: 'Movement Labs',
  description: 'Movement Labs Wallet Registration',
  url: 'http://localhost:3000', // origin must match your domain & subdomain
  icons: [
    'https://9gkyc4ano8.ufs.sh/f/bQmZVzMJri47eNBv4b6vj7OIPFERVM3fCUYZsk6uceb4N5Ar',
  ],
};

// Create the modal
const modal = createAppKit({
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
