// this is the service file for the auth endpoints

// Gets a random nonce (number used once) from the server for a given wallet address
// Makes a POST request to /api/nonce endpoint
export async function getNonce(address: string) {
  const response = await fetch('/api/nonce', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ address }),
  });
  const data = await response.json();
  if (!data.nonce) {
    throw new Error('No nonce returned from server.');
  }
  return data.nonce;
}

// Verifies wallet ownership by checking:
// The wallet address
// The nonce received earlier
// A signature created by the wallet
// The message that was signed
// Makes a POST request to /api/verify endpoint
export async function verifyWallet(params: {
  address: string;
  nonce: string;
  signature: string;
  message: string;
}) {
  const response = await fetch('/api/verify', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  });
  const data = await response.json();
  if (!data.success) {
    throw new Error('Wallet ownership verification failed');
  }
  return data;
}

// Registers a wallet in the system with:
// The wallet address
// A signature
// The signed message
// A timestamp
// Makes a POST request to /api/register endpoint
export async function registerWallet(params: {
  address: string;
  signature: string;
  message: string;
  timestamp: number;
}) {
  const response = await fetch('/api/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  });
  
  const data = await response.json();
  if (!response.ok) {
    // Return an object with success: false and the error message
    // instead of throwing an error
    return { success: false, message: data.message };
  }
  return { success: true, data };
}