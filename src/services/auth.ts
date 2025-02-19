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
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message);
  }
  return response.json();
}