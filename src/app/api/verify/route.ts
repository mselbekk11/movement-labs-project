// app/api/verify/route.ts
import { NextResponse } from 'next/server';
import { ethers } from 'ethers';

export const runtime = 'edge';

export async function POST(request: Request) {
  try {
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
