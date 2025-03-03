// This file is an API route handler that verifies Ethereum wallet signatures

import { NextResponse } from 'next/server';
import { ethers } from 'ethers';
import { rateLimit } from '@/lib/rateLimit';
export const runtime = 'edge';

// POST Endpoint Handler
export async function POST(request: Request) {
  try {
    // 1. Rate limiting check

    // Get IP address from the request headers
    const forwardedFor = request.headers.get('x-forwarded-for');
    const ip = forwardedFor ? forwardedFor.split(',')[0] : 'unknown';
    
    // Rate limit: 10 requests per minute per IP
    if (!rateLimit(ip, 10)) {
      return NextResponse.json(
        { success: false, message: 'Too many requests. Please try again later.' },
        { status: 429 }
      );
    }

    // 2. Parameter validation - making sure there are no missing parameters
    const { address, nonce, signature, message } = await request.json();
    console.log('Verify request received:', { address, nonce });
    
    if (!address || !nonce || !signature || !message) {
      return NextResponse.json({ success: false, message: 'Missing parameters' }, { status: 400 });
    }

    // 3. The crucial verification step

      // ethers.verifyMessage() uses cryptographic methods to recover the wallet address that created the signature
      // We're saying: "Look at this signature on this message. Tell us which wallet address made it."
    const recoveredAddress = ethers.verifyMessage(message, signature);
      // Then we check:
    if (recoveredAddress.toLowerCase() !== address.toLowerCase()) {
      return NextResponse.json({ success: false, message: 'Signature verification failed' }, { status: 400 });
    }
      // This is just making sure the address we recovered matches the address they claimed to be using. It's like saying "You claimed to be wallet ABC, and the signature was indeed made by wallet ABC!"
    
    
    // 4. If all checks pass it means 

      // The user actually controls the wallet (they were able to sign the message)
      // The signature wasn't tampered with
      // The message wasn't altered
      // If successfull The API returns {success: true} → verifyWallet in the services/auth.ts → register/page.tsx

    return NextResponse.json({ success: true });
  } catch (err: Error | unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ success: false, message }, { status: 500 });
  }
}
