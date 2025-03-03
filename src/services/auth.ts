// this is the service file for the auth endpoints

// this getNonce function makes an HTTP POST request to the API route /api/nonce which includes the users wallet address
// if a random nonce is succesfully created by the server, it is returned to the client
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

// this verifyWallet function makes an HTTP POST request to the API route /api/verify which includes:
// The wallet address
// The nonce received earlier
// A signature created by the wallet
// The message that was signed
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

// this registerWallet function makes an HTTP POST request to the API route /api/register which includes:
// The wallet address
// A signature created by the wallet
// The signed message
// A timestamp
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