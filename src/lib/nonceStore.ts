export const nonceStore: { [address: string]: string } = {};

// Add a debug method
export const debugNonceStore = () => {
  console.log('Current nonceStore contents:', nonceStore);
};

// Add configuration for Edge Runtime
export const runtime = 'edge';