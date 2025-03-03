// This is an object that stores nonces associated with a wallet address. 
// It's structured as a key-value store where:
// The key is a wallet address (string)
// The value is the nonce (string)

export const nonceStore: { [address: string]: string } = {};

export const debugNonceStore = () => {
  console.log('Current nonceStore contents:', nonceStore);
};

export const runtime = 'edge';