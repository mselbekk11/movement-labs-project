// this is a simple nonce store that is used to store nonces for wallets

export const nonceStore: { [address: string]: string } = {};

export const debugNonceStore = () => {
  console.log('Current nonceStore contents:', nonceStore);
};

export const runtime = 'edge';