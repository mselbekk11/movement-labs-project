// This file implements a nonce (number used once) generation API endpoint
// It creates a secure random nonce that can be used for authentication or verification purposes

import { NextResponse } from 'next/server';
import { nonceStore } from '../../../lib/nonceStore';
import { rateLimit } from '@/lib/rateLimit';

export const runtime = 'edge';

function generateNonce() {
  // Use Web Crypto API instead of Node's crypto module
  const array = new Uint8Array(16);
  crypto.getRandomValues(array);
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
}

export async function POST(request: Request) {
  try {
    // Get IP address from request headers
    const forwardedFor = request.headers.get('x-forwarded-for');
    const ip = forwardedFor ? forwardedFor.split(',')[0] : 'unknown';
    
    // Rate limit: 5 requests per minute per IP
    if (!rateLimit(ip, 5)) {
      return NextResponse.json(
        { error: 'Too many requests. Please try again later.' },
        { status: 429 }
      );
    }

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
