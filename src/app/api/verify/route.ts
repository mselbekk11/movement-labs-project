// This file is an API route handler that verifies Ethereum wallet signatures

import { NextResponse } from 'next/server';
import { ethers } from 'ethers';
import { rateLimit } from '@/lib/rateLimit';

export const runtime = 'edge';

export async function POST(request: Request) {
  try {
    // Get IP address from request headers
    const forwardedFor = request.headers.get('x-forwarded-for');
    const ip = forwardedFor ? forwardedFor.split(',')[0] : 'unknown';
    
    // Rate limit: 10 requests per minute per IP
    if (!rateLimit(ip, 10)) {
      return NextResponse.json(
        { success: false, message: 'Too many requests. Please try again later.' },
        { status: 429 }
      );
    }

    const { address, nonce, signature, message } = await request.json();
    console.log('Verify request received:', { address, nonce });
    
    if (!address || !nonce || !signature || !message) {
      return NextResponse.json({ success: false, message: 'Missing parameters' }, { status: 400 });
    }

    // Recover the address from the signed message
    const recoveredAddress = ethers.verifyMessage(message, signature);
    if (recoveredAddress.toLowerCase() !== address.toLowerCase()) {
      return NextResponse.json({ success: false, message: 'Signature verification failed' }, { status: 400 });
    }
    
    return NextResponse.json({ success: true });
  } catch (err: Error | unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ success: false, message }, { status: 500 });
  }
}
