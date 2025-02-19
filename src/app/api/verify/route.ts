// app/api/verify/route.ts
import { NextResponse } from 'next/server';
import { ethers } from 'ethers';
import { nonceStore } from '../../../lib/nonceStore';

export async function POST(request: Request) {
  try {
    const { address, nonce, signature, message } = await request.json();
    if (!address || !nonce || !signature || !message) {
      return NextResponse.json({ success: false, message: 'Missing parameters' }, { status: 400 });
    }
    
    const storedNonce = nonceStore[address.toLowerCase()];
    if (!storedNonce) {
      return NextResponse.json({ success: false, message: 'Nonce not found' }, { status: 400 });
    }
    
    if (storedNonce !== nonce) {
      return NextResponse.json({ success: false, message: 'Invalid nonce' }, { status: 400 });
    }
    
    // Recover the address from the signed message
    const recoveredAddress = ethers.verifyMessage(message, signature);
    if (recoveredAddress.toLowerCase() !== address.toLowerCase()) {
      return NextResponse.json({ success: false, message: 'Signature verification failed' }, { status: 400 });
    }
    
    // Invalidate the nonce to prevent replay attacks
    delete nonceStore[address.toLowerCase()];
    
    return NextResponse.json({ success: true });
  } catch (err: Error | unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ success: false, message }, { status: 500 });
  }
}
