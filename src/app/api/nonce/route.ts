// app/api/nonce/route.ts
import { NextResponse } from 'next/server';
import { nonceStore } from '../../../lib/nonceStore';

export const runtime = 'edge';

function generateNonce() {
  // Use Web Crypto API instead of Node's crypto module
  const array = new Uint8Array(16);
  crypto.getRandomValues(array);
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
}

export async function POST(request: Request) {
  try {
    const { address } = await request.json();
    if (!address) {
      return NextResponse.json({ error: 'No address provided' }, { status: 400 });
    }
    // Generate a random nonce using Web Crypto API
    const nonce = generateNonce();
    // Store the nonce using the lowercased address as key
    nonceStore[address.toLowerCase()] = nonce;
    console.log('Storing nonce:', { address: address.toLowerCase(), nonce });
    console.log('NonceStore after storing:', nonceStore);
    return NextResponse.json({ nonce });
  } catch (err: Error | unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
