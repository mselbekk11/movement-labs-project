// This file implements a nonce (number used once) generation API endpoint
// It creates a secure random nonce that can be used for authentication or verification purposes

import { NextResponse } from 'next/server';
import { nonceStore } from '../../../lib/nonceStore';
import { rateLimit } from '@/lib/rateLimit';
export const runtime = 'edge';

// Using Web Crypto API to genegrate a cryptographically secure random value
function generateNonce() {
  const array = new Uint8Array(16);
  crypto.getRandomValues(array);
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
}

// POST Endpoint Handler
export async function POST(request: Request) {
  try {

    // 1. Extracts the client's IP address from the request headers
    const forwardedFor = request.headers.get('x-forwarded-for');
    const ip = forwardedFor ? forwardedFor.split(',')[0] : 'unknown';
    
    // 2. Rate limit: 5 requests per minute per IP
    if (!rateLimit(ip, 5)) {
      return NextResponse.json(
        { error: 'Too many requests. Please try again later.' },
        { status: 429 }
      );
    }

    // 3. Gets the wallet address from the request body
    const { address } = await request.json();

    if (!address) {
      return NextResponse.json({ error: 'No address provided' }, { status: 400 });
    }

    // 4. Generates a random nonce
    const nonce = generateNonce();

    // 5. Store the nonce using the lowercased address as key
    nonceStore[address.toLowerCase()] = nonce;

    // 6. Returns the nonce to the client
    return NextResponse.json({ nonce });
  } catch (err: Error | unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
